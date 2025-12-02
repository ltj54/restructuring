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

const WAIT_ESTIMATE_SECONDS = 60;

const pulseAnimation = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.12, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 1.6, repeat: Infinity },
  },
};

function WaitingOverlay({
  waitingForResponse,
  waitingSecondsLeft,
}: {
  waitingForResponse: boolean;
  waitingSecondsLeft: number | null;
}): React.ReactElement | null {
  if (!waitingForResponse) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full px-6 py-5 text-sm text-slate-800"
      >
        <p className="font-semibold text-slate-900">Venter på svar fra tjenesten...</p>
        <p className="mt-2 text-slate-700">
          Backend kjører på Render (gratisversjon), og kan bruke litt tid på å starte opp når den
          har vært inaktiv.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Estimert ventetid:{' '}
          {waitingSecondsLeft !== null
            ? `${waitingSecondsLeft} sekunder`
            : `${WAIT_ESTIMATE_SECONDS} sekunder`}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Popupen forsvinner automatisk så snart vi får svar fra tjenesten.
        </p>
      </motion.div>
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
    <motion.div
      variants={pulseAnimation}
      initial="initial"
      animate="animate"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm mt-4 ${statusClass}`}
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${status === 'ok' ? 'bg-green-500' : status === 'feil' ? 'bg-red-500' : 'bg-slate-500'}`}
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
        const ratio = entry.durationMs ? Math.min(100, (entry.durationMs / maxDuration) * 100) : 5;

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
  const [fullCheckRunning, setFullCheckRunning] = useState<boolean>(false);
  const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
  const [waitingSecondsLeft, setWaitingSecondsLeft] = useState<number | null>(null);

  const startWaitingForResponse = useCallback(() => {
    setWaitingForResponse(true);
    setWaitingSecondsLeft(WAIT_ESTIMATE_SECONDS);
  }, []);

  const stopWaitingForResponse = useCallback(() => {
    setWaitingForResponse(false);
    setWaitingSecondsLeft(null);
  }, []);

  const helloUrl = useMemo(() => `${API_BASE_URL}/hello`, []);
  const dbInfoUrl = useMemo(() => `${API_BASE_URL}/dbinfo`, []);

  const checkBackend = useCallback(async () => {
    setChecking(true);
    setMessage('');
    startWaitingForResponse();

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
      stopWaitingForResponse();
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
  }, [helloUrl, startWaitingForResponse, stopWaitingForResponse]);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  useEffect(() => {
    if (!waitingForResponse) {
      return;
    }

    if (waitingSecondsLeft === 0) {
      setWaitingForResponse(false);
      return;
    }

    const id = window.setInterval(() => {
      setWaitingSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => window.clearInterval(id);
  }, [waitingForResponse, waitingSecondsLeft]);

  const checkDb = useCallback(async () => {
    setDbMessage('');
    startWaitingForResponse();
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
    } finally {
      stopWaitingForResponse();
    }
  }, [dbInfoUrl, startWaitingForResponse, stopWaitingForResponse]);

  const runFullHealthCheck = async () => {
    setFullCheckRunning(true);
    try {
      await checkBackend();
      await checkDb();
    } finally {
      setFullCheckRunning(false);
      // Skjul ventemelding når helsesjekk er ferdig og knappen kan trykkes igjen
      stopWaitingForResponse();
    }
  };

  useEffect(() => {
    // Sørg for at ventemeldingen forsvinner når vi faktisk har fått svar (ok).
    if (status === 'ok' || dbStatus === 'ok') {
      stopWaitingForResponse();
    }
  }, [status, dbStatus, stopWaitingForResponse]);

  const dbStatusClass =
    dbStatus === 'ok' ? 'text-green-700' : dbStatus === 'feil' ? 'text-red-700' : 'text-slate-700';

  return (
    <PageLayout
      title="Systemstatus"
      subtitle="Health-check og responstider for backend."
      maxWidthClassName="max-w-6xl"
    >
      <WaitingOverlay
        waitingForResponse={waitingForResponse}
        waitingSecondsLeft={waitingSecondsLeft}
      />

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
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={runFullHealthCheck}
                disabled={fullCheckRunning}
                className="border border-slate-300 text-slate-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition inline-flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {fullCheckRunning ? 'Kjører full helsesjekk...' : 'Full helsesjekk'}
              </button>
            </div>

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
