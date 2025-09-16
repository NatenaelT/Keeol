'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile,
  Minimize2,
  Maximize2,
  User,
  Bot
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'agent' | 'bot'
  timestamp: Date
  type: 'text' | 'image' | 'file'
  agentName?: string
  isRead?: boolean
}

interface TypingIndicator {
  isTyping: boolean
  agentName?: string
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [typing, setTyping] = useState<TypingIndicator>({ isTyping: false })
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [isAgentOnline, setIsAgentOnline] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  const { user, isAuthenticated } = useAuth()
  const { sendNotification } = useNotifications()

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize chat when component mounts
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      initializeChat()
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isOpen, isAuthenticated])

  // Handle window visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOpen) {
        markMessagesAsRead()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isOpen])

  const initializeChat = async () => {
    try {
      // Load chat history
      const response = await fetch('/api/chat/history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      
      if (response.ok) {
        const history = await response.json()
        setMessages(history)
      }
      
      // Connect to WebSocket for real-time messaging
      connectWebSocket()
      
      // Send initial greeting if no messages
      if (messages.length === 0) {
        setTimeout(() => {
          addBotMessage(
            `Hello ${user?.name || 'there'}! 👋 Welcome to keol support. How can I help you today?`
          )
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
    }
  }

  const connectWebSocket = () => {
    if (!user) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/chat?userId=${user.id}`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      setIsConnected(true)
      console.log('Chat WebSocket connected')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    ws.onclose = () => {
      setIsConnected(false)
      console.log('Chat WebSocket disconnected')
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (isOpen && isAuthenticated) {
          connectWebSocket()
        }
      }, 3000)
    }
    
    ws.onerror = (error) => {
      console.error('Chat WebSocket error:', error)
    }

    wsRef.current = ws
  }

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'message':
        addMessage({
          id: data.id,
          content: data.content,
          sender: data.sender,
          timestamp: new Date(data.timestamp),
          type: data.messageType || 'text',
          agentName: data.agentName,
        })
        
        // Show notification if chat is minimized or closed
        if (isMinimized || !isOpen) {
          setHasUnreadMessages(true)
          sendNotification({
            type: 'chat',
            title: 'New Message',
            message: `${data.agentName || 'Support'}: ${data.content}`,
          })
        }
        break
        
      case 'typing':
        setTyping({
          isTyping: data.isTyping,
          agentName: data.agentName,
        })
        break
        
      case 'agent_status':
        setIsAgentOnline(data.isOnline)
        break
        
      case 'chat_assigned':
        addBotMessage(`You've been connected to ${data.agentName}. They'll be with you shortly!`)
        break
    }
  }

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message])
  }

  const addBotMessage = (content: string) => {
    addMessage({
      id: Date.now().toString(),
      content,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
    })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    }

    // Add message to local state immediately
    addMessage(message)
    setNewMessage('')

    // Send to server via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: message.content,
        messageType: 'text',
      }))
    }

    // Focus input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markMessagesAsRead = () => {
    setHasUnreadMessages(false)
    // Mark messages as read on server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
      }))
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
      markMessagesAsRead()
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (isMinimized) {
      markMessagesAsRead()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user'
    const isBot = message.sender === 'bot'
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isUser && (
          <div className="flex-shrink-0 mr-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isBot ? 'bg-brand-secondary' : 'bg-brand-red'
            }`}>
              {isBot ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-1' : 'order-2'}`}>
          {!isUser && message.agentName && (
            <p className="text-xs text-gray-500 mb-1 ml-1">{message.agentName}</p>
          )}
          
          <div className={`px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-brand-red text-white'
              : isBot
                ? 'bg-gray-100 text-gray-800'
                : 'bg-white border border-gray-200 text-gray-800'
          }`}>
            <p className="text-sm">{message.content}</p>
          </div>
          
          <p className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </motion.div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 ${
          isOpen ? 'bg-gray-600 hover:bg-gray-700' : 'bg-brand-red hover:bg-brand-red-dark'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {hasUnreadMessages && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"></div>
            )}
          </>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-brand-red text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Live Support</h3>
                  <p className="text-xs opacity-90">
                    {isConnected ? (
                      isAgentOnline ? 'Agent online' : 'Connecting...'
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 bg-gray-50">
                  {messages.map(renderMessage)}
                  
                  {/* Typing Indicator */}
                  {typing.isTyping && (
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span>{typing.agentName || 'Agent'} is typing...</span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
                      disabled={!isConnected}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      className="p-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {!isConnected && (
                    <p className="text-xs text-red-500 mt-2">
                      Connection lost. Attempting to reconnect...
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default LiveChat
