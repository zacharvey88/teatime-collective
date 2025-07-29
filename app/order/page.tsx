'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Calendar, Cake, Ruler, AlertTriangle, Type, MessageSquare, Plus, Minus, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { CakeService, CakeWithDetails } from '@/lib/cakeService'
import { OrderService, CreateOrderRequestData } from '@/lib/orderService'
import { useSettings } from '@/lib/settingsContext'

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
}

interface CakeOption {
  id: string
  categoryId: string
  categoryName: string
  flavorId: string
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
  
  const [cakes, setCakes] = useState<CakeWithDetails[]>([])
  const [cakeOptions, setCakeOptions] = useState<CakeOption[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCake, setSelectedCake] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  const { settings } = useSettings()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateRequired: '',
    allergies: '',
    writing: '',
    otherInfo: ''
  })

  useEffect(() => {
    loadCakes()
    
    // Check for selected cake from cakes page
    const selectedCakeData = sessionStorage.getItem('selectedCake')
    if (selectedCakeData) {
      try {
        const cakeData = JSON.parse(selectedCakeData)
        // Pre-select the cake and size
        setSelectedCake(cakeData.flavorId)
        setSelectedSize(cakeData.sizeId)
        setQuantity(1)
        sessionStorage.removeItem('selectedCake')
      } catch (err) {
        console.error('Error parsing selected cake data:', err)
      }
    }
  }, [])

  const loadCakes = async () => {
    try {
      setLoading(true)
      const cakeData = await CakeService.getCakesByCategory()
      setCakes(cakeData)
      
      // Transform data into cake options
      const options: CakeOption[] = []
      cakeData.forEach(category => {
        category.flavors.forEach(flavor => {
          options.push({
            id: flavor.id,
            categoryId: category.category.id,
            categoryName: category.category.name,
            flavorId: flavor.id,
            flavorName: flavor.name,
            imageUrl: flavor.image_url,
            sizes: category.sizes
          })
        })
      })
      setCakeOptions(options)
    } catch (err) {
      console.error('Failed to load cakes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
      setFormData({
        ...formData,
        [name]: value
      })
    }

  const handleAddToCart = () => {
    if (!selectedCake || !selectedSize) return

    const cake = cakeOptions.find(c => c.id === selectedCake)
    const size = cake?.sizes.find(s => s.id === selectedSize)
    
    if (!cake || !size) return

    const existingItem = cart.find(item => 
      item.flavorId === cake.flavorId && item.sizeId === size.id
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
        id: `${cake.flavorId}-${size.id}`,
        categoryId: cake.categoryId,
        categoryName: cake.categoryName,
        flavorId: cake.flavorId,
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

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (cart.length === 0) {
      setSubmitError('Please add at least one cake to your cart')
      return
    }
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.dateRequired) {
      setSubmitError('Please fill in all required fields')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address')
      return
    }
    
    setSubmitting(true)
    setSubmitError('')
    
    try {
      // Prepare order data
      const orderData: CreateOrderRequestData = {
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        notes: formData.otherInfo.trim(),
        special_requirements: [
          formData.allergies.trim(),
          formData.writing.trim()
        ].filter(Boolean).join(' | '),
        items: cart.map(item => ({
          cake_flavor_id: item.flavorId,
          cake_size_id: item.sizeId,
          item_name: `${item.flavorName} (${item.sizeName})`,
          quantity: item.quantity,
          estimated_unit_price: item.price,
          estimated_total_price: item.price * item.quantity,
          special_instructions: ''
        }))
      }
      
      // Create order request
      const orderRequest = await OrderService.createOrderRequest(orderData)
      
      // Send notification (placeholder)
      await OrderService.sendOrderNotification(orderRequest)
      
      // Show success
      setSubmitSuccess(true)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        dateRequired: '',
        allergies: '',
        writing: '',
        otherInfo: ''
      })
      setCart([])
      
      // Scroll to top to show success message
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
    <div className="min-h-screen bg-light-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Order Submitted Successfully!</h3>
                  <p className="text-green-700 mt-1">
                    Thank you for your order. We'll review your request and get back to you as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            <h1 className="text-4xl md:text-5xl font-bold text-orange mb-4 font-lobster">
              Order Your Cakes
            </h1>
            <p className="text-lg text-gray max-w-md mx-auto">
              Select your cakes and we'll get back to you with a quote as soon as possible.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Order Form */}
            <div className="space-y-8">
              {/* Cake Selection */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-orange/20 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Cakes</h2>
                
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cake Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray mb-2">
                        Select Cake
                      </label>
                      <select
                        value={selectedCake}
                        onChange={(e) => {
                          setSelectedCake(e.target.value)
                          setSelectedSize('')
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                      >
                        <option value="">Choose a cake...</option>
                        {cakeOptions.map((cake) => (
                          <option key={cake.id} value={cake.id}>
                            {cake.flavorName} ({cake.categoryName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size Selection */}
                    {selectedCakeData && (
                      <div>
                        <label className="block text-sm font-medium text-gray mb-2">
                          Select Size
                        </label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                        >
                          <option value="">Choose a size...</option>
                          {selectedCakeData.sizes.map((size) => (
                            <option key={size.id} value={size.id}>
                              {size.name} - £{size.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quantity */}
                    {selectedSize && (
                      <div>
                        <label className="block text-sm font-medium text-gray mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-medium">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    {selectedSize && (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full bg-orange hover:bg-orange-900 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                )}
              </div>



              {/* Contact Form */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-orange/20 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray mb-2">
                        NAME *
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
                        PHONE NUMBER *
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
                      EMAIL *
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
                      DATE REQUIRED *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        id="dateRequired"
                        name="dateRequired"
                        value={formData.dateRequired}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray mb-2">
                      ANY ALLERGIES
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
                    <label htmlFor="writing" className="block text-sm font-medium text-gray mb-2">
                      ANY WRITING ON THE CAKE
                    </label>
                    <div className="relative">
                      <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="writing"
                        name="writing"
                        value={formData.writing}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all"
                        placeholder="e.g., Happy Birthday Sarah!"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="otherInfo" className="block text-sm font-medium text-gray mb-2">
                      OTHER INFO
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
                        placeholder="Any additional details, special requests, or questions..."
                      />
                  </div>
                </div>

                {/* Payment Notice */}
                {settings?.payment_notice && (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 text-center">
                      {settings.payment_notice}
                    </p>
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
                      'Add cakes to cart first'
                    ) : (
                      `Order ${cart.length} cake${cart.length === 1 ? '' : 's'} - £${getTotalPrice().toFixed(2)}`
                    )}
                  </button>
                </div>
              </form>
              </div>
            </div>

            {/* Cart Sidebar */}
              <div className="flex flex-col h-full">
              {/* Main Cake Image */}
                <div className="flex-1 relative rounded-2xl overflow-hidden mb-8 shadow-lg border border-orange/20">
                  <Image
                    src="/images/mud-pie.jpg"
                    alt="Delicious vegan cake showcase"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                </div>

              {/* Cart */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-orange/20 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Cart</h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <Cake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-2">Select cakes from the left to get started</p>
                        </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {/* Image */}
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.flavorName}
                                width={48}
                                height={48}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <Cake className="w-6 h-6 text-gray-400" />
                            )}
                        </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 text-sm truncate">{item.flavorName}</h4>
                            <p className="text-xs text-gray-600">{item.sizeName}</p>
                            <p className="text-xs text-orange font-medium">£{item.price.toFixed(2)} each</p>
                        </div>

                          {/* Quantity Controls */}
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
                    </div>
                    
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                  
                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-orange">£{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
                </div>
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 