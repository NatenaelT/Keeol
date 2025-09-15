'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import AuthToggle from '@/components/auth/AuthToggle'

const AuthPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [isLoading, setIsLoading] = useState(false)

  // Get initial mode from URL params
  useEffect(() => {
    const urlMode = searchParams.get('mode')
    if (urlMode === 'signup' || urlMode === 'signin') {
      setMode(urlMode)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/profile'
      window.location.href = redirectTo
    }
  }, [isAuthenticated, searchParams])

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode)
    // Update URL without navigation
    const url = new URL(window.location.href)
    url.searchParams.set('mode', newMode)
    window.history.replaceState({}, '', url.toString())
  }

  const handleSubmit = async (data: { phoneNumber: string; name?: string; mode: 'signin' | 'signup' }) => {
    setIsLoading(true)
    
    try {
      const endpoint = data.mode === 'signin' ? '/api/auth/login' : '/api/auth/register'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          name: data.name
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(
          data.mode === 'signin'
            ? `Welcome back, ${result.user.name}!`
            : `Account created successfully! Welcome, ${result.user.name}!`
        )
        const redirectTo = searchParams.get('redirect') || '/profile'

        // Add a small delay to ensure cookie is set before navigation
        setTimeout(() => {
          // Use window.location for more reliable navigation after auth
          window.location.href = redirectTo
        }, 100)
        return true
      } else {
        toast.error(result.message || `${data.mode === 'signin' ? 'Sign in' : 'Sign up'} failed`)
        return false
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(`${data.mode === 'signin' ? 'Sign in' : 'Sign up'} failed. Please try again.`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red to-brand-brown">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <AuthToggle
      mode={mode}
      onModeChange={handleModeChange}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  )
}

export default AuthPage
