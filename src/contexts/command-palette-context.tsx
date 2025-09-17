"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface CommandPaletteContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  openPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export function CommandPaletteContextProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // cmd+k or ctrl+k
      if (e.key === "k" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [toggle]);

  const value = {
    open,
    setOpen,
    toggle,
    close,
    openPalette,
  };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error("useCommandPaletteContext must be used within a CommandPaletteContextProvider");
  }
  return context;
}