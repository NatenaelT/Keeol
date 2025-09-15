'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from './AuthContext'

export interface Notification {
  id: string
  type: 'order_update' | 'promotion' | 'delivery' | 'system' | 'chat'
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
  expiresAt?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  settings: {
    inApp: boolean
    telegram: boolean
    orderUpdates: boolean
    promotions: boolean
    deliveryTracking: boolean
  }
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationState['settings']> }

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  settings: {
    inApp: true,
    telegram: true,
    orderUpdates: true,
    promotions: true,
    deliveryTracking: true,
  },
}

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications]
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length,
      }
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      )
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length,
      }
    case 'MARK_ALL_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, isRead: true }))
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      }
    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload)
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.isRead).length,
      }
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length,
      }
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }
    default:
      return state
  }
}

interface NotificationContextType extends NotificationState {
  sendNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  updateSettings: (settings: Partial<NotificationState['settings']>) => void
  requestTelegramPermission: () => Promise<boolean>
  sendTelegramMessage: (message: string, userId?: string) => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { user, isAuthenticated } = useAuth()

  // Initialize notification service
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications()
      connectWebSocket()
    }
  }, [isAuthenticated, user])

  // Load notification settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification_settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
      } catch (error) {
        console.error('Failed to load notification settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('notification_settings', JSON.stringify(state.settings))
  }, [state.settings])

  const initializeNotifications = async () => {
    try {
      // Load existing notifications
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      
      if (response.ok) {
        const notifications = await response.json()
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications })
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const connectWebSocket = () => {
    if (!user) return

    // Initialize WebSocket connection for real-time notifications
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications?userId=${user.id}`)
    
    ws.onopen = () => {
      dispatch({ type: 'SET_CONNECTED', payload: true })
      console.log('Notification WebSocket connected')
    }
    
    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        handleNewNotification(notification)
      } catch (error) {
        console.error('Failed to parse notification:', error)
      }
    }
    
    ws.onclose = () => {
      dispatch({ type: 'SET_CONNECTED', payload: false })
      console.log('Notification WebSocket disconnected')
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (isAuthenticated) {
          connectWebSocket()
        }
      }, 5000)
    }
    
    ws.onerror = (error) => {
      console.error('Notification WebSocket error:', error)
    }

    // Cleanup on unmount
    return () => {
      ws.close()
    }
  }

  const handleNewNotification = (notification: Notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
    
    // Show toast notification if enabled
    if (state.settings.inApp) {
      const toastConfig = {
        duration: 5000,
        style: {
          maxWidth: '400px',
        },
      }
      
      switch (notification.type) {
        case 'order_update':
          if (state.settings.orderUpdates) {
            toast.success(notification.message, toastConfig)
          }
          break
        case 'promotion':
          if (state.settings.promotions) {
            toast(notification.message, { ...toastConfig, icon: '🎉' })
          }
          break
        case 'delivery':
          if (state.settings.deliveryTracking) {
            toast.success(notification.message, toastConfig)
          }
          break
        case 'chat':
          toast(notification.message, { ...toastConfig, icon: '💬' })
          break
        default:
          toast(notification.message, toastConfig)
      }
    }
    
    // Send to Telegram if enabled
    if (state.settings.telegram && user?.telegramId) {
      sendTelegramMessage(notification.message, user.id)
    }
  }

  const sendNotification = (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    
    handleNewNotification(notification)
    
    // Send to server for persistence
    fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(notification),
    }).catch(error => console.error('Failed to save notification:', error))
  }

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id })
    
    // Update on server
    fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    }).catch(error => console.error('Failed to mark notification as read:', error))
  }

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' })
    
    // Update on server
    fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    }).catch(error => console.error('Failed to mark all notifications as read:', error))
  }

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    
    // Remove from server
    fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    }).catch(error => console.error('Failed to remove notification:', error))
  }

  const updateSettings = (newSettings: Partial<NotificationState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings })
  }

  const requestTelegramPermission = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/telegram/permission', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      
      return response.ok
    } catch (error) {
      console.error('Failed to request Telegram permission:', error)
      return false
    }
  }

  const sendTelegramMessage = async (message: string, userId?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ message, userId }),
      })
      
      return response.ok
    } catch (error) {
      console.error('Failed to send Telegram message:', error)
      return false
    }
  }

  const value: NotificationContextType = {
    ...state,
    sendNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updateSettings,
    requestTelegramPermission,
    sendTelegramMessage,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
