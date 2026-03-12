/**
 * Authentication API Schemas
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
}

export interface SignupResponse {
  success: boolean
  user: User
  token: string
  message: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar?: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

export type UserRole = 
  | 'Super Admin'
  | 'Operations Admin'
  | 'Finance Admin'
  | 'Support Agent'
  | 'Compliance Officer'

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  expiresIn: number
}

export interface LogoutRequest {
  token: string
}

export interface LogoutResponse {
  success: boolean
  message: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}
