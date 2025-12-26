"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DocumentResponseDto } from "@/lib/api/services/document.service";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string, documentIds: string[]) => void;
  onDocumentAttach?: (documentId: string) => void;
  onDocumentDetach?: (documentId: string) => void;
  attachedDocuments?: DocumentResponseDto[];
  availableDocuments?: DocumentResponseDto[];
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onDocumentAttach,
  onDocumentDetach,
  attachedDocuments = [],
  availableDocuments = [],
  isLoading = false,
  disabled = false,
  placeholder = "Digite sua mensagem...",
  className,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = React.useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!value.trim() || isLoading || disabled) return;

      const documentIds = attachedDocuments.map((doc) => doc.id);
      onSubmit(value.trim(), documentIds);
      onChange("");
    },
    [value, isLoading, disabled, attachedDocuments, onSubmit, onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleDocumentSelect = React.useCallback(
    (documentId: string) => {
      onDocumentAttach?.(documentId);
    },
    [onDocumentAttach]
  );

  const handleDocumentRemove = React.useCallback(
    (documentId: string) => {
      onDocumentDetach?.(documentId);
    },
    [onDocumentDetach]
  );

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Attached Documents */}
      {attachedDocuments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedDocuments.map((doc) => (
            <Badge
              key={doc.id}
              variant="secondary"
              className="pl-3 pr-1 gap-1"
            >
              <span className="text-xs truncate max-w-[200px]">{doc.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleDocumentRemove(doc.id)}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        {/* Document Attach Button */}
        {availableDocuments.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 h-9 w-9"
                disabled={disabled || isLoading}
              >
                <Paperclip className="size-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <div className="max-h-[300px] overflow-y-auto">
                {availableDocuments.map((doc) => {
                  const isAttached = attachedDocuments.some(
                    (d) => d.id === doc.id
                  );
                  return (
                    <DropdownMenuItem
                      key={doc.id}
                      disabled={isAttached}
                      onClick={() => handleDocumentSelect(doc.id)}
                    >
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {doc.name}
                        </span>
                        {doc.description && (
                          <span className="text-xs text-gray-500 truncate">
                            {doc.description}
                          </span>
                        )}
                      </div>
                      {isAttached && (
                        <Badge variant="secondary" className="ml-2">
                          Anexado
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Textarea - Native HTML textarea with no resizer */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 min-w-0 min-h-[44px] max-h-[200px] border-0 p-2 focus:outline-none focus:ring-0 bg-transparent text-sm resize-none text-gray-900 placeholder:text-gray-500"
          style={{
            resize: "none",
            overflow: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="sm"
          className="shrink-0 h-9 w-9 bg-gray-900 hover:bg-gray-800 text-white"
          disabled={!value.trim() || disabled || isLoading}
        >
          {isLoading ? (
            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2 px-1">
        Pressione Enter para enviar, Shift+Enter para nova linha
      </p>
    </div>
  );
}
