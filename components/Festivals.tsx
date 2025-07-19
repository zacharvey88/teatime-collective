'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Music, Users, Calendar } from 'lucide-react'

const Festivals = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const festivalImages = [
    {
      src: "https://framerusercontent.com/images/zYiSrMtw5jPfCCzNQjMUo5qGRZE.jpg",
      alt: "Vegan Fair Cakes"
    },
    {
      src: "https://framerusercontent.com/images/AI3Q4AfZU8JfXCg9YXGjXPyqTw.jpg",
      alt: "Parklife Festival"
    },
    {
      src: "https://framerusercontent.com/images/w39weG4J9NEXUw37lp2zzvRNtI.jpg",
      alt: "Indie Tracks Festival"
    },
    {
      src: "https://framerusercontent.com/images/QaZnrKdqgt9Ibo4m4TIGV72TUVA.jpg",
      alt: "Glastonbury Festival"
    },
    {
      src: "https://framerusercontent.com/images/Z8WnxN3cT9ODp5GaraYCrFg2KDk.jpg",
      alt: "Equinox Festival"
    },
    {
      src: "https://framerusercontent.com/images/2cQxPW0ISAyKt2b9HwLIE9b8c.jpg",
      alt: "Envirolution Festival"
    },
    {
      src: "https://framerusercontent.com/images/6KaYeK6ysCJudi1fBqEBw4Q2wc8.jpg",
      alt: "Dirty Weekend Festival"
    },
    {
      src: "https://framerusercontent.com/images/9XU1SQzXEDdsiYXKUCYq0jtvw.jpg",
      alt: "Festival Catering"
    },
    {
      src: "https://framerusercontent.com/images/UDHpNcaNbf81yif1lXmJTFHB30I.jpg",
      alt: "Carnival Festival"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % festivalImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + festivalImages.length) % festivalImages.length)
  }

  return (
    <section id="festivals" className="py-20 bg-cream">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-12 lg:space-y-0 lg:space-x-12">
          {/* Festival Gallery */}
          <div className="lg:flex-1">
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange/10 to-light-cream">
              <Image
                src={festivalImages[currentSlide].src}
                alt={festivalImages[currentSlide].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Previous festival image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Next festival image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/20 rounded-full px-4 py-2">
                <div className="flex space-x-2">
                  {festivalImages.map((_, index) => (
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

          {/* Content */}
          <div className="lg:flex-1 space-y-6">
            <div className="flex items-center space-x-2 text-orange mb-4">
              <Music className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider">Festival Experience</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-orange mb-6 underline decoration-4 underline-offset-4">
              Festival Catering
            </h2>

            <div className="prose prose-lg text-gray space-y-4">
              <p>
                We have 13 years of festival catering experience, ranging from smaller festivals (up to 500) to Glastonbury. We also cater for food fairs, markets, weddings, corporate events.
              </p>

              <p>
                We have a variety of marquee set ups both 3M and 6M frontage, both indoor and outdoor, to allow us to provide excellent food and service at your event.
              </p>

              <p>
                We use good quality produce, sourced locally where possible and portion size is definitely not an issue! All of our disposable are recyclable!
              </p>

              <p>
                We can also provide crew catering. Please get in touch to discuss bookings.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="text-center bg-light-cream p-4 rounded-xl">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange" />
                  <span className="text-2xl font-bold text-dark">13</span>
                </div>
                <p className="text-sm text-gray">Years Experience</p>
              </div>
              
              <div className="text-center bg-light-cream p-4 rounded-xl">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-orange" />
                  <span className="text-2xl font-bold text-dark">500+</span>
                </div>
                <p className="text-sm text-gray">Events Catered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Festivals