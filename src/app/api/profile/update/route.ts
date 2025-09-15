import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import { cookies } from 'next/headers'

export async function PUT(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const user = await authService.verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token. Please sign in again.' },
        { status: 401 }
      )
    }

    const { name, email } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    // Update user profile
    await authService.updateUser(user.id, {
      name: name.trim(),
      email: email?.trim() || null
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: name.trim(),
        email: email?.trim() || null
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, message: 'Profile update failed. Please try again.' },
      { status: 500 }
    )
  }
}
