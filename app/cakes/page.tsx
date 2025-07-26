'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import CakeCard from '@/components/CakeCard'
import { CakeService, CakeCardData } from '@/lib/cakeService'

export default function CakesPage() {
  const [cakes, setCakes] = useState<CakeCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCakes()
  }, [])

  const loadCakes = async () => {
    try {
      setLoading(true)
      setError(null)
      const cakeData = await CakeService.getCakesForPage()
      setCakes(cakeData)
    } catch (err) {
      console.error('Failed to load cakes:', err)
      setError('Failed to load cakes. Please try again later.')
    } finally {
      setLoading(false)
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-orange/20 overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cakes Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cakes.map((cake) => (
                <CakeCard
                  key={cake.id}
                  id={cake.id}
                  name={cake.name}
                  image={cake.image}
                  description={cake.description}
                  flavors={cake.flavors}
                  pricing={cake.pricing}
                  availableSizes={cake.availableSizes}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && cakes.length === 0 && (
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