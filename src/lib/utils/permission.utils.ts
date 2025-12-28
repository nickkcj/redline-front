/**
 * Permission Utilities
 *
 * Helper functions for permission parsing and checking
 * Implements scope hierarchy: "all" grants access to "own"
 */


const PermissionResource = {
  CHAT: 'chat',
  WORKSPACE: 'workspace',
  DOCUMENT: 'document',
  MEMBER: 'member',
  ROLE: 'role',
} as const

/**
 * Parse a permission string into its components
 * @param permission - Permission string (e.g., "chat.read.all")
 * @returns Object with resource, action, and scope
 */
export function parsePermission(permission: string): {
  resource: string
  action: string
  scope: string
} {
  const parts = permission.split('.')

  if (parts.length < 2) {
    throw new Error(`Invalid permission format: ${permission}`)
  }

  return {
    resource: parts[0],
    action: parts[1],
    scope: parts[2] || 'all', // Default to 'all' if no scope specified
  }
}

// ============================================================================
// Permission Checking Logic
// ============================================================================

/**
 * Check if a user permission grants access to a required permission
 * Implements scope hierarchy: "all" grants access to "own"
 *
 * @param requiredPermission - Permission that is required (e.g., "chat.read.own")
 * @param userPermission - Permission that user has (e.g., "chat.read.all")
 * @returns true if user permission grants access
 *
 * @example
 * permissionGrantsAccess("chat.read.own", "chat.read.all") // true (all > own)
 * permissionGrantsAccess("chat.read.all", "chat.read.own") // false (own doesn't grant all)
 * permissionGrantsAccess("chat.read.own", "chat.read.own") // true (exact match)
 */
export function permissionGrantsAccess(
  requiredPermission: string,
  userPermission: string
): boolean {
  const required = parsePermission(requiredPermission)
  const user = parsePermission(userPermission)

  // Resource and action must match
  if (required.resource !== user.resource || required.action !== user.action) {
    return false
  }

  // Exact scope match
  if (required.scope === user.scope) {
    return true
  }

  // Scope hierarchy: "all" grants access to "own"
  if (user.scope === 'all' && required.scope === 'own') {
    return true
  }

  return false
}

/**
 * Check if user has a specific permission
 *
 * @param userPermissions - Array of permissions user has
 * @param requiredPermission - Permission to check
 * @returns true if user has the permission (considering scope hierarchy)
 *
 * @example
 * hasPermission(["chat.read.all"], "chat.read.own") // true
 * hasPermission(["chat.read.own"], "chat.read.all") // false
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.some((userPerm) =>
    permissionGrantsAccess(requiredPermission, userPerm)
  )
}

/**
 * Check if user has ANY of the required permissions (OR logic)
 *
 * @param userPermissions - Array of permissions user has
 * @param requiredPermissions - Array of permissions to check (user needs at least one)
 * @returns true if user has at least one of the required permissions
 *
 * @example
 * hasAnyPermission(["chat.read.all"], ["chat.read.own", "chat.write.all"]) // true
 * hasAnyPermission(["chat.read.own"], ["chat.write.all", "document.read.all"]) // false
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((required) =>
    hasPermission(userPermissions, required)
  )
}

/**
 * Check if user has ALL required permissions (AND logic)
 *
 * @param userPermissions - Array of permissions user has
 * @param requiredPermissions - Array of permissions to check (user needs all)
 * @returns true if user has all required permissions
 *
 * @example
 * hasAllPermissions(["chat.read.all", "document.write.all"], ["chat.read.own", "document.write.own"]) // true
 * hasAllPermissions(["chat.read.all"], ["chat.read.all", "document.write.all"]) // false
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((required) =>
    hasPermission(userPermissions, required)
  )
}

// ============================================================================
// Permission Descriptions (for UI)
// ============================================================================

/**
 * Get human-readable description for a permission
 *
 * @param permission - Permission string
 * @returns Description in Portuguese
 *
 * @example
 * getPermissionDescription("chat.read.all") // "Ver todos os chats"
 * getPermissionDescription("document.write.own") // "Criar/editar próprios documentos"
 */
export function getPermissionDescription(permission: string): string {
  try {
    const { resource, action, scope } = parsePermission(permission)

    // Resource names in Portuguese
    const resourceNames: Record<string, string> = {
      [PermissionResource.CHAT]: 'chats',
      [PermissionResource.WORKSPACE]: 'workspace',
      [PermissionResource.DOCUMENT]: 'documentos',
      [PermissionResource.MEMBER]: 'membros',
      [PermissionResource.ROLE]: 'funções',
    }

    // Action descriptions
    const actionDescriptions: Record<string, Record<string, string>> = {
      read: {
        all: 'Ver todos',
        own: 'Ver próprios',
      },
      write: {
        all: 'Criar/editar todos',
        own: 'Criar/editar próprios',
      },
      delete: {
        all: 'Deletar todos',
        own: 'Deletar próprios',
      },
      admin: {
        all: 'Administrar',
        own: 'Administrar próprios',
      },
      upload: {
        all: 'Fazer upload',
        own: 'Fazer upload próprio',
      },
    }

    const resourceName = resourceNames[resource] || resource
    const actionDesc = actionDescriptions[action]?.[scope] || `${action} ${scope}`

    return `${actionDesc} ${resourceName}`
  } catch (error) {
    return permission
  }
}

/**
 * Group permissions by resource for UI display
 *
 * @param permissions - Array of permission strings
 * @returns Object with permissions grouped by resource
 *
 * @example
 * groupPermissionsByResource(["chat.read.all", "chat.write.own", "document.read.all"])
 * // { chat: ["chat.read.all", "chat.write.own"], document: ["document.read.all"] }
 */
export function groupPermissionsByResource(
  permissions: string[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {}

  permissions.forEach((permission) => {
    try {
      const { resource } = parsePermission(permission)

      if (!grouped[resource]) {
        grouped[resource] = []
      }

      grouped[resource].push(permission)
    } catch (error) {
      // Skip invalid permissions
    }
  })

  return grouped
}
