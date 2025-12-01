import React, { useEffect, useState } from 'react';
import { useStructuredLogger } from '@/logging/useStructuredLogger';
import { API_BASE_URL } from '@/utils/config';

interface ConfigData {
  activeProfiles?: string[];
  ['spring.datasource.url']?: string;
  application?: string;
  ['server.port']?: string;
}

/**
 * ConfigInfo
 * ------------------------------------------------------------
 * Henter og viser konfigurasjonsdata fra backend.
 * - Kaller alltid `${API_BASE_URL}/config`
 * - Logger strukturerte events for enklere feilsøking
 * - Viser status / feilmelding tydelig i UI
 * ------------------------------------------------------------
 */
export default function ConfigInfo() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { logEvent, logError } = useStructuredLogger('ConfigInfo');

  useEffect(() => {
    // Fjern eventuell trailing slash og bygg korrekt URL
    const base = API_BASE_URL.replace(/\/+$/, '');
    const url = `${base}/config`;

    logEvent('config_fetch_start', {
      meta: { url },
    });

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setConfig(data);
        logEvent('config_fetch_success', {
          meta: { url, keys: Object.keys(data) },
        });
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        logError('config_fetch_failure', err, {
          message,
          meta: { url },
        });
        setError(message);
      });
  }, [logEvent, logError]);

  return (
    <div className="mt-6 rounded-xl bg-gray-100 p-4 text-sm text-gray-700 shadow-inner">
      <h2 className="mb-2 text-base font-semibold text-gray-800">Systeminformasjon</h2>

      {/* Feilmelding */}
      {error && (
        <p className="text-red-600">
          Klarte ikke hente config: <span className="font-mono">{error}</span>
        </p>
      )}

      {/* Laster */}
      {!error && !config && <p>Laster systeminfo...</p>}

      {/* Vellykket */}
      {config && (
        <ul className="space-y-1">
          <li>
            <strong>Aktiv profil:</strong> {config.activeProfiles?.join(', ') || 'ukjent'}
          </li>
          <li>
            <strong>Database:</strong>{' '}
            <span className="font-mono">{config['spring.datasource.url'] || 'ukjent'}</span>
          </li>
          <li>
            <strong>Applikasjon:</strong> {config.application || 'ukjent'}
          </li>
          <li>
            <strong>Port:</strong> {config['server.port'] || 'ukjent'}
          </li>
        </ul>
      )}
    </div>
  );
}
