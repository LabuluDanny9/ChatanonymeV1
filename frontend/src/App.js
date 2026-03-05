/**
 * ChatAnonyme - Application React
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationSocketListener from './components/NotificationSocketListener';
import ErrorBoundary from './components/ErrorBoundary';

import Welcome from './pages/Welcome';
import AuthPage from './pages/AuthPage';
import Topics from './pages/Topics';
import TopicView from './pages/TopicView';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminConversations from './pages/admin/AdminConversations';
import AdminTopics from './pages/admin/AdminTopics';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import UserDashboardLayout from './components/dashboard/UserDashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardChat from './pages/dashboard/DashboardChat';
import DashboardTopics from './pages/dashboard/DashboardTopics';
import DashboardHistory from './pages/dashboard/DashboardHistory';
import DashboardProfile from './pages/dashboard/DashboardProfile';

function PrivateUser({ children }) {
  const { user, admin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  if (!user) return <Navigate to="/connexion" replace />;
  return children;
}

function PrivateAdmin({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/connexion" element={<AuthPage mode="user" defaultTab="login" />} />
      <Route path="/inscription" element={<AuthPage mode="user" defaultTab="signup" />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Welcome />} />
        <Route path="topics" element={<Topics />} />
        <Route path="topics/:id" element={<TopicView />} />
        <Route path="chat" element={<PrivateUser><Navigate to="/dashboard/chat" replace /></PrivateUser>} />
        <Route path="dashboard" element={<PrivateUser><UserDashboardLayout /></PrivateUser>}>
          <Route index element={<DashboardHome />} />
          <Route path="chat" element={<DashboardChat />} />
          <Route path="topics" element={<DashboardTopics />} />
          <Route path="topics/:id" element={<TopicView />} />
          <Route path="history" element={<DashboardHistory />} />
          <Route path="profile" element={<DashboardProfile />} />
        </Route>
      </Route>
      <Route path="/admin">
        <Route index element={<AdminLogin />} />
        <Route element={<PrivateAdmin><AdminLayout /></PrivateAdmin>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="conversations" element={<AdminConversations />} />
          <Route path="topics" element={<AdminTopics />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <NotificationProvider>
                <NotificationSocketListener />
                <AppRoutes />
              </NotificationProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
