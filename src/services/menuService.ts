import { supabase } from '@/lib/supabase'

export interface MenuItem {
  id: string
  name: string
  slug: string
  description: string
  price: number
  categoryId: string | null
  categoryName?: string
  image: string
  prepTime: number
  calories?: number
  isVegetarian: boolean
  isSpicy: boolean
  isPopular: boolean
  isAvailable: boolean
  ingredients: string[]
  allergens: string[]
  tags: string[]
  rating?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  sortOrder: number
  isActive: boolean
}

class MenuService {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error

      return data.map(this.mapDatabaseCategoryToCategory)
    } catch (error) {
      console.error('Get categories error:', error)
      return []
    }
  }

  /**
   * Get all menu items with optional filtering
   */
  async getMenuItems(filters?: {
    categoryId?: string
    isPopular?: boolean
    isVegetarian?: boolean
    isSpicy?: boolean
    search?: string
    tags?: string[]
  }): Promise<MenuItem[]> {
    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          categories!menu_items_category_id_fkey (
            name
          )
        `)
        .eq('is_available', true)

      // Apply filters
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters?.isPopular) {
        query = query.eq('is_popular', true)
      }

      if (filters?.isVegetarian) {
        query = query.eq('is_vegetarian', true)
      }

      if (filters?.isSpicy) {
        query = query.eq('is_spicy', true)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      const { data, error } = await query.order('sort_order')

      if (error) throw error

      return data.map(this.mapDatabaseMenuItemToMenuItem)
    } catch (error) {
      console.error('Get menu items error:', error)
      return []
    }
  }

  /**
   * Get menu item by slug
   */
  async getMenuItemBySlug(slug: string): Promise<MenuItem | null> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories!menu_items_category_id_fkey (
            name
          )
        `)
        .eq('slug', slug)
        .eq('is_available', true)
        .single()

      if (error || !data) return null

      return this.mapDatabaseMenuItemToMenuItem(data)
    } catch (error) {
      console.error('Get menu item by slug error:', error)
      return null
    }
  }

  /**
   * Get menu item by ID
   */
  async getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories!menu_items_category_id_fkey (
            name
          )
        `)
        .eq('id', id)
        .eq('is_available', true)
        .single()

      if (error || !data) return null

      return this.mapDatabaseMenuItemToMenuItem(data)
    } catch (error) {
      console.error('Get menu item by ID error:', error)
      return null
    }
  }

  /**
   * Get popular menu items
   */
  async getPopularItems(limit: number = 6): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories!menu_items_category_id_fkey (
            name
          )
        `)
        .eq('is_popular', true)
        .eq('is_available', true)
        .order('sort_order')
        .limit(limit)

      if (error) throw error

      return data.map(this.mapDatabaseMenuItemToMenuItem)
    } catch (error) {
      console.error('Get popular items error:', error)
      return []
    }
  }

  /**
   * Search menu items
   */
  async searchMenuItems(query: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories!menu_items_category_id_fkey (
            name
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,ingredients.cs.{${query}}`)
        .eq('is_available', true)
        .order('is_popular', { ascending: false })

      if (error) throw error

      return data.map(this.mapDatabaseMenuItemToMenuItem)
    } catch (error) {
      console.error('Search menu items error:', error)
      return []
    }
  }

  /**
   * Get menu items by category
   */
  async getMenuItemsByCategory(categorySlug: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories!menu_items_category_id_fkey (
            name,
            slug
          )
        `)
        .eq('categories.slug', categorySlug)
        .eq('is_available', true)
        .order('sort_order')

      if (error) throw error

      return data.map(this.mapDatabaseMenuItemToMenuItem)
    } catch (error) {
      console.error('Get menu items by category error:', error)
      return []
    }
  }

  /**
   * Admin: Create menu item
   */
  async createMenuItem(menuItem: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: menuItem.name,
          slug: menuItem.slug,
          description: menuItem.description,
          price: menuItem.price,
          category_id: menuItem.categoryId,
          image_url: menuItem.image,
          prep_time: menuItem.prepTime,
          calories: menuItem.calories,
          is_vegetarian: menuItem.isVegetarian,
          is_spicy: menuItem.isSpicy,
          is_popular: menuItem.isPopular,
          is_available: menuItem.isAvailable,
          ingredients: menuItem.ingredients,
          allergens: menuItem.allergens,
          tags: menuItem.tags
        })
        .select()
        .single()

      if (error) throw error

      return this.mapDatabaseMenuItemToMenuItem(data)
    } catch (error) {
      console.error('Create menu item error:', error)
      return null
    }
  }

  /**
   * Admin: Update menu item
   */
  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
    try {
      const updateData: any = {}

      if (updates.name) updateData.name = updates.name
      if (updates.slug) updateData.slug = updates.slug
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.price !== undefined) updateData.price = updates.price
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
      if (updates.image !== undefined) updateData.image_url = updates.image
      if (updates.prepTime !== undefined) updateData.prep_time = updates.prepTime
      if (updates.calories !== undefined) updateData.calories = updates.calories
      if (updates.isVegetarian !== undefined) updateData.is_vegetarian = updates.isVegetarian
      if (updates.isSpicy !== undefined) updateData.is_spicy = updates.isSpicy
      if (updates.isPopular !== undefined) updateData.is_popular = updates.isPopular
      if (updates.isAvailable !== undefined) updateData.is_available = updates.isAvailable
      if (updates.ingredients) updateData.ingredients = updates.ingredients
      if (updates.allergens) updateData.allergens = updates.allergens
      if (updates.tags) updateData.tags = updates.tags

      const { error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Update menu item error:', error)
      return false
    }
  }

  /**
   * Admin: Delete menu item
   */
  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Delete menu item error:', error)
      return false
    }
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('tags')
        .eq('is_available', true)

      if (error) throw error

      const allTags = new Set<string>()
      data.forEach(item => {
        item.tags?.forEach((tag: string) => allTags.add(tag))
      })

      return Array.from(allTags).sort()
    } catch (error) {
      console.error('Get all tags error:', error)
      return []
    }
  }

  /**
   * Map database category to application category
   */
  private mapDatabaseCategoryToCategory(dbCategory: any): Category {
    return {
      id: dbCategory.id,
      name: dbCategory.name,
      slug: dbCategory.slug,
      description: dbCategory.description,
      imageUrl: dbCategory.image_url,
      sortOrder: dbCategory.sort_order,
      isActive: dbCategory.is_active
    }
  }

  /**
   * Map database menu item to application menu item
   */
  private mapDatabaseMenuItemToMenuItem(dbItem: any): MenuItem {
    return {
      id: dbItem.id,
      name: dbItem.name,
      slug: dbItem.slug,
      description: dbItem.description || '',
      price: parseFloat(dbItem.price),
      categoryId: dbItem.category_id,
      categoryName: dbItem.categories?.name,
      image: dbItem.image_url || '',
      prepTime: dbItem.prep_time,
      calories: dbItem.calories,
      isVegetarian: dbItem.is_vegetarian,
      isSpicy: dbItem.is_spicy,
      isPopular: dbItem.is_popular,
      isAvailable: dbItem.is_available,
      ingredients: dbItem.ingredients || [],
      allergens: dbItem.allergens || [],
      tags: dbItem.tags || [],
      rating: 4.5 // Mock rating for now
    }
  }
}

export const menuService = new MenuService()
export default menuService
