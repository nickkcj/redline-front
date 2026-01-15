import { Editor } from '@tiptap/react'

export const getMarkdownFromContent = (editor: Editor): string => {
  // TODO: Implement markdown export
  return editor.getText()
}

export const getJSONFromMarkdown = (markdown: string) => {
  // TODO: Implement markdown import
  return { type: 'doc', content: [] }
}

export const isTextSelected = (editor: Editor): boolean => {
  const { from, to } = editor.state.selection
  return from !== to
}

export const getActiveNode = (editor: Editor) => {
  return editor.state.selection.$from.node()
}

export const insertContentAtCursor = (editor: Editor, content: string) => {
  editor.chain().focus().insertContent(content).run()
}
