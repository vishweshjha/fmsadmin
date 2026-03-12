/**
 * KYC & Verification API Schemas
 */

export interface KYCListRequest {
  page?: number
  limit?: number
  search?: string
  status?: KYCStatus
  verificationLevel?: VerificationLevel
  sortBy?: 'uploadedDate' | 'reviewedDate' | 'providerName'
  sortOrder?: 'asc' | 'desc'
}

export interface KYCListResponse {
  success: boolean
  data: KYCApplication[]
  pagination: Pagination
}

export interface KYCApplication {
  id: string
  providerId: string
  providerName: string
  phone: string
  email: string
  documentType: DocumentType
  documents: KYCDocument[]
  uploadedDate: string
  reviewedDate?: string
  status: KYCStatus
  verificationLevel: VerificationLevel
  reviewerId?: string
  reviewerName?: string
  remarks?: string
  rejectionReason?: string
}

export type DocumentType = 
  | 'Aadhaar Card'
  | 'PAN Card'
  | 'Driving License'
  | 'Voter ID'
  | 'Passport'
  | 'Bank Statement'
  | 'Address Proof'

export interface KYCDocument {
  id: string
  type: DocumentType
  frontImageUrl: string
  backImageUrl?: string
  uploadedAt: string
  fileSize: number
  mimeType: string
}

export type KYCStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review'

export type VerificationLevel = 'Level 1' | 'Level 2' | 'Level 3'

export interface KYCDetailResponse {
  success: boolean
  data: KYCApplication
  history: KYCReviewHistory[]
}

export interface KYCReviewHistory {
  id: string
  action: 'Submitted' | 'Reviewed' | 'Approved' | 'Rejected' | 'Re-verification Requested'
  reviewerId: string
  reviewerName: string
  timestamp: string
  remarks?: string
}

export interface ReviewKYCRequest {
  kycId: string
  action: 'Approve' | 'Reject'
  remarks: string
  verificationLevel?: VerificationLevel
}

export interface ReviewKYCResponse {
  success: boolean
  message: string
  data: KYCApplication
}

export interface RequestReVerificationRequest {
  kycId: string
  reason: string
  requiredDocuments: DocumentType[]
}

export interface RequestReVerificationResponse {
  success: boolean
  message: string
  data: KYCApplication
}

export interface KYCStatsResponse {
  success: boolean
  data: {
    pending: number
    approved: number
    rejected: number
    total: number
    pendingByLevel: Record<VerificationLevel, number>
  }
}

export interface ExportKYCAuditRequest {
  format: 'csv' | 'xlsx' | 'pdf'
  filters?: KYCListRequest
}

export interface ExportKYCAuditResponse {
  success: boolean
  downloadUrl: string
  expiresAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
