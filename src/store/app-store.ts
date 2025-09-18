import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization, UserWorkspace } from '@/types/common'

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean

  // Organization & Workspace state
  currentOrganization: Organization | null
  currentWorkspace: UserWorkspace | null

  // UI state
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean

  // Loading states
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  reset: () => void

  // Organization & Workspace actions
  setCurrentOrganization: (org: Organization | null) => void
  setCurrentWorkspace: (workspace: UserWorkspace | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      currentOrganization: null,
      currentWorkspace: null,
      theme: 'system',
      sidebarOpen: true,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setLoading: (isLoading) => set({ isLoading }),

      // Organization & Workspace actions
      setCurrentOrganization: (currentOrganization) => set({ currentOrganization }),
      setCurrentWorkspace: (currentWorkspace) => set({ currentWorkspace }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        currentOrganization: null,
        currentWorkspace: null,
      }),

      reset: () => set({
        user: null,
        isAuthenticated: false,
        currentOrganization: null,
        currentWorkspace: null,
        theme: 'system',
        sidebarOpen: true,
        isLoading: false,
      }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        // Note: We don't persist org/workspace state - it should be driven by URL
      }),
    }
  )
)

// Selector hooks for performance
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useTheme = () => useAppStore((state) => state.theme)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)
export const useIsLoading = () => useAppStore((state) => state.isLoading)

// Organization & Workspace selectors
export const useCurrentOrganization = () => useAppStore((state) => state.currentOrganization)
export const useCurrentWorkspace = () => useAppStore((state) => state.currentWorkspace)

// Action selectors
export const useSetUser = () => useAppStore((state) => state.setUser)
export const useSetAuthenticated = () => useAppStore((state) => state.setAuthenticated)
export const useSetTheme = () => useAppStore((state) => state.setTheme)
export const useSetSidebarOpen = () => useAppStore((state) => state.setSidebarOpen)
export const useSetLoading = () => useAppStore((state) => state.setLoading)
export const useLogout = () => useAppStore((state) => state.logout)
export const useReset = () => useAppStore((state) => state.reset)

// Organization & Workspace action selectors
export const useSetCurrentOrganization = () => useAppStore((state) => state.setCurrentOrganization)
export const useSetCurrentWorkspace = () => useAppStore((state) => state.setCurrentWorkspace)