import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Folder, MoreVertical } from 'lucide-react'

const projetos = [
  {
    id: 1,
    nome: 'Website Redesign',
    descricao: 'Reformulação completa do website corporativo',
    status: 'Em Progresso',
    membros: 5,
    documentos: 12,
    cor: 'bg-blue-500',
  },
  {
    id: 2,
    nome: 'App Mobile',
    descricao: 'Desenvolvimento de aplicativo mobile multiplataforma',
    status: 'Planejamento',
    membros: 3,
    documentos: 8,
    cor: 'bg-yellow-500',
  },
  {
    id: 3,
    nome: 'Dashboard Analytics',
    descricao: 'Painel de análise de dados em tempo real',
    status: 'Concluído',
    membros: 4,
    documentos: 24,
    cor: 'bg-green-500',
  },
  {
    id: 4,
    nome: 'API Integration',
    descricao: 'Integração com APIs de terceiros',
    status: 'Em Progresso',
    membros: 2,
    documentos: 6,
    cor: 'bg-purple-500',
  },
  {
    id: 5,
    nome: 'E-commerce Platform',
    descricao: 'Plataforma completa de e-commerce',
    status: 'Planejamento',
    membros: 6,
    documentos: 15,
    cor: 'bg-orange-500',
  },
  {
    id: 6,
    nome: 'CRM System',
    descricao: 'Sistema de gerenciamento de relacionamento com cliente',
    status: 'Em Progresso',
    membros: 4,
    documentos: 18,
    cor: 'bg-pink-500',
  },
]

export default function ProjetosPage() {
  return (
    <ThreeColumnLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os seus projetos em um só lugar
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar projetos..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>

        {/* Grid de Projetos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto) => (
            <Card key={projeto.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${projeto.cor} flex items-center justify-center`}>
                      <Folder className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{projeto.nome}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {projeto.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="mt-3">
                  {projeto.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{projeto.membros} membros</span>
                  <span>{projeto.documentos} documentos</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ThreeColumnLayout>
  )
}
