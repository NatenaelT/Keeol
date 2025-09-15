import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, name } = await request.json()

    if (!phoneNumber || !name) {
      return NextResponse.json(
        { success: false, message: 'Phone number and name are required' },
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

    // Check if user already exists
    const existingUser = await authService.findUserByPhone(phoneNumber)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this phone number already exists. Please sign in instead.' },
        { status: 409 }
      )
    }

    // Create new user
    const user = await authService.createUser({
      phoneNumber,
      name: name.trim(),
      role: 'customer'
    })

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
      message: 'Account created successfully',
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
