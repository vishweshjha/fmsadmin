/**
 * API Client Service
 * Handles all API requests to the Gyors backend with authentication and error handling
 */

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://gyors-backend-311476989793.us-central1.run.app/api'
    this.loadToken()
  }

  private loadToken() {
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

  getBaseURL(): string {
    return this.baseURL
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

  private getFullUrl(url: string): string {
    if (url.startsWith('http')) return url
    const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
    const path = url.startsWith('/') ? url : `/${url}`
    return `${base}${path}`
  }

  private async handleResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: any; pagination?: any; message?: string }> {
    let data: any
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = {}
    }

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        this.clearToken()
        window.location.href = '/login'
      }

      return {
        success: false,
        error: {
          code: data.error?.code || data.statusCode || 'API_ERROR',
          message: data.message || data.error?.message || `Request failed with status ${response.status}`,
          details: data.error?.details,
          timestamp: new Date().toISOString(),
        },
      }
    }

    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
      message: data.message,
      pagination: data.pagination || data.meta,
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<{ success: boolean; data?: T; error?: any; pagination?: any }> {
    try {
      let fullUrl = this.getFullUrl(url)
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

  async post<T>(url: string, data?: any): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const response = await fetch(this.getFullUrl(url), {
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

  async patch<T>(url: string, data?: any): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const response = await fetch(this.getFullUrl(url), {
        method: 'PATCH',
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

  async put<T>(url: string, data?: any): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const response = await fetch(this.getFullUrl(url), {
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

  async delete<T>(url: string): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const response = await fetch(this.getFullUrl(url), {
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
