'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { CookieManager } from '@/lib/cookieManager'
import { useState, useEffect } from 'react'
import { Cookie, Shield, Settings } from 'lucide-react'

export default function CookiesPage() {
  const [preferences, setPreferences] = useState(CookieManager.getPreferences())
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Show the banner when this page loads
    setShowBanner(true)
  }, [])

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    const newPreferences = {
      ...preferences,
      [type]: !preferences[type]
    }
    setPreferences(newPreferences)
    CookieManager.setPreferences(newPreferences)
  }

  const handleReset = () => {
    CookieManager.reset()
    setPreferences(CookieManager.getPreferences())
    setShowBanner(true) // Show banner again after reset
  }

  const handleAccept = () => {
    CookieManager.acceptAll()
    setPreferences(CookieManager.getPreferences())
    setShowBanner(false)
  }

  const handleDecline = () => {
    CookieManager.declineNonEssential()
    setPreferences(CookieManager.getPreferences())
    setShowBanner(false)
  }

  return (
    <div className="min-h-screen bg-light-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-orange mb-4 font-lobster">
              Cookie Settings
            </h1>
            <p className="text-lg text-gray">
              Manage your cookie preferences and privacy settings
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">About Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                understanding how you use our site.
              </p>
            </section>

            {/* Cookie Banner */}
            {showBanner && (
              <section className="bg-orange/5 rounded-xl p-6 border border-orange/20">
                <h3 className="text-lg font-semibold text-gray mb-4 flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-orange" />
                  Cookie Consent
                </h3>
                <p className="text-gray-600 mb-4">
                  Please choose your cookie preferences below. You can change these settings at any time.
                </p>
                
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
                </div>
              </section>
            )}

            {/* Cookie Preferences */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Cookie Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray">Essential Cookies</h4>
                    <p className="text-sm text-gray-600">Required for website functionality</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.essential}
                      disabled
                      className="w-4 h-4 text-orange bg-gray-100 border-gray-300 rounded focus:ring-orange"
                    />
                    <span className="ml-2 text-sm text-gray-500">Always enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">Help us understand website usage</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                      className="w-4 h-4 text-orange bg-gray-100 border-gray-300 rounded focus:ring-orange"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">Used for targeted advertising</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                      className="w-4 h-4 text-orange bg-gray-100 border-gray-300 rounded focus:ring-orange"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset All Preferences
                </button>
              </div>
            </section>

            {/* Cookie Types */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Types of Cookies We Use</h2>
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Essential Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are necessary for the website to function properly. They cannot be disabled.
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Session management</li>
                    <li>Security features</li>
                    <li>Basic functionality</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    Analytics Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies help us understand how visitors use our website to improve our services.
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Page visit statistics</li>
                    <li>User behavior analysis</li>
                    <li>Website performance metrics</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray mb-2 flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-purple-600" />
                    Marketing Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are used to deliver relevant advertisements and track marketing campaigns.
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Ad personalization</li>
                    <li>Campaign tracking</li>
                    <li>Social media integration</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Managing Your Cookies</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray mb-2">Browser Settings</h3>
                  <p className="text-gray-600 mb-2">
                    You can control cookies through your browser settings:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 ml-4">
                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                    <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray mb-2">Third-Party Opt-Out</h3>
                  <p className="text-gray-600">
                    You can also opt out of third-party cookies through industry organizations like the 
                    <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline ml-1">
                      Digital Advertising Alliance
                    </a>.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Questions About Cookies?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="bg-orange/5 rounded-lg p-4 border border-orange/20">
                <p className="text-gray-600">
                  <strong>Email:</strong> <a href="mailto:info@teatimecollective.co.uk" className="text-orange hover:underline">info@teatimecollective.co.uk</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 