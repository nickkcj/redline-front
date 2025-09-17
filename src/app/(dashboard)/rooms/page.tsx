"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FolderOpen, FileText, Users, Calendar } from "lucide-react";

const dataRooms = [
  {
    id: "1",
    name: "Projeto Alpha",
    description: "Due diligence para aquisição da empresa Alpha",
    documentsCount: 23,
    accessesCount: 156,
    status: "active",
    createdAt: "2024-01-15",
    lastActivity: "2 horas atrás"
  },
  {
    id: "2",
    name: "Projeto Beta",
    description: "Documentação técnica e financeira para fusão",
    documentsCount: 18,
    accessesCount: 89,
    status: "active",
    createdAt: "2024-01-10",
    lastActivity: "1 dia atrás"
  },
  {
    id: "3",
    name: "Due Diligence Q1",
    description: "Revisão trimestral de conformidade",
    documentsCount: 41,
    accessesCount: 234,
    status: "archived",
    createdAt: "2023-12-01",
    lastActivity: "2 semanas atrás"
  },
  {
    id: "4",
    name: "Projeto Gamma",
    description: "Avaliação de parceria estratégica",
    documentsCount: 12,
    accessesCount: 67,
    status: "draft",
    createdAt: "2024-01-20",
    lastActivity: "3 dias atrás"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="default">Ativo</Badge>;
    case "archived":
      return <Badge variant="secondary">Arquivado</Badge>;
    case "draft":
      return <Badge variant="outline">Rascunho</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Rooms</h1>
          <p className="text-muted-foreground">
            Gerencie seus data rooms e documentos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Data Room
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar data rooms..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dataRooms.map((room) => (
          <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  {room.name}
                </CardTitle>
                {getStatusBadge(room.status)}
              </div>
              <CardDescription>{room.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{room.documentsCount} documentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{room.accessesCount} acessos</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Criado em {new Date(room.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <span>Última atividade: {room.lastActivity}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dataRooms.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Nenhum Data Room encontrado</CardTitle>
          <CardDescription className="text-center mb-4">
            Comece criando seu primeiro data room para organizar e compartilhar documentos de forma segura.
          </CardDescription>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar primeiro Data Room
          </Button>
        </Card>
      )}
    </div>
  );
}