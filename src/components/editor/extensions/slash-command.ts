import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'

export interface SlashCommandItem {
  title: string
  description: string
  icon: string
  command: (props: any) => void
  category: string
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: new PluginKey('slashCommand'),
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
        allow: ({ state, range }: any) => {
          const $from = state.doc.resolve(range.from)
          const type = state.schema.nodes.paragraph
          const allow = !!$from.parent.type.contentMatch.matchType(type)
          return allow
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
