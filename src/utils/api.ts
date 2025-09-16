/**
 * API utilities for consistent error handling and response formatting
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

/**
 * Create an error API response
 */
export function createErrorResponse(message: string, error?: string): ApiResponse {
  return {
    success: false,
    message,
    error
  }
}

/**
 * Handle API fetch with proper error handling
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API fetch error:', error)
    
    if (error instanceof ApiError) {
      return createErrorResponse(error.message)
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return createErrorResponse('Network error. Please check your connection.')
    }
    
    return createErrorResponse('An unexpected error occurred. Please try again.')
  }
}

/**
 * Handle form submission with API call
 */
export async function submitForm<T = any>(
  url: string,
  formData: Record<string, any>,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST'
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    method,
    body: JSON.stringify(formData),
  })
}

/**
 * Get user-friendly error message from API error
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.error) {
    return error.error
  }
  
  return 'An unexpected error occurred'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return error instanceof TypeError && error.message.includes('fetch')
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return error?.status === 401 || error?.code === 'UNAUTHORIZED'
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  return error?.status === 400 || error?.code === 'VALIDATION_ERROR'
}

/**
 * Retry API call with exponential backoff
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall()
      
      if (result.success || !isNetworkError(lastError)) {
        return result
      }
      
      lastError = result
    } catch (error) {
      lastError = error
      
      if (!isNetworkError(error) || attempt === maxRetries) {
        throw error
      }
    }
    
    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export class ApiError extends Error {
  public status: number
  public code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'ApiError'
  }
}
