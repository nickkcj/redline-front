"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Calendar, User, FileText, Eye, Link2, Upload } from "lucide-react";

const auditLogs = [
  {
    id: "1",
    action: "document_viewed",
    user: "investor@company.com",
    resource: "Relatório Financeiro Q4 2023.pdf",
    room: "Projeto Alpha",
    timestamp: "2024-01-20T14:30:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Documento visualizado via link compartilhado"
  },
  {
    id: "2",
    action: "document_downloaded",
    user: "partner@beta.com",
    resource: "Contrato de Parceria.docx",
    room: "Projeto Beta",
    timestamp: "2024-01-20T13:15:00Z",
    ipAddress: "10.0.0.50",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    details: "Download realizado após autenticação"
  },
  {
    id: "3",
    action: "access_created",
    user: "admin@vaultly.com",
    resource: "Link: Due Diligence - Parceiro Beta",
    room: "Projeto Beta",
    timestamp: "2024-01-20T12:00:00Z",
    ipAddress: "203.0.113.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Novo link de acesso criado com expiração em 30 dias"
  },
  {
    id: "4",
    action: "document_uploaded",
    user: "admin@vaultly.com",
    resource: "Análise de Mercado 2024.xlsx",
    room: "Due Diligence Q1",
    timestamp: "2024-01-20T11:45:00Z",
    ipAddress: "203.0.113.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Novo documento adicionado ao data room"
  },
  {
    id: "5",
    action: "room_accessed",
    user: "reviewer@external.com",
    resource: "Projeto Alpha",
    room: "Projeto Alpha",
    timestamp: "2024-01-20T10:30:00Z",
    ipAddress: "198.51.100.25",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    details: "Acesso via dispositivo móvel"
  },
  {
    id: "6",
    action: "link_shared",
    user: "admin@vaultly.com",
    resource: "Link: Apresentação Executiva",
    room: "Projeto Alpha",
    timestamp: "2024-01-20T09:15:00Z",
    ipAddress: "203.0.113.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Link compartilhado via email"
  }
];

const getActionIcon = (action: string) => {
  switch (action) {
    case "document_viewed":
      return <Eye className="h-4 w-4" />;
    case "document_downloaded":
      return <Download className="h-4 w-4" />;
    case "document_uploaded":
      return <Upload className="h-4 w-4" />;
    case "access_created":
    case "link_shared":
      return <Link2 className="h-4 w-4" />;
    case "room_accessed":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getActionBadge = (action: string) => {
  const variants = {
    'document_viewed': 'default',
    'document_downloaded': 'secondary',
    'document_uploaded': 'default',
    'access_created': 'outline',
    'link_shared': 'outline',
    'room_accessed': 'secondary'
  };

  const labels = {
    'document_viewed': 'Visualização',
    'document_downloaded': 'Download',
    'document_uploaded': 'Upload',
    'access_created': 'Acesso Criado',
    'link_shared': 'Link Compartilhado',
    'room_accessed': 'Acesso ao Room'
  };

  return (
    <Badge variant={variants[action as keyof typeof variants] as any}>
      {labels[action as keyof typeof labels] || action}
    </Badge>
  );
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
};

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Histórico completo de atividades nos seus data rooms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar logs..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-4">
        {auditLogs.map((log) => {
          const { date, time } = formatTimestamp(log.timestamp);

          return (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      {getActionIcon(log.action)}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getActionBadge(log.action)}
                        <span className="text-sm font-medium">{log.resource}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{log.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span>{log.room}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{date} às {time}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {log.details}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>IP: {log.ipAddress}</span>
                        <span className="truncate max-w-xs">
                          User Agent: {log.userAgent.substring(0, 60)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {auditLogs.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Nenhuma atividade registrada</CardTitle>
          <CardDescription className="text-center mb-4">
            As atividades dos seus data rooms aparecerão aqui quando houver interações.
          </CardDescription>
        </Card>
      )}
    </div>
  );
}