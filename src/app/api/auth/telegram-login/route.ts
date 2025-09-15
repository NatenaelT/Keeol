import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export async function POST(request: NextRequest) {
  try {
    const telegramData = await request.json()

    // Verify Telegram authentication data
    if (!verifyTelegramAuth(telegramData)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Telegram authentication' },
        { status: 400 }
      )
    }

    const telegramId = parseInt(telegramData.id.toString())
    const firstName = telegramData.first_name || ''
    const lastName = telegramData.last_name || ''
    const username = telegramData.username || ''
    const fullName = `${firstName} ${lastName}`.trim() || username || `User ${telegramId}`

    // Find user by Telegram ID
    let user = await authService.findUserByTelegramId(telegramId)

    if (!user) {
      // Create new user
      user = await authService.createUser({
        telegramId,
        name: fullName,
        role: 'customer'
      })
    } else {
      // Update user info
      await authService.updateUser(user.id, {
        name: fullName,
        telegram_id: telegramId
      })
    }

    // Update last login
    await authService.updateLastLogin(user.id)

    // Generate session token
    const token = authService.generateSessionToken(user)

    // Set secure cookie
    const cookieStore = cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: false, // Allow client-side access for auth state
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({
      success: true,
      message: 'Telegram login successful',
      user: {
        id: user.id,
        name: user.name,
        telegramId: user.telegramId,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error('Telegram login error:', error)
    return NextResponse.json(
      { success: false, message: 'Telegram login failed. Please try again.' },
      { status: 500 }
    )
  }
}

function verifyTelegramAuth(data: any): boolean {
  try {
    const { hash, ...authData } = data
    
    if (!hash) return false

    // Create data string
    const dataCheckString = Object.keys(authData)
      .sort()
      .map(key => `${key}=${authData[key]}`)
      .join('\n')

    // Create secret key
    const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest()

    // Create hash
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    // Verify hash
    return hash === computedHash
  } catch (error) {
    console.error('Telegram auth verification error:', error)
    return false
  }
}

// Handle GET request for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'Telegram login endpoint is running',
    botUsername: process.env.TELEGRAM_BOT_USERNAME,
    timestamp: new Date().toISOString()
  })
}
