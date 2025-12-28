/**
 * Roles Management Table
 *
 * UI for managing workspace roles and permissions
 * Allows creating, editing, and deleting roles
 */

'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/api/use-roles'
import { useAllPermissions } from '@/hooks/api/use-permissions'
import type { CreateRoleDto, UpdateRoleDto, PermissionEntity } from '@/types/permissions'
import { getPermissionDescription, groupPermissionsByResource } from '@/lib/utils/permission.utils'

interface RolesManagementTableProps {
  workspaceId: string
}

export function RolesManagementTable({ workspaceId }: RolesManagementTableProps) {
  const { data: roles, isLoading: rolesLoading } = useRoles(workspaceId)
  const { data: allPermissions } = useAllPermissions(workspaceId)
  const { mutate: createRole, isPending: isCreating } = useCreateRole(workspaceId)
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole(workspaceId)
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole(workspaceId)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  // Form states
  const [roleName, setRoleName] = useState('')
  const [roleDisplayName, setRoleDisplayName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // Get selected role
  const selectedRole = roles?.find((r) => r.id === selectedRoleId)

  // Handle create role
  const handleCreate = () => {
    const permissionDtos = selectedPermissions.map((permId) => {
      const perm = allPermissions?.find((p) => p.id === permId)
      return {
        resource: perm!.resource,
        action: perm!.action,
        scope: perm!.scope || undefined,
      }
    })

    const data: CreateRoleDto = {
      name: roleName,
      displayName: roleDisplayName,
      description: roleDescription || undefined,
      permissions: permissionDtos,
    }

    createRole(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        resetForm()
      },
    })
  }

  // Handle update role
  const handleUpdate = () => {
    if (!selectedRoleId) return

    const data: UpdateRoleDto = {
      displayName: roleDisplayName,
      description: roleDescription || undefined,
    }

    updateRole(
      { roleId: selectedRoleId, data },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          resetForm()
        },
      }
    )
  }

  // Handle delete role
  const handleDelete = () => {
    if (!selectedRoleId) return

    deleteRole(selectedRoleId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedRoleId(null)
      },
    })
  }

  // Reset form
  const resetForm = () => {
    setRoleName('')
    setRoleDisplayName('')
    setRoleDescription('')
    setSelectedPermissions([])
    setSelectedRoleId(null)
  }

  // Open edit dialog
  const openEditDialog = (roleId: string) => {
    const role = roles?.find((r) => r.id === roleId)
    if (role) {
      setSelectedRoleId(roleId)
      setRoleDisplayName(role.displayName)
      setRoleDescription(role.description || '')
      setEditDialogOpen(true)
    }
  }

  // Open delete dialog
  const openDeleteDialog = (roleId: string) => {
    setSelectedRoleId(roleId)
    setDeleteDialogOpen(true)
  }

  // Group permissions by resource
  const groupedPermissions = allPermissions
    ? Object.entries(groupPermissionsByResource(allPermissions.map((p) => `${p.resource}.${p.action}.${p.scope || 'all'}`)))
    : []

  if (rolesLoading) {
    return <div className="text-muted-foreground">Carregando funções...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Funções e Permissões</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as funções e permissões do workspace
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Função
        </Button>
      </div>

      {/* Roles List */}
      <div className="grid gap-4">
        {roles?.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <CardTitle className="text-base">{role.displayName}</CardTitle>
                  {role.isSystem && (
                    <Badge variant="secondary" className="text-xs">
                      Sistema
                    </Badge>
                  )}
                </div>
                {role.description && (
                  <CardDescription className="text-sm">{role.description}</CardDescription>
                )}
              </div>
              {!role.isSystem && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(role.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Permissões:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <Badge key={perm.id} variant="outline" className="text-xs">
                      {getPermissionDescription(`${perm.resource}.${perm.action}.${perm.scope || 'all'}`)}
                    </Badge>
                  ))}
                  {role.permissions.length === 0 && (
                    <span className="text-sm text-muted-foreground">Nenhuma permissão</span>
                  )}
                </div>
                {role._count && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {role._count.members} {role._count.members === 1 ? 'membro' : 'membros'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Função</DialogTitle>
            <DialogDescription>
              Crie uma nova função com permissões personalizadas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da função (identificador)</Label>
              <Input
                id="name"
                placeholder="viewer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                id="displayName"
                placeholder="Visualizador"
                value={roleDisplayName}
                onChange={(e) => setRoleDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Pode visualizar conteúdo..."
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissões</Label>
              {groupedPermissions.map(([resource, perms]) => (
                <div key={resource} className="space-y-2">
                  <p className="text-sm font-medium capitalize">{resource}</p>
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    {perms.map((permStr) => {
                      const perm = allPermissions?.find(
                        (p) => `${p.resource}.${p.action}.${p.scope || 'all'}` === permStr
                      )
                      if (!perm) return null
                      return (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={perm.id}
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions([...selectedPermissions, perm.id])
                              } else {
                                setSelectedPermissions(selectedPermissions.filter((id) => id !== perm.id))
                              }
                            }}
                          />
                          <Label htmlFor={perm.id} className="text-sm cursor-pointer">
                            {getPermissionDescription(permStr)}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !roleName || !roleDisplayName}>
              {isCreating ? 'Criando...' : 'Criar Função'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Função</DialogTitle>
            <DialogDescription>
              Edite o nome e descrição da função
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Nome de exibição</Label>
              <Input
                id="edit-displayName"
                value={roleDisplayName}
                onChange={(e) => setRoleDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !roleDisplayName}>
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a deletar a função "{selectedRole?.displayName}".
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
