/**
 * Members Management Table
 *
 * UI for managing workspace members and their role assignments
 */

'use client'

import { useState } from 'react'
import { Plus, Trash2, UserPlus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useMembers,
  useAddMember,
  useRemoveMember,
  useAssignRole,
  useRemoveRole,
} from '@/hooks/api/use-members'
import { useRoles } from '@/hooks/api/use-roles'
import type { AddMemberDto, WorkspaceRole } from '@/types/permissions'

interface MembersManagementTableProps {
  workspaceId: string
}

export function MembersManagementTable({ workspaceId }: MembersManagementTableProps) {
  const { data: members, isLoading: membersLoading } = useMembers(workspaceId)
  const { data: roles } = useRoles(workspaceId)
  const { mutate: addMember, isPending: isAdding } = useAddMember(workspaceId)
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember(workspaceId)
  const { mutate: assignRole, isPending: isAssigning } = useAssignRole(workspaceId)
  const { mutate: removeRole, isPending: isUnassigning } = useRemoveRole(workspaceId)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  // Form states
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WorkspaceRole>('MEMBER')

  // Get selected member
  const selectedMember = members?.find((m) => m.id === selectedMemberId)

  // Handle add member
  const handleAddMember = () => {
    const data: AddMemberDto = {
      email,
      role,
    }

    addMember(data, {
      onSuccess: () => {
        setAddDialogOpen(false)
        setEmail('')
        setRole('MEMBER')
      },
    })
  }

  // Handle remove member
  const handleRemoveMember = () => {
    if (!selectedMemberId) return

    removeMember(selectedMemberId, {
      onSuccess: () => {
        setRemoveDialogOpen(false)
        setSelectedMemberId(null)
      },
    })
  }

  // Handle toggle role assignment
  const handleToggleRole = (memberId: string, roleId: string, isAssigned: boolean) => {
    if (isAssigned) {
      removeRole({ memberId, roleId })
    } else {
      assignRole({ memberId, roleId })
    }
  }

  // Open roles dialog
  const openRolesDialog = (memberId: string) => {
    setSelectedMemberId(memberId)
    setRolesDialogOpen(true)
  }

  // Open remove dialog
  const openRemoveDialog = (memberId: string) => {
    setSelectedMemberId(memberId)
    setRemoveDialogOpen(true)
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (membersLoading) {
    return <div className="text-muted-foreground">Carregando membros...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Membros do Workspace</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os membros e suas funções
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Membro
        </Button>
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {members?.map((member) => (
          <Card key={member.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.user.avatar} />
                  <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{member.user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRolesDialog(member.id)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Funções
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openRemoveDialog(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Funções atribuídas:</p>
                <div className="flex flex-wrap gap-2">
                  {member.roles && member.roles.length > 0 ? (
                    member.roles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        {role.displayName}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhuma função atribuída</span>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  Função legada: {member.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro</DialogTitle>
            <DialogDescription>
              Adicione um novo membro ao workspace por email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função Legada</Label>
              <Select value={role} onValueChange={(value) => setRole(value as WorkspaceRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMember} disabled={isAdding || !email}>
              {isAdding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Funções</DialogTitle>
            <DialogDescription>
              Atribua ou remova funções de {selectedMember?.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {roles?.map((role) => {
              const isAssigned = selectedMember?.roles?.some((r) => r.id === role.id) || false
              return (
                <div key={role.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{role.displayName}</Label>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    )}
                  </div>
                  <Checkbox
                    checked={isAssigned}
                    onCheckedChange={() =>
                      handleToggleRole(selectedMember!.id, role.id, isAssigned)
                    }
                    disabled={isAssigning || isUnassigning}
                  />
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setRolesDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a remover {selectedMember?.user.name} do workspace.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} disabled={isRemoving}>
              {isRemoving ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
