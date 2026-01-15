'use client'

import * as React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Activity {
  id: number
  tipo: 'documento' | 'projeto' | 'equipe' | 'comentario'
  acao: string
  usuario: string
  iniciais: string
  data: Date
  detalhes?: string
}

interface ActivitySidebarProps {
  activities?: Activity[]
}

const defaultActivities: Activity[] = [
  {
    id: 1,
    tipo: 'documento',
    acao: 'criou um novo documento',
    usuario: 'João Silva',
    iniciais: 'JS',
    data: new Date(Date.now() - 5 * 60 * 1000),
    detalhes: 'Proposta Comercial Q1',
  },
  {
    id: 2,
    tipo: 'projeto',
    acao: 'atualizou o projeto',
    usuario: 'Maria Santos',
    iniciais: 'MS',
    data: new Date(Date.now() - 1 * 60 * 60 * 1000),
    detalhes: 'Website Redesign',
  },
  {
    id: 3,
    tipo: 'equipe',
    acao: 'adicionou um membro',
    usuario: 'Pedro Costa',
    iniciais: 'PC',
    data: new Date(Date.now() - 3 * 60 * 60 * 1000),
    detalhes: 'Ana Paula',
  },
  {
    id: 4,
    tipo: 'comentario',
    acao: 'comentou em',
    usuario: 'Ana Paula',
    iniciais: 'AP',
    data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    detalhes: 'Dashboard Analytics',
  },
]

const getTipoColor = (tipo: Activity['tipo']) => {
  switch (tipo) {
    case 'documento':
      return 'bg-blue-500'
    case 'projeto':
      return 'bg-green-500'
    case 'equipe':
      return 'bg-purple-500'
    case 'comentario':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

const getTipoLabel = (tipo: Activity['tipo']) => {
  switch (tipo) {
    case 'documento':
      return 'Documento'
    case 'projeto':
      return 'Projeto'
    case 'equipe':
      return 'Equipe'
    case 'comentario':
      return 'Comentário'
    default:
      return tipo
  }
}

export function ActivitySidebar({ activities = defaultActivities }: ActivitySidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">Atividade Recente</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Acompanhe as últimas ações da equipe
        </p>
      </div>

      {/* Lista de atividades */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              {/* Avatar */}
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className={`${getTipoColor(activity.tipo)} text-white text-xs`}>
                  {activity.iniciais}
                </AvatarFallback>
              </Avatar>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start gap-2">
                  <p className="text-sm">
                    <span className="font-medium">{activity.usuario}</span>{' '}
                    <span className="text-muted-foreground">{activity.acao}</span>
                    {activity.detalhes && (
                      <span className="font-medium"> {activity.detalhes}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getTipoLabel(activity.tipo)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.data, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
