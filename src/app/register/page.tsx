'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Phone, 
  User, 
  Shield, 
  ArrowRight, 
  Eye, 
  EyeOff,
  ChefHat,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

const RegisterPage = () => {
  const [step, setStep] = useState<'info' | 'phone' | 'otp'>('info')
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    otp: ''
  })
  const [showOtp, setShowOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const { sendOTP, login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/profile'
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, searchParams])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    
    if (digits.startsWith('251')) {
      return '+251 ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 12)
    } else if (digits.startsWith('09') || digits.startsWith('07')) {
      return '+251 ' + digits.slice(1, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 10)
    } else if (digits.length <= 10) {
      return '+251 ' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 9)
    }
    
    return value
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }
    setStep('phone')
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    const cleanPhone = formData.phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 9 || (!cleanPhone.startsWith('251') && !cleanPhone.startsWith('09') && !cleanPhone.startsWith('07'))) {
      toast.error('Please enter a valid Ethiopian phone number')
      return
    }

    setIsLoading(true)
    const success = await sendOTP(formData.phoneNumber)
    
    if (success) {
      setStep('otp')
      setCountdown(60)
      toast.success('OTP sent to your phone!')
    }
    
    setIsLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.otp.trim() || formData.otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }

    setIsLoading(true)
    const success = await login(formData.phoneNumber, formData.otp)
    
    if (success) {
      toast.success('Account created successfully!')
      const redirectTo = searchParams.get('redirect') || '/profile'
      router.push(redirectTo)
    }
    
    setIsLoading(false)
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    
    setIsLoading(true)
    const success = await sendOTP(formData.phoneNumber)
    
    if (success) {
      setCountdown(60)
      toast.success('OTP resent!')
    }
    
    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phoneNumber') {
      value = formatPhoneNumber(value)
    } else if (field === 'otp') {
      value = value.replace(/\D/g, '').slice(0, 6)
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-red to-brand-brown">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const steps = [
    { id: 'info', title: 'Personal Info', icon: User },
    { id: 'phone', title: 'Phone Number', icon: Phone },
    { id: 'otp', title: 'Verification', icon: Shield }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)

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

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Join the Keeol Burger family</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStepIndex 
                    ? 'bg-brand-red text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <stepItem.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < currentStepIndex ? 'bg-brand-red' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 'info' && (
            <form onSubmit={handleInfoSubmit} className="space-y-6">
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
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'phone' && (
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
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+251 91 123 4567"
                    className="input-field pl-11"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll send you a verification code via SMS
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="flex-1 btn-outline"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="loading-spinner w-5 h-5"></div>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="otp"
                    type={showOtp ? 'text' : 'password'}
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value)}
                    placeholder="123456"
                    className="input-field pl-11 pr-11 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOtp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 6-digit code sent to {formData.phoneNumber}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex-1 btn-outline"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || formData.otp.length !== 6}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="loading-spinner w-5 h-5"></div>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className="text-sm text-brand-red hover:text-brand-red-dark disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Sign In / Sign Up Toggle */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-brand-red hover:text-brand-red-dark font-medium">
                Sign In
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <Link
                href="/login"
                className="px-6 py-2 border border-brand-red text-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors font-medium"
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

export default RegisterPage
