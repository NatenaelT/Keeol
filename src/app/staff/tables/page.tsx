'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Bell,
  Coffee,
  UtensilsCrossed,
  Receipt,
  Eye,
  Timer,
  UserCheck,
  UserX
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import MobileNavigation from '@/components/layout/MobileNavigation'
import RoleGuard from '@/components/auth/RoleGuard'

interface Table {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  section: string
  waiter?: string
  customers?: {
    count: number
    names?: string[]
  }
  currentOrder?: {
    id: string
    total: number
    items: number
    placedAt: string
    status: 'ordering' | 'placed' | 'preparing' | 'served'
  }
  seatedAt?: string
  reservedFor?: string
  reservedAt?: string
  requests?: Array<{
    id: string
    type: 'assistance' | 'bill' | 'menu' | 'complaint'
    message: string
    timestamp: string
    urgent: boolean
  }>
}

const TableManagement = () => {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [sectionFilter, setSectionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Mock table data
  useEffect(() => {
    const mockTables: Table[] = [
      {
        id: '1',
        number: 1,
        capacity: 2,
        status: 'occupied',
        section: 'A',
        waiter: 'Sarah',
        customers: { count: 2, names: ['John', 'Mary'] },
        currentOrder: {
          id: 'ORD-001',
          total: 680,
          items: 3,
          placedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'preparing'
        },
        seatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        number: 2,
        capacity: 4,
        status: 'available',
        section: 'A',
      },
      {
        id: '3',
        number: 3,
        capacity: 2,
        status: 'reserved',
        section: 'A',
        reservedFor: 'Ahmed Hassan',
        reservedAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        number: 4,
        capacity: 6,
        status: 'occupied',
        section: 'B',
        waiter: 'Mike',
        customers: { count: 4 },
        currentOrder: {
          id: 'ORD-002',
          total: 1250,
          items: 6,
          placedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: 'served'
        },
        seatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        requests: [
          {
            id: '1',
            type: 'bill',
            message: 'Ready for the bill',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            urgent: false
          }
        ]
      },
      {
        id: '5',
        number: 5,
        capacity: 2,
        status: 'cleaning',
        section: 'B',
      },
      {
        id: '6',
        number: 6,
        capacity: 4,
        status: 'occupied',
        section: 'B',
        waiter: 'Sarah',
        customers: { count: 3 },
        seatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        requests: [
          {
            id: '2',
            type: 'assistance',
            message: 'Need extra napkins',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            urgent: true
          }
        ]
      },
      {
        id: '7',
        number: 7,
        capacity: 8,
        status: 'available',
        section: 'C',
      },
      {
        id: '8',
        number: 8,
        capacity: 2,
        status: 'available',
        section: 'C',
      }
    ]

    setTimeout(() => {
      setTables(mockTables)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredTables = tables.filter(table => {
    const sectionMatch = sectionFilter === 'all' || table.section === sectionFilter
    const statusMatch = statusFilter === 'all' || table.status === statusFilter
    return sectionMatch && statusMatch
  })

  const sections = ['A', 'B', 'C']

  const statusConfig = {
    available: { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300', label: 'Available' },
    occupied: { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300', label: 'Occupied' },
    reserved: { color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300', label: 'Reserved' },
    cleaning: { color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300', label: 'Cleaning' }
  }

  const requestIcons = {
    assistance: Bell,
    bill: Receipt,
    menu: UtensilsCrossed,
    complaint: AlertCircle
  }

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        const updates: Partial<Table> = { status }
        if (status === 'available') {
          updates.customers = undefined
          updates.currentOrder = undefined
          updates.seatedAt = undefined
          updates.requests = undefined
          updates.waiter = undefined
        } else if (status === 'occupied' && !table.seatedAt) {
          updates.seatedAt = new Date().toISOString()
        }
        return { ...table, ...updates }
      }
      return table
    }))

    toast.success(`Table ${tables.find(t => t.id === tableId)?.number} status updated`)
  }

  const seatCustomers = (tableId: string, customerCount: number) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          status: 'occupied' as const,
          customers: { count: customerCount },
          seatedAt: new Date().toISOString(),
          waiter: 'Current User' // In real app, get from auth
        }
      }
      return table
    }))

    toast.success(`${customerCount} customers seated at table ${tables.find(t => t.id === tableId)?.number}`)
  }

  const resolveRequest = (tableId: string, requestId: string) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          requests: table.requests?.filter(req => req.id !== requestId)
        }
      }
      return table
    }))

    toast.success('Request resolved')
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeDuration = (startTime: string) => {
    const duration = Math.floor((Date.now() - new Date(startTime).getTime()) / (1000 * 60))
    if (duration < 60) return `${duration}m`
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return `${hours}h ${minutes}m`
  }

  const getTableStats = () => {
    const available = tables.filter(t => t.status === 'available').length
    const occupied = tables.filter(t => t.status === 'occupied').length
    const reserved = tables.filter(t => t.status === 'reserved').length
    const totalRequests = tables.reduce((sum, t) => sum + (t.requests?.length || 0), 0)
    
    return { available, occupied, reserved, totalRequests }
  }

  const { available, occupied, reserved, totalRequests } = getTableStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-20 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['waiter', 'operation_manager', 'admin', 'owner']}>
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
                  <Users className="w-8 h-8 text-brand-red" />
                  Table Management
                </h1>
                <p className="text-gray-600">Manage restaurant tables and customer seating</p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600">{available}</div>
                <div className="text-gray-600 text-sm">Available</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600">{occupied}</div>
                <div className="text-gray-600 text-sm">Occupied</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">{reserved}</div>
                <div className="text-gray-600 text-sm">Reserved</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-red-600">{totalRequests}</div>
                <div className="text-gray-600 text-sm">Requests</div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="all">All Sections</option>
                  {sections.map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
            </motion.div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTables.map((table, index) => {
                const statusInfo = statusConfig[table.status]
                const hasRequests = table.requests && table.requests.length > 0
                const hasUrgentRequest = table.requests?.some(req => req.urgent)

                return (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative card border-2 ${statusInfo.border} ${statusInfo.bg} hover:shadow-lg transition-all duration-300 cursor-pointer`}
                    onClick={() => setSelectedTable(table)}
                  >
                    {/* Table Number */}
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {table.number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {table.capacity} seats • Section {table.section}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="text-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bg} border ${statusInfo.border.replace('border-', 'border-opacity-50 border-')}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Table Info */}
                    {table.status === 'occupied' && table.customers && (
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                          <Users className="w-4 h-4" />
                          {table.customers.count} guests
                        </div>
                        {table.seatedAt && (
                          <div className="text-xs text-gray-500">
                            {getTimeDuration(table.seatedAt)}
                          </div>
                        )}
                        {table.currentOrder && (
                          <div className="text-xs text-blue-600 mt-1">
                            Order: {table.currentOrder.total} ETB
                          </div>
                        )}
                      </div>
                    )}

                    {table.status === 'reserved' && table.reservedFor && (
                      <div className="text-center mb-4">
                        <div className="text-sm text-gray-700 mb-1">{table.reservedFor}</div>
                        {table.reservedAt && (
                          <div className="text-xs text-gray-500">
                            at {formatTime(table.reservedAt)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Request Indicators */}
                    {hasRequests && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        {hasUrgentRequest && (
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {table.requests!.length}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4">
                      {table.status === 'available' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            seatCustomers(table.id, 2) // Default to 2 customers for quick action
                          }}
                          className="flex-1 btn-primary py-1 text-xs flex items-center justify-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          Seat
                        </button>
                      )}

                      {table.status === 'occupied' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTableStatus(table.id, 'available')
                          }}
                          className="flex-1 btn-outline py-1 text-xs flex items-center justify-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          Clear
                        </button>
                      )}

                      {table.status === 'cleaning' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTableStatus(table.id, 'available')
                          }}
                          className="flex-1 btn-primary py-1 text-xs flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Ready
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Table Detail Modal */}
        <AnimatePresence>
          {selectedTable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTable(null)}
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
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Table {selectedTable.number}
                      </h2>
                      <p className="text-gray-600">
                        Section {selectedTable.section} • {selectedTable.capacity} seats
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTable(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  {/* Status Actions */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <button
                          key={status}
                          onClick={() => updateTableStatus(selectedTable.id, status as Table['status'])}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            selectedTable.status === status
                              ? `${config.bg} ${config.color} ${config.border}`
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Requests */}
                  {selectedTable.requests && selectedTable.requests.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Customer Requests</h3>
                      <div className="space-y-2">
                        {selectedTable.requests.map((request) => {
                          const RequestIcon = requestIcons[request.type]
                          return (
                            <div
                              key={request.id}
                              className={`p-3 rounded-lg border ${
                                request.urgent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <RequestIcon className={`w-4 h-4 mt-0.5 ${
                                    request.urgent ? 'text-red-600' : 'text-gray-600'
                                  }`} />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {request.message}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatTime(request.timestamp)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => resolveRequest(selectedTable.id, request.id)}
                                  className="text-green-600 hover:text-green-700 text-sm"
                                >
                                  Resolve
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Current Order */}
                  {selectedTable.currentOrder && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Current Order</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">Order #{selectedTable.currentOrder.id}</span>
                          <span className="font-bold text-blue-600">
                            {selectedTable.currentOrder.total} ETB
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedTable.currentOrder.items} items • 
                          Placed at {formatTime(selectedTable.currentOrder.placedAt)}
                        </p>
                        <div className="flex gap-2">
                          <button className="btn-outline py-1 px-3 text-sm">
                            View Details
                          </button>
                          <button className="btn-primary py-1 px-3 text-sm">
                            Add Items
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    {selectedTable.status === 'available' && (
                      <button
                        onClick={() => {
                          setShowOrderModal(true)
                        }}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Seat Customers
                      </button>
                    )}

                    {selectedTable.status === 'occupied' && (
                      <>
                        <button className="w-full btn-primary flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          Take Order
                        </button>
                        <button className="w-full btn-outline flex items-center justify-center gap-2">
                          <Receipt className="w-4 h-4" />
                          Generate Bill
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setSelectedTable(null)}
                      className="w-full btn-outline"
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

export default TableManagement
