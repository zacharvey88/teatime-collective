'use client'

import { Calendar, MapPin } from 'lucide-react'

const MarketDates = () => {
  const markets = [
    { location: 'Chorlton', date: '27 July 2025' },
    { location: 'Northern Quarter', date: '20 July 2025' },
    { location: 'Stockport', date: '19 July 2025' },
    { location: 'Didsbury', date: '19 July 2025' },
    { location: 'Lowry', date: '20 July 2025' },
    { location: 'Chorlton', date: '19 July 2025' }
  ]

  return (
    <section id="markets" className="py-20 bg-cream">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-orange mb-4 underline decoration-4 underline-offset-4">
            Market Dates
          </h2>
        </div>

        {/* Market Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 max-w-6xl mx-auto">
          {markets.map((market, index) => (
            <div
              key={index}
              className="bg-light-cream p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex flex-col items-center space-y-3">
                <MapPin className="w-8 h-8 text-orange group-hover:scale-110 transition-transform duration-200" />
                
                <h3 className="text-lg font-semibold text-gray">
                  {market.location}
                </h3>
                
                <div className="flex items-center space-x-2 text-dark font-bold">
                  <Calendar className="w-4 h-4" />
                  <span className="text-lg">{market.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray mb-6">
            Find us at these wonderful markets across Manchester
          </p>
          <a 
            href="tel:+447765833910" 
            className="inline-flex items-center space-x-2 text-orange hover:text-orange/80 font-semibold transition-colors"
          >
            <span>Call for more information: +44 07765 833 910</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default MarketDates