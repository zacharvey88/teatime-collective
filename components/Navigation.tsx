'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Cake, ShoppingCart, BookOpen, MapPin, Calendar, Heart } from 'lucide-react'
import AnimatedLogo from './AnimatedLogo'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

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

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Cakes', href: '/cakes', icon: Cake },
    { name: 'Order', href: '/order', icon: ShoppingCart },
    { name: 'Our Story', href: '/#story', icon: BookOpen },
    { name: 'Markets', href: '/#markets', icon: MapPin },
    { name: 'Festivals', href: '/#festivals', icon: Calendar },
    { name: 'Weddings', href: '/#weddings', icon: Heart }
  ]

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
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="font-medium text-dark hover:text-orange transition-colors duration-200 relative group flex items-center gap-1"
                >
                  {IconComponent && <IconComponent size={16} />}
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all duration-200 group-hover:w-full"></span>
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-dark hover:text-orange transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}>
          <div className="flex flex-col space-y-4 pt-4 px-4 border-t border-orange/20 bg-cream/95 backdrop-blur-sm">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="font-medium text-dark hover:text-orange transition-colors duration-200 py-2 flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {IconComponent && <IconComponent size={16} />}
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation