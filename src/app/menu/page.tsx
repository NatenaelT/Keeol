'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Star, 
  Plus, 
  Minus, 
  ShoppingCart,
  Clock,
  Flame,
  Leaf,
  Award,
  X,
  ChevronDown
} from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  tags: string[]
  rating: number
  prepTime: number
  calories?: number
  isVegetarian: boolean
  isSpicy: boolean
  isPopular: boolean
  ingredients: string[]
  allergens: string[]
  available: boolean
}

interface CartItem extends MenuItem {
  quantity: number
  customizations?: string[]
}

const MenuPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { isAuthenticated } = useAuth()

  // Load menu items from Supabase
  useEffect(() => {
    loadMenuItems()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const categoryData = result.data.map((cat: any) => ({
            id: cat.slug,
            name: cat.name,
            count: 0 // Will be updated when items load
          }))
          setCategories([
            { id: 'all', name: 'All Items', count: 0 },
            ...categoryData
          ])
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadMenuItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/menu')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const items = result.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image || '',
            category: item.categoryName?.toLowerCase() || 'other',
            tags: item.tags || [],
            rating: item.rating || 4.5,
            prepTime: item.prepTime,
            calories: item.calories,
            isVegetarian: item.isVegetarian,
            isSpicy: item.isSpicy,
            isPopular: item.isPopular,
            ingredients: item.ingredients || [],
            allergens: item.allergens || [],
            available: item.isAvailable
          }))
          setMenuItems(items)

          // Update category counts
          setCategories(prev => prev.map(cat => ({
            ...cat,
            count: cat.id === 'all' ? items.length : items.filter((item: any) => item.category === cat.id).length
          })))
        }
      }
    } catch (error) {
      console.error('Failed to load menu items:', error)
      toast.error('Failed to load menu items')
    } finally {
      setIsLoading(false)
    }
  }

  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Items', count: 0 },
    { id: 'burgers', name: 'Burgers', count: 0 },
    { id: 'pizzas', name: 'Pizzas', count: 0 },
    { id: 'appetizers', name: 'Appetizers', count: 0 },
    { id: 'beverages', name: 'Beverages', count: 0 },
  ])

  const availableTags = [
    { id: 'popular', name: 'Popular', icon: Award },
    { id: 'vegetarian', name: 'Vegetarian', icon: Leaf },
    { id: 'spicy', name: 'Spicy', icon: Flame },
    { id: 'signature', name: 'Signature', icon: Star },
    { id: 'healthy', name: 'Healthy', icon: Leaf },
    { id: 'crispy', name: 'Crispy', icon: Award },
  ]

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'prep-time', name: 'Fastest Prep Time' },
  ]

  const filteredAndSortedItems = useMemo(() => {
    let filtered = menuItems.filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

      // Tag filter
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => {
        switch (tag) {
          case 'popular': return item.isPopular
          case 'vegetarian': return item.isVegetarian
          case 'spicy': return item.isSpicy
          default: return item.tags.includes(tag)
        }
      })

      return matchesSearch && matchesCategory && matchesTags && item.available
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price
        case 'price-high': return b.price - a.price
        case 'rating': return b.rating - a.rating
        case 'prep-time': return a.prepTime - b.prepTime
        case 'popular':
        default:
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating
      }
    })

    return filtered
  }, [menuItems, searchQuery, selectedCategory, selectedTags, sortBy])

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity }]
      }
    })
    toast.success(`${item.name} added to cart!`)
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-brand-red to-brand-brown text-white py-16">
          <div className="container-responsive text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Menu</h1>
              <p className="text-xl mb-8 opacity-90">
                Discover our delicious selection of burgers, pizzas, and more
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container-responsive py-8">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu items, ingredients..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-brand-red text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Tags */}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                                selectedTags.includes(tag.id)
                                  ? 'bg-brand-red text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <tag.icon className="w-3 h-3" />
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Sort by</h3>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        >
                          {sortOptions.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredAndSortedItems.length} of {menuItems.length} items
            </p>
            {getCartItemCount() > 0 && (
              <div className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg">
                <ShoppingCart className="w-4 h-4" />
                {getCartItemCount()} items - {getCartTotal()} ETB
              </div>
            )}
          </div>

          {/* Menu Items */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAndSortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="card hover:shadow-xl transition-all duration-300"
                >
                  {/* Item Image */}
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <div className="w-full h-full bg-gradient-to-br from-brand-yellow to-brand-red flex items-center justify-center text-white text-xl font-bold">
                      {item.name}
                    </div>
                    
                    {/* Tags Overlay */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {item.isPopular && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Popular
                        </span>
                      )}
                      {item.isVegetarian && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Veg
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Spicy
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full font-bold">
                      {item.price} ETB
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.prepTime} min
                      </div>
                      {item.calories && (
                        <div>
                          {item.calories} cal
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-brand-red hover:text-brand-red-dark text-sm font-medium"
                    >
                      View Details
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {cart.find(cartItem => cartItem.id === item.id) ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartItemQuantity(item.id, (cart.find(ci => ci.id === item.id)?.quantity || 1) - 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium">
                            {cart.find(cartItem => cartItem.id === item.id)?.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, (cart.find(ci => ci.id === item.id)?.quantity || 0) + 1)}
                            className="w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center hover:bg-brand-red-dark"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {filteredAndSortedItems.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedTags([])
                }}
                className="mt-4 btn-outline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary (Mobile) */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 lg:hidden">
          <div className="bg-brand-red text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <p className="font-medium">{getCartItemCount()} items</p>
              <p className="text-sm opacity-90">{getCartTotal()} ETB</p>
            </div>
            <button className="bg-white text-brand-red px-6 py-2 rounded-lg font-medium">
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Image */}
                <div className="w-full h-48 bg-gradient-to-br from-brand-yellow to-brand-red rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4">
                  {selectedItem.name}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <p className="text-gray-600">{selectedItem.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{selectedItem.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedItem.prepTime} min</span>
                    </div>
                    {selectedItem.calories && (
                      <span className="text-sm text-gray-600">{selectedItem.calories} cal</span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.ingredients.map((ingredient, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedItem.allergens.length > 0 && selectedItem.allergens[0] !== 'None' && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Allergens</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.allergens.map((allergen, index) => (
                          <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-2xl font-bold text-brand-red">{selectedItem.price} ETB</span>
                    <button
                      onClick={() => {
                        addToCart(selectedItem)
                        setSelectedItem(null)
                      }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default MenuPage
