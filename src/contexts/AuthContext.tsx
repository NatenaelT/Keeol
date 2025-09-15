'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'
import { authService, User } from '@/services/authService'

export type UserRole = 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (phoneNumber: string, otp: string) => Promise<boolean>
  loginWithTelegram: (telegramData: any) => Promise<boolean>
  logout: () => void
  sendOTP: (phoneNumber: string) => Promise<boolean>
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Role-based permissions mapping
  const rolePermissions: Record<UserRole, string[]> = {
    customer: ['order.create', 'order.view', 'order.track', 'profile.edit'],
    waiter: ['order.create', 'order.view', 'order.update', 'table.manage', 'customer.assist'],
    chef: ['order.view', 'order.prepare', 'kitchen.manage', 'inventory.view'],
    delivery: ['order.view', 'delivery.manage', 'location.track'],
    operation_manager: ['order.manage', 'staff.view', 'reports.view', 'inventory.manage'],
    admin: ['*'], // All permissions
    owner: ['*'], // All permissions
  }

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = Cookies.get('auth_token')
      if (token) {
        dispatch({ type: 'SET_TOKEN', payload: token })
        // Verify token and get user data
        const userData = await authService.verifyToken(token)
        if (userData) {
          dispatch({ type: 'SET_USER', payload: userData })
        } else {
          logout()
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      logout()
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const success = await authService.sendOTP(phoneNumber)
      
      if (success) {
        toast.success('OTP sent successfully!')
        return true
      } else {
        toast.error('Failed to send OTP. Please try again.')
        return false
      }
    } catch (error: any) {
      console.error('Send OTP failed:', error)
      toast.error(error.message || 'Failed to send OTP. Please try again.')
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const result = await authService.verifyOTP(phoneNumber, otp)
      
      if (result) {
        const { user, token } = result
        
        // Store token in secure cookie
        Cookies.set('auth_token', token, { 
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        
        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'SET_USER', payload: user })
        
        toast.success(`Welcome back, ${user.name}!`)
        return true
      } else {
        toast.error('Login failed. Please check your OTP.')
        return false
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      toast.error(error.message || 'Login failed. Please try again.')
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loginWithTelegram = async (telegramData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const result = await authService.loginWithTelegram(telegramData)
      
      if (result) {
        const { user, token } = result
        
        Cookies.set('auth_token', token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        
        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'SET_USER', payload: user })
        
        toast.success(`Welcome, ${user.name}!`)
        return true
      } else {
        toast.error('Telegram login failed. Please try again.')
        return false
      }
    } catch (error: any) {
      console.error('Telegram login failed:', error)
      toast.error(error.message || 'Telegram login failed. Please try again.')
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const logout = () => {
    Cookies.remove('auth_token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!state.token) return false

      const userData = await authService.verifyToken(state.token)
      if (userData) {
        dispatch({ type: 'SET_USER', payload: userData })
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false
    
    // Check if user has explicit permission or wildcard
    return state.user.permissions.includes('*') || state.user.permissions.includes(permission)
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(state.user.role)
  }

  const value: AuthContextType = {
    ...state,
    login,
    loginWithTelegram,
    logout,
    sendOTP,
    hasPermission,
    hasRole,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
