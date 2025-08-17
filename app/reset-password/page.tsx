'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isValidToken, setIsValidToken] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestingReset, setRequestingReset] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get the access token from URL params (try different parameter names)
  const accessToken = searchParams?.get('access_token') || searchParams?.get('token')
  const urlRefreshToken = searchParams?.get('refresh_token')
  
  // Check for hash fragment errors and tokens
  const hashParams = typeof window !== 'undefined' ? window.location.hash : ''
  
  // Initialize tokens from URL params
  useEffect(() => {
    if (accessToken) {
      setToken(accessToken)
    }
    if (urlRefreshToken) {
      setRefreshToken(urlRefreshToken)
    }
  }, [accessToken, urlRefreshToken])
  
  useEffect(() => {
    // Extract tokens from URL hash fragment or search params
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const searchParams = new URLSearchParams(window.location.search)
    
    let token = hashParams.get('access_token') || searchParams.get('access_token')
    let refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token')
    
    if (token && refreshToken) {
      // Found tokens in hash fragment
      setToken(token)
      setRefreshToken(refreshToken)
    } else if (token) {
      // Found token in search params
      setToken(token)
    }
    
    // Validate token if we have one
    if (token) {
      validateTokenWithTokens(token, refreshToken)
    }
  }, [])
  
  const validateTokenWithTokens = async (token: string, refreshToken?: string | null) => {
    try {
      console.log('Validating token:', { token: token.substring(0, 20) + '...', refreshToken: refreshToken ? 'present' : 'missing' })
      
      // Try to set the session with the tokens
      if (refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshToken
        })
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setMessage({ type: 'error', text: 'Invalid or expired reset link. Please request a new password reset.' })
          return
        }
      } else {
        // If no refresh token, try to validate the access token directly
        try {
          const { error: userError } = await supabase.auth.getUser(token)
          if (userError) {
            setMessage({ type: 'error', text: 'Invalid or expired reset link. Please request a new password reset.' })
            return
          }
        } catch (directError) {
          console.error('Direct token validation error:', directError)
          setMessage({ type: 'error', text: 'Invalid or expired reset link. Please request a new password reset.' })
          return
        }
      }
      
      // Then get the user to validate
      const { data, error } = await supabase.auth.getUser()
      
      if (error || !data.user) {
        setMessage({ type: 'error', text: 'Invalid or expired reset link. Please request a new password reset.' })
        return
      }
      
      setUserEmail(data.user.email || '')
      setIsValidToken(true)
      setMessage(null) // Clear any existing error messages
    } catch (error) {
      console.error('Token validation error:', error)
      setMessage({ type: 'error', text: 'Invalid or expired reset link. Please request a new password reset.' })
    }
  }
  
  const handleReset = async () => {
    if (!isValidToken) return
    
    // Validate passwords
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' })
      return
    }
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    
    setLoading(true)
    setMessage(null)
    
    try {
      // Ensure we have a valid session before updating password
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session) {
        // If no session, try to set it up again with the tokens
        if (refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken!,
            refresh_token: refreshToken!
          })
          
          if (sessionError) {
            throw new Error('Failed to establish session: ' + sessionError.message)
          }
        } else {
          // If no refresh token, we can't establish a session, but we can still validate the token
          const { error: userError } = await supabase.auth.getUser(accessToken!)
          if (userError) {
            throw new Error('Failed to validate token: ' + userError.message)
          }
        }
      }
      
      // Update the password
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) {
        throw error
      }
      
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting to admin login...' })
      
      // Sign out to clear the session and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/admin')
      }, 2000)
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Failed to update password: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleRequestNewReset = async () => {
    const emailToUse = userEmail || requestEmail
    
    if (!emailToUse) {
      setMessage({ type: 'error', text: 'Please enter your email address to request a new reset link.' })
      return
    }
    
    setRequestingReset(true)
    setMessage(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        setMessage({ type: 'error', text: `Failed to send reset email: ${error.message}` })
        return
      }
      
      setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox for a new link.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send reset email. Please try again.' })
    } finally {
      setRequestingReset(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>
        
        <div className="space-y-4">
          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
          
          {isValidToken ? (
            <>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                onClick={handleReset} 
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-orange hover:bg-orange/90 text-white"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                This password reset link is invalid or has expired.
              </p>
              
              {!userEmail && (
                <div className="space-y-2">
                  <label htmlFor="requestEmail" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <Input
                    id="requestEmail"
                    type="email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={requestingReset}
                  />
                </div>
              )}
              
              <Button 
                onClick={handleRequestNewReset}
                variant="outline"
                className="w-full"
                disabled={requestingReset}
              >
                {requestingReset ? 'Sending...' : 'Request New Reset Link'}
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => {
                // Clear any existing session before redirecting
                supabase.auth.signOut()
                router.push('/admin')
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Admin Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 