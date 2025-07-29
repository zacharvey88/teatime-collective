'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { CakeService, CakeWithDetails } from '@/lib/cakeService'

interface CakeCard {
  id: string
  categoryId: string
  categoryName: string
  flavorName: string
  imageUrl: string | null
  sizes: Array<{
    id: string
    name: string
    price: number
    description: string | null
  }>
}

export default function CakesPage() {
  const [cakes, setCakes] = useState<CakeWithDetails[]>([])
  const [cakeCards, setCakeCards] = useState<CakeCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})

  useEffect(() => {
    loadCakes()
  }, [])

  const loadCakes = async () => {
    try {
      setLoading(true)
      setError(null)
      const cakeData = await CakeService.getCakesByCategory()
      setCakes(cakeData)
      
      // Transform data into individual cake cards
      const cards: CakeCard[] = []
      cakeData.forEach(category => {
        category.flavors.forEach(flavor => {
          cards.push({
            id: flavor.id,
            categoryId: category.category.id,
            categoryName: category.category.name,
            flavorName: flavor.name,
            imageUrl: flavor.image_url,
            sizes: category.sizes
          })
        })
      })
      setCakeCards(cards)
    } catch (err) {
      console.error('Failed to load cakes:', err)
      setError('Failed to load cakes. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSizeSelect = (cakeId: string, sizeId: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [cakeId]: sizeId
    }))
  }

  const handleAddToOrder = (cakeCard: CakeCard) => {
    const selectedSizeId = selectedSizes[cakeCard.id]
    if (!selectedSizeId) {
      alert('Please select a size before adding to order')
      return
    }

    const selectedSize = cakeCard.sizes.find(size => size.id === selectedSizeId)
    if (!selectedSize) return

    // Store in sessionStorage for the order page
    const orderData = {
      categoryId: cakeCard.categoryId,
      categoryName: cakeCard.categoryName,
      flavorId: cakeCard.id,
      flavorName: cakeCard.flavorName,
      imageUrl: cakeCard.imageUrl,
      sizeId: selectedSizeId,
      sizeName: selectedSize.name,
      price: selectedSize.price
    }
    
    sessionStorage.setItem('selectedCake', JSON.stringify(orderData))
    window.location.href = '/order'
  }

  const getSelectedSize = (cakeId: string) => {
    return selectedSizes[cakeId]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-orange mb-4 font-lobster">
              Our Cakes
            </h1>
            <p className="text-lg text-gray max-w-2xl mx-auto">
              Discover our delicious selection of handcrafted vegan cakes, perfect for any occasion. 
              Each cake is made with love and the finest ingredients.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button 
                onClick={loadCakes}
                className="bg-orange hover:bg-orange-900 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl shadow-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-orange-200 to-amber-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gradient-to-r from-orange-200 to-amber-200 rounded mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-orange-200 to-amber-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 bg-gradient-to-r from-orange-200 to-amber-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gradient-to-r from-orange-200 to-amber-200 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-10 bg-gradient-to-r from-orange-200 to-amber-200 rounded mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cake Cards */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cakeCards.map((cakeCard) => (
                <div key={cakeCard.id} className="group relative">
                  {/* Card Container with Gradient Background */}
                  <div className="bg-light-cream rounded-3xl shadow-xl overflow-hidden">
                    {/* Image Container with Overlay */}
                    <div className="relative h-56 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
                      {cakeCard.imageUrl ? (
                        <Image
                          src={cakeCard.imageUrl}
                          alt={`${cakeCard.flavorName} ${cakeCard.categoryName}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md border border-orange-100">
                              <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 21H5V3H13V9H19V21Z"/>
                              </svg>
                            </div>
                            <p className="text-orange-600 text-sm font-medium">No Image</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
                          {cakeCard.categoryName}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 relative">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                      </div>
                      
                      {/* Flavor Name */}
                      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">{cakeCard.flavorName}</h3>

                      {/* Size Selection */}
                      <div className="mb-6">
                        <div className="space-y-3">
                          {cakeCard.sizes.map((size) => (
                            <label
                              key={size.id}
                              onClick={() => handleSizeSelect(cakeCard.id, size.id)}
                              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                                getSelectedSize(cakeCard.id) === size.id
                                  ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 shadow-lg'
                                  : 'bg-white/70 border-2 border-orange-100 hover:border-orange-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  getSelectedSize(cakeCard.id) === size.id
                                    ? 'border-orange-500 bg-orange-500'
                                    : 'border-orange-300'
                                }`}>
                                  {getSelectedSize(cakeCard.id) === size.id && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-800">{size.name}</span>
                                  {size.description && (
                                    <p className="text-xs text-gray-500 mt-1">{size.description}</p>
                                  )}
                                </div>
                              </div>
                              <span className="text-lg font-bold text-orange">£{size.price.toFixed(2)}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Add to Order Button */}
                      <button
                        onClick={() => handleAddToOrder(cakeCard)}
                        disabled={!getSelectedSize(cakeCard.id)}
                        className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                          getSelectedSize(cakeCard.id)
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {getSelectedSize(cakeCard.id) ? 'Add to Order' : 'Select a Size'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && cakeCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No cakes available at the moment.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
} 