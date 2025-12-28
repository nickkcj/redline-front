"use client";

import * as React from "react";
import { useCurrentWorkspace } from "@/store/app-store";
import { Sidebar } from "@/components/features/old/sidebar";
import { ChatArea } from "@/components/features/chat/chat-area";
import { PdfViewer } from "@/components/features/old/pdf-viewer";

interface WorkspacePageProps {
  params: Promise<{
    orgId: string;
    workspaceId: string;
  }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const currentWorkspace = useCurrentWorkspace();
  const [resolvedParams, setResolvedParams] = React.useState<{
    orgId: string;
    workspaceId: string;
  } | null>(null);
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const handleNewChat = React.useCallback(() => {
    setCurrentChatId(null);
  }, []);

  const handleChatCreated = React.useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const handleDocumentClick = React.useCallback(
    (documentId: string, documentName: string) => {
      setSelectedDocument({ id: documentId, name: documentName });
    },
    []
  );

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-border border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-background flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar
            workspaceId={resolvedParams.workspaceId}
            workspaceName={currentWorkspace?.name || "Workspace"}
            organizationId={resolvedParams.orgId}
            currentChatId={currentChatId}
            onChatSelect={setCurrentChatId}
            onNewChat={handleNewChat}
            onDocumentClick={handleDocumentClick}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 min-w-0 overflow-hidden bg-background">
          <ChatArea
            workspaceId={resolvedParams.workspaceId}
            chatId={currentChatId}
            onChatCreated={handleChatCreated}
          />
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedDocument && (
        <PdfViewer
          open={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          documentId={selectedDocument.id}
          workspaceId={resolvedParams.workspaceId}
          documentName={selectedDocument.name}
        />
      )}
    </>
  );
}
