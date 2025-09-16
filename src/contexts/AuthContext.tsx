'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'
import { authService, User } from '@/services/authService'

export type UserRole = 'customer' | 'waiter' | 'chef' | 'delivery' | 'operation_manager' | 'admin' | 'owner'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  error: string | null
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  error: null,
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
        error: null,
      }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
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
  login: (phoneNumber: string, password: string) => Promise<boolean>
  loginWithTelegram: (telegramData: any) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
  refreshToken: () => Promise<boolean>
  clearError: () => void
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const token = Cookies.get('auth_token')
      if (token) {
        dispatch({ type: 'SET_TOKEN', payload: token })
        
        // Verify token and get user data
        const userData = await authService.verifyToken(token)
        if (userData) {
          dispatch({ type: 'SET_USER', payload: userData })
        } else {
          // Invalid token, clean up
          logout()
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' })
      logout()
    }
  }, [])

  const login = useCallback(async (phoneNumber: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const result = await authService.loginWithPassword(phoneNumber, password)

      if (result) {
        const { user, token } = result

        // Store token in secure cookie
        Cookies.set('auth_token', token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })

        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'SET_USER', payload: user })

        return true
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Invalid credentials' })
        return false
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      const errorMessage = error.message || 'Login failed. Please try again.'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const loginWithTelegram = useCallback(async (telegramData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      
      const result = await authService.loginWithTelegram(telegramData)
      
      if (result) {
        const { user, token } = result
        
        Cookies.set('auth_token', token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
        
        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'SET_USER', payload: user })
        
        toast.success(`Welcome, ${user.name}!`)
        return true
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Telegram login failed' })
        return false
      }
    } catch (error: any) {
      console.error('Telegram login failed:', error)
      const errorMessage = error.message || 'Telegram login failed. Please try again.'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const logout = useCallback(() => {
    Cookies.remove('auth_token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }, [])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.token) return false

      const userData = await authService.verifyToken(state.token)
      if (userData) {
        dispatch({ type: 'SET_USER', payload: userData })
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }, [state.token, logout])

  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false
    
    // Check if user has explicit permission or wildcard
    return state.user.permissions.includes('*') || state.user.permissions.includes(permission)
  }, [state.user])

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(state.user.role)
  }, [state.user])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    loginWithTelegram,
    logout,
    hasPermission,
    hasRole,
    refreshToken,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
