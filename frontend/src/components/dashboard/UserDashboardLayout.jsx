/**
 * User Dashboard Layout — Style Reddit/Discord/Twitter
 * Sidebar gauche • Fil central • Panneau droit (trending)
 * Mode sombre • Glassmorphism • Accents violet
 */

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MessageCircle,
  FileText,
  History,
  Bell,
  User,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggleButton from '../ThemeToggleButton';
import { useNotifications } from '../../context/NotificationContext';
import NotificationsDrawer from '../ui/NotificationsDrawer';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Accueil' },
  { to: '/dashboard/chat', icon: MessageCircle, label: 'Messages' },
  { to: '/dashboard/topics', icon: FileText, label: 'Forum' },
  { to: '/dashboard/history', icon: History, label: 'Historique' },
  { to: '/dashboard/profile', icon: User, label: 'Profil' },
];

export default function UserDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-app-bg text-app-text font-sans">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-40 bg-app-surface/80 backdrop-blur-sm border-r border-app-border">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-app-border">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-app-blue to-app-purple flex items-center justify-center shadow-app-glow">
              <img src="/logo.png" alt="ChatAnonyme" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-app-text">ChatAnonyme</span>
          </Link>
        </div>
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mx-4 mt-2 rounded-xl bg-app-card/50 border border-app-border">
            <div className="w-10 h-10 rounded-xl bg-app-purple/20 flex items-center justify-center overflow-hidden shrink-0">
              {user?.photo && user.photo.trim().length <= 4 ? (
                <span className="text-xl">{user.photo}</span>
              ) : (
                <User className="w-5 h-5 text-app-purple" strokeWidth={1.5} />
              )}
            </div>
            <span className="font-medium text-app-text truncate text-sm">{user?.pseudo || 'Utilisateur'}</span>
          </div>
        )}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.to)
                  ? 'bg-app-purple/20 text-app-purple border border-app-purple/30'
                  : 'text-app-muted hover:bg-app-card/50 hover:text-app-text border border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-app-border space-y-2">
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-app-muted hover:bg-app-card/50 hover:text-app-text w-full transition-all relative"
          >
            <div className="relative">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-app-danger text-[10px] text-white flex items-center justify-center font-bold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </div>
            Notifications
          </button>
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-app-muted hover:bg-app-card/50 hover:text-app-text w-full transition-all"
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} />
            Paramètres
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-app-muted hover:bg-app-danger/20 hover:text-app-danger w-full transition-all"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            Déconnexion
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
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 bg-app-surface border-r border-app-border shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-app-border">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="ChatAnonyme" className="h-7 w-auto" />
                  <span className="font-bold text-app-text">ChatAnonyme</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-app-muted hover:text-app-text rounded-lg">
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
                      isActive(item.to) ? 'bg-app-purple/20 text-app-purple' : 'text-app-muted hover:bg-app-card/50'
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
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-app-surface/80 backdrop-blur-sm border-b border-app-border">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-app-text rounded-lg hover:bg-app-card/50"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ChatAnonyme" className="h-7 w-auto" />
            <span className="font-bold text-app-text">ChatAnonyme</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            {user && (
              <Link to="/dashboard/profile" className="w-9 h-9 rounded-xl bg-app-purple/20 flex items-center justify-center overflow-hidden shrink-0">
                {user?.photo && user.photo.trim().length <= 4 ? (
                  <span className="text-lg">{user.photo}</span>
                ) : (
                  <User className="w-5 h-5 text-app-purple" strokeWidth={1.5} />
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 text-app-text rounded-lg hover:bg-app-card/50"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-app-danger text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Bottom nav — Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-app-surface/95 backdrop-blur-sm border-t border-app-border">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl min-w-[64px] transition-colors ${
                  isActive(item.to) ? 'text-app-purple' : 'text-app-muted hover:text-app-text'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <NotificationsDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
