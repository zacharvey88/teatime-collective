'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Calendar, Cake, Ruler, AlertTriangle, Type, MessageSquare } from 'lucide-react'
import Image from 'next/image'

export default function OrderPage() {
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateRequired: '',
    flavour: '',
    size: '',
    allergies: '',
    writing: '',
    otherInfo: ''
  })

  // Set flavour from URL parameter if present
  useEffect(() => {
    const flavourParam = searchParams.get('flavour')
    if (flavourParam) {
      setFormData(prev => ({
        ...prev,
        flavour: flavourParam
      }))
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // If flavour changes, reset size selection
    if (name === 'flavour') {
      setFormData({
        ...formData,
        [name]: value,
        size: '' // Reset size when flavour changes
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const sizeOptions = [
    { value: '', label: 'Select size' },
    { value: '6-inch-regular', label: '6 inch Regular (£50) - serves 6-8', type: 'regular' },
    { value: '9-inch-regular', label: '9 inch Regular (£60) - serves 12-14', type: 'regular' },
    { value: '12.5-inch-regular', label: '12.5 inch Regular (£85) - serves 20', type: 'regular' },
    { value: '6-inch-frilly', label: '6 inch Frilly (£70) - serves 8', type: 'frilly' },
    { value: '9-inch-frilly', label: '9 inch Frilly (£80) - serves 12', type: 'frilly' },
    { value: '12.5-inch-frilly', label: '12.5 inch Frilly (£110) - serves 20', type: 'frilly' },
    { value: 'wedding-cake', label: 'Wedding Cake (quote required)', type: 'wedding' },
    { value: 'other-bakes', label: 'Other Bakes (traybakes, pies, etc.)', type: 'other' },
    { value: 'custom', label: 'Custom size', type: 'custom' }
  ]

  // Flavours that are available in frilly cakes
  const frillyFlavours = [
    'chocolate', 'chocolate-orange', 'chocolate-vanilla', 'chocolate-hazelnut', 
    'chocolate-peanut-butter', 'pumpkin-spice', 'toffee-biscoff', 'toffee-banana', 
    'cookies-cream', 'carrot-cake', 'coffee-walnut', 'coffee-chocolate', 
    'lemon-crumble', 'lemon-raspberry', 'vanilla-raspberry', 'victoria-sponge'
  ]

  // Get filtered size options based on selected flavour
  const getFilteredSizeOptions = () => {
    if (!formData.flavour) return sizeOptions
    
    // If flavour is available in frilly, show both regular and frilly
    if (frillyFlavours.includes(formData.flavour)) {
      return sizeOptions.filter(option => 
        option.type === 'regular' || option.type === 'frilly' || option.type === 'custom'
      )
    }
    
    // If flavour is not available in frilly, only show regular
    return sizeOptions.filter(option => 
      option.type === 'regular' || option.type === 'custom'
    )
  }

  const flavourOptions = [
    { value: '', label: 'Select flavour' },
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'chocolate-orange', label: 'Chocolate Orange' },
    { value: 'chocolate-vanilla', label: 'Chocolate and Vanilla' },
    { value: 'chocolate-hazelnut', label: 'Chocolate and Hazelnut' },
    { value: 'chocolate-peanut-butter', label: 'Chocolate and Peanut Butter' },
    { value: 'blackforest-gateau', label: 'Blackforest Gateau' },
    { value: 'pumpkin-spice', label: 'Pumpkin Spice' },
    { value: 'toffee-popcorn', label: 'Toffee Popcorn' },
    { value: 'toffee-biscoff', label: 'Toffee and Biscoff' },
    { value: 'toffee-banana', label: 'Toffee and Banana' },
    { value: 'cookies-cream', label: 'Cookies and Cream' },
    { value: 'chocolate-gateau', label: 'Chocolate Gateau' },
    { value: 'tiramisu', label: 'Tiramisu' },
    { value: 'carrot-cake', label: 'Carrot Cake' },
    { value: 'coffee-walnut', label: 'Coffee and Walnut' },
    { value: 'coffee-chocolate', label: 'Coffee and Chocolate' },
    { value: 'lemon-crumble', label: 'Lemon Crumble' },
    { value: 'lemon-raspberry', label: 'Lemon and Raspberry' },
    { value: 'vanilla-raspberry', label: 'Vanilla and Raspberry' },
    { value: 'victoria-sponge', label: 'Victoria Sponge' },
    { value: 'almond-raspberry', label: 'Almond and Raspberry' },
    { value: 'almond-cherry', label: 'Almond and Cherry' },
    { value: 'orange-walnut', label: 'Orange and Walnut' },
    { value: 'raspberry-pistachio', label: 'Raspberry and Pistachio' },
    { value: 'orange-pistachio', label: 'Orange and Pistachio' },
    { value: 'custom', label: 'Custom flavour' }
  ]

  return (
    <div className="min-h-screen bg-light-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-orange mb-4 font-lobster">
              Order Your Cake
            </h1>
            <p className="text-lg text-gray max-w-md mx-auto">
              Tell us about your perfect cake and we'll get back to you with a quote as soon as soon as possible.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Order Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-orange/20 p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div className="space-y-6">
                  
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
                </div>

                {/* Cake Details */}
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="flavour" className="block text-sm font-medium text-gray mb-2">
                        WHAT FLAVOUR *
                      </label>
                      <div className="relative">
                        <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          id="flavour"
                          name="flavour"
                          value={formData.flavour}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all appearance-none bg-white"
                          required
                        >
                          {flavourOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="size" className="block text-sm font-medium text-gray mb-2">
                        SIZE *
                      </label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          id="size"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all appearance-none bg-white"
                          required
                          disabled={!formData.flavour}
                        >
                          {getFilteredSizeOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
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
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-orange text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange/90 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
                  >
                    Let there be cake!
                  </button>
                </div>
              </form>
            </div>

                          {/* Cake Showcase */}
              <div className="flex flex-col h-full">
                {/* Main Cake Image - Takes up remaining space */}
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

                {/* Pricing Information */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-orange/20 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                      <h4 className="font-bold text-dark mb-3">
                        Regular Cakes
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray">6 inch (6-8 slices)</span>
                          <span className="font-semibold text-orange">£50</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray">9 inch (12-14 slices)</span>
                          <span className="font-semibold text-orange">£60</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray">12.5 inch (20 slices)</span>
                          <span className="font-semibold text-orange">£85</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                      <h4 className="font-bold text-dark mb-3">
                        Frilly Cakes
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray">6 inch (8 slices)</span>
                          <span className="font-semibold text-orange">£70</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray">9 inch (12 slices)</span>
                          <span className="font-semibold text-orange">£80</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray">12.5 inch (20 slices)</span>
                          <span className="font-semibold text-orange">£110</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-white/40 mb-4">
                    <h4 className="font-bold text-dark mb-3">
                      Other Bakes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray">Chocolate & Biscoff Torte (12 inch)</span>
                        <span className="font-semibold text-orange">£45</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray">Manchester Mud Pie</span>
                        <span className="font-semibold text-orange">£55</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray">Banana Pie</span>
                        <span className="font-semibold text-orange">£45</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray">Baked Vanilla Cheesecake (12 inch)</span>
                        <span className="font-semibold text-orange">£50</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray">Mixed Fruit Cheesecake (12 inch)</span>
                        <span className="font-semibold text-orange">£60</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray">Bakewell Tray (12 slices)</span>
                        <span className="font-semibold text-orange">£40</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray">Rocky Road (18 slices)</span>
                        <span className="font-semibold text-orange">£50</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray">Gluten Free Brownies (18 slices)</span>
                        <span className="font-semibold text-orange">£45</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange/5 rounded-xl p-4 border border-orange/20">
                    <p className="text-s text-gray leading-relaxed">
                      <strong>Note:</strong> All cakes are vegan but not gluten-free. 
                      Contains wheat/soya. Some contain nuts - please specify allergies.
                    </p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 