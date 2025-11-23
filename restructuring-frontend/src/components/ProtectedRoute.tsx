import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute
 * Krever at brukeren er innlogget (token i localStorage).
 * Viser en kort toast første gang i økten hvis man ikke er innlogget.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!token && !sessionStorage.getItem('toastShown')) {
      setShowToast(true);
      sessionStorage.setItem('toastShown', 'true');
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [token]);

  if (!token) {
    const redirectState = { from: location.pathname + location.search };

    return (
      <>
        {showToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
            Du må være innlogget for å se denne siden
          </div>
        )}
        <Navigate to="/login" replace state={redirectState} />
      </>
    );
  }

  return <>{children}</>;
}
