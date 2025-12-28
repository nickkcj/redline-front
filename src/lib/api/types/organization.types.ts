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

export interface OrganizationResponseDto {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceSummary {
  id: string
  name: string
  description?: string
  membersCount?: number
  teamsCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface OrganizationWithWorkspaces {
  id: string
  name: string
  description?: string
  ownerId?: string
  masterMemberId?: string
  createdAt?: string
  updatedAt?: string
  workspaces?: WorkspaceSummary[]
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
