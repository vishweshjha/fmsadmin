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
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (requiredRoles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('fms_admin_user')
    const storedToken = localStorage.getItem('fms_admin_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      // Set token in API client
      apiClient.setToken(storedToken)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call real API endpoint
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const responseData = await response.json()

      if (!response.ok || !responseData.success) {
        console.error('Login failed:', responseData.error?.message || 'Unknown error')
        return false
      }

      // Backend wraps the response in a 'data' property
      const data = responseData.data || responseData

      // Map backend role format to frontend format
      const roleMap: Record<string, UserRole> = {
        'SUPER_ADMIN': 'Super Admin',
        'OPERATIONS_ADMIN': 'Operations Admin',
        'FINANCE_ADMIN': 'Finance Admin',
        'SUPPORT_AGENT': 'Support Agent',
        'COMPLIANCE_OFFICER': 'Compliance Officer',
      }

      const mappedUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: roleMap[data.user.role] || data.user.role,
        avatar: data.user.avatar,
      }

      setUser(mappedUser)
      localStorage.setItem('fms_admin_user', JSON.stringify(mappedUser))
      localStorage.setItem('fms_admin_token', data.token)
      
      // Set token in API client
      apiClient.setToken(data.token)
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Map frontend role format to backend format
      const roleMap: Record<UserRole, string> = {
        'Super Admin': 'SUPER_ADMIN',
        'Operations Admin': 'OPERATIONS_ADMIN',
        'Finance Admin': 'FINANCE_ADMIN',
        'Support Agent': 'SUPPORT_AGENT',
        'Compliance Officer': 'COMPLIANCE_OFFICER',
      }

      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'
      const response = await fetch(`${baseURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: roleMap[role],
          phone: '', // Optional field
        }),
      })

      const responseData = await response.json()

      if (!response.ok || !responseData.success) {
        console.error('Signup failed:', responseData.error?.message || 'Unknown error')
        return false
      }

      // Don't automatically log in - user should go to login page
      return true
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fms_admin_user')
    localStorage.removeItem('fms_admin_token')
    
    // Clear token in API client
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
        hasPermission
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
