import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MagnifyingGlass, Plus, EnvelopeSimple, DotsThreeVertical } from '@phosphor-icons/react'

const membros = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@example.com',
    cargo: 'Product Manager',
    status: 'Ativo',
    projetos: 8,
    iniciais: 'JS',
    cor: 'bg-blue-500',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@example.com',
    cargo: 'UX Designer',
    status: 'Ativo',
    projetos: 12,
    iniciais: 'MS',
    cor: 'bg-purple-500',
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro.costa@example.com',
    cargo: 'Desenvolvedor Full Stack',
    status: 'Ativo',
    projetos: 15,
    iniciais: 'PC',
    cor: 'bg-green-500',
  },
  {
    id: 4,
    nome: 'Ana Paula',
    email: 'ana.paula@example.com',
    cargo: 'QA Engineer',
    status: 'Férias',
    projetos: 6,
    iniciais: 'AP',
    cor: 'bg-yellow-500',
  },
  {
    id: 5,
    nome: 'Carlos Mendes',
    email: 'carlos.mendes@example.com',
    cargo: 'DevOps Engineer',
    status: 'Ativo',
    projetos: 10,
    iniciais: 'CM',
    cor: 'bg-red-500',
  },
  {
    id: 6,
    nome: 'Beatriz Lima',
    email: 'beatriz.lima@example.com',
    cargo: 'Scrum Master',
    status: 'Ativo',
    projetos: 14,
    iniciais: 'BL',
    cor: 'bg-pink-500',
  },
]

export default function EquipePage() {
  return (
    <ThreeColumnLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os membros da sua equipe
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Membro
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-muted-foreground mt-1">
                Total de Membros
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">10</div>
              <p className="text-sm text-muted-foreground mt-1">
                Membros Ativos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">24</div>
              <p className="text-sm text-muted-foreground mt-1">
                Projetos Ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Pesquisa */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar membros..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>

        {/* Lista de Membros */}
        <div className="space-y-2">
          {membros.map((membro) => (
            <Card key={membro.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`${membro.cor} text-white font-semibold`}>
                      {membro.iniciais}
                    </AvatarFallback>
                  </Avatar>

                  {/* Informações do Membro */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{membro.nome}</h3>
                      <Badge 
                        variant={membro.status === 'Ativo' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {membro.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{membro.cargo}</span>
                      <span>•</span>
                      <span>{membro.projetos} projetos</span>
                    </div>
                  </div>

                  {/* Email e Ações */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <EnvelopeSimple weight="bold" className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <DotsThreeVertical weight="bold" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ThreeColumnLayout>
  )
}
