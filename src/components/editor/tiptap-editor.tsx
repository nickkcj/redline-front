'use client'

import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useEffect, useCallback, useRef, useMemo } from 'react'
import { EditorToolbar } from './editor-toolbar'
import { EditorBubbleMenu } from './editor-bubble-menu'
import { SlashCommand } from './extensions/slash-command'
import { MentionExtension } from './extensions/mention-extension'
import { SlashMenu, getSlashCommands } from './editor-slash-menu'
import { MentionList, MentionItem } from './editor-mention-list'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

const lowlight = createLowlight(common)

export interface TiptapEditorProps {
  content?: string | JSONContent
  onChange?: (content: JSONContent) => void
  onSave?: (content: JSONContent) => void
  placeholder?: string
  editable?: boolean
  showToolbar?: boolean
  showBubbleMenu?: boolean
  minHeight?: string
  maxHeight?: string
  className?: string
  documentId?: string // Add documentId to detect document changes
}

export const TiptapEditor = ({
  content = '',
  onChange,
  onSave,
  placeholder = 'Start typing... Press / for commands',
  editable = true,
  showToolbar = true,
  showBubbleMenu = true,
  minHeight = '400px',
  maxHeight,
  className = '',
  documentId,
}: TiptapEditorProps) => {
  const isUpdatingFromPropsRef = useRef(false)
  const isUserEditingRef = useRef(false)
  const onChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentDocumentIdRef = useRef<string | undefined>(documentId)
  const contentRef = useRef<string | JSONContent | undefined>(content)
  
  // Update content ref whenever it changes
  useEffect(() => {
    contentRef.current = content
  }, [content])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        // Enable all markdown shortcuts like Obsidian
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        blockquote: true,
        bold: true,
        bulletList: true,
        code: true,
        hardBreak: true,
        horizontalRule: true,
        italic: true,
        listItem: true,
        orderedList: true,
        paragraph: true,
        strike: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:text-primary/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border bg-muted font-bold p-2 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border p-2',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-0',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
      Typography,
      CharacterCount,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg my-4 overflow-x-auto',
        },
      }),
      SlashCommand.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            const commands = getSlashCommands(editor)
            return commands
              .filter((item) =>
                item.title.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 10)
          },
          render: () => {
            let component: any
            let popup: any

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(SlashMenu, {
                  props,
                  editor: props.editor,
                })

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              onUpdate(props: any) {
                component.updateProps(props)
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },
              onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                  popup[0].hide()
                  return true
                }
                return component.ref?.onKeyDown(props)
              },
              onExit() {
                popup[0].destroy()
                component.destroy()
              },
            }
          },
        },
      }),
      MentionExtension.configure({
        suggestion: {
          items: ({ query }: { query: string }): MentionItem[] => {
            // Mock data - replace with real data from your API
            const users: MentionItem[] = [
              { id: '1', label: 'Nathan Castro', type: 'user' },
              { id: '2', label: 'John Doe', type: 'user' },
              { id: '3', label: 'Jane Smith', type: 'user' },
            ]

            const pages: MentionItem[] = [
              { id: '4', label: 'Technical Specifications', type: 'page' },
              { id: '5', label: 'Meeting Notes', type: 'page' },
              { id: '6', label: 'Roadmap 2024', type: 'page' },
            ]

            const dates: MentionItem[] = [
              { id: 'today', label: 'Today', type: 'date' },
              { id: 'tomorrow', label: 'Tomorrow', type: 'date' },
            ]

            const allItems = [...users, ...pages, ...dates]

            return allItems
              .filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
          },
          render: () => {
            let component: any
            let popup: any

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                })

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              onUpdate(props: any) {
                component.updateProps(props)
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },
              onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                  popup[0].hide()
                  return true
                }
                return component.ref?.onKeyDown(props)
              },
              onExit() {
                popup[0].destroy()
                component.destroy()
              },
            }
          },
        },
      }),
    ],
    content: undefined, // Don't set initial content here, manage via useEffect
    editable,
    onUpdate: ({ editor }) => {
      // Don't call onChange if we're updating from props
      if (isUpdatingFromPropsRef.current) return
      
      isUserEditingRef.current = true
      const json = editor.getJSON()
      
      // Debounce onChange to avoid rapid updates
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current)
      }
      
      onChangeTimeoutRef.current = setTimeout(() => {
        onChange?.(json)
        // Reset flag after onChange is called
        setTimeout(() => {
          isUserEditingRef.current = false
        }, 50)
      }, 150) // Small debounce to batch rapid changes
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none focus-visible:outline-none outline-none',
      },
    },
  })

  // Initialize content on mount
  useEffect(() => {
    if (!editor) return
    
    // Only set initial content if editor is empty
    if (editor.isEmpty && content) {
      isUpdatingFromPropsRef.current = true
      editor.commands.setContent(content, false)
      setTimeout(() => {
        isUpdatingFromPropsRef.current = false
      }, 0)
    }
  }, [editor]) // Only run once when editor is created

  // Detect document changes and update editor content
  useEffect(() => {
    if (!editor) return
    if (isUserEditingRef.current) return // Don't update if user is actively editing
    
    // If documentId changed, this is a different document - update content
    if (documentId && documentId !== currentDocumentIdRef.current) {
      currentDocumentIdRef.current = documentId
      isUpdatingFromPropsRef.current = true
      
      const currentContent = contentRef.current
      if (currentContent) {
        editor.commands.setContent(currentContent, false)
      } else {
        editor.commands.clearContent(false)
      }
      
      setTimeout(() => {
        isUpdatingFromPropsRef.current = false
      }, 0)
    }
  }, [editor, documentId]) // content is accessed via ref to prevent loop

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current)
      }
    }
  }, [])

  const handleExport = useCallback(() => {
    if (editor) {
      const json = editor.getJSON()
      onSave?.(json)
    }
  }, [editor, onSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleExport()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleExport])

  if (!editor) {
    return null
  }

  return (
    <div className={`tiptap-editor ${className}`}>
      {showToolbar && <EditorToolbar editor={editor} onExport={handleExport} />}
      {showBubbleMenu && <EditorBubbleMenu editor={editor} />}
      <div
        className="relative focus:outline-none focus-visible:outline-none"
        style={{
          minHeight,
          maxHeight,
          overflowY: maxHeight ? 'auto' : undefined,
        }}
      >
        <EditorContent editor={editor} className="px-2 py-4 focus:outline-none focus-visible:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus-visible:outline-none" />
      </div>
    </div>
  )
}
