// ============================================================
// DOCUMENT TYPES - Alinhado com documents.controller.ts do backend
// ============================================================

export interface DocumentResponseDto {
  id: string
  name: string
  workspaceId: string
  userId: string
  cortexdbRecordId: string
  cortexdbCollection: string
  contentType: string
  sizeBytes: number
  checksum: string
  isProcessed: boolean
  processedAt?: string
  createdAt: string
  updatedAt: string
  description?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UploadDocumentDto {
  file: File
  name: string
  description?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface ListDocumentsParams {
  take?: number
  skip?: number
}

export interface QueryDocumentDto {
  limit?: number
  offset?: number
  tags?: string[]
  contentType?: string
}

/**
 * Response de listagem de documentos
 */
export type DocumentListResponse = DocumentResponseDto[]

// ========== SEARCH DOCUMENTS ==========

/**
 * Query params para buscar documentos
 */
export interface SearchDocumentDto {
  query: string
  limit?: number
  threshold?: number
}

/**
 * Search result item
 */
export interface SearchResultDto {
  document: DocumentResponseDto
  score: number
  highlights?: string[]
}

/**
 * Response de busca de documentos
 */
export interface SearchResponseDto {
  results: SearchResultDto[]
  total: number
  query: string
}

export interface ViewDocumentResponseDto {
  viewUrl: string
  filename: string
  mimeType: string
  expiresAt?: string
}

// ========== DOWNLOAD DOCUMENT ==========

/**
 * GET /documents/download/:documentId/:workspaceId
 * Response com buffer do arquivo (handled by service)
 */
export interface DownloadDocumentResponse {
  buffer: Buffer
  filename: string
  mimeType: string
}
