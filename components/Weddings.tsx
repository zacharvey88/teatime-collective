'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Heart, Mail } from 'lucide-react'
import { FrontendImageService, FrontendImageItem } from '@/lib/frontendImageService'

const Weddings = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [weddingImages, setWeddingImages] = useState<FrontendImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const images = await FrontendImageService.getWeddingImages();
        setWeddingImages(images);
      } catch (error) {
        console.error('Failed to fetch wedding images:', error);
        setWeddingImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Intersection Observer for viewport detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.3, // Trigger when 30% of the carousel is visible
        rootMargin: '0px 0px -100px 0px' // Start a bit before the carousel comes into view
      }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (weddingImages.length <= 1 || isPaused || !isInView) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % weddingImages.length);
    }, 4000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [weddingImages.length, isPaused, isInView]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % weddingImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + weddingImages.length) % weddingImages.length)
  }

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <section id="weddings" className="py-12 md:py-20 bg-light-cream">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-12">
          {/* Content */}
          <div className="lg:flex-1 lg:max-w-[50%] space-y-6 order-1 lg:order-1">
            <div className="hidden lg:flex items-center justify-center lg:justify-start space-x-2 text-orange mb-4">
              <Heart className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider">Special Occasions</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-orange mb-6 underline decoration-4 underline-offset-4 font-lobster text-center lg:text-left">
              Weddings
            </h2>

            {/* Wedding Gallery - Mobile Only */}
            <div className="lg:hidden w-full mb-6">
              <div 
                ref={carouselRef}
                className="relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-orange/10 to-cream"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray">Loading images...</div>
                ) : weddingImages.length > 0 ? (
                  <Image
                    src={weddingImages[currentSlide].url}
                    alt={weddingImages[currentSlide].alt_text}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray">No images found.</div>
                )}

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                  aria-label="Previous wedding cake image"
                  disabled={weddingImages.length === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                  aria-label="Next wedding cake image"
                  disabled={weddingImages.length === 0}
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
                        disabled={weddingImages.length === 0}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-lg text-gray space-y-4">
              <p>
                Yes, we cater for weddings and other special occasions too! And that doesn't have to mean just one magnificent tiered cake; we also do cake buffets! So for the cherry on top of your day, get in touch for a quote or to discuss any ideas.
              </p>

              <p>
                Please note that I no longer sell Fondant Iced Cakes. I am able to create tiered masterpieces similar to the cakes shown below, or frosted cakes such as this one!
              </p>
            </div>

            {/* Wedding Services */}
            <div className="flex flex-row flex-wrap gap-4">
              <div className="bg-white p-4 rounded-xl shadow-md text-center flex-1 min-w-[120px]">
                <div className="w-8 h-8 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-4 h-4 text-orange" />
                </div>
                <h4 className="font-semibold text-dark mb-1">Tiered Cakes</h4>
                <p className="text-sm text-gray">Elegant multi-tiered masterpieces</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-md text-center flex-1 min-w-[120px]">
                <div className="w-8 h-8 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange font-bold text-lg">🍰</span>
                </div>
                <h4 className="font-semibold text-dark mb-1">Cake Buffets</h4>
                <p className="text-sm text-gray">Variety of smaller cakes</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-md text-center flex-1 min-w-[120px]">
                <div className="w-8 h-8 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange font-bold text-lg">✨</span>
                </div>
                <h4 className="font-semibold text-dark mb-1">Custom Designs</h4>
                <p className="text-sm text-gray">Personalized to your theme</p>
              </div>
            </div>
          </div>

          {/* Wedding Gallery - Desktop Only */}
          <div className="hidden lg:block lg:flex-1 w-full lg:order-2">
            <div 
              className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange/10 to-cream"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray">Loading images...</div>
              ) : weddingImages.length > 0 ? (
                <Image
                  src={weddingImages[currentSlide].url}
                  alt={weddingImages[currentSlide].alt_text}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray">No images found.</div>
              )}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Previous wedding cake image"
                disabled={weddingImages.length === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Next wedding cake image"
                disabled={weddingImages.length === 0}
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
                      disabled={weddingImages.length === 0}
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

export default Weddings