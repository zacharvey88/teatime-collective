'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  Mail, 
  Phone, 
  MapPin,
  Instagram,
  Facebook,
  Globe
} from 'lucide-react'
import { ContactInfoService, ContactInfo, UpdateContactInfoData } from '@/lib/contactInfoService'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function ContactManager() {
  const [info, setInfo] = useState<ContactInfo | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContactInfo()
  }, [])

  const loadContactInfo = async () => {
    try {
      setLoading(true)
      const contactInfo = await ContactInfoService.getContactInfo()
      setInfo(contactInfo)
    } catch (err: any) {
      setError(err.message || 'Failed to load contact info')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!info) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const contactData: UpdateContactInfoData = {
        email: info.email,
        phone: info.phone,
        address_line1: info.address_line1,
        address_line2: info.address_line2,
        address_line3: info.address_line3,
        instagram_url: info.instagram_url,
        facebook_url: info.facebook_url
      }

      await ContactInfoService.updateContactInfo(contactData)
      await loadContactInfo()
      setSuccess('Contact information updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save contact information')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    if (!info) return
    setInfo(prev => prev ? { ...prev, [field]: value } : null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray mb-2">Contact Information</h1>
        <p className="text-gray-600">Update your business contact details and social media links</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner message="Loading contact info..." />
      ) : !info ? (
        <Alert variant="destructive">
          <AlertDescription>Failed to load contact information</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-8">
            {/* Top Row - Contact Details, Address, and Social Media */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Contact Details */}
              <div className="space-y-4 lg:w-80">
                <div>
                  <label className="text-sm font-bold text-gray">Email Address</label>
                  <Input
                    type="email"
                    value={info?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@teatimecollective.co.uk"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray">Phone Number</label>
                  <Input
                    type="tel"
                    value={info?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+44 07765 833 910"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 lg:w-80">
                <div>
                  <label className="text-sm font-bold text-gray">Address Line 1</label>
                  <Input
                    value={info?.address_line1 || ''}
                    onChange={(e) => handleInputChange('address_line1', e.target.value)}
                    placeholder="St. Wilfrid's Enterprise Centre"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray">Address Line 2</label>
                  <Input
                    value={info?.address_line2 || ''}
                    onChange={(e) => handleInputChange('address_line2', e.target.value)}
                    placeholder="Royce Road, Hulme"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray">Address Line 3</label>
                  <Input
                    value={info?.address_line3 || ''}
                    onChange={(e) => handleInputChange('address_line3', e.target.value)}
                    placeholder="Manchester, M15 5BJ"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4 lg:w-80">
                <div>
                  <label className="text-sm font-bold text-gray">Instagram URL</label>
                  <Input
                    type="url"
                    value={info?.instagram_url || ''}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder="https://www.instagram.com/teatimecollective"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray">Facebook URL</label>
                  <Input
                    type="url"
                    value={info?.facebook_url || ''}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://www.facebook.com/Teatimecollective"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray mb-4">Preview</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange" />
                    <a href={`mailto:${info.email}`} className="text-blue-600 hover:underline">
                      {info.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange" />
                    <a href={`tel:${info.phone}`} className="text-blue-600 hover:underline">
                      {info.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange mt-1" />
                    <div>
                      <div>{info.address_line1}</div>
                      {info.address_line2 && <div>{info.address_line2}</div>}
                      {info.address_line3 && <div>{info.address_line3}</div>}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    {info.instagram_url && (
                      <a
                        href={info.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-orange text-white rounded-full hover:bg-orange-900 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {info.facebook_url && (
                      <a
                        href={info.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-orange text-white rounded-full hover:bg-orange-900 transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-orange hover:bg-orange-900 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
} 