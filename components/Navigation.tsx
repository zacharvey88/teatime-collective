'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Cakes', href: '/' },
    { name: 'Order', href: '/order' },
    { name: 'Our Story', href: '#story' },
    { name: 'Markets', href: '#markets' },
    { name: 'Festivals', href: '#festivals' }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-cream/90 backdrop-blur-lg shadow-lg' : 'bg-gradient-to-b from-cream to-transparent'
    }`}>
      <div className="w-full">
        <div className="flex items-center justify-between py-1 px-4 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-16 h-16">
              <Image
                src="https://framerusercontent.com/images/9BRXJQRTuoR7dflavQsmPR1Pfpw.png"
                alt="Teatime Collective Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-medium text-dark hover:text-orange transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
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
          <div className="flex flex-col space-y-4 pt-4 border-t border-orange/20">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-medium text-dark hover:text-orange transition-colors duration-200 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation