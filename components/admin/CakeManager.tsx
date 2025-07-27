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
  List
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CakeService, CakeCategory, CakeSize, CakeFlavor, CakeWithDetails } from '@/lib/cakeService'

export default function CakeManager() {
  const [cakes, setCakes] = useState<CakeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Editing states
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingSize, setEditingSize] = useState<string | null>(null)
  const [editingFlavor, setEditingFlavor] = useState<string | null>(null)
  const [editingCategoryData, setEditingCategoryData] = useState({ name: '', description: '' })
  const [editingFlavorData, setEditingFlavorData] = useState({ name: '', imageUrl: '' })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditFlavorDialogOpen, setIsEditFlavorDialogOpen] = useState(false)
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
  const [newFlavor, setNewFlavor] = useState({ categoryId: '', name: '', imageUrl: '' })

  useEffect(() => {
    loadCakes()
  }, [])

  const loadCakes = async () => {
    try {
      setLoading(true)
      const data = await CakeService.getCakesByCategory()
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
        display_order: cakes.length + 1,
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
        display_order: 1,
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
        display_order: 1,
        active: true
      })

      setNewFlavor({ categoryId: '', name: '', imageUrl: '' })
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
    setNewFlavor({ categoryId: '', name: '', imageUrl: '' })
    setCreateType(type)
    setIsCreateDialogOpen(true)
    console.log('Opening create dialog for:', type)
  }

  const handleSaveCreateItem = async () => {
    try {
      console.log('Saving create item:', createType, { newCategory, newSize, newFlavor })
      
      if (createType === 'category') {
        if (!newCategory.name.trim()) {
          setError('Please enter a category name')
          return
        }
        await CakeService.createCategory({
          name: newCategory.name.trim(),
          description: newCategory.description.trim() || null,
          display_order: cakes.length + 1,
          active: true
        })
        setNewCategory({ name: '', description: '' })
      } else if (createType === 'size') {
        if (!newSize.categoryId || !newSize.name.trim() || !newSize.price) {
          setError('Please fill in all size fields')
          return
        }
        await CakeService.createSize({
          category_id: newSize.categoryId,
          name: newSize.name.trim(),
          description: newSize.description.trim() || null,
          price: parseFloat(newSize.price),
          display_order: 1,
          active: true
        })
        setNewSize({ categoryId: '', name: '', description: '', price: '' })
      } else if (createType === 'flavor') {
        if (!newFlavor.categoryId || !newFlavor.name.trim()) {
          setError('Please fill in all flavor fields')
          return
        }
        console.log('Creating flavor:', newFlavor)
        await CakeService.createFlavor({
          category_id: newFlavor.categoryId,
          name: newFlavor.name.trim(),
          description: null,
          image_url: newFlavor.imageUrl.trim() || null,
          display_order: 1,
          active: true
        })
        setNewFlavor({ categoryId: '', name: '', imageUrl: '' })
      }
      
      setIsCreateDialogOpen(false)
      setError('')
      await loadCakes()
    } catch (err) {
      setError(`Failed to create ${createType}`)
      console.error(err)
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
    if (!flavor) return

    setDeleteItem({
      type: 'flavor',
      id: flavorId,
      name: flavor.name
    })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return

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
      setError(`Failed to delete ${deleteItem.type}`)
      console.error(err)
    }
  }

  const handleEditFlavor = (flavor: any) => {
    setEditingFlavorData({ name: flavor.name, imageUrl: flavor.image_url || '' })
    setEditingFlavor(flavor.id)
    setIsEditFlavorDialogOpen(true)
  }

  const handleSaveFlavorEdit = async () => {
    if (!editingFlavor || !editingFlavorData.name.trim()) {
      setError('Please enter a flavor name')
      return
    }

    try {
      await CakeService.updateFlavor(editingFlavor, {
        name: editingFlavorData.name.trim(),
        image_url: editingFlavorData.imageUrl.trim() || null
      })
      
      setEditingFlavor(null)
      setEditingFlavorData({ name: '', imageUrl: '' })
      setIsEditFlavorDialogOpen(false)
      setError('')
      await loadCakes()
    } catch (err) {
      setError('Failed to update flavor')
      console.error(err)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cakes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Cake Management</h2>
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

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}



      {/* Cake Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cakes.map(cake => (
          <Card key={cake.category.id}>
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
                  <CardTitle className="!p-0 !m-0">{cake.category.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cake.sizes.map(size => (
                      <div key={size.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{size.name}</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSize(size.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        {size.description && (
                          <p className="text-sm text-gray-600 mb-2">{size.description}</p>
                        )}
                        <p className="text-lg font-bold text-orange">£{size.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flavors */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Available Flavors</h4>
                  <div className="flex flex-wrap gap-2">
                    {cake.flavors.map(flavor => (
                                          <div key={flavor.id} className="border rounded-md p-2 bg-gray-50 flex items-center justify-between min-w-0">
                      <span className="text-sm font-medium flex-1 min-w-0 break-words pr-2">{flavor.name}</span>
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
                          onClick={() => handleDeleteFlavor(flavor.id)}
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
                        console.log('Add Flavor button clicked!')
                        console.log('Category:', cake.category)
                        
                        // Reset all form data first
                        setNewCategory({ name: '', description: '' })
                        setNewSize({ categoryId: '', name: '', description: '', price: '' })
                        setNewFlavor({ categoryId: cake.category.id, name: '', imageUrl: '' })
                        setCreateType('flavor')
                        setIsCreateDialogOpen(true)
                        console.log('Quick add flavor for category:', cake.category.id)
                        console.log('Modal should now be open')
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
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
      <Dialog open={isEditFlavorDialogOpen} onOpenChange={setIsEditFlavorDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Flavor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flavor Name
              </label>
              <Input
                value={editingFlavorData.name}
                onChange={(e) => setEditingFlavorData({ ...editingFlavorData, name: e.target.value })}
                placeholder="Flavor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <Input
                value={editingFlavorData.imageUrl}
                onChange={(e) => setEditingFlavorData({ ...editingFlavorData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditFlavorDialogOpen(false)
                  setEditingFlavor(null)
                  setEditingFlavorData({ name: '', imageUrl: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFlavorEdit}
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
        console.log('Dialog onOpenChange:', open, 'createType:', createType)
        setIsCreateDialogOpen(open)
      }}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {createType === 'category' && 'Create New Category'}
              {createType === 'size' && 'Create New Size'}
              {createType === 'flavor' && 'Create New Flavor'}
            </DialogTitle>
          </DialogHeader>
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
                    Price (£)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSize.price}
                    onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                    placeholder="Price"
                  />
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
                    Image URL (optional)
                  </label>
                  <Input
                    value={newFlavor.imageUrl}
                    onChange={(e) => setNewFlavor({ ...newFlavor, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setNewCategory({ name: '', description: '' })
                  setNewSize({ categoryId: '', name: '', description: '', price: '' })
                  setNewFlavor({ categoryId: '', name: '', imageUrl: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCreateItem}
                className="bg-orange hover:bg-orange/90 text-white"
              >
                Create {createType === 'category' ? 'Category' : createType === 'size' ? 'Size' : 'Flavor'}
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