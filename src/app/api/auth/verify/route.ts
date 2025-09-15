import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock user database
const users = new Map([
  ['1', {
    id: '1',
    phoneNumber: '+251 91 123 4567',
    name: 'John Doe',
    role: 'customer' as const,
    avatar: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    permissions: ['order.create', 'order.view', 'order.track', 'profile.edit']
  }],
  ['2', {
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization header missing or invalid' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret-key'
    ) as any

    // Find user by ID
    const user = users.get(decoded.userId)
    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: 'User not found or inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      id: user.id,
      phoneNumber: user.phoneNumber,
      telegramId: user.telegramId,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      permissions: user.permissions
    })

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    console.error('Token verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
