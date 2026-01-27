'use client'

import * as React from 'react'
import { PaperPlaneTilt, Robot, User, Sparkle, Paperclip, CaretDown, CaretRight, SlackLogo, GithubLogo, TrelloLogo, FigmaLogo, EnvelopeSimple, Globe, ThumbsUp, ThumbsDown, Copy, PlusCircle, StopCircle, At, ArrowUp, CircleNotch, MagnifyingGlass, GridFour, Cpu, Microphone, Waveform, Baby, Heart, Airplane, Wrench, Translate, Question } from '@phosphor-icons/react'
import { useStatusBar } from '@/hooks/use-status-bar'
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
    { id: '1', role: 'user', content: 'Microphone weight="bold"roserviços vs Monolito para o MVP? O que você recomenda?' },
    { id: '2', role: 'assistant', content: 'Para o estágio atual do projeto (MVP), minha recomendação é iniciar com um **Monolito Modular**.\n\n**Por que Monolito Modular?**\n*   **Velocidade de Desenvolvimento:** É mais rápido de configurar e iterar, pois não há overhead de rede ou orquestração complexa de deploy.\n*   **Simplicidade Operacional:** Deploy único, log único, monitoramento simplificado.\n*   **Refatoração Futura:** Se os módulos forem bem definidos (ex: Auth, Pagamentos, Core) dentro do monolito, a extração para microserviços futuros será muito mais fácil quando a escala exigir.\n\nMicrophone weight="bold"roserviços agora adicionariam uma complexidade de infraestrutura desnecessária para o volume de tráfego inicial esperado.', thought: 'Analisando trade-offs de arquitetura para startups em fase inicial...' }
  ],
  // Chat 3: Review de código
  'chat-3': [
    { id: '1', role: 'user', content: 'Pode analisar esse trecho de código?\n```typescript\nconst data = await fetch("/api/user");\nconsole.log(data);```' },
    { id: '2', role: 'assistant', content: 'Claro! Analisando o trecho, identifiquei alguns pontos de atenção:\n\n1.  **Falta de Tratamento de Erro:** O `fetch` pode falhar (rede, 404, 500). É ideal envolver em um bloco `try/catch`.\n2.  **Conversão de Resposta:** O `fetch` retorna uma `Response`, não os dados JSON diretamente. Você precisa chamar `await data.json()`.\n3.  **Verificação de Status:** Mesmo que a requisição complete, o status pode não ser 200. Verifique `if (!data.ok)`.\n\nAqui está uma versão melhorada:\n```typescript\ntry {\n  const response = await fetch("/api/user");\n  if (!response.ok) throw new Error("Erro na requisição");\n  const data = await response.json();\n  console.log(data);\n} catch (error) {\n  console.error(error);\n}```' }
  ],
  // Chat 4: Airplane weight="bold"jamento Sprint
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
• **Workspace search:** Ask me a question and I'll dig through Scaffold, SlackLogo weight="bold", Google Drive, and more to bring you the answer.
• **Data analysis:** I'll crunch the numbers in your databases, run the queries, and lay out the insights in reports, tables, or charts.
• **Web research:** Need the latest facts? I'll scan the web, compare sources, and give you a concise brief you can trust.
• **File processing:** Share a PDF or image with me — I'll pull out the important bits and turn them into notes or databases you can use.

Try this: Ask me to create a project tracker database, or search your workspace for something you need to find quickly.`,
      thought: ''
    }
  ]
}

export function ChatView({ tabId, tabData }: { tabId: string; tabData?: any }) {
  // Status bar hook
  const { setLoading, setSuccess } = useStatusBar()
  
  // Determine if it's a new chat or an existing one from history
  // If tabId is in our conversations map, load it. Otherwise, assume new or welcome.
  
  // Logic: 
  // - If tabId starts with 'chat-' and is in dictionary, load it.
  // - If it's "New Chat" (from sidebar button usually generates a unique ID, but for now we might receive 'New Chat' string or a timestamped ID). 
  // - Let's treat 'New Chat' or unknown IDs as the "Welcome" state (Notion AI intro).
  // - If tabData?.isEmpty is true, show empty state (no messages)
  
  const shouldShowEmpty = tabData?.isEmpty === true
  const initialMessages = shouldShowEmpty ? [] : (conversations[tabId] || conversations['welcome'])
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = React.useState('')
  const [isThinking, setIsThinking] = React.useState(false)
  const [thinkingText, setThinkingText] = React.useState('Thinking...')

  // Reset messages when tabId changes
  React.useEffect(() => {
    if (tabData?.isEmpty === true) {
      setMessages([])
    } else {
      setMessages(conversations[tabId] || conversations['welcome'])
    }
  }, [tabId, tabData])

  const handleSend = () => {
    if (!inputValue.trim() || isThinking) return
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    }
    setMessages([...messages, newMsg])
    setInputValue('')
    
    // Update status bar
    setLoading('Processando mensagem...')
    
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
      setSuccess('Resposta recebida')
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
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-8 relative overflow-hidden bg-background">
        <div className="text-center space-y-2 relative z-10 mb-4">
          <h2 className="text-4xl font-serif tracking-tight text-foreground/90">perplexity</h2>
        </div>

        <div className="w-full max-w-2xl space-y-6 relative z-10">
           <div className="relative rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
             <div className="flex items-center px-4 py-3 gap-3">
               {/* Left Icons */}
               <div className="flex items-center gap-2 text-muted-foreground/70">
                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                   <MagnifyingGlass weight="bold" className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                   <Globe className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                   <GridFour weight="bold" className="h-4 w-4" />
                 </Button>
               </div>
               
               <Input 
                 className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent px-0 text-base placeholder:text-muted-foreground/50 h-auto py-2" 
                 placeholder="Ask anything. Type @ for mentions and / for shortcuts."
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />

               {/* Right Icons */}
               <div className="flex items-center gap-2 text-muted-foreground/70">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                    <Cpu className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                    <Microphone weight="bold" className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 rounded-full bg-teal-700 hover:bg-teal-800 text-white">
                    <Waveform weight="bold" className="h-4 w-4" />
                  </Button>
               </div>
             </div>
           </div>

           <div className="flex flex-wrap items-center justify-center gap-2">
             {[
                 { icon: Baby, text: "Parenting" },
                 { icon: Heart, text: "Health" },
                 { icon: Airplane, text: "Travel" },
                 { icon: PaperPlaneTilt, text: "Local" },
                 { icon: Wrench, text: "Troubleshoot" }
             ].map((item, i) => (
               <Button key={i} variant="outline" className="h-8 px-3 gap-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent border-muted-foreground/20 hover:bg-muted/50 rounded-full">
                 <item.icon className="h-3.5 w-3.5" />
                 <span>{item.text}</span>
               </Button>
             ))}
           </div>
        </div>
        
        {/* Footer Help Buttons */}
        <div className="absolute bottom-8 right-8 flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-muted-foreground/20 text-muted-foreground">
                <Translate weight="bold" className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-muted-foreground/20 text-muted-foreground">
                <Question weight="bold" className="h-4 w-4" />
            </Button>
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
                 <At weight="bold" className="h-3.5 w-3.5" />
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
           
           {/* Robot weight="bold"tom: Tools & PaperPlaneTilt */}
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