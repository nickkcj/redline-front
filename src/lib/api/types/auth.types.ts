// ============================================================
// AUTH TYPES - Alinhado com auth.controller.ts do backend
// ============================================================

import { UserDTO } from './user.types'

// ========== GOOGLE AUTH ==========

/**
 * GET /auth/google/init
 * Query params para inicializar Google OAuth
 */
export interface GoogleAuthInitQuery {
  callback_url: string
}

/**
 * Response de /auth/google/init
 */
export interface GoogleAuthUrlResponse {
  authUrl: string
}

/**
 * Google Profile (usado internamente no callback)
 */
export interface GoogleProfile {
  googleId: string
  email: string
  firstName?: string
  lastName?: string
  picture?: string
  accessToken: string
}

/**
 * POST /auth/google/callback
 * Body para callback do Google OAuth (POST alternativo)
 */
export interface GoogleAuthCallbackRequest {
  code: string
  callback_url: string
}

/**
 * Response do Google Auth (sucesso)
 */
export interface GoogleAuthResponse {
  success: boolean
  sessionToken: string
  user: UserDTO
}

// ========== MAGIC LINK AUTH ==========

/**
 * POST /auth/email/init
 * Request para solicitar magic link
 */
export interface MagicLinkInitRequest {
  email: string
}

/**
 * Response de /auth/email/init
 */
export interface MagicLinkInitResponse {
  message: string
  success: boolean
}

/**
 * POST /auth/email/callback
 * Request para verificar magic link
 */
export interface MagicLinkCallbackRequest {
  token: string
}

/**
 * Response de /auth/email/callback
 */
export interface MagicLinkCallbackResponse {
  success: boolean
  sessionToken: string
  user: UserDTO
}

// ========== COMMON AUTH ==========

/**
 * POST /auth/logout
 * Response do logout
 */
export interface LogoutResponse {
  success: boolean
  message: string
}

/**
 * GET /auth/me
 * Response com dados do usuário atual (retorna User do Prisma)
 */
export type MeResponse = UserDTO

// ========== TOKEN STORAGE ==========

/**
 * Token data armazenado no localStorage
 * Backend retorna sessionToken (não accessToken/refreshToken)
 */
export interface TokenData {
  sessionToken: string
  expiresIn?: number // Optional, defaults to 24 hours
}

// ========== AUTH STATE ==========

export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  user: UserDTO | null
  status: AuthStatus
  isLoading: boolean
  error: string | null
}
