"use client"

import { useState } from "react"
import { Calendar } from "@phosphor-icons/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuditLogs } from "@/hooks/api/use-audit-log"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AuditLogsTabProps {
  workspaceId: string
}

export function AuditLogsTab({ workspaceId }: AuditLogsTabProps) {
  const [filters, setFilters] = useState({
    memberId: undefined,
    startDate: undefined,
    endDate: undefined,
  })

  const { data: logsData, isLoading } = useAuditLogs(workspaceId, filters)
  const logs = logsData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-muted-foreground">
            Histórico de ações realizadas no workspace
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por membro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{log.member?.user?.email || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.metadata?.method} {log.metadata?.path}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.metadata?.path?.split('/').pop() || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {log.metadata?.error ? (
                        <span className="text-xs text-destructive">Erro</span>
                      ) : (
                        <span className="text-xs text-green-600">Sucesso</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
