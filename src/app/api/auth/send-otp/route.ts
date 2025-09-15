import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      )
    }

    const success = await authService.sendOTP(phoneNumber)
    
    if (success) {
      return NextResponse.json({
        message: 'OTP sent successfully',
        expiresIn: 600 // 10 minutes in seconds
      })
    } else {
      return NextResponse.json(
        { message: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
