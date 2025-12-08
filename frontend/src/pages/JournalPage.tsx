import React, { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import Card from "@/components/Card";
import { API_BASE_URL } from "@/utils/config";

type JournalEntry = {
  id: number;
  phase: number;
  content: string;
  createdAt: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JournalPage(): React.ReactElement {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/journal/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          const message =
            res.status === 401
              ? "Du må være logget inn for å se dagboken."
              : "Kunne ikke hente dagboken.";
          setError(message);
          return;
        }
        const data = await res.json();
        setEntries(data);
      } catch {
        setError("Kunne ikke hente dagboken.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const phases = {
    1: "Fase 1 – Kartlegging",
    2: "Fase 2 – Kompetanseløft",
    3: "Fase 3 – Aktiv jobbsøking",
    4: "Fase 4 – Ny jobb",
  };

  const grouped = { 1: [], 2: [], 3: [], 4: [] } as Record<number, JournalEntry[]>;

  for (const e of entries) {
    grouped[e.phase].push(e);
  }

  return (
    <PageLayout
      title="Dagbok"
      subtitle="Notater og refleksjoner fra din omstillingsreise."
      maxWidthClassName="max-w-4xl"
    >
      {loading && <div>Laster...</div>}

      {!loading && error && <div className="text-red-600 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((phase) => (
            <Card key={phase} title={phases[phase]}>
              {grouped[phase].length === 0 && (
                <div className="text-slate-500 text-sm">
                  Ingen notater i denne fasen ennå.
                </div>
              )}

              <div className="space-y-4">
                {grouped[phase].map((entry) => (
                  <div key={entry.id} className="relative pl-5 border-l border-slate-200">
                    <div className="absolute -left-1 top-1 h-3 w-3 rounded-full bg-emerald-600"></div>

                    <div className="text-xs text-slate-500 mb-1">
                      {formatDate(entry.createdAt)}
                    </div>

                    <div className="whitespace-pre-wrap text-sm text-slate-800">
                      {entry.content}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
