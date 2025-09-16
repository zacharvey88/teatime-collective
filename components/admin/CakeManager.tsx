'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Cake,
  Search,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Star,
  List,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { CakeService, CakeCategory, CakeSize, CakeFlavor, CakeWithDetails } from '@/lib/cakeService'
import StandaloneCakeManager from './StandaloneCakeManager'
import { supabase } from '@/lib/supabaseClient'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function CakeManager() {
  const [activeTab, setActiveTab] = useState<'categories' | 'standalone'>('categories')
  const [cakes, setCakes] = useState<CakeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [editDialogError, setEditDialogError] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showUnavailableItems, setShowUnavailableItems] = useState<Set<string>>(new Set())

  // Editing states
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingSize, setEditingSize] = useState<string | null>(null)
  const [editingFlavor, setEditingFlavor] = useState<string | null>(null)
  const [editingCategoryData, setEditingCategoryData] = useState({ name: '', description: '' })
  const [editingFlavorData, setEditingFlavorData] = useState({
    name: '',
    description: '',
    priceOverride: '',
    imageUrl: '',
    active: true
  })
  const [editingSizeData, setEditingSizeData] = useState({ name: '', description: '', price: '' })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditFlavorDialogOpen, setIsEditFlavorDialogOpen] = useState(false)
  const [isEditSizeDialogOpen, setIsEditSizeDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<'category' | 'size' | 'flavor'>('category')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{
    type: 'category' | 'size' | 'flavor'
    id: string
    name: string
  } | null>(null)

  // New item states
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [newSize, setNewSize] = useState({ categoryId: '', name: '', description: '', price: '' })
  const [newFlavor, setNewFlavor] = useState({ categoryId: '', name: '', description: '', priceOverride: '', imageUrl: '' })
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadCakes()
  }, [])

  const loadCakes = async () => {
    try {
      setLoading(true)
      const data = await CakeService.getCakesByCategoryForAdmin()
      setCakes(data)
      // Expand all categories by default on desktop
      setExpandedCategories(new Set(data.map(cake => cake.category.id)))
    } catch (err) {
      setError('Failed to load cakes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true)
      setError('')
      
      // Check file size (limit to 3MB for better performance)
      if (file.size > 3 * 1024 * 1024) {
        throw new Error('File size must be less than 3MB for better upload performance')
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a JPEG, PNG, or WebP image file')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `cakes/${fileName}`

      // Upload with retry mechanism
      const data = await uploadWithRetry(file, filePath)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return urlData.publicUrl

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      if (errorMessage.includes('timeout')) {
        setError('Upload timeout - please try again with a smaller image or check your connection')
      } else {
        setError(`Upload failed: ${errorMessage}`)
      }
      throw err
    } finally {
      setUploadingImage(false)
    }
  }

  const uploadImageForEdit = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      setEditDialogError('')
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `cakes/${fileName}`
      
      // Upload to Supabase Storage
      const data = await uploadWithRetry(file, filePath)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return urlData.publicUrl

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setEditDialogError(`Failed to upload image. Please try again: ${errorMessage}`)
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }

      setSelectedImage(file)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Please enter a category name')
      return
    }

    try {
      const category = await CakeService.createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || null,
        active: true
      })

      setNewCategory({ name: '', description: '' })
      setError('')
      await loadCakes()
    } catch (err) {
      setError('Failed to add category')
      console.error(err)
    }
  }

  const handleAddSize = async () => {
    if (!newSize.categoryId || !newSize.name.trim() || !newSize.price) {
      setError('Please fill in all size fields')
      return
    }

    try {
      const size = await CakeService.createSize({
        category_id: newSize.categoryId,
        name: newSize.name.trim(),
        description: newSize.description.trim() || null,
        price: parseFloat(newSize.price),
        active: true
      })

      setNewSize({ categoryId: '', name: '', description: '', price: '' })
      setError('')
      await loadCakes()
    } catch (err) {
      setError('Failed to add size')
      console.error(err)
    }
  }

  const handleAddFlavor = async () => {
    if (!newFlavor.categoryId || !newFlavor.name.trim()) {
      setError('Please fill in all flavor fields')
      return
    }

    try {
      const flavor = await CakeService.createFlavor({
        category_id: newFlavor.categoryId,
        name: newFlavor.name.trim(),
        description: null,
        image_url: null,
        price_override: newFlavor.priceOverride ? parseFloat(newFlavor.priceOverride) : null,
        active: true
      })

      setNewFlavor({ categoryId: '', name: '', description: '', priceOverride: '', imageUrl: '' })
      setError('')
      await loadCakes()
    } catch (err) {
      setError('Failed to add flavor')
      console.error(err)
    }
  }

  const handleEditCategory = (category: CakeCategory) => {
    setEditingCategoryData({ name: category.name, description: category.description || '' })
    setEditingCategory(category.id)
    setIsEditDialogOpen(true)
  }

  const handleSaveCategoryEdit = async () => {
    if (!editingCategory || !editingCategoryData.name.trim()) {
      setError('Please enter a category name')
      return
    }

    try {
      await CakeService.updateCategory(editingCategory, {
        name: editingCategoryData.name.trim(),
        description: editingCategoryData.description.trim() || null
      })
      
      setEditingCategory(null)
      setEditingCategoryData({ name: '', description: '' })
      setIsEditDialogOpen(false)
      setError('')
      await loadCakes()
    } catch (err) {
      setError('Failed to update category')
      console.error(err)
    }
  }

  const handleCreateItem = (type: 'category' | 'size' | 'flavor') => {
    // Reset form data when opening
    setNewCategory({ name: '', description: '' })
    setNewSize({ categoryId: '', name: '', description: '', price: '' })
    setNewFlavor({ categoryId: '', name: '', description: '', priceOverride: '', imageUrl: '' })
    setSelectedImage(null)
    setImagePreview(null)
    setCreateType(type)
    setIsCreateDialogOpen(true)
    setError('') // Clear any previous errors
  }

  const handleSaveCreateItem = async () => {
    try {
      if (createType === 'category') {
        if (!newCategory.name.trim()) {
          setDialogError('Please enter a category name')
          return
        }
        await CakeService.createCategory({
          name: newCategory.name.trim(),
          description: newCategory.description.trim() || null,
          active: true
        })
        setNewCategory({ name: '', description: '' })
      } else if (createType === 'size') {
        if (!newSize.categoryId || !newSize.name.trim() || !newSize.price) {
          setDialogError('Please fill in all size fields')
          return
        }
        await CakeService.createSize({
          category_id: newSize.categoryId,
          name: newSize.name.trim(),
          description: newSize.description.trim() || null,
          price: parseFloat(newSize.price),
          active: true
        })
        setNewSize({ categoryId: '', name: '', description: '', price: '' })
      } else if (createType === 'flavor') {
        if (!newFlavor.categoryId || !newFlavor.name.trim()) {
          setDialogError('Please fill in all flavor fields')
          return
        }

        let finalImageUrl = newFlavor.imageUrl.trim() || null

        // If there's a selected image but no URL, upload it first
        if (selectedImage && !finalImageUrl) {
          try {
            setUploadingImage(true)
            
            // Generate unique filename
            const fileExt = selectedImage.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `cakes/${fileName}`
            
            const data = await uploadWithRetry(selectedImage, filePath)
            const { data: urlData } = supabase.storage
              .from('images')
              .getPublicUrl(filePath)
            finalImageUrl = urlData.publicUrl
            
          } catch (uploadErr) {
            console.error('Error uploading image:', uploadErr)
            setError('Failed to upload image. Please try again.')
            return
          } finally {
            setUploadingImage(false)
          }
        }

        const createdFlavor = await CakeService.createFlavor({
          category_id: newFlavor.categoryId,
          name: newFlavor.name.trim(),
          description: newFlavor.description.trim() || null,
          image_url: finalImageUrl,
          price_override: newFlavor.priceOverride ? parseFloat(newFlavor.priceOverride) : null,
          active: true
        })
        setNewFlavor({ categoryId: '', name: '', description: '', priceOverride: '', imageUrl: '' })
        setSelectedImage(null)
        setImagePreview(null)
      }
      
      setIsCreateDialogOpen(false)
      setError('')
      await loadCakes()
    } catch (err) {
      console.error('Error in handleSaveCreateItem:', err)
      setDialogError(`Failed to create ${createType}`)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const category = cakes.find(c => c.category.id === categoryId)?.category
    if (!category) return

    setDeleteItem({
      type: 'category',
      id: categoryId,
      name: category.name
    })
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteSize = async (sizeId: string) => {
    const size = cakes.flatMap(c => c.sizes).find(s => s.id === sizeId)
    if (!size) return

    setDeleteItem({
      type: 'size',
      id: sizeId,
      name: size.name
    })
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteFlavor = async (flavorId: string) => {
    const flavor = cakes.flatMap(c => c.flavors).find(f => f.id === flavorId)
    if (!flavor) {
      return
    }

    setDeleteItem({
      type: 'flavor',
      id: flavorId,
      name: flavor.name
    })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) {
      return
    }

    try {
      if (deleteItem.type === 'category') {
        await CakeService.deleteCategory(deleteItem.id)
      } else if (deleteItem.type === 'size') {
        await CakeService.deleteSize(deleteItem.id)
      } else if (deleteItem.type === 'flavor') {
        await CakeService.deleteFlavor(deleteItem.id)
      }
      
      await loadCakes()
      setIsDeleteDialogOpen(false)
      setDeleteItem(null)
    } catch (err) {
      console.error('Error in handleConfirmDelete:', err)
      setError(`Failed to delete ${deleteItem.type}`)
    }
  }

  const handleEditFlavor = (flavor: any) => {
    setEditingFlavorData({ name: flavor.name, description: flavor.description || '', priceOverride: flavor.price_override?.toString() || '', imageUrl: flavor.image_url || '', active: flavor.active })
    setEditingFlavor(flavor.id)
    setImagePreview(flavor.image_url || null)
    setSelectedImage(null)
    setEditDialogError('')
    setIsEditFlavorDialogOpen(true)
  }

  const handleEditSize = (size: any) => {
    setEditingSizeData({ 
      name: size.name, 
      description: size.description || '', 
      price: size.price.toString() 
    })
    setEditingSize(size.id)
    setIsEditSizeDialogOpen(true)
  }

  const handleSaveSizeEdit = async () => {
    
    if (!editingSize || !editingSizeData.name.trim()) {
      setError('Please enter a size name')
      return
    }

    const price = parseFloat(editingSizeData.price)
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price')
      return
    }

    try {
      const result = await CakeService.updateSize(editingSize, {
        name: editingSizeData.name.trim(),
        description: editingSizeData.description.trim() || null,
        price: price
      })
      
      setEditingSize(null)
      setEditingSizeData({ name: '', description: '', price: '' })
      setIsEditSizeDialogOpen(false)
      setError('')
      await loadCakes()
    } catch (err) {
      console.error('Error in handleSaveSizeEdit:', err)
      setError('Failed to update size')
    }
  }

  const handleSaveFlavorEdit = async () => {
    
    if (!editingFlavor || !editingFlavorData.name.trim()) {
      setError('Please enter a flavor name')
      return
    }

    try {
      // If there's a selected image, upload it first
      let finalImageUrl = editingFlavorData.imageUrl.trim() || null
      
      if (selectedImage) {
        const uploadedUrl = await uploadImageForEdit(selectedImage)
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl
        } else {
          setEditDialogError('Failed to upload image')
          return
        }
      }

      const result = await CakeService.updateFlavor(editingFlavor, {
        name: editingFlavorData.name.trim(),
        description: editingFlavorData.description.trim() || null,
        image_url: finalImageUrl,
        price_override: editingFlavorData.priceOverride ? parseFloat(editingFlavorData.priceOverride) : null,
        active: editingFlavorData.active
      })
      
      setEditingFlavor(null)
      setEditingFlavorData({ name: '', description: '', priceOverride: '', imageUrl: '', active: true })
      setSelectedImage(null)
      setImagePreview(null)
      setIsEditFlavorDialogOpen(false)
      setError('')
      await loadCakes()
    } catch (err) {
      console.error('Error in handleSaveFlavorEdit:', err)
      setError('Failed to update flavor')
    }
  }

  const uploadWithRetry = async (file: File, filePath: string, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const uploadPromise = supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        // Add timeout of 60 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 60000)
        )

        const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any

        if (error) {
          if (attempt === maxRetries) {
            throw error
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }

        return data
      } catch (err) {
        if (attempt === maxRetries) {
          throw err
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner message="Loading cakes..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-orange text-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Category-Based Cakes
          </button>
          <button
            onClick={() => setActiveTab('standalone')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'standalone'
                ? 'border-orange text-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Standalone Cakes
          </button>
        </nav>
      </div>

      {activeTab === 'categories' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Category-Based Cakes</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-orange hover:bg-orange/90 text-white border-orange w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                <DropdownMenuItem onClick={() => handleCreateItem('category')} className="hover:bg-gray-50 cursor-pointer text-base">
                  <List className="w-4 h-4 mr-2" />
                  New Category
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateItem('size')} className="hover:bg-gray-50 cursor-pointer text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  New Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateItem('flavor')} className="hover:bg-gray-50 cursor-pointer text-base">
                  <Star className="w-4 h-4 mr-2" />
                  New Flavor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}

      {activeTab === 'standalone' && (
        <StandaloneCakeManager />
      )}

      {activeTab === 'categories' && (
        <>

          {/* Cake Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cakes.map(cake => (
          <Card key={cake.category.id} className={!cake.category.active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Show expand/collapse button only on mobile */}
                  <button
                    onClick={() => toggleCategory(cake.category.id)}
                    className="p-1 hover:bg-gray-100 rounded lg:hidden"
                  >
                    {expandedCategories.has(cake.category.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <CardTitle className={`!p-0 !m-0 ${!cake.category.active ? 'text-gray-500' : ''}`}>{cake.category.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={cake.category.active}
                    onCheckedChange={async (checked) => {
                      try {
                        await CakeService.updateCategory(cake.category.id, { active: checked })
                        await loadCakes() // Refresh the data
                      } catch (error) {
                        console.error('Failed to update category availability:', error)
                      }
                    }}
                    className="mr-2 [&>span]:!bg-white"
                    style={{
                      '--tw-bg-opacity': '1',
                      backgroundColor: cake.category.active ? 'var(--primary-color)' : '#d1d5db'
                    } as React.CSSProperties}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(cake.category)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(cake.category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {cake.category.description && (
                <p className="text-gray-600 text-sm">{cake.category.description}</p>
              )}
            </CardHeader>

            {/* Show content always on desktop, conditionally on mobile */}
            <CardContent className={`space-y-6 lg:block ${expandedCategories.has(cake.category.id) ? 'block' : 'hidden lg:block'}`}>
                {/* Sizes */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Sizes & Pricing</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cake.sizes.map(size => (
                                              <div key={size.id} className={`border rounded-lg p-4 ${size.active ? 'bg-gray-50' : 'bg-gray-100 opacity-60'}`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className={`font-medium ${!size.active ? 'text-gray-500' : ''}`}>{size.name}</h5>
                            <Switch
                              checked={size.active}
                              onCheckedChange={async (checked) => {
                                try {
                                  await CakeService.updateSize(size.id, { active: checked })
                                  await loadCakes() // Refresh the data
                                } catch (error) {
                                  console.error('Failed to update size availability:', error)
                                }
                              }}
                              className="[&>span]:!bg-white"
                              style={{
                                '--tw-bg-opacity': '1',
                                backgroundColor: size.active ? 'var(--primary-color)' : '#d1d5db'
                              } as React.CSSProperties}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              {size.description && (
                                <p className="text-sm text-gray-600 mb-1 truncate">{size.description}</p>
                              )}
                              <p className="text-lg font-bold text-orange">£{size.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSize(size)}
                                className="text-blue-600 hover:text-blue-700 h-6 w-6 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSize(size.id)}
                                className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div 
                      className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors" 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        
                        // Reset all form data first
                        setNewCategory({ name: '', description: '' })
                        setNewSize({ categoryId: cake.category.id, name: '', description: '', price: '' })
                        setNewFlavor({ categoryId: '', name: '', description: '', priceOverride: '', imageUrl: '' })
                        setCreateType('size')
                        setIsCreateDialogOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Add Size</span>
                    </div>
                  </div>
                </div>

                                  {/* Flavors */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-gray-800">Flavors</h4>
                      {cake.flavors.some(flavor => !flavor.active) && (
                        <button
                          onClick={() => {
                            const newSet = new Set(showUnavailableItems)
                            if (newSet.has(cake.category.id)) {
                              newSet.delete(cake.category.id)
                            } else {
                              newSet.add(cake.category.id)
                            }
                            setShowUnavailableItems(newSet)
                          }}
                          className="text-sm text-orange hover:text-orange-900 underline"
                        >
                          {showUnavailableItems.has(cake.category.id) ? 'Hide unavailable' : 'Show unavailable'}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cake.flavors
                        .filter(flavor => showUnavailableItems.has(cake.category.id) || flavor.active)
                        .map(flavor => (
                        <div key={flavor.id} className={`border rounded-md p-2 flex items-center justify-between min-w-0 ${flavor.active ? 'bg-gray-50' : 'bg-gray-100 opacity-50 border-gray-300'}`}>
                          <span className={`text-sm font-medium flex-1 min-w-0 break-words pr-2 ${!flavor.active ? 'text-gray-400' : ''}`}>{flavor.name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditFlavor(flavor)}
                            className="text-blue-600 hover:text-blue-700 h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleDeleteFlavor(flavor.id)
                            }}
                            className="text-red-600 hover:text-red-700 h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div 
                      className="border border-dashed border-gray-300 rounded-md p-2 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors" 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        
                        // Reset all form data first
                        setNewCategory({ name: '', description: '' })
                        setNewSize({ categoryId: '', name: '', description: '', price: '' })
                        setNewFlavor({ categoryId: cake.category.id, name: '', description: '', priceOverride: '', imageUrl: '' })
                        setCreateType('flavor')
                        setIsCreateDialogOpen(true)
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Add Flavor</span>
                    </div>
                  </div>
                </div>
              </CardContent>
          </Card>
        ))}
          </div>
        </>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          {/* Error Alert inside modal */}
          {error && (
            <Alert className="border-red-200 bg-red-50 relative z-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <Input
                value={editingCategoryData.name}
                onChange={(e) => setEditingCategoryData({ ...editingCategoryData, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <Input
                value={editingCategoryData.description}
                onChange={(e) => setEditingCategoryData({ ...editingCategoryData, description: e.target.value })}
                placeholder="Description"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingCategory(null)
                  setEditingCategoryData({ name: '', description: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategoryEdit}
                className="bg-orange hover:bg-orange/90 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Flavor Dialog */}
      <Dialog open={isEditFlavorDialogOpen} onOpenChange={(open) => {
        setIsEditFlavorDialogOpen(open)
        if (!open) {
          setEditingFlavor(null)
          setEditingFlavorData({ name: '', description: '', priceOverride: '', imageUrl: '', active: true })
          setSelectedImage(null)
          setImagePreview(null)
          setEditDialogError('')
        }
      }}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Flavor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editDialogError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800 font-medium">
                  {editDialogError}
                </AlertDescription>
              </Alert>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                value={editingFlavorData.name}
                onChange={(e) => setEditingFlavorData({ ...editingFlavorData, name: e.target.value })}
                placeholder="Flavor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <Input
                value={editingFlavorData.description}
                onChange={(e) => setEditingFlavorData({ ...editingFlavorData, description: e.target.value })}
                placeholder="Description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Override (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <Input
                  type="number"
                  step="0.01"
                  value={editingFlavorData.priceOverride}
                  onChange={(e) => setEditingFlavorData({ ...editingFlavorData, priceOverride: e.target.value })}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set a custom price for this flavor. If left empty, uses the category size pricing.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3">
                  <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setSelectedImage(null)
                        setEditingFlavorData(prev => ({ ...prev, imageUrl: '' }))
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Section */}
              <div className="space-y-3">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="edit-flavor-image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="edit-flavor-image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploadingImage ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {selectedImage ? 'Click to change image' : 'Click to upload image'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Manual URL Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    value={editingFlavorData.imageUrl}
                    onChange={(e) => setEditingFlavorData({ ...editingFlavorData, imageUrl: e.target.value })}
                    placeholder="Or enter image URL manually"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Available
              </label>
              <Switch
                checked={editingFlavorData.active ?? true}
                onCheckedChange={(checked) => setEditingFlavorData({ ...editingFlavorData, active: checked })}
                style={{
                  '--tw-bg-opacity': '1',
                  backgroundColor: editingFlavorData.active ? 'var(--primary-color)' : '#d1d5db'
                } as React.CSSProperties}
                className="[&>span]:!bg-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditFlavorDialogOpen(false)
                  setEditingFlavor(null)
                  setEditingFlavorData({ name: '', description: '', priceOverride: '', imageUrl: '', active: true })
                  setSelectedImage(null)
                  setImagePreview(null)
                  setEditDialogError('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSaveFlavorEdit()
                }}
                className="bg-orange hover:bg-orange/90 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Size Dialog */}
      <Dialog open={isEditSizeDialogOpen} onOpenChange={(open) => {
        setIsEditSizeDialogOpen(open)
        if (!open) {
          setEditingSize(null)
          setEditingSizeData({ name: '', description: '', price: '' })
        }
      }}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Size</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size Name
              </label>
              <Input
                value={editingSizeData.name}
                onChange={(e) => setEditingSizeData({ ...editingSizeData, name: e.target.value })}
                placeholder="Size name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <Input
                value={editingSizeData.description}
                onChange={(e) => setEditingSizeData({ ...editingSizeData, description: e.target.value })}
                placeholder="Description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingSizeData.price}
                  onChange={(e) => setEditingSizeData({ ...editingSizeData, price: e.target.value })}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditSizeDialogOpen(false)
                  setEditingSize(null)
                  setEditingSizeData({ name: '', description: '', price: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSaveSizeEdit()
                }}
                className="bg-orange hover:bg-orange/90 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open)
        if (!open) {
          setDialogError('')
        }
      }}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {createType === 'category' && 'Create New Category'}
              {createType === 'size' && 'Create New Size'}
              {createType === 'flavor' && 'Create New Flavor'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Error Alert inside modal */}
          {dialogError && (
            <Alert className="border-red-200 bg-red-50 relative z-50">
              <AlertDescription className="text-red-800">{dialogError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            {createType === 'category' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <Input
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Description"
                  />
                </div>
              </>
            )}
            
            {createType === 'size' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newSize.categoryId}
                    onChange={(e) => setNewSize({ ...newSize, categoryId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {cakes.map(cake => (
                      <option key={cake.category.id} value={cake.category.id}>
                        {cake.category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size Name
                  </label>
                  <Input
                    value={newSize.name}
                    onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                    placeholder="Size name (e.g., 6 inch)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <Input
                    value={newSize.description}
                    onChange={(e) => setNewSize({ ...newSize, description: e.target.value })}
                    placeholder="Description (e.g., 6-8 slices)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={newSize.price}
                      onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                </div>
              </>
            )}
            
            {createType === 'flavor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newFlavor.categoryId}
                    onChange={(e) => setNewFlavor({ ...newFlavor, categoryId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {cakes.map(cake => (
                      <option key={cake.category.id} value={cake.category.id}>
                        {cake.category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flavor Name
                  </label>
                  <Input
                    value={newFlavor.name}
                    onChange={(e) => setNewFlavor({ ...newFlavor, name: e.target.value })}
                    placeholder="Flavor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <Input
                    value={newFlavor.description || ''}
                    onChange={(e) => setNewFlavor({ ...newFlavor, description: e.target.value })}
                    placeholder="Description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Override (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={newFlavor.priceOverride}
                      onChange={(e) => setNewFlavor({ ...newFlavor, priceOverride: e.target.value })}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Set a custom price for this flavor. If left empty, uses the category size pricing.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flavor Image
                  </label>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-3">
                      <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null)
                            setSelectedImage(null)
                            setNewFlavor(prev => ({ ...prev, imageUrl: '' }))
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload Section */}
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-300 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="flavor-image-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="flavor-image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {uploadingImage ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">
                              {selectedImage ? 'Click to change image' : 'Click to upload image'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </span>
                          </>
                        )}
                      </label>
                    </div>



                    {/* Manual URL Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        value={newFlavor.imageUrl}
                        onChange={(e) => setNewFlavor({ ...newFlavor, imageUrl: e.target.value })}
                        placeholder="Or enter image URL manually"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {dialogError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800 font-medium">
                  {dialogError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setNewCategory({ name: '', description: '' })
                  setNewSize({ categoryId: '', name: '', description: '', price: '' })
                  setNewFlavor({ categoryId: '', name: '', description: '', priceOverride: '', imageUrl: '' })
                  setSelectedImage(null)
                  setImagePreview(null)
                  setDialogError('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSaveCreateItem()
                }}
                className="bg-orange hover:bg-orange/90 text-white"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading & Creating...
                  </>
                ) : (
                  `Create ${createType === 'category' ? 'Category' : createType === 'size' ? 'Size' : 'Flavor'}`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-700">
              {deleteItem && (
                <>
                  <p className="mb-2">
                    Are you sure you want to delete this {deleteItem.type}?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="font-medium text-red-800">
                      "{deleteItem.name}"
                    </p>
                    {deleteItem.type === 'category' && (
                      <p className="text-sm text-red-600 mt-1">
                        This will also delete all sizes and flavors in this category.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeleteItem(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete {deleteItem?.type}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 