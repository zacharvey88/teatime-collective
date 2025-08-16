'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'

const OurStory = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Local timeline images stored in public/images folder
  const timelineImages = [
    { src: '/images/timeline-01.jpg', alt: 'Hulme Cafe Opens' },
    { src: '/images/timeline-02.jpg', alt: 'Cafe Closes' },
    { src: '/images/timeline-03.png', alt: 'Rockers' },
    { src: '/images/timeline-04.jpg', alt: 'Cake Delivery' },
    { src: '/images/timeline-05.jpg', alt: 'Markets' }
  ]

  const timelineEvents = [
    {
      month: 'SEP',
      year: '2013',
      tagline: 'There will be cake',
      title: 'Hulme Cafe Opens',
      description: "I never intended it to be a cafe, it just kind of happened. After a year catering as festivals it had come to the end of season and I had just taken on a permanent space as a prep kitchen, after I had outgrown my house. It started off as a Vegan Ice Cream, Cake and Coffee Shop; to help with the rent during the winter, we where already supplying cakes and catering at festivals. There was big demand for a menu, so we decided to expand and took on our quirky and popular shipping container, so we had a dining room.",
      image: timelineImages[0]?.src
    },
    {
      month: 'DEC',
      year: '2017',
      tagline: 'All good things',
      title: 'Cafe Closes',
      description: "After 4 lovely years it was no longer making enough money to keep it open and we sadly had to close the doors in December 2017.",
      image: timelineImages[1]?.src
    },
    {
      month: 'FEB',
      year: '2018',
      tagline: 'Short and sweet',
      title: 'Rockers',
      description: "A few days after announcing we where closing, Kathy asked if we would like to open a cake shop; inside her shop, Rockers, in the Northern Quarter. Which we did, in February 2018, and we closed 1st September 2018 for the same reason we closed the cafe. I took the winter off and the following year spent the summer working the festival circuit.",
      image: timelineImages[2]?.src
    },
    {
      month: 'MAR',
      year: '2020',
      tagline: 'A new beginning',
      title: 'Cake Delivery',
      description: "When the pandemic started, I began making a weekly cake box, that I delivered every Saturday throughout lockdown. This is where Teatime really took off, some weeks I was delivering over 100 boxes a week!",
      image: timelineImages[3]?.src
    },
    {
      month: 'MAR',
      year: '2021',
      tagline: 'At a stall near you',
      title: 'Markets',
      description: "After lockdown ended cake box sales slumped and it was then I decided to bring my cakes to the markets instead, and I guess, well, here we are now. We trade at 7 different makers markets in Manchester every month, you can find us at a few festivals still in the summer and I make cakes to order!",
      image: timelineImages[4]?.src
    }
  ]

  // Timeline section scroll-based line growth effect
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return
      
      const timelineRect = timelineRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate when timeline section enters and exits viewport
      const timelineTop = timelineRect.top
      const timelineHeight = timelineRect.height
      
      // Timeline is fully in view when top is 0 or negative and bottom is positive
      const timelineBottom = timelineTop + timelineHeight
      
      // Calculate progress within the timeline section (0-100)
      let percentage = 0
      
      if (timelineTop <= windowHeight && timelineBottom >= 0) {
        // Timeline is partially or fully visible
        const visibleHeight = Math.min(timelineHeight, windowHeight - timelineTop)
        const totalScrollDistance = timelineHeight * 0.7 + windowHeight // Reduced multiplier for faster growth
        const currentScrollDistance = windowHeight - timelineTop
        
        // Delay the start so line doesn't appear before first circle
        const delayedScrollDistance = Math.max(0, currentScrollDistance - 50) // 50px delay
        
        percentage = Math.min(100, Math.max(0, (delayedScrollDistance / totalScrollDistance) * 100))
      } else if (timelineTop > windowHeight) {
        // Timeline hasn't entered viewport yet
        percentage = 0
      } else if (timelineBottom < 0) {
        // Timeline has completely exited viewport
        percentage = 100
      }
      
      setScrollPercentage(percentage)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    
    // Initial calculation
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleItems(prev => new Set(Array.from(prev).concat(index)))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const timelineItems = timelineRef.current?.querySelectorAll('[data-index]')
    timelineItems?.forEach(item => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="story" className="pt-20 md:pt-20 pb-12 md:pb-20 bg-light-cream">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-orange mb-4 underline decoration-4 underline-offset-4 font-lobster">
            Our Story
          </h2>
        </div>

                   {/* Timeline */}
           <div ref={timelineRef} className="relative max-w-7xl mx-auto">
             {/* Center connecting line - grows with timeline scroll */}
             <div className="hidden lg:block absolute left-1/2 w-1 bg-orange transform -translate-x-1/2 transition-all duration-300 ease-out"
                  style={{
                    top: '10rem', /* Start after first timeline item spacing */
                    height: scrollPercentage > 0 ? `${Math.max(0, (scrollPercentage / 100) * (timelineRef.current?.offsetHeight || 800) - 200)}px` : '0px', /* Only visible when growing */
                    maxHeight: 'calc(100% - 20rem)' /* Maximum height constraint */
                  } as React.CSSProperties}>
             </div>
          
          {timelineEvents.map((event, index) => (
            <div 
              key={index} 
              data-index={index}
              className={`relative mb-20 last:mb-0 transition-all duration-1000 ease-out ${
                visibleItems.has(index) 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10'
              }`}
            >
              {/* Mobile Layout */}
              <div className="lg:hidden">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="bg-orange text-white rounded-full w-20 h-20 flex flex-col items-center justify-center text-center shadow-lg mb-4">
                    <div className="text-sm font-medium">{event.month}</div>
                    <div className="text-base font-bold">{event.year}</div>
                  </div>
                  <div>
                    <p className="text-orange font-medium text-sm mb-1">{event.tagline}</p>
                    <h3 className="text-xl font-bold text-gray">{event.title}</h3>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                  </div>
                  <p className="text-gray leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex items-center">
                {index % 2 === 0 ? (
                  <>
                    {/* Left Content (Text) */}
                    <div className="flex-1 pr-12 text-right">
                      <div className="max-w-md ml-auto">
                        <p className="text-orange font-medium text-sm mb-2">{event.tagline}</p>
                        <h3 className="text-2xl font-bold text-gray mb-4">{event.title}</h3>
                        <p className="text-gray leading-relaxed">{event.description}</p>
                      </div>
                    </div>

                    {/* Center Date Circle */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="bg-orange text-white rounded-full w-20 h-20 flex flex-col items-center justify-center text-center shadow-lg">
                        <div className="text-sm font-medium">{event.month}</div>
                        <div className="text-lg font-bold">{event.year}</div>
                      </div>
                    </div>

                    {/* Right Content (Image) */}
                    <div className="flex-1 pl-12">
                      <div className="relative w-3/4 h-64 rounded-xl overflow-hidden shadow-lg transition-transform duration-500 hover:scale-105">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 400px"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left Content (Image) */}
                    <div className="flex-1 pr-12">
                      <div className="relative w-3/4 ml-auto h-64 rounded-xl overflow-hidden shadow-lg transition-transform duration-500 hover:scale-105">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 400px"
                        />
                      </div>
                    </div>

                    {/* Center Date Circle */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="bg-orange text-white rounded-full w-20 h-20 flex flex-col items-center justify-center text-center shadow-lg">
                        <div className="text-sm font-medium">{event.month}</div>
                        <div className="text-lg font-bold">{event.year}</div>
                      </div>
                    </div>

                    {/* Right Content (Text) */}
                    <div className="flex-1 pl-12 text-left">
                      <div className="max-w-md mr-auto">
                        <p className="text-orange font-medium text-sm mb-2">{event.tagline}</p>
                        <h3 className="text-2xl font-bold text-gray mb-4">{event.title}</h3>
                        <p className="text-gray leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OurStory