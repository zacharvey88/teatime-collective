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
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get the access token from URL params
  const accessToken = searchParams?.get('access_token')
  const refreshToken = searchParams?.get('refresh_token')
  
  useEffect(() => {
    // Validate the token when component mounts
    if (accessToken && refreshToken) {
      validateToken()
    } else {
      setMessage({ type: 'error', text: 'Invalid or missing reset link. Please request a new password reset.' })
    }
  }, [accessToken, refreshToken])
  
  const validateToken = async () => {
    try {
      // Set the session first with the tokens from URL
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken!,
        refresh_token: refreshToken!
      })
      
      if (sessionError) {
        setMessage({ type: 'error', text: 'Invalid or expired reset link. Please request a new password reset.' })
        return
      }
      
      // Then get the user to validate
      const { data, error } = await supabase.auth.getUser()
      
      if (error || !data.user) {
        setMessage({ type: 'error', text: 'Invalid or expired reset link. Please request a new password reset.' })
        return
      }
      
      setUserEmail(data.user.email || '')
      setIsValidToken(true)
    } catch (error) {
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
      // Set the session with the tokens from the URL
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken!,
        refresh_token: refreshToken!
      })
      
      if (sessionError) {
        throw sessionError
      }
      
      // Update the password
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) {
        throw error
      }
      
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting to admin login...' })
      
      // Redirect to admin login after 2 seconds
      setTimeout(() => {
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
    if (!userEmail) {
      setMessage({ type: 'error', text: 'Unable to determine your email address. Please use the "Forgot Password" button on the login page.' })
      return
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        setMessage({ type: 'error', text: `Failed to send reset email: ${error.message}` })
        return
      }
      
      setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox for a new link.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send reset email. Please try again.' })
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-light-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-dark">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
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
              <Button 
                onClick={handleRequestNewReset}
                variant="outline"
                className="w-full"
              >
                Request New Reset Link
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
        </CardContent>
      </Card>
    </div>
  )
} 