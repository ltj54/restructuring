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

const pulseAnimation = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.12, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 1.6, repeat: Infinity },
  },
};

function StatusBadge({ status }: { status: Health }) {
  const statusClass =
    status === 'ok'
      ? 'bg-green-100 text-green-800 border-green-300'
      : status === 'feil'
      ? 'bg-red-100 text-red-800 border-red-300'
      : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <motion.div
      variants={pulseAnimation}
      initial="initial"
      animate="animate"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm mt-4 ${statusClass}`}
      aria-live="polite"
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
    </motion.div>
  );
}

function HistoryList({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-700">Ingen historikk ennå.</p>;
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

  const helloUrl = useMemo(() => `${API_BASE_URL}/hello`, []);
  const dbInfoUrl = useMemo(() => `${API_BASE_URL}/dbinfo`, []);

  const checkBackend = useCallback(async () => {
    setChecking(true);
    setMessage('');

    const start = performance.now();
    let newStatus: Health = 'ukjent';
    let newHttp: number | null = null;

    try {
      const res = await fetch(helloUrl);
      newHttp = res.status;
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
          httpCode: newHttp,
          durationMs,
        };
        return [entry, ...prev].slice(0, 10);
      });
    }
  }, [helloUrl]);

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

  // 🔁 AUTO-LOOP: Backend → (hvis OK) DB → stopp når begge OK
  useEffect(() => {
    let intervalId: number | null = null;

    async function autoCheck() {
      await checkBackend();

      if (status === 'ok') {
        await checkDb();
      }

      if (status === 'ok' && dbStatus === 'ok') {
        if (intervalId) {
          clearInterval(intervalId);
        }
        return;
      }
    }

    autoCheck();
    intervalId = window.setInterval(autoCheck, 3000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [status, dbStatus, checkBackend, checkDb]);

  const dbStatusClass =
    dbStatus === 'ok' ? 'text-green-700' : dbStatus === 'feil' ? 'text-red-700' : 'text-slate-700';

  return (
    <PageLayout
      title="Systemstatus"
      subtitle="Health-check og responstider for backend."
      maxWidthClassName="max-w-6xl"
    >
      {/* 🔥 ANIMASJON: Viser kun mens backend starter */}
      {status !== 'ok' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 text-sm text-orange-800 bg-orange-100 border border-orange-300 rounded-xl"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            Starter backend … (Render kan bruke litt tid)
          </motion.div>
        </motion.div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2"
        >
          <Card title="Backend-status">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Hello-endepunkt:</span>
              <br />
              <span className="text-xs break-all text-slate-500">{helloUrl}</span>
            </p>

            <StatusBadge status={status} />

            <p className="mt-3 text-sm text-slate-600">
              Sist sjekket: {lastChecked ? lastChecked.toLocaleTimeString() : 'Aldri'}
            </p>
            <p className="text-sm text-slate-600">HTTP-kode (hello): {httpCode ?? '-'}</p>

            <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
              <span className="font-semibold">Melding:</span> {message}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Detaljert helsesjekk">
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
                <span className="font-semibold">DB-melding:</span>{' '}
                {dbMessage || 'Ingen sjekk ennå.'}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-3"
        >
          <Card title="Responstid & logg">
            <HistoryList history={history} />
          </Card>
        </motion.div>
      </section>
    </PageLayout>
  );
}
