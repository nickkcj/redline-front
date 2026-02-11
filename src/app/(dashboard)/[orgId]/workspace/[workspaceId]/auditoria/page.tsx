"use client"

import * as React from "react"
import {
  ShieldCheck,
  CloudArrowUp,
  Trash,
  SpinnerGap,
  CheckCircle,
  Warning,
  Info,
  WarningOctagon,
  FilePdf,
  CaretDown,
  Lightning,
  FileText,
  Eye,
  DownloadSimple,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { BreadcrumbHeader } from "@/components/layout/breadcrumb-header"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"
import {
  useGovernanceDocs,
  useUploadGovernanceDoc,
  useDeleteGovernanceDoc,
  useArtifacts,
  useUploadArtifact,
  useDeleteArtifact,
  useAnalyzeArtifact,
  useAlerts,
  useAlertsSummary,
  useUpdateAlertStatus,
} from "@/hooks/api/use-governance"
import type {
  GovernanceDocumentCategory,
  ProjectArtifactType,
  AlertSeverity,
  AlertStatus,
  AnalyzeResponse,
} from "@/lib/api/types/governance.types"
import { ExportReportButton } from "@/components/features/governance/export-report-button"

// ============================================
// HELPERS
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const CATEGORY_LABELS: Record<GovernanceDocumentCategory, string> = {
  TERMO_ABERTURA: "Termo de Abertura",
  CONTRATO: "Contrato",
  POLITICA_COMPLIANCE: "Compliance",
  NORMA_SEGURANCA: "Segurança",
  OUTRO: "Outro",
}

const ARTIFACT_TYPE_LABELS: Record<ProjectArtifactType, string> = {
  STATUS_REPORT: "Status Report",
  ATA_REUNIAO: "Ata de Reunião",
  EMAIL: "E-mail",
  NOTA_FISCAL: "Nota Fiscal",
  OUTRO: "Outro",
}

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: typeof Warning; color: string; bg: string; label: string }> = {
  CRITICAL: { icon: WarningOctagon, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950", label: "Crítico" },
  WARNING: { icon: Warning, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950", label: "Alerta" },
  INFO: { icon: Info, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950", label: "Info" },
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function AuditoriaPage() {
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const workspaceId = currentWorkspace?.id || ""

  // State
  const [activeTab, setActiveTab] = React.useState("regras")
  const [uploadDocOpen, setUploadDocOpen] = React.useState(false)
  const [uploadArtifactOpen, setUploadArtifactOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<{ id: string; name: string; type: "doc" | "artifact" } | null>(null)
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeResponse | null>(null)
  const [analyzingId, setAnalyzingId] = React.useState<string | null>(null)
  const [selectedArtifactId, setSelectedArtifactId] = React.useState<string | null>(null)

  // Upload doc form state
  const [docFile, setDocFile] = React.useState<File | null>(null)
  const [docTitle, setDocTitle] = React.useState("")
  const [docCategory, setDocCategory] = React.useState<GovernanceDocumentCategory | "">("")
  const [docDescription, setDocDescription] = React.useState("")

  // PDF preview drawer state
  const [previewPdfUrl, setPreviewPdfUrl] = React.useState<string | null>(null)
  const [previewPdfName, setPreviewPdfName] = React.useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false)

  // Upload artifact form state
  const [artifactFile, setArtifactFile] = React.useState<File | null>(null)
  const [artifactTitle, setArtifactTitle] = React.useState("")
  const [artifactType, setArtifactType] = React.useState<ProjectArtifactType | "">("")
  const [artifactSource, setArtifactSource] = React.useState("")

  // Queries
  const { data: govDocsData, isLoading: isLoadingDocs } = useGovernanceDocs(workspaceId, { take: 100 })
  const { data: artifactsData, isLoading: isLoadingArtifacts } = useArtifacts(workspaceId, { take: 100 })
  const { data: alertsData, isLoading: isLoadingAlerts } = useAlerts(workspaceId, { take: 100 })
  const { data: summaryData } = useAlertsSummary(workspaceId)

  // Mutations
  const { mutate: uploadDoc, isPending: isUploadingDoc } = useUploadGovernanceDoc(workspaceId)
  const { mutate: deleteGovernanceDoc, isPending: isDeletingDoc } = useDeleteGovernanceDoc(workspaceId)
  const { mutate: uploadArtifact, isPending: isUploadingArtifact } = useUploadArtifact(workspaceId)
  const { mutate: deleteArtifact, isPending: isDeletingArtifact } = useDeleteArtifact(workspaceId)
  const { mutate: analyzeArtifact, isPending: isAnalyzing } = useAnalyzeArtifact(workspaceId)

  const govDocs = govDocsData?.documents || []
  const artifacts = artifactsData?.artifacts || []
  const alerts = alertsData?.alerts || []
  const summary = summaryData || { critical: 0, warning: 0, info: 0, total: 0 }

  // ============================================
  // HANDLERS
  // ============================================

  const handleUploadDoc = () => {
    if (!docFile || !docTitle || !docCategory) return
    uploadDoc(
      { file: docFile, title: docTitle, category: docCategory as GovernanceDocumentCategory, description: docDescription || undefined },
      {
        onSuccess: () => {
          setUploadDocOpen(false)
          resetDocForm()
        },
      }
    )
  }

  const resetDocForm = () => {
    setDocFile(null)
    setDocTitle("")
    setDocCategory("")
    setDocDescription("")
  }

  const handleUploadArtifact = () => {
    if (!artifactFile || !artifactTitle || !artifactType) return
    uploadArtifact(
      { file: artifactFile, title: artifactTitle, type: artifactType as ProjectArtifactType, source: artifactSource || undefined },
      {
        onSuccess: () => {
          setUploadArtifactOpen(false)
          resetArtifactForm()
        },
      }
    )
  }

  const resetArtifactForm = () => {
    setArtifactFile(null)
    setArtifactTitle("")
    setArtifactType("")
    setArtifactSource("")
  }

  const handleAnalyze = (artifactId: string) => {
    setAnalyzingId(artifactId)
    const governanceDocIds = govDocs.map((d) => d.id)
    analyzeArtifact(
      { artifactId, governanceDocIds: governanceDocIds.length > 0 ? governanceDocIds : undefined },
      {
        onSuccess: (result) => {
          setAnalysisResult(result)
          setAnalyzingId(null)
          setActiveTab("resultados")
        },
        onError: () => {
          setAnalyzingId(null)
        },
      }
    )
  }

  const handleDelete = () => {
    if (!itemToDelete) return
    if (itemToDelete.type === "doc") {
      deleteGovernanceDoc(itemToDelete.id, {
        onSuccess: () => { setDeleteOpen(false); setItemToDelete(null) },
      })
    } else {
      deleteArtifact(itemToDelete.id, {
        onSuccess: () => { setDeleteOpen(false); setItemToDelete(null) },
      })
    }
  }

  // Open PDF preview for governance docs or artifacts
  const openPreview = React.useCallback(async (id: string, title: string, type: "doc" | "artifact") => {
    setIsLoadingPreview(true)
    setPreviewPdfName(title)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''
      const tokenStore = (await import('@/lib/stores/token.store')).tokenStore
      const sessionToken = tokenStore.getSessionToken()

      const endpoint = type === "doc"
        ? `${API_BASE}/governance-docs/${workspaceId}/${id}/file`
        : `${API_BASE}/artifacts/${workspaceId}/${id}/file`

      const res = await fetch(endpoint, {
        headers: {
          'X-API-Key': API_KEY,
          ...(sessionToken ? { 'x-parse-session-token': sessionToken } : {}),
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      setPreviewPdfUrl(blobUrl)
    } catch (err) {
      console.error('[Preview] Failed to load file:', err)
    } finally {
      setIsLoadingPreview(false)
    }
  }, [workspaceId])

  const closePreview = React.useCallback(() => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
    setPreviewPdfUrl(null)
    setPreviewPdfName(null)
  }, [previewPdfUrl])

  const breadcrumbs = [
    { label: currentOrganization?.name || "Organização", href: "/" },
    { label: currentWorkspace?.name || "Workspace" },
    { label: "Auditoria" },
  ]

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="h-full flex flex-col">
      <BreadcrumbHeader breadcrumbs={breadcrumbs} />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ShieldCheck weight="fill" className="h-7 w-7 text-red-500" />
                Auditoria de Governança
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Valide artefatos do projeto contra documentos de governança usando IA
              </p>
            </div>
            <ExportReportButton
              orgName={currentOrganization?.name || "Organização"}
              workspaceName={currentWorkspace?.name || "Workspace"}
              alerts={alerts}
              summary={summary}
              overallScore={analysisResult?.overallScore ?? (summary.critical > 0 ? Math.max(0, 100 - (summary.critical * 15 + summary.warning * 5 + summary.info * 1)) : 100)}
              overallStatus={analysisResult?.overallStatus ?? (summary.critical > 0 ? "BLOQUEADO" : "APROVADO")}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground mb-1">Regras Carregadas</p>
                <p className="text-2xl font-bold">{govDocs.length}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <WarningOctagon weight="fill" className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-xs text-muted-foreground">Críticos</p>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.critical}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-900">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Warning weight="fill" className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Alertas</p>
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.warning}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-900">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Info weight="fill" className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Informativos</p>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.info}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="regras">
                <FileText className="h-4 w-4 mr-1.5" />
                Regras ({govDocs.length})
              </TabsTrigger>
              <TabsTrigger value="artefatos">
                <FilePdf className="h-4 w-4 mr-1.5" />
                Artefatos ({artifacts.length})
              </TabsTrigger>
              <TabsTrigger value="resultados">
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Resultados ({new Set(alerts.map((a) => a.artifact?.id)).size})
              </TabsTrigger>
            </TabsList>

            {/* ============================================ */}
            {/* TAB 1: GOVERNANCE DOCS (REGRAS) */}
            {/* ============================================ */}
            <TabsContent value="regras">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Documentos de Governança</h2>
                    <p className="text-xs text-muted-foreground">Contratos, termos de abertura e políticas que definem as regras</p>
                  </div>
                  <Button size="sm" onClick={() => setUploadDocOpen(true)}>
                    <CloudArrowUp className="h-4 w-4 mr-2" />
                    Enviar Regra
                  </Button>
                </div>

                {isLoadingDocs && (
                  <div className="flex items-center justify-center py-12">
                    <SpinnerGap className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!isLoadingDocs && govDocs.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                      <h3 className="text-sm font-semibold mb-1">Nenhuma regra carregada</h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Envie documentos de governança para começar a auditar
                      </p>
                      <Button size="sm" onClick={() => setUploadDocOpen(true)}>
                        <CloudArrowUp className="h-4 w-4 mr-2" />
                        Enviar Primeiro Documento
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {!isLoadingDocs && govDocs.length > 0 && (
                  <div className="space-y-2">
                    {govDocs.map((doc) => (
                      <Card
                        key={doc.id}
                        className="group cursor-pointer transition-colors hover:bg-muted/30"
                        onClick={() => openPreview(doc.id, doc.title, "doc")}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className="flex-shrink-0">
                            <FileText weight="fill" className="h-8 w-8 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{doc.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="blue" className="text-[10px]">
                                {CATEGORY_LABELS[doc.category] || doc.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(doc.sizeBytes)}
                              </span>
                              {doc.isProcessed ? (
                                <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400">
                                  <CheckCircle weight="fill" className="h-3 w-3" /> Pronto
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                                  <SpinnerGap className="h-3 w-3 animate-spin" /> Processando
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              setItemToDelete({ id: doc.id, name: doc.title, type: "doc" })
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ============================================ */}
            {/* TAB 2: ARTIFACTS */}
            {/* ============================================ */}
            <TabsContent value="artefatos">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Artefatos do Projeto</h2>
                    <p className="text-xs text-muted-foreground">Status reports, atas, e-mails e documentos para auditar</p>
                  </div>
                  <Button size="sm" onClick={() => setUploadArtifactOpen(true)}>
                    <CloudArrowUp className="h-4 w-4 mr-2" />
                    Enviar Artefato
                  </Button>
                </div>

                {isLoadingArtifacts && (
                  <div className="flex items-center justify-center py-12">
                    <SpinnerGap className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!isLoadingArtifacts && artifacts.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <FilePdf className="h-12 w-12 text-muted-foreground/40 mb-3" />
                      <h3 className="text-sm font-semibold mb-1">Nenhum artefato</h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Envie artefatos do projeto para analisar contra as regras
                      </p>
                      <Button size="sm" onClick={() => setUploadArtifactOpen(true)}>
                        <CloudArrowUp className="h-4 w-4 mr-2" />
                        Enviar Primeiro Artefato
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {!isLoadingArtifacts && artifacts.length > 0 && (
                  <div className="space-y-2">
                    {artifacts.map((artifact) => {
                      const isCurrentlyAnalyzing = analyzingId === artifact.id
                      return (
                        <Card key={artifact.id} className="group cursor-pointer transition-colors hover:bg-muted/30" onClick={() => openPreview(artifact.id, artifact.title, "artifact")}>
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex-shrink-0">
                              <FilePdf weight="fill" className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{artifact.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="purple" className="text-[10px]">
                                  {ARTIFACT_TYPE_LABELS[artifact.type] || artifact.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(artifact.sizeBytes)}
                                </span>
                                {artifact.source && (
                                  <span className="text-xs text-muted-foreground">
                                    · {artifact.source}
                                  </span>
                                )}
                                {!artifact.isProcessed && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                                    <SpinnerGap className="h-3 w-3 animate-spin" /> Processando
                                  </span>
                                )}
                                {artifact.isAnalyzed && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400">
                                    <CheckCircle weight="fill" className="h-3 w-3" /> Analisado
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!artifact.isProcessed || isAnalyzing || govDocs.length === 0}
                                onClick={() => handleAnalyze(artifact.id)}
                                className="gap-1.5"
                              >
                                {isCurrentlyAnalyzing ? (
                                  <>
                                    <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
                                    Analisando...
                                  </>
                                ) : (
                                  <>
                                    <Lightning weight="fill" className="h-3.5 w-3.5" />
                                    Analisar
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                onClick={() => {
                                  setItemToDelete({ id: artifact.id, name: artifact.title, type: "artifact" })
                                  setDeleteOpen(true)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {!isLoadingArtifacts && artifacts.length > 0 && govDocs.length === 0 && (
                  <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="py-3 px-4 flex items-center gap-2">
                      <Warning weight="fill" className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Envie documentos de governança na aba &quot;Regras&quot; antes de analisar
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ============================================ */}
            {/* TAB 3: RESULTS (ALERTS) */}
            {/* ============================================ */}
            <TabsContent value="resultados">
              <div className="space-y-3">
                {/* Empty state */}
                {!analysisResult && alerts.length === 0 && !isLoadingAlerts && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mb-3" />
                      <h3 className="text-sm font-semibold mb-1">Nenhum resultado ainda</h3>
                      <p className="text-xs text-muted-foreground">
                        Analise um artefato na aba &quot;Artefatos&quot; para ver os resultados
                      </p>
                    </CardContent>
                  </Card>
                )}

                {isLoadingAlerts && (
                  <div className="flex items-center justify-center py-12">
                    <SpinnerGap className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* One clean card per analyzed artifact */}
                {!isLoadingAlerts && alerts.length > 0 && (() => {
                  // Group alerts by artifact
                  const groups: Record<string, {
                    artifactId: string
                    artifactTitle: string
                    alerts: typeof alerts
                    critical: number
                    warning: number
                    info: number
                    govDocNames: string[]
                  }> = {}

                  for (const alert of alerts) {
                    const key = alert.artifact?.id || "unknown"
                    if (!groups[key]) {
                      groups[key] = {
                        artifactId: key,
                        artifactTitle: alert.artifact?.title || "Artefato",
                        alerts: [],
                        critical: 0,
                        warning: 0,
                        info: 0,
                        govDocNames: [],
                      }
                    }
                    groups[key].alerts.push(alert)
                    if (alert.severity === "CRITICAL") groups[key].critical++
                    else if (alert.severity === "WARNING") groups[key].warning++
                    else groups[key].info++
                    const docName = alert.governanceDoc?.title
                    if (docName && !groups[key].govDocNames.includes(docName)) {
                      groups[key].govDocNames.push(docName)
                    }
                  }

                  return Object.values(groups).map((group) => {
                    const freshResult = analysisResult?.results.find((r) => r.artifactId === group.artifactId)
                    const score = freshResult?.scoreConformidade
                    const status = freshResult?.status ?? (group.critical > 0 ? "BLOQUEADO" : "APROVADO")
                    const isBlocked = status === "BLOQUEADO"
                    const total = group.alerts.length

                    return (
                      <Card
                        key={group.artifactId}
                        className={`cursor-pointer transition-colors hover:bg-muted/30 ${isBlocked ? "border-red-200 dark:border-red-900" : "border-green-200 dark:border-green-900"}`}
                        onClick={() => setSelectedArtifactId(group.artifactId)}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          {/* Score circle */}
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${isBlocked ? "bg-red-100 dark:bg-red-900/50" : "bg-green-100 dark:bg-green-900/50"}`}>
                            <span className={`text-lg font-bold ${isBlocked ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                              {score ?? total}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold truncate">{group.artifactTitle}</p>
                              <Badge
                                className={`text-[10px] ${isBlocked
                                  ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800"
                                  : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"}`}
                                variant="outline"
                              >
                                {status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {group.critical > 0 && <span className="text-red-500">{group.critical} críticas</span>}
                              {group.warning > 0 && <span className="text-amber-500">{group.warning} alertas</span>}
                              {group.info > 0 && <span className="text-blue-500">{group.info} info</span>}
                              <span>· {group.govDocNames.length} {group.govDocNames.length === 1 ? "doc" : "docs"} comparados</span>
                            </div>
                          </div>

                          <CaretDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </CardContent>
                      </Card>
                    )
                  })
                })()}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* ============================================ */}
      {/* UPLOAD GOVERNANCE DOC DIALOG */}
      {/* ============================================ */}
      <Dialog open={uploadDocOpen} onOpenChange={(open) => { if (!open) resetDocForm(); setUploadDocOpen(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Documento de Governança</DialogTitle>
            <DialogDescription>
              Envie contratos, termos de abertura ou políticas de compliance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Arquivo (PDF)</Label>
              <label
                htmlFor="doc-file"
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
                  docFile
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
                }`}
              >
                {docFile ? (
                  <>
                    <FilePdf weight="fill" className="h-8 w-8 text-red-500" />
                    <div className="text-center">
                      <p className="text-sm font-medium truncate max-w-[280px]">{docFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(docFile.size)}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CloudArrowUp className="h-8 w-8 text-muted-foreground/50" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Clique para selecionar</p>
                      <p className="text-xs text-muted-foreground">PDF até 10MB</p>
                    </div>
                  </>
                )}
                <input
                  id="doc-file"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setDocFile(file)
                      if (!docTitle) setDocTitle(file.name.replace(/\.pdf$/i, ""))
                    }
                  }}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-title">Título</Label>
              <Input
                id="doc-title"
                placeholder="Ex: Termo de Abertura - Projeto ATLAS"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={docCategory} onValueChange={(v) => setDocCategory(v as GovernanceDocumentCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TERMO_ABERTURA">Termo de Abertura</SelectItem>
                  <SelectItem value="CONTRATO">Contrato</SelectItem>
                  <SelectItem value="POLITICA_COMPLIANCE">Política de Compliance</SelectItem>
                  <SelectItem value="NORMA_SEGURANCA">Norma de Segurança</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-desc">Descrição (opcional)</Label>
              <Input
                id="doc-desc"
                placeholder="Breve descrição do documento"
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadDocOpen(false); resetDocForm() }}>
              Cancelar
            </Button>
            <Button
              onClick={handleUploadDoc}
              disabled={!docFile || !docTitle || !docCategory || isUploadingDoc}
            >
              {isUploadingDoc ? (
                <>
                  <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CloudArrowUp className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* UPLOAD ARTIFACT DIALOG */}
      {/* ============================================ */}
      <Dialog open={uploadArtifactOpen} onOpenChange={(open) => { if (!open) resetArtifactForm(); setUploadArtifactOpen(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Artefato para Auditoria</DialogTitle>
            <DialogDescription>
              Envie um status report, ata de reunião, e-mail ou outro documento para analisar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Arquivo (PDF)</Label>
              <label
                htmlFor="artifact-file"
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
                  artifactFile
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
                }`}
              >
                {artifactFile ? (
                  <>
                    <FilePdf weight="fill" className="h-8 w-8 text-red-500" />
                    <div className="text-center">
                      <p className="text-sm font-medium truncate max-w-[280px]">{artifactFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(artifactFile.size)}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CloudArrowUp className="h-8 w-8 text-muted-foreground/50" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Clique para selecionar</p>
                      <p className="text-xs text-muted-foreground">PDF até 10MB</p>
                    </div>
                  </>
                )}
                <input
                  id="artifact-file"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setArtifactFile(file)
                      if (!artifactTitle) setArtifactTitle(file.name.replace(/\.pdf$/i, ""))
                    }
                  }}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="artifact-title">Título</Label>
              <Input
                id="artifact-title"
                placeholder="Ex: Status Report - Semana 2"
                value={artifactTitle}
                onChange={(e) => setArtifactTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Artefato</Label>
              <Select value={artifactType} onValueChange={(v) => setArtifactType(v as ProjectArtifactType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STATUS_REPORT">Status Report</SelectItem>
                  <SelectItem value="ATA_REUNIAO">Ata de Reunião</SelectItem>
                  <SelectItem value="EMAIL">E-mail</SelectItem>
                  <SelectItem value="NOTA_FISCAL">Nota Fiscal</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="artifact-source">Fonte (opcional)</Label>
              <Input
                id="artifact-source"
                placeholder="Ex: Fornecedor ABC, Equipe de TI"
                value={artifactSource}
                onChange={(e) => setArtifactSource(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadArtifactOpen(false); resetArtifactForm() }}>
              Cancelar
            </Button>
            <Button
              onClick={handleUploadArtifact}
              disabled={!artifactFile || !artifactTitle || !artifactType || isUploadingArtifact}
            >
              {isUploadingArtifact ? (
                <>
                  <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CloudArrowUp className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* DELETE CONFIRMATION */}
      {/* ============================================ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {itemToDelete?.type === "doc" ? "documento" : "artefato"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{itemToDelete?.name}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeletingDoc || isDeletingArtifact}>
              {isDeletingDoc || isDeletingArtifact ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================ */}
      {/* PDF PREVIEW SHEET */}
      {/* ============================================ */}
      <Sheet open={!!previewPdfUrl} onOpenChange={(open) => { if (!open) closePreview() }}>
        <SheetContent side="right" className="!w-[600px] sm:!max-w-[600px] p-0 !gap-0 overflow-hidden">
          <SheetTitle className="sr-only">{previewPdfName || "Documento"}</SheetTitle>
          <SheetDescription className="sr-only">Pré-visualização do documento</SheetDescription>
          <div className="flex flex-col h-full">
            <div className="shrink-0 px-6 py-3 border-b flex items-center justify-between pr-12">
              <div className="flex items-center gap-2 min-w-0">
                <FilePdf weight="fill" className="h-5 w-5 text-red-500 shrink-0" />
                <h2 className="text-sm font-semibold truncate">{previewPdfName}</h2>
              </div>
              {previewPdfUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs shrink-0"
                  onClick={() => {
                    const a = document.createElement("a")
                    a.href = previewPdfUrl
                    a.download = `${previewPdfName || "documento"}.pdf`
                    a.click()
                  }}
                >
                  <DownloadSimple className="h-3.5 w-3.5" />
                  Download
                </Button>
              )}
            </div>
            <div className="flex-1 min-h-0">
              {previewPdfUrl && (
                <iframe
                  src={`${previewPdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                  className="w-full h-full border-0"
                  title={previewPdfName || "Documento"}
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ============================================ */}
      {/* VIOLATIONS SHEET (right slider) */}
      {/* ============================================ */}
      <ViolationsSheet
        alerts={alerts}
        selectedArtifactId={selectedArtifactId}
        onClose={() => setSelectedArtifactId(null)}
        analysisResult={analysisResult}
        workspaceId={workspaceId}
      />
    </div>
  )
}

// ============================================
// VIOLATIONS PANEL
// ============================================

function ViolationsSheet({
  alerts,
  selectedArtifactId,
  onClose,
  analysisResult,
  workspaceId,
}: {
  alerts: Array<{
    id: string
    severity: string
    status: string
    title: string
    description: string
    artifactExcerpt: string
    ruleExcerpt: string
    ruleReference?: string
    suggestedAction?: string
    resolvedAt?: string
    resolutionNotes?: string
    governanceDocId: string
    artifact: { id: string; title: string; type: string; source?: string }
    governanceDoc: { id: string; title: string; category: string }
  }>
  selectedArtifactId: string | null
  onClose: () => void
  analysisResult: AnalyzeResponse | null
  workspaceId: string
}) {
  const isOpen = selectedArtifactId !== null
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = React.useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("CRITICAL")
  const [resolvingId, setResolvingId] = React.useState<string | null>(null)
  const [resolutionNotes, setResolutionNotes] = React.useState("")
  const [viewingRuleExcerpt, setViewingRuleExcerpt] = React.useState<string | null>(null)
  const [govDocUrl, setGovDocUrl] = React.useState<string | null>(null)
  const [govDocName, setGovDocName] = React.useState<string | null>(null)
  const [isLoadingGovDoc, setIsLoadingGovDoc] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [isBulkResolving, setIsBulkResolving] = React.useState(false)

  const { mutate: updateAlertStatus, mutateAsync: updateAlertStatusAsync, isPending: isUpdating } = useUpdateAlertStatus(workspaceId)

  // Fetch governance doc file via backend proxy (blob URL for iframe)
  const openGovDoc = React.useCallback(async (docId: string, docTitle: string, ruleExcerpt?: string) => {
    setIsLoadingGovDoc(true)
    setViewingRuleExcerpt(ruleExcerpt || null)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''
      const tokenStore = (await import('@/lib/stores/token.store')).tokenStore
      const sessionToken = tokenStore.getSessionToken()

      const res = await fetch(`${API_BASE}/governance-docs/${workspaceId}/${docId}/file`, {
        headers: {
          'X-API-Key': API_KEY,
          ...(sessionToken ? { 'x-parse-session-token': sessionToken } : {}),
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      setGovDocUrl(blobUrl)
      setGovDocName(docTitle)
    } catch (err) {
      console.error('[GovDoc] Failed to load document:', err)
    } finally {
      setIsLoadingGovDoc(false)
    }
  }, [workspaceId])

  const artifactAlerts = React.useMemo(
    () => alerts.filter((a) => a.artifact?.id === selectedArtifactId),
    [alerts, selectedArtifactId]
  )

  const filteredAlerts = React.useMemo(
    () => severityFilter === "ALL" ? artifactAlerts : artifactAlerts.filter((a) => a.severity === severityFilter),
    [artifactAlerts, severityFilter]
  )

  // Reset state when sheet closes
  React.useEffect(() => {
    if (!isOpen) {
      setExpandedId(null)
      setSeverityFilter("CRITICAL")
      setResolvingId(null)
      setResolutionNotes("")
      setViewingRuleExcerpt(null)
      setSelectedIds(new Set())
      setIsBulkResolving(false)
      if (govDocUrl) URL.revokeObjectURL(govDocUrl)
      setGovDocUrl(null)
      setGovDocName(null)
    }
  }, [isOpen])

  const artifactTitle = artifactAlerts[0]?.artifact?.title || "Artefato"
  const freshResult = analysisResult?.results.find((r) => r.artifactId === selectedArtifactId)
  const score = freshResult?.scoreConformidade
  const critical = artifactAlerts.filter((a) => a.severity === "CRITICAL").length
  const warningCount = artifactAlerts.filter((a) => a.severity === "WARNING").length
  const infoCount = artifactAlerts.filter((a) => a.severity === "INFO").length
  const status = freshResult?.status ?? (critical > 0 ? "BLOQUEADO" : "APROVADO")
  const isBlocked = status === "BLOQUEADO"

  // Remediation progress
  const resolvedCount = artifactAlerts.filter((a) => a.status === "RESOLVED" || a.status === "FALSE_POSITIVE").length
  const progressPercent = artifactAlerts.length > 0 ? (resolvedCount / artifactAlerts.length) * 100 : 0

  const handleStatusChange = (alertId: string, newStatus: AlertStatus, notes?: string) => {
    updateAlertStatus(
      { alertId, dto: { status: newStatus, resolutionNotes: notes } },
      {
        onSuccess: () => {
          setResolvingId(null)
          setResolutionNotes("")
        },
      }
    )
  }

  // Bulk selection helpers
  const unresolvedFiltered = filteredAlerts.filter((a) => a.status !== "RESOLVED" && a.status !== "FALSE_POSITIVE")
  const allUnresolvedSelected = unresolvedFiltered.length > 0 && unresolvedFiltered.every((a) => selectedIds.has(a.id))
  const someSelected = selectedIds.size > 0

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allUnresolvedSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(unresolvedFiltered.map((a) => a.id)))
    }
  }

  const handleBulkResolve = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setIsBulkResolving(true)
    try {
      await Promise.all(
        ids.map((id) =>
          updateAlertStatusAsync({ alertId: id, dto: { status: "RESOLVED" as AlertStatus } })
        )
      )
      setSelectedIds(new Set())
    } catch (err) {
      console.error('[BulkResolve] Error:', err)
    } finally {
      setIsBulkResolving(false)
    }
  }

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    OPEN: { label: "Aberto", color: "text-muted-foreground bg-muted" },
    ACKNOWLEDGED: { label: "Reconhecido", color: "text-amber-600 bg-amber-500/10 dark:text-amber-400" },
    RESOLVED: { label: "Resolvido", color: "text-green-600 bg-green-500/10 dark:text-green-400" },
    FALSE_POSITIVE: { label: "Falso Positivo", color: "text-gray-500 bg-gray-500/10" },
  }

  return (
    <>
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="!w-[560px] sm:!max-w-[560px] p-0 !gap-0 overflow-hidden">
        <SheetTitle className="sr-only">{artifactTitle}</SheetTitle>
        <SheetDescription className="sr-only">Resultado da análise</SheetDescription>

        <div className="flex flex-col h-full">
          {/* ---- HEADER ---- */}
          <div className="shrink-0 px-6 pt-6 pb-0 pr-12">
            <h2 className="text-base font-semibold truncate">{artifactTitle}</h2>
          </div>

          {/* ---- REMEDIATION PROGRESS ---- */}
          <div className="shrink-0 px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Remediação: {resolvedCount} de {artifactAlerts.length} resolvidos
              </span>
              <span className="text-[11px] font-semibold">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* ---- FILTER TABS ---- */}
          <div className="border-t shrink-0 px-6 py-3 flex items-center gap-1.5">
            {(
              [
                { value: "CRITICAL", label: "Críticas", count: critical, color: "text-red-500 border-red-500/50 bg-red-500/10" },
                { value: "WARNING", label: "Alertas", count: warningCount, color: "text-amber-500 border-amber-500/50 bg-amber-500/10" },
                { value: "INFO", label: "Info", count: infoCount, color: "text-blue-500 border-blue-500/50 bg-blue-500/10" },
                { value: "ALL", label: "Todas", count: artifactAlerts.length, color: "text-muted-foreground border-border bg-muted/50" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSeverityFilter(tab.value)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors ${
                  severityFilter === tab.value
                    ? tab.color
                    : "text-muted-foreground/60 border-transparent hover:bg-muted/40"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* ---- BULK ACTION BAR ---- */}
          {someSelected && (
            <div className="shrink-0 px-6 py-2 border-t bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allUnresolvedSelected}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-[11px] text-muted-foreground">
                  {selectedIds.size} selecionadas
                </span>
              </div>
              <Button
                size="sm"
                className="h-7 text-[11px] gap-1"
                onClick={handleBulkResolve}
                disabled={isBulkResolving}
              >
                {isBulkResolving ? (
                  <SpinnerGap className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle weight="fill" className="h-3 w-3" />
                )}
                Resolver Selecionadas
              </Button>
            </div>
          )}

          {/* ---- VIOLATIONS LIST ---- */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 pb-6 space-y-1.5">
              {filteredAlerts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">Nenhuma violação nesta categoria</p>
                </div>
              )}
              {filteredAlerts.map((alert, i) => {
                const isExpanded = expandedId === alert.id
                const severityColor =
                  alert.severity === "CRITICAL" ? "bg-red-500" :
                  alert.severity === "WARNING" ? "bg-amber-500" : "bg-blue-500"
                const isResolved = alert.status === "RESOLVED" || alert.status === "FALSE_POSITIVE"
                const statusInfo = STATUS_LABELS[alert.status] || STATUS_LABELS.OPEN
                const isShowingResolveForm = resolvingId === alert.id

                return (
                  <div key={alert.id} className={`rounded-lg border bg-card ${isResolved ? "opacity-60" : ""}`}>
                    {/* Collapsed row */}
                    <div className="w-full text-left px-4 py-3 flex items-start gap-3">
                      {/* Checkbox + Status icon */}
                      <div className="flex items-center gap-2 pt-0.5 shrink-0">
                        {!isResolved && (
                          <Checkbox
                            checked={selectedIds.has(alert.id)}
                            onCheckedChange={() => toggleSelect(alert.id)}
                            className="h-3.5 w-3.5"
                          />
                        )}
                        <span className="text-[11px] font-medium text-muted-foreground w-4 text-right">{i + 1}</span>
                        {isResolved ? (
                          <CheckCircle weight="fill" className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${severityColor}`} />
                        )}
                      </div>

                      <button
                        className="flex-1 min-w-0 text-left cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                      >
                        <p className={`text-[13px] leading-relaxed ${isResolved ? "line-through" : ""}`}>{alert.title || alert.description || "Violação sem descrição"}</p>
                        <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </button>

                      <CaretDown
                        className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 cursor-pointer ${isExpanded ? "rotate-180" : ""}`}
                        onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                      />
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 ml-8 space-y-3 border-t mx-4">
                        <div className="pt-3 space-y-3">
                          {alert.description && alert.description !== alert.title && (
                            <p className="text-xs leading-relaxed text-muted-foreground">{alert.description}</p>
                          )}
                          {alert.artifactExcerpt && (
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground mb-1">Trecho do artefato</p>
                              <div className="text-xs leading-relaxed text-muted-foreground bg-muted/40 rounded-md px-3 py-2 border-l-2 border-border">
                                {alert.artifactExcerpt}
                              </div>
                            </div>
                          )}
                          {alert.ruleExcerpt && (
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground mb-1">Regra violada</p>
                              <div className="text-xs leading-relaxed text-muted-foreground bg-muted/40 rounded-md px-3 py-2 border-l-2 border-border">
                                {alert.ruleExcerpt}
                              </div>
                            </div>
                          )}
                          {alert.suggestedAction && (
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground mb-1">Ação sugerida</p>
                              <p className="text-xs leading-relaxed">{alert.suggestedAction}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground mb-1">Documento</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs">{alert.governanceDoc?.title}</p>
                              {alert.governanceDoc?.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2 gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openGovDoc(alert.governanceDoc.id, alert.governanceDoc.title, alert.ruleExcerpt || undefined)
                                  }}
                                  disabled={isLoadingGovDoc}
                                >
                                  {isLoadingGovDoc ? (
                                    <SpinnerGap className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                  Ver Documento
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Resolution notes if already resolved */}
                          {isResolved && alert.resolutionNotes && (
                            <div>
                              <p className="text-[11px] font-medium text-green-600 dark:text-green-400 mb-1">Notas de resolução</p>
                              <p className="text-xs leading-relaxed text-muted-foreground">{alert.resolutionNotes}</p>
                            </div>
                          )}

                          {/* Action buttons (only if not resolved) */}
                          {!isResolved && !isShowingResolveForm && (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-950"
                                onClick={() => setResolvingId(alert.id)}
                                disabled={isUpdating}
                              >
                                <CheckCircle weight="fill" className="h-3 w-3 mr-1" />
                                Resolver
                              </Button>
                            </div>
                          )}

                          {/* Resolution form */}
                          {(resolvingId === alert.id || resolvingId === alert.id + ":fp") && (
                            <div className="space-y-2 pt-1">
                              <Textarea
                                placeholder="Notas sobre a resolução (opcional)..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                className="text-xs min-h-[60px]"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="h-7 text-[11px]"
                                  onClick={() => {
                                    const targetStatus = resolvingId?.endsWith(":fp") ? "FALSE_POSITIVE" : "RESOLVED"
                                    handleStatusChange(alert.id, targetStatus as AlertStatus, resolutionNotes || undefined)
                                  }}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <SpinnerGap className="h-3 w-3 animate-spin mr-1" />
                                  ) : null}
                                  {resolvingId?.endsWith(":fp") ? "Marcar Falso Positivo" : "Marcar Resolvido"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[11px]"
                                  onClick={() => { setResolvingId(null); setResolutionNotes("") }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>

    {/* Governance Doc Viewer Dialog (iframe-based, no react-pdf) */}
    <Dialog open={!!govDocUrl} onOpenChange={(open) => { if (!open) { if (govDocUrl) URL.revokeObjectURL(govDocUrl); setGovDocUrl(null); setGovDocName(null); setViewingRuleExcerpt(null) } }}>
      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-sm font-semibold truncate">{govDocName}</DialogTitle>
          <DialogDescription className="sr-only">Visualização do documento de governança</DialogDescription>
        </DialogHeader>
        {viewingRuleExcerpt && (
          <div className="shrink-0 border-b bg-yellow-50 dark:bg-yellow-950/30 px-6 py-3">
            <p className="text-[11px] font-medium text-yellow-800 dark:text-yellow-300 mb-0.5">Cláusula violada:</p>
            <p className="text-[11px] text-yellow-700 dark:text-yellow-400 leading-relaxed line-clamp-3">{viewingRuleExcerpt}</p>
          </div>
        )}
        <div className="flex-1 min-h-0">
          {govDocUrl && (
            <iframe
              src={`${govDocUrl}#toolbar=0&navpanes=0&view=FitH`}
              className="w-full h-full border-0"
              title={govDocName || 'Documento'}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
