/**
 * Get Dynamic Headers for API requests
 * Returns authentication headers dynamically from token store
 * Used primarily for document viewing and file access
 */

import { tokenStore } from '@/lib/stores/token.store'

export interface DynamicHeaders {
  'x-parse-session-token'?: string
  'X-API-Key': string
  'X-Parse-Application-Id': string
}

/**
 * Returns dynamic headers for authenticated requests
 * Includes session token and API key from environment
 */
export function getDynamicHeaders(): DynamicHeaders {
  const sessionToken = tokenStore.getSessionToken()
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''

  const headers: DynamicHeaders = {
    'X-API-Key': apiKey,
    'X-Parse-Application-Id': apiKey, // Using same as API key for compatibility
  }

  if (sessionToken) {
    headers['x-parse-session-token'] = sessionToken
  }

  return headers
}
