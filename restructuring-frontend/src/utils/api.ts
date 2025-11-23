// src/utils/api.ts
import { API_BASE_URL } from './config';

export interface ApiClientConfig {
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

let clientConfig: ApiClientConfig = {};

/**
 * Konfigurerer global API-klient:
 *  - getToken: brukes til å sette Authorization-header
 *  - onUnauthorized: kalles ved 401-respons
 */
export function configureApiClient(config: ApiClientConfig) {
  clientConfig = config;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Sjekk om en error er ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Trygger uthenting av feilmelding fra ulike feil-typer.
 * Brukes både i hooks og global error handler.
 */
export function getErrorMessage(error: unknown, fallback?: string): string {
  if (!error) return fallback ?? 'Ukjent feil';

  if (error instanceof ApiError) {
    return error.message || fallback || `Feil: ${error.status}`;
  }

  if (error instanceof Error) {
    return error.message || fallback || 'Ukjent feil';
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMsg = (error as Record<string, unknown>).message;
    if (typeof maybeMsg === 'string') return maybeMsg;
  }

  return fallback ?? 'Ukjent feil';
}

type FetchJsonOptions = RequestInit & {
  /**
   * Hvis true – ikke legg på Authorization-header automatisk
   */
  skipAuth?: boolean;
  /**
   * Body kan være objekt - vi JSON.stringify'er hvis nødvendig
   */
  body?: unknown;
};

/**
 * Hoved-API-funksjon for JSON kall.
 *
 * - Prefixer alle kall med API_BASE_URL
 * - Legger på Authorization-header hvis token finnes
 * - Parser JSON-respons (fallback til tekst)
 * - Kaster ApiError ved !ok
 */
export async function fetchJson<T>(path: string, options: FetchJsonOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const { skipAuth, headers, body, ...rest } = options;

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers ?? {}),
  };

  if (!skipAuth && clientConfig.getToken) {
    const token = clientConfig.getToken();
    if (token) {
      (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const finalBody =
    body != null && typeof body !== 'string' && !(body instanceof FormData)
      ? JSON.stringify(body)
      : body;

  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body: finalBody,
    });
  } catch (networkError) {
    throw new ApiError('Klarte ikke å kontakte serveren', 0, networkError);
  }

  const contentType =
    response.headers && typeof response.headers.get === 'function'
      ? response.headers.get('Content-Type') || ''
      : '';
  let data: unknown = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && clientConfig.onUnauthorized) {
      clientConfig.onUnauthorized();
    }

    const message =
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

/**
 * Enkel alias brukt i tester (bakoverkompatibilitet).
 */
export function api<T>(path: string, options?: FetchJsonOptions): Promise<T> {
  return fetchJson<T>(path, options);
}
