// ============================================================
// GOVERNANCE TYPES - Alinhado com governance module do backend
// ============================================================

// ========== ENUMS ==========

export type GovernanceDocumentCategory =
  | 'TERMO_ABERTURA'
  | 'CONTRATO'
  | 'POLITICA_COMPLIANCE'
  | 'NORMA_SEGURANCA'
  | 'OUTRO'

export type ProjectArtifactType =
  | 'STATUS_REPORT'
  | 'ATA_REUNIAO'
  | 'EMAIL'
  | 'NOTA_FISCAL'
  | 'OUTRO'

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO'

export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE'

// ========== GOVERNANCE DOCUMENTS ==========

export interface GovernanceDocumentResponse {
  id: string
  title: string
  description?: string
  category: GovernanceDocumentCategory
  workspaceId: string
  userId: string
  contentType: string
  sizeBytes: number
  isProcessed: boolean
  processedAt?: string
  createdAt: string
  updatedAt: string
}

export interface UploadGovernanceDocumentDto {
  file: File
  title: string
  description?: string
  category: GovernanceDocumentCategory
}

export interface ListGovernanceDocumentsResponse {
  documents: GovernanceDocumentResponse[]
  total: number
}

export interface ViewGovernanceDocumentResponse {
  viewUrl: string
  filename: string
  mimeType: string
  expiresAt?: string
}

// ========== PROJECT ARTIFACTS ==========

export interface ProjectArtifactResponse {
  id: string
  title: string
  description?: string
  type: ProjectArtifactType
  source?: string
  workspaceId: string
  userId: string
  contentType: string
  sizeBytes: number
  isProcessed: boolean
  processedAt?: string
  isAnalyzed: boolean
  analyzedAt?: string
  createdAt: string
  updatedAt: string
}

export interface UploadProjectArtifactDto {
  file: File
  title: string
  description?: string
  type: ProjectArtifactType
  source?: string
}

export interface ListProjectArtifactsResponse {
  artifacts: ProjectArtifactResponse[]
  total: number
}

// ========== ANALYSIS ==========

export interface AnalyzeArtifactDto {
  artifactId: string
  governanceDocIds?: string[]
}

export interface ViolationResponse {
  severity: AlertSeverity
  title: string
  description: string
  artifactExcerpt: string
  ruleReference: string
  ruleExcerpt: string
  suggestedAction: string
  governanceDocId: string
}

export interface AnalysisResultResponse {
  artifactId: string
  artifactTitle: string
  violations: ViolationResponse[]
  summary: {
    total: number
    critical: number
    warning: number
    info: number
  }
  alertsCreated: number
  scoreConformidade: number
  status: 'APROVADO' | 'BLOQUEADO'
}

export interface AnalyzeResponse {
  results: AnalysisResultResponse[]
  totalViolations: number
  totalAlertsCreated: number
  overallScore: number
  overallStatus: 'APROVADO' | 'BLOQUEADO'
  analyzedAt: string
}

// ========== ALERTS ==========

export interface AlertResponse {
  id: string
  workspaceId: string
  artifactId: string
  governanceDocId: string
  severity: AlertSeverity
  status: AlertStatus
  title: string
  description: string
  artifactExcerpt: string
  ruleExcerpt: string
  ruleReference?: string
  suggestedAction?: string
  resolvedById?: string
  resolvedAt?: string
  resolutionNotes?: string
  createdAt: string
  updatedAt: string
}

export interface AlertWithRelationsResponse extends AlertResponse {
  artifact: {
    id: string
    title: string
    type: string
    source?: string
  }
  governanceDoc: {
    id: string
    title: string
    category: string
  }
}

export interface ListAlertsResponse {
  alerts: AlertWithRelationsResponse[]
  total: number
  summary: {
    critical: number
    warning: number
    info: number
  }
}

export interface AlertsSummaryResponse {
  critical: number
  warning: number
  info: number
  total: number
}

export interface QueryGovernanceDocsParams {
  category?: GovernanceDocumentCategory
  take?: number
  skip?: number
}

export interface QueryArtifactsParams {
  type?: ProjectArtifactType
  isAnalyzed?: boolean
  take?: number
  skip?: number
}

export interface QueryAlertsParams {
  severity?: AlertSeverity
  status?: AlertStatus
  artifactId?: string
  governanceDocId?: string
  take?: number
  skip?: number
}

export interface UpdateAlertStatusDto {
  status: AlertStatus
  resolutionNotes?: string
}

// ========== GOVERNANCE CHAT ==========

export interface GovernanceChatMessage {
  role: 'user' | 'assistant'
  content: string
}
