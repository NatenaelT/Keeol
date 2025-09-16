'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X,
  Image,
  Settings,
  Globe,
  Calendar,
  User
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import MobileNavigation from '@/components/layout/MobileNavigation'
import RoleGuard from '@/components/auth/RoleGuard'

interface ContentItem {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  type: 'page' | 'post' | 'promotion'
  status: 'draft' | 'published' | 'archived'
  author: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  tags: string[]
}

const CMSPage = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [filter, setFilter] = useState<'all' | 'page' | 'post' | 'promotion'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock content data
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: '1',
        title: 'Welcome to keol Burger',
        slug: 'welcome-to-keol-burger',
        content: `<h1>Welcome to keol Burger & Pizza House</h1>
<p>We are delighted to serve you the finest burgers and pizzas in Addis Ababa. Our commitment to quality ingredients and exceptional service has made us a favorite among food lovers.</p>
<h2>Our Story</h2>
<p>Founded in 2019, keol Burger started as a small family business with a big dream - to bring people together over great food.</p>`,
        excerpt: 'Welcome to keol Burger & Pizza House, where quality meets taste.',
        type: 'page',
        status: 'published',
        author: 'Admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
        publishedAt: '2024-01-01T00:00:00Z',
        seoTitle: 'Welcome to keol Burger - Best Burgers in Addis Ababa',
        seoDescription: 'Discover the finest burgers and pizzas in Addis Ababa at keol Burger & Pizza House.',
        tags: ['welcome', 'about', 'story']
      },
      {
        id: '2',
        title: '20% Off All Pizzas This Weekend',
        slug: '20-percent-off-pizzas-weekend',
        content: `<h1>Special Weekend Offer!</h1>
<p>Enjoy 20% off on all our delicious pizzas this weekend. From our classic Margherita to our special Ethiopian-style pizzas, there's something for everyone.</p>
<p><strong>Offer valid:</strong> Saturday & Sunday only</p>
<p><strong>Code:</strong> PIZZA20</p>`,
        excerpt: 'Get 20% off all pizzas this weekend only!',
        type: 'promotion',
        status: 'published',
        author: 'Marketing Team',
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z',
        publishedAt: '2024-01-16T10:00:00Z',
        seoTitle: '20% Off Pizza Weekend Special - keol Burger',
        seoDescription: 'Limited time offer: 20% off all pizzas this weekend at keol Burger.',
        tags: ['promotion', 'pizza', 'discount', 'weekend']
      },
      {
        id: '3',
        title: 'New Ethiopian Fusion Menu Items',
        slug: 'new-ethiopian-fusion-menu',
        content: `<h1>Exciting New Additions to Our Menu</h1>
<p>We're thrilled to introduce our new Ethiopian fusion items that blend traditional flavors with our signature style.</p>
<h2>New Items Include:</h2>
<ul>
<li>Berbere Spiced Burger</li>
<li>Injera Pizza Base</li>
<li>Doro Wat Wings</li>
</ul>`,
        excerpt: 'Discover our new Ethiopian fusion menu items that blend tradition with innovation.',
        type: 'post',
        status: 'draft',
        author: 'Chef Team',
        createdAt: '2024-01-17T08:00:00Z',
        updatedAt: '2024-01-17T08:30:00Z',
        seoTitle: 'New Ethiopian Fusion Menu - Traditional Meets Modern',
        seoDescription: 'Try our new Ethiopian fusion menu items at keol Burger.',
        tags: ['menu', 'ethiopian', 'fusion', 'new']
      }
    ]

    setTimeout(() => {
      setContentItems(mockContent)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredContent = contentItems.filter(item => {
    const typeMatch = filter === 'all' || item.type === filter
    const statusMatch = statusFilter === 'all' || item.status === statusFilter
    return typeMatch && statusMatch
  })

  const createNewItem = () => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: 'New Content',
      slug: 'new-content',
      content: '',
      excerpt: '',
      type: 'page',
      status: 'draft',
      author: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    }
    
    setSelectedItem(newItem)
    setIsEditing(true)
    setShowEditor(true)
  }

  const editItem = (item: ContentItem) => {
    setSelectedItem(item)
    setIsEditing(true)
    setShowEditor(true)
  }

  const saveItem = async () => {
    if (!selectedItem) return

    try {
      if (selectedItem.id && contentItems.find(item => item.id === selectedItem.id)) {
        // Update existing item
        setContentItems(prev => prev.map(item => 
          item.id === selectedItem.id 
            ? { ...selectedItem, updatedAt: new Date().toISOString() }
            : item
        ))
      } else {
        // Add new item
        setContentItems(prev => [...prev, { 
          ...selectedItem, 
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
      }

      toast.success('Content saved successfully!')
      setShowEditor(false)
      setSelectedItem(null)
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to save content')
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      setContentItems(prev => prev.filter(item => item.id !== id))
      toast.success('Content deleted successfully!')
    }
  }

  const publishItem = async (id: string) => {
    setContentItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: 'published' as const, 
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : item
    ))
    toast.success('Content published successfully!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusConfig = {
    draft: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Draft' },
    published: { color: 'text-green-600', bg: 'bg-green-100', label: 'Published' },
    archived: { color: 'text-red-600', bg: 'bg-red-100', label: 'Archived' }
  }

  const typeConfig = {
    page: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Page' },
    post: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Post' },
    promotion: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Promotion' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']}>
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
                  <FileText className="w-8 h-8 text-brand-red" />
                  Content Management
                </h1>
                <p className="text-gray-600">Manage website content, pages, and promotions</p>
              </div>
              <button
                onClick={createNewItem}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Content
              </button>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="page">Pages</option>
                  <option value="post">Posts</option>
                  <option value="promotion">Promotions</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </motion.div>

            {/* Content List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {filteredContent.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No content found</h3>
                  <p className="text-gray-600 mb-6">Create your first piece of content to get started.</p>
                  <button
                    onClick={createNewItem}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Content
                  </button>
                </div>
              ) : (
                filteredContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[item.type].color} ${typeConfig[item.type].bg}`}>
                            {typeConfig[item.type].label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[item.status].color} ${statusConfig[item.status].bg}`}>
                            {statusConfig[item.status].label}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{item.excerpt}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {item.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(item.updatedAt)}
                          </div>
                          {item.status === 'published' && item.publishedAt && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              Published {formatDate(item.publishedAt)}
                            </div>
                          )}
                        </div>

                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => editItem(item)}
                          className="p-2 text-gray-600 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {item.status === 'draft' && (
                          <button
                            onClick={() => publishItem(item.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>

        {/* Content Editor Modal */}
        <AnimatePresence>
          {showEditor && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowEditor(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {isEditing ? 'Edit Content' : 'View Content'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveItem}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setShowEditor(false)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={selectedItem.title}
                          onChange={(e) => setSelectedItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                          className="input-field"
                          placeholder="Content title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                        <input
                          type="text"
                          value={selectedItem.slug}
                          onChange={(e) => setSelectedItem(prev => prev ? { ...prev, slug: e.target.value } : null)}
                          className="input-field"
                          placeholder="url-friendly-slug"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={selectedItem.type}
                          onChange={(e) => setSelectedItem(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                          className="input-field"
                        >
                          <option value="page">Page</option>
                          <option value="post">Post</option>
                          <option value="promotion">Promotion</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={selectedItem.status}
                          onChange={(e) => setSelectedItem(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                          className="input-field"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                        <input
                          type="text"
                          value={selectedItem.author}
                          onChange={(e) => setSelectedItem(prev => prev ? { ...prev, author: e.target.value } : null)}
                          className="input-field"
                          placeholder="Author name"
                        />
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                      <textarea
                        value={selectedItem.excerpt}
                        onChange={(e) => setSelectedItem(prev => prev ? { ...prev, excerpt: e.target.value } : null)}
                        className="input-field resize-none"
                        rows={3}
                        placeholder="Brief description of the content"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        value={selectedItem.content}
                        onChange={(e) => setSelectedItem(prev => prev ? { ...prev, content: e.target.value } : null)}
                        className="input-field resize-none"
                        rows={12}
                        placeholder="Content (HTML supported)"
                      />
                    </div>

                    {/* SEO */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                        <input
                          type="text"
                          value={selectedItem.seoTitle || ''}
                          onChange={(e) => setSelectedItem(prev => prev ? { ...prev, seoTitle: e.target.value } : null)}
                          className="input-field"
                          placeholder="SEO optimized title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                        <textarea
                          value={selectedItem.seoDescription || ''}
                          onChange={(e) => setSelectedItem(prev => prev ? { ...prev, seoDescription: e.target.value } : null)}
                          className="input-field resize-none"
                          rows={3}
                          placeholder="SEO meta description"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        value={selectedItem.tags.join(', ')}
                        onChange={(e) => setSelectedItem(prev => prev ? { 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                        } : null)}
                        className="input-field"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
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

export default CMSPage
