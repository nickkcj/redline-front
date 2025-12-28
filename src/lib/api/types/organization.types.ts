// ============================================================
// ORGANIZATION TYPES - Alinhado com organization.controller.ts do backend
// ============================================================

import { WorkspaceSummaryDto } from './workspace.types'

// ========== CREATE ORGANIZATION ==========

/**
 * POST /organizations
 * Request para criar organization
 */
export interface CreateOrganizationDto {
  name: string
  description?: string
}

// ========== UPDATE ORGANIZATION ==========

/**
 * PATCH /organizations/:id
 * Request para atualizar organization
 */
export interface UpdateOrganizationDto {
  name?: string
  description?: string
}

// ========== ORGANIZATION RESPONSE ==========

/**
 * Response padrão de organization
 */
export interface OrganizationResponseDto {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /organizations/:id
 * Response de organization com workspaces
 */
export interface OrganizationWithWorkspacesResponseDto {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
  workspaces: WorkspaceSummaryDto[]
}

// ========== ORGANIZATION STATS ==========

/**
 * GET /organizations/:id/stats
 * Response com estatísticas da organization
 */
export interface OrganizationStatsResponse {
  workspacesCount: number
  totalMembersCount: number
}

// ========== ORGANIZATION LIST ==========

/**
 * GET /organizations
 * Response com lista de organizations do usuário
 */
export type OrganizationListResponse = OrganizationResponseDto[]
