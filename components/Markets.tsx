'use client'

import { Calendar, MapPin, ExternalLink } from 'lucide-react'

const Markets = () => {
  const markets = [
    { location: 'Chorlton', date: '27 July 2025' },
    { location: 'Northern Quarter', date: '20 July 2025' },
    { location: 'Stockport', date: '29 July 2025' },
    { location: 'Didsbury', date: '19 July 2025' },
    { location: 'Lowry', date: '20 July 2025' },
    { location: 'Chorlton', date: '19 July 2025' },
    { location: 'Spinningfields', date: '26 July 2025' },
    { location: 'Altrincham', date: '25 July 2025' },
    { location: 'Wilmslow', date: '24 July 2025' },
    { location: 'Knutsford', date: '23 July 2025' },
    { location: 'Macclesfield', date: '22 July 2025' },
    { location: 'Bury', date: '21 July 2025' }
  ]

  const marketLinks = [
    { location: 'Spinningfields', url: 'https://www.themakersmarket.co.uk/pages/spinningfields-makers-market' },
    { location: 'Northern Quarter', url: 'https://www.themakersmarket.co.uk/pages/northern-quarter-makers-market' },
    { location: 'Stockport', url: 'https://www.themakersmarket.co.uk/pages/stockport-makers-market' },
    { location: 'Didsbury', url: 'https://www.themakersmarket.co.uk/pages/west-didsbury-makers-market' },
    { location: 'Lowry', url: 'https://www.themakersmarket.co.uk/pages/quayside-makers-market' },
    { location: 'Chorlton', url: 'https://www.themakersmarket.co.uk/pages/chorlton-makers-market' },
    { location: 'Altrincham', url: 'https://www.themakersmarket.co.uk/pages/altrincham-makers-market' },
    { location: 'Wilmslow', url: 'https://www.themakersmarket.co.uk/pages/wilmslow-makers-market' },
    { location: 'Knutsford', url: 'https://www.themakersmarket.co.uk/pages/knutsford-makers-market' },
    { location: 'Macclesfield', url: 'https://www.themakersmarket.co.uk/pages/macclesfield-makers-market' },
    { location: 'Bury', url: 'https://www.themakersmarket.co.uk/pages/bury-makers-market' }
  ]

  // Filter markets to show only today or future dates
  const today = new Date('2025-07-23')
  const filteredMarkets = markets.filter(market => {
    const marketDate = new Date(market.date)
    return marketDate >= today
  })

  return (
    <section id="markets" className="py-20 bg-cream">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-orange mb-4 underline decoration-4 underline-offset-4 font-lobster">
            Market Dates
          </h2>
          <p className="text-lg text-gray mb-6">Find us at Makers Markets most weekends across Greater Manchester</p>
        </div>

        {/* Market Cards */}
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {filteredMarkets.slice(0, 6).map((market, index) => {
            const link = marketLinks.find(l => l.location === market.location)
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-orange/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer flex flex-col h-full"
                role="button"
                tabIndex={0}
                onClick={() => { if (link) window.open(link.url, '_blank', 'noopener') }}
                onKeyDown={e => { if (e.key === 'Enter' && link) window.open(link.url, '_blank', 'noopener') }}
              >
                {/* Top section with icon and location */}
                <div className="p-6 pb-4 flex flex-col items-center">
                  <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <MapPin className="w-6 h-6 text-orange" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray text-center leading-tight">
                    {market.location}
                  </h3>
                </div>

                {/* Bottom section with date - always at bottom */}
                <div className="mt-auto p-6 pt-2">
                  <div className="bg-orange/5 rounded-xl p-4 border border-orange/10 group-hover:bg-orange/10 transition-colors duration-200">
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray whitespace-nowrap">{market.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center mt-3 text-orange text-xs font-medium">
                    <span>View Market Info</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Markets