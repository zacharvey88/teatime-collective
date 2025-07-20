'use client'

// import { useState, useEffect } from 'react'
// import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Carousel from './Carousel'

const Hero = () => {
  // const [currentSlide, setCurrentSlide] = useState(0)

  // const cakeImages = [
  //   "https://framerusercontent.com/images/mloIhuklrhI5BFUacMMCzhmZHxQ.jpg",
  //   "https://framerusercontent.com/images/PPEllho3AF9c2nOji5oLm3FNx0s.jpg",
  //   "https://framerusercontent.com/images/noGm4cyaXzYmGjjRJvR1Yjcg.jpg",
  //   "https://framerusercontent.com/images/bABuIXzTPD8PxqWUg0bWyneTpc.jpg",
  //   "https://framerusercontent.com/images/LW4HjXF0shedHVgnqtiGVWQGgKI.jpg"
  // ]

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % cakeImages.length)
  //   }, 4000)

  //   return () => clearInterval(timer)
  // }, [cakeImages.length])

  // const nextSlide = () => {
  //   setCurrentSlide((prev) => (prev + 1) % cakeImages.length)
  // }

  // const prevSlide = () => {
  //   setCurrentSlide((prev) => (prev - 1 + cakeImages.length) % cakeImages.length)
  // }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-radial from-orange/20 to-transparent"></div>
      </div>

      <div className="section-container text-center z-10">
        {/* Rating Badge */}
        <div className="inline-flex items-center bg-light-cream px-6 py-3 rounded-full mb-8 animate-fade-in">
          <span className="text-sm font-medium mr-2">Google:</span>
          <div className="flex items-center space-x-1 mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-orange text-orange" />
            ))}
          </div>
          <span className="text-sm font-bold">(4.8)</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up text-balance">
          Delicious Vegan Cakes
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray max-w-2xl mx-auto mb-8 animate-slide-up delay-200">
          Vegan bakery, market traders and amazing cake makers since 2013
        </p>

        {/* CTA Button */}
        <div className="mb-16 animate-slide-up delay-300">
          <Link href="/" className="btn-primary">
            View Cakes
          </Link>
        </div>

        {/* Cake Gallery Carousel */}
        <Carousel />
        {/* <div className="relative max-w-6xl mx-auto">
          <div className="hidden lg:flex items-center justify-center space-x-6">
            {cakeImages.map((image, index) => {
              const position = (index - currentSlide + cakeImages.length) % cakeImages.length;
              let scale = 'scale-75 opacity-50 z-0';
              let width = 'w-40 h-56';
              
              if (position === 0) {
                scale = 'scale-100 opacity-100 z-20 shadow-lg';
                width = 'w-56 h-72';
              } else if (position === 1 || position === cakeImages.length - 1) {
                scale = 'scale-85 opacity-75 z-10';
                width = 'w-48 h-64';
              }

              return (
                <div
                  key={index}
                  className={`relative ${width} transition-all duration-500 ease-in-out ${scale} rounded-xl overflow-hidden cursor-pointer`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <Image
                    src={image}
                    alt={`Delicious cake ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              );
            })}
          </div>
  
          <div className="lg:hidden relative">
            <div className="relative h-72 rounded-xl overflow-hidden">
              <Image
                src={cakeImages[currentSlide]}
                alt={`Delicious cake ${currentSlide + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full transition-all duration-200 hover:scale-105"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full transition-all duration-200 hover:scale-105"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          <div className="flex justify-center space-x-2 mt-4">
            {cakeImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div> */}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent"></div>
    </section>
  )
}

export default Hero