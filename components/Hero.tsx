'use client'

import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Carousel from './Carousel'
import { useSettings } from '@/lib/settingsContext'

const Hero = () => {
  const { settings } = useSettings()
  return (
    <section className="relative md:min-h-screen md:flex md:items-center md:justify-center overflow-hidden pt-[120px] pb-4 md:pb-0">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-radial from-orange/20 to-transparent"></div>
      </div> */}

      <div className="section-container text-center z-10">


        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2 animate-slide-up text-balance font-lobster text-orange">
          {settings?.home_title || 'Delicious Vegan Cakes'}
        </h1>

        <p className="text-lg md:text-xl text-gray max-w-2xl mx-auto mb-8 animate-slide-up delay-200 font-inter">
          {settings?.home_subheading || 'Vegan bakery, market traders and amazing cake makers since 2013'}
        </p>

        <div className="mb-12 mt-12 md:mb-16 animate-slide-up delay-300">
          <Link href="/cakes" className="btn-primary">
            Order Cakes Here
          </Link>
        </div>
        <Carousel />
      </div>
      {/* Gradient Overlay */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent"></div> */}
    </section>
  )
}

export default Hero