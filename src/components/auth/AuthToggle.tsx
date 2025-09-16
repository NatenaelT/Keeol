'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  Mail,
  User, 
  ArrowRight, 
  MessageCircle,
  ChefHat,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export type AuthMode = 'signin' | 'signup'

interface AuthToggleProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onSendCode: (payload: { contact: string; mode: AuthMode; name?: string }) => Promise<boolean>
  onVerifyCode: (payload: { contact: string; code: string; mode: AuthMode; name?: string }) => Promise<boolean>
  isLoading?: boolean
}

interface FormData {
  contact: string // email or phone
  name: string
  code: string
}

const AuthToggle = ({ mode, onModeChange, onSendCode, onVerifyCode, isLoading = false }: AuthToggleProps) => {
  const [formData, setFormData] = useState<FormData>({ contact: '', name: '', code: '' })
  const [step, setStep] = useState<'enter' | 'verify'>('enter')
  const [showCode, setShowCode] = useState(false)

  const isEmail = (value: string) => /@/.test(value)

  const formatPhone = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.startsWith('251')) {
      if (digits.length >= 12) return '+251 ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 12)
      return '+251 ' + digits.slice(3)
    }
    if (digits.startsWith('09') || digits.startsWith('07')) {
      if (digits.length >= 10) return '+251 ' + digits.slice(1, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 10)
      return '+251 ' + digits.slice(1)
    }
    if (digits.length > 0) {
      if (digits.length >= 9) return '+251 ' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 9)
      return '+251 ' + digits
    }
    return value
  }, [])

  const handleInput = (field: keyof FormData, value: string) => {
    if (field === 'contact' && !isEmail(value)) {
      value = formatPhone(value)
    }
    if (field === 'code') {
      value = value.replace(/\D/g, '').slice(0, 6)
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateContact = () => {
    const value = formData.contact.trim()
    if (!value) return 'Email or phone is required'
    if (isEmail(value)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return 'Please enter a valid email'
      return null
    }
    const digits = value.replace(/\D/g, '')
    if (!(digits.startsWith('251') || digits.startsWith('09') || digits.startsWith('07')) || digits.length < 10) {
      return 'Please enter a valid Ethiopian phone number'
    }
    return null
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const contactError = validateContact()
    if (contactError) {
      toast.error(contactError)
      return
    }
    if (mode === 'signup' && !formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }

    const ok = await onSendCode({ contact: formData.contact, mode, name: formData.name })
    if (ok) {
      toast.success(`Verification code sent to your ${isEmail(formData.contact) ? 'email' : 'phone'}`)
      setStep('verify')
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || formData.code.length !== 6) {
      toast.error('Enter the 6-digit code')
      return
    }

    const ok = await onVerifyCode({ contact: formData.contact, code: formData.code, mode, name: formData.name })
    if (ok) {
      // redirect handled upstream
    }
  }

  const handleTelegramLogin = () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'keolburgerbot'
    window.open(`https://t.me/${botUsername}?start=login`, '_blank', 'noopener,noreferrer')
  }

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

          {step === 'enter' ? (
            <form onSubmit={handleSend} className="space-y-6" noValidate>
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
                      onChange={(e) => handleInput('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="input-field pl-11"
                      required={mode === 'signup'}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone
                </label>
                <div className="relative">
                  {isEmail(formData.contact) ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  )}
                  <input
                    id="contact"
                    type="text"
                    value={formData.contact}
                    onChange={(e) => handleInput('contact', e.target.value)}
                    placeholder="example@email.com or +251 91 123 4567"
                    className="input-field pl-11"
                    required
                    autoComplete={isEmail(formData.contact) ? 'email' : 'tel'}
                  />
                </div>
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
                    <span>Send Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6" noValidate>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="code"
                    type={showCode ? 'text' : 'password'}
                    value={formData.code}
                    onChange={(e) => handleInput('code', e.target.value)}
                    placeholder="123456"
                    className="input-field pl-11 pr-11 text-center tracking-widest"
                    maxLength={6}
                    required
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showCode ? 'Hide code' : 'Show code'}
                  >
                    {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We sent a code to your {isEmail(formData.contact) ? 'email' : 'phone'}: {formData.contact}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep('enter')} className="btn-outline">Back</button>
                <button
                  type="submit"
                  disabled={isLoading || formData.code.length !== 6}
                  className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mode === 'signin' ? 'Verify & Sign In' : 'Verify & Create Account'}
                </button>
              </div>
            </form>
          )}

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
                onClick={() => { setStep('enter'); onModeChange(mode === 'signin' ? 'signup' : 'signin') }}
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
