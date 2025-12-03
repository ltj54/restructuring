import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/Card';
import PageLayout from '@/components/PageLayout';
import { API_BASE_URL } from '@/utils/config';

type Health = 'ukjent' | 'ok' | 'feil';

type HistoryEntry = {
  time: Date;
  status: Health;
  httpCode: number | null;
  durationMs: number | null;
};

// Simple spinner for the booting banner
function Spinner() {
  return (
    <motion.div
      className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-amber-600 border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  );
}

// Skeleton block
function SkeletonBlock({ width = '100%', height = '1rem' }) {
  return (
    <div
      className="animate-pulse rounded bg-slate-200/80"
      style={{ width, height }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-3">
      <SkeletonBlock width="55%" />
      <SkeletonBlock width="35%" />
      <SkeletonBlock width="90%" height="0.75rem" />
      <SkeletonBlock width="75%" height="0.75rem" />
      <SkeletonBlock width="50%" height="0.75rem" />
    </div>
  );
}

function StatusBadge({ status }: { status: Health }) {
  const statusClass =
    status === 'ok'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : status === 'feil'
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${statusClass}`}
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${
          status === 'ok'
            ? 'bg-emerald-500'
            : status === 'feil'
            ? 'bg-rose-500'
            : 'bg-slate-500'
        }`}
      />
      <span className="font-semibold">
        {status === 'ok' ? 'Online' : status === 'feil' ? 'Offline' : 'Ukjent'}
      </span>
    </div>
  );
}

function HistoryList({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="space-y-2">
        <SkeletonBlock width="30%" />
        <SkeletonBlock width="90%" height="0.5rem" />
        <SkeletonBlock width="85%" height="0.5rem" />
        <SkeletonBlock width="70%" height="0.5rem" />
      </div>
    );
  }

  const maxDuration =
    history.length > 0 ? Math.max(...history.map((h) => h.durationMs || 0), 1) : 1;

  return (
    <div className="space-y-3 text-sm text-slate-700">
      {history.map((entry, i) => {
        const ratio = entry.durationMs
          ? Math.min(100, (entry.durationMs / maxDuration) * 100)
          : 5;

        const barColor =
          entry.status === 'ok'
            ? 'bg-emerald-500'
            : entry.status === 'feil'
            ? 'bg-rose-500'
            : 'bg-slate-400';

        return (
          <div
            key={i}
            className="rounded-xl border border-slate-100 bg-white/80 p-3 shadow-sm shadow-slate-100"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{entry.time.toLocaleTimeString()}</span>
              <span className="font-semibold text-slate-700">
                {entry.durationMs ? `${Math.round(entry.durationMs)} ms` : 'Ingen måling'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className={`h-2 ${barColor}`} style={{ width: `${ratio}%` }} />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    entry.status === 'ok'
                      ? 'bg-emerald-500'
                      : entry.status === 'feil'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="uppercase tracking-wide text-slate-600">
                  {entry.status === 'ok' ? 'OK' : entry.status === 'feil' ? 'FEIL' : 'UKJENT'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              HTTP: {entry.httpCode ?? '-'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SystemInfoPage(): React.ReactElement {
  const [status, setStatus] = useState<Health>('ukjent');
  const [httpCode, setHttpCode] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const [dbStatus, setDbStatus] = useState<Health>('ukjent');
  const [dbHttpCode, setDbHttpCode] = useState<number | null>(null);
  const [dbMessage, setDbMessage] = useState<string>('');

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const latestEntry = history[0];

  const healthUrl = useMemo(() => `${API_BASE_URL}/health`, []);
  const dbInfoUrl = useMemo(() => `${API_BASE_URL}/dbinfo`, []);

  const checkBackend = useCallback(async () => {
    setChecking(true);
    setMessage('');

    const start = performance.now();
    let newStatus: Health = 'ukjent';
    let statusCode: number | null = null;

    try {
      const res = await fetch(healthUrl);
      statusCode = res.status;
      setHttpCode(statusCode);

      if (res.ok) {
        newStatus = 'ok';
        setStatus('ok');
        setMessage('Backend svarer som forventet.');
      } else {
        newStatus = 'feil';
        setStatus('feil');
        setMessage('Backend svarte, men med feil.');
      }
    } catch {
      newStatus = 'feil';
      setStatus('feil');
      setMessage('Ingen respons fra backend.');
      setHttpCode(null);
    } finally {
      const end = performance.now();
      const durationMs = end - start;

      setLastChecked(new Date());
      setChecking(false);

      setHistory((prev) => {
        const entry: HistoryEntry = {
          time: new Date(),
          status: newStatus,
          httpCode: statusCode,
          durationMs,
        };
        return [entry, ...prev].slice(0, 10);
      });
    }
  }, [healthUrl]);

  const checkDb = useCallback(async () => {
    setDbMessage('');

    try {
      const res = await fetch(dbInfoUrl);
      setDbHttpCode(res.status);

      if (res.ok) {
        const text = await res.text();
        setDbStatus('ok');
        setDbMessage(text);
      } else {
        setDbStatus('feil');
        setDbMessage('DB-endepunkt svarte, men med feil.');
      }
    } catch {
      setDbStatus('feil');
      setDbHttpCode(null);
      setDbMessage('Ingen respons fra DB-endepunkt.');
    }
  }, [dbInfoUrl]);

  // AUTO HEALTH LOOP
  useEffect(() => {
    let intervalId: number | null = null;

    async function autoCheck() {
      await checkBackend();

      if (status === 'ok') {
        await checkDb();
      }

      if (status === 'ok' && dbStatus === 'ok') {
        if (intervalId) clearInterval(intervalId);
        return;
      }
    }

    autoCheck();
    intervalId = window.setInterval(autoCheck, 3000);

    return () => intervalId && clearInterval(intervalId);
  }, [status, dbStatus, checkBackend, checkDb]);

  const backendLoading = status !== 'ok';
  const dbStatusClass =
    dbStatus === 'ok'
      ? 'text-green-700'
      : dbStatus === 'feil'
      ? 'text-red-700'
      : 'text-slate-700';

  return (
    <PageLayout
      title="Systemstatus"
      subtitle="Oppdatert oversikt over backend, database og målelogg."
      maxWidthClassName="max-w-6xl"
    >
      {backendLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="mb-4 flex items-center rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <Spinner />
          Backend starter opp, vi oppdaterer statusen fortløpende.
        </motion.div>
      )}

      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-6 xl:grid-cols-12"
        >
          <div className="xl:col-span-8">
            <Card title="Backend-overvåkning">
              <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white shadow-inner shadow-slate-900/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Backend
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <StatusBadge status={status} />
                      {latestEntry?.durationMs ? (
                        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                          Siste responstid: {Math.round(latestEntry.durationMs)} ms
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                      <p className="text-slate-300">Sist sjekket</p>
                      <p className="font-semibold text-white">
                        {lastChecked ? lastChecked.toLocaleTimeString() : 'Aldri'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">
                      <p className="text-slate-300">HTTP-kode</p>
                      <p className="font-semibold text-white">{httpCode ?? '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                    {healthUrl}
                  </span>
                  <span className="text-sm text-white/80">{message || 'Avventer første måling.'}</span>
                </div>
              </div>

              {backendLoading ? (
                <div className="mt-5 space-y-4">
                  <SkeletonBlock width="35%" height="1.4rem" />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Health-endepunkt
                    </p>
                    <p className="mt-2 break-all text-xs text-slate-600">{healthUrl}</p>
                    <p className="mt-3 text-sm text-slate-700">
                      HTTP-kode (health): <span className="font-semibold text-slate-900">{httpCode ?? '-'}</span>
                    </p>
                    <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700 shadow-sm shadow-slate-100">
                      <span className="font-semibold">Melding:</span> {message}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Responstid snapshot
                    </p>
                    {latestEntry ? (
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span>Responstid</span>
                          <span className="font-semibold text-slate-900">
                            {Math.round(latestEntry.durationMs ?? 0)} ms
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span>Status</span>
                          <StatusBadge status={latestEntry.status} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span>HTTP</span>
                          <span className="font-semibold text-slate-900">
                            {latestEntry.httpCode ?? '-'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <SkeletonBlock width="70%" />
                        <SkeletonBlock width="40%" />
                        <SkeletonBlock width="85%" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="xl:col-span-4">
            <Card title="Database-status">
              {dbStatus === 'ok' ? (
                <div className="space-y-4 text-sm">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      DB-endepunkt
                    </p>
                    <p className="mt-2 break-all text-xs text-slate-600">{dbInfoUrl}</p>
                    <p className={`mt-3 font-semibold ${dbStatusClass}`}>
                      Status: {dbStatus === 'ok' ? 'OK' : dbStatus === 'feil' ? 'Feil' : 'Ukjent'}
                    </p>
                    <p className="text-sm text-slate-700">HTTP-kode (dbinfo): {dbHttpCode ?? '-'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 text-xs text-slate-700 shadow-sm shadow-slate-100">
                    <p className="text-xs uppercase tracking-wider text-slate-500">DB-melding</p>
                    <p className="mt-2 leading-relaxed">
                      {dbMessage || 'Ingen sjekk ennå.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <SkeletonBlock width="45%" />
                  <SkeletonBlock width="25%" />
                  <SkeletonCard />
                </div>
              )}
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Responstid og logg">
            {history.length === 0 ? (
              <div className="space-y-3">
                <SkeletonBlock width="70%" height="0.75rem" />
                <SkeletonBlock width="60%" height="0.75rem" />
                <SkeletonBlock width="50%" height="0.75rem" />
              </div>
            ) : (
              <HistoryList history={history} />
            )}
          </Card>
        </motion.div>
      </section>
    </PageLayout>
  );
}
