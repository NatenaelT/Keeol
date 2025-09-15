import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock user database (in production, use actual database)
const users = new Map([
  ['+251 91 123 4567', {
    id: '1',
    phoneNumber: '+251 91 123 4567',
    name: 'John Doe',
    role: 'customer' as const,
    avatar: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    permissions: ['order.create', 'order.view', 'order.track', 'profile.edit']
  }],
  ['+251 91 111 1111', {
    id: '2',
    phoneNumber: '+251 91 111 1111',
    name: 'Admin User',
    role: 'admin' as const,
    avatar: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    permissions: ['*']
  }]
])

// Mock OTP storage (same as in send-otp)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json()

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { message: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    // Check if OTP exists and is valid
    const storedOtp = otpStore.get(phoneNumber)
    if (!storedOtp) {
      return NextResponse.json(
        { message: 'OTP not found. Please request a new one.' },
        { status: 400 }
      )
    }

    if (Date.now() > storedOtp.expires) {
      otpStore.delete(phoneNumber)
      return NextResponse.json(
        { message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (storedOtp.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP. Please try again.' },
        { status: 400 }
      )
    }

    // OTP is valid, remove it from store
    otpStore.delete(phoneNumber)

    // Find or create user
    let user = users.get(phoneNumber)
    if (!user) {
      // Create new customer user
      user = {
        id: Date.now().toString(),
        phoneNumber,
        name: `Customer ${phoneNumber.slice(-4)}`,
        role: 'customer',
        avatar: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: ['order.create', 'order.view', 'order.track', 'profile.edit']
      }
      users.set(phoneNumber, user)
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    )

    // Update last login
    user.lastLogin = new Date().toISOString()

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        permissions: user.permissions
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
