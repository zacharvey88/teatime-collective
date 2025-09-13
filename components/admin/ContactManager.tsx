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
  Twitter,
  Youtube,
  Linkedin,
  Plus,
  X,
  Globe
} from 'lucide-react'
import { ContactInfoService, ContactInfo, UpdateContactInfoData, SocialLink } from '@/lib/contactInfoService'
import LoadingSpinner from '@/components/ui/loading-spinner'

// Common social media platforms
const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'https://www.instagram.com/teatimecollective' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'https://www.facebook.com/Teatimecollective' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, placeholder: 'https://www.twitter.com/teatimecollective' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, placeholder: 'https://www.youtube.com/@teatimecollective' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'https://www.linkedin.com/company/teatimecollective' },
  { id: 'tiktok', name: 'TikTok', icon: null, placeholder: 'https://www.tiktok.com/@teatimecollective' },
  { id: 'pinterest', name: 'Pinterest', icon: null, placeholder: 'https://www.pinterest.com/teatimecollective' },
  { id: 'snapchat', name: 'Snapchat', icon: null, placeholder: 'https://www.snapchat.com/add/teatimecollective' },
  { id: 'other', name: 'Other', icon: Globe, placeholder: 'https://example.com' }
]

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
        social_links: info.social_links || []
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

  const addSocialLink = () => {
    if (!info) return
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: 'instagram',
      url: ''
    }
    setInfo(prev => prev ? {
      ...prev,
      social_links: [...(prev.social_links || []), newLink]
    } : null)
  }

  const removeSocialLink = (id: string) => {
    if (!info) return
    setInfo(prev => prev ? {
      ...prev,
      social_links: prev.social_links?.filter(link => link.id !== id) || []
    } : null)
  }

  const updateSocialLink = (id: string, field: 'platform' | 'url', value: string) => {
    if (!info) return
    setInfo(prev => prev ? {
      ...prev,
      social_links: prev.social_links?.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      ) || []
    } : null)
  }

  const getSocialIcon = (platform: string) => {
    const platformData = SOCIAL_PLATFORMS.find(p => p.id === platform)
    if (!platformData || !platformData.icon) return null
    const IconComponent = platformData.icon
    return <IconComponent className="w-4 h-4" />
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
              <div className="space-y-4 lg:w-full max-w-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray">Social Media Links</h3>
                  <Button
                    type="button"
                    onClick={addSocialLink}
                    className="bg-orange hover:bg-orange-900 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Link
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {info?.social_links?.map((link) => (
                    <div key={link.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                          {getSocialIcon(link.platform)}
                        </div>
                        <div className="relative w-32 flex-shrink-0">
                          <select
                            value={link.platform}
                            onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                          >
                            {SOCIAL_PLATFORMS.map((platform) => (
                              <option key={platform.id} value={platform.id}>
                                {platform.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <Input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                          placeholder={SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.placeholder || 'Enter URL'}
                          className="flex-1 min-w-0"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeSocialLink(link.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {(!info?.social_links || info.social_links.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No social media links added yet</p>
                      <p className="text-sm">Click "Add Link" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray mb-4">Preview</h3>
                <div className="space-y-3 text-sm">
                  {info.email && info.email.trim() !== '' && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange" />
                      <a href={`mailto:${info.email}`} className="text-blue-600 hover:underline">
                        {info.email}
                      </a>
                    </div>
                  )}
                  {info.phone && info.phone.trim() !== '' && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange" />
                      <a href={`tel:${info.phone}`} className="text-blue-600 hover:underline">
                        {info.phone}
                      </a>
                    </div>
                  )}
                  {(info.address_line1 && info.address_line1.trim() !== '') && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-orange mt-1" />
                      <div>
                        <div>{info.address_line1}</div>
                        {info.address_line2 && info.address_line2.trim() !== '' && <div>{info.address_line2}</div>}
                        {info.address_line3 && info.address_line3.trim() !== '' && <div>{info.address_line3}</div>}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    {info?.social_links?.map((link) => {
                      if (!link.url || link.url.trim() === '') return null
                      const platformData = SOCIAL_PLATFORMS.find(p => p.id === link.platform)
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-orange text-white rounded-full hover:bg-orange-900 transition-colors"
                          title={platformData?.name || 'Social Link'}
                        >
                          {link.platform === 'tiktok' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                          ) : link.platform === 'pinterest' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                            </svg>
                          ) : link.platform === 'snapchat' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                            </svg>
                          ) : getSocialIcon(link.platform)}
                        </a>
                      )
                    })}
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