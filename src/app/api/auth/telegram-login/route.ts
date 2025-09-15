import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// Mock user database
const users = new Map()

export async function POST(request: NextRequest) {
  try {
    const { telegramData } = await request.json()

    if (!telegramData) {
      return NextResponse.json(
        { message: 'Telegram data is required' },
        { status: 400 }
      )
    }

    // Verify Telegram authentication data
    const isValid = verifyTelegramAuth(telegramData)
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid Telegram authentication data' },
        { status: 400 }
      )
    }

    const telegramId = telegramData.id.toString()
    const username = telegramData.username || `user_${telegramId}`
    const firstName = telegramData.first_name || ''
    const lastName = telegramData.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim() || username

    // Find existing user by Telegram ID
    let user = Array.from(users.values()).find(u => u.telegramId === telegramId)

    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        phoneNumber: null, // Will be set when user adds phone number
        telegramId,
        username,
        name: fullName,
        role: 'customer',
        avatar: telegramData.photo_url || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: ['order.create', 'order.view', 'order.track', 'profile.edit']
      }
      users.set(user.id, user)
    }

    // Update user info from Telegram
    user.username = username
    user.name = fullName
    user.avatar = telegramData.photo_url || user.avatar
    user.lastLogin = new Date().toISOString()

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        telegramId: user.telegramId,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Telegram login successful',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        telegramId: user.telegramId,
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
    console.error('Telegram login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function verifyTelegramAuth(telegramData: any): boolean {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not configured')
      return true // For development, skip verification
    }

    // Extract hash from telegram data
    const { hash, ...dataToCheck } = telegramData

    // Create data check string
    const dataCheckString = Object.keys(dataToCheck)
      .sort()
      .map(key => `${key}=${dataToCheck[key]}`)
      .join('\n')

    // Create secret key from bot token
    const secretKey = crypto
      .createHash('sha256')
      .update(botToken)
      .digest()

    // Create hash of data check string
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    // Compare hashes
    return hmac === hash
  } catch (error) {
    console.error('Telegram auth verification error:', error)
    return false
  }
}
