import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Users, FileText, Folder } from 'lucide-react'

export default function DashboardPage() {
  return (
    <ThreeColumnLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo ao seu painel de controle
            </p>
          </div>
          <Button>Criar Novo</Button>
        </div>

        {/* Cards de Métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Projetos
              </CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+12%</span>
                <span className="ml-1">desde o mês passado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documentos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+8%</span>
                <span className="ml-1">desde a semana passada</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Membros da Equipe
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-red-500">-2</span>
                <span className="ml-1">este mês</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <Progress value={68} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Projetos Recentes */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Projetos Recentes</CardTitle>
              <CardDescription>
                Seus projetos mais acessados recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    nome: 'Website Redesign',
                    status: 'Em Progresso',
                    progresso: 75,
                    cor: 'bg-blue-500',
                  },
                  {
                    nome: 'App Mobile',
                    status: 'Planejamento',
                    progresso: 30,
                    cor: 'bg-yellow-500',
                  },
                  {
                    nome: 'Dashboard Analytics',
                    status: 'Concluído',
                    progresso: 100,
                    cor: 'bg-green-500',
                  },
                ].map((projeto, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{projeto.nome}</p>
                        <Badge variant="secondary" className="text-xs">
                          {projeto.status}
                        </Badge>
                      </div>
                      <Progress value={projeto.progresso} className="h-1" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {projeto.progresso}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas ações realizadas na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    acao: 'Novo documento criado',
                    usuario: 'João Silva',
                    tempo: 'Há 5 minutos',
                  },
                  {
                    acao: 'Projeto atualizado',
                    usuario: 'Maria Santos',
                    tempo: 'Há 1 hora',
                  },
                  {
                    acao: 'Membro adicionado à equipe',
                    usuario: 'Pedro Costa',
                    tempo: 'Há 3 horas',
                  },
                  {
                    acao: 'Documento compartilhado',
                    usuario: 'Ana Paula',
                    tempo: 'Há 1 dia',
                  },
                ].map((atividade, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{atividade.acao}</p>
                      <p className="text-xs text-muted-foreground">
                        {atividade.usuario} • {atividade.tempo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThreeColumnLayout>
  )
}
