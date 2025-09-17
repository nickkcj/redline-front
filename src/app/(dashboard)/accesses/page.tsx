import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Link2, Eye, Calendar, Users, Copy, Settings, Trash2 } from "lucide-react";

const accesses = [
  {
    id: "1",
    name: "Acesso Investidor A",
    description: "Link para documentos financeiros Q4",
    url: "https://vaultly.app/share/abc123",
    room: "Projeto Alpha",
    createdAt: "2024-01-15",
    expiresAt: "2024-02-15",
    views: 23,
    uniqueUsers: 5,
    status: "active",
    accessCount: 45
  },
  {
    id: "2",
    name: "Due Diligence - Parceiro Beta",
    description: "Documentação técnica para análise",
    url: "https://vaultly.app/share/def456",
    room: "Projeto Beta",
    createdAt: "2024-01-12",
    expiresAt: "2024-01-25",
    views: 12,
    uniqueUsers: 3,
    status: "expiring",
    accessCount: 18
  },
  {
    id: "3",
    name: "Apresentação Executiva",
    description: "Slide deck para board meeting",
    url: "https://vaultly.app/share/ghi789",
    room: "Projeto Alpha",
    createdAt: "2024-01-08",
    expiresAt: "2024-01-20",
    views: 67,
    uniqueUsers: 12,
    status: "expired",
    accessCount: 89
  },
  {
    id: "4",
    name: "Documentos Legais",
    description: "Contratos e termos legais",
    url: "https://vaultly.app/share/jkl012",
    room: "Due Diligence Q1",
    createdAt: "2024-01-05",
    expiresAt: null,
    views: 156,
    uniqueUsers: 34,
    status: "active",
    accessCount: 234
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="default">Ativo</Badge>;
    case "expiring":
      return <Badge variant="destructive">Expirando</Badge>;
    case "expired":
      return <Badge variant="secondary">Expirado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const copyToClipboard = (url: string) => {
  navigator.clipboard.writeText(url);
};

export default function AccessesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Links Compartilhados</h1>
          <p className="text-muted-foreground">
            Gerencie links de acesso aos seus data rooms
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Link
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar links..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-4">
        {accesses.map((access) => (
          <Card key={access.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium leading-none">{access.name}</h3>
                        {getStatusBadge(access.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {access.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{access.views} visualizações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{access.uniqueUsers} usuários únicos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Criado: {new Date(access.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Expira: {access.expiresAt
                          ? new Date(access.expiresAt).toLocaleDateString('pt-BR')
                          : 'Nunca'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <code className="text-sm flex-1 truncate">{access.url}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(access.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accesses.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Nenhum link compartilhado</CardTitle>
          <CardDescription className="text-center mb-4">
            Crie seu primeiro link para compartilhar documentos de forma segura com terceiros.
          </CardDescription>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar primeiro link
          </Button>
        </Card>
      )}
    </div>
  );
}