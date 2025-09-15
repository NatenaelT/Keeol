'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'

export type UserRole = 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'

export interface User {
  id: string
  phoneNumber: string
  telegramId?: string
  name: string
  role: UserRole
  avatar?: string
  isActive: boolean
  createdAt: string
  permissions: string[]
}

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
        const userData = await verifyToken(token)
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

  const verifyToken = async (token: string): Promise<User | null> => {
    try {
      // Simulate API call to verify token
      // Replace with actual API endpoint
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      })

      if (response.ok) {
        toast.success('OTP sent successfully!')
        return true
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to send OTP')
        return false
      }
    } catch (error) {
      console.error('Send OTP failed:', error)
      toast.error('Network error. Please try again.')
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      })

      if (response.ok) {
        const { user, token } = await response.json()
        
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
        const error = await response.json()
        toast.error(error.message || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Network error. Please try again.')
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loginWithTelegram = async (telegramData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('/api/auth/telegram-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramData }),
      })

      if (response.ok) {
        const { user, token } = await response.json()
        
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
        const error = await response.json()
        toast.error(error.message || 'Telegram login failed')
        return false
      }
    } catch (error) {
      console.error('Telegram login failed:', error)
      toast.error('Network error. Please try again.')
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
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      })

      if (response.ok) {
        const { token } = await response.json()
        Cookies.set('auth_token', token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        dispatch({ type: 'SET_TOKEN', payload: token })
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
    
    const userPermissions = rolePermissions[state.user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
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
