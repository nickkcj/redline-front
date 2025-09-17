"use client";

import { useState, useEffect, useCallback } from "react";

export function useCommandPalette() {
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

  return {
    open,
    setOpen,
    toggle,
    close,
    openPalette,
  };
}