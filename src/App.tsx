import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Unauthorized from './pages/Unauthorized'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import KYCVerification from './pages/KYCVerification'
import BookingManagement from './pages/BookingManagement'
import PricingManagement from './pages/PricingManagement'
import SettlementsFinance from './pages/SettlementsFinance'
import AnalyticsReporting from './pages/AnalyticsReporting'
import AuditLogging from './pages/AuditLogging'
import ServiceProviderManagement from './pages/ServiceProviderManagement'
import ServiceManagement from './pages/ServiceManagement'
import { UserRole } from './context/AuthContext'

// Role-based route permissions
const rolePermissions: Record<string, UserRole[]> = {
  '/': ['Super Admin', 'Operations Admin', 'Finance Admin', 'Support Agent', 'Compliance Officer'],
  '/users': ['Super Admin', 'Operations Admin'],
  '/providers': ['Super Admin', 'Operations Admin'],
  '/services': ['Super Admin', 'Operations Admin'],
  '/kyc': ['Super Admin', 'Compliance Officer'],
  '/bookings': ['Super Admin', 'Operations Admin', 'Support Agent'],
  '/pricing': ['Super Admin', 'Finance Admin'],
  '/settlements': ['Super Admin', 'Finance Admin'],
  '/analytics': ['Super Admin', 'Operations Admin', 'Finance Admin'],
  '/audit': ['Super Admin', 'Compliance Officer'],
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/']}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/users']}>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/kyc"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/kyc']}>
            <Layout>
              <KYCVerification />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/bookings']}>
            <Layout>
              <BookingManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/pricing']}>
            <Layout>
              <PricingManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settlements"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/settlements']}>
            <Layout>
              <SettlementsFinance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/analytics']}>
            <Layout>
              <AnalyticsReporting />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/audit']}>
            <Layout>
              <AuditLogging />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/providers"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/providers']}>
            <Layout>
              <ServiceProviderManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/services']}>
            <Layout>
              <ServiceManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
