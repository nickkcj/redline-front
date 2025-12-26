/**
 * Permission Service
 *
 * Handles all API calls related to permissions and roles
 * Follows scaffold pattern: Service → Hook → Component
 */

import { apiClient } from '@/lib/api/client/base.client'
import type {
  PermissionEntity,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  PermissionDto,
} from '@/types/permissions'

class PermissionService {
  /**
   * Get current user's permissions for a workspace
   * @param workspaceId - Workspace ID
   * @returns Array of permission strings (e.g., ["chat.read.all", "document.write.own"])
   */
  async getMyPermissions(workspaceId: string): Promise<string[]> {
    try {
      return await apiClient.get<string[]>(`/workspaces/${workspaceId}/permissions/me`)
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Get all available permissions in the system
   * @param workspaceId - Workspace ID
   * @returns Array of permission entities with descriptions
   */
  async getAllPermissions(workspaceId: string): Promise<PermissionEntity[]> {
    try {
      return await apiClient.get<PermissionEntity[]>(`/workspaces/${workspaceId}/permissions`)
    } catch (error: any) {
      throw error
    }
  }

  // ============================================================================
  // Role Management
  // ============================================================================

  /**
   * List all roles in a workspace
   * @param workspaceId - Workspace ID
   * @returns Array of roles with permissions and member count
   */
  async listRoles(workspaceId: string): Promise<Role[]> {
    try {
      return await apiClient.get<Role[]>(`/workspaces/${workspaceId}/permissions/roles`)
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Get a specific role by ID
   * @param workspaceId - Workspace ID
   * @param roleId - Role ID
   * @returns Role with permissions
   */
  async getRole(workspaceId: string, roleId: string): Promise<Role> {
    try {
      return await apiClient.get<Role>(`/workspaces/${workspaceId}/permissions/roles/${roleId}`)
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Create a new role
   * @param workspaceId - Workspace ID
   * @param data - Role creation data (name, displayName, description, permissions)
   * @returns Created role
   */
  async createRole(workspaceId: string, data: CreateRoleDto): Promise<Role> {
    try {
      return await apiClient.post<Role>(`/workspaces/${workspaceId}/permissions/roles`, data)
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Update a role (displayName and description only)
   * @param workspaceId - Workspace ID
   * @param roleId - Role ID
   * @param data - Update data (displayName, description)
   * @returns Updated role
   */
  async updateRole(workspaceId: string, roleId: string, data: UpdateRoleDto): Promise<Role> {
    try {
      return await apiClient.put<Role>(
        `/workspaces/${workspaceId}/permissions/roles/${roleId}`,
        data
      )
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Delete a role
   * @param workspaceId - Workspace ID
   * @param roleId - Role ID
   */
  async deleteRole(workspaceId: string, roleId: string): Promise<void> {
    try {
      await apiClient.delete(`/workspaces/${workspaceId}/permissions/roles/${roleId}`)
    } catch (error: any) {
      throw error
    }
  }

  // ============================================================================
  // Role Permissions Management
  // ============================================================================

  /**
   * Add a permission to a role
   * @param workspaceId - Workspace ID
   * @param roleId - Role ID
   * @param permission - Permission to add (resource, action, scope)
   * @returns Updated role with new permission
   */
  async addPermissionToRole(
    workspaceId: string,
    roleId: string,
    permission: PermissionDto
  ): Promise<Role> {
    try {
      return await apiClient.post<Role>(
        `/workspaces/${workspaceId}/permissions/roles/${roleId}/permissions`,
        permission
      )
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Remove a permission from a role
   * @param workspaceId - Workspace ID
   * @param roleId - Role ID
   * @param permissionId - Permission ID to remove
   * @returns Updated role without the permission
   */
  async removePermissionFromRole(
    workspaceId: string,
    roleId: string,
    permissionId: string
  ): Promise<Role> {
    try {
      return await apiClient.delete<Role>(
        `/workspaces/${workspaceId}/permissions/roles/${roleId}/permissions/${permissionId}`
      )
    } catch (error: any) {
      throw error
    }
  }
}

export default new PermissionService()
