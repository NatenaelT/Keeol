import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, email, contact } = await request.json()

    const rawContact = contact || email || phoneNumber

    if (!rawContact) {
      return NextResponse.json(
        { success: false, message: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    const result = await authService.sendOTP(rawContact)

    // Do not return the code in production
    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      channel: result.channel,
      expiresAt: result.expiresAt,
      code: result.code
    })

  } catch (error: any) {
    console.error('Send OTP error:', error)
    const message = error?.message === 'Invalid phone number' ? 'Please enter a valid phone number' : 'Internal server error'
    const status = error?.message === 'Invalid phone number' ? 400 : 500
    return NextResponse.json(
      { success: false, message },
      { status }
    )
  }
}
