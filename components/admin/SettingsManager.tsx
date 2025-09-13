'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Save, 
  Upload,
  Image as ImageIcon,
  Palette,
  Mail,
  Info,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import { SettingsService, Settings, UpdateSettingsData } from '@/lib/settingsService'
import { useSettings } from '@/lib/settingsContext'
import { Switch } from '@/components/ui/switch'

export default function SettingsManager() {
  const { settings, refreshSettings } = useSettings()
  const [localSettings, setLocalSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Sync local settings with context settings
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!localSettings) return

    setSaving(true)

    try {
      const settingsData: UpdateSettingsData = {
        logo_url: localSettings.logo_url,
        order_email: localSettings.order_email,
        site_title: localSettings.site_title,
        site_description: localSettings.site_description,
        primary_color: localSettings.primary_color,
        payment_notice: localSettings.payment_notice,
        cart_notice: localSettings.cart_notice,
        cake_search_enabled: localSettings.cake_search_enabled,
        cakes_subheading: localSettings.cakes_subheading,
        order_subheading: localSettings.order_subheading,
        show_order_form_notice: localSettings.show_order_form_notice,
        show_cart_notice: localSettings.show_cart_notice,
        custom_order_notice: localSettings.custom_order_notice,
        home_title: localSettings.home_title,
        home_subheading: localSettings.home_subheading,
        cakes_heading: localSettings.cakes_heading,
        order_heading: localSettings.order_heading,
        empty_cart_message: localSettings.empty_cart_message,
        order_button_empty_text: localSettings.order_button_empty_text,
        order_button_active_text: localSettings.order_button_active_text,
        festival_title: localSettings.festival_title,
        festival_subtitle: localSettings.festival_subtitle,
        festival_content: localSettings.festival_content,
        wedding_title: localSettings.wedding_title,
        wedding_subtitle: localSettings.wedding_subtitle,
        wedding_content: localSettings.wedding_content
      }

      await SettingsService.updateSettings(settingsData)
      await refreshSettings() // Refresh the context to apply changes immediately
      showModal('success', 'Settings updated successfully!')
    } catch (err: any) {
      showModal('error', err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !localSettings) return

    try {
      const url = await SettingsService.uploadLogo(file)
      setLocalSettings(prev => prev ? { ...prev, logo_url: url } : null)
    } catch (err: any) {
      showModal('error', err.message || 'Failed to upload logo')
    }
  }

  const handleInputChange = (field: keyof Settings, value: string | boolean) => {
    if (!localSettings) return
    setLocalSettings(prev => prev ? { ...prev, [field]: value } : null)
  }

  const showModal = (type: 'success' | 'error', message: string) => {
    setModalType(type)
    setModalMessage(message)
    setIsModalOpen(true)
  }

  if (!localSettings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray mb-2">Settings</h1>
          <p className="text-gray-600">Manage your website settings and branding</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray mb-2">Settings</h1>
        <p className="text-gray-600">Manage your website settings and branding</p>
      </div>



              <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2 text-orange" />
              General Settings
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Logo Management */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray mb-3">Logo</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    {localSettings.logo_url ? (
                      <img
                        src={localSettings.logo_url}
                        alt="Logo"
                        className="w-3/4 h-3/4 object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-gray-600 mt-1">
                      Recommended: 200x200px, PNG or SVG format
                    </p>
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray mb-3">Branding</h3>
                <div>
                  <label className="text-sm font-bold text-gray">Accent Colour</label>
                  <div className="flex items-center gap-3 mt-1">
                    <Input
                      type="color"
                      value={localSettings.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={localSettings.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#FF6B35"
                      className="w-32"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    This color will be used throughout the website
                  </p>
                </div>
              </div>

              {/* Order Email */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray mb-3">Email</h3>
                <div>
                  <label className="text-sm font-bold text-gray">Email for Orders</label>
                  <Input
                    type="email"
                    value={localSettings.order_email}
                    onChange={(e) => handleInputChange('order_email', e.target.value)}
                    placeholder="orders@teatimecollective.co.uk"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    This email will receive all order notifications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2 text-orange" />
              SEO Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray">Site Title</label>
                <Input
                  value={localSettings.site_title}
                  onChange={(e) => handleInputChange('site_title', e.target.value)}
                  placeholder="Teatime Collective - Delicious Vegan Cakes"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Used for SEO and browser tab title
                </p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray">Site Description</label>
                <Input
                  value={localSettings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  placeholder="Vegan Cakes and Bakes, Festival Caterers and Market Traders since 2013."
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Used for SEO meta description
                </p>
              </div>
            </div>
          </div>

          {/* Home Page Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2 text-orange" />
              Home Page Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray">Home Page Title</label>
                <Input
                  value={localSettings.home_title || ''}
                  onChange={(e) => handleInputChange('home_title', e.target.value)}
                  placeholder="Teatime Collective"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Main heading displayed on the home page
                </p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray">Home Page Subheading</label>
                <Input
                  value={localSettings.home_subheading || ''}
                  onChange={(e) => handleInputChange('home_subheading', e.target.value)}
                  placeholder="Delicious Vegan Cakes & Bakes"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Subtitle displayed below the main heading on the home page
                </p>
              </div>
            </div>
          </div>

          {/* Cakes Page Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2 text-orange" />
              Cakes Page Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray">Cakes Page Heading</label>
                <Input
                  value={localSettings.cakes_heading || ''}
                  onChange={(e) => handleInputChange('cakes_heading', e.target.value)}
                  placeholder="Our Cakes"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Main heading displayed on the cakes page
                </p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray">Cakes Page Subheading</label>
                <Input
                  value={localSettings.cakes_subheading || ''}
                  onChange={(e) => handleInputChange('cakes_subheading', e.target.value)}
                  placeholder="Plant-powered cakes so good, even the cows are jealous! 🌱🍰✨"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Subtitle that appears below the main heading on the cakes page
                </p>
              </div>
            </div>
          </div>

          {/* Order Page Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2 text-orange" />
              Order Page Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray">Order Page Heading</label>
                <Input
                  value={localSettings.order_heading || ''}
                  onChange={(e) => handleInputChange('order_heading', e.target.value)}
                  placeholder="Order Your Cakes"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Main heading displayed on the order page
                </p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray">Order Page Subheading</label>
                <Input
                  value={localSettings.order_subheading || ''}
                  onChange={(e) => handleInputChange('order_subheading', e.target.value)}
                  placeholder="Don't leave them in the cart - someone else will eat them!"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Subtitle that appears below the main heading on the order page
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Order Page Notice</label>
              <textarea
                value={localSettings.payment_notice || ''}
                onChange={(e) => handleInputChange('payment_notice', e.target.value)}
                placeholder="Please note: No payment will be required at this point. I will review your order and get back to you to confirm or discuss options. Thanks"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-600 mt-1">
                This notice will appear on the order page above the submit button
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Cart Notice</label>
              <textarea
                value={localSettings.cart_notice || ''}
                onChange={(e) => handleInputChange('cart_notice', e.target.value)}
                placeholder="Prices shown are estimates and may vary based on special requests, decorations, dietary requirements, and other factors. Final pricing will be confirmed when we review your order."
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-600 mt-1">
                This notice will appear below the cart total on the order page
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Custom Order Notice</label>
              <textarea
                value={localSettings.custom_order_notice || ''}
                onChange={(e) => handleInputChange('custom_order_notice', e.target.value)}
                placeholder="Custom orders require special pricing based on complexity, ingredients, and design requirements. We'll provide a detailed quote after reviewing your specifications."
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-600 mt-1">
                This notice will appear when custom cakes are in the cart
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Empty Cart Message</label>
              <textarea
                value={localSettings.empty_cart_message || ''}
                onChange={(e) => handleInputChange('empty_cart_message', e.target.value)}
                placeholder="Oh no! There's no cakes in your cart."
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-600 mt-1">
                This message will appear when the cart is empty
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Order Button - Empty Cart</label>
              <input
                type="text"
                value={localSettings.order_button_empty_text || ''}
                onChange={(e) => handleInputChange('order_button_empty_text', e.target.value)}
                placeholder="Add cakes to cart first"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                Text shown on the order button when cart is empty
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Order Button - Active Cart</label>
              <input
                type="text"
                value={localSettings.order_button_active_text || ''}
                onChange={(e) => handleInputChange('order_button_active_text', e.target.value)}
                placeholder="Let there be cake!"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                Text shown on the order button when cart has items
              </p>
            </div>

            {/* Festival Content */}
            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Festival Section Title</label>
              <input
                type="text"
                value={localSettings.festival_title || ''}
                onChange={(e) => handleInputChange('festival_title', e.target.value)}
                placeholder="Festival Catering"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                Main title for the festival section
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Festival Section Subtitle</label>
              <input
                type="text"
                value={localSettings.festival_subtitle || ''}
                onChange={(e) => handleInputChange('festival_subtitle', e.target.value)}
                placeholder="Festivals and Events"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                Subtitle shown above the main title
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Festival Content</label>
              <textarea
                value={localSettings.festival_content || ''}
                onChange={(e) => handleInputChange('festival_content', e.target.value)}
                placeholder="We have 11 years of festival catering experience..."
                rows={8}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                Main content text for the festival section (supports multiple paragraphs)
              </p>
            </div>

            {/* Wedding Content */}
            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Wedding Section Title</label>
              <input
                type="text"
                value={localSettings.wedding_title || ''}
                onChange={(e) => handleInputChange('wedding_title', e.target.value)}
                placeholder="Wedding Cakes"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                Main title for the wedding section
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Wedding Section Subtitle</label>
              <input
                type="text"
                value={localSettings.wedding_subtitle || ''}
                onChange={(e) => handleInputChange('wedding_subtitle', e.target.value)}
                placeholder="Weddings and Special Occasions"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                Subtitle shown above the main title
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-bold text-gray">Wedding Content</label>
              <textarea
                value={localSettings.wedding_content || ''}
                onChange={(e) => handleInputChange('wedding_content', e.target.value)}
                placeholder="Yes, we cater for weddings and other special occasions too..."
                rows={6}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">
                Main content text for the wedding section
              </p>
            </div>

          </div>

          {/* Feature Toggles */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2 text-orange" />
              Feature Toggles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <label className="text-sm font-bold text-gray">Cake Search</label>
                  <p className="text-xs text-gray-600 mt-1">
                    Enable search on cakes page
                  </p>
                </div>
                <Switch
                  checked={localSettings.cake_search_enabled ?? true}
                  onCheckedChange={(checked) => handleInputChange('cake_search_enabled', checked)}
                  style={{
                    '--tw-bg-opacity': '1',
                    backgroundColor: localSettings.cake_search_enabled ? 'var(--primary-color)' : '#d1d5db'
                  } as React.CSSProperties}
                  className="[&>span]:!bg-white"
                />
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <label className="text-sm font-bold text-gray">Order Form Notice</label>
                  <p className="text-xs text-gray-600 mt-1">
                    Show payment notice on order page
                  </p>
                </div>
                <Switch
                  checked={localSettings.show_order_form_notice ?? true}
                  onCheckedChange={(checked) => handleInputChange('show_order_form_notice', checked)}
                  style={{
                    '--tw-bg-opacity': '1',
                    backgroundColor: localSettings.show_order_form_notice ? 'var(--primary-color)' : '#d1d5db'
                  } as React.CSSProperties}
                  className="[&>span]:!bg-white"
                />
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <label className="text-sm font-bold text-gray">Cart Notice</label>
                  <p className="text-xs text-gray-600 mt-1">
                    Show cart-related notices
                  </p>
                </div>
                <Switch
                  checked={localSettings.show_cart_notice ?? true}
                  onCheckedChange={(checked) => handleInputChange('show_cart_notice', checked)}
                  style={{
                    '--tw-bg-opacity': '1',
                    backgroundColor: localSettings.show_cart_notice ? 'var(--primary-color)' : '#d1d5db'
                  } as React.CSSProperties}
                  className="[&>span]:!bg-white"
                />
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
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Success/Error Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${
              modalType === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {modalType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {modalType === 'success' ? 'Success' : 'Error'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-700">
              <p className="text-center">{modalMessage}</p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsModalOpen(false)}
                className={`${
                  modalType === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                OK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
