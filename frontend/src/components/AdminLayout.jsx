/**
 * Admin Layout — Interface professionnelle
 * Sidebar organisée, topbar, design épuré bleu/blanc
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/conversations', icon: MessageCircle, label: 'Conversations' },
  { to: '/admin/topics', icon: FileText, label: 'Sujets' },
];

function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const labels = {
    admin: 'Admin',
    dashboard: 'Tableau de bord',
    users: 'Utilisateurs',
    conversations: 'Conversations',
    topics: 'Sujets',
  };
  if (segments[segments.length - 1]?.match(/^[0-9a-f-]{36}$/i)) {
    return (
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/admin/topics" className="text-slate-500 hover:text-slate-800">Sujets</Link>
        <ChevronRight className="w-4 h-4 text-slate-300" strokeWidth={2} />
        <span className="font-medium text-slate-800">Commentaires</span>
      </nav>
    );
  }
  return (
    <nav className="flex items-center gap-2 text-sm">
      {segments.map((seg, i) => (
        <span key={seg} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="w-4 h-4 text-slate-300" strokeWidth={2} />}
          <span className={i === segments.length - 1 ? 'font-medium text-slate-800' : 'text-slate-500'}>
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

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-chat-border shrink-0 shadow-sm">
        <div className="p-6 border-b border-chat-border">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="ChatAnonyme" className="h-10 w-auto" />
            <div>
              <h2 className="font-bold text-slate-800">ChatAnonyme</h2>
              <p className="text-xs text-chat-muted">Administration</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-chat-border">
          <div className="flex items-center gap-3 px-4 py-2 mb-3 rounded-xl bg-slate-50 border border-chat-border">
            {admin?.photo && admin.photo.trim().length <= 4 ? (
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0">
                {admin.photo}
              </div>
            ) : admin?.photo && admin.photo.startsWith('http') ? (
              <img src={admin.photo} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-blue-600">{admin?.email?.[0]?.toUpperCase() || 'A'}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-chat-muted truncate" title={admin?.email}>{admin?.email}</p>
              <p className="text-xs text-slate-500 mt-0.5">Administrateur</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
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
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-chat-border lg:hidden flex flex-col shadow-xl"
            >
              <div className="p-6 border-b border-chat-border flex justify-between items-center">
                <h2 className="font-bold text-slate-800">ChatAnonyme</h2>
                <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 text-slate-500 hover:text-slate-800">
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
                        isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
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
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-chat-border shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <Breadcrumb />
          </div>
          <div className="flex items-center gap-3 ml-4">
            {admin?.photo && admin.photo.trim().length <= 4 ? (
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xl border-2 border-slate-200">
                {admin.photo}
              </div>
            ) : admin?.photo && admin.photo.startsWith('http') ? (
              <img src={admin.photo} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-slate-200" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">{admin?.email?.[0]?.toUpperCase() || 'A'}</span>
              </div>
            )}
            <span className="text-sm text-slate-600 hidden sm:inline max-w-[140px] truncate">{admin?.email}</span>
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
