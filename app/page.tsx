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

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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
      <Footer />
    </div>
  )
}