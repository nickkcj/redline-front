"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { WorkspaceSummary } from "@/lib/api/types/organization.types"

interface WorkspaceDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: WorkspaceSummary | null
  onConfirm: () => Promise<void>
  isDeleting: boolean
  error?: string | null
}

export function WorkspaceDeleteModal({
  open,
  onOpenChange,
  workspace,
  onConfirm,
  isDeleting,
  error,
}: WorkspaceDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] !bg-background !border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Excluir Projeto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tem certeza que deseja excluir o projeto <strong className="font-semibold">&ldquo;{workspace?.name}&rdquo;</strong>?
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Todo o conteúdo do projeto será excluído.
          </p>
          <p className="text-sm text-red-600 font-medium">
            Esta ação não pode ser desfeita.
          </p>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="default"
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              variant="destructive"
              size="default"
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
