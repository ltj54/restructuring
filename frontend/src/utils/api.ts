import { API_BASE_URL as CONFIG_API_BASE_URL } from '@/utils/config';

export const API_BASE_URL = CONFIG_API_BASE_URL;

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export function getErrorMessage(error: unknown, fallback = 'Noe gikk galt.'): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

let getToken: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function configureApiClient(config: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = config.getToken;
  onUnauthorized = config.onUnauthorized;
}

export async function fetchJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const body = options.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isUrlParams = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;
  const isArrayBuffer = typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer;
  const isArrayBufferView = typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(body);
  const isReadableStream = typeof ReadableStream !== 'undefined' && body instanceof ReadableStream;

  let preparedBody = body;
  if (
    body &&
    typeof body === 'object' &&
    !isFormData &&
    !isUrlParams &&
    !isBlob &&
    !isArrayBuffer &&
    !isArrayBufferView &&
    !isReadableStream
  ) {
    preparedBody = JSON.stringify(body);
  }

  if (isFormData && 'Content-Type' in headers) {
    delete (headers as Record<string, string>)['Content-Type'];
  }

  if (!options.skipAuth && getToken) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body: preparedBody,
    headers,
  });

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized();
    throw new ApiError('Unauthorized', 401);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    const fallbackMessage = 'Klarte ikke † kontakte serveren';
    if (!isJson) {
      const text = await response.text().catch(() => '');
      throw new ApiError(text || fallbackMessage, response.status);
    }
    const errorBody = await response.json().catch(() => ({}));
    const message =
      typeof (errorBody as { message?: unknown }).message === 'string'
        ? (errorBody as { message: string }).message
        : fallbackMessage;
    throw new ApiError(message, response.status);
  }

  if (!isJson) {
    const text = await response.text().catch(() => '');
    throw new ApiError(text || 'Ugyldig respons fra serveren', response.status);
  }

  return response.json();
}
