'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, ArrowRight, ChefHat } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 9 || (!cleanPhone.startsWith('251') && !cleanPhone.startsWith('09') && !cleanPhone.startsWith('07'))) {
      toast.error('Please enter a valid Ethiopian phone number')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(result.message || 'Password reset link sent!')
        setIsSubmitted(true)
      } else {
        toast.error(result.message || 'Failed to send password reset link')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('Failed to send password reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red to-brand-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChefHat className="w-8 h-8 text-brand-red" />
            </div>
            <h1 className="text-2xl font-bold text-white">keol</h1>
            <p className="text-brand-secondary">& Pizza House</p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
            <p className="text-gray-600 mt-2">Enter your phone number to reset your password</p>
          </div>

          {isSubmitted ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">A password reset link has been sent to your phone number. Please check your messages.</p>
              <Link href="/auth?mode=signin" className="btn-primary">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Remember your password?{' '}
              <Link href="/auth?mode=signin" className="text-brand-red hover:text-brand-red-dark font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

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

export default ForgotPasswordPage
