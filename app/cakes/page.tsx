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
import { FrontendImageService, FrontendImageItem } from '@/lib/frontendImageService'

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
  // For consolidated cakes with multiple category options
  categoryOptions?: Array<{
    categoryName: string
    cakeId: string
    sizes: Array<{
      id: string
      name: string
      price: number
      description: string | null
    }>
  }>
  isConsolidated?: boolean
}

export default function CakesPage() {
  const { settings } = useSettings()
  const [cakeData, setCakeData] = useState<CakeDisplayData>({ standaloneCakes: [], categoryCakes: [] })
  const [cakeCards, setCakeCards] = useState<CakeCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({})
  const [showFrillyPricing, setShowFrillyPricing] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCakeCards, setFilteredCakeCards] = useState<CakeCard[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState<string>('')
  const [lightboxImages, setLightboxImages] = useState<FrontendImageItem[]>([])
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState<number>(0)
  const [customCakeImages, setCustomCakeImages] = useState<FrontendImageItem[]>([])

  useEffect(() => {
    loadCakes()
    loadCustomCakeImages()
  }, [])


  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && lightboxImage) {
        closeLightbox()
      } else if (event.key === 'ArrowRight' && lightboxImages.length > 0) {
        nextImage()
      } else if (event.key === 'ArrowLeft' && lightboxImages.length > 0) {
        prevImage()
      }
    }

    if (lightboxImage) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [lightboxImage, lightboxImages, lightboxCurrentIndex])

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
            sizes: sizes.sort((a, b) => a.price - b.price) // Sort sizes by price (cheapest first)
          })
        })
      })
      
      // Consolidate duplicate flavors from different categories
      const consolidatedCards: CakeCard[] = []
      const flavorGroups = new Map<string, CakeCard[]>()
      
      // Group cakes by name
      cards.forEach(card => {
        const key = card.name.toLowerCase().trim()
        if (!flavorGroups.has(key)) {
          flavorGroups.set(key, [])
        }
        flavorGroups.get(key)!.push(card)
      })
      
      // Process each group
      flavorGroups.forEach((group, flavorName) => {
        if (group.length === 1) {
          // Single cake - add as is
          consolidatedCards.push(group[0])
        } else {
          // Multiple cakes with same name - consolidate
          const firstCake = group[0]
          
          // Sort categories by average price to ensure regular (cheaper) comes first, frilly (more expensive) comes second
          const categoryOptions = group.map(cake => ({
            categoryName: cake.categoryName!,
            cakeId: cake.id, // Store the original cake ID
            sizes: cake.sizes.sort((a, b) => a.price - b.price), // Sort sizes by price (cheapest first)
            averagePrice: cake.sizes.reduce((sum, size) => sum + size.price, 0) / cake.sizes.length
          })).sort((a, b) => a.averagePrice - b.averagePrice)
          
          consolidatedCards.push({
            ...firstCake,
            id: `consolidated-${flavorName}`,
            isConsolidated: true,
            categoryOptions: categoryOptions.map(option => ({
              categoryName: option.categoryName,
              cakeId: option.cakeId, // Include the original cake ID
              sizes: option.sizes
            })),
            // Use the first cake's image and description, but remove individual category info
            categoryName: undefined
          })
        }
      })
      
      // Sort cakes alphabetically by name
      const sortedCards = consolidatedCards.sort((a, b) => a.name.localeCompare(b.name))
      
      setCakeCards(sortedCards)
      setFilteredCakeCards(sortedCards)
    } catch (err) {
      console.error('Failed to load cakes:', err)
      setError('Failed to load cakes. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomCakeImages = async () => {
    try {
      const images = await FrontendImageService.getCustomCakeImages()
      setCustomCakeImages(images)
    } catch (err) {
      console.error('Failed to load custom cake images:', err)
    }
  }

  const handleSizeSelect = (cakeId: string, sizeId: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [cakeId]: sizeId
    }))
  }

  const handleTabChange = (cakeId: string, tabIndex: number) => {
    setActiveTabs(prev => ({
      ...prev,
      [cakeId]: tabIndex
    }))
    
    // Auto-select the first size in the new tab
    const cake = cakeCards.find(c => c.id === cakeId)
    if (cake && cake.isConsolidated && cake.categoryOptions) {
      const newSizes = cake.categoryOptions[tabIndex].sizes
      if (newSizes.length > 0) {
        setSelectedSizes(prev => ({
          ...prev,
          [cakeId]: newSizes[0].id
        }))
      }
    }
  }

  const toggleFrillyPricing = (cakeId: string) => {
    const newShowFrilly = !showFrillyPricing[cakeId]
    setShowFrillyPricing(prev => ({ ...prev, [cakeId]: newShowFrilly }))
    
    // Auto-select the first size in the new pricing option
    const cake = cakeCards.find(c => c.id === cakeId)
    if (cake && cake.isConsolidated && cake.categoryOptions) {
      const targetTab = newShowFrilly ? 1 : 0
      const targetSizes = cake.categoryOptions[targetTab].sizes
      if (targetSizes.length > 0) {
        setActiveTabs(prev => ({ ...prev, [cakeId]: targetTab }))
        setSelectedSizes(prev => ({ ...prev, [cakeId]: targetSizes[0].id }))
      }
    }
  }

  // Auto-select size if there's only one option, or first size if multiple options
  useEffect(() => {
    if (cakeCards.length === 0) return
    
    const autoSelectSizes: Record<string, string> = {}
    const autoSelectTabs: Record<string, number> = {}
    
    cakeCards.forEach(card => {
      if (card.isConsolidated && card.categoryOptions) {
        // For consolidated cakes, set first tab as active
        autoSelectTabs[card.id] = 0
        // Auto-select first size in first tab (regardless of how many sizes)
        if (card.categoryOptions[0]?.sizes.length > 0) {
          autoSelectSizes[card.id] = card.categoryOptions[0].sizes[0].id
        }
      } else if (card.sizes.length > 0) {
        // Always auto-select first size (whether single or multiple)
        autoSelectSizes[card.id] = card.sizes[0].id
      }
    })
    
    // Only update if we have selections to make
    if (Object.keys(autoSelectSizes).length > 0) {
      setSelectedSizes(prev => ({ ...prev, ...autoSelectSizes }))
    }
    if (Object.keys(autoSelectTabs).length > 0) {
      setActiveTabs(prev => ({ ...prev, ...autoSelectTabs }))
    }
  }, [cakeCards])

  // Helper function to get current sizes for a cake (handles consolidated cakes)
  const getCurrentSizes = (cakeCard: CakeCard) => {
    if (cakeCard.isConsolidated && cakeCard.categoryOptions) {
      const activeTab = activeTabs[cakeCard.id] || 0
      return cakeCard.categoryOptions[activeTab].sizes
    }
    return cakeCard.sizes
  }

  // Helper function to get current category name for a cake
  const getCurrentCategoryName = (cakeCard: CakeCard) => {
    if (cakeCard.isConsolidated && cakeCard.categoryOptions) {
      const activeTab = activeTabs[cakeCard.id] || 0
      return cakeCard.categoryOptions[activeTab].categoryName
    }
    return cakeCard.categoryName
  }

  const handleAddToOrder = (cakeCard: CakeCard) => {
    const selectedSizeId = selectedSizes[cakeCard.id]
    if (!selectedSizeId) {
      alert('Please select a size first')
      return
    }

    const currentSizes = getCurrentSizes(cakeCard)
    const selectedSize = currentSizes.find(size => size.id === selectedSizeId)
    if (!selectedSize) return

    // Get the correct cake ID for consolidated cakes
    let actualCakeId = cakeCard.id
    if (cakeCard.isConsolidated && cakeCard.categoryOptions) {
      const activeTab = activeTabs[cakeCard.id] || 0
      const selectedCategory = cakeCard.categoryOptions[activeTab]
      actualCakeId = selectedCategory.cakeId
    }

    // Create cart item
    const cartItem = {
      id: `${cakeCard.id}-${selectedSizeId}`,
      categoryId: getCurrentCategoryName(cakeCard) || '',
      categoryName: getCurrentCategoryName(cakeCard) || '',
      flavorId: actualCakeId,
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

  const openLightbox = (imageUrl: string, alt: string, images?: FrontendImageItem[], currentIndex?: number) => {
    console.log('Opening lightbox for:', alt, imageUrl)
    setLightboxImage(imageUrl)
    setLightboxAlt(alt)
    if (images && currentIndex !== undefined) {
      setLightboxImages(images)
      setLightboxCurrentIndex(currentIndex)
    } else {
      setLightboxImages([])
      setLightboxCurrentIndex(0)
    }
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setLightboxAlt('')
    setLightboxImages([])
    setLightboxCurrentIndex(0)
  }

  const nextImage = () => {
    if (lightboxImages.length > 0) {
      const nextIndex = (lightboxCurrentIndex + 1) % lightboxImages.length
      setLightboxCurrentIndex(nextIndex)
      setLightboxImage(lightboxImages[nextIndex].url)
      setLightboxAlt(lightboxImages[nextIndex].alt_text || 'Custom Cake Examples')
    }
  }

  const prevImage = () => {
    if (lightboxImages.length > 0) {
      const prevIndex = lightboxCurrentIndex === 0 ? lightboxImages.length - 1 : lightboxCurrentIndex - 1
      setLightboxCurrentIndex(prevIndex)
      setLightboxImage(lightboxImages[prevIndex].url)
      setLightboxAlt(lightboxImages[prevIndex].alt_text || 'Custom Cake Examples')
    }
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
              <div className="bg-light-cream rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col max-w-sm mx-auto w-full relative">
                {/* Image Container with Overlay - Fixed height */}
                <div 
                  className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => cakeCard.imageUrl && openLightbox(cakeCard.imageUrl, cakeCard.name)}
                >
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
                  
                  {/* Magnifying glass icon on hover */}
                  {cakeCard.imageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  )}

                </div>
                
                {/* Content */}
                <div className="p-6 relative flex-1 flex flex-col">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                  </div>
                  
                  {/* Cake Name - Flexible height container */}
                  <div className="min-h-[48px] flex items-start justify-center">
                    <h3 className="text-xl font-bold text-gray-800 text-center leading-tight">{cakeCard.name}</h3>
                  </div>
                  
                                {/* Frilly Pricing Toggle Link or Spacer */}
                                <div className="text-center -mt-2 mb-3">
                                  {cakeCard.isConsolidated && cakeCard.categoryOptions ? (
                                    <button
                                      onClick={() => toggleFrillyPricing(cakeCard.id)}
                                      className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1 rounded-full border border-orange-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                      {showFrillyPricing[cakeCard.id] ? 'See Regular Pricing' : 'See Frilly Pricing'}
                                    </button>
                                  ) : (
                                    <div className="h-5"></div>
                                  )}
                                </div>
                  
                  

                  {/* Size Selection */}
                  <div className="flex-1 mb-4">
                    {(() => {
                      if (cakeCard.isConsolidated && cakeCard.categoryOptions) {
                        // Consolidated cake - show either regular or frilly pricing based on toggle
                        // First option should be regular (cheaper), second option should be frilly (more expensive)
                        const regularOption = cakeCard.categoryOptions[0]
                        const frillyOption = cakeCard.categoryOptions[1]
                        const isShowingFrilly = showFrillyPricing[cakeCard.id]
                        
                        return (
                          <div className="space-y-1.5 transition-all duration-300 ease-in-out">
                            {regularOption.sizes.map((size, sizeIndex) => (
                              <label
                                key={sizeIndex}
                                onClick={() => {
                                  const targetTab = isShowingFrilly ? 1 : 0
                                  const targetSizeId = isShowingFrilly ? frillyOption.sizes[sizeIndex].id : size.id
                                  setActiveTabs(prev => ({ ...prev, [cakeCard.id]: targetTab }))
                                  setSelectedSizes(prev => ({ ...prev, [cakeCard.id]: targetSizeId }))
                                }}
                                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 min-h-[60px] ${
                                  getSelectedSize(cakeCard.id) === (isShowingFrilly ? frillyOption.sizes[sizeIndex].id : size.id) && 
                                  (activeTabs[cakeCard.id] || 0) === (isShowingFrilly ? 1 : 0)
                                    ? 'bg-white/80 border-2 border-orange-300 shadow-md'
                                    : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    getSelectedSize(cakeCard.id) === (isShowingFrilly ? frillyOption.sizes[sizeIndex].id : size.id) && 
                                    (activeTabs[cakeCard.id] || 0) === (isShowingFrilly ? 1 : 0)
                                      ? 'border-orange-500 bg-orange-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {getSelectedSize(cakeCard.id) === (isShowingFrilly ? frillyOption.sizes[sizeIndex].id : size.id) && 
                                    (activeTabs[cakeCard.id] || 0) === (isShowingFrilly ? 1 : 0) && (
                                      <div className="w-1 h-1 bg-white rounded-full"></div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-medium text-gray-800 text-sm block">
                                      {size.name} - {isShowingFrilly ? 'Frilly' : 'Regular'}
                                    </span>
                                    <div className="min-h-[16px]">
                                      {size.description && (
                                        <p className="text-xs text-gray-500 leading-tight">{size.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-orange flex-shrink-0 ml-2">
                                  £{(isShowingFrilly ? frillyOption.sizes[sizeIndex].price : size.price)?.toFixed(2) || '0.00'}
                                </span>
                              </label>
                            ))}
                          </div>
                        )
                      } else {
                        // Regular cake - show normal size selection
                        const currentSizes = getCurrentSizes(cakeCard)
                        const currentSizesLength = currentSizes.length
                        
                        if (currentSizesLength === 1) {
                          // Single size - show as info with matching styling but no radio button
                          return (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border-2 border-orange-300 shadow-md min-h-[60px]">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 bg-orange-500 flex items-center justify-center flex-shrink-0">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-medium text-gray-800 text-sm block">{currentSizes[0].name}</span>
                                    <div className="min-h-[16px]">
                                      {currentSizes[0].description && (
                                        <p className="text-xs text-gray-500 leading-tight">{currentSizes[0].description}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-orange flex-shrink-0 ml-2">£{currentSizes[0].price?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          )
                        } else {
                          // Multiple sizes - show selection interface
                          return (
                            <div className="space-y-1.5">
                              {currentSizes.map((size) => (
                                <label
                                  key={size.id}
                                  onClick={() => handleSizeSelect(cakeCard.id, size.id)}
                                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 min-h-[60px] ${
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
                                      <div className="min-h-[16px]">
                                        {size.description && (
                                          <p className="text-xs text-gray-500 leading-tight">{size.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-sm font-bold text-orange flex-shrink-0 ml-2">£{size.price.toFixed(2)}</span>
                                </label>
                              ))}
                            </div>
                          )
                        }
                      }
                    })()}
                  </div>

                  {/* Add to Order Button */}
                  <button
                    onClick={() => handleAddToOrder(cakeCard)}
                    className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 mt-auto bg-orange-500 hover:bg-orange-500/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Custom Cake Card */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col max-w-sm mx-auto w-full border-2 border-dashed border-orange-300 hover:border-orange-400 transition-all duration-300">
              {/* Image Container - Fixed height */}
              <div className="relative h-56 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {customCakeImages.length > 0 ? (
                  <div className="relative w-full h-full">
                    {/* Main image */}
                    <div 
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => openLightbox(customCakeImages[0].url, 'Custom Cake Examples', customCakeImages, 0)}
                    >
                      <Image
                        src={customCakeImages[0].url}
                        alt={customCakeImages[0].alt_text || 'Custom Cake Examples'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent"></div>
                      {/* Magnifying glass icon on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional images as small thumbnails */}
                    {customCakeImages.length > 1 && (
                      <div className="absolute bottom-2 right-2 flex space-x-1">
                        {customCakeImages.slice(1, 4).map((image, index) => (
                          <div
                            key={image.id}
                            className="relative w-8 h-8 rounded border-2 border-white shadow-md cursor-pointer overflow-hidden"
                            onClick={() => openLightbox(image.url, image.alt_text || 'Custom Cake Examples', customCakeImages, index + 1)}
                          >
                            <Image
                              src={image.url}
                              alt={image.alt_text || 'Custom Cake Examples'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {customCakeImages.length > 4 && (
                          <div className="w-8 h-8 rounded border-2 border-white shadow-md bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+{customCakeImages.length - 4}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md border border-orange-200">
                      <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 21H5V3H13V9H19V21Z"/>
                      </svg>
                    </div>
                    <p className="text-orange-700 text-sm font-medium">Custom Design</p>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="px-8 py-6 relative flex-1 flex flex-col">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                </div>
                
                {/* Card Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                  Can't find what you're<br />
                  looking for?
                </h3>
                
                {/* Description */}
                <div className="flex-1 mb-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      If you have a special design in mind, we'd love to create something unique just for you!
                    </p>
                    <div className="flex justify-center space-x-6 mt-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm6 14h-4v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4H6c-1.1 0-2-.9-2-2s.9-2 2-2h4V6c0-1.1.9-2 2-2s2 .9 2 2v4h4c1.1 0 2 .9 2 2s-.9 2-2 2z"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">Custom flavors</span>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0L7 12.96V17h4.04l10.71-10.71c.39-.39.39-1.02 0-1.41zM5 15v2h2v-2H5z"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">Decorations</span>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">Dietary needs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Button */}
                <button
                  onClick={() => window.location.href = '/order?type=custom'}
                  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 mt-auto bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Order a Custom Cake
                </button>
              </div>
            </div>
          </div>
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

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-[calc(100vh-2rem)] overflow-hidden rounded-lg">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation arrows - only show if there are multiple images */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            <Image
              src={lightboxImage}
              alt={lightboxAlt}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  {lightboxCurrentIndex + 1} of {lightboxImages.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 