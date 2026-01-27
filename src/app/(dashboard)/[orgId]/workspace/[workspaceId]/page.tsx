"use client";

import * as React from "react";
import { Plus, ClockCounterClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { BreadcrumbHeader } from "@/components/layout/breadcrumb-header";
import { ModernChatArea } from "@/components/features/chat";
import { ChatHistorySheet } from "@/components/features/chat/chat-history-sheet";
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store";

interface WorkspacePageProps {
  params: Promise<{
    orgId: string;
    workspaceId: string;
  }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const currentOrganization = useCurrentOrganization();
  const currentWorkspace = useCurrentWorkspace();
  const [resolvedParams, setResolvedParams] = React.useState<{
    orgId: string;
    workspaceId: string;
  } | null>(null);
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const handleNewChat = React.useCallback(() => {
    setCurrentChatId(null);
  }, []);

  const handleChatCreated = React.useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const handleSelectChat = React.useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

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

  // Dynamic breadcrumbs
  const breadcrumbs = [
    { label: currentOrganization?.name || 'Organization', href: '/' },
    { label: currentWorkspace?.name || 'Workspace' },
    { label: 'Chat' },
  ];

  // Header actions
  const actions = (
    <div className="flex items-center gap-2">
      <ChatClockCounterClockwise weight="bold"Sheet
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId || undefined}
        trigger={
          <Button variant="outline" size="sm">
            <ClockCounterClockwise weight="bold" className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        }
      />
      <Button onClick={handleNewChat} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Nova Conversa
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      <BreadcrumbHeader breadcrumbs={breadcrumbs} actions={actions} />

      <div className="flex-1 min-h-0">
        <ModernChatArea
          workspaceId={resolvedParams.workspaceId}
          chatId={currentChatId}
          onChatCreated={handleChatCreated}
        />
      </div>
    </div>
  );
}
