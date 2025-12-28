"use client";

import * as React from "react";
import { cn } from "@/lib/utils/date.utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Paperclip, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocumentResponseDto } from "@/lib/api/services/document.service";

export interface DocumentMarkerProps {
  workspaceId: string;
  chatId: string | null;
  documents: DocumentResponseDto[];
  markedDocuments: DocumentResponseDto[];
  onMark: (documentId: string) => Promise<void>;
  onUnmark: (documentId: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function DocumentMarker({
  workspaceId,
  chatId,
  documents,
  markedDocuments,
  onMark,
  onUnmark,
  disabled = false,
  className,
}: DocumentMarkerProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<string | null>(null);

  const markedIds = React.useMemo(
    () => new Set(markedDocuments.map((d) => d.id)),
    [markedDocuments]
  );

  const handleToggle = React.useCallback(
    async (doc: DocumentResponseDto, isMarked: boolean) => {
      if (!chatId || disabled) return;

      setLoading(doc.id);
      try {
        if (isMarked) {
          await onUnmark(doc.id);
        } else {
          await onMark(doc.id);
        }
      } finally {
        setLoading(null);
      }
    },
    [chatId, disabled, onMark, onUnmark]
  );

  const handleRemoveMarked = React.useCallback(
    async (docId: string) => {
      if (!chatId || disabled) return;
      setLoading(docId);
      try {
        await onUnmark(docId);
      } finally {
        setLoading(null);
      }
    },
    [chatId, disabled, onUnmark]
  );

  if (!chatId) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Marked Documents Chips */}
      {markedDocuments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {markedDocuments.map((doc) => (
            <Badge
              key={doc.id}
              variant="secondary"
              className="pl-3 pr-1 gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <FileText className="size-3" />
              <span className="text-xs truncate max-w-[150px]">{doc.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveMarked(doc.id)}
                disabled={loading === doc.id}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Document Selector Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-border text-foreground hover:bg-gray-50"
            disabled={disabled || documents.length === 0}
          >
            <Paperclip className="size-4" />
            <span className="text-sm">
              {markedDocuments.length > 0
                ? `${markedDocuments.length} documento(s) marcado(s)`
                : "Marcar documentos"}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar Documentos no Chat</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600 mb-4">
            Marque os documentos que deseja usar como contexto nas conversas deste chat.
          </div>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum documento disponível
                </p>
              ) : (
                documents.map((doc) => {
                  const isMarked = markedIds.has(doc.id);
                  const isLoading = loading === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        isMarked
                          ? "bg-blue-50 border-blue-200"
                          : "bg-background border-border hover:bg-gray-50"
                      )}
                    >
                      <Checkbox
                        id={`doc-${doc.id}`}
                        checked={isMarked}
                        onCheckedChange={() => handleToggle(doc, isMarked)}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={`doc-${doc.id}`}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="size-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(doc.sizeBytes)}
                          </span>
                          {doc.isProcessed && (
                            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                              Processado
                            </Badge>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-gray-600">
              {markedDocuments.length} de {documents.length} marcados
            </span>
            <Button onClick={() => setOpen(false)} size="sm">
              Concluído
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
