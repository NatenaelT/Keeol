import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      )
    }

    const user = await authService.findUserByPhone(phoneNumber)

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex')
      const passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

      const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await authService.updateUser(user.id, {
        password_reset_token: passwordResetToken,
        password_reset_expires: passwordResetExpires.toISOString(),
      })

      // In development, log the reset link to the console
      if (process.env.NODE_ENV === 'development') {
        const resetURL = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
        console.log(`Password reset link for ${phoneNumber}: ${resetURL}`)
      }

      // TODO: Send SMS with the reset link in production
    }

    // Always return a success message to prevent user enumeration attacks
    return NextResponse.json({
      success: true,
      message: 'If an account with this phone number exists, a password reset link has been sent.',
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
