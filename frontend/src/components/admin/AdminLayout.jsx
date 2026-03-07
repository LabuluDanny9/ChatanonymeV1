/**
 * Admin Layout — Ultra-modern SaaS control panel
 * Dark mode • Glassmorphism • Neon purple accents
 */

import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/conversations', icon: MessageCircle, label: 'Messages' },
  { to: '/admin/topics', icon: FileText, label: 'Forum' },
  { to: '/admin/reports', icon: ShieldAlert, label: 'Signalements' },
  { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
];

function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const labels = {
    admin: 'Admin',
    dashboard: 'Tableau de bord',
    users: 'Utilisateurs',
    conversations: 'Messages',
    topics: 'Forum',
    reports: 'Signalements',
    settings: 'Paramètres',
  };
  if (segments[segments.length - 1]?.match(/^[0-9a-f-]{36}$/i)) {
    return (
      <nav className="flex items-center gap-2 text-sm text-admin-muted">
        <Link to="/admin/topics" className="hover:text-admin-text transition-colors">Forum</Link>
        <ChevronRight className="w-4 h-4 text-admin-border" strokeWidth={2} />
        <span className="text-admin-text font-medium">Commentaires</span>
      </nav>
    );
  }
  return (
    <nav className="flex items-center gap-2 text-sm">
      {segments.map((seg, i) => (
        <span key={seg} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="w-4 h-4 text-admin-border" strokeWidth={2} />}
          <span className={i === segments.length - 1 ? 'font-medium text-admin-text' : 'text-admin-muted hover:text-admin-text transition-colors'}>
            {labels[seg] || seg}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex bg-admin-bg font-admin">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-admin-surface/80 backdrop-blur-admin border-r border-admin-border shrink-0">
        <div className="p-6 border-b border-admin-border">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-admin-blue to-admin-purple flex items-center justify-center shadow-admin-glow group-hover:shadow-admin-glow transition-shadow">
              <img src="/logo.png" alt="" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-admin-text">ChatAnonyme</h2>
              <p className="text-xs text-admin-muted">Centre de contrôle</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-admin-purple/20 text-admin-purple border border-admin-purple/30 shadow-admin-glow'
                    : 'text-admin-muted hover:bg-admin-card/50 hover:text-admin-text border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-admin-border space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-admin-card/50 border border-admin-border">
            {admin?.photo && admin.photo.trim().length <= 4 ? (
              <div className="w-10 h-10 rounded-xl bg-admin-purple/20 flex items-center justify-center text-xl shrink-0 border border-admin-purple/30">
                {admin.photo}
              </div>
            ) : admin?.photo && admin.photo.startsWith('http') ? (
              <img src={admin.photo} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-admin-border" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-admin-purple/20 flex items-center justify-center shrink-0 border border-admin-purple/30">
                <span className="text-sm font-semibold text-admin-purple">{admin?.email?.[0]?.toUpperCase() || 'A'}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-admin-text truncate font-medium" title={admin?.email}>{admin?.email}</p>
              <p className="text-xs text-admin-muted mt-0.5">Administrateur</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-admin-danger hover:bg-admin-danger/10 border border-admin-danger/20 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </motion.button>
        </div>
      </aside>

      {/* Sidebar — Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-admin-surface border-r border-admin-border lg:hidden flex flex-col shadow-glass"
            >
              <div className="p-6 border-b border-admin-border flex justify-between items-center">
                <h2 className="font-bold text-admin-text">ChatAnonyme</h2>
                <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 text-admin-muted hover:text-admin-text rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl ${
                        isActive ? 'bg-admin-purple/20 text-admin-purple' : 'text-admin-muted hover:bg-admin-card/50 hover:text-admin-text'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-admin-surface/60 backdrop-blur-admin border-b border-admin-border">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-admin-muted hover:bg-admin-card/50 hover:text-admin-text transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-4">
            <Breadcrumb />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-xl text-admin-muted hover:bg-admin-card/50 hover:text-admin-text transition-colors"
              title="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/admin/conversations"
              className="relative p-2.5 rounded-xl text-admin-muted hover:bg-admin-card/50 hover:text-admin-text transition-colors"
              title="Messages"
            >
              <MessageCircle className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-admin-danger text-[10px] text-white flex items-center justify-center font-bold">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </Link>
            <Link
              to="/admin/settings"
              className="p-2.5 rounded-xl text-admin-muted hover:bg-admin-card/50 hover:text-admin-text transition-colors"
              title="Paramètres"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-admin-border">
              {admin?.photo && admin.photo.trim().length <= 4 ? (
                <div className="w-9 h-9 rounded-xl bg-admin-purple/20 flex items-center justify-center text-lg border border-admin-purple/30">
                  {admin.photo}
                </div>
              ) : admin?.photo && admin.photo.startsWith('http') ? (
                <img src={admin.photo} alt="" className="w-9 h-9 rounded-xl object-cover border border-admin-border" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-admin-purple/20 flex items-center justify-center border border-admin-purple/30">
                  <span className="text-sm font-semibold text-admin-purple">{admin?.email?.[0]?.toUpperCase() || 'A'}</span>
                </div>
              )}
              <span className="text-sm text-admin-muted hidden sm:inline max-w-[120px] truncate">{admin?.email}</span>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
