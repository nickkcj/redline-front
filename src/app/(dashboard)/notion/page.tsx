'use client'

import { NotionStyleLayout } from '@/components/layout/notion-style-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  ChatCircle, 
  FileText, 
  TrendUp,
  Users,
  Clock,
  Sparkle,
} from '@phosphor-icons/react'
import Link from 'next/link'

export default function NotionStylePage() {
  return (
    <NotionStyleLayout>
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl">👋</span>
            <h1 className="text-3xl font-bold">Bem-vindo ao seu Workspace</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Comece um novo chat ou acesse seus documentos recentes
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="group relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all p-6 text-left hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Novo Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Inicie uma nova conversa com IA
                </p>
              </div>
            </div>
          </button>

          <Link href="/documentos/new" className="group relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all p-6 text-left hover:shadow-md block">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Novo Documento</h3>
                <p className="text-sm text-muted-foreground">
                  Crie um documento em branco
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <ChatCircle weight="bold" className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">Chats Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">Documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Colaboradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas ações no seu workspace</CardDescription>
              </div>
              <Button variant="outline" size="sm">Ver tudo</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: '💬',
                  title: 'Novo chat iniciado',
                  desc: 'Análise de requisitos do projeto',
                  time: 'Há 2 horas',
                  badge: 'Chat',
                  badgeColor: 'bg-purple-100 text-purple-700',
                },
                {
                  icon: '📄',
                  title: 'Documento atualizado',
                  desc: 'Especificações Técnicas v2.0',
                  time: 'Há 5 horas',
                  badge: 'Documento',
                  badgeColor: 'bg-blue-100 text-blue-700',
                },
                {
                  icon: '✅',
                  title: 'Chat concluído',
                  desc: 'Review de código frontend',
                  time: 'Ontem',
                  badge: 'Chat',
                  badgeColor: 'bg-purple-100 text-purple-700',
                },
                {
                  icon: '🗺️',
                  title: 'Novo documento criado',
                  desc: 'Roadmap 2024',
                  time: 'Há 2 dias',
                  badge: 'Documento',
                  badgeColor: 'bg-blue-100 text-blue-700',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <Badge variant="secondary" className={`text-xs ${activity.badgeColor}`}>
                        {activity.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.desc}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkle weight="bold" className="h-5 w-5 text-primary" />
              <CardTitle>Templates Populares</CardTitle>
            </div>
            <CardDescription>Comece rapidamente com nossos templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  emoji: '📋',
                  title: 'Project Brief',
                  desc: 'Template para início de projeto',
                },
                {
                  emoji: '📊',
                  title: 'Meeting Notes',
                  desc: 'Organize suas reuniões',
                },
                {
                  emoji: '🎯',
                  title: 'OKRs & Goals',
                  desc: 'Defina objetivos e metas',
                },
                {
                  emoji: '📝',
                  title: 'Documentation',
                  desc: 'Template de documentação',
                },
              ].map((template, index) => (
                <button
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 hover:shadow-md transition-all text-left"
                >
                  <span className="text-2xl">{template.emoji}</span>
                  <div>
                    <p className="font-medium text-sm">{template.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {template.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </NotionStyleLayout>
  )
}
