import { apiClient } from '@/lib/api/client/base.client'
import { mockApiClient, MOCK_MODE } from '../mock/mock-client'
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
    if (MOCK_MODE) {
      console.log('[ORG-SERVICE] Using MOCK mode for getOrganizations')
      return mockApiClient.getOrganizations()
    }
    return apiClient.get<OrganizationWithWorkspaces[]>('/organizations')
  }

  static async createOrganization(data: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    if (MOCK_MODE) {
      console.log('[ORG-SERVICE] Using MOCK mode for createOrganization')
      return mockApiClient.createOrganization(data) as any
    }
    return apiClient.post<OrganizationResponseDto>('/organizations', data)
  }

  static async updateOrganization(id: string, data: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    if (MOCK_MODE) {
      console.log('[ORG-SERVICE] Using MOCK mode for updateOrganization')
      return mockApiClient.updateOrganization(id, data) as any
    }
    return apiClient.patch<OrganizationResponseDto>(`/organizations/${id}`, data)
  }

  static async deleteOrganization(id: string): Promise<void> {
    if (MOCK_MODE) {
      console.log('[ORG-SERVICE] Using MOCK mode for deleteOrganization')
      return mockApiClient.deleteOrganization(id)
    }
    return apiClient.delete<void>(`/organizations/${id}`)
  }

  static async createWorkspace(data: CreateWorkspaceDto): Promise<WorkspaceSummary> {
    if (MOCK_MODE) {
      console.log('[ORG-SERVICE] Using MOCK mode for createWorkspace')
      return mockApiClient.createWorkspace(data.organizationId, data) as any
    }
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
    if (MOCK_MODE) {
      console.log('[ORG-SERVICE] Using MOCK mode for updateWorkspace')
      return mockApiClient.updateWorkspace(id, data) as any
    }
    return apiClient.patch<WorkspaceSummary>(`/workspaces/${id}`, data)
  }

  static async deleteWorkspace(id: string): Promise<void> {
    if (MOCK_MODE) {
      console.log('[ORG-SERVICE] Using MOCK mode for deleteWorkspace')
      return mockApiClient.deleteWorkspace(id)
    }
    return apiClient.delete<void>(`/workspaces/${id}`)
  }

  static async leaveWorkspace(id: string): Promise<void> {
    if (MOCK_MODE) {
      console.log('[ORG-SERVICE] Using MOCK mode for leaveWorkspace')
      return mockApiClient.deleteWorkspace(id)
    }
    return apiClient.post<void>(`/workspaces/${id}/leave`)
  }
}

export const organizationService = OrganizationService
