'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Heart, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient';

const supabaseUrl = 'https://kntdzvkvfyoiwjfnlvgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudGR6dmt2ZnlvaXdqZm5sdmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDE2MTUsImV4cCI6MjA2ODYxNzYxNX0.-8oTxt7JZ7eJuGfELaesTGqjugJiO5S15ic4Vhlntqc';

const Weddings = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [weddingImages, setWeddingImages] = useState<{ src: string; alt: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const { data, error } = await supabase.storage.from('weddings').list('', { limit: 100 });
      if (error) {
        setWeddingImages([]);
        setLoading(false);
        return;
      }
      const images = (data?.filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i)) || []).map(file => ({
        src: `${supabaseUrl}/storage/v1/object/public/weddings/${file.name}`,
        alt: file.name.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '')
      }));
      setWeddingImages(images);
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
    if (weddingImages.length <= 1 || isPaused || !isInView) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % weddingImages.length);
    }, 5000);

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
                Yes, we cater for weddings and other special occasions too! And that doesn't have to mean just one magnificent tiered cake; we also do cake buffets! So for the cherry on top of your day, get in touch for a quote or to discuss any ideas.
              </p>

              <p>
                Please note that I no longer sell Fondant Iced Cakes. I am able to create tiered masterpieces similar to the cakes shown below, or frosted cakes such as this one!
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
            <div 
              ref={carouselRef}
              className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-orange/10 to-cream"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray">Loading images...</div>
              ) : weddingImages.length > 0 ? (
                <Image
                  src={weddingImages[currentSlide].src}
                  alt={weddingImages[currentSlide].alt}
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