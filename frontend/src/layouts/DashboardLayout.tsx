import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  FileText,
  BarChart3,
  UserCog,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Building2,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: ('ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS')[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  },
  {
    label: 'Customers CRM',
    path: '/customers',
    icon: <Users className="w-5 h-5" />,
    roles: ['ADMIN', 'SALES', 'ACCOUNTS'],
  },
  {
    label: 'Products Catalog',
    path: '/products',
    icon: <Package className="w-5 h-5" />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE'],
  },
  {
    label: 'Inventory Operations',
    path: '/inventory',
    icon: <Warehouse className="w-5 h-5" />,
    roles: ['ADMIN', 'WAREHOUSE'],
  },
  {
    label: 'Sales Challans',
    path: '/challans',
    icon: <FileText className="w-5 h-5" />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  },
  {
    label: 'Reports & Analytics',
    path: '/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['ADMIN', 'ACCOUNTS'],
  },
  {
    label: 'User Management',
    path: '/users',
    icon: <UserCog className="w-5 h-5" />,
    roles: ['ADMIN'],
  },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNavItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const current = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
    if (location.pathname.startsWith('/customers/')) return 'Customer Profile & CRM';
    if (location.pathname.startsWith('/challans/new')) return 'Create Sales Challan';
    if (location.pathname.startsWith('/challans/')) return 'Sales Challan View';
    return current?.label || 'Operations Portal';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-gray-800 text-white px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-black text-white text-lg">
            N
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">OPSERA</span>
            <span className="block text-[10px] text-slate-400 font-medium">Wholesale Ops</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-sky-500/20 shrink-0">
            N
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight leading-tight">
             OPSERA
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Wholesale & Customer Ops
            </p>
          </div>
        </div>

        {/* User Mini Profile Card */}
        <div className="mx-4 mt-4 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gray-600 font-bold text-sky-400 flex items-center justify-center text-sm shrink-0 border border-slate-600">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          {user && <Badge variant={user.role} size="sm" />}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Wholesale Operations & Customer Portal
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span> OPSERA Business Hub</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Main Route View Outlet */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
