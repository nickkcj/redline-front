/**
 * Permission Types
 *
 * Defines types for Role-Based Access Control (RBAC) system
 * Permission format: resource.action.scope (e.g., "chat.read.all")
 */

import { User } from './common'

// ============================================================================
// Permission Core Types
// ============================================================================

/**
 * Permission string format: resource.action.scope
 * Examples: "chat.read.all", "document.write.own", "workspace.admin"
 */
export type Permission = string

/**
 * Permission scope determines access level
 * - all: Access to all resources
 * - own: Access only to user's own resources
 *
 * Hierarchy: "all" grants access to "own"
 */
export enum PermissionScope {
  ALL = 'all',
  OWN = 'own',
}

/**
 * Permission actions
 */
export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  UPLOAD = 'upload',
}

/**
 * Permission resources (core scaffold resources)
 */
export enum PermissionResource {
  CHAT = 'chat',
  WORKSPACE = 'workspace',
  DOCUMENT = 'document',
  MEMBER = 'member',
  ROLE = 'role',
}

// ============================================================================
// Permission Entity
// ============================================================================

/**
 * Permission entity from backend
 */
export interface PermissionEntity {
  id: string
  resource: string
  action: string
  scope: string | null
  description: string | null
}

// ============================================================================
// Role Types
// ============================================================================

/**
 * Role entity from backend
 */
export interface Role {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
  workspaceId: string
  createdAt: string
  updatedAt: string
  permissions: PermissionEntity[]
  _count?: {
    members: number
  }
}

/**
 * Role without full permission details (lightweight)
 */
export interface RoleLight {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
}

// ============================================================================
// Workspace Member Types
// ============================================================================

/**
 * Legacy workspace role enum (kept for backward compatibility)
 */
export enum WorkspaceRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * Workspace member with roles and permissions
 */
export interface WorkspaceMemberWithRoles {
  id: string
  userId: string
  workspaceId: string
  role: WorkspaceRole // Legacy field
  createdAt: string
  updatedAt: string
  user: User
  roles: Role[]
}

// ============================================================================
// DTOs - Role Management
// ============================================================================

/**
 * DTO for creating a new role
 */
export interface CreateRoleDto {
  name: string
  displayName: string
  description?: string
  permissions?: PermissionDto[]
}

/**
 * DTO for updating a role
 */
export interface UpdateRoleDto {
  displayName?: string
  description?: string
}

/**
 * DTO for permission (used when adding permission to role)
 */
export interface PermissionDto {
  resource: string
  action: string
  scope?: string
}

// ============================================================================
// DTOs - Member Management
// ============================================================================

/**
 * DTO for adding a member to workspace
 */
export interface AddMemberDto {
  email: string
  role?: WorkspaceRole
}

/**
 * DTO for updating member's legacy role
 */
export interface UpdateMemberRoleDto {
  role: WorkspaceRole
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * Grouped permissions for UI display
 * Groups permissions by resource for better organization
 */
export interface GroupedPermissions {
  resource: string
  permissions: PermissionEntity[]
}

/**
 * Permission check result
 */
export interface PermissionCheck {
  hasPermission: boolean
  isLoading: boolean
}
