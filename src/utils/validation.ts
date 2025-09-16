/**
 * Validation utilities for the application
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate Ethiopian phone number
 */
export function validateEthiopianPhone(phone: string): ValidationResult {
  const errors: string[] = []
  
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required')
    return { isValid: false, errors }
  }

  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length < 9) {
    errors.push('Phone number is too short')
  } else if (cleanPhone.startsWith('251')) {
    if (cleanPhone.length !== 12 || !/^251[97]\d{8}$/.test(cleanPhone)) {
      errors.push('Please enter a valid Ethiopian phone number (+251 9X XXX XXXX)')
    }
  } else if (cleanPhone.startsWith('09') || cleanPhone.startsWith('07')) {
    if (cleanPhone.length !== 10 || !/^0[97]\d{8}$/.test(cleanPhone)) {
      errors.push('Please enter a valid Ethiopian phone number (09X XXX XXXX or 07X XXX XXXX)')
    }
  } else {
    errors.push('Please enter a valid Ethiopian phone number')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Validate password
 */
export function validatePassword(password: string, minLength: number = 6): ValidationResult {
  const errors: string[] = []
  
  if (!password || password.trim() === '') {
    errors.push('Password is required')
    return { isValid: false, errors }
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }

  if (password.length > 100) {
    errors.push('Password is too long')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Validate name
 */
export function validateName(name: string, minLength: number = 2): ValidationResult {
  const errors: string[] = []
  
  if (!name || name.trim() === '') {
    errors.push('Name is required')
    return { isValid: false, errors }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < minLength) {
    errors.push(`Name must be at least ${minLength} characters long`)
  }

  if (trimmedName.length > 100) {
    errors.push('Name is too long')
  }

  // Check for valid characters (letters, spaces, and common punctuation)
  if (!/^[a-zA-Z\s\u1200-\u137F\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/.test(trimmedName)) {
    errors.push('Name contains invalid characters')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Validate email (optional)
 */
export function validateEmail(email: string, required: boolean = false): ValidationResult {
  const errors: string[] = []
  
  if (!email || email.trim() === '') {
    if (required) {
      errors.push('Email is required')
    }
    return { isValid: !required, errors }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Format Ethiopian phone number for display
 */
export function formatEthiopianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  
  if (digits.startsWith('251')) {
    if (digits.length >= 12) {
      return '+251 ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 12)
    }
    return '+251 ' + digits.slice(3)
  } else if (digits.startsWith('09') || digits.startsWith('07')) {
    if (digits.length >= 10) {
      return '+251 ' + digits.slice(1, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 10)
    }
    return '+251 ' + digits.slice(1)
  } else if (digits.length > 0) {
    if (digits.length >= 9) {
      return '+251 ' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 9)
    }
    return '+251 ' + digits
  }
  
  return phone
}

/**
 * Clean and normalize phone number
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  
  if (digits.startsWith('251')) {
    return '+' + digits
  } else if (digits.startsWith('09') || digits.startsWith('07')) {
    return '+251' + digits.slice(1)
  } else if (digits.length === 9) {
    return '+251' + digits
  }
  
  return phone
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '')
}

/**
 * Check if string is safe (no potential XSS)
 */
export function isSafeString(input: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}
