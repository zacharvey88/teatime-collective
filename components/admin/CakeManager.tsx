'use client'

import { useState, useMemo } from 'react'
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
  Search
} from 'lucide-react'

interface CakeSize {
  id: string
  name: string
  price: number
  description?: string
}

interface CakeFlavor {
  id: string
  name: string
  description: string
  image?: string
  sizes: CakeSize[]
  available: boolean
}

interface CakeManagerProps {
  flavors: CakeFlavor[]
  onFlavorsChange: (flavors: CakeFlavor[]) => void
}

export default function CakeManager({ flavors, onFlavorsChange }: CakeManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newFlavor, setNewFlavor] = useState<Partial<CakeFlavor>>({
    name: '',
    description: '',
    available: true,
    sizes: []
  })
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter flavors based on search term
  const filteredFlavors = useMemo(() => {
    if (!searchTerm.trim()) return flavors
    
    const term = searchTerm.toLowerCase()
    return flavors.filter(flavor => 
      flavor.name.toLowerCase().includes(term) ||
      flavor.description.toLowerCase().includes(term) ||
      flavor.sizes.some(size => 
        size.name.toLowerCase().includes(term) ||
        size.description?.toLowerCase().includes(term)
      )
    )
  }, [flavors, searchTerm])

  const handleAddFlavor = () => {
    if (!newFlavor.name || !newFlavor.description) {
      setError('Please fill in all required fields')
      return
    }

    const flavor: CakeFlavor = {
      id: `flavor-${Date.now()}`,
      name: newFlavor.name,
      description: newFlavor.description,
      available: newFlavor.available || true,
      sizes: newFlavor.sizes || []
    }

    onFlavorsChange([...flavors, flavor])
    setNewFlavor({ name: '', description: '', available: true, sizes: [] })
    setError('')
  }

  const handleDeleteFlavor = (id: string) => {
    const flavor = flavors.find(f => f.id === id)
    if (!flavor) return
    
    const confirmed = window.confirm(`Are you sure you want to delete "${flavor.name}"? This action cannot be undone.`)
    if (confirmed) {
      onFlavorsChange(flavors.filter(f => f.id !== id))
    }
  }

  const handleEditFlavor = (flavor: CakeFlavor) => {
    setEditingId(flavor.id)
  }

  const handleSaveFlavor = (id: string, updatedFlavor: Partial<CakeFlavor>) => {
    onFlavorsChange(flavors.map(f => 
      f.id === id ? { ...f, ...updatedFlavor } : f
    ))
    setEditingId(null)
  }

  const handleAddSize = (flavorId: string) => {
    const flavor = flavors.find(f => f.id === flavorId)
    if (!flavor) return

    const newSize: CakeSize = {
      id: `size-${Date.now()}`,
      name: '',
      price: 0,
      description: ''
    }

    const updatedFlavor = {
      ...flavor,
      sizes: [...flavor.sizes, newSize]
    }

    onFlavorsChange(flavors.map(f => f.id === flavorId ? updatedFlavor : f))
  }

  const handleUpdateSize = (flavorId: string, sizeId: string, updates: Partial<CakeSize>) => {
    const flavor = flavors.find(f => f.id === flavorId)
    if (!flavor) return

    const updatedSizes = flavor.sizes.map(s => 
      s.id === sizeId ? { ...s, ...updates } : s
    )

    const updatedFlavor = { ...flavor, sizes: updatedSizes }
    onFlavorsChange(flavors.map(f => f.id === flavorId ? updatedFlavor : f))
  }

  const handleDeleteSize = (flavorId: string, sizeId: string) => {
    const flavor = flavors.find(f => f.id === flavorId)
    if (!flavor) return

    const updatedSizes = flavor.sizes.filter(s => s.id !== sizeId)
    const updatedFlavor = { ...flavor, sizes: updatedSizes }
    onFlavorsChange(flavors.map(f => f.id === flavorId ? updatedFlavor : f))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray mb-2">Cake Management</h1>
          <p className="text-gray-600">Manage cake flavors, sizes, and pricing</p>
        </div>
        
        {/* Search */}
        <div className="w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-1 text-right">
              Found {filteredFlavors.length} flavor{filteredFlavors.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add New Flavor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange" />
            Add New Flavor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray">Flavor Name</label>
              <Input
                value={newFlavor.name}
                onChange={(e) => setNewFlavor({ ...newFlavor, name: e.target.value })}
                placeholder="e.g., Chocolate Fudge"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray">Description</label>
              <Input
                value={newFlavor.description}
                onChange={(e) => setNewFlavor({ ...newFlavor, description: e.target.value })}
                placeholder="Rich chocolate cake with fudge frosting"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Button 
              onClick={handleAddFlavor}
              className="bg-orange hover:bg-orange-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Flavor
            </Button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newFlavor.available}
                onChange={(e) => setNewFlavor({ ...newFlavor, available: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Available</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Flavors List */}
      <div className="space-y-4">
        {filteredFlavors.map((flavor) => (
          <Card key={flavor.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cake className="w-5 h-5 text-orange" />
                  <div>
                    <CardTitle className="text-lg">
                      {editingId === flavor.id ? (
                        <Input
                          value={flavor.name}
                          onChange={(e) => handleSaveFlavor(flavor.id, { name: e.target.value })}
                          className="text-lg font-bold"
                        />
                      ) : (
                        flavor.name
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {editingId === flavor.id ? (
                        <Input
                          value={flavor.description}
                          onChange={(e) => handleSaveFlavor(flavor.id, { description: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        flavor.description
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={flavor.available}
                      onChange={(e) => handleSaveFlavor(flavor.id, { available: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Available</span>
                  </label>
                  {editingId === flavor.id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFlavor(flavor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFlavor(flavor.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray">Sizes & Pricing</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSize(flavor.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Size
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {flavor.sizes.map((size) => (
                    <div key={size.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="space-y-2">
                        <Input
                          value={size.name}
                          onChange={(e) => handleUpdateSize(flavor.id, size.id, { name: e.target.value })}
                          placeholder="Size name"
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          value={size.price}
                          onChange={(e) => handleUpdateSize(flavor.id, size.id, { price: parseFloat(e.target.value) || 0 })}
                          placeholder="Price"
                          className="text-sm"
                        />
                        <Input
                          value={size.description || ''}
                          onChange={(e) => handleUpdateSize(flavor.id, size.id, { description: e.target.value })}
                          placeholder="Description (optional)"
                          className="text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSize(flavor.id, size.id)}
                          className="text-red-600 hover:text-red-700 w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {flavor.sizes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Cake className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No sizes configured for this flavor</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSize(flavor.id)}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Size
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFlavors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            {searchTerm ? (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No flavors found</h3>
                <p className="text-gray-500 mb-4">No flavors match your search for "{searchTerm}"</p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Cake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No cake flavors yet</h3>
                <p className="text-gray-500">Add your first cake flavor to get started</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 