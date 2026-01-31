import { apiClient } from '@/lib/api/client/base.client'
import type {
  PermissionDto,
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '@/lib/api/types/permission.types'

export class PermissionService {
  static async getMyPermissions(workspaceId: string): Promise<string[]> {
    return apiClient.get<string[]>(`/workspaces/${workspaceId}/permissions/me`)
  }

  static async getAllPermissions(workspaceId: string): Promise<PermissionDto[]> {
    return apiClient.get<PermissionDto[]>(`/workspaces/${workspaceId}/permissions/available`)
  }

  static async listRoles(workspaceId: string): Promise<RoleDto[]> {
    return apiClient.get<RoleDto[]>(`/workspaces/${workspaceId}/permissions/roles`)
  }

  static async getRole(workspaceId: string, roleId: string): Promise<RoleDto> {
    return apiClient.get<RoleDto>(`/workspaces/${workspaceId}/permissions/roles/${roleId}`)
  }

  static async createRole(workspaceId: string, data: CreateRoleDto): Promise<RoleDto> {
    return apiClient.post<RoleDto>(`/workspaces/${workspaceId}/permissions/roles`, data)
  }

  static async updateRole(workspaceId: string, roleId: string, data: UpdateRoleDto): Promise<RoleDto> {
    return apiClient.put<RoleDto>(
      `/workspaces/${workspaceId}/permissions/roles/${roleId}`,
      data
    )
  }

  static async deleteRole(workspaceId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/permissions/roles/${roleId}`)
  }

  static async addPermissionToRole(
    workspaceId: string,
    roleId: string,
    permission: PermissionDto
  ): Promise<RoleDto> {
    return apiClient.post<RoleDto>(
      `/workspaces/${workspaceId}/permissions/roles/${roleId}/permissions`,
      permission
    )
  }

  static async removePermissionFromRole(
    workspaceId: string,
    roleId: string,
    permissionId: string
  ): Promise<RoleDto> {
    return apiClient.delete<RoleDto>(
      `/workspaces/${workspaceId}/permissions/roles/${roleId}/permissions/${permissionId}`
    )
  }
}

export const permissionService = PermissionService
