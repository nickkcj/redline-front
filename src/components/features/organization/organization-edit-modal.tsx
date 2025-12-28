"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { OrganizationWithWorkspaces } from "@/lib/api/types/organization.types"

interface OrganizationEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: OrganizationWithWorkspaces | null
  onSubmit: (data: { name: string; description?: string }) => Promise<void>
  isUpdating: boolean
  error?: string | null
}

export function OrganizationEditModal({
  open,
  onOpenChange,
  organization,
  onSubmit,
  isUpdating,
  error,
}: OrganizationEditModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (organization) {
      setName(organization.name)
      setDescription(organization.description || '')
    }
  }, [organization])

  const handleSubmit = async () => {
    if (!name.trim()) return

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] !bg-background !border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Editar Organização</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nome da Organização
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da organização"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-background text-foreground placeholder:text-muted-foreground"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma descrição para a organização"
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
              maxLength={500}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="default"
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || isUpdating}
              size="default"
              className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
            >
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
