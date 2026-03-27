/**
 * ChatAnonyme - Application React
 * Routes en lazy loading pour réduire le JS initial (fluidité sur mobile / WebView)
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationSocketListener from './components/NotificationSocketListener';
import ErrorBoundary from './components/ErrorBoundary';
import LaunchOverlay from './components/LaunchOverlay';
import PageLoader from './components/PageLoader';

const Welcome = lazy(() => import('./pages/Welcome'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Topics = lazy(() => import('./pages/Topics'));
const TopicView = lazy(() => import('./pages/TopicView'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminConversations = lazy(() => import('./pages/admin/AdminConversations'));
const AdminTopics = lazy(() => import('./pages/admin/AdminTopics'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAdmins = lazy(() => import('./pages/admin/AdminAdmins'));
const AdminMessageHistory = lazy(() => import('./pages/admin/AdminMessageHistory'));
const Layout = lazy(() => import('./components/Layout'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const UserDashboardLayout = lazy(() => import('./components/dashboard/UserDashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const DashboardChat = lazy(() => import('./pages/dashboard/DashboardChat'));
const DashboardTopics = lazy(() => import('./pages/dashboard/DashboardTopics'));
const DashboardHistory = lazy(() => import('./pages/dashboard/DashboardHistory'));
const DashboardProfile = lazy(() => import('./pages/dashboard/DashboardProfile'));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'));
const DashboardPeerChat = lazy(() => import('./pages/dashboard/DashboardPeerChat'));

function PrivateUser({ children }) {
  const { user, admin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  if (!user) return <Navigate to="/connexion" replace />;
  return children;
}

function PrivateAdmin({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
          <Route path="users-chat" element={<DashboardPeerChat />} />
          <Route path="topics" element={<DashboardTopics />} />
          <Route path="topics/:id" element={<TopicView />} />
          <Route path="history" element={<DashboardHistory />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>
      </Route>
      <Route path="/admin">
        <Route index element={<AdminLogin />} />
        <Route element={<PrivateAdmin><AdminLayout /></PrivateAdmin>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="conversations" element={<AdminConversations />} />
          <Route path="messages-history" element={<AdminMessageHistory />} />
          <Route path="topics" element={<AdminTopics />} />
          <Route path="topics/:id" element={<TopicView />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
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
                <LaunchOverlay />
              </NotificationProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
