import { FlexibleLayout } from '@/components/layout/flexible-layout'
import { ActivitySidebar } from '@/components/layout/sidebars/activity-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ExemploFlexivelPage() {
  return (
    <FlexibleLayout
      rightSidebar={<ActivitySidebar />}
      showRightSidebar={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Exemplo de Layout Flexível
            </h1>
            <p className="text-muted-foreground mt-1">
              Esta página demonstra o uso do layout flexível com sidebar customizável
            </p>
          </div>
          <Badge variant="secondary">Exemplo</Badge>
        </div>

        {/* Cards informativos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Layout Flexível</CardTitle>
              <CardDescription>
                Vantagens de usar o FlexibleLayout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <p className="text-sm">
                  Sidebar direita customizável por página
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <p className="text-sm">
                  Pode ser ocultada quando não necessária
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <p className="text-sm">
                  Componentes de sidebar reutilizáveis
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <p className="text-sm">
                  Fácil de personalizar para cada página
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sidebars Disponíveis</CardTitle>
              <CardDescription>
                Componentes prontos para uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">DocumentsSidebar</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lista e preview de documentos
                </p>
              </div>
              <div className="rounded-lg border p-3 bg-accent">
                <p className="text-sm font-medium">ActivitySidebar</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Atividades recentes da equipe (em uso nesta página)
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">Customizada</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Crie sua própria sidebar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exemplos de código */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
            <CardDescription>
              Exemplos de implementação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">
                1. Com Sidebar de Documentos
              </h3>
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                <pre className="overflow-x-auto">{`import { FlexibleLayout } from '@/components/layout/flexible-layout'
import { DocumentsSidebar } from '@/components/layout/sidebars/documents-sidebar'

export default function Page() {
  return (
    <FlexibleLayout rightSidebar={<DocumentsSidebar />}>
      {/* Seu conteúdo */}
    </FlexibleLayout>
  )
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">
                2. Com Sidebar de Atividades
              </h3>
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                <pre className="overflow-x-auto">{`import { FlexibleLayout } from '@/components/layout/flexible-layout'
import { ActivitySidebar } from '@/components/layout/sidebars/activity-sidebar'

export default function Page() {
  return (
    <FlexibleLayout rightSidebar={<ActivitySidebar />}>
      {/* Seu conteúdo */}
    </FlexibleLayout>
  )
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">
                3. Sem Sidebar Direita
              </h3>
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                <pre className="overflow-x-auto">{`import { FlexibleLayout } from '@/components/layout/flexible-layout'

export default function Page() {
  return (
    <FlexibleLayout showRightSidebar={false}>
      {/* Seu conteúdo ocupa toda a largura */}
    </FlexibleLayout>
  )
}`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-2">
          <Button>Criar Nova Página</Button>
          <Button variant="outline">Ver Documentação</Button>
        </div>
      </div>
    </FlexibleLayout>
  )
}
