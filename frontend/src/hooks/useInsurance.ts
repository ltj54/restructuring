// src/hooks/useInsurance.ts
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../utils/config';
import { ApiError, getErrorMessage } from '../utils/api';
import { useAuth } from './useAuth';

function extractFilename(response: Response): string {
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const filenameMatch = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^";]+)"?/i);
  if (!filenameMatch) {
    return 'insurance_request.xml';
  }

  const [, encoded, quoted] = filenameMatch;
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }

  return quoted ?? 'insurance_request.xml';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function useInsurance() {
  const { isAuthenticated, token } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendInsurance = useCallback(async () => {
    ensureAuthenticated(isAuthenticated, token);
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/insurance/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new ApiError(message, response.status);
      }

      const blob = await response.blob();
      const filename = extractFilename(response);
      downloadBlob(blob, filename);

      return 'Forsikringssøknad generert og lastet ned.';
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);

      if (err instanceof Error) throw err;
      throw new ApiError(message, 500);
    } finally {
      setIsSending(false);
    }
  }, [isAuthenticated, token]);

  return {
    isSending,
    error,
    sendInsurance,
  };
}

function ensureAuthenticated(isAuthenticated: boolean, token: string | null) {
  if (!isAuthenticated || !token) {
    throw new ApiError('Du må være innlogget for å sende søknaden.', 401);
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as Record<string, unknown>).message === 'string'
    ) {
      return (data as Record<string, string>).message;
    }
  } catch {
    // ignored
  }

  try {
    const text = await response.text();
    if (text) return text;
  } catch {
    // ignored
  }

  return `Request failed with status ${response.status}`;
}

