'use client'

import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { useEditorStore } from '@/store/editor-store'
import { useEffect, useState, useRef } from 'react'
import { JSONContent } from '@tiptap/react'

// New documents start empty - no mock data
function getDocumentData(docId: string | undefined): { title: string } {
  // TODO: Fetch document data from API based on docId
  return { title: 'Untitled' }
}

export function DocumentView({ tabId, tabData }: { tabId: string; tabData?: any }) {
  const { currentDocument, setCurrentDocument, updateDocumentContent, createDocument, updateDocumentTitle } = useEditorStore()
  const [title, setTitle] = useState('')
  const titleInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Load or create a document for this tab - only when tabId changes
    if (!currentDocument || currentDocument.id !== tabId) {
      // Try to load from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`document-${tabId}`)
        if (stored) {
          const doc = JSON.parse(stored)
          setCurrentDocument(doc)
          setTitle(doc.title || '')
        } else {
          // Get document data (from API in the future)
          const docData = getDocumentData(tabData?.id)

          // Create a new document
          createDocument(docData.title).then((doc) => {
            setCurrentDocument(doc)
            setTitle(docData.title)

            // Auto-focus on title for new documents
            setTimeout(() => {
              titleInputRef.current?.focus()
              titleInputRef.current?.select()
            }, 100)
          })
        }
      }
    } else if (currentDocument) {
      setTitle(currentDocument.title || '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, tabData]) // Intentionally excluding currentDocument, setCurrentDocument, createDocument to prevent infinite loops

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (updateDocumentTitle) {
      updateDocumentTitle(newTitle)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Focus on editor when pressing Enter
      const editorElement = document.querySelector('.ProseMirror') as HTMLElement
      editorElement?.focus()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = 'auto'
      titleInputRef.current.style.height = titleInputRef.current.scrollHeight + 'px'
    }
  }, [title])

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-muted-foreground">Loading document...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-8 min-h-full">
      <div className="space-y-1">
        {/* Title Input - Notion Style */}
        <textarea
          ref={titleInputRef}
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full text-5xl font-bold resize-none outline-none border-none bg-transparent focus:outline-none focus:ring-0 placeholder:text-muted-foreground/30 overflow-hidden"
          rows={1}
          style={{ minHeight: '1.2em' }}
        />

        {/* Tiptap Editor */}
        <TiptapEditor
          documentId={currentDocument.id}
          content={currentDocument.content}
          onChange={updateDocumentContent}
          editable={true}
          showToolbar={false}
          showBubbleMenu={true}
          placeholder="Press Enter to continue with the main text..."
          minHeight="500px"
          className="-mx-2"
        />
      </div>
    </div>
  )
}
