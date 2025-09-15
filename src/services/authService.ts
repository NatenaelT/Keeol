import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export interface User {
  id: string
  phoneNumber: string
  telegramId?: number
  name: string
  email?: string
  role: 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'
  avatar?: string
  isActive: boolean
  createdAt: string
  permissions: string[]
}

// Store OTP temporarily (in production, use Redis or proper storage)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()

class AuthService {
  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<boolean> {
    try {
      // Clean and validate phone number
      const cleanPhone = this.cleanPhoneNumber(phoneNumber)
      if (!this.isValidEthiopianPhone(cleanPhone)) {
        throw new Error('Invalid Ethiopian phone number')
      }

      // Check rate limiting
      const existing = otpStore.get(phoneNumber)
      if (existing && existing.attempts >= 3 && Date.now() < existing.expires) {
        throw new Error('Too many attempts. Please try again later.')
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

      // Store OTP
      otpStore.set(phoneNumber, {
        otp,
        expires,
        attempts: (existing?.attempts || 0) + 1
      })

      // In development, log OTP to console
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${phoneNumber}: ${otp}`)
      }

      // TODO: Integrate with SMS service for production
      // await this.sendSMS(phoneNumber, otp)

      return true
    } catch (error) {
      console.error('Send OTP error:', error)
      return false
    }
  }

  /**
   * Verify OTP and login
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<{ user: User; token: string } | null> {
    try {
      // Check OTP
      const storedOtp = otpStore.get(phoneNumber)
      if (!storedOtp) {
        throw new Error('OTP not found. Please request a new one.')
      }

      if (Date.now() > storedOtp.expires) {
        otpStore.delete(phoneNumber)
        throw new Error('OTP has expired. Please request a new one.')
      }

      if (storedOtp.otp !== otp) {
        throw new Error('Invalid OTP. Please try again.')
      }

      // OTP is valid, remove it
      otpStore.delete(phoneNumber)

      // Find or create user in database
      let user = await this.findUserByPhone(phoneNumber)
      if (!user) {
        user = await this.createUser({
          phoneNumber,
          name: `Customer ${phoneNumber.slice(-4)}`,
          role: 'customer'
        })
      }

      // Update last login
      await this.updateLastLogin(user.id)

      // Generate session token (in production, use proper JWT)
      const token = this.generateSessionToken(user)

      return { user, token }
    } catch (error) {
      console.error('Verify OTP error:', error)
      throw error
    }
  }

  /**
   * Login with Telegram
   */
  async loginWithTelegram(telegramData: any): Promise<{ user: User; token: string } | null> {
    try {
      const telegramId = parseInt(telegramData.id.toString())
      const firstName = telegramData.first_name || ''
      const lastName = telegramData.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || `User ${telegramId}`

      // Find user by Telegram ID
      let user = await this.findUserByTelegramId(telegramId)

      if (!user) {
        // Create new user
        user = await this.createUser({
          telegramId,
          name: fullName,
          role: 'customer'
        })
      } else {
        // Update user info
        await this.updateUser(user.id, {
          name: fullName,
          telegramId
        })
      }

      // Update last login
      await this.updateLastLogin(user.id)

      // Generate session token
      const token = this.generateSessionToken(user)

      return { user, token }
    } catch (error) {
      console.error('Telegram login error:', error)
      throw error
    }
  }

  /**
   * Find user by phone number
   */
  async findUserByPhone(phoneNumber: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('is_active', true)
        .single()

      if (error || !data) return null

      return this.mapDatabaseUserToUser(data)
    } catch (error) {
      console.error('Find user by phone error:', error)
      return null
    }
  }

  /**
   * Find user by Telegram ID
   */
  private async findUserByTelegramId(telegramId: number): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .eq('is_active', true)
        .single()

      if (error || !data) return null

      return this.mapDatabaseUserToUser(data)
    } catch (error) {
      console.error('Find user by Telegram ID error:', error)
      return null
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: {
    phoneNumber?: string
    telegramId?: number
    name: string
    email?: string
    role?: 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'
  }): Promise<User> {
    try {
      const permissions = this.getRolePermissions(userData.role || 'customer')

      const { data, error } = await supabase
        .from('users')
        .insert({
          phone_number: userData.phoneNumber || `+251-${Date.now()}`, // Temp phone if not provided
          telegram_id: userData.telegramId,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'customer',
          permissions
        })
        .select()
        .single()

      if (error) throw error

      return this.mapDatabaseUserToUser(data)
    } catch (error) {
      console.error('Create user error:', error)
      throw error
    }
  }

  /**
   * Update user
   */
  private async updateUser(userId: string, updates: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.updateUser(userId, { last_login: new Date().toISOString() })
    } catch (error) {
      console.error('Update last login error:', error)
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (error || !data) return null

      return this.mapDatabaseUserToUser(data)
    } catch (error) {
      console.error('Get user by ID error:', error)
      return null
    }
  }

  /**
   * Verify session token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      // In production, properly verify JWT token
      const payload = JSON.parse(atob(token.split('.')[1]))
      return await this.getUserById(payload.userId)
    } catch (error) {
      console.error('Verify token error:', error)
      return null
    }
  }

  /**
   * Generate session token
   */
  private generateSessionToken(user: User): string {
    // In production, use proper JWT library
    const payload = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      iat: Date.now()
    }
    
    return `header.${btoa(JSON.stringify(payload))}.signature`
  }

  /**
   * Get role permissions
   */
  private getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      customer: ['order.create', 'order.view', 'order.track', 'profile.edit'],
      waiter: ['order.create', 'order.view', 'order.update', 'table.manage', 'customer.assist'],
      chef: ['order.view', 'order.prepare', 'kitchen.manage', 'inventory.view'],
      delivery: ['order.view', 'delivery.manage', 'location.track'],
      operation_manager: ['order.manage', 'staff.view', 'reports.view', 'inventory.manage'],
      admin: ['*'],
      owner: ['*']
    }

    return rolePermissions[role] || rolePermissions.customer
  }

  /**
   * Map database user to application user
   */
  private mapDatabaseUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      phoneNumber: dbUser.phone_number,
      telegramId: dbUser.telegram_id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatar: dbUser.avatar_url,
      isActive: dbUser.is_active,
      createdAt: dbUser.created_at,
      permissions: dbUser.permissions || []
    }
  }

  /**
   * Clean phone number
   */
  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '')
  }

  /**
   * Validate Ethiopian phone number
   */
  private isValidEthiopianPhone(phone: string): boolean {
    if (phone.startsWith('251')) {
      return phone.length === 12 && /^251[97]\d{8}$/.test(phone)
    }
    if (phone.startsWith('09') || phone.startsWith('07')) {
      return phone.length === 10 && /^0[97]\d{8}$/.test(phone)
    }
    return false
  }
}

export const authService = new AuthService()
export default authService
