'use client'

import * as React from 'react'
import {
  FileText,
  ShieldCheck,
  Warning,
  ChatCircle,
  Gauge,
  ListChecks,
  CalendarBlank,
  WarningOctagon,
  Info,
  ChartPie,
  TrendUp,
} from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace-store'
import { useDocuments } from '@/hooks/api/use-documents'
import { useChats } from '@/hooks/api/use-chat'
import { useCurrentWorkspace } from '@/lib/stores/app.store'
import {
  useAlerts,
  useAlertsSummary,
  useGovernanceDocs,
  useArtifacts,
} from '@/hooks/api/use-governance'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { AlertSeverity, AlertStatus } from '@/lib/api/types/governance.types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  CRITICAL: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
}

const STATUS_COLORS: Record<AlertStatus, string> = {
  OPEN: '#94a3b8',
  ACKNOWLEDGED: '#f59e0b',
  RESOLVED: '#22c55e',
  FALSE_POSITIVE: '#6b7280',
}

const STATUS_LABELS: Record<AlertStatus, string> = {
  OPEN: 'Aberto',
  ACKNOWLEDGED: 'Reconhecido',
  RESOLVED: 'Resolvido',
  FALSE_POSITIVE: 'Falso Positivo',
}

export function HomeView() {
  const { addTabInNewWindow } = useWorkspaceStore()
  const currentWorkspace = useCurrentWorkspace()
  const workspaceId = currentWorkspace?.id || ''

  const currentHour = new Date().getHours()
  let greeting = 'Bom dia'
  if (currentHour >= 12) greeting = 'Boa tarde'
  if (currentHour >= 18) greeting = 'Boa noite'

  // Real API data
  const { data: documents, isLoading: isLoadingDocs } = useDocuments(workspaceId)
  const { data: chatsData, isLoading: isLoadingChats } = useChats(workspaceId)

  // Governance data
  const { data: alertsData } = useAlerts(workspaceId, { take: 100 })
  const { data: summaryData } = useAlertsSummary(workspaceId)
  const { data: govDocsData } = useGovernanceDocs(workspaceId, { take: 100 })
  const { data: artifactsData } = useArtifacts(workspaceId, { take: 100 })

  const alerts = alertsData?.alerts || []
  const summary = summaryData || { critical: 0, warning: 0, info: 0, total: 0 }
  const totalGovDocs = govDocsData?.documents?.length || 0
  const totalArtifacts = artifactsData?.artifacts?.length || 0

  const isLoading = isLoadingDocs || isLoadingChats

  // Metrics from real data
  const totalDocuments = documents?.length || 0
  const processedDocuments = documents?.filter(d => d.isProcessed).length || 0
  const pendingDocuments = documents?.filter(d => !d.isProcessed).length || 0
  const totalChats = chatsData?.total || 0

  // Governance computed
  const statusCounts: Record<AlertStatus, number> = { OPEN: 0, ACKNOWLEDGED: 0, RESOLVED: 0, FALSE_POSITIVE: 0 }
  for (const alert of alerts) {
    const s = alert.status as AlertStatus
    if (statusCounts[s] !== undefined) statusCounts[s]++
  }
  const resolvedCount = statusCounts.RESOLVED + statusCounts.FALSE_POSITIVE
  const resolvedPercent = alerts.length > 0 ? Math.round((resolvedCount / alerts.length) * 100) : 0
  const complianceScore = alerts.length > 0 ? Math.max(0, 100 - (summary.critical * 15 + summary.warning * 5 + summary.info * 1)) : null
  const isBlocked = summary.critical > 0

  const severityData = [
    { name: 'Críticas', value: summary.critical, color: SEVERITY_COLORS.CRITICAL },
    { name: 'Alertas', value: summary.warning, color: SEVERITY_COLORS.WARNING },
    { name: 'Info', value: summary.info, color: SEVERITY_COLORS.INFO },
  ].filter((d) => d.value > 0)

  const remediationData = (Object.keys(statusCounts) as AlertStatus[])
    .map((key) => ({ name: STATUS_LABELS[key], value: statusCounts[key], color: STATUS_COLORS[key] }))
    .filter((d) => d.value > 0)

  const artifactGroups: Record<string, { name: string; critical: number; warning: number; info: number }> = {}
  for (const alert of alerts) {
    const key = alert.artifact?.id || 'unknown'
    if (!artifactGroups[key]) {
      const title = alert.artifact?.title || 'Artefato'
      artifactGroups[key] = { name: title.length > 20 ? title.slice(0, 18) + '...' : title, critical: 0, warning: 0, info: 0 }
    }
    if (alert.severity === 'CRITICAL') artifactGroups[key].critical++
    else if (alert.severity === 'WARNING') artifactGroups[key].warning++
    else artifactGroups[key].info++
  }
  const barData = Object.values(artifactGroups)

  const conformidade = totalDocuments > 0
    ? Math.round((processedDocuments / totalDocuments) * 100)
    : 0

  const metrics = [
    { label: 'Conformidade', value: totalDocuments > 0 ? String(conformidade) : '--', suffix: '%', icon: Gauge, color: 'text-green-400', iconBg: 'bg-green-500/10' },
    { label: 'Documentos ativos', value: totalDocuments > 0 ? String(totalDocuments) : '--', suffix: '', icon: FileText, color: 'text-red-400', iconBg: 'bg-red-500/10' },
    { label: 'Pendentes', value: totalDocuments > 0 ? String(pendingDocuments) : '--', suffix: '', icon: ListChecks, color: 'text-yellow-400', iconBg: 'bg-yellow-500/10' },
    { label: 'Conversas', value: totalChats > 0 ? String(totalChats) : '--', suffix: '', icon: ChatCircle, color: 'text-orange-400', iconBg: 'bg-orange-500/10' },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col h-full max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
            <p className="text-sm text-muted-foreground">
              Painel de governança e compliance — <span className="text-red-500 font-medium">RedLine</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <CalendarBlank className="h-3.5 w-3.5" />
              Hoje
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <Card key={i} className="border border-border/50 shadow-sm">
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">{metric.label}</span>
                      <div className={cn("p-1.5 rounded-md", metric.iconBg)}>
                        <metric.icon className={cn("h-3.5 w-3.5", metric.color)} weight="fill" />
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold tracking-tight">{metric.value}</span>
                      {metric.suffix && <span className="text-sm text-muted-foreground mb-0.5">{metric.suffix}</span>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ============================================ */}
        {/* GOVERNANCE DASHBOARD */}
        {/* ============================================ */}
        {(alerts.length > 0 || totalGovDocs > 0) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck weight="fill" className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Governança & Compliance</span>
            </div>

            {/* Score + Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Compliance Score */}
              <Card className={`${isBlocked ? 'border-red-200 dark:border-red-900' : alerts.length > 0 ? 'border-green-200 dark:border-green-900' : 'border-border/50'}`}>
                <CardContent className="flex flex-col items-center justify-center py-5">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isBlocked ? 'bg-red-100 dark:bg-red-900/50' : alerts.length > 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted'}`}>
                    <span className={`text-2xl font-bold ${isBlocked ? 'text-red-600 dark:text-red-400' : alerts.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                      {complianceScore ?? '--'}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium mt-2 text-muted-foreground">Score Compliance</p>
                  {alerts.length > 0 && (
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded ${isBlocked
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {isBlocked ? 'BLOQUEADO' : 'APROVADO'}
                    </span>
                  )}
                </CardContent>
              </Card>

              {/* Gov Docs */}
              <Card className="border-border/50">
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck weight="fill" className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[10px] font-medium text-muted-foreground">Regras</span>
                  </div>
                  <p className="text-2xl font-bold">{totalGovDocs}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">documentos carregados</p>
                </CardContent>
              </Card>

              {/* Artifacts Analyzed */}
              <Card className="border-border/50">
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartPie weight="fill" className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-[10px] font-medium text-muted-foreground">Analisados</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {new Set(alerts.map((a) => a.artifact?.id)).size}
                    <span className="text-sm font-normal text-muted-foreground"> / {totalArtifacts}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">artefatos auditados</p>
                </CardContent>
              </Card>

              {/* Remediation */}
              <Card className="border-border/50">
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendUp weight="fill" className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[10px] font-medium text-muted-foreground">Remediação</span>
                  </div>
                  <p className="text-2xl font-bold">{resolvedPercent}%</p>
                  <Progress value={resolvedPercent} className="h-1.5 mt-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{resolvedCount} de {alerts.length} resolvidos</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts (only when alerts exist) */}
            {alerts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Severity Pie */}
                <Card className="border-border/50">
                  <CardContent className="py-4">
                    <h3 className="text-sm font-semibold mb-1">Violações por Severidade</h3>
                    <p className="text-[10px] text-muted-foreground mb-3">{summary.total} violações encontradas</p>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={severityData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                            {severityData.map((entry, index) => (
                              <Cell key={`sev-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `${value} violações`}
                            contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span className="text-[10px]">{value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Remediation Donut */}
                <Card className="border-border/50">
                  <CardContent className="py-4">
                    <h3 className="text-sm font-semibold mb-1">Progresso de Remediação</h3>
                    <p className="text-[10px] text-muted-foreground mb-3">{resolvedPercent}% resolvido</p>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={remediationData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                            {remediationData.map((entry, index) => (
                              <Cell key={`rem-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `${value} alertas`}
                            contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span className="text-[10px]">{value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* By-Artifact Bar */}
                <Card className="border-border/50">
                  <CardContent className="py-4">
                    <h3 className="text-sm font-semibold mb-1">Violações por Artefato</h3>
                    <p className="text-[10px] text-muted-foreground mb-3">{barData.length} artefatos analisados</p>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                          <Bar dataKey="critical" stackId="a" fill={SEVERITY_COLORS.CRITICAL} name="Críticas" />
                          <Bar dataKey="warning" stackId="a" fill={SEVERITY_COLORS.WARNING} name="Alertas" />
                          <Bar dataKey="info" stackId="a" fill={SEVERITY_COLORS.INFO} name="Info" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Severity Breakdown Cards */}
            {alerts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {([
                  { severity: 'CRITICAL' as AlertSeverity, icon: WarningOctagon, label: 'Críticas', color: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-900', bg: 'bg-red-50 dark:bg-red-950' },
                  { severity: 'WARNING' as AlertSeverity, icon: Warning, label: 'Alertas', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900', bg: 'bg-amber-50 dark:bg-amber-950' },
                  { severity: 'INFO' as AlertSeverity, icon: Info, label: 'Informativas', color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900', bg: 'bg-blue-50 dark:bg-blue-950' },
                ]).map(({ severity, icon: Icon, label, color, border, bg }) => {
                  const count = severity === 'CRITICAL' ? summary.critical : severity === 'WARNING' ? summary.warning : summary.info
                  const resolved = alerts.filter((a) => a.severity === severity && (a.status === 'RESOLVED' || a.status === 'FALSE_POSITIVE')).length
                  const pct = count > 0 ? Math.round((resolved / count) * 100) : 0
                  return (
                    <Card key={severity} className={border}>
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${bg}`}>
                              <Icon weight="fill" className={`h-3.5 w-3.5 ${color}`} />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${color}`}>{count}</p>
                              <p className="text-[10px] text-muted-foreground">{label}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{pct}%</p>
                            <p className="text-[10px] text-muted-foreground">resolvido</p>
                          </div>
                        </div>
                        <Progress value={pct} className="h-1" />
                        <p className="text-[10px] text-muted-foreground mt-1">{resolved} de {count} resolvidas</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </ScrollArea>
  )
}
