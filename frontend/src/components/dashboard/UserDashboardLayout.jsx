/**
 * User Dashboard Layout — Sidebar | Main | Right Panel
 * Desktop: sidebar, Tablet: collapsible, Mobile: bottom nav
 */

import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MessageCircle,
  FileText,
  History,
  Bell,
  User,
  Moon,
  Sun,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationsDrawer from '../ui/NotificationsDrawer';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Accueil' },
  { to: '/dashboard/chat', icon: MessageCircle, label: 'Conversations' },
  { to: '/dashboard/topics', icon: FileText, label: 'Sujets' },
  { to: '/dashboard/history', icon: History, label: 'Historique' },
  { to: '/dashboard/profile', icon: User, label: 'Profil' },
];

export default function UserDashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-40 bg-white border-r border-chat-border shadow-sm">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-chat-border">
          <div className="w-8 h-8 rounded-lg bg-chat-primary flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-bold text-slate-800">ChatAnonyme</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive(item.to)
                  ? 'bg-blue-50 text-chat-primary'
                  : 'text-chat-muted hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-chat-border space-y-2">
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-chat-muted hover:bg-slate-50 hover:text-slate-800 w-full transition-all"
          >
            <div className="relative">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-chat-danger text-[10px] text-white flex items-center justify-center font-bold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </div>
            Notifications
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-chat-muted hover:bg-slate-50 hover:text-slate-800 w-full transition-all"
          >
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 bg-white border-r border-chat-border shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-chat-border">
                <span className="font-bold text-slate-800">ChatAnonyme</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-chat-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                      isActive(item.to) ? 'bg-blue-50 text-chat-primary' : 'text-chat-muted'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar mobile */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-chat-border shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800">ChatAnonyme</span>
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 text-slate-800"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-chat-danger text-[10px] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Bottom nav — Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-chat-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around py-2">
            <Link
              to="/dashboard"
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl min-w-[64px] transition-colors ${
                location.pathname === '/dashboard' ? 'text-chat-accent' : 'text-chat-muted'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Accueil</span>
            </Link>
            <Link
              to="/dashboard/chat"
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl min-w-[64px] transition-colors ${
                isActive('/dashboard/chat') ? 'text-chat-accent' : 'text-chat-muted'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">Chat</span>
            </Link>
            <Link
              to="/dashboard/topics"
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl min-w-[64px] transition-colors ${
                isActive('/dashboard/topics') ? 'text-chat-accent' : 'text-chat-muted'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Sujets</span>
            </Link>
            <Link
              to="/dashboard/history"
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl min-w-[64px] transition-colors ${
                isActive('/dashboard/history') ? 'text-chat-accent' : 'text-chat-muted'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-xs">Historique</span>
            </Link>
            <Link
              to="/dashboard/profile"
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl min-w-[64px] transition-colors ${
                isActive('/dashboard/profile') ? 'text-chat-accent' : 'text-chat-muted'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profil</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
