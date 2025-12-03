import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRedirect } from './useRedirect';

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const redirectUrl = useRedirect();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${redirectUrl}`, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);
}
