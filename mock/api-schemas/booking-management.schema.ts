/**
 * Booking Management API Schemas
 */

export interface BookingListRequest {
  page?: number
  limit?: number
  search?: string
  status?: BookingStatus
  customerId?: string
  providerId?: string
  serviceId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'bookingDate' | 'scheduledDate' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

export interface BookingListResponse {
  success: boolean
  data: Booking[]
  pagination: Pagination
}

export interface Booking {
  id: string
  bookingNumber: string
  serviceId: string
  serviceName: string
  serviceCategory: string
  customerId: string
  customerName: string
  customerPhone: string
  providerId?: string
  providerName?: string
  providerPhone?: string
  status: BookingStatus
  bookingDate: string
  scheduledDate: string
  completedDate?: string
  cancelledDate?: string
  amount: number
  paymentStatus: PaymentStatus
  paymentMethod?: string
  location: BookingLocation
  specialInstructions?: string
  cancellationReason?: string
  cancelledBy?: 'Customer' | 'Provider' | 'Admin'
  adminNotes?: string
  rating?: number
  review?: string
  estimatedDuration: string
  actualDuration?: string
}

export type BookingStatus = 
  | 'Pending Assignment'
  | 'Assigned'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Refunded'

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed'

export interface BookingLocation {
  address: string
  city: string
  state: string
  pincode: string
  latitude?: number
  longitude?: number
}

export interface BookingDetailResponse {
  success: boolean
  data: Booking
  timeline: BookingTimelineEvent[]
  paymentDetails?: PaymentDetails
}

export interface BookingTimelineEvent {
  id: string
  event: string
  timestamp: string
  performedBy: string
  notes?: string
}

export interface PaymentDetails {
  transactionId: string
  amount: number
  paymentMethod: string
  paidAt: string
  refundAmount?: number
  refundedAt?: string
  refundReason?: string
}

export interface AssignProviderRequest {
  bookingId: string
  providerId: string
  reason?: string
}

export interface AssignProviderResponse {
  success: boolean
  message: string
  data: Booking
}

export interface ReassignProviderRequest {
  bookingId: string
  newProviderId: string
  reason: string
}

export interface ReassignProviderResponse {
  success: boolean
  message: string
  data: Booking
}

export interface CancelBookingRequest {
  bookingId: string
  reason: string
  reasonCode: CancellationReasonCode
  refundAmount?: number
  refundCustomer: boolean
}

export interface CancelBookingResponse {
  success: boolean
  message: string
  data: Booking
  refundDetails?: RefundDetails
}

export type CancellationReasonCode = 
  | 'CUSTOMER_REQUEST'
  | 'PROVIDER_UNAVAILABLE'
  | 'SERVICE_UNAVAILABLE'
  | 'PAYMENT_FAILED'
  | 'ADMIN_DECISION'
  | 'FRAUD_DETECTED'
  | 'OTHER'

export interface RefundDetails {
  refundId: string
  amount: number
  method: string
  processedAt: string
  status: 'Pending' | 'Processed' | 'Failed'
}

export interface ApplyManualRefundRequest {
  bookingId: string
  amount: number
  reason: string
  refundMethod: string
}

export interface ApplyManualRefundResponse {
  success: boolean
  message: string
  data: Booking
  refundDetails: RefundDetails
}

export interface BookingStatsResponse {
  success: boolean
  data: {
    total: number
    pendingAssignment: number
    inProgress: number
    completed: number
    cancelled: number
    totalRevenue: number
    averageBookingValue: number
  }
}

export interface ExportBookingsRequest {
  format: 'csv' | 'xlsx' | 'pdf'
  filters?: BookingListRequest
}

export interface ExportBookingsResponse {
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
