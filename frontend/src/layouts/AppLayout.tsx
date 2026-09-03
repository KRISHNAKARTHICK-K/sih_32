import React, { useState, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Users,
  Building2,
  CalendarCheck,
  PackageCheck,
  CreditCard,
  Search,
  Bell,
  User,
  Shield,
  Menu,
  X,
  Wheat,
  LogOut,
  Scale,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { APP_NAME } from '../constants';
import { cn } from '../utils/cn';
import { useAuth } from '../auth/AuthContext';
import { useWebSocket } from '../realtime/WebSocketContext';
import { useRealtimeSync } from '../realtime/useRealtimeSync';
import type { UserRole } from '../auth/authTypes';

interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  roles: UserRole[];
}

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { status: wsStatus } = useWebSocket();

  // Mount real-time event listener and TanStack query synchronizer
  useRealtimeSync();

  // Role-specific dynamic navigation items for ERP staff roles (OPERATOR, CENTRE_MANAGER, ADMIN)
  const roleNavItems: NavItemConfig[] = useMemo(() => {
    const allItems: NavItemConfig[] = [
      // Operator Navigation
      {
        id: 'operator-dashboard',
        label: 'Operations Dashboard',
        path: '/operator',
        icon: <LayoutDashboard className="w-4 h-4" />,
        roles: ['OPERATOR'],
      },
      {
        id: 'operator-queue',
        label: 'Queue Operations',
        path: '/operator/queue',
        icon: <Activity className="w-4 h-4" />,
        badge: 'Live',
        roles: ['OPERATOR'],
      },
      {
        id: 'operator-bookings',
        label: 'Centre Bookings',
        path: '/operator/bookings',
        icon: <CalendarCheck className="w-4 h-4" />,
        roles: ['OPERATOR'],
      },
      {
        id: 'operator-weighment',
        label: 'Weighbridge Intake',
        path: '/operator/weighment',
        icon: <Scale className="w-4 h-4" />,
        roles: ['OPERATOR'],
      },
      {
        id: 'operator-quality',
        label: 'Quality Inspection',
        path: '/operator/quality',
        icon: <CheckCircle className="w-4 h-4" />,
        roles: ['OPERATOR'],
      },
      {
        id: 'operator-procurement',
        label: 'Procurement Ledger',
        path: '/operator/procurement',
        icon: <PackageCheck className="w-4 h-4" />,
        roles: ['OPERATOR'],
      },

      // Centre Manager Navigation
      {
        id: 'manager-dashboard',
        label: 'Manager Dashboard',
        path: '/manager',
        icon: <LayoutDashboard className="w-4 h-4" />,
        roles: ['CENTRE_MANAGER'],
      },
      {
        id: 'manager-operations',
        label: 'Live Operations',
        path: '/manager/operations',
        icon: <Activity className="w-4 h-4" />,
        badge: 'Live',
        roles: ['CENTRE_MANAGER'],
      },
      {
        id: 'manager-bookings',
        label: 'Centre Bookings',
        path: '/manager/bookings',
        icon: <CalendarCheck className="w-4 h-4" />,
        roles: ['CENTRE_MANAGER'],
      },
      {
        id: 'manager-queue',
        label: 'Yard Queue Board',
        path: '/manager/queue',
        icon: <Clock className="w-4 h-4" />,
        roles: ['CENTRE_MANAGER'],
      },
      {
        id: 'manager-procurement',
        label: 'Procurement Ledger',
        path: '/manager/procurement',
        icon: <PackageCheck className="w-4 h-4" />,
        roles: ['CENTRE_MANAGER'],
      },
      {
        id: 'manager-payments',
        label: 'DBT Payments',
        path: '/manager/payments',
        icon: <CreditCard className="w-4 h-4" />,
        roles: ['CENTRE_MANAGER'],
      },
      {
        id: 'manager-slots',
        label: 'Slots & Capacity',
        path: '/manager/slots',
        icon: <Layers className="w-4 h-4" />,
        roles: ['CENTRE_MANAGER'],
      },
      {
        id: 'manager-staff',
        label: 'Centre Staff',
        path: '/manager/staff',
        icon: <Users className="w-4 h-4" />,
        roles: ['CENTRE_MANAGER'],
      },
      {
        id: 'manager-reports',
        label: 'Reports & Analytics',
        path: '/manager/reports',
        icon: <FileSpreadsheet className="w-4 h-4" />,
        roles: ['CENTRE_MANAGER'],
      },

      // Admin Navigation
      {
        id: 'admin-dashboard',
        label: 'Admin Dashboard',
        path: '/admin',
        icon: <LayoutDashboard className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-users',
        label: 'User Accounts',
        path: '/admin/users',
        icon: <Users className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-farmers',
        label: 'Farmer Registry',
        path: '/admin/farmers',
        icon: <Users className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-centres',
        label: 'Procurement Centres',
        path: '/admin/centres',
        icon: <Building2 className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-crops',
        label: 'Crop Master Data',
        path: '/admin/crops',
        icon: <Wheat className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-prices',
        label: 'MSP Price Master',
        path: '/admin/prices',
        icon: <CreditCard className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-bookings',
        label: 'System Bookings',
        path: '/admin/bookings',
        icon: <CalendarCheck className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-procurement',
        label: 'Procurement Ledger',
        path: '/admin/procurement',
        icon: <PackageCheck className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-payments',
        label: 'DBT Payments',
        path: '/admin/payments',
        icon: <CreditCard className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-audit',
        label: 'Audit Trail',
        path: '/admin/audit',
        icon: <FileSpreadsheet className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
      {
        id: 'admin-system',
        label: 'System Health',
        path: '/admin/system',
        icon: <Activity className="w-4 h-4" />,
        roles: ['ADMIN'],
      },
    ];

    if (!role) return [];
    return allItems.filter((item) => item.roles.includes(role));
  }, [role]);

  const currentNav = roleNavItems.find(
    (item) => item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(item.path))
  ) || roleNavItems[0] || { label: 'Operations Dashboard', path: '/' };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadgeStyle = (r?: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CENTRE_MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OPERATOR':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'FARMER':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Brand & Mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-emerald-800 text-white shadow-xs">
              <Wheat className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                  {APP_NAME}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-none mt-0.5 hidden sm:block">
                Procurement &amp; Queue Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search farmer ID, booking code, center, or batch..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-colors"
            />
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Indicator */}
          <div className="relative p-1.5 text-slate-500 rounded" title="System operational">
            <Bell className="w-4 h-4" />
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-md hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.fullName || user?.username || 'Authenticated User'}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 leading-tight mt-0.5">
                  <span className={cn('px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border', getRoleBadgeStyle(user?.role))}>
                    {user?.role?.replace('_', ' ') || 'USER'}
                  </span>
                  {user?.centreName && (
                    <span className="truncate max-w-[110px] text-slate-400 font-normal">
                      &bull; {user.centreName}
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70">
                    <p className="font-semibold text-slate-800">{user?.fullName || user?.username}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      User: @{user?.username}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-14 left-0 z-20 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Sidebar Nav */}
          <div className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {role?.replace('_', ' ')} MODULES
            </div>

            {roleNavItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors group',
                    isActive
                      ? 'bg-emerald-50 text-emerald-950 font-semibold shadow-xs border-l-2 border-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn('transition-colors', isActive ? 'text-emerald-800' : 'text-slate-400 group-hover:text-slate-600')}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar Footer with Active Security Context */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-700" /> Security
              </span>
              <span className="font-mono font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                JWT &bull; {role}
              </span>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-10 bg-slate-900/30 backdrop-blur-xs lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-100 min-w-0">
          {/* Breadcrumb / Page context bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hover:text-slate-800 transition-colors">AGRIPROCURE</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">{currentNav.label}</span>
            </div>
            <div className="text-[11px] text-slate-500 hidden md:flex items-center gap-2">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  wsStatus === 'CONNECTED' && 'bg-emerald-500 animate-pulse',
                  (wsStatus === 'CONNECTING' || wsStatus === 'RECONNECTING') && 'bg-amber-500 animate-ping',
                  wsStatus === 'DISCONNECTED' && 'bg-slate-400'
                )}
              />
              <span className="font-medium">
                {wsStatus === 'CONNECTED'
                  ? 'Live Sync Active'
                  : wsStatus === 'CONNECTING' || wsStatus === 'RECONNECTING'
                  ? 'Reconnecting...'
                  : 'Offline (REST Sync)'}
              </span>
            </div>
          </div>

          {/* Main View Port */}
          <div className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
