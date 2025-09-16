import { supabase, createServerClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import bcrypt from 'bcryptjs'

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
  lastLogin?: string
  permissions: string[]
  loyaltyPoints: number
  loyaltyTier: string
}

class AuthService {
  /**
   * Login with phone and password
   */
  async loginWithPassword(phoneNumber: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const user = await this.findUserByPhone(phoneNumber)
      if (!user) {
        throw new Error('User not found')
      }

      if (!user.password) {
        throw new Error('Password not set for this user')
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        throw new Error('Invalid password')
      }

      // Update last login
      await this.updateLastLogin(user.id)

      // Generate session token
      const token = this.generateSessionToken(user)

      return { user, token }
    } catch (error) {
      console.error('Login with password error:', error)
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
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<(User & { password?: string }) | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error || !data) return null

      return this.mapDatabaseUserToUser(data)
    } catch (error) {
      console.error('Find user by email error:', error)
      return null
    }
  }

  /**
   * Find user by phone number
   */
  async findUserByPhone(phoneNumber: string): Promise<(User & { password?: string }) | null> {
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
  async findUserByTelegramId(telegramId: number): Promise<User | null> {
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
    password?: string
    role?: 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'
  }): Promise<User> {
    try {
      const permissions = this.getRolePermissions(userData.role || 'customer')
      
      let hashedPassword = null
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 10)
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          phone_number: userData.phoneNumber || `+251-${Date.now()}`, // Temp phone if not provided
          telegram_id: userData.telegramId,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'customer',
          permissions,
          password: hashedPassword,
          loyalty_points: 0,
          loyalty_tier: 'Bronze',
          is_active: true
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
  async updateUser(userId: string, updates: any): Promise<void> {
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
  generateSessionToken(user: User): string {
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
   * Send OTP to email or phone (stores code in DB)
   */
  async sendOTP(contact: string): Promise<{ channel: 'email'|'phone'; contact: string; expiresAt: string; code?: string }> {
    const admin = createServerClient()
    const isEmail = /@/.test(contact)
    let normalizedContact = contact.trim()
    let channel: 'email' | 'phone' = 'email'

    if (!isEmail) {
      channel = 'phone'
      const digits = contact.replace(/\D/g, '')
      if (!this.isValidEthiopianPhone(digits)) {
        throw new Error('Invalid phone number')
      }
      // Normalize to +251XXXXXXXXX
      if (digits.startsWith('251')) normalizedContact = '+' + digits
      else if (digits.startsWith('0')) normalizedContact = '+251' + digits.slice(1)
      else if (digits.length === 9) normalizedContact = '+251' + digits
      else normalizedContact = contact
    } else {
      normalizedContact = normalizedContact.toLowerCase()
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error } = await admin.from('otps').insert({
      contact: normalizedContact,
      channel,
      code,
      purpose: 'login',
      expires_at: expiresAt
    })
    if (error) throw error

    if (process.env.NODE_ENV !== 'production') {
      console.log(`OTP for ${normalizedContact} (${channel}): ${code}`)
    }

    return { channel, contact: normalizedContact, expiresAt, code: process.env.NODE_ENV !== 'production' ? code : undefined }
  }

  /**
   * Verify OTP and return user + token. Creates user if not found and name provided (signup flow)
   */
  async verifyOTP(params: { contact: string; code: string; name?: string }): Promise<{ user: User; token: string } | null> {
    const admin = createServerClient()
    const { contact, code, name } = params
    const isEmail = /@/.test(contact)
    const normalized = isEmail ? contact.trim().toLowerCase() : (() => {
      const digits = contact.replace(/\D/g, '')
      if (digits.startsWith('251')) return '+' + digits
      if (digits.startsWith('0')) return '+251' + digits.slice(1)
      if (digits.length === 9) return '+251' + digits
      return contact
    })()

    const { data: otpRow, error: otpError } = await admin
      .from('otps')
      .select('*')
      .eq('contact', normalized)
      .eq('code', code)
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRow) {
      return null
    }

    // Consume the OTP
    await admin.from('otps').update({ consumed_at: new Date().toISOString() }).eq('id', otpRow.id)

    // Find or create user
    let user: (User & { password?: string }) | null = null
    if (isEmail) {
      user = await this.findUserByEmail(normalized)
    } else {
      user = await this.findUserByPhone(normalized)
    }

    if (!user) {
      if (!name) {
        // Require name for new user creation
        throw new Error('USER_NOT_FOUND')
      }
      user = await this.createUser({
        name: name.trim(),
        email: isEmail ? normalized : undefined,
        phoneNumber: isEmail ? undefined : normalized,
        role: 'customer'
      })
    }

    await this.updateLastLogin(user.id)
    const token = this.generateSessionToken(user)
    return { user, token }
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
  private mapDatabaseUserToUser(dbUser: any): User & { password?: string } {
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
      lastLogin: dbUser.last_login,
      permissions: dbUser.permissions || [],
      loyaltyPoints: dbUser.loyalty_points || 0,
      loyaltyTier: dbUser.loyalty_tier || 'Bronze',
      password: dbUser.password
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
