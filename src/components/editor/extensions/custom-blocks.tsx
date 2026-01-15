import { Node, mergeAttributes } from '@tiptap/core'

// Simple implementation without React Node Views for now
// Can be extended later with full React components

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-type'),
        renderHTML: (attributes) => {
          return {
            'data-type': attributes.type,
          }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-type'] || 'info'
    
    const colorClasses: Record<string, string> = {
      info: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20',
      warning: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
      success: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20',
      error: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20',
    }
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-callout': '',
        class: `callout-block rounded-lg p-4 my-4 ${colorClasses[type]}`,
      }),
      0,
    ]
  },
})

export const Toggle = Node.create({
  name: 'toggle',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-open') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-open': String(attributes.open),
          }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'details[data-toggle]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'details',
      mergeAttributes(HTMLAttributes, {
        'data-toggle': '',
        class: 'toggle-block my-2 border rounded-lg p-3',
      }),
      ['summary', { class: 'cursor-pointer font-medium' }, 'Toggle'],
      ['div', { class: 'mt-2' }, 0],
    ]
  },
})
