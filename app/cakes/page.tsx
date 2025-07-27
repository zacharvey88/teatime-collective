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

  const handleAddToOrder = (cakeCard: CakeCard) => {
    // For now, redirect to order page with cake info
    // Later we'll implement a cart system
    const orderData = {
      categoryId: cakeCard.categoryId,
      categoryName: cakeCard.categoryName,
      flavorId: cakeCard.id,
      flavorName: cakeCard.flavorName,
      imageUrl: cakeCard.imageUrl
    }
    
    // Store in sessionStorage for the order page
    sessionStorage.setItem('selectedCake', JSON.stringify(orderData))
    window.location.href = '/order'
  }

  return (
    <div className="min-h-screen bg-light-cream">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-orange/20 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cake Cards */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cakeCards.map((cakeCard) => (
                <div key={cakeCard.id} className="bg-white rounded-2xl shadow-lg border border-orange/20 overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {cakeCard.imageUrl ? (
                      <Image
                        src={cakeCard.imageUrl}
                        alt={`${cakeCard.flavorName} ${cakeCard.categoryName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-8 h-8 text-orange" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category and Flavor */}
                    <div className="mb-4">
                      <p className="text-sm text-orange font-medium mb-1">{cakeCard.categoryName}</p>
                      <h3 className="text-xl font-bold text-gray-800">{cakeCard.flavorName}</h3>
                    </div>

                    {/* Sizes and Prices */}
                    <div className="space-y-2 mb-6">
                      {cakeCard.sizes.map((size) => (
                        <div key={size.id} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-800">{size.name}</span>
                            {size.description && (
                              <p className="text-xs text-gray-500">{size.description}</p>
                            )}
                          </div>
                          <span className="text-lg font-bold text-orange">£{size.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Add to Order Button */}
                    <button
                      onClick={() => handleAddToOrder(cakeCard)}
                      className="w-full bg-orange hover:bg-orange-900 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Add to Order
                    </button>
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