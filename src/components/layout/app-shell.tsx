"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";
import { ChatSheet } from "./chat-sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
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
          <ChatSheet />
          <main className="p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}