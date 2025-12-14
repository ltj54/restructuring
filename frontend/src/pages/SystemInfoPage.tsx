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

type HealthResponse = {
  status?: string;
  timestamp?: string;
};

type UsersResponse = {
  users: UserRow[];
  offset: number;
  limit: number;
  total?: number;
  hasMore: boolean;
};

type UserRow = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  ssn?: string | null;
};

const USERS_PAGE_SIZE = 20;

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
  const [healthDetails, setHealthDetails] = useState<HealthResponse | null>(null);
  const [, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const [dbStatus, setDbStatus] = useState<Health>('ukjent');
  const [dbHttpCode, setDbHttpCode] = useState<number | null>(null);
  const [dbMessage, setDbMessage] = useState<string>('');

  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersOffset, setUsersOffset] = useState<number>(0);
  const [usersHasMore, setUsersHasMore] = useState<boolean>(false);
  const [usersTotal, setUsersTotal] = useState<number | null>(null);

  const [userIdInput, setUserIdInput] = useState<string>('1');
  const [userProfileRaw, setUserProfileRaw] = useState<string>('');
  const [userProfileParsed, setUserProfileParsed] = useState<unknown>(null);
  const [userProfileError, setUserProfileError] = useState<string | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const latestEntry = history[0];
  const healthUpdated = useMemo(
    () => (healthDetails?.timestamp ? new Date(healthDetails.timestamp) : null),
    [healthDetails]
  );

  const healthUrl = useMemo(() => `${API_BASE_URL}/system/health`, []);
  const dbInfoUrl = useMemo(() => `${API_BASE_URL}/system/dbinfo`, []);
  const userProfileBaseUrl = useMemo(() => `${API_BASE_URL}/system/user-profile`, []);
  const usersUrl = useMemo(() => `${API_BASE_URL}/system/users`, []);

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
        const data = (await res.json()) as HealthResponse;
        const timeText = data?.timestamp
          ? ` (oppdatert ${new Date(data.timestamp).toLocaleTimeString()})`
          : '';
        newStatus = 'ok';
        setStatus('ok');
        setHealthDetails(data);
        setMessage(`Backend svarer som forventet.${timeText}`);
      } else {
        newStatus = 'feil';
        setStatus('feil');
        setHealthDetails(null);
        setMessage('Backend svarte, men med feil.');
      }
    } catch {
      newStatus = 'feil';
      setStatus('feil');
      setHttpCode(null);
      setHealthDetails(null);
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
  // Users list
  // ---------------------------------------
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const res = await fetch(`${usersUrl}?offset=${usersOffset}&limit=${USERS_PAGE_SIZE}`);
      if (!res.ok) {
        setUsersError(`Feil fra server (${res.status})`);
        setUsersHasMore(false);
        setUsersTotal(null);
        setUsers([]);
        return;
      }

      const data = (await res.json()) as UsersResponse;
      setUsers(data.users ?? []);
      setUsersHasMore(Boolean(data.hasMore));
      setUsersTotal(typeof data.total === 'number' ? data.total : null);

      if (typeof data.offset === 'number' && data.offset !== usersOffset) {
        setUsersOffset(data.offset);
      }
    } catch {
      setUsersError('Kunne ikke hente brukere.');
      setUsersHasMore(false);
      setUsersTotal(null);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [usersUrl, usersOffset]);

  const handleUsersPrev = useCallback(() => {
    setUsersOffset((prev) => Math.max(0, prev - USERS_PAGE_SIZE));
  }, []);

  const handleUsersNext = useCallback(() => {
    if (usersHasMore) {
      setUsersOffset((prev) => prev + USERS_PAGE_SIZE);
    }
  }, [usersHasMore]);

  // ---------------------------------------
  // User profile
  // ---------------------------------------
  const fetchUserProfile = useCallback(async () => {
    const trimmed = userIdInput.trim();
    if (!trimmed) {
      setUserProfileError('Oppgi et bruker-ID.');
      return;
    }

    const id = Number(trimmed);
    if (!Number.isFinite(id) || id < 0) {
      setUserProfileError('Bruker-ID må være et positivt tall.');
      return;
    }

    setUserProfileLoading(true);
    setUserProfileError(null);
    setUserProfileParsed(null);

    try {
      const res = await fetch(`${userProfileBaseUrl}/${id}`);
      const text = await res.text();
      setUserProfileRaw(text);

      if (!res.ok) {
        setUserProfileError(`Feil fra server (${res.status})`);
        return;
      }

      try {
        const parsed = JSON.parse(text);
        setUserProfileParsed(parsed);
      } catch {
        setUserProfileParsed(text);
      }
    } catch {
      setUserProfileError('Kunne ikke hente brukerprofil.');
      setUserProfileRaw('');
    } finally {
      setUserProfileLoading(false);
    }
  }, [userIdInput, userProfileBaseUrl]);

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

  // Hent brukere én gang når backend er ok
  useEffect(() => {
    if (status === 'ok') {
      fetchUsers();
    }
  }, [status, fetchUsers]);

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

            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold text-slate-700">Detaljer (fra health-endepunktet)</p>
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-600 md:grid-cols-2">
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-semibold text-slate-800">{healthDetails?.status ?? '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Timestamp</p>
                  <p className="font-semibold text-slate-800">
                    {healthUpdated ? healthUpdated.toLocaleString() : '-'}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
                <p className="mb-1 font-semibold text-slate-600">Rådata</p>
                <pre className="overflow-auto whitespace-pre-wrap">
                  {healthDetails ? JSON.stringify(healthDetails, null, 2) : 'Ingen data ennå.'}
                </pre>
              </div>
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

      {/* --------------------------------------- */}
      {/* USERS TABLE */}
      {/* --------------------------------------- */}
      <Card title="Brukere (get_users)" className="mt-6">
        <div className="space-y-3 text-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-slate-600">
              <p>Lister id, email, first_name, last_name, ssn</p>
              <p className="text-xs text-slate-500">
                Viser{' '}
                {users.length > 0 ? `${usersOffset + 1}-${usersOffset + users.length}` : '-'}
                {typeof usersTotal === 'number' ? ` av ${usersTotal}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUsersPrev}
                disabled={usersLoading || usersOffset === 0}
                className="inline-flex items-center rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                Forrige
              </button>
              <button
                onClick={handleUsersNext}
                disabled={usersLoading || !usersHasMore}
                className="inline-flex items-center rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                Neste
              </button>
              <button
                onClick={fetchUsers}
                disabled={usersLoading}
                className="inline-flex items-center rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {usersLoading ? 'Oppdaterer...' : 'Oppdater'}
              </button>
            </div>
          </div>

          {usersError && (
            <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {usersError}
            </div>
          )}

          <div className="overflow-auto rounded border border-slate-200 bg-white">
            <table className="min-w-full text-xs text-slate-800">
              <thead className="bg-slate-50 text-left font-semibold text-slate-600">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">First name</th>
                  <th className="px-3 py-2">Last name</th>
                  <th className="px-3 py-2">SSN</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td className="px-3 py-3 text-center text-slate-500" colSpan={5}>
                      Laster ...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-center text-slate-500" colSpan={5}>
                      Ingen brukere funnet.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{u.id}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.first_name ?? '-'}</td>
                      <td className="px-3 py-2">{u.last_name ?? '-'}</td>
                      <td className="px-3 py-2">{u.ssn ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* --------------------------------------- */}
      {/* USER PROFILE */}
      {/* --------------------------------------- */}
      <Card title="Brukerprofil (get_user_profile)" className="mt-6">
        <div className="space-y-4 text-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex flex-1 items-center gap-2">
              <label htmlFor="userId" className="text-xs text-slate-600">
                Bruker-ID
              </label>
              <input
                id="userId"
                type="number"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                className="w-32 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                min={0}
              />
            </div>
            <button
              onClick={fetchUserProfile}
              disabled={userProfileLoading}
              className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {userProfileLoading ? 'Henter...' : 'Hent profil'}
            </button>
          </div>

          {userProfileError && (
            <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {userProfileError}
            </div>
          )}

          {userProfileRaw && !userProfileError && (
            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <p className="mb-1 font-semibold text-slate-700">Rådata</p>
              <pre className="overflow-auto whitespace-pre-wrap text-[11px] leading-snug">
                {userProfileRaw}
              </pre>
            </div>
          )}

          {userProfileParsed && typeof userProfileParsed === 'object' && (
            <div className="rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
              <p className="mb-2 font-semibold text-slate-700">Parset JSON</p>
              <pre className="overflow-auto whitespace-pre-wrap text-[11px] leading-snug">
                {JSON.stringify(userProfileParsed, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>
    </PageLayout>
  );
}
