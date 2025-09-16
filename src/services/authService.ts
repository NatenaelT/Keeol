import { supabase } from '@/lib/supabase'
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
