'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Shield, Settings } from 'lucide-react'

interface CookieConsentProps {
  onAccept: () => void
  onDecline: () => void
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setIsVisible(false)
    onAccept()
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setIsVisible(false)
    onDecline()
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Cookie Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center">
              <Cookie className="w-5 h-5 text-orange" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray mb-2">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This website uses cookies to improve functionality and performance. 
                  By continuing to use this site, you consent to our use of cookies.
                </p>

                {/* Details Section */}
                {showDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Cookie Information
                    </h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>
                        <strong>Essential Cookies:</strong> Required for the website to function properly. 
                        These cannot be disabled.
                      </p>
                      <p>
                        <strong>Analytics Cookies:</strong> Help us understand how visitors use our website 
                        to improve our services. These are optional.
                      </p>
                      <p>
                        <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements. 
                        These are optional.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAccept}
                    className="px-6 py-2 bg-orange text-white rounded-lg font-medium hover:bg-orange-900 transition-colors duration-200"
                  >
                    Accept All Cookies
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                  >
                    Decline Non-Essential
                  </button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-6 py-2 text-orange font-medium hover:bg-orange/5 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {showDetails ? 'Hide Details' : 'Learn More'}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDecline}
                className="flex-shrink-0 w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Close cookie notice"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 