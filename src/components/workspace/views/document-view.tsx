'use client'

import { FileText, MoreHorizontal, Clock, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { useEditorStore } from '@/store/editor-store'
import { useEffect, useState } from 'react'
import { JSONContent } from '@tiptap/react'

export function DocumentView({ tabId }: { tabId: string }) {
  const { currentDocument, setCurrentDocument, updateDocumentContent, createDocument } = useEditorStore()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Load or create a document for this tab
    if (!currentDocument || currentDocument.id !== tabId) {
      // Try to load from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`document-${tabId}`)
        if (stored) {
          const doc = JSON.parse(stored)
          setCurrentDocument(doc)
        } else {
          // Create a new document with sample content
          const sampleContent: JSONContent = {
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

          createDocument('Technical Specifications').then((doc) => {
            const updatedDoc = { ...doc, content: sampleContent }
            setCurrentDocument(updatedDoc)
          })
        }
      }
    }
  }, [tabId, currentDocument, setCurrentDocument, createDocument])

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
        {/* Doc Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <FileText className="h-4 w-4" />
            <span>Documents / Engineering</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{currentDocument.title}</h1>

          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last edited {new Date(currentDocument.updatedAt).toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isEditing ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'View Mode' : 'Edit Mode'}
              </Button>
              <Button variant="ghost" size="sm">
                Share
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tiptap Editor */}
        <TiptapEditor
          content={currentDocument.content}
          onChange={updateDocumentContent}
          editable={isEditing}
          showToolbar={isEditing}
          showBubbleMenu={isEditing}
          placeholder="Start writing your document... Press / for commands"
          minHeight="500px"
        />
      </div>
    </div>
  )
}
