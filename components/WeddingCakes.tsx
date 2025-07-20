'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Heart, Mail } from 'lucide-react'

const WeddingCakes = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const weddingImages = [
    {
      src: "https://framerusercontent.com/images/WV9YyzyU2aaOsusK1i5NFJwKs8.jpg",
      alt: "Elegant Wedding Cake"
    },
    {
      src: "https://framerusercontent.com/images/bWdwBqOchHtKOBN6izTe2q9fX7Y.jpg",
      alt: "Multi-tier Wedding Cake"
    },
    {
      src: "https://framerusercontent.com/images/avMVMvlfbzhLiBE5pMj63KqoyY.jpg",
      alt: "Decorated Wedding Cake"
    },
    {
      src: "https://framerusercontent.com/images/lg4WiynyZMq0CMWYVsqK8BkOOS8.jpg",
      alt: "Custom Wedding Cake"
    },
    {
      src: "https://framerusercontent.com/images/q5RiRVuTXEyeXvBl013bDctLUg.jpg",
      alt: "Beautiful Wedding Cake"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % weddingImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + weddingImages.length) % weddingImages.length)
  }

  return (
    <section id="weddings" className="py-20 bg-light-cream">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-12 lg:space-y-0 lg:space-x-12">
          {/* Content */}
          <div className="lg:flex-1 space-y-6 order-2 lg:order-1">
            <div className="flex items-center space-x-2 text-orange mb-4">
              <Heart className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider">Special Occasions</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-orange mb-6 underline decoration-4 underline-offset-4 font-lobster">
              Weddings
            </h2>

            <div className="prose prose-lg text-gray space-y-4">
              <p>
                Yes, we cater for weddings to! If you want the icing on top of your special day, get in touch for a quote or to discuss any ideas.
              </p>

              <p>
                Please note that I no longer sell Fondant Iced Cakes! I am able to create tiered masterpieces similar to the cakes shown below, or frosted cakes such as this one!
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-cream p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-orange" />
                <span>Get in Touch</span>
              </h3>
              
              <div className="space-y-3">
                <p className="text-gray">
                  Email: <a href="mailto:info@teatimecollective.co.uk" className="text-orange hover:underline">info@teatimecollective.co.uk</a>
                </p>
                <p className="text-gray">
                  Phone: <a href="tel:+447765833910" className="text-orange hover:underline">+44 07765 833 910</a>
                </p>
              </div>
            </div>
          </div>

          {/* Wedding Gallery */}
          <div className="lg:flex-1 order-1 lg:order-2">
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange/10 to-cream">
              <Image
                src={weddingImages[currentSlide].src}
                alt={weddingImages[currentSlide].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Previous wedding cake image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Next wedding cake image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/20 rounded-full px-4 py-2">
                <div className="flex space-x-2">
                  {weddingImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WeddingCakes