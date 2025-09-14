'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Calendar, AlertTriangle, Type, MessageSquare, Plus, Minus, Trash2, CheckCircle, XCircle, Loader2, ChevronDown, CreditCard } from 'lucide-react'
import Image from 'next/image'
import { CakeService, CakeWithDetails } from '@/lib/cakeService'
import WaveTransition from '@/components/WaveTransition'
import { OrderService, CreateOrderData } from '@/lib/orderService'
import { HolidayService } from '@/lib/holidayService'
import { useSettings } from '@/lib/settingsContext'
import { DatePicker } from '@/components/ui/date-picker'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface CartItem {
  id: string
  categoryId: string
  categoryName: string
  flavorId: string
  flavorName: string
  sizeId: string
  sizeName: string
  price: number
  quantity: number
  imageUrl: string | null
  writing_on_cake?: string
}

interface CakeOption {
  id: string
  type: 'standalone' | 'category'
  categoryId?: string
  categoryName?: string
  flavorId?: string
  flavorName: string
  imageUrl: string | null
  sizes: Array<{
    id: string
    name: string
    price: number
    description: string | null
  }>
}

export default function OrderPage() {
  const searchParams = useSearchParams()
  const { settings } = useSettings()
  
  const [loading, setLoading] = useState(true)
  const [cakeOptions, setCakeOptions] = useState<CakeOption[]>([])
  const [selectedCake, setSelectedCake] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [expandedWritingFields, setExpandedWritingFields] = useState<Record<string, boolean>>({})
  const [expandedEditFields, setExpandedEditFields] = useState<Record<string, boolean>>({})
  const [orderType, setOrderType] = useState<'regular' | 'custom'>('regular')
  const [customCakeDescription, setCustomCakeDescription] = useState('')
  const [customCakeSize, setCustomCakeSize] = useState('')
  const [customCakeSizeOther, setCustomCakeSizeOther] = useState('')
  const [customCakeQuantity, setCustomCakeQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateRequired: '',
    allergies: '',
    otherInfo: ''
  })
  const [blockedDates, setBlockedDates] = useState<string[]>([])

  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('teatime-cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart)
          } else {
            localStorage.removeItem('teatime-cart')
          }
        } catch (error) {
          localStorage.removeItem('teatime-cart')
        }
      }
    } catch (error) {
      // localStorage not available (e.g., private browsing)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('teatime-cart', JSON.stringify(cart))
      } else {
        localStorage.removeItem('teatime-cart')
      }
    } catch (error) {
      // localStorage not available (e.g., private browsing)
    }
  }, [cart])

  useEffect(() => {
    loadCakes()
    loadBlockedDates()
    
    // Pre-select cake and size from session storage
    const selectedCakeId = sessionStorage.getItem('selectedCakeId')
    const selectedSizeId = sessionStorage.getItem('selectedSizeId')
    const selectedQuantity = sessionStorage.getItem('selectedQuantity')
    
    if (selectedCakeId) {
      setSelectedCake(selectedCakeId)
    }
    if (selectedSizeId) {
      setSelectedSize(selectedSizeId)
    }
    if (selectedQuantity) {
      setQuantity(parseInt(selectedQuantity))
    }

    // Check URL query parameters for order type
    const urlParams = new URLSearchParams(window.location.search)
    const orderTypeParam = urlParams.get('type')
    if (orderTypeParam === 'custom') {
      setOrderType('custom')
    }
  }, [])

  const loadBlockedDates = async () => {
    try {
      const holidays = await HolidayService.getHolidays()
      const blocked: string[] = []
      
      holidays.forEach(holiday => {
        const start = new Date(holiday.start_date)
        const end = new Date(holiday.end_date)
        
        // Add all dates in the range to blocked dates
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          blocked.push(date.toISOString().split('T')[0])
        }
      })
      
      setBlockedDates(blocked)
    } catch (error) {
      console.error('Error loading blocked dates:', error)
    }
  }

  const loadCakes = async () => {
    try {
      setLoading(true)
      const cakeData = await CakeService.getAllCakes()
      
      // Transform data into cake options
      const options: CakeOption[] = []
      
      // Add standalone cakes
      cakeData.standaloneCakes.forEach(cake => {
        options.push({
          id: cake.id,
          type: 'standalone',
          flavorName: cake.name,
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
      cakeData.categoryCakes.forEach(category => {
        category.flavors.forEach(flavor => {
          // Check if flavor has price override and create custom sizes
          const sizes = category.sizes.map(size => ({
            ...size,
            price: flavor.price_override !== null && flavor.price_override !== undefined ? flavor.price_override : size.price // Use flavor price override if available, otherwise use size price
          }))
          
          options.push({
            id: flavor.id,
            type: 'category',
            categoryId: category.category.id,
            categoryName: category.category.name,
            flavorId: flavor.id,
            flavorName: flavor.name,
            imageUrl: flavor.image_url,
            sizes: sizes
          })
        })
      })
      
      // Sort cake options alphabetically by flavor name
      const sortedOptions = options.sort((a, b) => a.flavorName.localeCompare(b.flavorName))
      
      setCakeOptions(sortedOptions)
    } catch (error) {
      console.error('Error loading cakes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddToCart = () => {
    if (!selectedCake) return

    const cake = cakeOptions.find(c => c.id === selectedCake)
    if (!cake) return

    // Auto-select size if there's only one option
    const sizeToUse = selectedSize || (cake.sizes.length === 1 ? cake.sizes[0].id : null)
    if (!sizeToUse) return

    const size = cake.sizes.find(s => s.id === sizeToUse)
    if (!size) return

    const existingItem = cart.find(item => 
      item.flavorId === (cake.flavorId || cake.id) && item.sizeId === size.id
    )

    if (existingItem) {
      // Update quantity of existing item
      setCart(cart.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${cake.flavorId || cake.id}-${size.id}`,
        categoryId: cake.categoryId || '',
        categoryName: cake.categoryName || '',
        flavorId: cake.flavorId || cake.id,
        flavorName: cake.flavorName,
        sizeId: size.id,
        sizeName: size.name,
        price: size.price,
        quantity: quantity,
        imageUrl: cake.imageUrl
      }
      setCart([...cart, newItem])
    }

    // Reset selection
    setSelectedCake('')
    setSelectedSize('')
    setQuantity(1)
  }

  const handleAddCustomCakeToCart = () => {
    if (!customCakeDescription.trim() || !customCakeSize) return
    if (customCakeSize === 'other' && !customCakeSizeOther.trim()) return

    // Estimate price based on size
    const sizePrices = {
      '6': 30,
      '9': 42.50,
      '12.5': 62.50
    }

    // Determine the size name to display
    let sizeName = customCakeSize
    if (customCakeSize === 'other') {
      sizeName = customCakeSizeOther.trim()
    }

    const newItem: CartItem = {
      id: `custom-${Date.now()}`,
      categoryId: 'custom',
      categoryName: 'Custom Cake',
      flavorId: 'custom',
      flavorName: customCakeDescription.trim(),
      sizeId: customCakeSize,
      sizeName: sizeName,
      price: sizePrices[customCakeSize as keyof typeof sizePrices] || 50,
      quantity: customCakeQuantity,
      imageUrl: null
    }

    setCart(prev => [...prev, newItem])
    setCustomCakeDescription('')
    setCustomCakeSize('')
    setCustomCakeSizeOther('')
    setCustomCakeQuantity(1)
  }

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId))
    } else {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const updateCartItemWriting = (itemId: string, writing: string) => {
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, writing_on_cake: writing }
        : item
    ))
  }

  const toggleWritingField = (itemId: string) => {
    setExpandedWritingFields(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const toggleEditField = (itemId: string) => {
    setExpandedEditFields(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const updateCustomCakeDetails = (itemId: string, description: string, size: string, customSize?: string) => {
    // Estimate price based on size
    const sizePrices = {
      '6': 30,
      '9': 42.50,
      '12.5': 62.50
    }

    // Determine the size name to display
    let sizeName = size
    if (size === 'other' && customSize) {
      sizeName = customSize.trim()
    }

    setCart(cart.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            flavorName: description,
            sizeId: size,
            sizeName: sizeName,
            price: sizePrices[size as keyof typeof sizePrices] || 50
          }
        : item
    ))
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('teatime-cart')
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const hasCustomCakes = () => {
    return cart.some(item => item.categoryId === 'custom')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      setSubmitError('Please add at least one cake to your cart')
      return
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.dateRequired) {
      setSubmitError('Please fill in all required fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const orderData: CreateOrderData = {
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        collection_date: formData.dateRequired,
        estimated_total: hasCustomCakes() ? 0 : cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        notes: '', // Admin notes only - not used for customer input
        allergies: formData.allergies.trim(),
        special_requests: (() => {
          const customCakeDetails = cart
            .filter(item => item.categoryId === 'custom')
            .map(item => `Custom Cake (${item.sizeName}): ${item.flavorName}`)
            .join('\n')
          
          const baseRequests = formData.otherInfo.trim()
          return customCakeDetails 
            ? (baseRequests ? `${baseRequests}\n\n${customCakeDetails}` : customCakeDetails)
            : baseRequests
        })(),
        items: cart.map(item => ({
          cake_id: item.categoryId === 'custom' ? null : item.flavorId,
          cake_size_id: item.categoryId === 'custom' ? null : item.sizeId,
          item_name: item.categoryId === 'custom' 
            ? `Custom Cake: ${item.flavorName}` 
            : `${item.flavorName}`,
          item_details: item.categoryId === 'custom' 
            ? null 
            : `${item.categoryName} ${item.sizeName}`,
          quantity: item.quantity,
          estimated_unit_price: item.categoryId === 'custom' ? 0 : item.price,
          estimated_total_price: item.categoryId === 'custom' ? 0 : item.price * item.quantity,
          writing_on_cake: item.writing_on_cake || '',
          custom_cake_description: item.categoryId === 'custom' ? item.flavorName : null,
          is_custom_cake: item.categoryId === 'custom'
        }))
      }

      const orderRequest = await OrderService.createOrderRequest(orderData)
      await OrderService.sendOrderNotification(orderRequest)

      setSubmitSuccess(true)
      setFormData({ name: '', email: '', phone: '', dateRequired: '', allergies: '', otherInfo: '' })
      setCart([])
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error: any) {
      console.error('Error submitting order:', error)
      setSubmitError(error.message || 'Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCakeData = cakeOptions.find(c => c.id === selectedCake)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">


          {/* Error Message */}
          {submitError && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Submission Error</h3>
                  <p className="text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-orange mb-2 font-lobster">
              {settings?.order_heading || 'Order Your Cakes'}
            </h1>
            <p className="text-lg md:text-xl text-gray max-w-2xl mx-auto font-inter">
              {settings?.order_subheading || "Don't leave them in the cart - someone else will eat them!"}
            </p>
          </div>

          {/* Order Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-2">
              <div className="flex space-x-1">
                <button
                  onClick={() => setOrderType('regular')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    orderType === 'regular'
                      ? 'bg-orange text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Regular Cakes
                </button>
                <button
                  onClick={() => setOrderType('custom')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    orderType === 'custom'
                      ? 'bg-orange text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Custom Cake
                </button>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Combined Cake Selection and Cart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  {/* Cake Selection - Regular Mode */}
                  {orderType === 'regular' && (
                    <div className="space-y-4 mb-8">
                      <div className="relative">
                        <select
                          value={selectedCake}
                          onChange={(e) => {
                            setSelectedCake(e.target.value)
                            setSelectedSize('')
                          }}
                          className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent appearance-none"
                        >
                          <option value="">Choose a cake...</option>
                          {cakeOptions.map((cake) => (
                            <option key={cake.id} value={cake.id}>
                              {cake.flavorName} {cake.categoryName && `(${cake.categoryName})`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </div>

                      {/* Size Selection - Only show if multiple sizes */}
                      {selectedCakeData && selectedCakeData.sizes.length > 1 && (
                        <div className="relative">
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent appearance-none"
                          >
                            <option value="">Choose a size...</option>
                            {selectedCakeData.sizes.map((size) => (
                              <option key={size.id} value={size.id}>
                                {size.name} - £{size.price.toFixed(2)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                      )}

                      {/* Quantity and Add to Cart */}
                      {(selectedSize || (selectedCakeData && selectedCakeData.sizes.length === 1)) && (
                        <div>
                          <label className="block text-sm font-medium text-gray mb-2">
                            Quantity
                          </label>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={handleAddToCart}
                              className="bg-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-900 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Cake Form */}
                  {orderType === 'custom' && (
                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-gray mb-2">
                          Describe Your Custom Cake
                        </label>
                        <textarea
                          value={customCakeDescription}
                          onChange={(e) => setCustomCakeDescription(e.target.value)}
                          placeholder="Tell us about your custom cake idea... (e.g., 'A chocolate cake with vanilla buttercream, decorated with fresh flowers and a gold leaf border')"
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray mb-2">
                          Preferred Size
                        </label>
                        <select
                          value={customCakeSize}
                          onChange={(e) => setCustomCakeSize(e.target.value)}
                          className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent appearance-none"
                        >
                          <option value="">Select size...</option>
                          <option value="6">6" (6-8 servings)</option>
                          <option value="9">9" (10-12 servings)</option>
                          <option value="12.5">12.5" (15-20 servings)</option>
                          <option value="other">Other (specify size)</option>
                        </select>
                        
                        {/* Custom size input for "other" option */}
                        {customCakeSize === 'other' && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray mb-2">
                              Specify Custom Size
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 8&quot;, 10&quot;, 14&quot;, etc."
                              value={customCakeSizeOther || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomCakeSizeOther(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all"
                              required
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => setCustomCakeQuantity(Math.max(1, customCakeQuantity - 1))}
                              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-medium w-12 text-center">{customCakeQuantity}</span>
                            <button
                              type="button"
                              onClick={() => setCustomCakeQuantity(customCakeQuantity + 1)}
                              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={handleAddCustomCakeToCart}
                            disabled={!customCakeDescription.trim() || !customCakeSize || (customCakeSize === 'other' && !customCakeSizeOther.trim())}
                            className="bg-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-900 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            Add Custom Cake
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cart */}
                  <div className="border-t pt-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Your Cart</h3>
                    </div>
                    
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4">
                          <Image
                            src="/images/logo-cake.png"
                            alt="Cake placeholder"
                            width={48}
                            height={48}
                            className="opacity-40"
                          />
                        </div>
                        {settings?.show_cart_notice !== false && (
                          <p className="text-gray-600">{settings?.empty_cart_message || "Oh no! There's no cakes in your cart."}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.id} className="flex flex-col p-3 bg-gray-50 rounded-lg">
                              {/* Main Row */}
                              <div className="flex items-center space-x-3">
                                {/* Image */}
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {item.imageUrl ? (
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.flavorName}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Image
                                      src="/images/logo-cake.png"
                                      alt="Cake placeholder"
                                      width={32}
                                      height={32}
                                      className="opacity-60"
                                    />
                                  )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-800 text-sm truncate">
                                    {item.categoryId === 'custom' 
                                      ? 'Custom Cake' 
                                      : item.flavorName
                                    }
                                  </h4>

                                  {item.categoryId !== 'custom' ? (
                                    <p className="text-xs text-gray-600">
                                      {item.categoryName} {item.sizeName} - £{item.price.toFixed(2)} each
                                    </p>
                                  ) : (
                                    <p className="text-xs text-orange font-medium">Price to be confirmed</p>
                                  )}
                                  
                                  {/* Writing on Cake Toggle Button - Regular cakes only */}
                                  {item.categoryId !== 'custom' && (
                                    <button
                                      onClick={() => toggleWritingField(item.id)}
                                      className="text-xs text-orange-600 hover:text-orange-700 underline decoration-dotted underline-offset-2 transition-colors duration-200 mt-1"
                                    >
                                      {item.writing_on_cake ? 'Edit cake text' : 'Add text to cake'}
                                    </button>
                                  )}
                                  
                                  {/* Edit Cake Button - Custom cakes only */}
                                  {item.categoryId === 'custom' && (
                                    <button
                                      onClick={() => toggleEditField(item.id)}
                                      className="text-xs text-orange-600 hover:text-orange-700 underline decoration-dotted underline-offset-2 transition-colors duration-200 mt-1"
                                    >
                                      Edit cake
                                    </button>
                                  )}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex flex-col items-end space-y-2">
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-xs"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                                    <button
                                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-xs"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeFromCart(item.id)}
                                      className="text-red-600 hover:text-red-700 p-1 ml-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Writing on Cake Field - Full width when expanded */}
                              {expandedWritingFields[item.id] && (
                                <div className="mt-3 w-full">
                                  <input
                                    type="text"
                                    placeholder="Writing on cake (optional)"
                                    value={item.writing_on_cake || ''}
                                    onChange={(e) => updateCartItemWriting(item.id, e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent"
                                  />
                                </div>
                              )}
                              
                              {/* Edit Custom Cake Fields - Full width when expanded */}
                              {expandedEditFields[item.id] && item.categoryId === 'custom' && (
                                <div className="mt-3 w-full space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Cake Description
                                    </label>
                                    <textarea
                                      placeholder="Describe your custom cake..."
                                      value={item.flavorName}
                                      onChange={(e) => updateCustomCakeDetails(item.id, e.target.value, item.sizeId)}
                                      rows={3}
                                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent resize-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Size
                                    </label>
                                    <select
                                      value={item.sizeId}
                                      onChange={(e) => updateCustomCakeDetails(item.id, item.flavorName, e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent"
                                    >
                                      <option value="6">6" (6-8 servings)</option>
                                      <option value="9">9" (10-12 servings)</option>
                                      <option value="12.5">12.5" (15-20 servings)</option>
                                      <option value="other">Other (specify size)</option>
                                    </select>
                                    
                                    {/* Custom size input for "other" option in edit mode */}
                                    {item.sizeId === 'other' && (
                                      <div className="mt-2">
                                        <input
                                          type="text"
                                          placeholder="Specify custom size..."
                                          value={item.sizeName === 'other' ? '' : item.sizeName}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCustomCakeDetails(item.id, item.flavorName, 'other', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange focus:border-transparent"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => toggleEditField(item.id)}
                                      className="text-xs text-gray-600 hover:text-gray-800 underline decoration-dotted underline-offset-2 transition-colors duration-200"
                                    >
                                      Done editing
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Total */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            {hasCustomCakes() ? (
                              <span className="text-orange text-xl">Not Available</span>
                            ) : (
                              <span className="text-orange">£{getTotalPrice().toFixed(2)}</span>
                            )}
                          </div>

                          {settings?.show_cart_notice !== false && (
                            <div className="mt-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <AlertTriangle className="w-6 h-6 text-orange" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-orange text-left">
                                    {hasCustomCakes() && settings?.custom_order_notice 
                                      ? settings.custom_order_notice 
                                      : (settings?.cart_notice || "Prices shown are estimates and may vary based on special requests, decorations, dietary requirements, and other factors. Final pricing will be confirmed when we review your order.")
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all"
                      placeholder="+44 07765 833 910"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dateRequired" className="block text-sm font-medium text-gray mb-2">
                    Date Required *
                  </label>
                  <DatePicker
                    value={formData.dateRequired}
                    onChange={(date) => setFormData({ ...formData, dateRequired: date })}
                    blockedDates={blockedDates}
                    minDate={new Date().toISOString().split('T')[0]}
                    placeholder="Select a date"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray mb-2">
                    Any Allergies
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all"
                      placeholder="e.g., nuts, gluten, dairy"
                    />
                  </div>
                </div>



                <div>
                  <label htmlFor="otherInfo" className="block text-sm font-medium text-gray mb-2">
                    Special Requests
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="otherInfo"
                      name="otherInfo"
                      value={formData.otherInfo}
                      onChange={handleChange}
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all resize-none"
                      placeholder="Any additional special requests or questions..."
                    />
                  </div>
                </div>

                {/* Payment Notice */}
                {settings?.payment_notice && settings?.show_order_form_notice !== false && (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-orange text-left">
                          {settings.payment_notice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}



                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={cart.length === 0 || submitting}
                    className="w-full bg-orange text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-900 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                        Submitting Order...
                      </>
                    ) : cart.length === 0 ? (
                      settings?.order_button_empty_text || 'Add cakes to cart first'
                    ) : (
                      settings?.order_button_active_text || 'Let there be cake!'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <WaveTransition direction="down" color="#FFF5E0" />
      <Footer />

      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Submitted Successfully!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for your order. We'll review your request and get back to you as soon as possible.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Email notifications are temporarily disabled. We'll contact you directly to confirm your order details and arrange collection.
                </p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-orange-800 mb-2">📍 Collection Information</h4>
                <p className="text-sm text-orange-700 mb-2">
                  Once ready, your order will need to be collected from:
                </p>
                <p className="text-sm font-medium text-orange-800">
                  St. Wilfrids Enterprise Centre, Royce Road, Hulme, M15 5BJ
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  <em>Make sure you stay on Royce Road as the satnav will take you to Birchvale Close.</em>
                </p>
              </div>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="w-full bg-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-900 transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 