'use client'

import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { useEditorStore } from '@/store/editor-store'
import { useEffect } from 'react'
import { JSONContent } from '@tiptap/react'

export function DocumentView({ tabId, tabData }: { tabId: string; tabData?: any }) {
  const { currentDocument, setCurrentDocument, updateDocumentContent, createDocument } = useEditorStore()

  useEffect(() => {
    // Load or create a document for this tab - only when tabId changes
    if (!currentDocument || currentDocument.id !== tabId) {
      // Try to load from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`document-${tabId}`)
        if (stored) {
          const doc = JSON.parse(stored)
          setCurrentDocument(doc)
        } else {
          // Create a new document - empty if tabData?.isEmpty is true
          const shouldCreateEmpty = tabData?.isEmpty === true
          const documentContent: JSONContent = shouldCreateEmpty ? {
            type: 'doc',
            content: []
          } : {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Technical Specifications' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'This document outlines the technical architecture for the new workspace module. It includes details about state management, component hierarchy, and data flow.',
                  },
                ],
              },
              {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Overview' }],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'The system is built using React and Zustand for state management. We aim to replicate a browser-like tab experience within a single page application.',
                  },
                ],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'State Persistence' }],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Tab Isolation' }],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Collapsible Sidebars' }],
                      },
                    ],
                  },
                ],
              },
            ],
          }

          const documentTitle = shouldCreateEmpty ? 'Untitled' : 'Technical Specifications'
          createDocument(documentTitle).then((doc) => {
            const updatedDoc = { ...doc, content: documentContent }
            setCurrentDocument(updatedDoc)
          })
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, tabData]) // Intentionally excluding currentDocument, setCurrentDocument, createDocument to prevent infinite loops

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-muted-foreground">Loading document...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-8 min-h-full">
      <div className="space-y-6">

        {/* Tiptap Editor */}
        <TiptapEditor
          documentId={currentDocument.id}
          content={currentDocument.content}
          onChange={updateDocumentContent}
          editable={true}
          showToolbar={false}
          showBubbleMenu={true}
          placeholder="Start writing your document... Press / for commands"
          minHeight="500px"
          className="-mx-2"
        />
      </div>
    </div>
  )
}
