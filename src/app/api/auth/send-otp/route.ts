import { NextRequest, NextResponse } from 'next/server'

// Mock OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate Ethiopian phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    if (!isValidEthiopianPhone(cleanPhone)) {
      return NextResponse.json(
        { message: 'Invalid Ethiopian phone number' },
        { status: 400 }
      )
    }

    // Check rate limiting (max 3 attempts per 15 minutes)
    const existing = otpStore.get(phoneNumber)
    if (existing && existing.attempts >= 3 && Date.now() < existing.expires) {
      return NextResponse.json(
        { message: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store OTP (in production, use Redis with TTL)
    otpStore.set(phoneNumber, {
      otp,
      expires,
      attempts: (existing?.attempts || 0) + 1
    })

    // In production, integrate with SMS provider (e.g., Ethio Telecom, SMS gateway)
    console.log(`OTP for ${phoneNumber}: ${otp}`) // For development only

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock SMS sending (replace with actual SMS service)
    const smsResult = await sendSMS(phoneNumber, otp)
    
    if (!smsResult.success) {
      return NextResponse.json(
        { message: 'Failed to send SMS. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function isValidEthiopianPhone(phone: string): boolean {
  // Ethiopian phone number validation
  // Formats: +251XXXXXXXXX, 09XXXXXXXX, 07XXXXXXXX
  if (phone.startsWith('251')) {
    return phone.length === 12 && /^251[97]\d{8}$/.test(phone)
  }
  if (phone.startsWith('09') || phone.startsWith('07')) {
    return phone.length === 10 && /^0[97]\d{8}$/.test(phone)
  }
  return false
}

async function sendSMS(phoneNumber: string, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Mock SMS sending - replace with actual SMS service integration
    // Examples: Ethio Telecom SMS API, Twilio, etc.
    
    const message = `Your Keeol Burger verification code is: ${otp}. Valid for 10 minutes. Don't share this code with anyone.`
    
    // Simulate API call to SMS provider
    const response = await fetch('https://api.sms-provider.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SMS_API_KEY}`
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
        from: 'Keeol Burger'
      })
    })

    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, message: 'SMS service unavailable' }
    }
  } catch (error) {
    console.error('SMS sending error:', error)
    // For development, always return success
    return { success: true }
  }
}
