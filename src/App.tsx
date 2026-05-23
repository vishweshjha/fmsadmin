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
import CouponManagement from './pages/CouponManagement'
import ShiftConfiguration from './pages/ShiftConfiguration'
import ShiftAssignmentManagement from './pages/ShiftAssignmentManagement'
import AttendanceManagement from './pages/AttendanceManagement'
import { UserRole } from './context/AuthContext'

// Role-based route permissions
const rolePermissions: Record<string, UserRole[]> = {
  '/': ['Super Admin', 'Operations Admin', 'Finance Admin', 'Support Agent', 'Compliance Officer'],
  '/users': ['Super Admin', 'Operations Admin', 'Admin'],
  '/providers': ['Super Admin', 'Operations Admin', 'Admin'],
  '/services': ['Super Admin', 'Operations Admin', 'Admin'],
  '/kyc': ['Super Admin', 'Compliance Officer'],
  '/bookings': ['Super Admin', 'Operations Admin', 'Support Agent'],
  '/pricing': ['Super Admin', 'Finance Admin'],
  '/settlements': ['Super Admin', 'Finance Admin'],
  '/analytics': ['Super Admin', 'Operations Admin', 'Finance Admin'],
  '/coupons': ['Super Admin', 'Operations Admin', 'Admin'],
  '/shifts': ['Super Admin', 'Operations Admin', 'Admin'],
  '/shifts/assignments': ['Super Admin', 'Operations Admin', 'Admin'],
  '/attendance': ['Super Admin', 'Operations Admin', 'Admin'],
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
      <Route
        path="/coupons"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/coupons']}>
            <Layout>
              <CouponManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shifts"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/shifts']}>
            <Layout>
              <ShiftConfiguration />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shifts/assignments"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/shifts/assignments']}>
            <Layout>
              <ShiftAssignmentManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute requiredRoles={rolePermissions['/attendance']}>
            <Layout>
              <AttendanceManagement />
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
