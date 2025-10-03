/**
 * Get the base URL for the application
 * - In development: returns http://localhost:3000
 * - In production: returns NEXT_PUBLIC_APP_URL (must be set in env vars)
 */
export function getBaseUrl(): string {
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  // In production, use NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Fallback: Try to use VERCEL_URL (Vercel auto-provides this)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Ultimate fallback (shouldn't happen in production)
  return 'http://localhost:3000'
}

/**
 * Get the base URL in client components (browser)
 * - In development: returns http://localhost:3000
 * - In production: returns NEXT_PUBLIC_APP_URL or falls back to window.location.origin
 */
export function getClientBaseUrl(): string {
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  // In production, use NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Fallback to current origin in browser
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // This shouldn't happen, but just in case
  return 'http://localhost:3000'
}
