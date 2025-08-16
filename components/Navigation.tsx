'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, Home, Building2, House, ChevronDown } from 'lucide-react'
import AnimatedLogo from './AnimatedLogo'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [showCartPreview, setShowCartPreview] = useState(false)
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [menuCloseTimeout, setMenuCloseTimeout] = useState<NodeJS.Timeout | null>(null)
  const [cartPreviewCloseTimeout, setCartPreviewCloseTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show/hide navigation based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past the top
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }
      
      // Update scroll state for background
      setIsScrolled(currentScrollY > 50)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Load cart count and items from localStorage
  useEffect(() => {
    const loadCartData = () => {
      try {
        const savedCart = localStorage.getItem('teatime-cart')
        if (savedCart) {
          const cart = JSON.parse(savedCart)
          const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
          setCartCount(totalItems)
          setCartItems(cart)
        } else {
          setCartCount(0)
          setCartItems([])
        }
      } catch (error) {
        setCartCount(0)
        setCartItems([])
      }
    }

    loadCartData()
    
    // Listen for storage changes (when cart is updated from other pages)
    const handleStorageChange = () => {
      loadCartData()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (menuCloseTimeout) {
        clearTimeout(menuCloseTimeout)
      }
      if (cartPreviewCloseTimeout) {
        clearTimeout(cartPreviewCloseTimeout)
      }
    }
  }, [menuCloseTimeout, cartPreviewCloseTimeout])

  const navItems = [
    { name: 'Cakes', href: '/cakes' },
    { name: 'Order', href: '/order' },
    { name: 'Our Story', href: '/#story' },
    { name: 'Markets', href: '/#markets' },
    { name: 'Festivals', href: '/#festivals' },
    { name: 'Weddings', href: '/#weddings' }
  ]

  const handleMenuMouseEnter = () => {
    // Clear any existing timeout
    if (menuCloseTimeout) {
      clearTimeout(menuCloseTimeout)
      setMenuCloseTimeout(null)
    }
    setIsMenuExpanded(true)
  }

  const handleMenuMouseLeave = () => {
    // Set a timeout to close the menu after 1000ms
    const timeout = setTimeout(() => {
      setIsMenuExpanded(false)
    }, 1000)
    setMenuCloseTimeout(timeout)
  }

  const handleCartPreviewMouseEnter = () => {
    // Clear any existing timeout
    if (cartPreviewCloseTimeout) {
      clearTimeout(cartPreviewCloseTimeout)
      setCartPreviewCloseTimeout(null)
    }
    setShowCartPreview(true)
  }

  const handleCartPreviewMouseLeave = () => {
    // Set a timeout to close the cart preview after 1000ms
    const timeout = setTimeout(() => {
      setShowCartPreview(false)
    }, 1000)
    setCartPreviewCloseTimeout(timeout)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-cream/80 backdrop-blur-md' : 'bg-gradient-to-b from-cream to-transparent'
    } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="w-full">
        <div className="flex items-center justify-between py-3 px-4 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <AnimatedLogo 
              size={64} 
              autoSpin={false} 
              spinSpeed={8}
              className="hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Home Icon */}
            <Link
              href="/"
              className="font-medium text-dark hover:text-orange transition-colors duration-200 relative group"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all duration-200 group-hover:w-full"></span>
            </Link>

            {/* Expandable Navigation Links and Burger */}
            <div 
              className="flex items-center group relative"
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
            >
              {/* Expandable Navigation Links */}
              <div className={`flex items-center space-x-6 overflow-hidden transition-all duration-500 ${isMenuExpanded ? 'max-w-none w-auto' : 'max-w-0 w-0'}`}>
                {navItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-medium text-dark hover:text-orange transition-colors duration-200 relative group/item whitespace-nowrap transition-opacity duration-500 ${index === 0 ? 'pl-4' : ''} ${index === 5 ? 'pr-6' : ''} ${isMenuExpanded ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all duration-200 group-hover/item:w-full"></span>
                  </Link>
                ))}
              </div>
              
              {/* Hover Bridge - prevents menu from closing when moving mouse */}
              <div className={`absolute top-full left-0 right-0 h-4 bg-transparent ${isMenuExpanded ? 'block' : 'hidden'}`}></div>
              
              {/* Burger Menu Trigger */}
              <div className="relative">
                <button className="font-medium text-dark hover:text-orange transition-colors duration-200 flex items-center space-x-1">
                  <Menu className="w-5 h-5" />
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMenuExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Cart Indicator with Preview */}
            <div 
              className="relative ml-2"
              onMouseEnter={handleCartPreviewMouseEnter}
              onMouseLeave={handleCartPreviewMouseLeave}
            >
              <Link
                href="/order"
                className="font-medium text-dark hover:text-orange transition-colors duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Cart Preview Dropdown */}
              {showCartPreview && cartItems.length > 0 && (
                <>
                  {/* Hover Bridge - prevents cart preview from closing when moving mouse */}
                  <div className="absolute top-full right-0 w-80 h-2 bg-transparent"></div>
                  <div 
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    onMouseEnter={handleCartPreviewMouseEnter}
                    onMouseLeave={handleCartPreviewMouseLeave}
                  >
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Your Cart ({cartCount} items)</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {cartItems.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-orange">{item.quantity}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{item.flavorName}</p>
                              <p className="text-xs text-gray-500">{item.sizeName}</p>
                            </div>
                            <span className="text-sm font-bold text-orange">£{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                        {cartItems.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{cartItems.length - 3} more items
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-800">Total:</span>
                          <span className="text-sm font-bold text-orange">
                            £{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                          </span>
                        </div>
                        <Link
                          href="/order"
                          className="w-full bg-orange text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 text-center block"
                        >
                          View Cart
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button and Cart */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Cart Indicator */}
            <Link
              href="/order"
              className="relative font-medium text-dark hover:text-orange transition-colors duration-200 p-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            
            {/* Menu Button */}
            <button
              className="p-2 text-dark hover:text-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

                  {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}>
          <div className="flex flex-col space-y-4 pt-4 px-4 border-t border-orange/20 bg-cream/95 backdrop-blur-sm shadow-lg">
            
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-medium text-dark hover:text-orange transition-colors duration-200 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Bottom spacing */}
            <div className="pt-4 mt-2"></div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation