'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { CakeService, CakeWithDetails, Cake, CakeDisplayData } from '@/lib/cakeService'
import { Search, X, ChevronDown } from 'lucide-react'
import { useSettings } from '@/lib/settingsContext'
import WaveTransition from '@/components/WaveTransition'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface CakeCard {
  id: string
  type: 'standalone' | 'category'
  name: string
  description: string | null
  imageUrl: string | null
  categoryName?: string
  sizes: Array<{
    id: string
    name: string
    price: number
    description: string | null
  }>
}

export default function CakesPage() {
  const { settings } = useSettings()
  const [cakeData, setCakeData] = useState<CakeDisplayData>({ standaloneCakes: [], categoryCakes: [] })
  const [cakeCards, setCakeCards] = useState<CakeCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCakeCards, setFilteredCakeCards] = useState<CakeCard[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    loadCakes()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCakeCards(cakeCards)
      return
    }

    const filtered = cakeCards.filter(card => {
      const searchLower = searchTerm.toLowerCase()
      
      // Search in cake name
      if (card.name.toLowerCase().includes(searchLower)) return true
      
      // Search in description
      if (card.description && card.description.toLowerCase().includes(searchLower)) return true
      
      // Search in category name (for category-based cakes)
      if (card.categoryName && card.categoryName.toLowerCase().includes(searchLower)) return true
      
      // Search in size names and descriptions
      if (card.sizes.some(size => 
        size.name.toLowerCase().includes(searchLower) ||
        (size.description && size.description.toLowerCase().includes(searchLower))
      )) return true
      
      return false
    })
    
    setFilteredCakeCards(filtered)
  }, [searchTerm, cakeCards])

  const loadCakes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await CakeService.getAllCakes()
      setCakeData(data)
      
      // Transform data into individual cake cards
      const cards: CakeCard[] = []
      
      // Add standalone cakes
      data.standaloneCakes.forEach(cake => {
        cards.push({
          id: cake.id,
          type: 'standalone',
          name: cake.name,
          description: cake.description,
          imageUrl: cake.image_url,
          sizes: [{
            id: cake.id, // Use cake ID as size ID for standalone cakes
            name: cake.size_name || 'Standard',
            price: cake.price || 0,
            description: cake.size_description
          }]
        })
      })
      
      // Add category-based cakes
      data.categoryCakes.forEach(category => {
        category.flavors.forEach(flavor => {
          // Check if flavor has price override and create custom sizes
          const sizes = category.sizes.map(size => ({
            ...size,
            price: flavor.price_override !== null && flavor.price_override !== undefined ? flavor.price_override : size.price // Use flavor price override if available, otherwise use size price
          }))
          
          cards.push({
            id: flavor.id,
            type: 'category',
            name: flavor.name,
            description: flavor.description || null,
            imageUrl: flavor.image_url,
            categoryName: category.category.name,
            sizes: sizes
          })
        })
      })
      
      // Sort cakes alphabetically by name
      const sortedCards = cards.sort((a, b) => a.name.localeCompare(b.name))
      
      setCakeCards(sortedCards)
      setFilteredCakeCards(sortedCards)
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

  // Auto-select size if there's only one option
  useEffect(() => {
    const autoSelectSizes: Record<string, string> = {}
    cakeCards.forEach(card => {
      if (card.sizes.length === 1) {
        autoSelectSizes[card.id] = card.sizes[0].id
      }
    })
    setSelectedSizes(prev => ({ ...prev, ...autoSelectSizes }))
  }, [cakeCards])

  const handleAddToOrder = (cakeCard: CakeCard) => {
    const selectedSizeId = selectedSizes[cakeCard.id]
    if (!selectedSizeId) {
      alert('Please select a size first')
      return
    }

    const selectedSize = cakeCard.sizes.find(size => size.id === selectedSizeId)
    if (!selectedSize) return

    // Create cart item
    const cartItem = {
      id: `${cakeCard.id}-${selectedSizeId}`,
      categoryId: cakeCard.categoryName || '',
      categoryName: cakeCard.categoryName || '',
      flavorId: cakeCard.id,
      flavorName: cakeCard.name,
      sizeId: selectedSizeId,
      sizeName: selectedSize.name,
      price: selectedSize.price,
      quantity: 1,
      imageUrl: cakeCard.imageUrl
    }

    // Get existing cart from localStorage
    const existingCart = localStorage.getItem('teatime-cart')
    let cart = existingCart ? JSON.parse(existingCart) : []
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((item: any) => item.id === cartItem.id)
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += 1
    } else {
      // Add new item to cart
      cart.push(cartItem)
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('teatime-cart', JSON.stringify(cart))
    
    // Trigger storage event for navigation to update cart count
    window.dispatchEvent(new Event('storage'))
    
    // Show custom success notification
    setNotificationMessage(`${cakeCard.name} added to your order! 🍰`)
    setShowNotification(true)
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  const getSelectedSize = (cakeId: string) => {
    return selectedSizes[cakeId] || ''
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cakes...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navigation />
      
      {/* Custom Notification */}
      {showNotification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-md">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-orange mb-2 font-lobster">
            {settings?.cakes_heading || 'Our Cakes'}
          </h1>
          <p className="text-lg md:text-xl text-gray max-w-2xl mx-auto font-inter">
            {settings?.cakes_subheading || "Plant-powered cakes so good, even the cows are jealous! 🌱🍰✨"}
          </p>
        </div>

        {/* Search Bar - Always visible on mobile, controlled by setting on desktop */}
        <div className={`mb-8 max-w-sm mx-auto w-full lg:max-w-none lg:mx-0 ${settings?.cake_search_enabled === false ? 'lg:hidden' : ''}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search cakes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white/80 border border-orange rounded-xl focus:ring-2 focus:ring-orange focus:border-orange focus:outline-none placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Cakes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCakeCards.map((cakeCard) => (
            <div key={cakeCard.id} className="group relative">
              {/* Card Container with Gradient Background */}
              <div className="bg-light-cream rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col max-w-sm mx-auto w-full">
                {/* Image Container with Overlay */}
                <div className="relative h-56 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
                  {cakeCard.imageUrl ? (
                    <Image
                      src={cakeCard.imageUrl}
                      alt={cakeCard.name}
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
                  

                </div>
                
                {/* Content */}
                <div className="p-6 relative flex-1 flex flex-col">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                  </div>
                  
                  {/* Cake Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">{cakeCard.name}</h3>
                  
                  {/* Description */}
                  {cakeCard.description && (
                    <p className="text-gray-600 text-sm text-center mb-4">{cakeCard.description}</p>
                  )}

                  {/* Size Selection */}
                  <div className="flex-1 mb-6">
                    {cakeCard.sizes.length === 1 ? (
                      // Single size - show as info with matching styling but no radio button
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border-2 border-orange-300 shadow-md">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 bg-orange-500 flex items-center justify-center flex-shrink-0">
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800 text-sm block">{cakeCard.sizes[0].name}</span>
                              {cakeCard.sizes[0].description && (
                                <p className="text-xs text-gray-500 leading-tight">{cakeCard.sizes[0].description}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-orange flex-shrink-0 ml-2">£{cakeCard.sizes[0].price?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    ) : (
                      // Multiple sizes - show selection interface
                      <div className="space-y-1.5">
                        {cakeCard.sizes.map((size) => (
                                                  <label
                          key={size.id}
                          onClick={() => handleSizeSelect(cakeCard.id, size.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 ${
                            getSelectedSize(cakeCard.id) === size.id
                              ? 'bg-white/80 border-2 border-orange-300 shadow-md'
                              : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                                                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              getSelectedSize(cakeCard.id) === size.id
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                            }`}>
                              {getSelectedSize(cakeCard.id) === size.id && (
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                              )}
                            </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-gray-800 text-sm block">{size.name}</span>
                                {size.description && (
                                  <p className="text-xs text-gray-500 leading-tight">{size.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-bold text-orange flex-shrink-0 ml-2">£{size.price.toFixed(2)}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add to Order Button */}
                  <button
                    onClick={() => handleAddToOrder(cakeCard)}
                    disabled={!getSelectedSize(cakeCard.id)}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 mt-auto ${
                      getSelectedSize(cakeCard.id)
                        ? 'bg-orange-500 hover:bg-orange-500/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {cakeCard.sizes.length === 1 ? 'Add to Order' : (getSelectedSize(cakeCard.id) ? 'Add to Order' : 'Select a Size')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCakeCards.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No cakes found matching your search.</p>
          </div>
        )}
        </div>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-orange text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 z-40 hover:scale-110"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      <WaveTransition direction="down" color="#FFF5E0" />
      <Footer />
    </div>
  )
} 