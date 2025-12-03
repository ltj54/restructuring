import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Ikke innlogget → send til login med redirect
  if (!isAuthenticated) {
    const redirectTo = encodeURIComponent(
      location.pathname + location.search + location.hash
    );
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }

  // Innlogget → vis siden
  return <Outlet />;
}
