"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MagnifyingGlass, Files, Download, Eye, Calendar, Folders, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";

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
  return <Files className="h-4 w-4" />;
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
  const [documentList, setDocumentList] = useState(documents);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; document: typeof documents[0] | null }>({
    open: false,
    document: null,
  });

  const handleDeleteDocument = (doc: typeof documents[0]) => {
    setDeleteDialog({ open: true, document: doc });
  };

  const confirmDelete = () => {
    if (deleteDialog.document) {
      setDocumentList(prev => prev.filter(doc => doc.id !== deleteDialog.document?.id));
      toast.success(`Documento "${deleteDialog.document.name}" excluído com sucesso`);
      setDeleteDialog({ open: false, document: null });
    }
  };

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
          <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-4">
        {documentList.map((doc) => (
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
                        <Folders className="h-3 w-3" />
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc)}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documentList.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <Files className="h-12 w-12 text-muted-foreground mb-4" />
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

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, document: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Você tem certeza que deseja excluir o documento{" "}
                  <strong>"{deleteDialog.document?.name}"</strong>?
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Esta ação não pode ser desfeita. O documento será permanentemente removido
                  do data room <strong className="text-foreground">{deleteDialog.document?.room}</strong>.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Documento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}