import React, { useCallback, useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { API_BASE_URL, fetchJson, isApiError } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

type Health = 'ok' | 'feil' | 'ukjent';

type HealthResponse = {
  status: string;
  timestamp?: string;
  details?: Record<string, unknown>;
};

type HistoryEntry = {
  time: Date;
  status: Health;
  httpCode: number | null;
  durationMs: number;
};

type UsersResponse = {
  offset?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
  users?: Array<Record<string, unknown>>;
  error?: string;
};

export default function SystemInfoPage() {
  const { token } = useAuth();

  const [healthStatus, setHealthStatus] = useState<Health>('ukjent');
  const [healthHttpCode, setHealthHttpCode] = useState<number | null>(null);
  const [healthDurationMs, setHealthDurationMs] = useState<number | null>(null);
  const [healthMessage, setHealthMessage] = useState('');
  const [healthDetails, setHealthDetails] = useState<HealthResponse | null>(null);
  const [healthLastChecked, setHealthLastChecked] = useState<Date | null>(null);

  const [dbStatus, setDbStatus] = useState<Health>('ukjent');
  const [dbHttpCode, setDbHttpCode] = useState<number | null>(null);
  const [dbDurationMs, setDbDurationMs] = useState<number | null>(null);
  const [dbMessage, setDbMessage] = useState('');

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [usersOffset, setUsersOffset] = useState(0);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersHasMore, setUsersHasMore] = useState(false);

  const [userIdInput, setUserIdInput] = useState('');
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileError, setUserProfileError] = useState('');
  const [userProfileRaw, setUserProfileRaw] = useState('');

  const healthUrl = `${API_BASE_URL}/system/health`;
  const dbInfoUrl = `${API_BASE_URL}/system/dbinfo`;
  const userProfileBaseUrl = `${API_BASE_URL}/system/user-profile`;

  const healthLabel =
    healthStatus === 'ok' ? 'Online' : healthStatus === 'feil' ? 'Feil' : 'Ukjent';
  const dbLabel = dbStatus === 'ok' ? 'Online' : dbStatus === 'feil' ? 'Feil' : 'Ukjent';
  const badgeClass = (state: Health) =>
    state === 'ok'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
      : state === 'feil'
        ? 'bg-rose-100 text-rose-900 border-rose-200'
        : 'bg-slate-100 text-slate-700 border-slate-200';

  const checkBackend = useCallback(async () => {
    const start = performance.now();
    try {
      const data = await fetchJson<HealthResponse>('/system/health');
      const durationMs = Math.round(performance.now() - start);
      setHealthStatus('ok');
      setHealthHttpCode(200);
      setHealthDurationMs(durationMs);
      setHealthDetails(data);
      setHealthMessage(
        data?.timestamp
          ? `Backend svarer som forventet. (oppdatert ${new Date(
              data.timestamp
            ).toLocaleTimeString()})`
          : 'Backend svarer som forventet.'
      );
      setHealthLastChecked(new Date());
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      setHealthStatus('feil');
      setHealthDurationMs(durationMs);
      if (isApiError(err)) {
        setHealthHttpCode(err.status ?? null);
        if (err.status === 401 || err.status === 403) {
          setHealthMessage('Ingen tilgang. Logg inn som ADMIN.');
        } else {
          setHealthMessage('Backend svarte, men med feil.');
        }
      } else {
        setHealthHttpCode(null);
        setHealthMessage('Klarte ikke kontakte backend.');
      }
      setHealthDetails(null);
      setHealthLastChecked(new Date());
    } finally {
      setHistory((prev) => {
        const entry: HistoryEntry = {
          time: new Date(),
          status: healthStatus,
          httpCode: healthHttpCode,
          durationMs: healthDurationMs ?? 0,
        };
        return [entry, ...prev].slice(0, 10);
      });
    }
  }, [healthStatus, healthHttpCode, healthDurationMs]);

  const checkDb = useCallback(async () => {
    const start = performance.now();
    try {
      const res = await fetch(dbInfoUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const durationMs = Math.round(performance.now() - start);
      setDbDurationMs(durationMs);
      setDbHttpCode(res.status);
      if (!res.ok) {
        setDbStatus('feil');
        setDbMessage(
          res.status === 401 || res.status === 403
            ? 'Ingen tilgang til DB-info.'
            : 'Klarte ikke hente DB-info.'
        );
        return;
      }
      const text = await res.text();
      setDbStatus('ok');
      setDbMessage(text || 'Database ser OK ut.');
    } catch {
      const durationMs = Math.round(performance.now() - start);
      setDbStatus('feil');
      setDbDurationMs(durationMs);
      setDbHttpCode(null);
      setDbMessage('Kunne ikke kontakte DB-endepunktet.');
    }
  }, [dbInfoUrl, token]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await fetchJson<UsersResponse>(
        `/system/users?offset=${usersOffset}&limit=${usersLimit}`
      );
      if (data?.error) {
        setUsersError(String(data.error));
        setUsers([]);
        return;
      }
      setUsers(Array.isArray(data?.users) ? data.users : []);
      setUsersOffset(data?.offset ?? usersOffset);
      setUsersLimit(data?.limit ?? usersLimit);
      setUsersTotal(data?.total ?? 0);
      setUsersHasMore(Boolean(data?.hasMore));
    } catch (err) {
      if (isApiError(err) && (err.status === 401 || err.status === 403)) {
        setUsersError('Ingen tilgang til brukerliste.');
        setUsers([]);
      } else {
        setUsersError('Kunne ikke hente brukere.');
        setUsers([]);
      }
    } finally {
      setUsersLoading(false);
    }
  }, [usersOffset, usersLimit]);

  const fetchUserProfile = useCallback(async () => {
    setUserProfileLoading(true);
    setUserProfileError('');
    setUserProfileRaw('');

    const id = userIdInput.trim();
    if (!id) {
      setUserProfileError('Skriv inn en bruker-ID.');
      setUserProfileLoading(false);
      return;
    }

    try {
      const res = await fetch(`${userProfileBaseUrl}/${encodeURIComponent(id)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        setUserProfileError(
          res.status === 401 || res.status === 403
            ? 'Ingen tilgang til brukerprofil.'
            : 'Kunne ikke hente brukerprofil.'
        );
        setUserProfileLoading(false);
        return;
      }
      const text = await res.text();
      setUserProfileRaw(text);
    } catch {
      setUserProfileError('Kunne ikke hente brukerprofil.');
    } finally {
      setUserProfileLoading(false);
    }
  }, [userIdInput, userProfileBaseUrl, token]);

  useEffect(() => {
    let id: number | null = null;
    async function loop() {
      await checkBackend();
      if (healthStatus === 'ok') {
        await checkDb();
      }
    }
    loop();
    id = window.setInterval(loop, 3000);
    return () => id && clearInterval(id);
  }, [checkBackend, checkDb, healthStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const usersStart = usersTotal === 0 ? 0 : usersOffset + 1;
  const usersEnd = Math.min(usersOffset + users.length, usersTotal);

  return (
    <PageLayout
      title="Systemstatus"
      subtitle="Enkel og ryddig oversikt over backend, database og nylige målinger."
      maxWidthClassName="max-w-6xl"
    >
      <div className="grid grid-cols-1 gap-6">
        <Card title="Backend-status">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-slate-500">Status</div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${badgeClass(
                  healthStatus
                )}`}
              >
                {healthLabel}
              </span>
            </div>
            <div>
              <div className="text-sm text-slate-500">Sist sjekket</div>
              <div className="text-lg font-semibold text-slate-900">
                {healthLastChecked ? healthLastChecked.toLocaleTimeString() : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Health URL</div>
              <div className="text-sm text-slate-700 break-all">{healthUrl}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">HTTP (health)</div>
              <div className="text-lg font-semibold text-slate-900">
                {healthHttpCode ?? '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Responstid</div>
              <div className="text-lg font-semibold text-slate-900">
                {healthDurationMs ?? '-'} ms
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Melding</div>
              <div className="text-sm text-slate-700">{healthMessage || '-'}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-slate-700">
              Detaljer (fra health-endepunktet)
            </div>
            <div className="mt-2 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <div className="text-slate-500">Status</div>
                <div className="font-semibold text-slate-900">
                  {healthDetails?.status ?? '-'}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <div className="text-slate-500">Timestamp</div>
                <div className="font-semibold text-slate-900">
                  {healthDetails?.timestamp
                    ? new Date(healthDetails.timestamp).toLocaleString()
                    : '-'}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm font-semibold text-slate-700">Rådata</div>
            <pre className="mt-2 rounded-xl bg-slate-900 text-slate-50 p-4 text-xs overflow-auto">
              {JSON.stringify(healthDetails ?? {}, null, 2)}
            </pre>
          </div>
        </Card>

        <Card title="Database-status">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-slate-500">Status</div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${badgeClass(
                  dbStatus
                )}`}
              >
                {dbLabel}
              </span>
            </div>
            <div>
              <div className="text-sm text-slate-500">DB URL</div>
              <div className="text-sm text-slate-700 break-all">{dbInfoUrl}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">HTTP (dbinfo)</div>
              <div className="text-lg font-semibold text-slate-900">{dbHttpCode ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Responstid</div>
              <div className="text-lg font-semibold text-slate-900">
                {dbDurationMs ?? '-'} ms
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-slate-500">Melding</div>
              <div className="text-sm text-slate-700">{dbMessage || '-'}</div>
            </div>
          </div>
        </Card>

        <Card title="Responshistorikk">
          <div className="space-y-2 text-sm">
            {history.map((h, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div className="text-slate-700">{h.time.toLocaleTimeString()}</div>
                <div className="text-slate-600">
                  {h.durationMs} ms
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                    h.status
                  )}`}
                >
                  {h.status === 'ok' ? 'Online' : h.status === 'feil' ? 'Feil' : 'Ukjent'}
                </span>
                <div className="text-slate-600">HTTP: {h.httpCode ?? '-'}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Brukere (get_users)">
          <div className="text-sm text-slate-600 mb-3">
            Lister id, email, first_name, last_name, ssn, phone, role
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setUsersOffset(Math.max(0, usersOffset - usersLimit))}
              disabled={usersOffset === 0}
              variant="secondary"
            >
              Forrige
            </Button>
            <Button
              onClick={() => setUsersOffset(usersOffset + usersLimit)}
              disabled={!usersHasMore}
              variant="secondary"
            >
              Neste
            </Button>
            <Button onClick={fetchUsers} disabled={usersLoading}>
              {usersLoading ? 'Laster...' : 'Oppdater'}
            </Button>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Viser {usersStart}-{usersEnd} av {usersTotal}
          </div>
          {usersError && <div className="mt-2 text-sm text-red-600">{usersError}</div>}
          <div className="mt-4 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">First name</th>
                  <th className="px-3 py-2 text-left font-medium">Last name</th>
                  <th className="px-3 py-2 text-left font-medium">SSN</th>
                  <th className="px-3 py-2 text-left font-medium">Telefon</th>
                  <th className="px-3 py-2 text-left font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={idx} className="border-t border-slate-200">
                    <td className="px-3 py-2">{String(u.id ?? '')}</td>
                    <td className="px-3 py-2">{String(u.email ?? '')}</td>
                    <td className="px-3 py-2">{String(u.first_name ?? '')}</td>
                    <td className="px-3 py-2">{String(u.last_name ?? '')}</td>
                    <td className="px-3 py-2">{String(u.ssn ?? '')}</td>
                    <td className="px-3 py-2">{String(u.phone ?? '')}</td>
                    <td className="px-3 py-2">{String(u.role ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Brukerprofil (get_user_profile)">
          <div className="text-sm text-slate-600">Bruker-ID</div>
          <div className="mt-2 flex flex-wrap gap-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="1"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
            />
            <Button onClick={fetchUserProfile} disabled={userProfileLoading}>
              {userProfileLoading ? 'Henter...' : 'Hent profil'}
            </Button>
          </div>
          {userProfileError && (
            <div className="mt-2 text-sm text-red-600">{userProfileError}</div>
          )}
          {userProfileRaw && (
            <pre className="mt-4 rounded-xl bg-slate-900 text-slate-50 p-4 text-xs overflow-auto">
              {userProfileRaw}
            </pre>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
