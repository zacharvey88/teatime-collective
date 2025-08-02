'use client'

import { useState } from 'react'
import { AuthService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface AdminLoginProps {
  onLoginSuccess: () => void
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await AuthService.signIn(email, password)
      const isAdmin = await AuthService.isAdmin()
      
      if (!isAdmin) {
        await AuthService.signOut()
        setError('Access denied. Admin privileges required.')
        return
      }

      onLoginSuccess()
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setResetMessage({ type: 'error', text: 'Please enter your email address first.' })
      return
    }

    setResetLoading(true)
    setResetMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      setResetMessage({ 
        type: 'success', 
        text: 'Password reset email sent! Check your inbox for instructions.' 
      })
    } catch (err: any) {
      setResetMessage({ 
        type: 'error', 
        text: err.message || 'Failed to send reset email. Please try again.' 
      })
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-orange" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Access</h1>
        </div>
        
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {resetMessage && (
              <Alert className={resetMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={resetMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {resetMessage.text}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@teatimecollective.co.uk"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1 bg-orange hover:bg-orange-900 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleForgotPassword}
                disabled={resetLoading || loading}
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Forgot Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 