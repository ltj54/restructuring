// src/hooks/useAuth.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError, configureApiClient, fetchJson, isApiError } from '../utils/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userId: number;
  [key: string]: unknown;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  ssn?: string | null;
  fullName?: string;
  name?: string;
  displayName?: string;
}

type UserResponseDto = AuthenticatedUser;

interface AuthContextValue {
  token: string | null;
  user: AuthenticatedUser | null;
  userId: number | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isLoadingUser: boolean;
  login: (credentials: LoginCredentials, options?: { redirectTo?: string }) => Promise<LoginResponse>;
  logout: (options?: { redirectTo?: string }) => void;
  refreshUser: () => Promise<AuthenticatedUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthRedirectState = { from?: string } | null;

type StoredToken = {
  token: string;
  expiresAt: number | null;
};

type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const paddingNeeded = (4 - ((normalized.length % 4) || 4)) % 4;
  const padded = normalized + (paddingNeeded ? '='.repeat(paddingNeeded) : '');

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf-8');
  }

  throw new Error('Base64 decoding is not supported in this environment.');
}

function parseJwt<TPayload extends JwtPayload = JwtPayload>(token: string): TPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = decodeBase64Url(parts[1]);
    return JSON.parse(payload) as TPayload;
  } catch {
    return null;
  }
}

function extractExpiration(token: string): number | null {
  const payload = parseJwt(token);
  if (payload?.exp && typeof payload.exp === 'number') {
    return payload.exp * 1000;
  }
  return null;
}

function loadStoredToken(): StoredToken | null {
  try {
    const stored = localStorage.getItem('token');
    if (!stored) return null;

    const expiresAt = extractExpiration(stored);
    if (expiresAt && expiresAt <= Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    return { token: stored, expiresAt };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? null) as AuthRedirectState;

  const storedToken = loadStoredToken();

  const [token, setToken] = useState<string | null>(storedToken?.token ?? null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(storedToken?.expiresAt ?? null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(Boolean(storedToken?.token));

  const clearAuth = useCallback(() => {
    setToken(null);
    setTokenExpiresAt(null);
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('myPlan');
      localStorage.removeItem('personaLabel');
    } catch {
      // ignored
    }
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

  const persistAuth = useCallback((nextToken: string) => {
    setToken(nextToken);
    setTokenExpiresAt(extractExpiration(nextToken));
    try {
      localStorage.setItem('token', nextToken);
    } catch {
      // ignored
    }
  }, []);

  // Konfigurer global API-klient når token endrer seg
  useEffect(() => {
    configureApiClient({
      getToken: () => token,
      onUnauthorized: () => handleUnauthorized(),
    });
  }, [token, handleUnauthorized]);

  // Auto-logout når token går ut
  useEffect(() => {
    if (!token || !tokenExpiresAt) return;

    const now = Date.now();
    if (tokenExpiresAt <= now) {
      handleUnauthorized();
      return;
    }

    const timeout = window.setTimeout(() => {
      handleUnauthorized();
    }, tokenExpiresAt - now);

    return () => window.clearTimeout(timeout);
  }, [token, tokenExpiresAt, handleUnauthorized]);

  const loadUser = useCallback(
    async (tokenOverride?: string): Promise<AuthenticatedUser | null> => {
      const activeToken = tokenOverride ?? token;
      if (!activeToken) {
        setUser(null);
        setIsLoadingUser(false);
        return null;
      }

      setIsLoadingUser(true);
      try {
        const headers = tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : undefined;

        const response = await fetchJson<UserResponseDto>('/user/me', {
          headers,
        });

        const normalized: AuthenticatedUser = {
          id: response.id,
          email: response.email,
          firstName: response.firstName ?? null,
          lastName: response.lastName ?? null,
          ssn: response.ssn ?? null,
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

  // Last bruker ved oppstart hvis token finnes
  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoadingUser(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const loaded = await loadUser();
        if (cancelled || !loaded) return;
      } catch {
        if (!cancelled) {
          // loadUser håndterer unauthorized; andre feil går til kallere
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, loadUser]);

  const login = useCallback(
    async (credentials: LoginCredentials, options?: { redirectTo?: string }): Promise<LoginResponse> => {
      setIsAuthenticating(true);
      try {
        const response = await fetchJson<LoginResponse>('/auth/login', {
          method: 'POST',
          body: credentials,
          skipAuth: true,
        });

        persistAuth(response.token);
        await loadUser(response.token);

        const redirectTarget =
          options?.redirectTo ??
          (locationState?.from && locationState.from !== '/login' ? locationState.from : undefined) ??
          '/insurance';

        navigate(redirectTarget, { replace: true });
        return response;
      } catch (error) {
        clearAuth();
        throw error;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [persistAuth, loadUser, locationState, navigate, clearAuth]
  );

  const logout = useCallback(
    (options?: { redirectTo?: string }) => {
      clearAuth();
      navigate(options?.redirectTo ?? '/login', { replace: true });
    },
    [clearAuth, navigate]
  );

  const refreshUser = useCallback(() => loadUser(), [loadUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      userId: user?.id ?? null,
      isAuthenticated: Boolean(token),
      isAuthenticating,
      isLoadingUser,
      login,
      logout,
      refreshUser,
    }),
    [token, user, isAuthenticating, isLoadingUser, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new ApiError('useAuth må brukes innenfor en AuthProvider.', 500);
  }
  return context;
}
