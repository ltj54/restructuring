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

// ----------------------------------------------------
//  Small UI helpers
// ----------------------------------------------------

function Spinner() {
  return (
    <motion.div
      className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  );
}

function SkeletonBlock({ width = '100%', height = '1rem' }) {
  return <div className="animate-pulse rounded bg-slate-200/70" style={{ width, height }} />;
}

function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
      <SkeletonBlock width="60%" />
      <SkeletonBlock width="40%" />
      <SkeletonBlock width="80%" height="0.8rem" />
      <SkeletonBlock width="70%" height="0.8rem" />
    </div>
  );
}

function StatusBadge({ status }: { status: Health }) {
  const color =
    status === 'ok'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
      : status === 'feil'
        ? 'bg-rose-100 text-rose-700 border-rose-300'
        : 'bg-slate-100 text-slate-700 border-slate-300';

  const dot =
    status === 'ok' ? 'bg-emerald-500' : status === 'feil' ? 'bg-rose-500' : 'bg-slate-500';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${color}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      {status === 'ok' ? 'Online' : status === 'feil' ? 'Offline' : 'Ukjent'}
    </span>
  );
}

function HistoryList({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="space-y-2">
        <SkeletonBlock width="40%" />
        <SkeletonBlock width="80%" height="0.6rem" />
        <SkeletonBlock width="75%" height="0.6rem" />
      </div>
    );
  }

  const maxDuration = Math.max(...history.map((h) => h.durationMs || 1));

  return (
    <div className="space-y-3 text-sm">
      {history.map((entry, i) => {
        const ratio = entry.durationMs ? Math.min(100, (entry.durationMs / maxDuration) * 100) : 5;

        const bar =
          entry.status === 'ok'
            ? 'bg-emerald-500'
            : entry.status === 'feil'
              ? 'bg-rose-500'
              : 'bg-slate-400';

        return (
          <div key={i} className="border border-slate-200 rounded-xl bg-white p-3 shadow-sm">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{entry.time.toLocaleTimeString()}</span>
              <span className="font-semibold text-slate-700">
                {entry.durationMs ? `${Math.round(entry.durationMs)} ms` : 'Ingen måling'}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className={`h-2 ${bar}`} style={{ width: `${ratio}%` }} />
              </div>

              <StatusBadge status={entry.status} />
            </div>

            <div className="mt-2 text-xs text-slate-500">HTTP: {entry.httpCode ?? '-'}</div>
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------
//   MAIN PAGE
// ----------------------------------------------------

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

  // ---------------------------------------
  // Backend check
  // ---------------------------------------
  const checkBackend = useCallback(async () => {
    setChecking(true);
    setMessage('');

    const start = performance.now();
    let newStatus: Health = 'ukjent';
    let code: number | null = null;

    try {
      const res = await fetch(healthUrl);
      code = res.status;
      setHttpCode(code);

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
      setHttpCode(null);
      setMessage('Ingen respons fra backend.');
    } finally {
      const durationMs = performance.now() - start;

      setLastChecked(new Date());
      setChecking(false);

      setHistory((prev) => {
        const entry: HistoryEntry = {
          time: new Date(),
          status: newStatus,
          httpCode: code,
          durationMs,
        };
        return [entry, ...prev].slice(0, 10);
      });
    }
  }, [healthUrl]);

  // ---------------------------------------
  // DB check
  // ---------------------------------------
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

  // ---------------------------------------
  // Auto loop
  // ---------------------------------------
  useEffect(() => {
    let id: number | null = null;

    async function loop() {
      await checkBackend();

      if (status === 'ok') {
        await checkDb();
      }

      if (status === 'ok' && dbStatus === 'ok') {
        if (id) clearInterval(id);
      }
    }

    loop();
    id = window.setInterval(loop, 3000);

    return () => id && clearInterval(id);
  }, [status, dbStatus, checkBackend, checkDb]);

  const loading = status !== 'ok';

  return (
    <PageLayout
      title="Systemstatus"
      subtitle="Enkel og ryddig oversikt over backend, database og nylige målinger."
      maxWidthClassName="max-w-5xl"
    >
      {/* BOOT BANNER */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="mb-5 flex items-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          <Spinner /> Backend starter opp – sjekker status ...
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* --------------------------------------- */}
        {/* BACKEND CARD */}
        {/* --------------------------------------- */}
        <Card title="Backend-status" className="h-full">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />

              <div className="text-right text-xs text-slate-500">
                <p>Sist sjekket</p>
                <p className="font-semibold text-slate-700">
                  {lastChecked ? lastChecked.toLocaleTimeString() : '—'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="font-semibold text-slate-700 mb-1">Health URL</p>
              <p className="break-all text-slate-600">{healthUrl}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <p className="text-slate-500 text-xs">HTTP (health)</p>
                <p className="font-semibold text-slate-800">{httpCode ?? '-'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <p className="text-slate-500 text-xs">Responstid</p>
                <p className="font-semibold text-slate-800">
                  {latestEntry ? `${Math.round(latestEntry.durationMs ?? 0)} ms` : '-'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold text-slate-700">Melding</p>
              <p className="text-slate-600 mt-1">{message}</p>
            </div>
          </div>
        </Card>

        {/* --------------------------------------- */}
        {/* DB CARD */}
        {/* --------------------------------------- */}
        <Card title="Database-status" className="h-full">
          <div className="space-y-4 text-sm">
            <StatusBadge status={dbStatus} />

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="font-semibold text-slate-700 mb-1">DB URL</p>
              <p className="break-all text-slate-600">{dbInfoUrl}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-white border-slate-200 p-3 text-sm">
                <p className="text-xs text-slate-500">HTTP (dbinfo)</p>
                <p className="font-semibold text-slate-800">{dbHttpCode ?? '-'}</p>
              </div>
              <div className="rounded-lg border bg-white border-slate-200 p-3 text-sm">
                <p className="text-xs text-slate-500">Status</p>
                <p className="font-semibold text-slate-800">
                  {dbStatus === 'ok' ? 'OK' : dbStatus === 'feil' ? 'Feil' : 'Ukjent'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold text-slate-700">Melding</p>
              <p className="text-slate-600 mt-1 whitespace-pre-wrap">{dbMessage}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* --------------------------------------- */}
      {/* HISTORY */}
      {/* --------------------------------------- */}
      <Card title="Responshistorikk" className="mt-6">
        {history.length === 0 ? (
          <div className="space-y-3">
            <SkeletonBlock width="60%" />
            <SkeletonBlock width="50%" />
            <SkeletonCard />
          </div>
        ) : (
          <HistoryList history={history} />
        )}
      </Card>
    </PageLayout>
  );
}
