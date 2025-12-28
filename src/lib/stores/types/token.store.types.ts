// ============================================================
// TOKEN STORE TYPES - Tipagens do gerenciamento de tokens
// ============================================================

import type { TokenData } from '@/lib/api/types'

/**
 * Subscriber callback para mudanças no token
 */
export type TokenSubscriber = () => void

/**
 * Interface do Token Store
 */
export interface ITokenStore {
  /**
   * Salva sessionToken no localStorage
   */
  setTokens(tokens: TokenData): void

  /**
   * Retorna sessionToken
   */
  getSessionToken(): string | null

  /**
   * Retorna timestamp de expiração
   */
  getExpiresAt(): number | null

  /**
   * Verifica se token está expirado
   * Considera expirado se faltar menos de 5 minutos
   */
  isTokenExpired(): boolean

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean

  /**
   * Limpa todos os tokens
   */
  clear(): void

  /**
   * Subscribe to token changes
   */
  subscribe(callback: TokenSubscriber): () => void

  /**
   * Manual trigger for notifications
   */
  triggerUpdate(): void
}

// Re-export TokenData para conveniência
export type { TokenData }
