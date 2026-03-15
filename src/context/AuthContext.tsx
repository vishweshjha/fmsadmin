import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '../services/apiClient'

export type UserRole = 'Super Admin' | 'Operations Admin' | 'Finance Admin' | 'Support Agent' | 'Compliance Officer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (requiredRoles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin auth always goes to the LOCAL fmsadmin backend (not the Gyors GCP backend)
// The local backend has prefix /v1 and runs on port 3000
const LOCAL_ADMIN_API = 'http://localhost:3000/v1'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('fms_admin_user')
    const storedToken = localStorage.getItem('fms_admin_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      apiClient.setToken(storedToken)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${LOCAL_ADMIN_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('Login failed:', responseData.message || responseData.error?.message || 'Unknown error')
        return false
      }

      // Local backend wraps in { success, data: { user, token } } via TransformInterceptor
      const data = responseData.data || responseData
      const token = data.token || data.access_token || data.accessToken

      if (!token) {
        console.error('No token in login response', responseData)
        return false
      }

      const roleMap: Record<string, UserRole> = {
        'SUPER_ADMIN': 'Super Admin',
        'OPERATIONS_ADMIN': 'Operations Admin',
        'FINANCE_ADMIN': 'Finance Admin',
        'SUPPORT_AGENT': 'Support Agent',
        'COMPLIANCE_OFFICER': 'Compliance Officer',
      }

      const rawUser = data.user || data
      const mappedUser: User = {
        id: rawUser.id || '',
        name: rawUser.name || rawUser.email || email,
        email: rawUser.email || email,
        role: roleMap[rawUser.role] || 'Super Admin',
        avatar: rawUser.avatar,
      }

      setUser(mappedUser)
      localStorage.setItem('fms_admin_user', JSON.stringify(mappedUser))
      localStorage.setItem('fms_admin_token', token)
      apiClient.setToken(token)

      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const roleMap: Record<UserRole, string> = {
        'Super Admin': 'SUPER_ADMIN',
        'Operations Admin': 'OPERATIONS_ADMIN',
        'Finance Admin': 'FINANCE_ADMIN',
        'Support Agent': 'SUPPORT_AGENT',
        'Compliance Officer': 'COMPLIANCE_OFFICER',
      }

      const response = await fetch(`${LOCAL_ADMIN_API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: roleMap[role],
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const msg =
          responseData.message ||
          (Array.isArray(responseData.message) ? responseData.message.join(', ') : null) ||
          responseData.error?.message ||
          'Signup failed'
        console.error('Signup failed:', msg)
        return { success: false, message: msg }
      }

      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Network error — is the local backend running?' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fms_admin_user')
    localStorage.removeItem('fms_admin_token')
    apiClient.clearToken()
  }

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false
    return requiredRoles.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
