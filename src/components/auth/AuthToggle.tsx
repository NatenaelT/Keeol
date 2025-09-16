'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  User, 
  ArrowRight, 
  MessageCircle,
  ChefHat,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import type { AuthFormData } from '@/app/auth/page'

interface AuthToggleProps {
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
  onSubmit: (data: AuthFormData) => Promise<boolean>
  isLoading?: boolean
}

interface FormData {
  phoneNumber: string
  name: string
  password: string
}

const AuthToggle = ({ mode, onModeChange, onSubmit, isLoading = false }: AuthToggleProps) => {
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    name: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})

  const formatPhoneNumber = useCallback((value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Ethiopian phone number formatting
    if (digits.startsWith('251')) {
      if (digits.length >= 12) {
        return '+251 ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 12)
      }
      return '+251 ' + digits.slice(3)
    } else if (digits.startsWith('09') || digits.startsWith('07')) {
      if (digits.length >= 10) {
        return '+251 ' + digits.slice(1, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 10)
      }
      return '+251 ' + digits.slice(1)
    } else if (digits.length > 0) {
      if (digits.length >= 9) {
        return '+251 ' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 9)
      }
      return '+251 ' + digits
    }
    
    return value
  }, [])

  const validatePhoneNumber = useCallback((phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Ethiopian phone number validation
    if (cleanPhone.startsWith('251')) {
      return cleanPhone.length === 12 && /^251[97]\d{8}$/.test(cleanPhone)
    }
    if (cleanPhone.startsWith('09') || cleanPhone.startsWith('07')) {
      return cleanPhone.length === 10 && /^0[97]\d{8}$/.test(cleanPhone)
    }
    
    return false
  }, [])

  const validateForm = useCallback((): boolean => {
    const errors: Partial<FormData> = {}

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid Ethiopian phone number'
    }

    // Name validation for signup
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        errors.name = 'Full name is required'
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long'
      }
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, mode, validatePhoneNumber])

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [formErrors])

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    handleInputChange('phoneNumber', formatted)
  }, [formatPhoneNumber, handleInputChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0]
      if (firstError) {
        toast.error(firstError)
      }
      return
    }

    const success = await onSubmit({
      phoneNumber: formData.phoneNumber,
      name: formData.name,
      password: formData.password,
      mode
    })

    if (success) {
      setFormData({ phoneNumber: '', name: '', password: '' })
      setFormErrors({})
    }
  }

  const handleTelegramLogin = useCallback(() => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'keolburgerbot'
    window.open(`https://t.me/${botUsername}?start=login`, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red to-brand-black flex items-center justify-center p-4">
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
            <h1 className="text-2xl font-bold text-white">keol</h1>
            <p className="text-brand-secondary">& Pizza House</p>
          </Link>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {mode === 'signin' ? 'Sign in to your account' : 'Join the keol family'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => onModeChange('signin')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                mode === 'signin'
                  ? 'bg-white text-brand-red shadow-sm'
                  : 'text-gray-600 hover:text-brand-red'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onModeChange('signup')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-brand-red shadow-sm'
                  : 'text-gray-600 hover:text-brand-red'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={`input-field pl-11 ${formErrors.name ? 'border-red-500' : ''}`}
                    required={mode === 'signup'}
                    autoComplete="name"
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+251 91 123 4567"
                  className={`input-field pl-11 ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
                  required
                  autoComplete="tel"
                />
              </div>
              {formErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={`input-field pl-11 pr-11 ${formErrors.password ? 'border-red-500' : ''}`}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
              {mode === 'signin' && (
                <div className="text-right mt-2">
                  <Link href="/forgot-password" className="text-sm text-brand-red hover:text-brand-red-dark">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner w-5 h-5"></div>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Telegram Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Or continue with</p>
              
              <button
                type="button"
                onClick={handleTelegramLogin}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Continue with Telegram</span>
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              {mode === 'signin' ? 'New to keol?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                className="text-brand-red hover:text-brand-red-dark font-medium focus:outline-none focus:underline"
              >
                {mode === 'signin' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-white hover:text-brand-secondary transition-colors duration-200 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthToggle
