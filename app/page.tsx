'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import MarketDates from '@/components/MarketDates'
import OurStory from '@/components/OurStory'
import Festivals from '@/components/Festivals'
import WeddingCakes from '@/components/WeddingCakes'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className={`min-h-screen transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navigation />
      <main>
        <Hero />
        <MarketDates />
        <OurStory />
        <Festivals />
        <WeddingCakes />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}