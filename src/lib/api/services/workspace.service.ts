import { apiClient } from '../client/base.client'
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceResponseDto,
  WorkspaceListResponse,
} from '../types'

export class WorkspaceService {
  static async list(): Promise<WorkspaceListResponse> {
    return apiClient.get<WorkspaceListResponse>('/v1/workspaces')
  }

  static async create(data: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    return apiClient.post<WorkspaceResponseDto>('/v1/workspaces', data)
  }

  static async listByOrganization(organizationId: string): Promise<WorkspaceListResponse> {
    return apiClient.get<WorkspaceListResponse>(`/v1/workspaces/organization/${organizationId}`)
  }

  static async getById(workspaceId: string): Promise<WorkspaceResponseDto> {
    return apiClient.get<WorkspaceResponseDto>(`/v1/workspaces/${workspaceId}`)
  }

  static async update(
    workspaceId: string,
    data: UpdateWorkspaceDto
  ): Promise<WorkspaceResponseDto> {
    return apiClient.patch<WorkspaceResponseDto>(`/v1/workspaces/${workspaceId}`, data)
  }

  static async delete(workspaceId: string): Promise<void> {
    return apiClient.delete<void>(`/v1/workspaces/${workspaceId}`)
  }
}

export const workspaceService = WorkspaceService
