import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'

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
    
    const user = await authService.verifyToken(token)
    
    if (user) {
      return NextResponse.json({
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
      })
    } else {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

  } catch (error: any) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
