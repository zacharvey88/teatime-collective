'use client'

import { useState, useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import LoadingSpinner from './ui/loading-spinner'
import { getYearsOfExperienceString } from '@/lib/utils'
import { ReviewsService, Review } from '@/lib/reviewsService'
import { useSettings } from '@/lib/settingsContext'

const Testimonials = () => {
  const [isAnimated, setIsAnimated] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { settings } = useSettings()

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const activeReviews = await ReviewsService.getActiveReviews()
        setReviews(activeReviews)
      } catch (error) {
        // Failed to load reviews - will show fallback content
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [])

  const renderStars = (rating: number) => {
    const brandColor = settings?.primary_color || '#FF6B35' // Fallback to default orange
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className="w-7 h-7 md:w-8 md:h-8"
        style={{
          fill: i < rating ? brandColor : `${brandColor}30`,
          color: i < rating ? brandColor : `${brandColor}30`
        }}
      />
    ))
  }

  // Auto-rotate reviews
  useEffect(() => {
    if (reviews.length <= 1) return

    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [reviews.length])

  // Intersection Observer for animations
  useEffect(() => {
    const animationObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAnimated(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      animationObserver.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        animationObserver.unobserve(sectionRef.current);
      }
    };
  }, []);


  return (
    <section className="py-12 md:py-20 pb-16 md:pb-24 bg-cream" ref={sectionRef}>
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">

          {loading ? (
            <div className="py-16">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="h-8 bg-gray-200 rounded mx-auto mb-4 max-w-2xl"></div>
                <div className="h-6 bg-gray-200 rounded mx-auto max-w-md"></div>
              </div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="relative">
              <div className={`min-h-[200px] flex items-center justify-center transition-all duration-1000 ${isAnimated ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
                <div className="w-full">
                                      <div className="flex justify-center mb-8">
                      {renderStars(reviews[currentReviewIndex].rating)}
                    </div>
                  
                                      <blockquote className="text-lg md:text-xl lg:text-2xl text-gray leading-relaxed mb-6 text-balance">
                      {reviews[currentReviewIndex].review_text}
                    </blockquote>
                  
                  <cite className="text-xl text-light-gray font-medium">
                    - {reviews[currentReviewIndex].customer_name}
                  </cite>
                </div>
              </div>




            </div>
          ) : (
            <div className="relative">
              <blockquote className={`text-2xl md:text-3xl lg:text-4xl font-medium text-gray leading-relaxed mb-8 text-balance transition-all duration-1000 ${isAnimated ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
                "Huge thank you to all of our customers, also my family, friends and staff for all of your support."
              </blockquote>
              
              <cite className={`text-lg text-light-gray font-medium transition-all duration-1000 delay-300 ${isAnimated ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
                — Kathryn, Founder of Teatime Collective
              </cite>
            </div>
          )}

          {/* Additional testimonial elements */}
          {/* <div className={`mt-16 flex flex-row flex-wrap gap-4 transition-all duration-1000 delay-400 ${isAnimated ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center flex-1 min-w-[100px]">
              <div className="text-3xl font-bold text-orange mb-2">4.8★</div>
              <p className="text-gray">Google Rating</p>
            </div>
            
            <div className="text-center flex-1 min-w-[100px]">
              <div className="text-3xl font-bold text-orange mb-2">{getYearsOfExperienceString()}</div>
              <p className="text-gray">Years Experience</p>
            </div>
            
            <div className="text-center flex-1 min-w-[100px]">
              <div className="text-3xl font-bold text-orange mb-2">100%</div>
              <p className="text-gray">Vegan</p>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}

export default Testimonials