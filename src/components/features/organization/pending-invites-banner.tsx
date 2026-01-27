"use client"

import * as React from "react"
import { EnvelopeSimple, CheckCircle, WarningCircle, CircleNotch } from "@phosphor-icons/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WorkspaceInviteService } from "@/lib/api/services/workspace-invite.service"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export function PendingInvitesBanner() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [workspaceId, setWorkspaceId] = React.useState("")
  const [isAccepting, setIsAccepting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  const resetForm = () => {
    setCode("")
    setWorkspaceId("")
    setError(null)
  }

  const handleAcceptInvite = async () => {
    if (!code.trim()) {
      setError("Por favor, insira o código do convite")
      return
    }

    // Extract workspace ID and code from full URL if pasted
    let finalCode = code.trim()
    let finalWorkspaceId = workspaceId.trim()

    // Check if user pasted a full URL
    try {
      const url = new URL(code.trim())
      const pathParts = url.pathname.split("/")

      // Try to extract from /workspace/{workspaceId}/invite?code={code}
      const workspaceIndex = pathParts.indexOf("workspace")
      if (workspaceIndex !== -1 && pathParts[workspaceIndex + 1]) {
        finalWorkspaceId = pathParts[workspaceIndex + 1]
      }

      // Try to get code from query params
      const codeParam = url.searchParams.get("code")
      if (codeParam) {
        finalCode = codeParam
      }
    } catch {
      // Not a URL, treat as code
      // Check if it's in format workspaceId:code
      if (code.includes(":")) {
        const parts = code.split(":")
        finalWorkspaceId = parts[0]
        finalCode = parts[1]
      }
    }

    if (!finalWorkspaceId) {
      setError(
        "Não foi possível identificar o workspace. Por favor, cole o link completo do convite ou forneça o código no formato: workspaceId:código"
      )
      return
    }

    setIsAccepting(true)
    setError(null)

    try {
      await WorkspaceInviteService.use(finalWorkspaceId, { code: finalCode })

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })

      toast.success("Convite aceito com sucesso! Redirecionando...")
      setDialogOpen(false)
      resetForm()

      // Redirect to the workspace
      setTimeout(() => {
        router.push(`/workspace/${finalWorkspaceId}`)
        router.refresh()
      }, 500)
    } catch (err: any) {
      console.error("Error accepting invite:", err)

      if (err?.statusCode === 400) {
        if (err?.message?.includes("expired")) {
          setError("Este convite expirou. Solicite um novo convite ao administrador.")
        } else if (err?.message?.includes("already used")) {
          setError("Este convite já foi utilizado.")
        } else if (err?.message?.includes("already a member")) {
          setError("Você já é membro deste workspace.")
        } else {
          setError(err?.message || "Código de convite inválido. Verifique e tente novamente.")
        }
      } else if (err?.statusCode === 404) {
        setError("Convite não encontrado. Verifique o código e tente novamente.")
      } else {
        setError("Erro ao aceitar convite. Tente novamente ou entre em contato com o administrador.")
      }
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <>
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Recebeu um Convite?
          </CardTitle>
          <CardDescription>
            Se você recebeu um convite por email para participar de um workspace, clique abaixo para aceitar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setDialogOpen(true)} variant="outline" className="w-full sm:w-auto">
            Aceitar Convite
          </Button>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aceitar Convite de Workspace</DialogTitle>
            <DialogDescription>
              Cole o link completo do convite ou insira o código que você recebeu por email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Link ou Código do Convite</Label>
              <Input
                id="invite-code"
                placeholder="Cole o link completo ou código aqui"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError(null)
                }}
                disabled={isAccepting}
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: https://app.com/workspace/abc-123/invite?code=xyz789
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace-id">
                Workspace ID (opcional, será extraído do link)
              </Label>
              <Input
                id="workspace-id"
                placeholder="Deixe em branco se colou o link completo"
                value={workspaceId}
                onChange={(e) => {
                  setWorkspaceId(e.target.value)
                  setError(null)
                }}
                disabled={isAccepting}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                resetForm()
              }}
              disabled={isAccepting}
            >
              Cancelar
            </Button>
            <Button onClick={handleAcceptInvite} disabled={isAccepting || !code.trim()}>
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aceitando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aceitar Convite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
