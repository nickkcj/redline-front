// ============================================================
// WORKSPACE SERVICE - Alinhado com workspace.controller.ts do backend
// ============================================================

import { apiClient } from '../client/base.client'
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceResponseDto,
  WorkspaceListResponse,
} from '../types'

export class WorkspaceService {
  /**
   * GET /workspaces
   * Lista todos workspaces do usuário
   */
  static async list(): Promise<WorkspaceListResponse> {
    return apiClient.get<WorkspaceListResponse>('/v1/workspaces')
  }

  /**
   * POST /workspaces
   * Cria novo workspace
   */
  static async create(data: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    return apiClient.post<WorkspaceResponseDto>('/v1/workspaces', data)
  }

  /**
   * GET /workspaces/organization/:organizationId
   * Lista workspaces de uma organization
   */
  static async listByOrganization(organizationId: string): Promise<WorkspaceListResponse> {
    return apiClient.get<WorkspaceListResponse>(`/v1/workspaces/organization/${organizationId}`)
  }

  /**
   * GET /workspaces/:workspaceId
   * Busca workspace por ID
   */
  static async getById(workspaceId: string): Promise<WorkspaceResponseDto> {
    return apiClient.get<WorkspaceResponseDto>(`/v1/workspaces/${workspaceId}`)
  }

  /**
   * PATCH /workspaces/:workspaceId
   * Atualiza workspace
   */
  static async update(
    workspaceId: string,
    data: UpdateWorkspaceDto
  ): Promise<WorkspaceResponseDto> {
    return apiClient.patch<WorkspaceResponseDto>(`/v1/workspaces/${workspaceId}`, data)
  }

  /**
   * DELETE /workspaces/:workspaceId
   * Remove workspace
   */
  static async delete(workspaceId: string): Promise<void> {
    return apiClient.delete<void>(`/v1/workspaces/${workspaceId}`)
  }
}
