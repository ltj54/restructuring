// ------------------------------------------------------------
// config.ts - miljøkonfigurasjon for frontend (Vite)
// ------------------------------------------------------------
// Håndterer:
//   - VITE_* miljøvariabler
//   - Default-URLer for lokal / prod
//   - Debug-flagg for logging
// ------------------------------------------------------------

/**
 * Standard backend-URL for lokal utvikling
 */
const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:8080/api';

/**
 * Standard backend-URL når appen kjører via GitHub Pages / Render / Produksjon
 */
const DEFAULT_REMOTE_API_BASE_URL = 'https://restructuring-backend.onrender.com/api';

// Vite sitt miljø-objekt – vi caster til any for fleksibel oppslag
const env = import.meta.env as any;

/**
 * Leser en miljøvariabel og returnerer trimmed string eller undefined.
 */
function readEnv(name: string): string | undefined {
  const raw = env?.[name];

  if (typeof raw !== 'string') {
    return undefined;
  }

  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Leser en boolean-miljøvariabel.
 * Godtar: 1/true/yes/on og 0/false/no/off (case-insensitive).
 */
function readBoolEnv(name: string, fallback: boolean): boolean {
  const raw = readEnv(name);
  if (!raw) return fallback;

  const normalized = raw.toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;

  return fallback;
}

// ------------------------------------------------------------
// 🎯 Eksponerte konfig-verdier
// ------------------------------------------------------------

/**
 * Hvilket miljø appen tror den kjører i (development / test / production)
 */
export const APP_ENV: string = readEnv('VITE_APP_ENV') ?? 'development';

/**
 * Navn på applikasjonen (brukes i logger / UI)
 */
export const APP_NAME: string = readEnv('VITE_APP_NAME') ?? 'Restructuring Frontend';

/**
 * Bestemmer hvilken backend-URL som skal brukes.
 *
 * Prioritet:
 *   1) VITE_API_BASE_URL hvis satt
 *   2) Lokal URL i dev/test
 *   3) Remote URL i prod
 */
function resolveApiBaseUrl(): string {
  const explicit = readEnv('VITE_API_BASE_URL');
  if (explicit) {
    return explicit;
  }

  if (APP_ENV === 'development' || APP_ENV === 'test') {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  return DEFAULT_REMOTE_API_BASE_URL;
}

export const API_BASE_URL: string = resolveApiBaseUrl();

/**
 * Debug-flagg for logging (brukes av structuredLogger.ts m.m.)
 *
 * Default:
 *   - true i development
 *   - false i production
 */
export const DEBUG_LOGGER: boolean = readBoolEnv(
  'VITE_DEBUG_CONFIG_LOGGER',
  APP_ENV !== 'production'
);

/**
 * Enkel hjelpe-funksjon for debug-logging knyttet til config.
 */
export function debugLog(...args: unknown[]): void {
  if (!DEBUG_LOGGER || typeof console === 'undefined') return;
  // eslint-disable-next-line no-console
  console.log('[config]', ...args);
}

// For å kunne se konfigen i dev, kan du eventuelt logge her:
// debugLog('APP_ENV =', APP_ENV);
// debugLog('APP_NAME =', APP_NAME);
// debugLog('API_BASE_URL =', API_BASE_URL);
// debugLog('DEBUG_LOGGER =', DEBUG_LOGGER);
