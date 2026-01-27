import { create } from 'zustand'

interface StatusBarState {
  message: string
  type: 'idle' | 'loading' | 'success' | 'error' | 'warning'
  setStatus: (message: string, type?: 'idle' | 'loading' | 'success' | 'error' | 'warning', duration?: number) => void
  setLoading: (message: string) => void
  setSuccess: (message: string, duration?: number) => void
  setError: (message: string, duration?: number) => void
  setWarning: (message: string, duration?: number) => void
  clearStatus: () => void
}

export const useStatusBarStore = create<StatusBarState>((set) => ({
  message: 'Pronto',
  type: 'idle',
  
  setStatus: (message, type = 'idle', duration) => {
    set({ message, type })
    if (duration) {
      setTimeout(() => {
        set({ message: 'Pronto', type: 'idle' })
      }, duration)
    }
  },
  
  setLoading: (message) => {
    set({ message, type: 'loading' })
  },
  
  setSuccess: (message, duration = 2000) => {
    set({ message, type: 'success' })
    setTimeout(() => {
      set({ message: 'Pronto', type: 'idle' })
    }, duration)
  },
  
  setError: (message, duration = 3000) => {
    set({ message, type: 'error' })
    setTimeout(() => {
      set({ message: 'Pronto', type: 'idle' })
    }, duration)
  },
  
  setWarning: (message, duration = 2500) => {
    set({ message, type: 'warning' })
    setTimeout(() => {
      set({ message: 'Pronto', type: 'idle' })
    }, duration)
  },
  
  clearStatus: () => {
    set({ message: 'Pronto', type: 'idle' })
  },
}))

/**
 * Hook para controlar a barra de status
 * 
 * @example
 * ```tsx
 * const { setSuccess, setError, setLoading } = useStatusBar()
 * 
 * // Ao salvar algo
 * setLoading('Salvando documento...')
 * await save()
 * setSuccess('Documento salvo com sucesso!')
 * 
 * // Ao carregar
 * setLoading('Carregando dados...')
 * 
 * // Ao ocorrer erro
 * setError('Falha ao conectar com servidor')
 * ```
 */
export const useStatusBar = () => {
  const { setStatus, setLoading, setSuccess, setError, setWarning, clearStatus } = useStatusBarStore()
  
  return {
    setStatus,
    setLoading,
    setSuccess,
    setError,
    setWarning,
    clearStatus,
  }
}
