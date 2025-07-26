'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { MarketDatesService, MarketDate } from '@/lib/marketDatesService'

const Markets = () => {
  const [markets, setMarkets] = useState<MarketDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    loadMarketDates()
  }, [])

  const loadMarketDates = async () => {
    try {
      setLoading(true)
      const marketDates = await MarketDatesService.getActiveMarketDates()
      setMarkets(marketDates)
    } catch (err: any) {
      setError(err.message || 'Failed to load market dates')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="markets" className="py-12 md:py-20 bg-cream">
      <div className="section-container">
        <div className="text-center mb-8 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-orange mb-4 underline decoration-4 underline-offset-4 font-lobster">
            Market Dates
          </h2>
          <p className="text-lg text-gray mb-6">Find us at Makers Markets most weekends across Greater Manchester</p>
        </div>

        {/* Market Cards */}
        <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 w-full">
              <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading markets...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
              <p className="text-red-600">{error}</p>
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-12 w-full">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No upcoming markets</h3>
              <p className="text-gray-500">Check back soon for new market dates!</p>
            </div>
          ) : (
            markets.slice(0, 6).map((market, index) => {
              const link = marketLinks.find(l => l.location === market.location)
              const formattedDate = new Date(market.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
              
              return (
                <div
                  key={market.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col h-full min-w-[200px] max-w-[220px]"
                  role="button"
                  tabIndex={0}
                  onClick={() => { if (link) window.open(link.url, '_blank', 'noopener') }}
                  onKeyDown={e => { if (e.key === 'Enter' && link) window.open(link.url, '_blank', 'noopener') }}
                >
                  {/* Top section with icon and location */}
                  <div className="p-4 pb-3 flex flex-col items-center">
                    <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <MapPin className="w-5 h-5 text-orange" />
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray text-center leading-tight">
                      {market.location}
                    </h3>
                  </div>

                  {/* Bottom section with date - always at bottom */}
                  <div className="mt-auto p-4 pt-2">
                    <div className="bg-orange/5 rounded-lg p-3 group-hover:bg-orange/10 transition-colors duration-200">
                      <div className="flex items-center justify-center space-x-2">
                        <Calendar className="w-4 h-4 text-orange flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray whitespace-nowrap">{formattedDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center mt-2 text-orange text-xs font-medium">
                      <span>View Market Info</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export default Markets