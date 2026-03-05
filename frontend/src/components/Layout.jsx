/**
 * Layout principal — Navigation topbar (desktop) + bottom (mobile)
 * Design corporate premium
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, FileText, User, LogOut, Home, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user, admin, isLoggedIn, logout } = useAuth();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const isHome = location.pathname === '/';

  const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/topics', icon: FileText, label: 'Sujets' },
    ...(isLoggedIn ? [{ to: '/dashboard', icon: MessageCircle, label: 'Espace' }] : []),
  ];

  return (
    <div className="min-h-screen bg-chat-bg">
      {/* Topbar — Desktop */}
      <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-chat-border shadow-sm">
        <div className="mx-auto px-4 py-3 flex items-center justify-between max-w-6xl">
          <Link to="/" className="text-xl font-bold tracking-tight text-chat-primary hover:text-primary-dark transition-colors">
            ChatAnonyme
          </Link>
          <nav className="flex gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm flex items-center gap-2 transition-colors duration-300 ${
                  isActive(item.to) ? 'text-chat-primary font-medium' : 'text-chat-muted hover:text-chat-offwhite'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link
                  to={admin ? '/admin/dashboard' : '/dashboard'}
                  className="text-sm flex items-center gap-2 text-chat-muted hover:text-chat-offwhite transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user?.pseudo || 'Mon espace'}
                </Link>
                <motion.button
                  type="button"
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm flex items-center gap-2 text-chat-muted hover:text-chat-danger transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/inscription" className="text-sm text-chat-muted hover:text-chat-offwhite transition-colors">
                  S'inscrire
                </Link>
                <Link to="/admin" className="text-sm text-chat-muted hover:text-chat-accent transition-colors" title="Accès administrateur">
                  Admin
                </Link>
                <Link to="/connexion">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl bg-chat-primary text-white font-medium text-sm shadow-soft hover:bg-blue-700 transition-colors"
                  >
                    Connexion
                  </motion.button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main
        className={`mx-auto ${isHome ? 'max-w-none px-0' : 'max-w-6xl px-4 py-4 sm:py-6'} ${location.pathname !== '/' ? 'pb-20 md:pb-6' : ''}`}
      >
        <Outlet />
      </main>

      {/* Bottom nav — Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-chat-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around py-2 px-2">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
              location.pathname === '/' ? 'text-chat-primary bg-blue-50' : 'text-chat-muted'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Accueil</span>
          </Link>
          <Link
            to="/topics"
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
              isActive('/topics') ? 'text-chat-primary bg-blue-50' : 'text-chat-muted'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Sujets</span>
          </Link>
          {isLoggedIn ? (
            <Link
              to={admin ? '/admin/dashboard' : '/dashboard'}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
                isActive('/dashboard') || isActive('/admin') ? 'text-chat-primary bg-blue-50' : 'text-chat-muted'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">Chat</span>
            </Link>
          ) : (
            <>
              <Link
                to="/connexion"
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
                  isActive('/connexion') ? 'text-chat-primary bg-blue-50' : 'text-chat-muted'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs">Chat</span>
              </Link>
              <Link
                to="/admin"
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
                  isActive('/admin') ? 'text-chat-primary bg-blue-50' : 'text-chat-muted'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs">Admin</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
