import React, { lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';
import MainLayout, { MainNavLink } from '@/layouts/MainLayout';
import ProtectedLayout from '@/app/ProtectedLayout';
import AdminLayout from '@/app/AdminLayout';

// -----------------------------------------------------
// Lazy-loaded pages
// -----------------------------------------------------
const HomePage = lazy(() => import('@/pages/HomePage'));
const InsurancePage = lazy(() => import('@/pages/InsurancePage'));
const PlanPage = lazy(() => import('@/pages/PlanPage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'));
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const WizardPage = lazy(() => import('@/pages/WizardPage'));
const UnsureWizardPage = lazy(() => import('@/pages/UnsureWizardPage')); // ✅ NY
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const SystemInfoPage = lazy(() => import('@/pages/SystemInfoPage'));
const DownloadAppPage = lazy(() => import('@/pages/DownloadAppPage'));
const MePage = lazy(() => import('@/pages/MePage'));

// -----------------------------------------------------
// Navigation definition
// -----------------------------------------------------
const mainNavLinks: MainNavLink[] = [
  { path: '/', label: 'Hjem' },
  { path: '/wizard', label: 'Veiviser' },
  { path: '/insurance', label: 'Forsikring' },
  { path: '/plan', label: 'Plan' },
  { path: '/journal', label: 'Journal' },
  { path: '/resources', label: 'Ressurser' },
  { path: '/systeminfo', label: 'Systeminfo' },
  { path: '/last-ned', label: 'Last ned app' },
  { path: '/me', label: 'Profil' },

  // Auth (kun uinnlogget)
  { path: '/login', label: 'Logg inn' },
  { path: '/register', label: 'Registrer' },
];

// -----------------------------------------------------
// Route configuration
// -----------------------------------------------------
export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout navLinks={mainNavLinks} />,
    children: [
      // Public
      { index: true, element: <HomePage /> },
      { path: 'wizard', element: <WizardPage /> },
      { path: 'wizard/unsure', element: <UnsureWizardPage /> }, // ✅ NY
      { path: 'insurance', element: <InsurancePage /> },
      { path: 'plan', element: <PlanPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'last-ned', element: <DownloadAppPage /> },

      // Auth
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },

      // Protected
      {
        element: <ProtectedLayout />,
        children: [{ path: 'me', element: <MePage /> }],
      },

      // Admin
      {
        element: <AdminLayout />,
        children: [{ path: 'systeminfo', element: <SystemInfoPage /> }],
      },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
];

export function AppRouter() {
  return useRoutes(appRoutes);
}
