'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Phone,
  ArrowRight,
  MessageCircle,
  ChefHat
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

declare global {
  interface Window {
    Telegram?: {
      Login: {
        auth: (options: any, callback: (user: any) => void) => void
      }
    }
  }
}

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { loginWithTelegram, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  // Load Telegram login widget script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'keeolburgerbot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-auth-url', `${window.location.origin}/api/auth/telegram-login`)
    script.setAttribute('data-request-access', 'write')
    script.onload = () => {
      // Create a global callback function for Telegram login
      (window as any).onTelegramAuth = handleTelegramCallback
    }

    document.body.appendChild(script)

    return () => {
      try {
        document.body.removeChild(script)
      } catch (e) {
        // Script might already be removed
      }
    }
  }, [])

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format Ethiopian phone number
    if (digits.startsWith('251')) {
      return '+251 ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 12)
    } else if (digits.startsWith('09') || digits.startsWith('07')) {
      return '+251 ' + digits.slice(1, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 10)
    } else if (digits.length <= 10) {
      return '+251 ' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 9)
    }
    
    return value
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    // Basic Ethiopian phone number validation
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 9 || (!cleanPhone.startsWith('251') && !cleanPhone.startsWith('09') && !cleanPhone.startsWith('07'))) {
      toast.error('Please enter a valid Ethiopian phone number')
      return
    }

    setIsLoading(true)

    // Bypass OTP verification - directly login with phone number
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`Welcome back, ${data.user.name}!`)
        router.push('/')
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    }

    setIsLoading(false)
  }


  const handleTelegramCallback = async (user: any) => {
    console.log('Telegram callback received:', user)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/telegram-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`Welcome, ${data.user.name}!`)
        router.push('/')
      } else {
        toast.error(data.message || 'Telegram login failed')
      }
    } catch (error) {
      console.error('Telegram login error:', error)
      toast.error('Telegram login failed. Please try again.')
    }

    setIsLoading(false)
  }

  const handleTelegramLogin = async (user: any) => {
    await handleTelegramCallback(user)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red to-brand-brown">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red to-brand-brown flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChefHat className="w-8 h-8 text-brand-red" />
            </div>
            <h1 className="text-2xl font-bold text-white">Keeol Burger</h1>
            <p className="text-brand-yellow">& Pizza House</p>
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+251 91 123 4567"
                  className="input-field pl-11"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter your phone number to sign in instantly
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="loading-spinner w-5 h-5"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Telegram Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Or continue with</p>

              <div className="flex justify-center">
                <div id="telegram-login-container" className="w-full">
                  {/* Telegram widget will be inserted here */}
                  <div
                    id="telegram-login-keeolburgerbot"
                    className="telegram-login-widget w-full"
                  ></div>

                  {/* Fallback button */}
                  <button
                    onClick={() => {
                      window.open(
                        `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'keeolburgerbot'}?start=login`,
                        '_blank'
                      )
                    }}
                    className="flex items-center justify-center space-x-2 w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mt-3"
                  >
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Open Telegram Bot</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up / Sign In Toggle */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              New to Keeol Burger?{' '}
              <Link href="/register" className="text-brand-red hover:text-brand-red-dark font-medium">
                Sign Up
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <Link
                href="/login"
                className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 border border-brand-red text-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-white hover:text-brand-yellow transition-colors duration-200 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
