'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube, Linkedin, Globe } from 'lucide-react'
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
                  {contactInfo.phone && contactInfo.phone.trim() !== '' && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-orange" />
                      <a 
                        href={`tel:${contactInfo.phone}`}
                        className="text-dark hover:text-orange transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  )}

                  {contactInfo.email && contactInfo.email.trim() !== '' && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-orange" />
                      <a 
                        href={`mailto:${contactInfo.email}`}
                        className="text-dark hover:text-orange transition-colors"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  )}

                  {(contactInfo.address_line1 && contactInfo.address_line1.trim() !== '') && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-orange mt-1" />
                      <div className="text-dark">
                        <p>{contactInfo.address_line1}</p>
                        {contactInfo.address_line2 && contactInfo.address_line2.trim() !== '' && <p>{contactInfo.address_line2}</p>}
                        {contactInfo.address_line3 && contactInfo.address_line3.trim() !== '' && <p>{contactInfo.address_line3}</p>}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="flex space-x-4">
                    {contactInfo.social_links?.map((link) => {
                      if (!link.url || link.url.trim() === '') return null
                      
                      const getSocialIcon = (platform: string) => {
                        switch (platform) {
                          case 'instagram': return <Instagram className="w-4 h-4" />
                          case 'facebook': return <Facebook className="w-4 h-4" />
                          case 'twitter': return <Twitter className="w-4 h-4" />
                          case 'youtube': return <Youtube className="w-4 h-4" />
                          case 'linkedin': return <Linkedin className="w-4 h-4" />
                          case 'tiktok': return (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                          )
                          case 'pinterest': return (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                            </svg>
                          )
                          case 'snapchat': return (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                            </svg>
                          )
                          default: return <Globe className="w-4 h-4" />
                        }
                      }
                      
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-orange text-white rounded-full hover:bg-orange-900 transition-colors"
                          aria-label={`Follow us on ${link.platform}`}
                        >
                          {getSocialIcon(link.platform)}
                        </a>
                      )
                    })}
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