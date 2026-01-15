import { create } from 'zustand'
import { JSONContent } from '@tiptap/react'

export interface Document {
  id: string
  title: string
  content: JSONContent
  createdAt: Date
  updatedAt: Date
  author: string
  collaborators: string[]
  tags: string[]
}

interface EditorStore {
  // Current document
  currentDocument: Document | null
  setCurrentDocument: (doc: Document | null) => void

  // Editor state
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void

  // Save state
  isSaving: boolean
  lastSaved: Date | null
  
  // Auto-save settings
  autoSave: boolean
  setAutoSave: (autoSave: boolean) => void

  // Actions
  saveDocument: (content: JSONContent) => Promise<void>
  createDocument: (title: string) => Promise<Document>
  updateDocumentContent: (content: JSONContent) => void
  updateDocumentTitle: (title: string) => void
  
  // Local storage of documents (for demo purposes)
  documents: Document[]
  addDocument: (doc: Document) => void
  removeDocument: (id: string) => void
  getDocumentById: (id: string) => Document | undefined
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentDocument: null,
  setCurrentDocument: (doc) => set({ currentDocument: doc }),

  isEditing: false,
  setIsEditing: (isEditing) => set({ isEditing }),

  isSaving: false,
  lastSaved: null,

  autoSave: true,
  setAutoSave: (autoSave) => set({ autoSave }),

  documents: [],

  saveDocument: async (content: JSONContent) => {
    const { currentDocument } = get()
    if (!currentDocument) return

    set({ isSaving: true })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedDoc: Document = {
        ...currentDocument,
        content,
        updatedAt: new Date(),
      }

      set({
        currentDocument: updatedDoc,
        isSaving: false,
        lastSaved: new Date(),
      })

      // Update in documents list
      const documents = get().documents.map((doc) =>
        doc.id === updatedDoc.id ? updatedDoc : doc
      )
      set({ documents })

      // Save to localStorage for demo
      if (typeof window !== 'undefined') {
        localStorage.setItem(`document-${updatedDoc.id}`, JSON.stringify(updatedDoc))
      }
    } catch (error) {
      console.error('Failed to save document:', error)
      set({ isSaving: false })
    }
  },

  createDocument: async (title: string) => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title,
      content: {
        type: 'doc',
        content: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'current-user', // Replace with actual user
      collaborators: [],
      tags: [],
    }

    set((state) => ({
      documents: [...state.documents, newDoc],
      currentDocument: newDoc,
    }))

    // Save to localStorage for demo
    if (typeof window !== 'undefined') {
      localStorage.setItem(`document-${newDoc.id}`, JSON.stringify(newDoc))
    }

    return newDoc
  },

  updateDocumentContent: (content: JSONContent) => {
    const { currentDocument, autoSave } = get()
    if (!currentDocument) return

    // Compare content to avoid unnecessary updates
    const currentContentStr = JSON.stringify(currentDocument.content)
    const newContentStr = JSON.stringify(content)
    
    // Only update if content actually changed
    if (currentContentStr === newContentStr) {
      return // No change, skip update
    }

    const updatedDoc: Document = {
      ...currentDocument,
      content,
      updatedAt: new Date(),
    }

    set({ currentDocument: updatedDoc })

    // Auto-save if enabled
    if (autoSave) {
      // Clear any existing timeout
      const existingTimeout = (get() as any).__saveTimeout
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }
      
      const saveTimeout = setTimeout(() => {
        get().saveDocument(content)
        ;(get() as any).__saveTimeout = null
      }, 2000) // Debounce 2 seconds
      
      ;(get() as any).__saveTimeout = saveTimeout
    }
  },

  updateDocumentTitle: (title: string) => {
    const { currentDocument } = get()
    if (!currentDocument) return

    const updatedDoc: Document = {
      ...currentDocument,
      title,
      updatedAt: new Date(),
    }

    set({ currentDocument: updatedDoc })

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`document-${updatedDoc.id}`, JSON.stringify(updatedDoc))
    }

    // Update in documents list
    const documents = get().documents.map((doc) =>
      doc.id === updatedDoc.id ? updatedDoc : doc
    )
    set({ documents })
  },

  addDocument: (doc) =>
    set((state) => ({
      documents: [...state.documents, doc],
    })),

  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),

  getDocumentById: (id) => {
    return get().documents.find((doc) => doc.id === id)
  },
}))
