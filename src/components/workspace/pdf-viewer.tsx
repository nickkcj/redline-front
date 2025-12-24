"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, X, Loader2 } from "lucide-react";
import { documentService } from "@/lib/api/services/document.service";

interface PdfViewerProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  workspaceId: string;
  documentName: string;
  onSendAsContext?: (documentId: string, documentName: string) => void;
}

export function PdfViewer({
  open,
  onClose,
  documentId,
  workspaceId,
  documentName,
  onSendAsContext,
}: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && documentId) {
      loadPdf();
    } else {
      // Cleanup: não precisa revogar URL presignada
      setPdfUrl(null);
    }
  }, [open, documentId]);

  const loadPdf = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Usar URL de visualização presignada ao invés de download
      const viewData = await documentService.getDocumentViewUrl(workspaceId, documentId);
      setPdfUrl(viewData.viewUrl);
    } catch (err: any) {
      console.error("Error loading PDF:", err);
      setError(err.message || "Erro ao carregar o PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAsContext = () => {
    if (onSendAsContext) {
      onSendAsContext(documentId, documentName);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{documentName}</DialogTitle>
            <div className="flex items-center gap-2">
              {onSendAsContext && (
                <Button
                  onClick={handleSendAsContext}
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar como contexto
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Carregando PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <Button onClick={loadPdf} variant="outline" size="sm">
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={documentName}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

