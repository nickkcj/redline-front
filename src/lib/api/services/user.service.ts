import { apiClient } from '@/lib/api/client/base.client';
import type { User, UserWorkspace } from '@/types/common';

export interface UserWithWorkspaces extends User {
  workspaces?: UserWorkspace[];
}

class UserService {
  async getUserWithWorkspaces(): Promise<UserWithWorkspaces> {
    try {
      return await apiClient.get<UserWithWorkspaces>('/users');
    } catch (error: any) {
      throw error;
    }
  }
}

export const userService = new UserService();

