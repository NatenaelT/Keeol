import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { contact, code, name } = await request.json()

    if (!contact || !code) {
      return NextResponse.json(
        { success: false, message: 'Contact and code are required' },
        { status: 400 }
      )
    }

    const result = await authService.verifyOTP({ contact, code, name })

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    const { user, token } = result

    // Set auth cookie
    const cookieStore = cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier
      },
      token
    })
  } catch (error: any) {
    console.error('Verify OTP error:', error)

    if (error?.message === 'USER_NOT_FOUND') {
      return NextResponse.json(
        { success: false, message: 'Account not found. Please sign up and provide your name.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
