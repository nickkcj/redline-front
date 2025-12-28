// ============================================================
// USER TYPES - Alinhado com users.controller.ts e user.dto.ts do backend
// ============================================================

import { WorkspaceRole } from './common.types'

// ========== ORGANIZATION DTO ==========

export interface OrganizationDTO {
  id: string
  name: string
  description: string | null
}

// ========== WORKSPACE DTO ==========

export interface WorkspaceDTO {
  id: string
  name: string
  description: string | null
  role: WorkspaceRole
  organization: OrganizationDTO
}

// ========== USER DTO ==========

/**
 * GET /users
 * Response com dados completos do usuário autenticado
 */
export interface UserDTO {
  id: string
  google_id: string | null
  email: string
  name: string | null
  image: string | null
  createdAt: Date
  updatedAt: Date
  workspaces: WorkspaceDTO[]
}

// ========== UPDATE USER SETTINGS ==========

/**
 * POST /users/profile-image
 * Request para upload de imagem de perfil (FormData)
 */
export interface UploadProfileImageRequest {
  image: File
}

/**
 * Response do upload de imagem de perfil
 */
export type UploadProfileImageResponse = UserDTO
