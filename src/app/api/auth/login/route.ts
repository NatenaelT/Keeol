import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
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

    // Find or create user by phone number (bypass OTP)
    let user = await authService.findUserByPhone(phoneNumber)
    if (!user) {
      // Create new user with phone number
      user = await authService.createUser({
        phoneNumber,
        name: `Customer ${phoneNumber.slice(-4)}`,
        role: 'customer'
      })
    }

    // Update last login
    await authService.updateLastLogin(user.id)

    // Generate session token
    const token = authService.generateSessionToken(user)

    // Set secure cookie
    const cookieStore = cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
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
