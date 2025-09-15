'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Star,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  UserPlus,
  MessageSquare,
  Send,
  Paperclip,
  Smile
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import MobileNavigation from '@/components/layout/MobileNavigation'
import RoleGuard from '@/components/auth/RoleGuard'

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  joinedAt: string
  lastOrderAt?: string
  totalOrders: number
  totalSpent: number
  averageRating?: number
  status: 'active' | 'inactive'
  tags: string[]
  notes?: string
}

interface ChatSession {
  id: string
  customerId: string
  customer: Customer
  status: 'new' | 'open' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  lastMessage: {
    content: string
    sender: 'customer' | 'agent'
    timestamp: string
  }
  unreadCount: number
  createdAt: string
  resolvedAt?: string
  tags: string[]
  relatedOrderId?: string
}

interface ChatMessage {
  id: string
  content: string
  sender: 'customer' | 'agent'
  timestamp: string
  type: 'text' | 'image' | 'file'
  isRead: boolean
  agentName?: string
}

const CRMDashboard = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Doe',
        phone: '+251-911-123456',
        email: 'john@example.com',
        joinedAt: '2024-01-01T00:00:00Z',
        lastOrderAt: '2024-01-15T14:30:00Z',
        totalOrders: 15,
        totalSpent: 4500,
        averageRating: 4.8,
        status: 'active',
        tags: ['VIP', 'Regular'],
        notes: 'Prefers extra spicy food'
      },
      {
        id: '2',
        name: 'Jane Smith',
        phone: '+251-911-654321',
        email: 'jane@example.com',
        joinedAt: '2024-01-10T00:00:00Z',
        lastOrderAt: '2024-01-16T12:00:00Z',
        totalOrders: 8,
        totalSpent: 2400,
        status: 'active',
        tags: ['New Customer'],
        notes: 'Vegetarian preferences'
      }
    ]

    const mockChatSessions: ChatSession[] = [
      {
        id: '1',
        customerId: '1',
        customer: mockCustomers[0],
        status: 'open',
        priority: 'high',
        assignedTo: 'Sarah Wilson',
        lastMessage: {
          content: 'My order is taking too long. Where is it?',
          sender: 'customer',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        unreadCount: 2,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        tags: ['Delivery Issue', 'Urgent'],
        relatedOrderId: 'KBP-2024-0123'
      },
      {
        id: '2',
        customerId: '2',
        customer: mockCustomers[1],
        status: 'new',
        priority: 'medium',
        lastMessage: {
          content: 'Hi, I have a question about your vegetarian options',
          sender: 'customer',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        unreadCount: 1,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        tags: ['Menu Question']
      },
      {
        id: '3',
        customerId: '1',
        customer: mockCustomers[0],
        status: 'resolved',
        priority: 'low',
        assignedTo: 'Mike Johnson',
        lastMessage: {
          content: 'Thank you for your help!',
          sender: 'customer',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tags: ['General Support']
      }
    ]

    setTimeout(() => {
      setCustomers(mockCustomers)
      setChatSessions(mockChatSessions)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredChatSessions = chatSessions.filter(session => {
    const statusMatch = statusFilter === 'all' || session.status === statusFilter
    const priorityMatch = priorityFilter === 'all' || session.priority === priorityFilter
    const searchMatch = searchQuery === '' || 
      session.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    return statusMatch && priorityMatch && searchMatch
  })

  const statusConfig = {
    new: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'New' },
    open: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Open' },
    resolved: { color: 'text-green-600', bg: 'bg-green-100', label: 'Resolved' },
    closed: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Closed' }
  }

  const priorityConfig = {
    high: { color: 'text-red-600', bg: 'bg-red-100', label: 'High' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' },
    low: { color: 'text-green-600', bg: 'bg-green-100', label: 'Low' }
  }

  const loadChatMessages = async (chatId: string) => {
    // Mock messages for the selected chat
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hello, I need help with my order',
        sender: 'customer',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        type: 'text',
        isRead: true
      },
      {
        id: '2',
        content: 'Hi! I\'d be happy to help you. What seems to be the issue?',
        sender: 'agent',
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        type: 'text',
        isRead: true,
        agentName: 'Sarah Wilson'
      },
      {
        id: '3',
        content: 'My order is taking too long. Where is it?',
        sender: 'customer',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        type: 'text',
        isRead: false
      }
    ]

    setChatMessages(mockMessages)
  }

  const selectChat = (chat: ChatSession) => {
    setSelectedChat(chat)
    loadChatMessages(chat.id)
    
    // Mark as read
    setChatSessions(prev => prev.map(session => 
      session.id === chat.id 
        ? { ...session, unreadCount: 0 }
        : session
    ))
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender: 'agent',
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: true,
      agentName: 'Current User'
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage('')

    // Update last message in chat sessions
    setChatSessions(prev => prev.map(session =>
      session.id === selectedChat.id
        ? {
            ...session,
            lastMessage: {
              content: message.content,
              sender: 'agent',
              timestamp: message.timestamp
            }
          }
        : session
    ))

    toast.success('Message sent!')
  }

  const updateChatStatus = (chatId: string, status: ChatSession['status']) => {
    setChatSessions(prev => prev.map(session =>
      session.id === chatId
        ? {
            ...session,
            status,
            resolvedAt: status === 'resolved' ? new Date().toISOString() : session.resolvedAt
          }
        : session
    ))

    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? { ...prev, status } : null)
    }

    toast.success(`Chat ${status}`)
  }

  const assignChat = (chatId: string, agentName: string) => {
    setChatSessions(prev => prev.map(session =>
      session.id === chatId
        ? { ...session, assignedTo: agentName }
        : session
    ))

    toast.success(`Chat assigned to ${agentName}`)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getCRMStats = () => {
    const totalChats = chatSessions.length
    const newChats = chatSessions.filter(c => c.status === 'new').length
    const openChats = chatSessions.filter(c => c.status === 'open').length
    const avgResponseTime = '2.5 min' // Mock data
    
    return { totalChats, newChats, openChats, avgResponseTime }
  }

  const { totalChats, newChats, openChats, avgResponseTime } = getCRMStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-300 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['operation_manager', 'admin', 'owner']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <MessageCircle className="w-8 h-8 text-brand-red" />
                  Customer Support CRM
                </h1>
                <p className="text-gray-600">Manage customer conversations and support tickets</p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600">{totalChats}</div>
                <div className="text-gray-600 text-sm">Total Chats</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-orange-600">{newChats}</div>
                <div className="text-gray-600 text-sm">New Chats</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600">{openChats}</div>
                <div className="text-gray-600 text-sm">Open Chats</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">{avgResponseTime}</div>
                <div className="text-gray-600 text-sm">Avg Response</div>
              </div>
            </motion.div>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-0 h-[600px] flex"
            >
              {/* Chat List */}
              <div className="w-1/3 border-r border-gray-200 flex flex-col">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search chats..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Chat Sessions */}
                <div className="flex-1 overflow-y-auto">
                  {filteredChatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => selectChat(session)}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedChat?.id === session.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {session.customer.name.charAt(0)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {session.customer.name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTime(session.lastMessage.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mb-2">
                            {session.lastMessage.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[session.status].color} ${statusConfig[session.status].bg}`}>
                                {statusConfig[session.status].label}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[session.priority].color} ${priorityConfig[session.priority].bg}`}>
                                {priorityConfig[session.priority].label}
                              </span>
                            </div>
                            
                            {session.unreadCount > 0 && (
                              <div className="w-5 h-5 bg-brand-red rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">
                                  {session.unreadCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              {selectedChat ? (
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedChat.customer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedChat.customer.name}</h3>
                        <p className="text-sm text-gray-600">{selectedChat.customer.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCustomer(selectedChat.customer)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <select
                        value={selectedChat.status}
                        onChange={(e) => updateChatStatus(selectedChat.id, e.target.value as ChatSession['status'])}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      >
                        <option value="new">New</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'agent'
                            ? 'bg-brand-red text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.sender === 'agent' && message.agentName && (
                            <p className="text-xs opacity-75 mb-1">{message.agentName}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Chat</h3>
                    <p className="text-gray-600">Choose a conversation to view messages</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Customer Details Modal */}
        <AnimatePresence>
          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedCustomer(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                        <p className="text-gray-600">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  {/* Customer Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{selectedCustomer.totalOrders}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-brand-red">{selectedCustomer.totalSpent} ETB</div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedCustomer.phone}</span>
                        </div>
                        {selectedCustomer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{selectedCustomer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedCustomer.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCustomer.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-brand-red text-white text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCustomer.notes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedCustomer.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="w-full btn-primary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <MobileNavigation />
      </div>
    </RoleGuard>
  )
}

export default CRMDashboard
