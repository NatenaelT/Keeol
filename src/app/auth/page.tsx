'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import AuthToggle from '@/components/auth/AuthToggle'

export interface AuthFormData {
  phoneNumber: string
  name?: string
  password: string
  mode: 'signin' | 'signup'
}

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
    if (isAuthenticated && !authLoading) {
      const redirectTo = searchParams.get('redirect') || '/profile'
      router.push(redirectTo)
    }
  }, [isAuthenticated, authLoading, searchParams, router])

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode)
    // Update URL without navigation
    const url = new URL(window.location.href)
    url.searchParams.set('mode', newMode)
    window.history.replaceState({}, '', url.toString())
  }

  const handleSubmit = async (data: AuthFormData): Promise<boolean> => {
    setIsLoading(true)

    try {
      const endpoint = data.mode === 'signin' ? '/api/auth/login' : '/api/auth/register'
      
      const requestBody = JSON.stringify({
        phoneNumber: data.phoneNumber,
        ...(data.mode === 'signup' && { name: data.name }),
        password: data.password
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success(
          data.mode === 'signin'
            ? `Welcome back, ${result.user.name}!`
            : `Account created successfully! Welcome, ${result.user.name}!`
        )
        
        const redirectTo = searchParams.get('redirect') || '/profile'
        
        // Use router.push instead of window.location for better UX
        setTimeout(() => {
          router.push(redirectTo)
        }, 100)
        
        return true
      } else {
        throw new Error(result.message || `${data.mode === 'signin' ? 'Sign in' : 'Sign up'} failed`)
      }
    } catch (error) {
      console.error('Auth error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed. Please try again.'
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red to-brand-black">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Don't render auth form if already authenticated
  if (isAuthenticated) {
    return null
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
