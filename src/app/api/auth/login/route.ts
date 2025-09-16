import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, password } = await request.json()

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { success: false, message: 'Phone number and password are required' },
        { status: 400 }
      )
    }

    // Clean and validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (cleanPhone.length < 9 || (!cleanPhone.startsWith('251') && !cleanPhone.startsWith('09') && !cleanPhone.startsWith('07'))) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid Ethiopian phone number' },
        { status: 400 }
      )
    }

    const result = await authService.loginWithPassword(phoneNumber, password)

    if (!result) {
        throw new Error('Login failed')
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
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error('Phone login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
