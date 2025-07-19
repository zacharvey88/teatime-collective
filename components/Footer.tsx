'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-light-cream border-t border-orange/20">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Company Info */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20">
                <Image
                  src="https://framerusercontent.com/images/9BRXJQRTuoR7dflavQsmPR1Pfpw.png"
                  alt="Teatime Collective Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-dark">
                  Delicious Vegan Cakes
                </h3>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange" />
                <a 
                  href="tel:+447765833910" 
                  className="text-dark hover:text-orange transition-colors"
                >
                  +44 07765 833 910
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange" />
                <a 
                  href="mailto:info@teatimecollective.co.uk" 
                  className="text-dark hover:text-orange transition-colors"
                >
                  info@teatimecollective.co.uk
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange mt-1" />
                <div className="text-dark">
                  <p>St. Wilfrid's Enterprise Centre</p>
                  <p>Royce Road, Hulme</p>
                  <p>Manchester, M15 5BJ</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/teatimecollective"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-orange text-white rounded-full hover:bg-orange/90 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              
              <a
                href="https://www.facebook.com/Teatimecollective"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-orange text-white rounded-full hover:bg-orange/90 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
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
                © 2025 Teatime Collective. All rights reserved.
              </p>
            </div>

            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray hover:text-orange transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-gray hover:text-orange transition-colors">
                Cookies
              </Link>
              <Link href="/terms" className="text-gray hover:text-orange transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer