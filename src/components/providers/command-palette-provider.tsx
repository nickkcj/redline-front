"use client";

import { useCommandPaletteContext } from "@/contexts/command-palette-context";
import { CommandPalette } from "@/components/command-palette";

export function CommandPaletteProvider() {
  const { open, setOpen } = useCommandPaletteContext();

  return <CommandPalette open={open} onOpenChange={setOpen} />;
}