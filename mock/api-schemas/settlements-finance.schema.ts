/**
 * Settlements & Finance API Schemas
 */

export interface ProviderPayoutListRequest {
  page?: number
  limit?: number
  providerId?: string
  status?: PayoutStatus
  periodFrom?: string
  periodTo?: string
  sortBy?: 'dueDate' | 'amount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ProviderPayoutListResponse {
  success: boolean
  data: ProviderPayout[]
  pagination: Pagination
}

export interface ProviderPayout {
  id: string
  providerId: string
  providerName: string
  providerPhone: string
  periodFrom: string
  periodTo: string
  totalEarnings: number
  commission: number
  deductions: number
  payoutAmount: number
  status: PayoutStatus
  dueDate: string
  processedDate?: string
  paymentMethod: string
  accountDetails?: BankAccountDetails
  transactionId?: string
  remarks?: string
  createdAt: string
}

export type PayoutStatus = 'Pending' | 'Processing' | 'Processed' | 'Failed' | 'Cancelled'

export interface BankAccountDetails {
  accountNumber: string
  ifscCode: string
  bankName: string
  accountHolderName: string
}

export interface VendorSettlementListRequest {
  page?: number
  limit?: number
  vendorId?: string
  status?: SettlementStatus
  periodFrom?: string
  periodTo?: string
  sortBy?: 'dueDate' | 'amount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface VendorSettlementListResponse {
  success: boolean
  data: VendorSettlement[]
  pagination: Pagination
}

export interface VendorSettlement {
  id: string
  vendorId: string
  vendorName: string
  vendorPhone: string
  periodFrom: string
  periodTo: string
  totalRevenue: number
  commission: number
  settlementAmount: number
  status: SettlementStatus
  dueDate: string
  processedDate?: string
  paymentMethod: string
  accountDetails?: BankAccountDetails
  transactionId?: string
  remarks?: string
  createdAt: string
}

export type SettlementStatus = 'Pending' | 'Processing' | 'Processed' | 'Failed' | 'Cancelled'

export interface ProcessPayoutRequest {
  payoutIds: string[]
  paymentMethod: string
  remarks?: string
}

export interface ProcessPayoutResponse {
  success: boolean
  message: string
  data: {
    processed: number
    failed: number
    payouts: ProviderPayout[]
  }
}

export interface ProcessSettlementRequest {
  settlementIds: string[]
  paymentMethod: string
  remarks?: string
}

export interface ProcessSettlementResponse {
  success: boolean
  message: string
  data: {
    processed: number
    failed: number
    settlements: VendorSettlement[]
  }
}

export interface PayoutDetailResponse {
  success: boolean
  data: ProviderPayout
  breakdown: PayoutBreakdown[]
  transactions: Transaction[]
}

export interface SettlementDetailResponse {
  success: boolean
  data: VendorSettlement
  breakdown: SettlementBreakdown[]
  transactions: Transaction[]
}

export interface PayoutBreakdown {
  bookingId: string
  serviceName: string
  bookingDate: string
  amount: number
  commission: number
  payout: number
}

export interface SettlementBreakdown {
  bookingId: string
  serviceName: string
  bookingDate: string
  revenue: number
  commission: number
  settlement: number
}

export interface Transaction {
  id: string
  type: 'Credit' | 'Debit'
  amount: number
  description: string
  timestamp: string
  status: 'Success' | 'Pending' | 'Failed'
  referenceId?: string
}

export interface WalletLedgerRequest {
  userId: string
  userType: 'Customer' | 'Provider' | 'Vendor'
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
}

export interface WalletLedgerResponse {
  success: boolean
  data: WalletTransaction[]
  balance: number
  pagination: Pagination
}

export interface WalletTransaction {
  id: string
  type: 'Credit' | 'Debit'
  amount: number
  balance: number
  description: string
  referenceType: 'Booking' | 'Payout' | 'Refund' | 'Topup' | 'Commission'
  referenceId: string
  timestamp: string
  status: 'Success' | 'Pending' | 'Failed'
}

export interface GenerateInvoiceRequest {
  type: 'Provider' | 'Vendor'
  entityId: string
  periodFrom: string
  periodTo: string
  includeBreakdown: boolean
}

export interface GenerateInvoiceResponse {
  success: boolean
  downloadUrl: string
  invoiceNumber: string
  expiresAt: string
}

export interface TaxReportRequest {
  periodFrom: string
  periodTo: string
  format: 'csv' | 'xlsx' | 'pdf'
  includeBreakdown: boolean
}

export interface TaxReportResponse {
  success: boolean
  downloadUrl: string
  expiresAt: string
}

export interface FinancialSummaryResponse {
  success: boolean
  data: {
    totalRevenue: number
    totalPayouts: number
    totalSettlements: number
    netRevenue: number
    pendingPayouts: number
    pendingSettlements: number
    period: {
      from: string
      to: string
    }
  }
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
