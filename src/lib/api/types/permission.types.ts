// ============================================================
// PERMISSION TYPES - Alinhado com permissions.controller.ts do backend
// ============================================================

// ========== ROLE ==========

export interface RoleDto {
  id: string
  name: string
  description?: string
  workspaceId: string
  permissions: PermissionDto[]
  createdAt: Date
  updatedAt: Date
}

export interface RoleLight {
  id: string
  name: string
  description?: string
}

// ========== PERMISSION ==========

export interface PermissionDto {
  id: string
  name: string
  description?: string
  resource: string
  action: string
  scope: 'own' | 'all'
}

// ========== CREATE ROLE ==========

/**
 * POST /workspaces/:workspaceId/permissions/roles
 * Request para criar role
 */
export interface CreateRoleDto {
  name: string
  description?: string
  permissions?: string[] // Array de permission IDs
}

// ========== UPDATE ROLE ==========

/**
 * PUT /workspaces/:workspaceId/permissions/roles/:roleId
 * Request para atualizar role
 */
export interface UpdateRoleDto {
  name?: string
  description?: string
}

// ========== ADD PERMISSION TO ROLE ==========

/**
 * POST /workspaces/:workspaceId/permissions/roles/:roleId/permissions
 * Request para adicionar permissão a role
 */
export interface AddPermissionToRoleDto {
  permissionId: string
}

// ========== MEMBER WITH ROLES ==========

export interface MemberDto {
  id: string
  userId: string
  workspaceId: string
  roles: RoleLight[]
  joinedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

// ========== ADD MEMBER ==========

/**
 * POST /workspaces/:workspaceId/permissions/members
 * Request para adicionar membro
 */
export interface AddMemberDto {
  userId: string
  roleIds?: string[]
}

// ========== UPDATE MEMBER ROLE ==========

/**
 * PUT /workspaces/:workspaceId/permissions/members/:memberId/role
 * Request para atualizar role do membro
 */
export interface UpdateMemberRoleDto {
  roleIds: string[]
}

// ========== ROLE LIST ==========

/**
 * GET /workspaces/:workspaceId/permissions/roles
 * Response com lista de roles
 */
export type RoleListResponse = RoleDto[]

// ========== MEMBER LIST ==========

/**
 * GET /workspaces/:workspaceId/permissions/members
 * Response com lista de membros
 */
export type MemberListResponse = MemberDto[]
