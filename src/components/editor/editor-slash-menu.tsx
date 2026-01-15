'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  Image as ImageIcon,
  Code,
  Table,
  Quote,
  Info,
  Minus,
  FileText,
} from 'lucide-react'

export interface SlashCommandItem {
  title: string
  description: string
  icon: any
  command: (props: any) => void
  category: string
}

interface SlashMenuProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}

export const SlashMenu = forwardRef((props: SlashMenuProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  // Group items by category
  const groupedItems = props.items.reduce((acc, item, index) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push({ ...item, originalIndex: index })
    return acc
  }, {} as Record<string, (SlashCommandItem & { originalIndex: number })[]>)

  let currentIndex = 0

  return (
    <div className="z-50 min-w-[280px] max-h-[400px] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="p-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            {category}
          </div>
          {items.map((item) => {
            const index = currentIndex++
            const Icon = item.icon
            return (
              <button
                key={item.title}
                onClick={() => selectItem(item.originalIndex)}
                className={`flex w-full items-start gap-3 rounded-sm px-2 py-2 text-sm outline-none transition-colors ${
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
})

SlashMenu.displayName = 'SlashMenu'

// Default slash command items
export const getSlashCommands = (editor: any): SlashCommandItem[] => [
  {
    title: 'Text',
    description: 'Plain text paragraph',
    icon: FileText,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
    category: 'Basic Blocks',
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
    category: 'Basic Blocks',
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
    category: 'Basic Blocks',
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    },
    category: 'Basic Blocks',
  },
  {
    title: 'Bulleted List',
    description: 'Create a simple list',
    icon: List,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
    category: 'Lists',
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: ListOrdered,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
    category: 'Lists',
  },
  {
    title: 'To-do List',
    description: 'Track tasks with checkboxes',
    icon: CheckSquare,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
    category: 'Lists',
  },
  {
    title: 'Quote',
    description: 'Capture a quote',
    icon: Quote,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
    category: 'Advanced',
  },
  {
    title: 'Code Block',
    description: 'Capture a code snippet',
    icon: Code,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
    category: 'Advanced',
  },
  {
    title: 'Table',
    description: 'Add a table',
    icon: Table,
    command: ({ editor, range }: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
    category: 'Advanced',
  },
  {
    title: 'Divider',
    description: 'Visually divide blocks',
    icon: Minus,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
    category: 'Advanced',
  },
]
