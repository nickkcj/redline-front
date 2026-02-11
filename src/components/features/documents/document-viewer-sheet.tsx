"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  downloadDocument,
  useDocumentViewUrl,
} from "@/hooks/api/use-documents"
import {
  DownloadSimple,
  File,
  SpinnerGap,
} from "@phosphor-icons/react"

interface DocumentViewerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  documentId: string
  documentName: string
}

export function DocumentViewerSheet({
  open,
  onOpenChange,
  workspaceId,
  documentId,
  documentName,
}: DocumentViewerSheetProps) {
  const { data, isLoading, error } = useDocumentViewUrl(workspaceId, documentId)

  const isPdf = data?.mimeType === "application/pdf"

  const handleDownload = async () => {
    try {
      const blob = await downloadDocument(workspaceId, documentId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = documentName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[650px] sm:max-w-[650px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
          <SheetTitle className="text-base font-semibold truncate flex-1 pr-4">
            {documentName}
          </SheetTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading || !!error}
          >
            <DownloadSimple className="h-4 w-4 mr-2" />
            Download
          </Button>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando documento...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <File weight="thin" className="h-16 w-16 text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Erro ao carregar documento</p>
                <p className="text-xs text-muted-foreground">
                  Não foi possível carregar a visualização. Tente fazer o download.
                </p>
              </div>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <DownloadSimple className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}

          {data && !isLoading && !error && (
            <>
              {isPdf ? (
                <iframe
                  src={data.viewUrl}
                  className="w-full h-full border-0"
                  title={documentName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <File weight="thin" className="h-16 w-16 text-muted-foreground/40" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Visualização não disponível</p>
                    <p className="text-xs text-muted-foreground">
                      Este tipo de arquivo não pode ser visualizado no navegador. Faça o download para visualizar.
                    </p>
                  </div>
                  <Button onClick={handleDownload} size="sm">
                    <DownloadSimple className="h-4 w-4 mr-2" />
                    Download {data.filename}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
