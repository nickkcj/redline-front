import { apiClient } from '@/lib/api/client/base.client'
import type {
  OrganizationResponseDto,
  OrganizationWithWorkspaces,
  WorkspaceSummary,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '@/lib/api/types/organization.types'
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '@/lib/api/types/workspace.types'

export class OrganizationService {
  static async getOrganizations(): Promise<OrganizationWithWorkspaces[]> {
    return apiClient.get<OrganizationWithWorkspaces[]>('/organizations')
  }

  static async createOrganization(data: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    return apiClient.post<OrganizationResponseDto>('/organizations', data)
  }

  static async updateOrganization(id: string, data: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    return apiClient.patch<OrganizationResponseDto>(`/organizations/${id}`, data)
  }

  static async deleteOrganization(id: string): Promise<void> {
    return apiClient.delete<void>(`/organizations/${id}`)
  }

  static async createWorkspace(data: CreateWorkspaceDto): Promise<WorkspaceSummary> {
    return apiClient.post<WorkspaceSummary>(
      `/workspaces`,
      {
        name: data.name,
        description: data.description,
        organizationId: data.organizationId,
      }
    )
  }

  static async updateWorkspace(id: string, data: UpdateWorkspaceDto): Promise<WorkspaceSummary> {
    return apiClient.patch<WorkspaceSummary>(`/workspaces/${id}`, data)
  }

  static async deleteWorkspace(id: string): Promise<void> {
    return apiClient.delete<void>(`/workspaces/${id}`)
  }

  static async leaveWorkspace(id: string): Promise<void> {
    return apiClient.post<void>(`/workspaces/${id}/leave`)
  }
}

export const organizationService = OrganizationService
