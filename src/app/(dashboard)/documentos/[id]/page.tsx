'use client'

import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { useEditorStore } from '@/store/editor-store'
import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

export default function DocumentEditPage() {
  const params = useParams()
  const documentId = params?.id as string
  const { currentDocument, setCurrentDocument, updateDocumentContent, updateDocumentTitle, createDocument, getDocumentById } = useEditorStore()
  const [title, setTitle] = useState('')
  const titleInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (documentId === 'new') {
      // Create new document
      createDocument('Untitled').then((doc) => {
        setCurrentDocument(doc)
        setTitle('Untitled')
        // Auto-focus on title for new documents
        setTimeout(() => {
          titleInputRef.current?.focus()
          titleInputRef.current?.select()
        }, 100)
      })
    } else {
      // Load existing document
      const doc = getDocumentById(documentId)
      if (doc) {
        setCurrentDocument(doc)
        setTitle(doc.title || 'Untitled')
      } else if (typeof window !== 'undefined') {
        // Try localStorage
        const stored = localStorage.getItem(`document-${documentId}`)
        if (stored) {
          const doc = JSON.parse(stored)
          setCurrentDocument(doc)
          setTitle(doc.title || 'Untitled')
        }
      }
    }
  }, [documentId, createDocument, setCurrentDocument, getDocumentById])

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading document...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-8">
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
            minHeight="calc(100vh - 200px)"
            className="-mx-2"
          />
        </div>
      </div>
    </div>
  )
}
