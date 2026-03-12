/**
 * User Management API Schemas
 */

export interface UserListRequest {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: UserStatus
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin'
  sortOrder?: 'asc' | 'desc'
}

export interface UserListResponse {
  success: boolean
  data: PlatformUser[]
  pagination: Pagination
}

export interface PlatformUser {
  id: string
  name: string
  phone: string
  email: string
  role: 'Customer' | 'Provider' | 'Vendor'
  status: UserStatus
  lastLogin?: string
  registrationDate: string
  totalBookings: number
  totalSpent?: number
  totalEarned?: number
  kycStatus?: 'Pending' | 'Approved' | 'Rejected'
  avatar?: string
  address?: Address
  isVerified: boolean
}

export type UserStatus = 'Active' | 'Blocked' | 'Suspended' | 'Inactive'

export interface Address {
  street: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface UserDetailResponse {
  success: boolean
  data: PlatformUser
  activityHistory: ActivityLog[]
  bookingHistory: BookingSummary[]
}

export interface ActivityLog {
  id: string
  action: string
  timestamp: string
  ipAddress?: string
  device?: string
}

export interface BookingSummary {
  id: string
  serviceName: string
  date: string
  amount: number
  status: string
}

export interface UpdateUserStatusRequest {
  userId: string
  status: UserStatus
  reason?: string
}

export interface UpdateUserStatusResponse {
  success: boolean
  message: string
  data: PlatformUser
}

export interface BlockUserRequest {
  userId: string
  reason: string
  duration?: number // in days, undefined for permanent
}

export interface BlockUserResponse {
  success: boolean
  message: string
  data: PlatformUser
}

export interface UnblockUserRequest {
  userId: string
  reason?: string
}

export interface UnblockUserResponse {
  success: boolean
  message: string
  data: PlatformUser
}

export interface SuspendUserRequest {
  userId: string
  reason: string
  duration: number // in days
}

export interface SuspendUserResponse {
  success: boolean
  message: string
  data: PlatformUser
}

export interface ExportUsersRequest {
  format: 'csv' | 'xlsx' | 'pdf'
  filters?: UserListRequest
}

export interface ExportUsersResponse {
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

export type UserRole = 'Customer' | 'Provider' | 'Vendor'
