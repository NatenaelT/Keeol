// Performance optimization utilities for low-bandwidth devices

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function to limit function execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null
  
  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              if (img.dataset.src) {
                img.src = img.dataset.src
                img.removeAttribute('data-src')
                this.observer?.unobserve(img)
              }
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      )
    }
  }
  
  observe(element: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(element)
    }
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

/**
 * Compress and optimize images
 */
export function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Network speed detection
 */
export class NetworkMonitor {
  private connection: any = null
  
  constructor() {
    if (typeof navigator !== 'undefined') {
      this.connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection
    }
  }
  
  getConnectionType(): string {
    if (!this.connection) return 'unknown'
    return this.connection.effectiveType || 'unknown'
  }
  
  isSlowConnection(): boolean {
    const connectionType = this.getConnectionType()
    return ['slow-2g', '2g'].includes(connectionType)
  }
  
  isFastConnection(): boolean {
    const connectionType = this.getConnectionType()
    return ['4g'].includes(connectionType)
  }
  
  getDownlinkSpeed(): number {
    return this.connection?.downlink || 0
  }
  
  getRTT(): number {
    return this.connection?.rtt || 0
  }
}

/**
 * Local storage with compression
 */
export class CompressedStorage {
  static set(key: string, value: any): void {
    try {
      const compressed = this.compress(JSON.stringify(value))
      localStorage.setItem(key, compressed)
    } catch (error) {
      console.warn('Failed to store data:', error)
    }
  }
  
  static get<T>(key: string): T | null {
    try {
      const compressed = localStorage.getItem(key)
      if (!compressed) return null
      
      const decompressed = this.decompress(compressed)
      return JSON.parse(decompressed)
    } catch (error) {
      console.warn('Failed to retrieve data:', error)
      return null
    }
  }
  
  static remove(key: string): void {
    localStorage.removeItem(key)
  }
  
  private static compress(str: string): string {
    // Simple compression using btoa (base64)
    // In production, consider using a proper compression library
    return btoa(encodeURIComponent(str))
  }
  
  private static decompress(str: string): string {
    return decodeURIComponent(atob(str))
  }
}

/**
 * Cache manager for API responses
 */
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttlMinutes: number = 10): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

/**
 * Bundle size analyzer
 */
export function analyzeBundle(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Analysis:')
    console.log('- Initial bundle loaded')
    console.log('- Connection type:', new NetworkMonitor().getConnectionType())
    console.log('- Memory usage:', (performance as any).memory?.usedJSHeapSize || 'N/A')
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  const criticalAssets = [
    '/fonts/inter.woff2',
    '/fonts/poppins.woff2',
    // Add other critical assets
  ]
  
  criticalAssets.forEach(asset => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = asset
    link.as = asset.includes('.woff') ? 'font' : 'image'
    if (link.as === 'font') {
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

/**
 * Optimize animations based on device performance
 */
export function getOptimizedAnimationSettings(): {
  duration: number
  ease: string
  reducedMotion: boolean
} {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isSlowDevice = navigator.hardwareConcurrency <= 2
  const isSlowConnection = new NetworkMonitor().isSlowConnection()
  
  if (prefersReducedMotion || isSlowDevice || isSlowConnection) {
    return {
      duration: 0.1,
      ease: 'linear',
      reducedMotion: true
    }
  }
  
  return {
    duration: 0.3,
    ease: 'easeInOut',
    reducedMotion: false
  }
}

/**
 * Virtual scrolling for large lists
 */
export class VirtualScroller {
  private container: HTMLElement
  private itemHeight: number
  private items: any[]
  private visibleRange: { start: number; end: number } = { start: 0, end: 0 }
  
  constructor(container: HTMLElement, itemHeight: number, items: any[]) {
    this.container = container
    this.itemHeight = itemHeight
    this.items = items
    this.calculateVisibleRange()
    this.bindScrollEvent()
  }
  
  private calculateVisibleRange(): void {
    const containerHeight = this.container.clientHeight
    const scrollTop = this.container.scrollTop
    
    const start = Math.floor(scrollTop / this.itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / this.itemHeight) + 1,
      this.items.length
    )
    
    this.visibleRange = { start, end }
  }
  
  private bindScrollEvent(): void {
    this.container.addEventListener('scroll', 
      throttle(() => this.calculateVisibleRange(), 16)
    )
  }
  
  getVisibleItems(): any[] {
    return this.items.slice(this.visibleRange.start, this.visibleRange.end)
  }
  
  getVisibleRange(): { start: number; end: number } {
    return this.visibleRange
  }
}

/**
 * Progressive image loading
 */
export function createProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string,
  alt: string
): HTMLImageElement {
  const img = document.createElement('img')
  img.alt = alt
  img.src = lowQualitySrc
  img.style.filter = 'blur(5px)'
  img.style.transition = 'filter 0.3s'
  
  const highQualityImg = new Image()
  highQualityImg.onload = () => {
    img.src = highQualitySrc
    img.style.filter = 'none'
  }
  highQualityImg.src = highQualitySrc
  
  return img
}

// Export performance monitor instance
export const networkMonitor = new NetworkMonitor()
export const cacheManager = new CacheManager()
export const lazyImageLoader = new LazyImageLoader()

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Run analysis on load
  window.addEventListener('load', analyzeBundle)
  
  // Preload critical resources
  document.addEventListener('DOMContentLoaded', preloadCriticalResources)
}
