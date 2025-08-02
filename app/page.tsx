'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Markets from '@/components/Markets'
import OurStory from '@/components/OurStory'
import Festivals from '@/components/Festivals'
import Weddings from '@/components/Weddings'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import WaveTransition from '@/components/WaveTransition'
import BackgroundFade from '@/components/BackgroundFade'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`min-h-screen transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navigation />
      <main>
        <Hero />
        <Markets />
        <WaveTransition direction="down" color="#FFF5E0" />
        <OurStory />
        <BackgroundFade fromColor="#FFF5E0" toColor="#FFFBF0" />
        <Festivals />
        <BackgroundFade fromColor="#FFFBF0" toColor="#FFF5E0" />
        <Weddings />
        <BackgroundFade fromColor="#FFF5E0" toColor="#FFFBF0" />
        <Testimonials />
        <WaveTransition direction="down" color="#FFF5E0" />
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

      <Footer />
    </div>
  )
}