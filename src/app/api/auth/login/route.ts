import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, password } = body

    // Validate required fields
    if (!phoneNumber || !password) {
      return NextResponse.json(
        { success: false, message: 'Phone number and password are required' },
        { status: 400 }
      )
    }

    // Validate data types
    if (typeof phoneNumber !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Clean and validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 9) {
      return NextResponse.json(
        { success: false, message: 'Phone number is too short' },
        { status: 400 }
      )
    }

    if (!cleanPhone.startsWith('251') && !cleanPhone.startsWith('09') && !cleanPhone.startsWith('07')) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid Ethiopian phone number' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Attempt login
    const result = await authService.loginWithPassword(phoneNumber, password)

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number or password' },
        { status: 401 }
      )
    }

    const { user, token } = result

    // Set secure cookie
    const cookieStore = cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: false, // Allow client-side access for auth state
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/' // Make cookie available site-wide
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        return NextResponse.json(
          { success: false, message: 'No account found with this phone number' },
          { status: 404 }
        )
      }
      if (error.message.includes('Invalid password')) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number or password' },
          { status: 401 }
        )
      }
      if (error.message.includes('Password not set')) {
        return NextResponse.json(
          { success: false, message: 'Please use Telegram login or reset your password' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
