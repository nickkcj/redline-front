"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";
import { ChatSheet } from "./chat-sheet";
import { CommandPaletteProvider } from "@/components/providers/command-palette-provider";
import { CommandPaletteContextProvider } from "@/contexts/command-palette-context";

export function AppShell({ children }: { children: React.ReactNode }) {
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
            <main className="p-4 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </CommandPaletteContextProvider>
    </TooltipProvider>
  );
}