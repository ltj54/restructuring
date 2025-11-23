// ------------------------------------------------------------
// config.ts - miljøkonfigurasjon for frontend
// ------------------------------------------------------------
// Sammenslått og ryddet:
//   - Lokal utvikling (http://localhost:8080/api)
//   - Render backend i produksjon
//   - Vite miljøvariabler (VITE_*)
//   - Debug-flagg for logging
// ------------------------------------------------------------

/**
 * Standard backend-URL for lokal utvikling
 */
const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:8080/api';

/**
 * Standard backend-URL når appen kjører via GitHub Pages / Render / Produksjon
 */
const DEFAULT_REMOTE_API_BASE_URL = 'https://restructuring-compound-ws.onrender.com/api';

/**
 * Leser en miljøvariabel og returnerer trimmed string eller undefined
 */
const readEnv = (key: keyof ImportMetaEnv): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

/**
 * Trygg boolean-parsing av miljøvariabler
 */
const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;

  return undefined;
};

/**
 * Velger riktig API_BASE_URL:
 *  1) Hvis VITE_API_BASE_URL er satt – bruk den
 *  2) Hvis DEV – bruk lokal backend
 *  3) Ellers – bruk Render backend
 */
const getApiBaseUrl = (): string => {
  const fromEnv = readEnv('VITE_API_BASE_URL');
  if (fromEnv) return fromEnv;

  if (import.meta.env.DEV) return DEFAULT_LOCAL_API_BASE_URL;

  return DEFAULT_REMOTE_API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Miljønavn og appnavn
 */
export const APP_ENV = readEnv('VITE_APP_ENV') ?? import.meta.env.MODE ?? 'development';

export const APP_NAME = readEnv('VITE_APP_NAME') ?? 'Restructuring Frontend';

/**
 * Debug flagg for logging-systemet.
 *
 * Prioritet:
 *   1) VITE_DEBUG_CONFIG_LOGGER (true/false)
 *   2) Hvis ingen flagg: DEV = true, PROD = false
 */
const isDebugLoggingEnabled = (() => {
  const explicit = parseBoolean(readEnv('VITE_DEBUG_CONFIG_LOGGER'));
  if (typeof explicit !== 'undefined') return explicit;

  return import.meta.env.DEV;
})();

/**
 * Eksporter debug-flagget slik structuredLogger trenger
 */
export const DEBUG_LOGGER = isDebugLoggingEnabled;

/**
 * Intern debug-print
 */
const debugLog = (...args: unknown[]) => {
  if (!DEBUG_LOGGER) return;
  console.debug('[Config]', ...args);
};

// ------------------------------------------------------------
// Debug utskrifter ved oppstart (valgfritt)
// ------------------------------------------------------------

debugLog('API_BASE_URL =', API_BASE_URL);
debugLog('APP_ENV =', APP_ENV);
debugLog('APP_NAME =', APP_NAME);
debugLog('DEBUG_LOGGER =', DEBUG_LOGGER);
