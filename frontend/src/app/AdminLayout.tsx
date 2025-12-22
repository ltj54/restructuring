import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * AdminLayout
 *
 * - Krever at bruker er innlogget
 * - Krever ROLE_ADMIN
 * - Sender til /login hvis ikke innlogget
 * - Sender til / hvis innlogget men ikke admin
 */
export default function AdminLayout() {
  const { isAuthenticated, isLoadingUser, isAdmin } = useAuth();
  const location = useLocation();

  // 1) Ikke ferdig lastet → unngå redirect-flimmer
  if (isLoadingUser) {
    return null;
  }

  // 2) Ikke logget inn → send til login med trygg redirect tilbake
  if (!isAuthenticated) {
    const raw = location.pathname + location.search + location.hash;
    const safe = raw.startsWith('/') ? raw : '/';
    const redirectTo = encodeURIComponent(safe);
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }

  // 3) Logget inn men ikke admin → tilbake til hjem
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4) Admin → vis innhold
  return <Outlet />;
}
