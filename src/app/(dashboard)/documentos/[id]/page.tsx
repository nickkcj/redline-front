'use client'

import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { useEditorStore } from '@/store/editor-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Share2, Download, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportAsMarkdownFile, exportAsJSONFile } from '@/components/editor/utils/markdown-converter'

export default function DocumentEditPage() {
  const params = useParams()
  const documentId = params?.id as string
  const { currentDocument, setCurrentDocument, updateDocumentContent, createDocument, getDocumentById } = useEditorStore()
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (documentId === 'new') {
      // Create new document
      createDocument('Untitled Document').then((doc) => {
        setCurrentDocument(doc)
        setTitle(doc.title)
      })
    } else {
      // Load existing document
      const doc = getDocumentById(documentId)
      if (doc) {
        setCurrentDocument(doc)
        setTitle(doc.title)
      } else if (typeof window !== 'undefined') {
        // Try localStorage
        const stored = localStorage.getItem(`document-${documentId}`)
        if (stored) {
          const doc = JSON.parse(stored)
          setCurrentDocument(doc)
          setTitle(doc.title)
        }
      }
    }
  }, [documentId, createDocument, setCurrentDocument, getDocumentById])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (currentDocument) {
      const updatedDoc = { ...currentDocument, title: newTitle }
      setCurrentDocument(updatedDoc)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`document-${currentDocument.id}`, JSON.stringify(updatedDoc))
      }
    }
  }

  const handleExport = (format: 'markdown' | 'json') => {
    if (!currentDocument) return
    
    if (format === 'markdown') {
      exportAsMarkdownFile(currentDocument.content, currentDocument.title)
    } else {
      exportAsJSONFile(currentDocument.content, currentDocument.title)
    }
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading document...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link href="/documentos">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-2"
                placeholder="Untitled Document"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('markdown')}>
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <TiptapEditor
          documentId={currentDocument.id}
          content={currentDocument.content}
          onChange={updateDocumentContent}
          editable={true}
          showToolbar={false}
          showBubbleMenu={true}
          placeholder="Start writing... Press / for commands or @ to mention"
          minHeight="calc(100vh - 200px)"
        />
      </div>
    </div>
  )
}
