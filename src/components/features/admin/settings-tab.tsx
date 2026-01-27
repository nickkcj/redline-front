"use client"

import { Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkspace } from "@/hooks/api/use-workspace"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SettingsTabProps {
  workspaceId: string
}

export function SettingsTab({ workspaceId }: SettingsTabProps) {
  const router = useRouter()
  const { data: workspace, isLoading } = useWorkspace(workspaceId)

  const handleDelete = () => {
    if (confirm('Tem certeza? Esta ação é irreversível e todos os dados serão perdidos.')) {
      toast.error('Funcionalidade de deletar workspace será implementada')
      // TODO: Implement delete workspace
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações do workspace
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Workspace</CardTitle>
          <CardDescription>
            Configure o nome e descrição do workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              defaultValue={workspace?.name}
              placeholder="Nome do workspace"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o workspace"
              rows={3}
            />
          </div>

          <Button>Salvar alterações</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam o workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Deletar este workspace removerá permanentemente todos os dados, incluindo chats, documentos e configurações. Esta ação não pode ser desfeita.
            </p>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash weight="bold" className="h-4 w-4 mr-2" />
              Deletar Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
