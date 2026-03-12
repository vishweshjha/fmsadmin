/**
 * Audit & Logging API Schemas
 */

export interface AuditLogListRequest {
  page?: number
  limit?: number
  search?: string
  action?: string
  adminUserId?: string
  entityType?: EntityType
  entityId?: string
  dateFrom?: string
  dateTo?: string
  status?: 'Success' | 'Failed'
  sortBy?: 'timestamp' | 'action' | 'adminUser'
  sortOrder?: 'asc' | 'desc'
}

export interface AuditLogListResponse {
  success: boolean
  data: AuditLog[]
  pagination: Pagination
}

export interface AuditLog {
  id: string
  timestamp: string
  adminUserId: string
  adminUserName: string
  adminUserRole: string
  action: string
  actionType: ActionType
  entityType: EntityType
  entityId: string
  entityName: string
  details: string
  changes?: Record<string, { old: any; new: any }>
  ipAddress: string
  userAgent?: string
  status: 'Success' | 'Failed'
  errorMessage?: string
  sessionId: string
}

export type ActionType = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'APPROVE'
  | 'REJECT'
  | 'BLOCK'
  | 'UNBLOCK'
  | 'SUSPEND'
  | 'ASSIGN'
  | 'REASSIGN'
  | 'CANCEL'
  | 'PROCESS'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'

export type EntityType = 
  | 'User'
  | 'Booking'
  | 'KYC'
  | 'Pricing'
  | 'Payout'
  | 'Settlement'
  | 'Service'
  | 'Provider'
  | 'Vendor'
  | 'System'

export interface AuditLogDetailResponse {
  success: boolean
  data: AuditLog
  relatedLogs: AuditLog[]
}

export interface AuditStatsRequest {
  dateFrom?: string
  dateTo?: string
  adminUserId?: string
  actionType?: ActionType
}

export interface AuditStatsResponse {
  success: boolean
  data: {
    totalLogs: number
    todayActions: number
    activeAdmins: number
    failedActions: number
    actionsByType: Record<ActionType, number>
    actionsByAdmin: Array<{
      adminUserId: string
      adminUserName: string
      actionCount: number
    }>
  }
}

export interface ExportAuditLogsRequest {
  format: 'csv' | 'xlsx' | 'pdf'
  filters?: AuditLogListRequest
}

export interface ExportAuditLogsResponse {
  success: boolean
  downloadUrl: string
  expiresAt: string
}

export interface AuditLogSearchRequest {
  query: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}

export interface AuditLogSearchResponse {
  success: boolean
  data: AuditLog[]
  total: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
