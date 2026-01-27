import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type TabType = 'home' | 'chat' | 'document' | 'files' | 'spaces' | 'agents' | 'pages' | 'templates'

export interface Tab {
  id: string
  type: TabType
  title: string
  data?: any // For storing chat ID, document ID, content, etc.
  groupId?: string // ID do grupo de abas (para split view)
}

export interface Workspace {
  id: string
  name: string
  icon: string
  plan: string
}

interface WorkspaceState {
  // Workspace State
  workspaces: Workspace[]
  activeWorkspaceId: string
  setActiveWorkspace: (id: string) => void

  // Tab State
  tabs: Tab[]
  activeTabId: string | null
  addTab: (type: TabType, title: string, data?: any) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTab: (id: string, updates: Partial<Tab>) => void

  // UI State
  sidebarLeftOpen: boolean
  sidebarRightOpen: boolean
  settingsOpen: boolean
  isSplit: boolean
  activeSplitTabId: string | null
  isThreeColumnSplit: boolean
  activeThirdTabId: string | null
  splitChoiceDialogOpen: boolean
  pendingSplitTabId: string | null
  toggleSidebarLeft: () => void
  toggleSidebarRight: () => void
  setSidebarLeftOpen: (open: boolean) => void
  setSidebarRightOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  toggleSplit: () => void
  toggleThreeColumnSplit: () => void
  setSplitTab: (id: string | null) => void
  setThirdTab: (id: string | null) => void
  reorderColumns: (newOrder: { main: string, split: string, third: string }) => void
  setSplitChoiceDialogOpen: (open: boolean) => void
  setPendingSplitTabId: (id: string | null) => void
  closeSplitTab: (which: 'main' | 'split' | 'third') => void
  
  // Advanced tab opening methods
  addTabInNewWindow: (type: TabType, title: string, data?: any) => void
  addTabInSplit: (type: TabType, title: string, data?: any) => void
  addTabWithSplitChoice: (type: TabType, title: string, data?: any) => void
}

const defaultWorkspaces: Workspace[] = [
  { id: 'ws-1', name: "Castro's Space", icon: 'CN', plan: 'Free Plan' },
  { id: 'ws-2', name: "Dooor Foundation", icon: 'DF', plan: 'Enterprise' },
  { id: 'ws-3', name: "Nathan Castro's Space", icon: 'NC', plan: 'Pro' },
]

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // Workspace Defaults
  workspaces: defaultWorkspaces,
  activeWorkspaceId: defaultWorkspaces[0].id,
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

  // Tab Defaults
  tabs: [{ id: 'tab-home', type: 'home', title: 'Home' }],
  activeTabId: 'tab-home',

  addTab: (type, title, data) => {
    set((state) => {
      // Se há uma aba ativa, substituir seu conteúdo
      if (state.activeTabId) {
        // Se estiver em split, desativar split ao substituir
        return {
          tabs: state.tabs.map((t) => 
            t.id === state.activeTabId 
              ? { ...t, type, title, data, groupId: undefined }
              : t
          ),
          activeTabId: state.activeTabId, // Mantém a mesma aba ativa
          isSplit: false, // Desativa split ao substituir
          activeSplitTabId: null
        }
      }
      
      // Se não há aba ativa, criar nova
      const newTab: Tab = {
        id: nanoid(),
        type,
        title,
        data
      }
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
        isSplit: false, // Nova aba não abre em split
        activeSplitTabId: null
      }
    })
  },

  closeTab: (id) => {
    set((state) => {
      const tabToClose = state.tabs.find(t => t.id === id)
      const groupId = tabToClose?.groupId
      
      const newTabs = state.tabs.filter((t) => t.id !== id)
      
      // Verificar se estamos em modo de 3 colunas e a aba fechada faz parte do grupo
      if (state.isThreeColumnSplit && groupId) {
        const groupTabs = state.tabs.filter(t => t.groupId === groupId)
        
        // Se o grupo tinha 3 abas e uma foi fechada, manter as outras 2 em modo de 2 colunas
        if (groupTabs.length === 3) {
          const remainingTabs = groupTabs.filter(t => t.id !== id)
          
          if (remainingTabs.length === 2) {
            // Criar novo grupo para as 2 abas restantes
            const newGroupId = nanoid()
            const [firstTab, secondTab] = remainingTabs
            
            // Determinar qual aba vai para main e qual para split
            let newMainId = firstTab.id
            let newSplitId = secondTab.id
            
            // Se fechamos a main, a split vira main e a third vira split
            if (id === state.activeTabId) {
              newMainId = state.activeSplitTabId || firstTab.id
              newSplitId = state.activeThirdTabId || secondTab.id
            }
            // Se fechamos a split, manter main e third vira split
            else if (id === state.activeSplitTabId) {
              newMainId = state.activeTabId
              newSplitId = state.activeThirdTabId || secondTab.id
            }
            // Se fechamos a third, manter main e split
            else if (id === state.activeThirdTabId) {
              newMainId = state.activeTabId
              newSplitId = state.activeSplitTabId || secondTab.id
            }
            
            return {
              tabs: newTabs.map(t => 
                (t.id === newMainId || t.id === newSplitId)
                  ? { ...t, groupId: newGroupId }
                  : { ...t, groupId: t.groupId === groupId ? undefined : t.groupId }
              ),
              activeTabId: newMainId,
              activeSplitTabId: newSplitId,
              activeThirdTabId: null,
              isSplit: true,
              isThreeColumnSplit: false
            }
          }
        }
      }
      
      // Se a aba fechada fazia parte de um grupo, remover o grupo das outras abas
      const updatedTabs = groupId 
        ? newTabs.map(t => t.groupId === groupId ? { ...t, groupId: undefined } : t)
        : newTabs
      
      // Se fechamos a aba ativa ou a split, desativar split
      let newActiveId = state.activeTabId
      let newSplitId = state.activeSplitTabId
      let newThirdId = state.activeThirdTabId
      let shouldDisableSplit = false
      
      if (id === state.activeTabId) {
        newActiveId = updatedTabs.length > 0 ? updatedTabs[updatedTabs.length - 1].id : null
        shouldDisableSplit = true
      }
      
      if (id === state.activeSplitTabId) {
        newSplitId = null
        shouldDisableSplit = true
      }
      
      if (id === state.activeThirdTabId) {
        newThirdId = null
        // Se estava em 3 colunas, desativar 3 colunas mas manter split se houver main
        if (state.isThreeColumnSplit) {
          return {
            tabs: updatedTabs,
            activeTabId: state.activeTabId,
            activeSplitTabId: state.activeSplitTabId,
            activeThirdTabId: null,
            isSplit: !!state.activeSplitTabId,
            isThreeColumnSplit: false
          }
        }
      }
      
      // If no tabs left, maybe open Home by default? 
      // User requirement: "browser-like". Usually browsers close window if last tab closed, 
      // but here we probably want at least one tab or empty state. 
      // Let's force Home if empty for better UX.
      if (updatedTabs.length === 0) {
        const homeTab = { id: nanoid(), type: 'home' as TabType, title: 'Home' }
        return { 
          tabs: [homeTab], 
          activeTabId: homeTab.id,
          isSplit: false,
          isThreeColumnSplit: false,
          activeSplitTabId: null,
          activeThirdTabId: null
        }
      }

      return { 
        tabs: updatedTabs, 
        activeTabId: newActiveId,
        activeSplitTabId: newSplitId,
        activeThirdTabId: newThirdId,
        isSplit: shouldDisableSplit ? false : state.isSplit,
        isThreeColumnSplit: shouldDisableSplit ? false : (state.isThreeColumnSplit && !!newThirdId)
      }
    })
  },

  setActiveTab: (id) => set((state) => {
    const clickedTab = state.tabs.find(t => t.id === id)
    
    // Se a aba clicada faz parte de um grupo, restaurar o split view
    if (clickedTab?.groupId) {
      // Encontrar todas as abas do mesmo grupo
      const groupTabs = state.tabs.filter(t => t.groupId === clickedTab.groupId)
      
      if (groupTabs.length === 3) {
        // Restaurar split de 3 colunas
        const [first, second, third] = groupTabs
        return {
          activeTabId: first.id,
          activeSplitTabId: second.id,
          activeThirdTabId: third.id,
          isSplit: true,
          isThreeColumnSplit: true
        }
      } else if (groupTabs.length === 2) {
        // Restaurar split de 2 colunas
        const otherTab = groupTabs.find(t => t.id !== id)
        if (otherTab) {
          return {
            activeTabId: id,
            activeSplitTabId: otherTab.id,
            isSplit: true,
            isThreeColumnSplit: false,
            activeThirdTabId: null
          }
        }
      }
    }
    
    // Se não faz parte de um grupo ou grupo não encontrado, apenas ativar a aba
    // e desativar split se estiver ativo
    return {
      activeTabId: id,
      isSplit: false,
      isThreeColumnSplit: false,
      activeSplitTabId: null,
      activeThirdTabId: null
    }
  }),
  
  updateTab: (id, updates) => set((state) => ({
    tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t))
  })),

  // UI Defaults
  sidebarLeftOpen: true,
  sidebarRightOpen: false, // Default closed as per requirement "colapsavel"
  settingsOpen: false,
  isSplit: false,
  activeSplitTabId: null,
  isThreeColumnSplit: false,
  activeThirdTabId: null,
  splitChoiceDialogOpen: false,
  pendingSplitTabId: null,
  toggleSidebarLeft: () => set((state) => ({ sidebarLeftOpen: !state.sidebarLeftOpen })),
  toggleSidebarRight: () => set((state) => ({ sidebarRightOpen: !state.sidebarRightOpen })),
  setSidebarLeftOpen: (open) => set({ sidebarLeftOpen: open }),
  setSidebarRightOpen: (open) => set({ sidebarRightOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  toggleSplit: () => set((state) => {
    if (state.isSplit) {
      // Ao desativar split, remover grupos das abas
      return {
        isSplit: false,
        activeSplitTabId: null,
        isThreeColumnSplit: false,
        activeThirdTabId: null,
        tabs: state.tabs.map(t => ({ ...t, groupId: undefined }))
      }
    } else {
      return { isSplit: true, activeSplitTabId: null }
    }
  }),
  toggleThreeColumnSplit: () => set((state) => {
    if (state.isThreeColumnSplit) {
      // Ao desativar 3 colunas, manter apenas split de 2
      return {
        isThreeColumnSplit: false,
        activeThirdTabId: null,
        isSplit: true,
        tabs: state.tabs.map(t => {
          // Manter apenas 2 abas no grupo (main e split)
          if (t.id === state.activeTabId || t.id === state.activeSplitTabId) {
            return t
          }
          return { ...t, groupId: undefined }
        })
      }
    } else {
      // Ativar 3 colunas (precisa ter split ativo)
      if (state.isSplit) {
        return { isThreeColumnSplit: true, activeThirdTabId: null }
      }
      return state
    }
  }),
  setSplitTab: (id) => set((state) => {
    // Criar um grupo para as abas quando split é ativado
    const groupId = nanoid()
    
    return {
      activeSplitTabId: id,
      tabs: state.tabs.map(t => {
        // Se estiver em modo 3 colunas, incluir a terceira aba no grupo
        if (state.isThreeColumnSplit) {
          return (t.id === state.activeTabId || t.id === id || t.id === state.activeThirdTabId)
            ? { ...t, groupId }
            : t
        }
        // Modo 2 colunas normal
        return (t.id === state.activeTabId || t.id === id)
          ? { ...t, groupId }
          : t
      })
    }
  }),
  setThirdTab: (id) => set((state) => {
    // Criar/atualizar grupo para as 3 abas
    const groupId = nanoid()
    
    return {
      activeThirdTabId: id,
      tabs: state.tabs.map(t => 
        (t.id === state.activeTabId || t.id === state.activeSplitTabId || t.id === id)
          ? { ...t, groupId }
          : t
      )
    }
  }),
  reorderColumns: (newOrder) => set((state) => {
    // Reordenar as colunas mantendo o grupo
    const groupId = state.tabs.find(t => t.id === state.activeTabId)?.groupId || nanoid()
    
    return {
      activeTabId: newOrder.main,
      activeSplitTabId: newOrder.split,
      activeThirdTabId: newOrder.third,
      tabs: state.tabs.map(t => 
        (t.id === newOrder.main || t.id === newOrder.split || t.id === newOrder.third)
          ? { ...t, groupId }
          : t
      )
    }
  }),
  setSplitChoiceDialogOpen: (open) => set({ splitChoiceDialogOpen: open }),
  setPendingSplitTabId: (id) => set({ pendingSplitTabId: id }),
  closeSplitTab: (which) => set((state) => {
    if (which === 'main') {
      // Se fechar a aba principal, mover a split para principal e desativar split
      if (state.activeSplitTabId) {
        const mainTab = state.tabs.find(t => t.id === state.activeTabId)
        const groupId = mainTab?.groupId
        
        // Remover grupo das abas
        const updatedTabs = state.tabs.map(t => 
          t.groupId === groupId ? { ...t, groupId: undefined } : t
        )
        
        return {
          tabs: updatedTabs,
          activeTabId: state.activeSplitTabId,
          activeSplitTabId: null,
          isSplit: false
        }
      } else {
        // Se não houver split tab, apenas fechar a aba principal normalmente
        const newTabs = state.tabs.filter((t) => t.id !== state.activeTabId)
        let newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null
        
        if (newTabs.length === 0) {
          const homeTab = { id: nanoid(), type: 'home' as TabType, title: 'Home' }
          return { 
            tabs: [homeTab], 
            activeTabId: homeTab.id,
            isSplit: false,
            activeSplitTabId: null
          }
        }
        
        return { 
          tabs: newTabs, 
          activeTabId: newActiveId,
          isSplit: false,
          activeSplitTabId: null
        }
      }
    } else if (which === 'split') {
      // Se fechar a aba split, remover grupo e limpar o split
      const splitTab = state.tabs.find(t => t.id === state.activeSplitTabId)
      const groupId = splitTab?.groupId
      
      // Remover grupo das abas
      const updatedTabs = state.tabs.map(t => 
        t.groupId === groupId ? { ...t, groupId: undefined } : t
      )
      
      return {
        tabs: updatedTabs,
        activeSplitTabId: null,
        isSplit: false,
        isThreeColumnSplit: false,
        activeThirdTabId: null
      }
    } else {
      // Fechar terceira coluna
      if (state.isThreeColumnSplit && state.activeThirdTabId) {
        // Manter grupo com apenas 2 abas
        const groupId = state.tabs.find(t => t.id === state.activeTabId)?.groupId
        
        return {
          tabs: state.tabs.map(t => {
            if (t.id === state.activeThirdTabId) {
              return { ...t, groupId: undefined }
            }
            return t
          }),
          activeThirdTabId: null,
          isThreeColumnSplit: false
        }
      }
      return state
    }
  }),
  
  // Advanced tab opening methods
  addTabInNewWindow: (type, title, data) => {
    const newTab: Tab = {
      id: nanoid(),
      type,
      title,
      data
    }
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id, // Activate the new tab
      isSplit: false, // Nova aba não abre em split
      activeSplitTabId: null
    }))
  },
  
  addTabInSplit: (type, title, data) => {
    const newTab: Tab = {
      id: nanoid(),
      type,
      title,
      data
    }
    set((state) => {
      // If split is not active, activate it
      const shouldActivateSplit = !state.isSplit
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: state.activeTabId, // Keep current tab active
        isSplit: true,
        activeSplitTabId: newTab.id // Put new tab in split
      }
    })
  },
  
  addTabWithSplitChoice: (type, title, data) => {
    const newTab: Tab = {
      id: nanoid(),
      type,
      title,
      data
    }
    set((state) => {
      // Adicionar nova aba e ativar split sem modal
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: state.activeTabId, // Keep current tab active
        isSplit: true,
        activeSplitTabId: null, // Split ficará vazio mostrando a seleção
        splitChoiceDialogOpen: false,
        pendingSplitTabId: newTab.id
      }
    })
  },
}))
