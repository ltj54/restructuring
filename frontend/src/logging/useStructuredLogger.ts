// src/logging/useStructuredLogger.ts
import { useCallback, useMemo } from 'react';
import { sendStructuredLog } from './structuredLogger';
import type { StructuredLogError, StructuredLogPayload, StructuredLogLevel } from './LoggerTypes';

type LogMeta = Record<string, unknown>;
type LogOptions = { message?: string; meta?: LogMeta };
type ErrorLike = unknown;

function convertError(error: ErrorLike): StructuredLogError | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack ?? undefined,
    };
  }

  if (typeof error === 'string') return { message: error };

  if (typeof error === 'object') {
    try {
      return { message: JSON.stringify(error) };
    } catch {
      // ignore JSON stringify failure
    }
  }

  return { message: String(error) };
}

export function useStructuredLogger(context: string) {
  const publish = useCallback(
    (level: StructuredLogLevel, event: string, options: LogOptions = {}, error?: ErrorLike) => {
      const payload: StructuredLogPayload = {
        context,
        event,
        level,
        message: options.message ?? event,
        meta: options.meta,
        error: convertError(error),
        timestamp: new Date().toISOString(),
      };

      sendStructuredLog(payload);
    },
    [context]
  );

  const logEvent = useCallback(
    (event: string, options: LogOptions = {}) => publish('INFO', event, options),
    [publish]
  );

  const logWarn = useCallback(
    (event: string, options: LogOptions = {}) => publish('WARN', event, options),
    [publish]
  );

  const logError = useCallback(
    (event: string, error: ErrorLike, options: LogOptions = {}) =>
      publish('ERROR', event, options, error),
    [publish]
  );

  return useMemo(() => ({ logEvent, logWarn, logError }), [logEvent, logWarn, logError]);
}
