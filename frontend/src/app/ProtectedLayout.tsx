import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * ProtectedLayout
 *
 * - Viser innhold hvis bruker er innlogget
 * - Sender til /login hvis ikke innlogget
 * - Laster først til vi vet auth-status
 * - Hindrer redirect-bugs og open-redirect
 */
export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1) Avvent auth-status – unngår flimmer
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">Laster…</div>
    );
  }

  // 2) Ikke logget inn → redirect
  if (!isAuthenticated) {
    const raw = location.pathname + location.search + location.hash;

    // 🚨 Sikkerhet: hindre redirect til eksterne adresser
    const safe = raw.startsWith('/') ? raw : '/';

    const redirectTo = encodeURIComponent(safe);

    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }

  // 3) Logget inn → vis siden
  return <Outlet />;
}
