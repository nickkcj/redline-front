// ============================================================
// COMMON TYPES - Base types used across the application
// ============================================================

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

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

// Workspace Role Enum (from Prisma)
export enum WorkspaceRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  OWNER = 'OWNER'
}

// Common query params
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}
