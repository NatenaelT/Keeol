'use client'

import { useState } from 'react'
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

interface AuthToggleProps {
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
  onSubmit: (data: { phoneNumber: string; name?: string; password?: string; mode: 'signin' | 'signup' }) => Promise<boolean>
  isLoading?: boolean
}

const AuthToggle = ({ mode, onModeChange, onSubmit, isLoading = false }: AuthToggleProps) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    name: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData(prev => ({ ...prev, phoneNumber: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    if (mode === 'signup' && !formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!formData.password.trim()) {
      toast.error('Please enter your password')
      return
    }

    // Basic Ethiopian phone number validation
    const cleanPhone = formData.phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 9 || (!cleanPhone.startsWith('251') && !cleanPhone.startsWith('09') && !cleanPhone.startsWith('07'))) {
      toast.error('Please enter a valid Ethiopian phone number')
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
    }
  }

  const handleTelegramLogin = () => {
    window.open(
      `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'keolburgerbot'}?start=login`,
      '_blank'
    )
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="input-field pl-11"
                    required={mode === 'signup'}
                  />
                </div>
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
                  className="input-field pl-11"
                  required
                />
              </div>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="input-field pl-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
              className="w-full btn-primary flex items-center justify-center space-x-2"
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
                onClick={handleTelegramLogin}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
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
                onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                className="text-brand-red hover:text-brand-red-dark font-medium"
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
