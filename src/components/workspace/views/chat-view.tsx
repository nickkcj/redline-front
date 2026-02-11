'use client'

import * as React from 'react'
import { PaperPlaneTilt, Robot, User, Sparkle, Paperclip, CaretDown, CaretRight, SlackLogo, GithubLogo, FigmaLogo, EnvelopeSimple, Globe, ThumbsUp, ThumbsDown, Copy, PlusCircle, StopCircle, At, ArrowUp, CircleNotch, MagnifyingGlass, GridFour, Cpu, Microphone, Waveform, Baby, Heart, Airplane, Wrench, Translate, Question, ShoppingBag, Graph, MapPin, Star, ArrowRight, ShieldCheck } from '@phosphor-icons/react'
import { useStatusBar } from '@/hooks/use-status-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrentWorkspace } from '@/lib/stores/app.store'
import {
  useChatMessages,
  useStreamChat,
  useSendMessage,
  useCreateChat
} from '@/hooks/api/use-chat'
import { MessageRole } from '@/lib/api/types/chat.types'
import type { ChatMessageResponseDto } from '@/lib/api/types/chat.types'
import { GovernanceService } from '@/lib/api/services/governance.service'
import { parseSSEStream } from '@/lib/utils/streaming.utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  thought?: string
}

export function ChatView({ tabId, tabData }: { tabId: string; tabData?: any }) {
  const queryClient = useQueryClient()
  const { setLoading, setSuccess, setError } = useStatusBar()

  // Get workspace context
  const currentWorkspace = useCurrentWorkspace()
  const workspaceId = currentWorkspace?.id || ''

  // Chat ID management
  const initialChatId = tabData?.chatId && tabData.chatId !== 'new' ? tabData.chatId : null
  const [chatId, setChatId] = React.useState<string | null>(initialChatId)

  // Local state
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputValue, setInputValue] = React.useState('')
  const [thinkingText, setThinkingText] = React.useState('Pensando...')
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [governanceMode, setGovernanceMode] = React.useState(false)
  const [isGovernanceStreaming, setIsGovernanceStreaming] = React.useState(false)
  const [governanceStreamContent, setGovernanceStreamContent] = React.useState('')
  const isSubmittingRef = React.useRef(false)

  // API Hooks
  const { data: messagesData, isLoading: isLoadingMessages } = useChatMessages(
    workspaceId,
    chatId || '',
    { enabled: !!workspaceId && !!chatId }
  )

  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat(workspaceId)
  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage(workspaceId, chatId || '')

  const { isStreaming, streamingContent, startStream, clearStreamingContent } = useStreamChat({
    onStreamEnd: () => {
      // Refetch messages to get the complete AI response
      if (chatId && workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', workspaceId, chatId] })
        queryClient.invalidateQueries({ queryKey: ['chat', workspaceId, chatId] })
        queryClient.invalidateQueries({ queryKey: ['chats', workspaceId] })
      }
      clearStreamingContent()
      setSuccess('Resposta recebida')
    },
    onError: (error) => {
      console.error('Stream error:', error)
      setError('Erro ao processar resposta')
    }
  })

  // Map API messages to local Message interface
  React.useEffect(() => {
    if (messagesData?.messages) {
      const mappedMessages: Message[] = messagesData.messages.map((msg: ChatMessageResponseDto) => ({
        id: msg.id,
        role: msg.role === MessageRole.USER ? 'user' : 'assistant',
        content: msg.content,
        thought: msg.aiModel ? `Modelo: ${msg.aiModel}` : undefined
      }))
      setMessages(mappedMessages)
    }
  }, [messagesData])

  // Reset when tab changes
  React.useEffect(() => {
    const newChatId = tabData?.chatId && tabData.chatId !== 'new' ? tabData.chatId : null
    setChatId(newChatId)

    if (!newChatId) {
      setMessages([])
    }
  }, [tabId, tabData])

  // Governance stream function - receives history explicitly to avoid closure issues
  const startGovernanceStream = React.useCallback(async (
    userMessage: string,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ) => {
    setIsGovernanceStreaming(true)
    setGovernanceStreamContent('')
    setLoading('Consultando documentos de governança...')

    try {
      const stream = await GovernanceService.streamGovernanceChat(
        workspaceId,
        userMessage,
        undefined,
        chatHistory.length > 0 ? chatHistory : undefined
      )

      let fullContent = ''
      await parseSSEStream(stream, {
        onContent: (chunk) => {
          fullContent += chunk
          setGovernanceStreamContent(fullContent)
        },
        onDone: () => {
          setMessages((prev) => [
            ...prev,
            { id: `gov-${Date.now()}`, role: 'assistant', content: fullContent },
          ])
          setGovernanceStreamContent('')
          setIsGovernanceStreaming(false)
          isSubmittingRef.current = false
          setSuccess('Resposta recebida')
        },
      })
    } catch (error) {
      console.error('Governance stream error:', error)
      setMessages((prev) => [
        ...prev,
        { id: `gov-err-${Date.now()}`, role: 'assistant', content: 'Erro ao conectar com o assistente de governança. Tente novamente.' },
      ])
      setGovernanceStreamContent('')
      setIsGovernanceStreaming(false)
      isSubmittingRef.current = false
      setError('Erro ao processar resposta')
    }
  }, [workspaceId, setLoading, setSuccess, setError])

  // Thinking animation
  React.useEffect(() => {
    if (!isStreaming && !isGovernanceStreaming && !isCreatingChat && !isSendingMessage) return

    const thinkingTexts = governanceMode
      ? ['Buscando nos documentos...', 'Analisando governança...', 'Gerando resposta...']
      : ['Pensando...', 'Organizando...', 'Criando...']
    let textIndex = 0

    const interval = setInterval(() => {
      textIndex = (textIndex + 1) % thinkingTexts.length
      setThinkingText(thinkingTexts[textIndex])
    }, 5000)

    return () => clearInterval(interval)
  }, [isStreaming, isGovernanceStreaming, isCreatingChat, isSendingMessage, governanceMode])

  // Clear suggestions when input changes
  React.useEffect(() => {
    setSuggestions([])
  }, [inputValue])

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming || isGovernanceStreaming || isSubmittingRef.current || !workspaceId) return

    const userMessage = inputValue.trim()

    // Governance mode: skip regular chat flow, use governance RAG endpoint
    if (governanceMode) {
      // Set ref immediately to prevent double-submit (React state is async)
      isSubmittingRef.current = true

      // Capture history BEFORE adding optimistic message to avoid sending it as history
      const chatHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      setMessages(prev => [...prev, { id: `temp-${Date.now()}`, role: 'user', content: userMessage }])
      setInputValue('')
      setSuggestions([])

      await startGovernanceStream(userMessage, chatHistory)
      return
    }

    // Add user message optimistically
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage
    }
    setMessages(prev => [...prev, optimisticMessage])
    setInputValue('')
    setSuggestions([])

    setLoading('Processando mensagem...')

    try {
      if (!chatId) {
        // Create new chat with initial message
        createChat(
          { initialMessage: userMessage },
          {
            onSuccess: async (newChat) => {
              const newChatId = newChat.id
              setChatId(newChatId)

              // Start streaming the AI response
              await startStream(workspaceId, newChatId, userMessage)
            },
            onError: (error) => {
              console.error('Error creating chat:', error)
              setError('Erro ao criar chat')
              // Remove optimistic message
              setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
            }
          }
        )
      } else {
        // Send message to existing chat
        sendMessage(
          { content: userMessage, role: MessageRole.USER },
          {
            onSuccess: async () => {
              // Start streaming the AI response
              await startStream(workspaceId, chatId, userMessage)
            },
            onError: (error) => {
              console.error('Error sending message:', error)
              setError('Erro ao enviar mensagem')
              // Remove optimistic message
              setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
            }
          }
        )
      }
    } catch (error) {
      console.error('Error in handleSend:', error)
      setError('Erro ao processar mensagem')
      // Remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
    }
  }

  // Compute whether we're in a "thinking" state
  const isThinking = isStreaming || isGovernanceStreaming || isCreatingChat || isSendingMessage

  // Display messages with streaming content
  const displayMessages = React.useMemo(() => {
    const msgs = [...messages]

    // Add streaming content as a temporary assistant message
    const activeStreamContent = isGovernanceStreaming ? governanceStreamContent : streamingContent
    const activeIsStreaming = isStreaming || isGovernanceStreaming

    if (activeIsStreaming && activeStreamContent) {
      msgs.push({
        id: 'streaming',
        role: 'assistant',
        content: activeStreamContent
      })
    }

    return msgs
  }, [messages, isStreaming, isGovernanceStreaming, streamingContent, governanceStreamContent])

  // Empty state (no messages yet)
  if (displayMessages.length === 0 && !isLoadingMessages) {
    return (
      <div className="flex flex-col h-full items-center relative overflow-hidden bg-background">
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-4xl font-semibold text-foreground">Como posso te ajudar hoje?</h1>
        </div>
        <div className="w-full max-w-2xl space-y-0 pb-12 px-4">
           <div className={cn(
             "relative rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md flex flex-col",
             suggestions.length > 0 ? "rounded-b-none border-b-0" : ""
           )}>
             <div className="p-3">
               <Textarea
                 className="w-full border-0 shadow-none  bg-transparent px-2 text-sm placeholder:text-muted-foreground/50 h-auto min-h-[50px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                 placeholder="Pergunte qualquer coisa..."
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault()
                     handleSend()
                   }
                 }}
                 autoFocus
               />

               <div className="flex items-center justify-between px-2 pt-2">
                 <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground rounded-full bg-muted/50 hover:bg-muted text-xs font-medium">
                     <MagnifyingGlass weight="bold" className="h-3.5 w-3.5" />
                     Foco
                   </Button>
                   <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted text-xs font-medium">
                     <Paperclip weight="bold" className="h-3.5 w-3.5" />
                     Anexar
                   </Button>
                   <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted text-xs font-medium">
                     <Microphone weight="bold" className="h-3.5 w-3.5" />
                     Voz
                   </Button>
                   <Button
                     variant="ghost"
                     size="sm"
                     className={cn(
                       "h-7 gap-1.5 rounded-full text-xs font-medium transition-colors",
                       governanceMode
                         ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
                         : "text-muted-foreground hover:text-foreground hover:bg-muted"
                     )}
                     onClick={() => setGovernanceMode(!governanceMode)}
                   >
                     <ShieldCheck weight={governanceMode ? "fill" : "bold"} className="h-3.5 w-3.5" />
                     Governança
                   </Button>
                 </div>

                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground font-medium">Pro</span>
                      <div className="h-4 w-7 bg-muted rounded-full relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 h-3 w-3 bg-background rounded-full shadow-sm"></div>
                      </div>
                   </div>
                   <Button
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-full transition-all duration-200",
                        inputValue.trim()
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                      onClick={inputValue.trim() ? handleSend : undefined}
                      disabled={!inputValue.trim() || isThinking}
                   >
                      <ArrowRight weight="bold" className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
             </div>
           </div>

           {/* Suggestions Dropdown */}
           {suggestions.length > 0 && (
             <div className="border border-t-0 border-border bg-card rounded-b-xl shadow-sm overflow-hidden">
               {suggestions.map((suggestion, i) => (
                 <button
                   key={i}
                   className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-3 transition-colors border-t border-border/50 first:border-t-0"
                   onClick={() => {
                     setInputValue(suggestion.trim())
                   }}
                 >
                   <MagnifyingGlass weight="bold" className="h-4 w-4 opacity-50" />
                   {suggestion}
                 </button>
               ))}
             </div>
           )}

           {/* Action Buttons (Only when no suggestions/empty input) */}
           {suggestions.length === 0 && (
             <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
               {[
                   { icon: ShoppingBag, text: "Shopping" },
                   { icon: Graph, text: "Analyze" },
                   { icon: MapPin, text: "Local" },
                   { icon: Star, text: "Recommend" },
                   { icon: Heart, text: "Health" }
               ].map((item, i) => (
                 <Button key={i} variant="outline" className="h-8 px-3 gap-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent border-muted-foreground/20 hover:bg-muted/50 rounded-full">
                   <item.icon weight="fill" className="h-3.5 w-3.5" />
                   <span>{item.text}</span>
                 </Button>
               ))}
             </div>
           )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Date Header for the reference look */}
      <div className="flex justify-center py-4">
         <span className="text-xs text-muted-foreground font-medium">Wednesday, Jan 14 • Redline AI</span>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-8 pb-4">
          {displayMessages.map((msg, index) => (
            <div key={msg.id} className={`flex gap-4 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role !== 'user' && (
                <div className="flex-shrink-0 h-8 w-6 overflow-hidden">
                  <img src="/logo-removebg-preview.png" alt="RedLine" className="h-full w-auto max-w-none dark:brightness-100 brightness-0" />
                </div>
              )}
              <div className={`flex-1 space-y-2 min-w-0 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>

                {/* Thought Process (Collapsible) */}
                {msg.thought && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-0 text-muted-foreground gap-1 hover:no-underline mb-1">
                        <CaretRight weight="bold" className="h-3 w-3" />
                        <span className="text-xs italic">Thought</span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                       <div className="ml-1 pl-3 border-l-2 border-muted text-xs text-muted-foreground italic py-1 mb-2">
                         {msg.thought}
                       </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Message Content */}
                <div className={`text-sm leading-7 whitespace-pre-wrap ${msg.role === 'user' ? 'bg-muted/50 px-4 py-2 rounded-2xl rounded-tr-sm text-right max-w-[80%]' : 'text-foreground/90'}`}>
                  {msg.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part
                  )}
                </div>

                {/* Action Buttons (Copy, Thumbs) - Only for assistant */}
                {msg.role === 'assistant' && (
                    <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                            <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                            <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                            <ThumbsDown className="h-3 w-3" />
                        </Button>
                    </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking Animation */}
          {isThinking && !streamingContent && !governanceStreamContent && (
            <div className="flex gap-4 group">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-muted-foreground"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 14C4.7 14 2 11.3 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z"
                      fill="currentColor"
                      fillOpacity="0.4"
                    />
                    <path
                      d="M8 2C9.5 2 10.8 2.5 11.8 3.3L13.2 1.9C11.8 0.7 10 0 8 0V2Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-sm italic text-muted-foreground font-normal">{thinkingText}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 pb-6">
        <div className="relative bg-card rounded-xl border border-border shadow-sm flex flex-col">
           <div className="p-3">
             <Textarea
               className="w-full border-0 shadow-none bg-transparent px-2 text-sm placeholder:text-sm placeholder:text-muted-foreground/50 h-auto min-h-[50px] max-h-[200px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
               placeholder="Pergunte qualquer coisa..."
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault()
                   handleSend()
                 }
               }}
               disabled={isThinking}
             />

             <div className="flex items-center justify-between px-2 pt-2">
               <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted text-xs font-medium">
                   <MagnifyingGlass weight="bold" className="h-3.5 w-3.5" />
                   Foco
                 </Button>
                 <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted text-xs font-medium">
                   <Paperclip weight="bold" className="h-3.5 w-3.5" />
                   Anexar
                 </Button>
                 <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted text-xs font-medium">
                   <Microphone weight="bold" className="h-3.5 w-3.5" />
                   Voz
                 </Button>
               </div>

               <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-medium">Pro</span>
                    <div className="h-4 w-7 bg-muted rounded-full relative cursor-pointer">
                      <div className="absolute left-0.5 top-0.5 h-3 w-3 bg-background rounded-full shadow-sm"></div>
                    </div>
                 </div>
                 <Button
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full transition-all duration-200",
                      inputValue.trim() && !isThinking
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    onClick={inputValue.trim() ? handleSend : undefined}
                    disabled={!inputValue.trim() || isThinking}
                 >
                    <ArrowRight weight="bold" className="h-4 w-4" />
                 </Button>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
