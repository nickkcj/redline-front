// ============================================================
// APP STORE TYPES - Tipagens do estado global da aplicação
// ============================================================

import type { UserDTO, OrganizationResponseDto, WorkspaceResponseDto, OrganizationWithWorkspaces } from '@/lib/api/types'

export type Theme = 'light' | 'dark' | 'system'

export interface AppState {
  user: UserDTO | null
  isAuthenticated: boolean
  currentOrganization: OrganizationWithWorkspaces | null
  currentWorkspace: WorkspaceResponseDto | null
  theme: Theme
  sidebarOpen: boolean

  setUser: (user: UserDTO | null) => void
  setTheme: (theme: Theme) => void
  setSidebarOpen: (open: boolean) => void
  setCurrentOrganization: (org: OrganizationWithWorkspaces | null) => void
  setCurrentWorkspace: (workspace: WorkspaceResponseDto | null) => void
  logout: () => void
  reset: () => void
}

export interface PersistedAppState {
  user: UserDTO | null
  isAuthenticated: boolean
  theme: Theme
  sidebarOpen: boolean
}
