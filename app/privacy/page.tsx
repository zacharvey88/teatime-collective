'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { CookieManager } from '@/lib/cookieManager'
import { useState, useEffect } from 'react'

export default function PrivacyPage() {
  const [preferences, setPreferences] = useState(CookieManager.getPreferences())

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
  }

  return (
    <div className="min-h-screen bg-light-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-orange mb-4 font-lobster">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray">
              How we collect, use, and protect your information
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Teatime Collective ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, and safeguard your information when 
                you visit our website or use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray mb-2">Personal Information</h3>
                  <p className="text-gray-600">
                    When you place an order or contact us, we may collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                    <li>Name and contact details (email, phone number)</li>
                    <li>Delivery address and preferences</li>
                    <li>Order history and preferences</li>
                    <li>Communication records</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray mb-2">Website Usage Information</h3>
                  <p className="text-gray-600">
                    We may collect information about how you use our website, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                    <li>Pages visited and time spent</li>
                    <li>Browser type and device information</li>
                    <li>IP address and location data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookie Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Cookie Policy</h2>
              <p className="text-gray-600 mb-6">
                We use cookies to enhance your browsing experience and improve our website functionality.
              </p>

              {/* Cookie Preferences */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray mb-4">Cookie Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
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

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
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

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
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

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Reset Preferences
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray mb-2">Types of Cookies We Use</h3>
                  <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                    <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                    <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders</li>
                <li>Improve our website and services</li>
                <li>Send you relevant updates and offers (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Data Protection</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. Your data 
                is stored securely and we only retain it for as long as necessary to fulfill 
                the purposes outlined in this policy.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Your Rights</h2>
              <p className="text-gray-600 mb-4">
                Under GDPR, you have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-orange/5 rounded-lg p-4 border border-orange/20">
                <p className="text-gray-600">
                  <strong>Email:</strong> <a href="mailto:info@teatimecollective.co.uk" className="text-orange hover:underline">info@teatimecollective.co.uk</a>
                </p>
                <p className="text-gray-600">
                  <strong>Phone:</strong> <a href="tel:+447765833910" className="text-orange hover:underline">+44 07765 833 910</a>
                </p>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray mb-4">Updates to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 