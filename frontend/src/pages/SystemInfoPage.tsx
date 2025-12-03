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

// Simple spinner
function Spinner() {
  return (
    <motion.div
      className="inline-block h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full mr-2"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  );
}

// Skeleton block
function SkeletonBlock({ width = '100%', height = '1rem' }) {
  return (
    <div
      className="bg-slate-200 rounded animate-pulse"
      style={{ width, height }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-3">
      <SkeletonBlock width="60%" />
      <SkeletonBlock width="40%" />
      <SkeletonBlock width="80%" height="0.75rem" />
      <SkeletonBlock width="70%" height="0.75rem" />
      <SkeletonBlock width="50%" height="0.75rem" />
    </div>
  );
}

function StatusBadge({ status }: { status: Health }) {
  const statusClass =
    status === 'ok'
      ? 'bg-green-100 text-green-800 border-green-300'
      : status === 'feil'
      ? 'bg-red-100 text-red-800 border-red-300'
      : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm mt-4 ${statusClass}`}
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${
          status === 'ok'
            ? 'bg-green-500'
            : status === 'feil'
            ? 'bg-red-500'
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
    <div className="space-y-2 text-xs text-slate-700">
      {history.map((entry, i) => {
        const ratio = entry.durationMs
          ? Math.min(100, (entry.durationMs / maxDuration) * 100)
          : 5;

        const barColor =
          entry.status === 'ok'
            ? 'bg-green-500'
            : entry.status === 'feil'
            ? 'bg-red-500'
            : 'bg-slate-400';

        return (
          <div key={i} className="flex items-center gap-2">
            <div className="w-20">{entry.time.toLocaleTimeString()}</div>
            <div className="flex-1 h-2 bg-slate-200 rounded overflow-hidden">
              <div className={`h-full ${barColor}`} style={{ width: `${ratio}%` }} />
            </div>
            <div className="w-16 text-right">
              {entry.durationMs ? `${Math.round(entry.durationMs)} ms` : '-'}
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

  const healthUrl = useMemo(() => `${API_BASE_URL}/health`, []);
  const dbInfoUrl = useMemo(() => `${API_BASE_URL}/dbinfo`, []);

  const checkBackend = useCallback(async () => {
    setChecking(true);
    setMessage('');

    const start = performance.now();
    let newStatus: Health = 'ukjent';

    try {
      const res = await fetch(healthUrl);
      setHttpCode(res.status);

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
          httpCode,
          durationMs,
        };
        return [entry, ...prev].slice(0, 10);
      });
    }
  }, [healthUrl, httpCode]);

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
      subtitle="Health-check og responstider for backend."
      maxWidthClassName="max-w-6xl"
    >
      {backendLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="mb-4 p-3 text-sm text-yellow-900 bg-yellow-100 border border-yellow-300 rounded-xl flex items-center"
        >
          <Spinner />
          Backend vil starte snart (kanskje)…
        </motion.div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
          <Card title="Backend-status">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Health-endepunkt:</span>
              <br />
              <span className="text-xs break-all text-slate-500">{healthUrl}</span>
            </p>

            {backendLoading ? (
              <div className="space-y-4 mt-4">
                <SkeletonBlock width="30%" height="1.5rem" />
                <SkeletonCard />
              </div>
            ) : (
              <>
                <StatusBadge status={status} />
                <p className="mt-3 text-sm text-slate-600">
                  Sist sjekket: {lastChecked ? lastChecked.toLocaleTimeString() : 'Aldri'}
                </p>
                <p className="text-sm text-slate-600">HTTP-kode (health): {httpCode ?? '-'}</p>
                <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Melding:</span> {message}
                </div>
              </>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Detaljert helsesjekk">
            {dbStatus === 'ok' ? (
              <div className="text-sm">
                <p className="text-slate-700">
                  <span className="font-semibold">DB-endepunkt:</span>
                  <br />
                  <span className="text-xs break-all text-slate-500">{dbInfoUrl}</span>
                </p>
                <p className={`mt-2 ${dbStatusClass}`}>
                  Status: {dbStatus === 'ok' ? 'OK' : dbStatus === 'feil' ? 'Feil' : 'Ukjent'}
                </p>
                <p className="text-sm text-slate-700">HTTP-kode (dbinfo): {dbHttpCode ?? '-'}</p>
                <div className="mt-3 rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
                  <span className="font-semibold">DB-melding:</span> {dbMessage || 'Ingen sjekk ennå.'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <SkeletonBlock width="50%" />
                <SkeletonBlock width="30%" />
                <SkeletonCard />
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-3">
          <Card title="Responstid & logg">
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
