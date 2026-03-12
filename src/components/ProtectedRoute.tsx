import { Navigate } from 'react-router-dom'
import { useAuth, UserRole } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles && !hasPermission(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
