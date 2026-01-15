'use client'

import * as React from 'react'
import { Send, Bot, User, Sparkles, Paperclip, ChevronDown, ChevronRight, Slack, Github, Trello, Figma, Mail, Globe, ThumbsUp, ThumbsDown, Copy, PlusCircle, Globe as GlobeIcon, StopCircle, AtSign, ArrowUp, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  thought?: string
}

// Conversation Dictionary
const conversations: Record<string, Message[]> = {
  // Chat 1: Análise de requisitos
  'chat-1': [
    { id: '1', role: 'user', content: 'Quais são os requisitos funcionais para o novo módulo de login?' },
    { id: '2', role: 'assistant', content: 'Com base nas reuniões anteriores e na documentação do projeto, os principais requisitos funcionais para o módulo de login são:\n\n1.  **Login Social:** O sistema deve permitir autenticação via Google e GitHub.\n2.  **Autenticação de Dois Fatores (2FA):** Obrigatória para administradores, opcional para usuários comuns.\n3.  **Recuperação de Senha:** Deve ser implementado um fluxo de "Esqueci minha senha" utilizando Magic Links enviados por e-mail.\n4.  **Validação de E-mail:** Novos cadastros devem exigir confirmação de e-mail antes do primeiro acesso.\n5.  **Limitação de Tentativas:** Bloqueio temporário da conta após 5 tentativas falhas consecutivas para prevenir força bruta.', thought: 'Consultando a documentação de requisitos v1.2...' }
  ],
  // Chat 2: Discussão arquitetura
  'chat-2': [
    { id: '1', role: 'user', content: 'Microserviços vs Monolito para o MVP? O que você recomenda?' },
    { id: '2', role: 'assistant', content: 'Para o estágio atual do projeto (MVP), minha recomendação é iniciar com um **Monolito Modular**.\n\n**Por que Monolito Modular?**\n*   **Velocidade de Desenvolvimento:** É mais rápido de configurar e iterar, pois não há overhead de rede ou orquestração complexa de deploy.\n*   **Simplicidade Operacional:** Deploy único, log único, monitoramento simplificado.\n*   **Refatoração Futura:** Se os módulos forem bem definidos (ex: Auth, Pagamentos, Core) dentro do monolito, a extração para microserviços futuros será muito mais fácil quando a escala exigir.\n\nMicroserviços agora adicionariam uma complexidade de infraestrutura desnecessária para o volume de tráfego inicial esperado.', thought: 'Analisando trade-offs de arquitetura para startups em fase inicial...' }
  ],
  // Chat 3: Review de código
  'chat-3': [
    { id: '1', role: 'user', content: 'Pode analisar esse trecho de código?\n```typescript\nconst data = await fetch("/api/user");\nconsole.log(data);```' },
    { id: '2', role: 'assistant', content: 'Claro! Analisando o trecho, identifiquei alguns pontos de atenção:\n\n1.  **Falta de Tratamento de Erro:** O `fetch` pode falhar (rede, 404, 500). É ideal envolver em um bloco `try/catch`.\n2.  **Conversão de Resposta:** O `fetch` retorna uma `Response`, não os dados JSON diretamente. Você precisa chamar `await data.json()`.\n3.  **Verificação de Status:** Mesmo que a requisição complete, o status pode não ser 200. Verifique `if (!data.ok)`.\n\nAqui está uma versão melhorada:\n```typescript\ntry {\n  const response = await fetch("/api/user");\n  if (!response.ok) throw new Error("Erro na requisição");\n  const data = await response.json();\n  console.log(data);\n} catch (error) {\n  console.error(error);\n}```' }
  ],
  // Chat 4: Planejamento Sprint
  'chat-4': [
    { id: '1', role: 'user', content: 'Quais itens devemos priorizar na próxima sprint?' },
    { id: '2', role: 'assistant', content: 'Considerando o roadmap e os prazos, sugiro priorizar:\n\n*   **Finalização do Dashboard:** O cliente precisa visualizar as métricas principais até sexta-feira.\n*   **Correção de Bugs Críticos:** Os issues #45 e #89 relacionados ao checkout precisam ser resolvidos antes de qualquer nova feature.\n*   **Integração com Stripe:** Se sobrar tempo, iniciar a configuração do ambiente de teste.\n\nIsso garante a entrega de valor imediato e estabilidade do sistema atual.' }
  ],
  // Chat 5: Ideias de features
  'chat-5': [
    { id: '1', role: 'user', content: 'Alguma ideia para melhorar o engajamento no app?' },
    { id: '2', role: 'assistant', content: 'Aqui estão algumas ideias baseadas em tendências de gamificação:\n\n1.  **Badges de Conquista:** Premie usuários por completar tarefas ou manter uma sequência de dias (streak).\n2.  **Modo Dark/Light Automático:** Melhora a usabilidade e conforto visual.\n3.  **Onboarding Interativo:** Um tour guiado que ensina as funcionalidades principais na prática.\n4.  **Notificações Inteligentes:** Avise apenas sobre o que realmente importa para o usuário, baseado no comportamento dele.' }
  ],
  // Default / Notion AI Welcome
  'welcome': [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hi Castro!

I'm the new and improved Scaffold AI — built to help you learn, create, and get more done. Here are all the ways I can help:

• **Databases:** I can build you new databases for tasks, projects, or habits, or jump into existing ones to add properties, filters, groups, and charts.
• **Page editing:** I can help write or polish any page — whether it's drafting from scratch, rewriting for clarity, summarizing long text, or reorganizing content into a clean structure.
• **Workspace search:** Ask me a question and I'll dig through Scaffold, Slack, Google Drive, and more to bring you the answer.
• **Data analysis:** I'll crunch the numbers in your databases, run the queries, and lay out the insights in reports, tables, or charts.
• **Web research:** Need the latest facts? I'll scan the web, compare sources, and give you a concise brief you can trust.
• **File processing:** Share a PDF or image with me — I'll pull out the important bits and turn them into notes or databases you can use.

Try this: Ask me to create a project tracker database, or search your workspace for something you need to find quickly.`,
      thought: ''
    }
  ]
}

export function ChatView({ tabId }: { tabId: string }) {
  // Determine if it's a new chat or an existing one from history
  // If tabId is in our conversations map, load it. Otherwise, assume new or welcome.
  
  // Logic: 
  // - If tabId starts with 'chat-' and is in dictionary, load it.
  // - If it's "New Chat" (from sidebar button usually generates a unique ID, but for now we might receive 'New Chat' string or a timestamped ID). 
  // - Let's treat 'New Chat' or unknown IDs as the "Welcome" state (Notion AI intro).
  
  const initialMessages = conversations[tabId] || conversations['welcome']
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = React.useState('')
  const [isThinking, setIsThinking] = React.useState(false)
  const [thinkingText, setThinkingText] = React.useState('Thinking...')

  // Reset messages when tabId changes
  React.useEffect(() => {
    setMessages(conversations[tabId] || conversations['welcome'])
  }, [tabId])

  const handleSend = () => {
    if (!inputValue.trim() || isThinking) return
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    }
    setMessages([...messages, newMsg])
    setInputValue('')
    
    // Show thinking animation
    setIsThinking(true)
    
    // Rotate thinking text similar to Notion AI
    const thinkingTexts = ['Thinking...', 'Organizing...', 'Crafting...']
    let textIndex = 0
    setThinkingText(thinkingTexts[0])
    
    const thinkingInterval = setInterval(() => {
      textIndex = (textIndex + 1) % thinkingTexts.length
      setThinkingText(thinkingTexts[textIndex])
    }, 600)
    
    // Show response after 2 seconds
    setTimeout(() => {
      clearInterval(thinkingInterval)
      setIsThinking(false)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm a demo bot. I can't really think yet!",
        thought: "Processing user input..."
      }])
    }, 2000)
  }

  // If we are in the "Welcome" state (only 1 message from assistant), show the specific layout
  // Actually, the reference image shows the chat history view with the welcome message.
  // The Empty State (logo centered) is for when there are ZERO messages. 
  // Our 'welcome' conversation has 1 message.
  
  // However, the user might want the "Empty State" with the suggestions if it's TRULY a new blank chat.
  // But the prompt asked to make the mocked chat look like the reference (which has text).
  // Let's assume "New Chat" starts empty (suggestions), and "Notion AI" history item (if existed) would show the text.
  // BUT, usually "New Chat" in Notion AI *starts* with the "What's our quest today?" screen.
  // The text in the image looks like a specific "Onboarding" or "Update" message thread.
  
  // Let's keep the empty state for true "New Chat" (empty array) and use the 'welcome' text for a specific "What's new" chat 
  // OR just default unknown chats to the Welcome text to satisfy "Deixe o Chat mocado mais parecido que esse".
  
  // I will make it so that if it's 'New Chat' tab, it shows empty state.
  // If it's anything else unknown, it shows the Welcome text.
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-6 relative overflow-hidden">
        <div className="text-center space-y-2 relative z-10">
          <h2 className="text-3xl font-semibold tracking-tight">What's our quest today?</h2>
        </div>

        <div className="w-full max-w-2xl space-y-6 relative z-10">
           <div className="relative shadow-lg rounded-xl bg-card border border-border">
             <Input 
               className="h-14 pl-4 pr-12 rounded-xl border-muted-foreground/10 text-lg shadow-sm focus-visible:ring-1 focus-visible:ring-ring/50 bg-card text-foreground placeholder:text-muted-foreground" 
               placeholder="Ask, search, or make anything..."
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <div className="absolute right-2 top-2 flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent grayscale">
                    <div className="flex items-center gap-1 text-[10px] font-medium opacity-60">
                        <span>Auto</span>
                    </div>
                </Button>
                <Button size="icon" className="h-10 w-10 rounded-lg grayscale" onClick={handleSend}>
                    <Send className="h-4 w-4" />
                </Button>
             </div>
           </div>

           {/* Integrations Row */}
           <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs text-muted-foreground font-medium">Get better answers from your apps</span>
              <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
                  <Slack className="h-4 w-4" />
                  <div className="h-4 w-4 flex items-center justify-center bg-[#555] rounded-[3px] text-white">
                     <span className="text-[10px] font-bold">D</span>
                  </div>
                  <Github className="h-4 w-4" />
                  <Trello className="h-4 w-4" />
                  <Mail className="h-4 w-4" />
                  <Globe className="h-4 w-4" />
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {[
                 { icon: Sparkles, text: "What's new in Scaffold AI" },
                 { icon: Paperclip, text: "Analyze PDFs or images" },
                 { icon: Send, text: "Draft email" },
                 { icon: Bot, text: "Brainstorm ideas" }
             ].map((item, i) => (
               <Button key={i} variant="outline" className="h-auto py-4 px-4 justify-start text-left whitespace-normal border-muted-foreground/10 hover:border-muted-foreground/20 hover:bg-muted/30 gap-3">
                 <item.icon className="h-5 w-5 text-muted-foreground" />
                 <span className="text-xs font-medium text-muted-foreground">{item.text}</span>
               </Button>
             ))}
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Date Header for the reference look */}
      <div className="flex justify-center py-4">
         <span className="text-xs text-muted-foreground font-medium">Wednesday, Jan 14 • Scaffold AI</span>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-8 pb-4">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex gap-4 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-1 space-y-2 min-w-0 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                
                {/* Thought Process (Collapsible) */}
                {msg.thought && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-0 text-muted-foreground gap-1 hover:no-underline mb-1">
                        <ChevronRight className="h-3 w-3" />
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
          {isThinking && (
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
        <div className="relative bg-card rounded-3xl border border-border shadow-sm flex flex-col p-3 gap-2">
           {/* Top: Context */}
           <div className="flex items-center">
              <Button variant="ghost" size="sm" className="h-7 rounded-full bg-muted hover:bg-accent text-xs font-normal text-muted-foreground px-3 border border-transparent transition-all gap-1.5 grayscale">
                 <AtSign className="h-3.5 w-3.5" />
                 Add context
              </Button>
           </div>
           
           {/* Input */}
           <Input 
             className="min-h-[24px] p-0 px-1 border-0 shadow-none resize-none bg-card focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] placeholder:text-muted-foreground font-normal text-foreground" 
             placeholder="Ask, search, or make anything..."
             value={inputValue}
             onChange={(e) => setInputValue(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
           />
           
           {/* Bottom: Tools & Send */}
           <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                 <button className="text-muted-foreground hover:text-foreground transition-colors grayscale">
                    <Paperclip className="h-4 w-4" />
                 </button>
                 
                 <div className="flex items-center gap-4">
                    <button className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium grayscale">
                       Auto
                    </button>
                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium grayscale">
                       <GlobeIcon className="h-3.5 w-3.5" />
                       All sources
                    </button>
                 </div>
              </div>

              <div className="flex items-center">
                 <Button 
                    size="icon" 
                    className={`h-8 w-8 rounded-full transition-all duration-200 grayscale ${
                        inputValue.trim() 
                        ? 'bg-foreground hover:bg-foreground/90 text-background' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`} 
                    onClick={inputValue.trim() ? handleSend : undefined}
                    disabled={!inputValue.trim()}
                 >
                    <ArrowUp className="h-5 w-5" />
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}