/**
 * Mock Data Types and Empty Defaults
 * These empty arrays are used when MOCK_MODE is disabled
 * Real data should come from the API
 */

import type { UserDTO } from '../types/user.types'
import type { OrganizationWithWorkspaces } from '../types/organization.types'
import type { WorkspaceResponseDto } from '../types/workspace.types'
import type { DocumentResponseDto } from '../types/document.types'

// Empty user - will be populated from API
export const mockUser: UserDTO = {
  id: '',
  email: '',
  name: '',
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Empty arrays - real data comes from API
export const mockOrganizations: OrganizationWithWorkspaces[] = []

export const mockWorkspaces: WorkspaceResponseDto[] = []

export const mockDocuments: DocumentResponseDto[] = []

export const mockMembers: any[] = []

export const mockRoles: any[] = []

export const mockChatMessages: any[] = []
