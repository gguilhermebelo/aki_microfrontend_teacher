import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RecoverPasswordPage from '@/features/auth/pages/RecoverPasswordPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ClassesPage from '@/features/classes/pages/ClassesPage';
import ClassDetailPage from '@/features/classes/pages/ClassDetailPage';
import EventsPage from '@/features/events/pages/EventsPage';
import AttendancesPage from '@/features/attendances/pages/AttendancesPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import Layout from '@/shared/components/Layout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

const withLayout = (Component: React.ComponentType) => (
  <ProtectedRoute>
    <Layout>
      <Component />
    </Layout>
  </ProtectedRoute>
);

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/recover-password',
    element: <RecoverPasswordPage />
  },
  {
    path: '/dashboard',
    element: withLayout(DashboardPage)
  },
  {
    path: '/classes',
    element: withLayout(ClassesPage)
  },
  {
    path: '/classes/:classId',
    element: withLayout(ClassDetailPage)
  },
  {
    path: '/events',
    element: withLayout(EventsPage)
  },
  {
    path: '/attendances',
    element: withLayout(AttendancesPage)
  },
  {
    path: '/reports',
    element: withLayout(ReportsPage)
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
];