import { JSONContent } from '@tiptap/react'

export const convertJSONToMarkdown = (json: JSONContent): string => {
  if (!json || !json.content) return ''

  const processNode = (node: JSONContent, depth = 0): string => {
    const indent = '  '.repeat(depth)

    switch (node.type) {
      case 'doc':
        return node.content?.map((child) => processNode(child, depth)).join('\n\n') || ''

      case 'paragraph':
        return node.content?.map((child) => processNode(child, depth)).join('') || ''

      case 'heading':
        const level = node.attrs?.level || 1
        const headingPrefix = '#'.repeat(level)
        const headingText = node.content?.map((child) => processNode(child, depth)).join('') || ''
        return `${headingPrefix} ${headingText}`

      case 'text':
        let text = node.text || ''
        if (node.marks) {
          node.marks.forEach((mark) => {
            switch (mark.type) {
              case 'bold':
                text = `**${text}**`
                break
              case 'italic':
                text = `*${text}*`
                break
              case 'code':
                text = `\`${text}\``
                break
              case 'strike':
                text = `~~${text}~~`
                break
              case 'underline':
                text = `<u>${text}</u>`
                break
              case 'link':
                text = `[${text}](${mark.attrs?.href})`
                break
              case 'highlight':
                text = `==${text}==`
                break
            }
          })
        }
        return text

      case 'bulletList':
        return node.content?.map((child) => processNode(child, depth)).join('\n') || ''

      case 'orderedList':
        return node.content?.map((child, index) => {
          const itemContent = processNode(child, depth)
          return `${index + 1}. ${itemContent.replace(/^- /, '')}`
        }).join('\n') || ''

      case 'listItem':
        const listContent = node.content?.map((child) => processNode(child, depth + 1)).join('\n') || ''
        return `- ${listContent}`

      case 'taskList':
        return node.content?.map((child) => processNode(child, depth)).join('\n') || ''

      case 'taskItem':
        const checked = node.attrs?.checked ? '[x]' : '[ ]'
        const taskContent = node.content?.map((child) => processNode(child, depth)).join('') || ''
        return `- ${checked} ${taskContent}`

      case 'blockquote':
        const quoteContent = node.content?.map((child) => processNode(child, depth)).join('\n') || ''
        return quoteContent.split('\n').map((line) => `> ${line}`).join('\n')

      case 'codeBlock':
        const language = node.attrs?.language || ''
        const codeContent = node.content?.map((child) => processNode(child, depth)).join('') || ''
        return `\`\`\`${language}\n${codeContent}\n\`\`\``

      case 'horizontalRule':
        return '---'

      case 'hardBreak':
        return '  \n'

      case 'image':
        const src = node.attrs?.src || ''
        const alt = node.attrs?.alt || ''
        return `![${alt}](${src})`

      case 'table':
        const rows = node.content || []
        return rows.map((row, rowIndex) => {
          const cells = row.content || []
          const cellContent = cells.map((cell) => {
            return cell.content?.map((child) => processNode(child, depth)).join('') || ''
          }).join(' | ')
          
          let result = `| ${cellContent} |`
          
          // Add header separator after first row
          if (rowIndex === 0) {
            const separator = cells.map(() => '---').join(' | ')
            result += `\n| ${separator} |`
          }
          
          return result
        }).join('\n')

      case 'tableRow':
      case 'tableCell':
      case 'tableHeader':
        return node.content?.map((child) => processNode(child, depth)).join('') || ''

      default:
        return node.content?.map((child) => processNode(child, depth)).join('') || ''
    }
  }

  return processNode(json)
}

export const convertMarkdownToJSON = (markdown: string): JSONContent => {
  // Simple markdown to JSON conversion
  // For full support, consider using a proper markdown parser like remark
  const lines = markdown.split('\n')
  const content: JSONContent[] = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Headings
    if (line.startsWith('# ')) {
      content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: line.slice(2) }],
      })
    } else if (line.startsWith('## ')) {
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: line.slice(3) }],
      })
    } else if (line.startsWith('### ')) {
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: line.slice(4) }],
      })
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: JSONContent[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: lines[i].slice(2) }],
            },
          ],
        })
        i++
      }
      content.push({
        type: 'bulletList',
        content: listItems,
      })
      i--
    }
    // Paragraph
    else if (line.trim()) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: line }],
      })
    }

    i++
  }

  return {
    type: 'doc',
    content,
  }
}

export const exportAsMarkdownFile = (content: JSONContent, filename: string) => {
  const markdown = convertJSONToMarkdown(content)
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.md`
  link.click()
  URL.revokeObjectURL(url)
}

export const exportAsJSONFile = (content: JSONContent, filename: string) => {
  const json = JSON.stringify(content, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  link.click()
  URL.revokeObjectURL(url)
}
