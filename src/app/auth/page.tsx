'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthToggle from '@/components/auth/AuthToggle'

export type AuthMode = 'signin' | 'signup'

export interface SendCodePayload {
  contact: string
  mode: AuthMode
  name?: string
}

export interface VerifyCodePayload {
  contact: string
  code: string
  mode: AuthMode
  name?: string
}

const AuthPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, sendOTP, verifyOTP } = useAuth()
  
  const [mode, setMode] = useState<AuthMode>('signin')
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

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    const url = new URL(window.location.href)
    url.searchParams.set('mode', newMode)
    window.history.replaceState({}, '', url.toString())
  }

  const handleSendCode = async (payload: SendCodePayload): Promise<boolean> => {
    setIsLoading(true)
    try {
      const ok = await sendOTP(payload.contact)
      return ok
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (payload: VerifyCodePayload): Promise<boolean> => {
    setIsLoading(true)
    try {
      const ok = await verifyOTP({ contact: payload.contact, code: payload.code, name: payload.name })
      if (ok) {
        const redirectTo = searchParams.get('redirect') || '/profile'
        setTimeout(() => router.push(redirectTo), 100)
      }
      return ok
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

  if (isAuthenticated) return null

  return (
    <AuthToggle
      mode={mode}
      onModeChange={handleModeChange}
      onSendCode={handleSendCode}
      onVerifyCode={handleVerifyCode}
      isLoading={isLoading}
    />
  )
}

export default AuthPage
