import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json()

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { message: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    const result = await authService.verifyOTP(phoneNumber, otp)
    
    if (result) {
      const { user, token } = result
      
      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          telegramId: user.telegramId,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt,
          permissions: user.permissions
        },
        token
      })
    } else {
      return NextResponse.json(
        { message: 'Invalid OTP or phone number' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
