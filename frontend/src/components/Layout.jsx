/**
 * Layout principal — Navigation topbar + bottom
 * Mode sombre • Accents violet
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, FileText, User, LogOut, Home, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

export default function Layout() {
  const location = useLocation();
  const { user, admin, isLoggedIn, logout } = useAuth();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/dashboard');

  const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/topics', icon: FileText, label: 'Forum' },
    ...(isLoggedIn ? [{ to: '/dashboard', icon: MessageCircle, label: 'Espace' }] : []),
  ];

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      {!isDashboard && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-end px-3 py-2.5 pointer-events-none">
          <div className="pointer-events-auto">
            <ThemeToggleButton />
          </div>
        </div>
      )}
      <header className="hidden md:block sticky top-0 z-50 bg-app-surface/80 backdrop-blur-sm border-b border-app-border">
        <div className="mx-auto px-4 py-3 flex items-center justify-between max-w-6xl">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-text hover:text-app-purple transition-colors">
            <img src="/logo.png" alt="ChatAnonyme" className="h-8 w-auto" />
            <span>ChatAnonyme</span>
          </Link>
          <nav className="flex gap-4 items-center">
            <ThemeToggleButton />
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm flex items-center gap-2 transition-colors duration-300 ${
                  isActive(item.to) ? 'text-app-purple font-medium' : 'text-app-muted hover:text-app-text'
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
                  className="text-sm flex items-center gap-2 text-app-muted hover:text-app-text transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user?.pseudo || 'Mon espace'}
                </Link>
                <motion.button
                  type="button"
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm flex items-center gap-2 text-app-muted hover:text-app-danger transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/inscription" className="text-sm text-app-muted hover:text-app-text transition-colors">
                  S'inscrire
                </Link>
                <Link to="/admin" className="text-sm text-app-muted hover:text-app-purple transition-colors" title="Accès administrateur">
                  Admin
                </Link>
                <Link to="/connexion">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-app-purple to-app-blue text-white font-medium text-sm shadow-app-glow"
                  >
                    Connexion
                  </motion.button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main
        className={`mx-auto ${
          isHome
            ? 'max-w-none px-0 pt-12 md:pt-0'
            : isDashboard
              ? 'max-w-6xl px-4 py-4 sm:py-6'
              : 'max-w-6xl px-4 py-4 sm:py-6 pt-14 md:pt-4'
        } ${location.pathname !== '/' ? 'pb-20 md:pb-6' : ''}`}
      >
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-app-surface/95 backdrop-blur-sm border-t border-app-border">
        <div className="flex items-center justify-around py-2 px-2">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
              location.pathname === '/' ? 'text-app-purple' : 'text-app-muted'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Accueil</span>
          </Link>
          <Link
            to="/topics"
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
              isActive('/topics') ? 'text-app-purple' : 'text-app-muted'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Forum</span>
          </Link>
          {isLoggedIn ? (
            <Link
              to={admin ? '/admin/dashboard' : '/dashboard'}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
                isActive('/dashboard') || isActive('/admin') ? 'text-app-purple' : 'text-app-muted'
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
                  isActive('/connexion') ? 'text-app-purple' : 'text-app-muted'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs">Chat</span>
              </Link>
              <Link
                to="/admin"
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors min-w-[64px] ${
                  isActive('/admin') ? 'text-app-purple' : 'text-app-muted'
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
