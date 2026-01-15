'use client'

import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, FileText, Download, Share2, MoreVertical } from 'lucide-react'
import Link from 'next/link'

const documentos = [
  {
    id: 1,
    nome: 'Proposta Comercial Q1 2024',
    tipo: 'PDF',
    tamanho: '2.4 MB',
    modificado: 'Há 2 horas',
    compartilhado: true,
  },
  {
    id: 2,
    nome: 'Contrato Fornecedor ABC',
    tipo: 'DOCX',
    tamanho: '1.2 MB',
    modificado: 'Há 1 dia',
    compartilhado: false,
  },
  {
    id: 3,
    nome: 'Relatório Financeiro Anual',
    tipo: 'PDF',
    tamanho: '5.8 MB',
    modificado: 'Há 3 dias',
    compartilhado: true,
  },
  {
    id: 4,
    nome: 'Apresentação Projeto X',
    tipo: 'PPTX',
    tamanho: '12.3 MB',
    modificado: 'Há 5 dias',
    compartilhado: false,
  },
  {
    id: 5,
    nome: 'Especificações Técnicas v2',
    tipo: 'PDF',
    tamanho: '3.1 MB',
    modificado: 'Há 1 semana',
    compartilhado: true,
  },
  {
    id: 6,
    nome: 'Manual do Usuário',
    tipo: 'DOCX',
    tamanho: '4.5 MB',
    modificado: 'Há 2 semanas',
    compartilhado: false,
  },
]

const getFileIcon = (tipo: string) => {
  return <FileText className="h-5 w-5 text-muted-foreground" />
}

const getFileColor = (tipo: string) => {
  switch (tipo) {
    case 'PDF':
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    case 'DOCX':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
    case 'PPTX':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

export default function DocumentosPage() {
  return (
    <ThreeColumnLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
            <p className="text-muted-foreground mt-1">
              Acesse e gerencie todos os seus documentos
            </p>
          </div>
          <Link href="/documentos/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Documento
            </Button>
          </Link>
        </div>

        {/* Barra de Pesquisa */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar documentos..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtros</Button>
          <Button variant="outline">Ordenar</Button>
        </div>

        {/* Lista de Documentos */}
        <div className="space-y-2">
          {documentos.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Ícone e Tipo */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getFileColor(doc.tipo)}`}>
                    {getFileIcon(doc.tipo)}
                  </div>

                  {/* Informações do Documento */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{doc.nome}</h3>
                      {doc.compartilhado && (
                        <Badge variant="secondary" className="text-xs">
                          Compartilhado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{doc.tipo}</span>
                      <span>•</span>
                      <span>{doc.tamanho}</span>
                      <span>•</span>
                      <span>{doc.modificado}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-4 w-4" />
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
