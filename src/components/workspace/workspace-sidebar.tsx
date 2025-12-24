"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History, 
  FileText, 
  Upload, 
  X,
  MessageSquare,
  Loader2
} from "lucide-react";
import { useChats } from "@/hooks/api/use-chat";
import { useDocuments, useUploadDocument } from "@/hooks/api/use-documents";
import { useMarkedDocuments, useMarkDocument, useUnmarkDocument } from "@/hooks/api/use-chat-documents";
import { toast } from "sonner";
import { PdfViewer } from "./pdf-viewer";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface WorkspaceSidebarProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  onChatSelect?: (chatId: string) => void;
  currentChatId?: string;
  onDocumentContext?: (documentId: string, documentName: string) => void;
}

export function WorkspaceSidebar({ 
  open, 
  onClose, 
  workspaceId,
  onChatSelect,
  currentChatId,
  onDocumentContext
}: WorkspaceSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<"history" | "documents">("history");
  const [selectedDocument, setSelectedDocument] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Carregar dados reais da API
  const { data: chatsData, isLoading: isLoadingChats } = useChats(workspaceId);
  const { data: documents, isLoading: isLoadingDocuments } = useDocuments(workspaceId);
  const uploadDocumentMutation = useUploadDocument(workspaceId);
  
  // Carregar documentos marcados no chat atual
  const { data: markedDocuments = [], isLoading: isLoadingMarked } = useMarkedDocuments(
    workspaceId,
    currentChatId || ""
  );
  const markDocumentMutation = useMarkDocument(workspaceId, currentChatId || "");
  const unmarkDocumentMutation = useUnmarkDocument(workspaceId, currentChatId || "");

  const chatHistory = chatsData?.chats || [];
  const documentsList = documents || [];
  const markedDocumentIds = new Set(markedDocuments.map((doc: any) => doc.id));

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validar tipo de arquivo (apenas PDF conforme a API)
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }

    // Validar tamanho (exemplo: 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    try {
      await uploadDocumentMutation.mutateAsync({
        file,
        name: file.name,
      });
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload do documento');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay para mobile */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Workspace</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "history" | "documents")} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 flex flex-col m-0 mt-4">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {isLoadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nenhum histórico ainda</p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors group ${
                      currentChatId === chat.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => {
                      onChatSelect?.(chat.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat.title || 'Sem título'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(chat.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="flex-1 flex flex-col m-0 mt-4">
          <div className="px-4 mb-4">
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                disabled={uploadDocumentMutation.isPending}
                asChild
              >
                <span>
                  {uploadDocumentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Fazer upload
                    </>
                  )}
                </span>
              </Button>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadDocumentMutation.isPending}
              />
            </label>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : documentsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nenhum documento ainda</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Faça upload de documentos PDF para começar
                  </p>
                </div>
              ) : (
                documentsList.map((doc) => {
                  const isMarked = markedDocumentIds.has(doc.id);
                  const isMarking = markDocumentMutation.isPending || unmarkDocumentMutation.isPending;
                  
                  return (
                    <div
                      key={doc.id}
                      className="w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">{formatFileSize(doc.sizeBytes)}</p>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">
                              {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                            {doc.isProcessed && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-green-600">Processado</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (doc.contentType === 'application/pdf') {
                              setSelectedDocument({ id: doc.id, name: doc.name });
                            } else {
                              toast.info('Apenas PDFs podem ser visualizados');
                            }
                          }}
                        >
                          Visualizar
                        </Button>
                        {currentChatId && (
                          <Button
                            variant={isMarked ? "default" : "outline"}
                            size="sm"
                            disabled={isMarking}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                if (isMarked) {
                                  await unmarkDocumentMutation.mutateAsync(doc.id);
                                } else {
                                  await markDocumentMutation.mutateAsync(doc.id);
                                }
                              } catch (error) {
                                console.error('Erro ao marcar/desmarcar documento:', error);
                              }
                            }}
                            className="px-3"
                          >
                            {isMarked ? (
                              <BookmarkCheck className="h-4 w-4" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      </div>

      {/* PDF Viewer */}
      {selectedDocument && (
        <PdfViewer
          open={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          documentId={selectedDocument.id}
          workspaceId={workspaceId}
          documentName={selectedDocument.name}
          onSendAsContext={onDocumentContext}
        />
      )}
    </>
  );
}

