'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'
import { ContactInfoService, ContactInfo } from '@/lib/contactInfoService'
import { useSettings } from '@/lib/settingsContext'
import Image from 'next/image'

const Footer = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    loadContactInfo()
  }, [])

  const loadContactInfo = async () => {
    try {
      setLoading(true)
      const info = await ContactInfoService.getContactInfo()
      setContactInfo(info)
    } catch (error) {
      console.error('Failed to load contact info:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <footer className="bg-light-cream">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Company Info */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
                                        <Image
                            src={settings?.logo_url || "/images/logo.png"}
                            alt="Tea Time Collective Logo"
                            width={60}
                            height={60}
                            className="object-contain"
                          />
              <div>
                <h3 className="text-3xl font-bold text-orange font-lobster">
                  Teatime Collective
                </h3>
                <p className="text-light-gray font-medium font-inter">
                  Delicious Vegan Cakes
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-orange" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-orange" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-orange mt-1" />
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-36"></div>
                    </div>
                  </div>
                </div>
              ) : contactInfo ? (
                <>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-orange" />
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="text-dark hover:text-orange transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-orange" />
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-dark hover:text-orange transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-orange mt-1" />
                    <div className="text-dark">
                      <p>{contactInfo.address_line1}</p>
                      {contactInfo.address_line2 && <p>{contactInfo.address_line2}</p>}
                      {contactInfo.address_line3 && <p>{contactInfo.address_line3}</p>}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-4">
                    {contactInfo.instagram_url && (
                      <a
                        href={contactInfo.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-orange text-white rounded-full hover:bg-orange-900 transition-colors"
                        aria-label="Follow us on Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    
                    {contactInfo.facebook_url && (
                      <a
                        href={contactInfo.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-orange text-white rounded-full hover:bg-orange-900 transition-colors"
                        aria-label="Follow us on Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  <p>Contact information not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:order-2">
            <div className="relative h-64 lg:h-full min-h-[300px] rounded-2xl overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=53.468975508505416%2C-2.2527550241417926&z=14&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Teatime Collective Location"
                className="rounded-2xl"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-orange/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray">
                Site created by{' '}
                <a 
                  href="https://zacharvey.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange hover:underline transition-colors"
                >
                  Zac Harvey
                </a>
                {' '}•{' '}
                © 2025 Teatime Collective. All rights reserved. 
              </p>
            </div>

            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray hover:text-orange transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-gray hover:text-orange transition-colors">
                Cookies (Non-Edible)
              </Link>
              <Link href="/admin" className="text-gray hover:text-orange transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer