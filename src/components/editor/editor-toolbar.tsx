'use client'

import { Editor } from '@tiptap/react'
import {
  TextB,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  ListBullets,
  ListNumbers,
  CheckSquare,
  Quotes,
  ArrowCounterClockwise,
  ArrowClockwise,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  TextHOne,
  TextHTwo,
  TextHThree,
  TextT,
  Table,
  Highlighter,
  Download,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface EditorToolbarProps {
  editor: Editor
  onExport?: () => void
}

export const EditorToolbar = ({ editor, onExport }: EditorToolbarProps) => {
  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const colors = [
    { name: 'Default', value: null },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ]

  const highlights = [
    { name: 'None', value: null },
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Purple', value: '#e9d5ff' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Red', value: '#fecaca' },
  ]

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-1 p-2">
        {/* Text Style Dropdown */}
        <Select
          value={
            editor.isActive('heading', { level: 1 })
              ? 'h1'
              : editor.isActive('heading', { level: 2 })
              ? 'h2'
              : editor.isActive('heading', { level: 3 })
              ? 'h3'
              : 'paragraph'
          }
          onValueChange={(value) => {
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run()
            } else if (value === 'h1') {
              editor.chain().focus().setHeading({ level: 1 }).run()
            } else if (value === 'h2') {
              editor.chain().focus().setHeading({ level: 2 }).run()
            } else if (value === 'h3') {
              editor.chain().focus().setHeading({ level: 3 }).run()
            }
          }}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">
              <div className="flex items-center gap-2">
                <TextT weight="bold" className="h-4 w-4" />
                Normal
              </div>
            </SelectItem>
            <SelectItem value="h1">
              <div className="flex items-center gap-2">
                <TextHOne weight="bold" className="h-4 w-4" />
                Heading 1
              </div>
            </SelectItem>
            <SelectItem value="h2">
              <div className="flex items-center gap-2">
                <TextHTwo weight="bold" className="h-4 w-4" />
                Heading 2
              </div>
            </SelectItem>
            <SelectItem value="h3">
              <div className="flex items-center gap-2">
                <TextHThree weight="bold" className="h-4 w-4" />
                Heading 3
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Formatting */}
        <Button
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <TextB weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <TextItalic weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <TextUnderline weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <TextStrikethrough weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('code') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <div className="flex flex-col items-center">
                <TextT weight="bold" className="h-4 w-4" />
                <div
                  className="h-0.5 w-4 mt-0.5"
                  style={{
                    backgroundColor: editor.getAttributes('textStyle').color || '#000',
                  }}
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    if (color.value) {
                      editor.chain().focus().setColor(color.value).run()
                    } else {
                      editor.chain().focus().unsetColor().run()
                    }
                  }}
                  className="h-6 w-6 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value || '#000' }}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-3 gap-1">
              {highlights.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    if (color.value) {
                      editor.chain().focus().setHighlight({ color: color.value }).run()
                    } else {
                      editor.chain().focus().unsetHighlight().run()
                    }
                  }}
                  className="h-6 w-6 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value || '#fff' }}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* ListBullets weight="bold"s */}
        <Button
          variant={editor.isActive('bulletListBullets weight="bold"') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListBullets weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedListBullets weight="bold"') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListBullets weight="bold"Ordered className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('taskListBullets weight="bold"') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <CheckSquare className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <Button
          variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <TextAlignLeft weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <TextAlignCenter weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <TextAlignRight weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <TextAlignJustify weight="bold" className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quotes weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <Table className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* ArrowCounterClockwise weight="bold"/ArrowClockwise weight="bold" */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <ArrowClockwise weight="bold" className="h-4 w-4" />
        </Button>

        {onExport && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
