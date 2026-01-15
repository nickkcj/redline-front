'use client'

import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { useEditorStore } from '@/store/editor-store'
import { useEffect, useState, useRef } from 'react'
import { JSONContent } from '@tiptap/react'

// Mock data for pre-created documents
function getMockDocumentData(docId: string | undefined): { title: string; content?: JSONContent } {
  switch (docId) {
    case 'doc-1':
      return {
        title: 'Especificações Técnicas',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Especificações Técnicas do Projeto' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Este documento contém as especificações técnicas completas do projeto, incluindo arquitetura, tecnologias e padrões de desenvolvimento.' }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '🏗️ Arquitetura' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: 'Frontend: ' },
                        { type: 'text', text: 'Next.js 14 com App Router e TypeScript' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: 'Estilização: ' },
                        { type: 'text', text: 'TailwindCSS com shadcn/ui' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: 'Estado: ' },
                        { type: 'text', text: 'Zustand para gerenciamento global' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: 'Editor: ' },
                        { type: 'text', text: 'Tiptap para edição rich text' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '📋 Requisitos Técnicos' }]
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Node.js 18+ instalado' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'NPM ou Yarn para gerenciamento de pacotes' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Git para controle de versão' }]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '🔒 Segurança' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Todas as rotas da API são protegidas por autenticação JWT. Implementamos CORS e rate limiting para prevenir ataques.' }
              ]
            }
          ]
        }
      }
    case 'doc-2':
      return {
        title: 'Guia de Onboarding',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '👋 Bem-vindo ao Time!' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Estamos muito felizes em ter você conosco! Este guia vai te ajudar nos primeiros passos.' }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '📅 Primeira Semana' }]
            },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: true },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Configurar ambiente de desenvolvimento' }]
                    }
                  ]
                },
                {
                  type: 'taskItem',
                  attrs: { checked: true },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Acessos aos sistemas (GitHub, Slack, email)' }]
                    }
                  ]
                },
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Ler documentação técnica do projeto' }]
                    }
                  ]
                },
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Conhecer o time em reunião de apresentação' }]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '🎯 Objetivos do Primeiro Mês' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Entender a arquitetura completa do sistema' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Fazer seu primeiro deploy em produção' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Participar ativamente das dailies e plannings' }]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '📚 Recursos Úteis' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: 'Wiki: ' },
                        { type: 'text', text: 'Documentação interna no Notion' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: 'Slack: ' },
                        { type: 'text', text: 'Canal #dev para dúvidas técnicas' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: 'Mentor: ' },
                        { type: 'text', text: 'Você terá um dev senior como mentor' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    case 'doc-3':
      return {
        title: 'Roadmap 2024',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '🗺️ Roadmap 2024' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Planejamento estratégico das principais entregas e marcos do ano.' }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Q1 - Janeiro a Março' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '✅ Workspace colaborativo' },
                        { type: 'text', text: ' - Sistema de tabs e layouts flexíveis' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '✅ Editor de documentos' },
                        { type: 'text', text: ' - Integração com Tiptap e markdown' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '🔄 Chat AI integrado' },
                        { type: 'text', text: ' - Interface conversacional com histórico' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Q2 - Abril a Junho' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '📱 App Mobile' },
                        { type: 'text', text: ' - Versão React Native' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '🔔 Notificações' },
                        { type: 'text', text: ' - Push e email' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '👥 Colaboração em tempo real' },
                        { type: 'text', text: ' - Edição simultânea de documentos' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Q3 - Julho a Setembro' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '🤖 Automações' },
                        { type: 'text', text: ' - Workflows personalizáveis' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '📊 Analytics avançado' },
                        { type: 'text', text: ' - Dashboard de métricas' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '🔗 Integrações' },
                        { type: 'text', text: ' - Slack, Teams, Jira' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Q4 - Outubro a Dezembro' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '🌐 Internacionalização' },
                        { type: 'text', text: ' - Suporte a múltiplos idiomas' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '🎨 Temas customizáveis' },
                        { type: 'text', text: ' - White label' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', marks: [{ type: 'bold' }], text: '🚀 Performance' },
                        { type: 'text', text: ' - Otimizações e melhorias gerais' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    case 'doc-4':
      return {
        title: 'Meeting Notes',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '📝 Meeting Notes' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Data: ' },
                { type: 'text', text: '15 de Janeiro, 2026' }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Participantes: ' },
                { type: 'text', text: 'João, Maria, Pedro, Ana' }
              ]
            },
            {
              type: 'horizontalRule'
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '🎯 Pauta' }]
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Review da sprint anterior' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Planejamento da próxima sprint' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Bloqueadores e impedimentos' }]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Próximos passos' }]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '✅ Decisões' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Aprovada a implementação do editor Tiptap' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Priorizar features de colaboração para Q2' }
                      ]
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Maria vai liderar o projeto de mobile app' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '🚧 Action Items' }]
            },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: true },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'João - Finalizar integração do editor' },
                        { type: 'text', marks: [{ type: 'italic' }], text: ' (Due: 20/Jan)' }
                      ]
                    }
                  ]
                },
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Maria - Pesquisar frameworks React Native' },
                        { type: 'text', marks: [{ type: 'italic' }], text: ' (Due: 25/Jan)' }
                      ]
                    }
                  ]
                },
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Pedro - Documentar API endpoints' },
                        { type: 'text', marks: [{ type: 'italic' }], text: ' (Due: 22/Jan)' }
                      ]
                    }
                  ]
                },
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Ana - Review de código das PRs pendentes' },
                        { type: 'text', marks: [{ type: 'italic' }], text: ' (Due: 18/Jan)' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '📌 Observações' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Próxima reunião agendada para ' },
                { type: 'text', marks: [{ type: 'bold' }], text: '22 de Janeiro às 14h' },
                { type: 'text', text: '.' }
              ]
            }
          ]
        }
      }
    default:
      // New documents start empty
      return { title: 'Untitled' }
  }
}

export function DocumentView({ tabId, tabData }: { tabId: string; tabData?: any }) {
  const { currentDocument, setCurrentDocument, updateDocumentContent, createDocument, updateDocumentTitle } = useEditorStore()
  const [title, setTitle] = useState('')
  const titleInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Load or create a document for this tab - only when tabId changes
    if (!currentDocument || currentDocument.id !== tabId) {
      // Try to load from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`document-${tabId}`)
        if (stored) {
          const doc = JSON.parse(stored)
          setCurrentDocument(doc)
          setTitle(doc.title || '')
        } else {
          // Get mock content for pre-created documents
          const mockData = getMockDocumentData(tabData?.id)
          
          // Create a new document
          createDocument(mockData.title).then((doc) => {
            // Apply mock content if available
            if (mockData.content) {
              doc.content = mockData.content
              
              // Save to localStorage with mock content
              if (typeof window !== 'undefined') {
                localStorage.setItem(`document-${tabId}`, JSON.stringify(doc))
              }
            }
            setCurrentDocument(doc)
            setTitle(mockData.title)
            
            // Auto-focus on title only for truly new documents (not pre-created ones)
            if (!mockData.content) {
              setTimeout(() => {
                titleInputRef.current?.focus()
                titleInputRef.current?.select()
              }, 100)
            }
          })
        }
      }
    } else if (currentDocument) {
      setTitle(currentDocument.title || '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, tabData]) // Intentionally excluding currentDocument, setCurrentDocument, createDocument to prevent infinite loops

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (updateDocumentTitle) {
      updateDocumentTitle(newTitle)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Focus on editor when pressing Enter
      const editorElement = document.querySelector('.ProseMirror') as HTMLElement
      editorElement?.focus()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = 'auto'
      titleInputRef.current.style.height = titleInputRef.current.scrollHeight + 'px'
    }
  }, [title])

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-muted-foreground">Loading document...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-8 min-h-full">
      <div className="space-y-1">
        {/* Title Input - Notion Style */}
        <textarea
          ref={titleInputRef}
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full text-5xl font-bold resize-none outline-none border-none bg-transparent focus:outline-none focus:ring-0 placeholder:text-muted-foreground/30 overflow-hidden"
          rows={1}
          style={{ minHeight: '1.2em' }}
        />

        {/* Tiptap Editor */}
        <TiptapEditor
          documentId={currentDocument.id}
          content={currentDocument.content}
          onChange={updateDocumentContent}
          editable={true}
          showToolbar={false}
          showBubbleMenu={true}
          placeholder="Press Enter to continue with the main text..."
          minHeight="500px"
          className="-mx-2"
        />
      </div>
    </div>
  )
}
