// ============================================
// DevForge AI — React Router Configuration
// ============================================

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

// ---- Lazy loaded pages ----
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Projects = lazy(() => import('@/pages/dashboard/Projects'));
const ProjectDetail = lazy(() => import('@/pages/dashboard/ProjectDetail'));
const Agents = lazy(() => import('@/pages/dashboard/Agents'));
const History = lazy(() => import('@/pages/dashboard/History'));
const ApiKeys = lazy(() => import('@/pages/dashboard/ApiKeys'));
const Billing = lazy(() => import('@/pages/dashboard/Billing'));
const Settings = lazy(() => import('@/pages/dashboard/Settings'));
const NewProject = lazy(() => import('@/pages/dashboard/NewProject'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// ---- Layouts ----
import { RootLayout } from '@/components/layouts/RootLayout';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { AuthLayout } from '@/components/layouts/AuthLayout';

// ---- Loading Fallback ----
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

// ---- Suspense Wrapper ----
function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ---- Protected Route ----
function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ---- Guest Route (redirect if already logged in) ----
function GuestRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ---- Router ----
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ---- Public Routes ----
      {
        path: '/',
        element: (
          <SuspenseWrapper>
            <Landing />
          </SuspenseWrapper>
        ),
      },

      // ---- Auth Routes ----
      {
        element: (
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        ),
        children: [
          {
            path: '/login',
            element: (
              <SuspenseWrapper>
                <Login />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/register',
            element: (
              <SuspenseWrapper>
                <Register />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/forgot-password',
            element: (
              <SuspenseWrapper>
                <ForgotPassword />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/verify-email',
            element: (
              <SuspenseWrapper>
                <VerifyEmail />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // ---- Dashboard Routes (Protected) ----
      {
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '/dashboard',
            element: (
              <SuspenseWrapper>
                <Dashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/dashboard/projects',
            element: (
              <SuspenseWrapper>
                <Projects />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/dashboard/projects/new',
            element: (
              <SuspenseWrapper>
                <NewProject />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/dashboard/projects/:id',
            element: (
              <SuspenseWrapper>
                <ProjectDetail />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/dashboard/agents',
            element: (
              <SuspenseWrapper>
                <Agents />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/dashboard/history',
            element: (
              <SuspenseWrapper>
                <History />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/dashboard/api-keys',
            element: (
              <SuspenseWrapper>
                <ApiKeys />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/dashboard/billing',
            element: (
              <SuspenseWrapper>
                <Billing />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/dashboard/settings',
            element: (
              <SuspenseWrapper>
                <Settings />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // ---- 404 ----
      {
        path: '*',
        element: (
          <SuspenseWrapper>
            <NotFound />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
