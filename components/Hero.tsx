'use client'

import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Carousel from './Carousel'

const Hero = () => {
  return (
    <section className="relative min-h-screen md:flex md:items-center md:justify-center overflow-hidden pt-[120px]">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-radial from-orange/20 to-transparent"></div>
      </div> */}

      <div className="section-container text-center z-10">
        <div className="inline-flex items-center bg-light-cream px-6 py-3 rounded-full mb-8 animate-fade-in">
          <span className="text-sm font-medium mr-2">Google:</span>
          <div className="flex items-center space-x-1 mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-orange text-orange" />
            ))}
          </div>
          <span className="text-sm font-bold">(4.8)</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up text-balance font-lobster text-orange">
          Delicious Vegan Cakes
        </h1>

        <p className="text-lg md:text-xl text-gray max-w-2xl mx-auto mb-8 animate-slide-up delay-200">
          Vegan bakery, market traders and amazing cake makers since 2013
        </p>

        <div className="mb-16 animate-slide-up delay-300">
          <Link href="/cakes" className="btn-primary">
            View Cakes
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