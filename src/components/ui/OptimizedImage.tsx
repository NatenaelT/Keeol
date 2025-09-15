'use client'

import { useState, useEffect, useRef } from 'react'
import { lazyImageLoader, networkMonitor } from '@/utils/performance'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  quality?: 'low' | 'medium' | 'high'
  loading?: 'lazy' | 'eager'
  priority?: boolean
  fallback?: string
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  quality = 'medium',
  loading = 'lazy',
  priority = false,
  fallback,
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)

  // Generate optimized image URL based on network conditions
  const getOptimizedSrc = () => {
    const isSlowConnection = networkMonitor.isSlowConnection()
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_CDN || ''
    
    // Quality mapping based on connection and preference
    const qualityMap = {
      low: isSlowConnection ? 40 : 60,
      medium: isSlowConnection ? 60 : 80,
      high: isSlowConnection ? 80 : 90
    }
    
    const targetQuality = qualityMap[quality]
    
    // If using a CDN, add optimization parameters
    if (baseUrl && src.startsWith('http')) {
      const url = new URL(src)
      url.searchParams.set('q', targetQuality.toString())
      if (width) url.searchParams.set('w', width.toString())
      if (height) url.searchParams.set('h', height.toString())
      url.searchParams.set('f', 'webp')
      return url.toString()
    }
    
    return src
  }

  // Generate placeholder image
  const getPlaceholder = () => {
    if (placeholder) return placeholder
    
    // Generate a simple colored placeholder
    const canvas = document.createElement('canvas')
    canvas.width = width || 400
    canvas.height = height || 300
    const ctx = canvas.getContext('2d')!
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#DC2626') // brand-red
    gradient.addColorStop(1, '#FBBF24') // brand-yellow
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2)
    
    return canvas.toDataURL('image/jpeg', 0.1)
  }

  useEffect(() => {
    if (priority || loading === 'eager') {
      // Load immediately for priority images
      setImageSrc(getOptimizedSrc())
    } else {
      // Use intersection observer for lazy loading
      const img = imgRef.current
      if (img) {
        img.dataset.src = getOptimizedSrc()
        lazyImageLoader.observe(img)
      }
    }
  }, [src, quality, priority, loading])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    if (fallback) {
      setImageSrc(fallback)
    }
    onError?.()
  }

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (img.dataset.src && !imageSrc) {
      setImageSrc(img.dataset.src)
    }
    handleLoad()
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Low quality image */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-brand-red to-brand-yellow flex items-center justify-center"
          style={{ 
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!placeholder && (
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={priority || loading === 'eager' ? imageSrc : undefined}
        data-src={loading === 'lazy' ? getOptimizedSrc() : undefined}
        alt={alt}
        width={width}
        height={height}
        className={`responsive-image transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${hasError ? 'hidden' : ''}`}
        onLoad={handleImageLoad}
        onError={handleError}
        loading={loading}
      />

      {/* Error fallback */}
      {hasError && !fallback && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Loading indicator overlay */}
      {!isLoaded && !hasError && loading === 'lazy' && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
      )}
    </div>
  )
}

export default OptimizedImage
