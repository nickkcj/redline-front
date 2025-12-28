// ============================================================
// APP STORE - Gerenciamento de estado global da aplicação
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, PersistedAppState } from './types'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ==================== INITIAL STATE ====================
      user: null,
      isAuthenticated: false,
      currentOrganization: null,
      currentWorkspace: null,
      theme: 'system',
      sidebarOpen: true,

      // ==================== USER ACTIONS ====================
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // ==================== UI ACTIONS ====================
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // ==================== ORGANIZATION & WORKSPACE ACTIONS ====================
      setCurrentOrganization: (currentOrganization) => set({ currentOrganization }),
      setCurrentWorkspace: (currentWorkspace) => set({ currentWorkspace }),

      // ==================== RESET ACTIONS ====================
      /**
       * Logout: Limpa apenas user e contexto org/workspace
       * Mantém preferências de UI (theme, sidebar)
       */
      logout: () => set({
        user: null,
        isAuthenticated: false,
        currentOrganization: null,
        currentWorkspace: null,
      }),

      /**
       * Reset: Limpa TUDO incluindo preferências de UI
       * Útil para "factory reset" ou troca completa de conta
       */
      reset: () => set({
        user: null,
        isAuthenticated: false,
        currentOrganization: null,
        currentWorkspace: null,
        theme: 'system',
        sidebarOpen: true,
      }),
    }),
    {
      name: 'app-store',
      partialize: (state): PersistedAppState => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        // Note: We don't persist org/workspace state - it should be driven by URL
      }),
    }
  )
)

// ============================================================
// SELECTOR HOOKS - Para performance otimizada
// ============================================================

// User selectors
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)

// UI selectors
export const useTheme = () => useAppStore((state) => state.theme)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)

// Organization & Workspace selectors
export const useCurrentOrganization = () => useAppStore((state) => state.currentOrganization)
export const useCurrentWorkspace = () => useAppStore((state) => state.currentWorkspace)

// ============================================================
// ACTION SELECTORS - Para evitar re-renders desnecessários
// ============================================================

// User actions
export const useSetUser = () => useAppStore((state) => state.setUser)

// UI actions
export const useSetTheme = () => useAppStore((state) => state.setTheme)
export const useSetSidebarOpen = () => useAppStore((state) => state.setSidebarOpen)

// Organization & Workspace actions
export const useSetCurrentOrganization = () => useAppStore((state) => state.setCurrentOrganization)
export const useSetCurrentWorkspace = () => useAppStore((state) => state.setCurrentWorkspace)

// Reset actions
export const useLogout = () => useAppStore((state) => state.logout)
export const useReset = () => useAppStore((state) => state.reset)
