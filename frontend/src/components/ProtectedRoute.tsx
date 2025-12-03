import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const redirectParam = encodeURIComponent(
    location.pathname + location.search + location.hash,
  );

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  return children;
}
