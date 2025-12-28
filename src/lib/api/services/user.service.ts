import { apiClient } from '@/lib/api/client/base.client'
import type { UserWithWorkspaces } from '@/lib/api/types/user.types'

export class UserService {
  static async getUserWithWorkspaces(): Promise<UserWithWorkspaces> {
    return apiClient.get<UserWithWorkspaces>('/users')
  }
}

export const userService = UserService
