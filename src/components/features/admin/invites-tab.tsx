"use client"

import * as React from "react"
import { EnvelopeSimple, Plus, Trash, Clock, CheckCircle, XCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useWorkspaceInvites,
  useCreateWorkspaceInvite,
  useCancelWorkspaceInvite,
} from "@/hooks/api/use-workspace-invite"
import { useRoles } from "@/hooks/api/use-roles"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface InvitesTabProps {
  workspaceId: string
}

export function InvitesTab({ workspaceId }: InvitesTabProps) {
  const { data: invites, isLoading } = useWorkspaceInvites(workspaceId)
  const { data: roles } = useRoles(workspaceId)
  const { mutate: createInvite, isPending: isCreating } = useCreateWorkspaceInvite(workspaceId)
  const { mutate: cancelInvite, isPending: isCanceling } = useCancelWorkspaceInvite(workspaceId)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedInviteId, setSelectedInviteId] = React.useState<string | null>(null)

  // Form states
  const [email, setEmail] = React.useState("")
  const [roleId, setRoleId] = React.useState("")

  const resetForm = () => {
    setEmail("")
    setRoleId("")
  }

  const handleCreate = () => {
    if (!email || !roleId) return

    createInvite(
      { email, roleId },
      {
        onSuccess: () => {
          setCreateDialogOpen(false)
          resetForm()
        },
      }
    )
  }

  const handleDelete = () => {
    if (!selectedInviteId) return

    cancelInvite(selectedInviteId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedInviteId(null)
      },
    })
  }

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-border border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando convites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <EnvelopeSimple weight="bold" className="h-5 w-5" />
              Convites por Email
            </CardTitle>
            <CardDescription className="mt-2">
              Convide pessoas por email para participar deste workspace
            </CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Convite
          </Button>
        </CardHeader>
        <CardContent>
          {!invites || invites.length === 0 ? (
            <div className="text-center py-12">
              <EnvelopeSimple weight="bold" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum convite enviado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Convide pessoas para colaborar neste workspace
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => {
                const expired = isExpired(invite.expiresAt)
                const used = invite.isUsed

                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{invite.email}</p>
                        {used ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle weight="bold" className="h-3 w-3" />
                            Aceito
                          </Badge>
                        ) : expired ? (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Expirado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Função: {invite.role.displayName}</span>
                        {!used && !expired && (
                          <span>
                            Expira{" "}
                            {formatDistanceToNow(new Date(invite.expiresAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        )}
                        {expired && (
                          <span>
                            Expirou{" "}
                            {formatDistanceToNow(new Date(invite.expiresAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {!used && !expired && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedInviteId(invite.id)
                          setDeleteDialogOpen(true)
                        }}
                        disabled={isCanceling}
                      >
                        <Trash weight="bold" className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Invite Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar por Email</DialogTitle>
            <DialogDescription>
              Envie um convite por email para uma pessoa participar deste workspace
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex flex-col">
                        <span>{role.displayName || role.name}</span>
                        {role.description && (
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !email || !roleId}>
              {isCreating ? "Enviando..." : "Enviar Convite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Convite</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este convite? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isCanceling}>
              {isCanceling ? "Cancelando..." : "Cancelar Convite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
