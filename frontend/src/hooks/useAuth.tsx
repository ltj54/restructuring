// src/hooks/useAuth.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError, configureApiClient, fetchJson, isApiError } from '@/utils/api';
import { syncAnonymousDrafts } from '@/utils/draftSync';

/* =========================
   TYPER
========================= */

type MeResponse = {
  userId: number;
  email: string;
  authorities: string[];
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userId: number;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  authorities: string[];
}

interface AuthContextValue {
  token: string | null;
  user: AuthenticatedUser | null;
  userId: number | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isLoadingUser: boolean;
  isAdmin: boolean;
  login: (
    credentials: LoginCredentials,
    options?: { redirectTo?: string }
  ) => Promise<LoginResponse>;
  logout: (options?: { redirectTo?: string }) => void;
  refreshUser: () => Promise<AuthenticatedUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthRedirectState = { from?: string } | null;

/* =========================
   GUEST CLEANUP
========================= */

function clearGuestState() {
  // Auth
  localStorage.removeItem('token');

  // Drafts / skjema
  localStorage.removeItem('wizardDraft');
  localStorage.removeItem('planDraft');
  localStorage.removeItem('insuranceDraft');
  localStorage.removeItem('journalDraft');

  // Eventuelle logger / cache
  localStorage.removeItem('structuredLogs');

  sessionStorage.clear();
}

/* =========================
   AUTH PROVIDER
========================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? null) as AuthRedirectState;

  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(Boolean(token));

  /* =========================
     HELPERS
  ========================= */

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    clearGuestState();
  }, []);

  const handleUnauthorized = useCallback(() => {
    clearAuth();
    if (location.pathname !== '/login') {
      navigate('/login', {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      });
    }
  }, [clearAuth, location.pathname, location.search, navigate]);

  /* =========================
     API CLIENT CONFIG
  ========================= */

  useEffect(() => {
    configureApiClient({
      getToken: () => token,
      onUnauthorized: handleUnauthorized,
    });
  }, [token, handleUnauthorized]);

  /* =========================
     LOAD USER
  ========================= */

  const loadUser = useCallback(
    async (tokenOverride?: string): Promise<AuthenticatedUser | null> => {
      const activeToken = tokenOverride ?? token;
      if (!activeToken) {
        setUser(null);
        setIsLoadingUser(false);
        clearGuestState();
        return null;
      }

      setIsLoadingUser(true);
      try {
        const headers = tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : undefined;

        const response = await fetchJson<MeResponse>('/me', { headers });

        const normalized: AuthenticatedUser = {
          id: response.userId,
          email: response.email,
          authorities: response.authorities ?? [],
        };

        setUser(normalized);
        return normalized;
      } catch (error) {
        setUser(null);
        if (isApiError(error) && error.status === 401) {
          handleUnauthorized();
          return null;
        }
        throw error;
      } finally {
        setIsLoadingUser(false);
      }
    },
    [token, handleUnauthorized]
  );

  /* =========================
     AUTO LOAD ON START
  ========================= */

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoadingUser(false);
      clearGuestState();
      return;
    }
    loadUser();
  }, [token, loadUser]);

  /* =========================
     LOGIN / LOGOUT
  ========================= */

  const login = useCallback(
    async (
      credentials: LoginCredentials,
      options?: { redirectTo?: string }
    ): Promise<LoginResponse> => {
      setIsAuthenticating(true);
      try {
        const response = await fetchJson<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
          skipAuth: true,
        });

        setToken(response.token);
        localStorage.setItem('token', response.token);

        const loadedUser = await loadUser(response.token);
        if (!loadedUser) {
          console.warn('Innlogging mislyktes: 401 ved lasting av brukerprofil.');
          return response;
        }

        // 🔒 Synk gjestedata FØRST ETTER vellykket login
        await syncAnonymousDrafts().catch((err) =>
          console.warn('Kunne ikke synke lokale data', err)
        );

        const redirectTarget =
          options?.redirectTo ??
          (locationState?.from && locationState.from !== '/login'
            ? locationState.from
            : '/insurance');

        navigate(redirectTarget, { replace: true });
        return response;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [loadUser, locationState, navigate]
  );

  const logout = useCallback(
    (options?: { redirectTo?: string }) => {
      clearAuth();
      navigate(options?.redirectTo ?? '/login', { replace: true });
    },
    [clearAuth, navigate]
  );

  /* =========================
     DERIVED STATE
  ========================= */

  const isAdmin = user?.authorities.includes('ROLE_ADMIN') ?? false;

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      userId: user?.id ?? null,
      isAuthenticated: Boolean(user),
      isAuthenticating,
      isLoadingUser,
      isAdmin,
      login,
      logout,
      refreshUser: loadUser,
    }),
    [token, user, isAuthenticating, isLoadingUser, isAdmin, login, logout, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* =========================
   HOOK
========================= */

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new ApiError('useAuth må brukes innenfor en AuthProvider.', 500);
  }
  return context;
}
