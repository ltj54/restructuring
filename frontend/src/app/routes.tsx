import React, { lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';
import MainLayout, { MainNavLink } from '@/layouts/MainLayout';
import ProtectedLayout from '@/app/ProtectedLayout';

// Pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const InsurancePage = lazy(() => import('@/pages/InsurancePage'));
const PlanPage = lazy(() => import('@/pages/PlanPage'));
const PurchasePage = lazy(() => import('@/pages/PurchasePage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'));
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const WizardPage = lazy(() => import('@/pages/WizardPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const SystemInfoPage = lazy(() => import('@/pages/SystemInfoPage'));
const DownloadAppPage = lazy(() => import('@/pages/DownloadAppPage'));
const MePage = lazy(() => import('@/pages/MePage')); // NY

// Main navigation links (consistent icons for all pages)
const mainNavLinks: MainNavLink[] = [
  { path: '/', label: 'Hjem' },
  { path: '/wizard', label: 'Veiviser' },
  { path: '/insurance', label: 'Forsikring' },
  { path: '/plan', label: 'Plan' },
  { path: '/journal', label: 'Journal' },
  { path: '/resources', label: 'Ressurser' },
  { path: '/purchase', label: 'Kjøp' },
  { path: '/systeminfo', label: 'Systeminfo' },
  { path: '/last-ned', label: 'Last ned app' },
  { path: '/me', label: 'Profil' },
  { path: '/login', label: 'Logg inn' },
  { path: '/register', label: 'Registrer' },
];

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout navLinks={mainNavLinks} />,
    children: [
      // Public pages
      { index: true, element: <HomePage /> },
      { path: 'wizard', element: <WizardPage /> },
      { path: 'insurance', element: <InsurancePage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'purchase', element: <PurchasePage /> },
      { path: 'systeminfo', element: <SystemInfoPage /> },
      { path: 'last-ned', element: <DownloadAppPage /> },

      // Auth pages
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },

      // Protected pages
      {
        element: <ProtectedLayout />,
        children: [
          { path: 'plan', element: <PlanPage /> },
          { path: 'journal', element: <JournalPage /> },
          { path: 'me', element: <MePage /> },
        ],
      },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
];

export function AppRouter() {
  return useRoutes(appRoutes);
}
