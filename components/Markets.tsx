'use client'

import { Calendar, MapPin } from 'lucide-react'

const Markets = () => {
  const markets = [
    { location: 'Chorlton', date: '27 July 2025' },
    { location: 'Northern Quarter', date: '20 July 2025' },
    { location: 'Stockport', date: '19 July 2025' },
    { location: 'Didsbury', date: '19 July 2025' },
    { location: 'Lowry', date: '20 July 2025' },
    { location: 'Chorlton', date: '19 July 2025' }
  ]

  const marketLinks = [
    { location: 'Spinningfields', url: 'https://www.themakersmarket.co.uk/pages/spinningfields-makers-market' },
    { location: 'Northern Quarter', url: 'https://www.themakersmarket.co.uk/pages/northern-quarter-makers-market' },
    { location: 'Stockport', url: 'https://www.themakersmarket.co.uk/pages/stockport-makers-market' },
    { location: 'Didsbury', url: 'https://www.themakersmarket.co.uk/pages/west-didsbury-makers-market' },
    { location: 'Lowry', url: 'https://www.themakersmarket.co.uk/pages/quayside-makers-market' },
    { location: 'Chorlton', url: 'https://www.themakersmarket.co.uk/pages/chorlton-makers-market' }
  ]

  return (
    <section id="markets" className="py-20 bg-cream">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-orange mb-4 underline decoration-4 underline-offset-4 font-lobster">
            Market Dates
          </h2>
          <p className="text-lg text-gray mb-6">Find us at Makers Markets most weekends across Greater Manchester</p>
        </div>

        {/* Market Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 max-w-6xl mx-auto">
          {markets.map((market, index) => {
            const link = marketLinks.find(l => l.location === market.location);
            return (
            <div
              key={index}
              className="bg-light-cream p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => { if (link) window.open(link.url, '_blank', 'noopener'); }}
              onKeyDown={e => { if (e.key === 'Enter' && link) window.open(link.url, '_blank', 'noopener'); }}
            >
              <div className="flex flex-col items-center space-y-3">
                <MapPin className="w-8 h-8 text-orange group-hover:scale-110 transition-transform duration-200" />
                
                <h3 className="text-lg font-semibold text-gray">
                  {market.location}
                </h3>
                
                <div className="flex items-center space-x-2 text-dark font-bold whitespace-nowrap">
                  <Calendar className="w-4 h-4" />
                  <span className="text-lg whitespace-nowrap">{market.date}</span>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  )
}

export default Markets