import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  CalendarDays,
  MessageSquare,
  Wrench,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Car,
  Shield,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/admin/lessons', icon: CalendarDays, label: 'Lessons' },
  { to: '/admin/demo-bookings', icon: MessageSquare, label: 'Demo Bookings' },
  { to: '/admin/service-requests', icon: Wrench, label: 'Service Requests' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const adminOnlyItems: NavItem[] = [{ to: '/admin/staff', icon: Shield, label: 'Staff' }];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const allNavItems = user?.role === 'admin' ? [...navItems, ...adminOnlyItems] : navItems;
  const activeItem = allNavItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  );

  return (
    <div className="min-h-screen bg-navy-50 flex">
      {/* ---------- Sidebar ---------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[16.5rem] bg-navy-950 text-white flex flex-col transition-transform duration-300 ease-premium lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0 shadow-premium' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.07] shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-accent-gradient rounded-lg flex items-center justify-center shadow-accent group-hover:scale-105 transition-transform duration-300">
              <Car size={19} className="text-white" strokeWidth={2.2} />
            </div>
            <div className="leading-none">
              <span className="font-display font-extrabold text-[0.9375rem] tracking-[-0.02em] block">
                Sai Prasad
              </span>
              <span className="text-[0.5625rem] text-navy-400 font-bold tracking-[0.16em] uppercase block mt-1">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-navy-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-navy-500">
            Menu
          </p>
          {allNavItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.8125rem] font-semibold transition-all duration-300 ease-premium ${
                  isActive
                    ? 'bg-accent-500/15 text-accent-400'
                    : 'text-navy-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent-500 rounded-r-full" />
                )}
                <item.icon size={17} className="shrink-0" />
                {item.label}
                <ChevronRight
                  size={14}
                  className={`ml-auto opacity-0 transition-all duration-300 ${
                    isActive ? 'opacity-60' : 'group-hover:opacity-50 group-hover:translate-x-0.5'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1.5">
            <div className="w-9 h-9 bg-accent-gradient rounded-lg flex items-center justify-center font-display font-bold text-white text-sm shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] font-semibold truncate">{user?.name}</p>
              <p className="text-[0.6875rem] text-navy-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-[0.8125rem] font-semibold text-navy-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-300"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---------- Main ---------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white/85 backdrop-blur-xl border-b border-navy-100 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-navy-700 hover:bg-navy-50 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display text-lg font-bold text-navy-900 tracking-[-0.015em] truncate">
              {activeItem?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-[0.8125rem] font-semibold text-navy-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-all duration-200"
            >
              View Website
              <ExternalLink size={14} />
            </Link>
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-navy-100">
              <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center font-display font-bold text-navy-700 text-[0.8125rem]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="leading-none">
                <p className="text-[0.8125rem] font-semibold text-navy-900">{user?.name}</p>
                <p className="text-[0.6875rem] text-navy-500 capitalize mt-1">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div key={location.pathname} className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
