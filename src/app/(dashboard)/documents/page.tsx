"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Download, Eye, Calendar, FolderOpen } from "lucide-react";

const documents = [
  {
    id: "1",
    name: "Relatório Financeiro Q4 2023.pdf",
    description: "Relatório financeiro completo do último trimestre",
    size: "2.4 MB",
    type: "PDF",
    room: "Projeto Alpha",
    uploadedAt: "2024-01-15",
    views: 45,
    downloads: 12
  },
  {
    id: "2",
    name: "Contrato de Parceria.docx",
    description: "Minuta do contrato de parceria estratégica",
    size: "156 KB",
    type: "DOCX",
    room: "Projeto Beta",
    uploadedAt: "2024-01-12",
    views: 23,
    downloads: 8
  },
  {
    id: "3",
    name: "Análise de Mercado 2024.xlsx",
    description: "Planilha com análise detalhada do mercado",
    size: "3.1 MB",
    type: "XLSX",
    room: "Due Diligence Q1",
    uploadedAt: "2024-01-08",
    views: 67,
    downloads: 25
  },
  {
    id: "4",
    name: "Apresentação Executiva.pptx",
    description: "Slide deck para apresentação aos investidores",
    size: "8.7 MB",
    type: "PPTX",
    room: "Projeto Alpha",
    uploadedAt: "2024-01-05",
    views: 89,
    downloads: 34
  },
  {
    id: "5",
    name: "Due Diligence Checklist.pdf",
    description: "Lista de verificação para processo de due diligence",
    size: "445 KB",
    type: "PDF",
    room: "Projeto Gamma",
    uploadedAt: "2024-01-03",
    views: 12,
    downloads: 5
  }
];

const getFileIcon = (type: string) => {
  return <FileText className="h-4 w-4" />;
};

const getTypeBadge = (type: string) => {
  const colors = {
    'PDF': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'DOCX': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'XLSX': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'PPTX': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  };

  return (
    <Badge variant="outline" className={colors[type as keyof typeof colors]}>
      {type}
    </Badge>
  );
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            Todos os documentos dos seus data rooms
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Documento
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    {getFileIcon(doc.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium leading-none">{doc.name}</h3>
                      {getTypeBadge(doc.type)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {doc.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        <span>{doc.room}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{doc.views}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="h-3 w-3" />
                      <span>{doc.downloads}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Nenhum documento encontrado</CardTitle>
          <CardDescription className="text-center mb-4">
            Faça upload dos seus primeiros documentos para começar a compartilhar com segurança.
          </CardDescription>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload primeiro documento
          </Button>
        </Card>
      )}
    </div>
  );
}