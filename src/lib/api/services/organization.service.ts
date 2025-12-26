import { apiClient } from '@/lib/api/client/base.client';
import type { Organization } from '@/types/common';

export interface OrganizationWithWorkspaces extends Organization {
  workspaces?: WorkspaceSummary[];
  ownerId?: string;
  masterMemberId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  description?: string;
  membersCount?: number;
  teamsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  organizationId: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
}

class OrganizationService {
  async getOrganizations(): Promise<OrganizationWithWorkspaces[]> {
    try {
      return await apiClient.get<OrganizationWithWorkspaces[]>('/organizations');
    } catch (error: any) {
      throw error;
    }
  }

  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    try {
      return await apiClient.post<Organization>('/organizations', data);
    } catch (error: any) {
      throw error;
    }
  }

  async updateOrganization(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    try {
      return await apiClient.patch<Organization>(`/organizations/${id}`, data);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteOrganization(id: string): Promise<void> {
    try {
      return await apiClient.delete<void>(`/organizations/${id}`);
    } catch (error: any) {
      throw error;
    }
  }

  async createWorkspace(data: CreateWorkspaceDto): Promise<WorkspaceSummary> {
    try {
      return await apiClient.post<WorkspaceSummary>(
        `/workspaces`,
        {
          name: data.name,
          description: data.description,
          organizationId: data.organizationId,
        }
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceDto): Promise<WorkspaceSummary> {
    try {
      return await apiClient.patch<WorkspaceSummary>(`/workspaces/${id}`, data);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteWorkspace(id: string): Promise<void> {
    try {
      return await apiClient.delete<void>(`/workspaces/${id}`);
    } catch (error: any) {
      throw error;
    }
  }

  async leaveWorkspace(id: string): Promise<void> {
    try {
      return await apiClient.post<void>(`/workspaces/${id}/leave`);
    } catch (error: any) {
      throw error;
    }
  }
}

export const organizationService = new OrganizationService();

