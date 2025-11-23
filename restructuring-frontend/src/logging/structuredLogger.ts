// src/logging/structuredLogger.ts
import { API_BASE_URL, APP_ENV, APP_NAME, DEBUG_LOGGER } from '../utils/config';
import type { StructuredLogPayload, StructuredLogError } from './LoggerTypes';

const cleanedApi = API_BASE_URL ? API_BASE_URL.replace(/\/+$/, '') : '';
export const LOG_ENDPOINT = cleanedApi ? `${cleanedApi}/log` : null;

if (DEBUG_LOGGER) {
  console.log('[Logger] Structured Logger initialized');
  console.log('[Logger] APP_ENV:', APP_ENV);
  console.log('[Logger] API_BASE_URL:', API_BASE_URL);
  console.log('[Logger] LOG_ENDPOINT:', LOG_ENDPOINT);
}

export function sendStructuredLog(payload: Omit<StructuredLogPayload, 'timestamp' | 'env' | 'app'>) {
  if (!LOG_ENDPOINT) {
    if (DEBUG_LOGGER) console.warn('[Logger] Ingen LOG_ENDPOINT - hopper over logging.');
    return;
  }

  const built: StructuredLogPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
    env: APP_ENV,
    app: APP_NAME,
  };

  const body = JSON.stringify(built);

  try {
    if (navigator?.sendBeacon) {
      navigator.sendBeacon(LOG_ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (DEBUG_LOGGER) console.log('[Logger] Beacon log:', built);
      return;
    }
  } catch {
    // ignore beacon failure and fall back to fetch
  }

  fetch(LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});

  if (DEBUG_LOGGER) console.log('[Logger] Fetch log:', built);
}

export function logInfo(context: string, event: string, message: string, meta?: object) {
  sendStructuredLog({ context, event, message, meta, level: 'INFO' });
}

export function logWarn(context: string, event: string, message: string, meta?: object) {
  sendStructuredLog({ context, event, message, meta, level: 'WARN' });
}

export function logError(context: string, event: string, message: string, error?: Error, meta?: object) {
  const err: StructuredLogError | undefined = error
    ? {
        name: error.name,
        message: error.message,
        stack: error.stack ?? undefined,
      }
    : undefined;

  sendStructuredLog({ context, event, message, meta, level: 'ERROR', error: err });
}
