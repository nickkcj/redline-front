// ============================================================
// TOKEN STORE - Gerenciamento centralizado de tokens
// Alinhado com backend: usa sessionToken (não accessToken/refreshToken)
// ============================================================

import type { ITokenStore, TokenSubscriber, TokenData } from './types'

class TokenStore implements ITokenStore {
  private static instance: TokenStore
  private subscribers: Set<TokenSubscriber> = new Set()

  // Keys no localStorage
  private readonly SESSION_TOKEN_KEY = 'session_token'
  private readonly EXPIRES_AT_KEY = 'token_expires_at'

  constructor() {
    // Listen for storage changes to detect external updates
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.SESSION_TOKEN_KEY) {
          this.notifySubscribers()
        }
      })
    }
  }

  static getInstance(): TokenStore {
    if (!TokenStore.instance) {
      TokenStore.instance = new TokenStore()
    }
    return TokenStore.instance
  }

  private isClient(): boolean {
    return typeof window !== 'undefined'
  }

  /**
   * Salva sessionToken no localStorage
   */
  setTokens(tokens: TokenData): void {
    if (!this.isClient()) return

    localStorage.setItem(this.SESSION_TOKEN_KEY, tokens.sessionToken)

    // Set expiresAt if expiresIn is provided, otherwise set a default (24 hours)
    if (tokens.expiresIn) {
      const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000).getTime()
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString())
    } else {
      // Default to 24 hours if expiresIn is not provided
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).getTime()
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString())
    }

    this.notifySubscribers()
  }

  /**
   * Retorna sessionToken
   */
  getSessionToken(): string | null {
    if (!this.isClient()) return null
    return localStorage.getItem(this.SESSION_TOKEN_KEY)
  }

  /**
   * Retorna timestamp de expiração
   */
  getExpiresAt(): number | null {
    if (!this.isClient()) return null
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY)
    return expiresAt ? parseInt(expiresAt, 10) : null
  }

  /**
   * Verifica se token está expirado
   * Considera expirado se faltar menos de 5 minutos
   */
  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt()
    if (!expiresAt) return true

    // Consider token expired if it expires in the next 5 minutes
    return Date.now() >= (expiresAt - 5 * 60 * 1000)
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const sessionToken = this.getSessionToken()
    return !!sessionToken && !this.isTokenExpired()
  }

  /**
   * Limpa todos os tokens
   */
  clear(): void {
    if (!this.isClient()) return

    localStorage.removeItem(this.SESSION_TOKEN_KEY)
    localStorage.removeItem(this.EXPIRES_AT_KEY)

    this.notifySubscribers()
  }

  /**
   * Subscribe to token changes
   */
  subscribe(callback: TokenSubscriber): () => void {
    this.subscribers.add(callback)

    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Manual trigger for notifications
   */
  triggerUpdate(): void {
    this.notifySubscribers()
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback())
  }
}

export const tokenStore = TokenStore.getInstance()
