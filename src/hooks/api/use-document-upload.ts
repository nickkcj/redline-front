import * as React from "react"
import { toast } from "sonner"
import { useUploadDocument } from "@/hooks/api/use-documents"

/**
 * Opções de configuração do hook
 */
export interface UseDocumentUploadOptions {
  /**
   * Tamanho máximo permitido em bytes (padrão: 10MB)
   */
  maxSize?: number
  /**
   * Tipos de arquivo permitidos (padrão: apenas PDF)
   */
  allowedTypes?: string[]
  /**
   * Callback chamado após upload bem-sucedido
   */
  onSuccess?: () => void
  /**
   * Callback chamado em caso de erro
   */
  onError?: (error: unknown) => void
}

/**
 * Hook para fazer upload de documentos com validação
 *
 * Consolida a lógica de upload de documentos que estava duplicada
 * em múltiplos componentes de sidebar.
 *
 * Features:
 * - Validação de tipo de arquivo (PDF por padrão)
 * - Validação de tamanho (10MB por padrão)
 * - Toasts de erro automáticos
 * - Limpeza do input após upload
 * - Error handling robusto
 *
 * @param workspaceId - ID do workspace onde o documento será criado
 * @param options - Opções de configuração
 *
 * @example
 * ```tsx
 * const { handleFileUpload, fileInputRef, isUploading } = useDocumentUpload(workspaceId)
 *
 * <input
 *   ref={fileInputRef}
 *   type="file"
 *   onChange={handleFileUpload}
 *   accept=".pdf"
 *   hidden
 * />
 * ```
 */
export function useDocumentUpload(
  workspaceId: string,
  options: UseDocumentUploadOptions = {}
) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ["application/pdf"],
    onSuccess,
    onError,
  } = options

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const uploadDocumentMutation = useUploadDocument(workspaceId)

  /**
   * Handler para o evento de change do input file
   */
  const handleFileUpload = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validação de tipo de arquivo
      if (!allowedTypes.includes(file.type)) {
        const typeLabel = allowedTypes.includes("application/pdf")
          ? "PDF"
          : allowedTypes.join(", ")
        toast.error(`Apenas arquivos ${typeLabel} são permitidos`)
        return
      }

      // Validação de tamanho
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024))
        toast.error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`)
        return
      }

      try {
        await uploadDocumentMutation.mutateAsync({
          file,
          name: file.name,
        })

        // Callback de sucesso
        onSuccess?.()
      } catch (error) {
        // Error handling detalhado
        const errorMessage =
          error instanceof Error
            ? error.message
            : error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Erro desconhecido ao enviar documento"

        console.error("Error uploading document:", {
          message: errorMessage,
          error: error instanceof Error ? error : String(error),
          ...(error &&
          typeof error === "object" &&
          "statusCode" in error
            ? { statusCode: error.statusCode }
            : {}),
          ...(error && typeof error === "object" && "code" in error
            ? { code: error.code }
            : {}),
        })

        // Callback de erro
        onError?.(error)
      } finally {
        // Limpar input para permitir upload do mesmo arquivo novamente
        if (event.target) {
          event.target.value = ""
        }
      }
    },
    [uploadDocumentMutation, maxSize, allowedTypes, onSuccess, onError]
  )

  /**
   * Helper para abrir o file picker programaticamente
   */
  const openFilePicker = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    /**
     * Handler para o evento onChange do input
     */
    handleFileUpload,
    /**
     * Ref para o input file
     */
    fileInputRef,
    /**
     * Se o upload está em andamento
     */
    isUploading: uploadDocumentMutation.isPending,
    /**
     * Helper para abrir o file picker
     */
    openFilePicker,
  }
}
