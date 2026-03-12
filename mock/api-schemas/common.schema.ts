/**
 * Common API Schemas
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
  pagination?: Pagination
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationRequest {
  page?: number
  limit?: number
}

export interface SortRequest {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterRequest {
  search?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: any
}

export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'pdf'
  filters?: Record<string, any>
}

export interface ExportResponse {
  success: boolean
  downloadUrl: string
  expiresAt: string
  fileSize?: number
  fileName?: string
}

export interface FileUploadResponse {
  success: boolean
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

export interface BulkOperationRequest {
  ids: string[]
  action: string
  params?: Record<string, any>
}

export interface BulkOperationResponse {
  success: boolean
  processed: number
  failed: number
  results: Array<{
    id: string
    success: boolean
    message?: string
  }>
}

export interface HealthCheckResponse {
  success: boolean
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: 'up' | 'down'
    cache: 'up' | 'down'
    storage: 'up' | 'down'
    payment: 'up' | 'down'
  }
}

export interface SystemConfig {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  updatedAt: string
  updatedBy: string
}

export interface UpdateSystemConfigRequest {
  key: string
  value: any
}

export interface UpdateSystemConfigResponse {
  success: boolean
  message: string
  data: SystemConfig
}
