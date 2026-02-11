"use client"

import * as React from "react"
import {
  PaperPlaneRight,
  SpinnerGap,
  Robot,
  User,
  FilePdf,
  X,
} from "@phosphor-icons/react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GovernanceService } from "@/lib/api/services/governance.service"
import { parseSSEStream } from "@/lib/utils/streaming.utils"
import type { GovernanceChatMessage } from "@/lib/api/types/governance.types"

interface ChatMessage extends GovernanceChatMessage {
  id: string
  isStreaming?: boolean
}

interface GovernanceChatTabProps {
  workspaceId: string
  artifacts: Array<{ id: string; title: string; type: string }>
}

export function GovernanceChatTab({ workspaceId, artifacts }: GovernanceChatTabProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedArtifactId, setSelectedArtifactId] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    }

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      isStreaming: true,
    }

    // Build history from previous messages (exclude current)
    const history: GovernanceChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput("")
    setIsLoading(true)

    try {
      const stream = await GovernanceService.streamGovernanceChat(
        workspaceId,
        text,
        selectedArtifactId || undefined,
        history.length > 0 ? history : undefined
      )

      let fullContent = ""

      await parseSSEStream(stream, {
        onContent: (chunk) => {
          fullContent += chunk
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: fullContent }
                : m
            )
          )
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, isStreaming: false }
                : m
            )
          )
        },
      })
    } catch (error) {
      console.error("Chat stream error:", error)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: "Erro ao conectar com o assistente. Tente novamente.",
                isStreaming: false,
              }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const selectedArtifact = artifacts.find((a) => a.id === selectedArtifactId)

  return (
    <div className="flex flex-col h-[calc(100vh-320px)] min-h-[400px]">
      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-lg border bg-muted/20">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Robot weight="fill" className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-sm font-semibold mb-1">Assistente de Governança</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Pergunte sobre seus documentos de governança, contratos, termos de abertura e políticas de compliance.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    "Quais são os prazos definidos no contrato?",
                    "Resuma o termo de abertura",
                    "Quais são os requisitos de compliance?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors text-muted-foreground"
                      onClick={() => {
                        setInput(suggestion)
                        inputRef.current?.focus()
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center mt-0.5">
                    <Robot weight="fill" className="h-4 w-4 text-red-500" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                      {msg.content ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : msg.isStreaming ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
                          Pensando...
                        </div>
                      ) : null}
                      {msg.isStreaming && msg.content && (
                        <span className="inline-block w-1.5 h-4 bg-foreground/60 animate-pulse ml-0.5 align-text-bottom" />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <User weight="fill" className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Artifact context selector */}
      {selectedArtifact && (
        <div className="flex items-center gap-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs bg-muted rounded-md px-2.5 py-1.5">
            <FilePdf weight="fill" className="h-3.5 w-3.5 text-red-500" />
            <span className="text-muted-foreground">Contexto:</span>
            <span className="font-medium truncate max-w-[200px]">{selectedArtifact.title}</span>
            <button
              onClick={() => setSelectedArtifactId(null)}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 pt-2">
        {artifacts.length > 0 && !selectedArtifact && (
          <Select
            value={selectedArtifactId || "none"}
            onValueChange={(v) => setSelectedArtifactId(v === "none" ? null : v)}
          >
            <SelectTrigger className="w-[180px] h-10 text-xs flex-shrink-0">
              <SelectValue placeholder="Contexto (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem contexto</SelectItem>
              {artifacts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre os documentos de governança..."
            className="w-full resize-none rounded-lg border bg-background px-4 py-2.5 pr-12 text-sm min-h-[42px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            rows={1}
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="absolute right-1.5 bottom-1.5 h-7 w-7"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <SpinnerGap className="h-4 w-4 animate-spin" />
            ) : (
              <PaperPlaneRight weight="fill" className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
