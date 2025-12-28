"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Loader2, FileText, Download, AlertCircle } from "lucide-react";
import { documentService } from "@/lib/api/services/document.service";
import { toast } from "sonner";

interface PdfViewerProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  workspaceId: string;
  documentName: string;
}

export function PdfViewer({
  open,
  onClose,
  documentId,
  workspaceId,
  documentName,
}: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && documentId && workspaceId) {
      loadPdf();
    } else {
      setPdfUrl(null);
      setError(null);
    }
  }, [open, documentId, workspaceId]);

  const loadPdf = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📄 Loading PDF:', { documentId, workspaceId, documentName });

      // Usar URL de visualização presignada
      const viewData = await documentService.getDocumentViewUrl(workspaceId, documentId);
      console.log('✅ PDF URL obtained:', viewData);

      setPdfUrl(viewData.viewUrl);
    } catch (err: any) {
      console.error("❌ Error loading PDF:", err);
      const errorMessage = err.message || "Erro ao carregar o PDF. Verifique se o documento existe e você tem permissão para visualizá-lo.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      toast.info("Iniciando download...");
      const blob = await documentService.downloadDocument(workspaceId, documentId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download concluído!");
    } catch (err: any) {
      console.error("Error downloading PDF:", err);
      toast.error("Erro ao fazer download do documento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex size-9 items-center justify-center rounded-lg bg-red-50">
                <FileText className="size-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-semibold truncate">{documentName}</DialogTitle>
                <p className="text-xs text-gray-500">Documento PDF</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={isLoading || !!error}
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="size-10 animate-spin text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Carregando documento...</p>
                  <p className="text-xs text-gray-500 mt-1">Aguarde enquanto obtemos o PDF</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="flex justify-center mb-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-red-50">
                    <AlertCircle className="size-8 text-red-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Erro ao carregar documento
                </h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={loadPdf} variant="outline" size="sm">
                    Tentar novamente
                  </Button>
                  <Button onClick={onClose} variant="ghost" size="sm">
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={documentName}
              allow="fullscreen"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

