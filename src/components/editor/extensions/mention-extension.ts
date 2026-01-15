import Mention from '@tiptap/extension-mention'
import { PluginKey } from '@tiptap/pm/state'

export const MentionExtension = Mention.configure({
  HTMLAttributes: {
    class: 'mention bg-primary/10 text-primary px-1 py-0.5 rounded font-medium',
  },
  suggestion: {
    pluginKey: new PluginKey('mention'),
    char: '@',
    allowSpaces: true,
  },
})
