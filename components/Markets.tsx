'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, ExternalLink } from 'lucide-react'
import { MarketDatesService, MarketDate } from '@/lib/marketDatesService'

const Markets = () => {
  const [markets, setMarkets] = useState<MarketDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')



  useEffect(() => {
    loadMarketDates()
  }, [])

  const loadMarketDates = async () => {
    try {
      setLoading(true)
      const marketDates = await MarketDatesService.getActiveMarketDates()
      
      // Ensure we always show an even number of markets for balanced rows
      let displayCount = marketDates.length
      if (displayCount % 2 !== 0) {
        // If odd number, reduce by 1 to make it even
        displayCount = Math.max(2, displayCount - 1)
      }
      
      // Limit to maximum of 6 markets (ensures even distribution)
      displayCount = Math.min(displayCount, 6)
      
      setMarkets(marketDates.slice(0, displayCount))
    } catch (err: any) {
      setError(err.message || 'Failed to load market dates')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="markets" className="pt-20 md:pt-20 pb-12 md:pb-20 bg-cream">
      <div className="section-container">
        <div className="text-center mb-8 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-orange mb-4 underline decoration-4 underline-offset-4 font-lobster">
            Market Dates
          </h2>
          <p className="text-lg text-gray mb-6 px-4 sm:px-8 md:px-12 lg:px-16">Find us at Makers Markets most weekends across Greater Manchester</p>
        </div>

        {/* Market Cards */}
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
          {loading ? (
            <div className="flex items-center justify-center py-12 w-full col-span-full">
              <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading markets...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full col-span-full">
              <p className="text-red-600">{error}</p>
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-12 w-full col-span-full">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No upcoming markets</h3>
              <p className="text-gray-500">Check back soon for new market dates!</p>
            </div>
          ) : (
            markets.map((market, index) => {
              const formattedDate = new Date(market.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
              
              // Format times
              const formatTime = (timeString: string) => {
                if (!timeString) return ''
                const time = new Date(`2000-01-01T${timeString}`)
                return time.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })
              }
              
              const startTime = formatTime(market.start_time)
              const endTime = formatTime(market.end_time)
              
              return (
            <div
              key={market.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col w-64 sm:w-80 md:w-72 lg:w-64 xl:w-56 max-w-[280px]"
              role="button"
              tabIndex={0}
              onClick={() => { if (market.url) window.open(market.url, '_blank', 'noopener') }}
              onKeyDown={e => { if (e.key === 'Enter' && market.url) window.open(market.url, '_blank', 'noopener') }}
            >
                  {/* Top section with icon and location */}
                  <div className="p-4 pb-3 flex flex-col items-center">
                    <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <MapPin className="w-5 h-5 text-orange" />
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray text-center leading-tight">
                      {market.name}
                    </h3>
                  </div>

                  {/* Bottom section with date and times - always at bottom */}
                  <div className="mt-auto p-4 pt-2">
                    <div className="bg-orange/5 rounded-lg p-3 group-hover:bg-orange/10 transition-colors duration-200">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-sm font-semibold text-gray whitespace-nowrap">{formattedDate}</span>
                      </div>
                      {startTime && endTime && (
                        <div className="text-center">
                          <span className="text-xs text-gray-600 font-medium">
                            {startTime} - {endTime}
                          </span>
                        </div>
                      )}
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
      </div>
    </section>
  )
}

export default Markets