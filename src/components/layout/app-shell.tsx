"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";
import { ChatSheet } from "./chat-sheet";
import { CommandPaletteProvider } from "@/components/providers/command-palette-provider";
import { CommandPaletteContextProvider } from "@/contexts/command-palette-context";
import { useAuthGuard } from "@/lib/auth/hooks/use-auth-guard";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthGuard();
  const pathname = usePathname();
  const isAiChatPage = pathname === "/ai-chat";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <CommandPaletteContextProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "14rem",
              "--sidebar-width-mobile": "16rem",
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset className="min-h-svh">
            <CommandPaletteProvider />
            <ChatSheet />
            <main className="p-4 md:p-6">
              {!isAiChatPage && <Breadcrumbs />}
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </CommandPaletteContextProvider>
    </TooltipProvider>
  );
}