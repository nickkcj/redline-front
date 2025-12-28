// ============================================================
// DOCUMENT TYPES - Alinhado com documents.controller.ts do backend
// ============================================================

// ========== DOCUMENT RESPONSE ==========

export interface DocumentResponseDto {
  id: string
  name: string
  workspaceId: string
  userId: string
  cortexdbRecordId: string
  cortexdbCollection: string
  contentType: string
  sizeBytes: number
  checksum?: string
  isProcessed: boolean
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ========== UPLOAD DOCUMENT ==========

/**
 * POST /documents/upload/:workspaceId
 * Request para upload de documento (FormData)
 */
export interface UploadDocumentDto {
  name: string
  description?: string
  tags?: string[]
  metadata?: Record<string, any>
}

/**
 * FormData para upload (usado no service)
 */
export interface UploadDocumentFormData extends UploadDocumentDto {
  file: File
}

// ========== QUERY DOCUMENTS ==========

/**
 * GET /documents/list/:workspaceId
 * Query params para listar documentos
 */
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

// ========== VIEW DOCUMENT ==========

/**
 * GET /documents/view/:documentId/:workspaceId
 * Response com URL presigned para visualizar documento
 */
export interface ViewDocumentResponseDto {
  url: string
  expiresIn: number
  documentId: string
  contentType: string
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
