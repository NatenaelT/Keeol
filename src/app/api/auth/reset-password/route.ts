import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token and password are required' },
        { status: 400 }
      )
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('password_reset_token', hashedToken)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired password reset token' },
        { status: 400 }
      )
    }

    const now = new Date()
    const expires = new Date(user.password_reset_expires)

    if (now > expires) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired password reset token' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await authService.updateUser(user.id, {
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null,
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
