export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
  workspaces?: UserWorkspace[]
}

export interface Organization {
  id: string
  name: string
  description?: string
}

export interface UserWorkspace {
  id: string
  name: string
  description?: string
  role: 'ADMIN' | 'MEMBER' | 'OWNER' // Legacy field (kept for backward compatibility)
  roles?: import('./permissions').RoleLight[] // RBAC roles array
  organization: Organization
}