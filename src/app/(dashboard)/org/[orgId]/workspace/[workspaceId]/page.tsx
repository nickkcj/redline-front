"use client";

import * as React from "react";
import { useCurrentWorkspace } from "@/store/app-store";
import { WorkspaceChat } from "@/components/workspace/workspace-chat";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";

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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentChatId, setCurrentChatId] = React.useState<string | undefined>(undefined);
  const documentContextRef = React.useRef<((documentId: string, documentName: string) => void) | null>(null);

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Carregando workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden relative">
      <div className="flex h-full">
        {/* Main Chat Area */}
        <div className="flex-1 transition-all duration-300">
          <WorkspaceChat
            workspaceId={resolvedParams.workspaceId}
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            chatId={currentChatId}
            onChatIdChange={setCurrentChatId}
            onDocumentContextRef={documentContextRef}
          />
        </div>

        {/* Sidebar */}
        <WorkspaceSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          workspaceId={resolvedParams.workspaceId}
          onChatSelect={setCurrentChatId}
          currentChatId={currentChatId}
          onDocumentContext={(documentId, documentName) => {
            if (documentContextRef.current) {
              documentContextRef.current(documentId, documentName);
            }
          }}
        />
      </div>
    </div>
  );
}
