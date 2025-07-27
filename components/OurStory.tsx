'use client'

import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'

const OurStory = () => {
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
        <div className="max-w-4xl mx-auto relative">
          {/* Connecting line for mobile */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-orange/30"></div>
          
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative flex flex-col lg:flex-row items-center lg:items-start mb-16 last:mb-0">
              {/* Mobile Layout: Date Circle with Heading/Subheading on one side */}
              <div className="lg:hidden w-full flex items-center justify-center mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 relative z-10 mr-4">
                    <div className="bg-orange text-white rounded-full w-16 h-16 flex flex-col items-center justify-center text-center shadow-lg">
                      <div className="text-xs font-medium">{event.month}</div>
                      <div className="text-sm font-bold">{event.year}</div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-orange font-medium text-sm">{event.tagline}</p>
                    <h3 className="text-xl font-bold text-dark">{event.title}</h3>
                  </div>
                </div>
              </div>

              {/* Desktop Layout: Original structure */}
              <div className="hidden lg:flex flex-shrink-0 flex-col items-start mb-0 mr-8 relative z-10">
                <div className="bg-orange text-white rounded-full w-16 h-16 flex flex-col items-center justify-center text-center shadow-lg">
                  <div className="text-xs font-medium">{event.month}</div>
                  <div className="text-sm font-bold">{event.year}</div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 lg:flex items-center lg:space-x-8 space-y-6 lg:space-y-0 text-center lg:text-left">
                <div className="lg:flex-1">
                  <div className="mb-4 lg:block hidden">
                    <p className="text-orange font-medium mb-2">{event.tagline}</p>
                    <h3 className="text-2xl lg:text-3xl font-bold text-dark mb-4">{event.title}</h3>
                  </div>
                  <p className="text-gray leading-relaxed">{event.description}</p>
                </div>

                {/* Image */}
                <div className="lg:flex-shrink-0">
                  <div className="relative w-full lg:w-48 h-48 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.6)]">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 192px"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OurStory