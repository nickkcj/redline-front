"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { WorkspaceSummary } from "@/lib/api/types/organization.types"

interface WorkspaceLeaveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: WorkspaceSummary | null
  onConfirm: () => Promise<void>
  isLeaving: boolean
  error?: string | null
}

export function WorkspaceLeaveModal({
  open,
  onOpenChange,
  workspace,
  onConfirm,
  isLeaving,
  error,
}: WorkspaceLeaveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] !bg-background !border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Sair do Projeto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tem certeza que deseja sair do projeto <strong className="font-semibold">&ldquo;{workspace?.name}&rdquo;</strong>?
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Você perderá acesso a este projeto e precisará ser convidado novamente para retornar.
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
              disabled={isLeaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              variant="destructive"
              size="default"
              disabled={isLeaving}
            >
              {isLeaving ? 'Saindo...' : 'Sair do Projeto'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
