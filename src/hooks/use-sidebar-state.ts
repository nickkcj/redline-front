"use client"

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook para gerenciar estado de sidebars com persistência no localStorage
 * @param key - Chave única para o localStorage (ex: "documents-sidebar", "tables-sidebar")
 * @param defaultOpen - Estado padrão inicial (default: false)
 * @returns { isOpen, open, close, toggle }
 */
export function useSidebarState(key: string, defaultOpen: boolean = false) {
  const storageKey = `sidebar-${key}`

  // Initialize state from localStorage
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultOpen

    const stored = localStorage.getItem(storageKey)
    return stored !== null ? stored === 'true' : defaultOpen
  })

  // Persist state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(isOpen))
    }
  }, [isOpen, storageKey])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    isOpen,
    open,
    close,
    toggle
  }
}
