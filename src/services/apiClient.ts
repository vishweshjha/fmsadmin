/**
 * API Client Service
 * Handles all API requests with authentication and error handling
 */

import API_ENDPOINTS from '../../mock/api-endpoints'
import { ApiResponse, ApiError } from '../../mock/api-schemas/common.schema'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    // Vite uses import.meta.env instead of process.env
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'
    this.loadToken()
  }

  private loadToken() {
    // Load token from localStorage
    this.token = localStorage.getItem('fms_admin_token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('fms_admin_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('fms_admin_token')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json()

    if (!response.ok) {
      const error: ApiError = {
        code: data.error?.code || 'UNKNOWN_ERROR',
        message: data.error?.message || 'An error occurred',
        details: data.error?.details,
        timestamp: new Date().toISOString(),
      }

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        this.clearToken()
        window.location.href = '/login'
      }

      return {
        success: false,
        error,
      }
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
      pagination: data.pagination,
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      let fullUrl = url
      if (params) {
        const queryString = new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value)
            }
            return acc
          }, {} as Record<string, string>)
        ).toString()
        if (queryString) {
          fullUrl += `?${queryString}`
        }
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
          timestamp: new Date().toISOString(),
        },
      }
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient
