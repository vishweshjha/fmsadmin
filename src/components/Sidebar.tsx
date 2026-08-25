import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Clock, 
  Users,
  UserCog,
  FileCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  LogOut,
  Briefcase,
  Tag,
  Timer,
  Fingerprint,
  Sparkles,
  ClipboardList
} from 'lucide-react'
import { useAuth, UserRole } from '../context/AuthContext'

interface MenuItem {
  path: string
  icon: any
  label: string
  requiredRoles: UserRole[]
}

const menuItems: MenuItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', requiredRoles: ['Super Admin', 'Operations Admin', 'Finance Admin', 'Support Agent', 'Compliance Officer'] },
  { path: '/users', icon: Users, label: 'User Management', requiredRoles: ['Super Admin', 'Operations Admin', 'Admin'] },
  { path: '/providers', icon: UserCog, label: 'Service Providers', requiredRoles: ['Super Admin', 'Operations Admin', 'Admin'] },
  { path: '/services', icon: Briefcase, label: 'Service Catalog', requiredRoles: ['Super Admin', 'Operations Admin', 'Admin'] },
  { path: '/kyc', icon: FileCheck, label: 'KYC & Verification', requiredRoles: ['Super Admin', 'Compliance Officer'] },
  { path: '/bookings', icon: Calendar, label: 'Booking Management', requiredRoles: ['Super Admin', 'Operations Admin', 'Support Agent'] },
  { path: '/pricing', icon: DollarSign, label: 'Pricing & Commission', requiredRoles: ['Super Admin', 'Finance Admin'] },
  { path: '/settlements', icon: TrendingUp, label: 'Settlements & Finance', requiredRoles: ['Super Admin', 'Finance Admin'] },
  { path: '/salary-ledger', icon: DollarSign, label: 'Salary Ledger', requiredRoles: ['Super Admin', 'Finance Admin'] },
  { path: '/incentives-penalties', icon: Sparkles, label: 'Incentives & Penalties', requiredRoles: ['Super Admin', 'Finance Admin'] },
  { path: '/payroll-settlements', icon: FileCheck, label: 'Payroll Settlements', requiredRoles: ['Super Admin', 'Finance Admin'] },
  { path: '/payroll-reports', icon: ClipboardList, label: 'Payroll Reports', requiredRoles: ['Super Admin', 'Finance Admin'] },
  { path: '/analytics', icon: Clock, label: 'Analytics & Reporting', requiredRoles: ['Super Admin', 'Operations Admin', 'Finance Admin'] },
  { path: '/coupons', icon: Tag, label: 'Coupons', requiredRoles: ['Super Admin', 'Operations Admin', 'Admin'] },
  { path: '/banners', icon: Sparkles, label: 'Banners', requiredRoles: ['Super Admin', 'Operations Admin', 'Admin'] },
  { path: '/shifts', icon: Timer, label: 'Shift Configuration', requiredRoles: ['Super Admin', 'Operations Admin', 'Admin'] },
  { path: '/shifts/assignments', icon: Calendar, label: 'Shift Assignments', requiredRoles: ['Super Admin', 'Operations Admin', 'Admin'] },
  { path: '/attendance', icon: Fingerprint, label: 'Attendance Management', requiredRoles: ['Super Admin', 'Operations Admin', 'Admin'] },
  { path: '/audit', icon: Shield, label: 'Audit & Logging', requiredRoles: ['Super Admin', 'Compliance Officer'] },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter(item => hasPermission(item.requiredRoles))

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <span className="text-xl font-bold">FMS ADMIN</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user ? getUserInitials(user.name) : 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@fms.com'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role || 'Admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
