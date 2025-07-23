'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Music, Users, Calendar, Recycle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient';
const supabaseUrl = 'https://kntdzvkvfyoiwjfnlvgg.supabase.co';

const Festivals = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [festivalImages, setFestivalImages] = useState<{ src: string; alt: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const { data, error } = await supabase.storage.from('festivals').list('', { limit: 100 });
      if (error) {
        setFestivalImages([]);
        setLoading(false);
        return;
      }
      const images = (data?.filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i)) || []).map(file => ({
        src: `${supabaseUrl}/storage/v1/object/public/festivals/${file.name}`,
        alt: file.name.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '')
      }));
      setFestivalImages(images);
      setLoading(false);
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
    if (festivalImages.length <= 1 || isPaused || !isInView) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % festivalImages.length);
    }, 4000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [festivalImages.length, isPaused, isInView]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % festivalImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + festivalImages.length) % festivalImages.length)
  }

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <section id="festivals" className="py-20 bg-cream">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-12 lg:space-y-0 lg:space-x-12">
          {/* Festival Gallery */}
          <div className="lg:flex-1">
            <div 
              ref={carouselRef}
              className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange/10 to-light-cream"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray">Loading images...</div>
              ) : festivalImages.length > 0 ? (
                <Image
                  src={festivalImages[currentSlide].src}
                  alt={festivalImages[currentSlide].alt}
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
                aria-label="Previous festival image"
                disabled={festivalImages.length === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Next festival image"
                disabled={festivalImages.length === 0}
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
                      disabled={festivalImages.length === 0}
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
              <span className="text-sm font-medium uppercase tracking-wider">Festivals and Events</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-orange mb-6 underline decoration-4 underline-offset-4 font-lobster">
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
            <div className="flex flex-row flex-wrap gap-6 mt-8">
              <div className="text-center bg-white p-4 rounded-xl flex-1 min-w-[120px] shadow-lg border border-orange/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange" />
                  <span className="text-2xl font-bold text-dark">13</span>
                </div>
                <p className="text-sm text-gray">Years Experience</p>
              </div>
              
              <div className="text-center bg-white p-4 rounded-xl flex-1 min-w-[120px] shadow-lg border border-orange/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-orange" />
                  <span className="text-2xl font-bold text-dark">50+</span>
                </div>
                <p className="text-sm text-gray">Events Catered</p>
              </div>

              <div className="text-center bg-white p-4 rounded-xl flex-1 min-w-[120px] shadow-lg border border-orange/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Recycle className="w-5 h-5 text-orange" />
                  <span className="text-2xl font-bold text-dark">100%</span>
                </div>
                <p className="text-sm text-gray">Eco-Concious</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Festivals