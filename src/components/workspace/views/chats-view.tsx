'use client'

import * as React from 'react'
import { ChatCircle, MagnifyingGlass, Plus, Funnel, ArrowsDownUp, DotsThree } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace-store'

export function ChatsView() {
  const { addTabInNewWindow } = useWorkspaceStore()

  const chats = [
    { id: 1, title: 'Análise de Mercado Q1', group: 'Marketing', isPrivate: false, members: ['/image 36.png', '/image 158.png'], time: '10:30', unread: 2, preview: 'Podemos analisar os dados de vendas...' },
    { id: 2, title: 'Revisão de Código Frontend', group: 'Engenharia', isPrivate: false, members: ['/image 161.png', '/image 162.png'], time: '09:15', unread: 0, preview: 'O PR #123 precisa de ajustes no...' },
    { id: 3, title: 'Ideias para Campanha', group: 'Marketing', isPrivate: true, members: ['/image 36.png'], time: 'Yesterday', unread: 0, preview: 'Que tal focarmos em vídeos curtos...' },
    { id: 4, title: 'Planejamento Estratégico', group: 'Geral', isPrivate: false, members: ['/image 161.png', '/image 162.png', '/image 36.png'], time: 'Yesterday', unread: 5, preview: 'A reunião foi remarcada para...' },
    { id: 5, title: 'Debug do Erro de Login', group: 'Engenharia', isPrivate: false, members: ['/image 161.png', '/image 162.png'], time: '2 days ago', unread: 0, preview: 'Encontrei o problema na autenticação...' },
    { id: 6, title: 'Feedback Design', group: 'Design', isPrivate: true, members: ['/image 36.png'], time: '3h ago', unread: 1, preview: 'Gostei das cores, mas a fonte...' },
    { id: 7, title: 'Campanha Black Friday', group: 'Marketing', isPrivate: false, members: ['/image 158.png', '/image 161.png'], time: '5h ago', unread: 0, preview: 'O cronograma está apertado...' },
    { id: 8, title: 'Onboarding Novo Dev', group: 'RH', isPrivate: true, members: ['/image 162.png'], time: '1d ago', unread: 0, preview: 'Documentação enviada.' },
    { id: 9, title: 'Reunião Semanal', group: 'Geral', isPrivate: false, members: ['/image 161.png', '/image 162.png', '/image 36.png'], time: '1d ago', unread: 5, preview: 'Pauta da reunião atualizada.' },
    { id: 10, title: 'Ideias App Mobile', group: 'Produto', isPrivate: false, members: ['/image 36.png', '/image 158.png'], time: '2d ago', unread: 0, preview: 'Wireframes iniciais prontos.' },
    { id: 11, title: 'Suporte Cliente #1234', group: 'Suporte', isPrivate: false, members: ['/image 163.png'], time: '2d ago', unread: 2, preview: 'Cliente relatou lentidão.' },
    { id: 12, title: 'Revisão de Contratos', group: 'Jurídico', isPrivate: true, members: ['/image 36.png'], time: '3d ago', unread: 0, preview: 'Minuta finalizada.' },
    { id: 13, title: 'Integração Slack', group: 'DevOps', isPrivate: false, members: ['/image 161.png', '/image 162.png'], time: '3d ago', unread: 0, preview: 'Webhook configurado.' },
    { id: 14, title: 'Brainstorming UI', group: 'Design', isPrivate: false, members: ['/image 36.png', '/image 158.png', '/image 163.png'], time: '4d ago', unread: 0, preview: 'Moodboard aprovado.' },
    { id: 15, title: 'Orçamento 2026', group: 'Financeiro', isPrivate: true, members: ['/image 36.png'], time: '1w ago', unread: 0, preview: 'Planilha enviada para revisão.' },
    { id: 16, title: 'Relatório de Vendas Mensal', group: 'Vendas', isPrivate: false, members: ['/image 161.png', '/image 158.png'], time: '1w ago', unread: 0, preview: 'Os números de março superaram as expectativas.' },
    { id: 17, title: 'Atualização do Site Institucional', group: 'Marketing', isPrivate: false, members: ['/image 36.png', '/image 162.png'], time: '1w ago', unread: 1, preview: 'Precisamos revisar o texto da página Sobre.' },
    { id: 18, title: 'Treinamento de Segurança', group: 'TI', isPrivate: true, members: ['/image 163.png'], time: '2w ago', unread: 0, preview: 'Todos devem completar o módulo até sexta-feira.' },
    { id: 19, title: 'Planejamento de Evento Corporativo', group: 'RH', isPrivate: false, members: ['/image 158.png', '/image 161.png', '/image 36.png'], time: '2w ago', unread: 3, preview: 'Orçamentos do buffet recebidos.' },
    { id: 20, title: 'Migração de Banco de Dados', group: 'Engenharia', isPrivate: true, members: ['/image 162.png', '/image 163.png'], time: '2w ago', unread: 0, preview: 'Script de migração validado em staging.' },
    { id: 21, title: 'Feedback Pesquisa de Clima', group: 'RH', isPrivate: true, members: ['/image 36.png'], time: '3w ago', unread: 0, preview: 'Resultados compilados e prontos para apresentação.' },
    { id: 22, title: 'Nova Identidade Visual', group: 'Design', isPrivate: false, members: ['/image 158.png', '/image 161.png'], time: '3w ago', unread: 0, preview: 'Logo final aprovado pela diretoria.' },
    { id: 23, title: 'Revisão de Metas Q2', group: 'Geral', isPrivate: false, members: ['/image 161.png', '/image 162.png', '/image 36.png'], time: '3w ago', unread: 0, preview: 'Ajustes nas metas de crescimento.' },
    { id: 24, title: 'Protótipo App Android', group: 'Produto', isPrivate: false, members: ['/image 163.png', '/image 158.png'], time: '1mo ago', unread: 0, preview: 'APK disponível para testes internos.' },
    { id: 25, title: 'Contratação Senior Frontend', group: 'RH', isPrivate: true, members: ['/image 162.png'], time: '1mo ago', unread: 0, preview: 'Entrevistas técnicas agendadas.' },
    { id: 26, title: 'Auditoria Externa', group: 'Financeiro', isPrivate: true, members: ['/image 36.png', '/image 161.png'], time: '1mo ago', unread: 0, preview: 'Documentação solicitada entregue.' },
    { id: 27, title: 'Campanha Redes Sociais', group: 'Marketing', isPrivate: false, members: ['/image 158.png', '/image 36.png'], time: '1mo ago', unread: 0, preview: 'Calendário de posts aprovado.' },
    { id: 28, title: 'Manutenção Servidores', group: 'DevOps', isPrivate: false, members: ['/image 163.png', '/image 162.png'], time: '1mo ago', unread: 0, preview: 'Janela de manutenção agendada para domingo.' },
    { id: 29, title: 'Política de Home Office', group: 'RH', isPrivate: false, members: ['/image 161.png', '/image 36.png', '/image 158.png'], time: '2mo ago', unread: 0, preview: 'Nova política entra em vigor mês que vem.' },
    { id: 30, title: 'Expansão Internacional', group: 'Estratégia', isPrivate: true, members: ['/image 162.png', '/image 163.png'], time: '2mo ago', unread: 0, preview: 'Estudo de mercado LATAM concluído.' },
    { id: 31, title: 'Bug Crítico Checkout', group: 'Engenharia', isPrivate: false, members: ['/image 158.png', '/image 161.png'], time: '2mo ago', unread: 0, preview: 'Hotfix aplicado em produção.' },
    { id: 32, title: 'Workshop de Inovação', group: 'Produto', isPrivate: false, members: ['/image 36.png', '/image 162.png'], time: '2mo ago', unread: 0, preview: 'Ideias geradas no workshop documentadas.' },
    { id: 33, title: 'Renovação Licenças Software', group: 'TI', isPrivate: true, members: ['/image 163.png'], time: '3mo ago', unread: 0, preview: 'Lista de licenças a renovar.' },
    { id: 34, title: 'Parceria Estratégica X', group: 'Vendas', isPrivate: true, members: ['/image 161.png', '/image 158.png'], time: '3mo ago', unread: 0, preview: 'Contrato assinado.' },
    { id: 35, title: 'Otimização SEO', group: 'Marketing', isPrivate: false, members: ['/image 36.png', '/image 162.png'], time: '3mo ago', unread: 0, preview: 'Relatório de palavras-chave atualizado.' },
    { id: 36, title: 'Design System v2', group: 'Design', isPrivate: false, members: ['/image 158.png', '/image 163.png', '/image 161.png'], time: '3mo ago', unread: 0, preview: 'Componentes base finalizados.' },
    { id: 37, title: 'Onboarding Parceiros', group: 'Comercial', isPrivate: false, members: ['/image 162.png', '/image 36.png'], time: '4mo ago', unread: 0, preview: 'Kit de boas-vindas enviado.' },
    { id: 38, title: 'Revisão Jurídica Termos de Uso', group: 'Jurídico', isPrivate: true, members: ['/image 161.png'], time: '4mo ago', unread: 0, preview: 'Sugestões de alteração no documento.' },
    { id: 39, title: 'Automação de Testes', group: 'QA', isPrivate: false, members: ['/image 163.png', '/image 158.png'], time: '4mo ago', unread: 0, preview: 'Cobertura de testes aumentou para 85%.' },
    { id: 40, title: 'Programa de Mentoria', group: 'RH', isPrivate: false, members: ['/image 36.png', '/image 162.png'], time: '5mo ago', unread: 0, preview: 'Pares de mentoria definidos.' },
    { id: 41, title: 'Dashboard Financeiro', group: 'Financeiro', isPrivate: true, members: ['/image 161.png', '/image 163.png'], time: '5mo ago', unread: 0, preview: 'Novos KPIs adicionados ao painel.' },
    { id: 42, title: 'Estratégia de Conteúdo Blog', group: 'Marketing', isPrivate: false, members: ['/image 158.png', '/image 36.png'], time: '5mo ago', unread: 0, preview: 'Pauta para o próximo trimestre.' },
    { id: 43, title: 'API Gateway', group: 'Engenharia', isPrivate: false, members: ['/image 162.png', '/image 161.png'], time: '6mo ago', unread: 0, preview: 'Configuração inicial do gateway.' },
    { id: 44, title: 'Pesquisa de Satisfação NPS', group: 'Suporte', isPrivate: false, members: ['/image 163.png', '/image 158.png'], time: '6mo ago', unread: 0, preview: 'NPS subiu 5 pontos.' },
    { id: 45, title: 'Hackathon Interno', group: 'Geral', isPrivate: false, members: ['/image 36.png', '/image 161.png', '/image 162.png'], time: '6mo ago', unread: 0, preview: 'Projetos vencedores anunciados.' },
    { id: 46, title: 'Reestruturação Equipes', group: 'RH', isPrivate: true, members: ['/image 158.png'], time: '7mo ago', unread: 0, preview: 'Novo organograma proposto.' },
    { id: 47, title: 'Lançamento Feature Y', group: 'Produto', isPrivate: false, members: ['/image 161.png', '/image 163.png'], time: '7mo ago', unread: 0, preview: 'Feature flag habilitada para 10%.' },
    { id: 48, title: 'Treinamento LGPD', group: 'Jurídico', isPrivate: false, members: ['/image 162.png', '/image 36.png'], time: '8mo ago', unread: 0, preview: 'Certificados emitidos.' },
    { id: 49, title: 'Backup Disaster Recovery', group: 'TI', isPrivate: true, members: ['/image 163.png', '/image 161.png'], time: '8mo ago', unread: 0, preview: 'Teste de recuperação bem-sucedido.' },
    { id: 50, title: 'Festa de Fim de Ano', group: 'Geral', isPrivate: false, members: ['/image 158.png', '/image 162.png', '/image 36.png'], time: '1y ago', unread: 0, preview: 'Fotos do evento disponíveis.' }
  ]

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      'Engenharia': 'bg-slate-100 text-slate-700',
      'Produto': 'bg-blue-100 text-blue-700',
      'Design': 'bg-pink-100 text-pink-700',
      'Marketing': 'bg-orange-100 text-orange-700',
      'RH': 'bg-purple-100 text-purple-700',
      'Geral': 'bg-gray-100 text-gray-700',
      'Suporte': 'bg-green-100 text-green-700',
      'Jurídico': 'bg-red-100 text-red-700',
      'DevOps': 'bg-yellow-100 text-yellow-700',
      'Financeiro': 'bg-emerald-100 text-emerald-700'
    }
    return colors[group] || 'bg-muted text-muted-foreground'
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-8 gap-8 overflow-hidden">
      <div className="flex-none space-y-2">
        <h1 className="text-3xl font-bold">Chats</h1>
        <p className="text-muted-foreground">Manage and continue your conversations.</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 gap-4">
        {/* Toolbar */}
        <div className="flex-none flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search chats..." 
              className="pl-9 bg-muted/30 border-muted-foreground/20" 
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground">
              <Funnel className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground">
              <ArrowsDownUp className="h-4 w-4" />
              Sort
            </Button>
            <Button 
              size="sm" 
              className="h-9 gap-2"
              onClick={() => addTabInNewWindow('chat', 'New Chat', { chatId: 'new', isEmpty: true })}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Chats List */}
        <Card className="flex-1 min-h-0 border-0 bg-muted/30 shadow-none">
          <CardContent className="p-0 h-full">
             <ScrollArea className="h-full">
               <div className="divide-y">
                 {chats.map((chat, i) => (
                   <div 
                     key={i} 
                     className="flex items-center gap-4 px-4 py-3 hover:bg-accent transition-colors cursor-pointer group"
                     onClick={() => addTabInNewWindow('chat', chat.title, { chatId: chat.id })}
                   >
                     <div className="relative flex items-center justify-center w-10 h-10 bg-background rounded-md border shrink-0">
                       <ChatCircle className="h-5 w-5 text-muted-foreground" />
                       {chat.unread > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full ring-2 ring-background">
                            {chat.unread}
                          </div>
                       )}
                     </div>
                     <div className="flex-1 min-w-0 flex flex-col gap-1">
                       <div className="flex items-center gap-3">
                         <h4 className="font-medium text-sm truncate">{chat.title}</h4>
                         <div className="flex items-center gap-2">
                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getGroupColor(chat.group))}>
                             {chat.group}
                           </span>
                           {chat.isPrivate && (
                             <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600">
                               Private
                             </span>
                           )}
                         </div>
                       </div>
                       <p className="text-xs text-muted-foreground truncate max-w-[500px]">
                         {chat.preview}
                       </p>
                     </div>
                     
                     <div className="flex items-center gap-6">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.time}</span>
                        
                        {/* Members Avatars */}
                        <div className="flex -space-x-2 shrink-0">
                            {chat.members.map((member, idx) => (
                                <Avatar key={idx} className="h-7 w-7 border-2 border-background">
                                    <AvatarImage src={member} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              <DotsThree className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Pin Chat</DropdownMenuItem>
                            <DropdownMenuItem>Edit Title</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                   </div>
                 ))}
               </div>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
