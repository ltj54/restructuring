import React, { lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';
import MainLayout, { MainNavLink } from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const InsurancePage = lazy(() => import('../pages/InsurancePage'));
const PlanPage = lazy(() => import('../pages/PlanPage'));
const PurchasePage = lazy(() => import('../pages/PurchasePage'));
const ResourcesPage = lazy(() => import('../pages/ResourcesPage'));
const WizardPage = lazy(() => import('../pages/WizardPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const SystemInfoPage = lazy(() => import('../pages/SystemInfoPage'));

const mainNavLinks: MainNavLink[] = [
  { path: '/home', icon: '🏠', label: 'Hjem' },
  { path: '/insurance', icon: '🛡️', label: 'Forsikring' },
  { path: '/wizard', icon: '🧭', label: 'Veiviser' },
  { path: '/plan', icon: '📝', label: 'Plan' },
  { path: '/resources', icon: '📚', label: 'Ressurser' },
  { path: '/purchase', icon: '💳', label: 'Kjøp' },
  { path: '/systeminfo', icon: '💻', label: 'Systeminfo' },
  { path: '/login', icon: '🔑', label: 'Logg inn' },
  { path: '/register', icon: '➕', label: 'Registrer' },
];

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout navLinks={mainNavLinks} />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'insurance', element: <InsurancePage /> },
      { path: 'wizard', element: <WizardPage /> },
      {
        path: 'plan',
        element: (
          <ProtectedRoute>
            <PlanPage />
          </ProtectedRoute>
        ),
      },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'purchase', element: <PurchasePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'systeminfo', element: <SystemInfoPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/home" replace /> },
];

export function AppRouter() {
  return useRoutes(appRoutes);
}
