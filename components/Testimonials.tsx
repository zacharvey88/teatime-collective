'use client'

import { Quote } from 'lucide-react'
import { getYearsOfExperienceString } from '@/lib/utils'

const Testimonials = () => {
  return (
    <section className="py-12 md:py-20 pb-16 md:pb-24 bg-cream">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <Quote className="w-16 h-16 text-orange/20 mx-auto mb-6" />
            
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium text-dark leading-relaxed mb-8 text-balance">
              "Huge thank you to all of our customers, also my family, friends and staff for all of your support."
            </blockquote>
            
            <cite className="text-lg text-light-gray font-medium">
              — Kathryn, Founder of Teatime Collective
            </cite>
          </div>

          {/* Additional testimonial elements */}
          <div className="mt-16 flex flex-row flex-wrap gap-4">
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
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials