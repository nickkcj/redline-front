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
import { useEffect, useCallback } from 'react'
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
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
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
    content,
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange?.(json)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && content && editor.isEmpty) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

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
    <div className={`tiptap-editor border rounded-lg bg-background ${className}`}>
      {showToolbar && <EditorToolbar editor={editor} onExport={handleExport} />}
      {showBubbleMenu && <EditorBubbleMenu editor={editor} />}
      <div
        className="relative"
        style={{
          minHeight,
          maxHeight,
          overflowY: maxHeight ? 'auto' : undefined,
        }}
      >
        <EditorContent editor={editor} className="p-6" />
      </div>
      
      {/* Character count */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
        <span>
          {editor.storage.characterCount.characters()} characters · {editor.storage.characterCount.words()} words
        </span>
        <span className="text-xs">
          Press <kbd className="px-1.5 py-0.5 text-xs border rounded">Cmd+S</kbd> to save
        </span>
      </div>
    </div>
  )
}
