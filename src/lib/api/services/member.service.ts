import { apiClient } from '@/lib/api/client/base.client'
import type {
  MemberDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from '@/lib/api/types/permission.types'

export class MemberService {
  static async listMembers(workspaceId: string): Promise<MemberDto[]> {
    return apiClient.get<MemberDto[]>(
      `/workspaces/${workspaceId}/permissions/members`
    )
  }

  static async addMember(workspaceId: string, data: AddMemberDto): Promise<MemberDto> {
    return apiClient.post<MemberDto>(
      `/workspaces/${workspaceId}/permissions/members`,
      data
    )
  }

  static async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/permissions/members/${memberId}`)
  }

  static async updateMemberRole(
    workspaceId: string,
    memberId: string,
    data: UpdateMemberRoleDto
  ): Promise<MemberDto> {
    return apiClient.put<MemberDto>(
      `/workspaces/${workspaceId}/permissions/members/${memberId}/role`,
      data
    )
  }

  static async assignRole(
    workspaceId: string,
    memberId: string,
    roleId: string
  ): Promise<MemberDto> {
    return apiClient.post<MemberDto>(
      `/workspaces/${workspaceId}/permissions/members/${memberId}/roles/${roleId}`,
      {}
    )
  }

  static async removeRole(
    workspaceId: string,
    memberId: string,
    roleId: string
  ): Promise<MemberDto> {
    return apiClient.delete<MemberDto>(
      `/workspaces/${workspaceId}/permissions/members/${memberId}/roles/${roleId}`
    )
  }
}

export const memberService = MemberService
