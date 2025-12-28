import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';

type TopFocus = 'economy' | 'checklists' | 'links';

type EconomyTab = 'monthly' | 'buffer' | 'dagpenger';

type ChecklistGroupKey = 'okonomi' | 'jobb' | 'mental';

type ChecklistItem = {
  id: string;
  text: string;
};

const STORAGE_KEYS = {
  checklistState: 'resources_checklists_v1',
};

function clampNumber(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n;
}

function parseNumber(value: string): number {
  // Accept "1 234", "1.234", "1234", "1234,56"
  const cleaned = value
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const n = Number(cleaned);
  return clampNumber(n);
}

function formatKr(n: number): string {
  const value = Math.round(clampNumber(n));
  return value.toLocaleString('nb-NO') + ' kr';
}

function formatMonths(n: number): string {
  const v = Math.max(0, clampNumber(n));
  if (!Number.isFinite(v)) return '0 mnd';
  if (v < 1) return `${(Math.round(v * 10) / 10).toLocaleString('nb-NO')} mnd`;
  return `${Math.round(v)} mnd`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const checklistGroups: Record<
  ChecklistGroupKey,
  { title: string; subtitle: string; items: ChecklistItem[] }
> = {
  okonomi: {
    title: 'Økonomi',
    subtitle: 'Få kontroll på tallene først – det gir ro.',
    items: [
      { id: 'ok-1', text: 'Lag oversikt over faste utgifter (husleie/lån, strøm, mat, mobil osv.)' },
      { id: 'ok-2', text: 'Se hvor lenge bufferen varer ved ulike scenarioer' },
      { id: 'ok-3', text: 'Sjekk dagpengerettigheter og hva du realistisk kan få utbetalt' },
      { id: 'ok-4', text: 'Kutt 1–3 midlertidige utgifter (kun i en periode)' },
    ],
  },
  jobb: {
    title: 'Jobb',
    subtitle: 'Små steg som øker fart uten stress.',
    items: [
      { id: 'jb-1', text: 'Oppdater CV (kort og tydelig) + LinkedIn' },
      { id: 'jb-2', text: 'Kontakt 2–3 personer i nettverk (lav terskel, kort melding)' },
      { id: 'jb-3', text: 'Lag en liste med 10 relevante stillinger / selskaper' },
      { id: 'jb-4', text: 'Sett et mål: 3–5 søknader per uke (eller mindre hvis du må)' },
    ],
  },
  mental: {
    title: 'Tanker & støtte',
    subtitle: 'Hold hodet ryddig mens du står i det.',
    items: [
      { id: 'mt-1', text: 'Skriv 5 minutter om dagen: “Hva bekymrer meg – og hva kan jeg gjøre i dag?”' },
      { id: 'mt-2', text: 'Ta en liten pause hver dag (gåtur / trening / luft)' },
      { id: 'mt-3', text: 'Avtal én samtale med noen du stoler på denne uken' },
      { id: 'mt-4', text: 'Bestem en “nok for i dag”-grense (for å unngå overtenking)' },
    ],
  },
};

const usefulLinks = [
  {
    section: 'Offentlig',
    items: [
      { label: 'NAV – dagpenger', href: 'https://www.nav.no/dagpenger' },
      { label: 'NAV – meldekort', href: 'https://www.nav.no/meldekort' },
      { label: 'Skatteetaten – skattekort', href: 'https://www.skatteetaten.no/person/skatt/skattekort/' },
    ],
  },
  {
    section: 'Jobb',
    items: [
      { label: 'Arbeidsplassen.no – finn stillinger', href: 'https://arbeidsplassen.nav.no/' },
      { label: 'LinkedIn – jobber', href: 'https://www.linkedin.com/jobs/' },
    ],
  },
  {
    section: 'Kompetanse',
    items: [
      { label: 'Coursera – kurs', href: 'https://www.coursera.org/' },
      { label: 'Google Digital Garage', href: 'https://learndigital.withgoogle.com/digitalgarage' },
    ],
  },
];

export default function ResourcesPage(): React.ReactElement {
  const [topFocus, setTopFocus] = useState<TopFocus>('economy');
  const [economyTab, setEconomyTab] = useState<EconomyTab>('monthly');

  // Monthly overview inputs
  const [incomeNet, setIncomeNet] = useState<string>('');
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('');
  const [buffer, setBuffer] = useState<string>('');

  // Dagpenger input (simplified)
  const [gross12m, setGross12m] = useState<string>('');

  // Checklist state
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Status UI
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.checklistState);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      if (parsed && typeof parsed === 'object') setChecked(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.checklistState, JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked]);

  const incomeNetN = useMemo(() => parseNumber(incomeNet), [incomeNet]);
  const monthlyExpensesN = useMemo(() => parseNumber(monthlyExpenses), [monthlyExpenses]);
  const bufferN = useMemo(() => parseNumber(buffer), [buffer]);
  const gross12mN = useMemo(() => parseNumber(gross12m), [gross12m]);

  const monthlySurplus = useMemo(() => incomeNetN - monthlyExpensesN, [incomeNetN, monthlyExpensesN]);
  const bufferMonths = useMemo(() => {
    if (monthlyExpensesN <= 0) return 0;
    return bufferN / monthlyExpensesN;
  }, [bufferN, monthlyExpensesN]);

  // Very simplified dagpenger estimate:
  // "62.4%" basis – we present it as a rough monthly estimate based on average monthly gross.
  const estimatedDagpengerMonthly = useMemo(() => {
    const monthlyGrossAvg = gross12mN / 12;
    return monthlyGrossAvg * 0.624;
  }, [gross12mN]);

  const differenceVsNet = useMemo(() => {
    // Compare against net income input if user provided it; otherwise compare vs monthly gross avg
    if (incomeNetN > 0) return estimatedDagpengerMonthly - incomeNetN;
    const monthlyGrossAvg = gross12mN / 12;
    return estimatedDagpengerMonthly - monthlyGrossAvg;
  }, [estimatedDagpengerMonthly, incomeNetN, gross12mN]);

  const resetStatusSoon = () => {
    window.setTimeout(() => setStatus(null), 3500);
  };

  const handleCopyEconomySummary = async () => {
    const lines: string[] = [];

    if (economyTab === 'monthly') {
      lines.push('Økonomi – månedlig oversikt');
      lines.push(`Netto inntekt per måned: ${incomeNetN > 0 ? formatKr(incomeNetN) : 'ikke oppgitt'}`);
      lines.push(`Utgifter per måned: ${monthlyExpensesN > 0 ? formatKr(monthlyExpensesN) : 'ikke oppgitt'}`);
      lines.push(`Overskudd/underskudd: ${formatKr(monthlySurplus)}`);
      if (bufferN > 0 && monthlyExpensesN > 0) {
        lines.push(`Buffer: ${formatKr(bufferN)} (~${formatMonths(bufferMonths)})`);
      } else {
        lines.push('Buffer: ikke oppgitt');
      }
      lines.push('');
      lines.push('Neste steg (forslag):');
      lines.push(monthlySurplus < 0 ? '• Reduser 1–3 utgifter midlertidig eller øk inntekt hvis mulig.' : '• Sett av litt til buffer dersom du kan.');
      lines.push('• Sjekk dagpenger/inntekt ved endring hvis relevant.');
    }

    if (economyTab === 'buffer') {
      lines.push('Økonomi – buffer');
      lines.push(`Buffer på konto: ${bufferN > 0 ? formatKr(bufferN) : 'ikke oppgitt'}`);
      lines.push(`Månedlige utgifter: ${monthlyExpensesN > 0 ? formatKr(monthlyExpensesN) : 'ikke oppgitt'}`);
      lines.push(`Buffer dekker: ${monthlyExpensesN > 0 ? formatMonths(bufferMonths) : '0 mnd'}`);
      lines.push('');
      lines.push('Neste steg (forslag):');
      lines.push('• Sett et mål (f.eks. 3–6 mnd utgifter) og planlegg små innskudd.');
      lines.push('• Lag “nød-budsjett” med bare nødvendige kostnader.');
    }

    if (economyTab === 'dagpenger') {
      lines.push('Økonomi – dagpenger (grovt estimat)');
      lines.push(`Brutto inntekt siste 12 mnd: ${gross12mN > 0 ? formatKr(gross12mN) : 'ikke oppgitt'}`);
      lines.push(`Estimert dagpenger per måned: ${formatKr(estimatedDagpengerMonthly)}`);
      if (incomeNetN > 0) {
        const sign = differenceVsNet >= 0 ? '+' : '';
        lines.push(`Forskjell vs netto nå: ${sign}${formatKr(differenceVsNet)}`);
      }
      lines.push('');
      lines.push('NB: Dette er et grovt estimat basert på 62,4% og forenklede antakelser.');
      lines.push('Sjekk NAV for faktiske regler, tak og beregningsgrunnlag.');
    }

    const text = lines.join('\n');

    const ok = await copyToClipboard(text);
    setStatus(ok ? 'Kopiert! Lim inn i journalen.' : 'Kunne ikke kopiere automatisk. Marker teksten manuelt.');
    resetStatusSoon();
  };

  const handleToggleChecklist = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyChecklistSummary = async () => {
    const done = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => k);

    const lines: string[] = [];
    lines.push('Sjekklister – status');
    lines.push('');

    (Object.keys(checklistGroups) as ChecklistGroupKey[]).forEach((key) => {
      const group = checklistGroups[key];
      lines.push(group.title);
      group.items.forEach((it) => {
        const mark = done.includes(it.id) ? '✅' : '☐';
        lines.push(`${mark} ${it.text}`);
      });
      lines.push('');
    });

    const ok = await copyToClipboard(lines.join('\n'));
    setStatus(ok ? 'Sjekkliste kopiert! Lim inn i journalen.' : 'Kunne ikke kopiere automatisk.');
    resetStatusSoon();
  };

  return (
    <PageLayout
      title="Ressurser"
      subtitle="Små verktøy som gir oversikt og ro. Én nyttig ting nå – resten kan vente."
      maxWidthClassName="max-w-6xl"
      actions={
        <Button to="/journal" variant="secondary">
          Gå til journal
        </Button>
      }
    >
      <div className="space-y-8">

        {/* TOP FOCUS */}
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Hva vil du gjøre akkurat nå?</h2>
              <p className="mt-1 text-sm text-slate-600">
                Velg ett spor. Du kan alltid bytte senere.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTopFocus('economy')}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  topFocus === 'economy'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-slate-200 hover:border-emerald-200'
                }`}
              >
                Økonomi
              </button>
              <button
                type="button"
                onClick={() => setTopFocus('checklists')}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  topFocus === 'checklists'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-slate-200 hover:border-emerald-200'
                }`}
              >
                Sjekklister
              </button>
              <button
                type="button"
                onClick={() => setTopFocus('links')}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  topFocus === 'links'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-slate-200 hover:border-emerald-200'
                }`}
              >
                Nyttige lenker
              </button>
            </div>
          </div>

          {status && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {status}{' '}
              <span className="ml-2 text-emerald-800">
                <Link to="/journal" className="underline">
                  Åpne journal
                </Link>
              </span>
            </div>
          )}
        </Card>

        {/* ECONOMY */}
        {topFocus === 'economy' && (
          <div className="space-y-6">
            <Card title="Økonomi – velg verktøy">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEconomyTab('monthly')}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    economyTab === 'monthly'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  Månedlig oversikt
                </button>
                <button
                  type="button"
                  onClick={() => setEconomyTab('buffer')}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    economyTab === 'buffer'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  Buffer
                </button>
                <button
                  type="button"
                  onClick={() => setEconomyTab('dagpenger')}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    economyTab === 'dagpenger'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  Dagpenger (grovt)
                </button>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Én kalkulator av gangen. Mindre støy – mer fremdrift.
              </p>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* INPUTS */}
              <Card title={economyTab === 'monthly' ? 'Månedlig oversikt' : economyTab === 'buffer' ? 'Buffer' : 'Dagpenger (forenklet)'}>
                <div className="space-y-4">
                  {(economyTab === 'monthly' || economyTab === 'buffer') && (
                    <>
                      {economyTab === 'monthly' && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Hva får du utbetalt per måned nå? (kr)
                          </label>
                          <input
                            value={incomeNet}
                            onChange={(e) => setIncomeNet(e.target.value)}
                            inputMode="numeric"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
                            placeholder="f.eks. 32 000"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Hva bruker du ca per måned? (kr)
                        </label>
                        <input
                          value={monthlyExpenses}
                          onChange={(e) => setMonthlyExpenses(e.target.value)}
                          inputMode="numeric"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
                          placeholder="f.eks. 24 000"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Tenk “nød-budsjett”: det du må betale for å leve ok.
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Hvor stor buffer har du tilgjengelig? (kr)
                        </label>
                        <input
                          value={buffer}
                          onChange={(e) => setBuffer(e.target.value)}
                          inputMode="numeric"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
                          placeholder="f.eks. 80 000"
                        />
                      </div>
                    </>
                  )}

                  {economyTab === 'dagpenger' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Brutto inntekt siste 12 måneder (kr)
                        </label>
                        <input
                          value={gross12m}
                          onChange={(e) => setGross12m(e.target.value)}
                          inputMode="numeric"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
                          placeholder="f.eks. 540 000"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Grovt estimat basert på 62,4%. NAV-regler/tak kan gi annet resultat.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-600">
                          Valgfritt: Hvis du fylte “netto inntekt per måned” i Månedlig oversikt,
                          sammenligner vi estimatet mot den.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button onClick={handleCopyEconomySummary}>Kopier til journal</Button>
                    <Button to="/journal" variant="secondary">
                      Åpne journal
                    </Button>
                  </div>
                </div>
              </Card>

              {/* RESULTS */}
              <Card title="Resultat">
                <div className="space-y-4 text-sm text-slate-700">
                  {economyTab === 'monthly' && (
                    <>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs text-slate-500">Overskudd/underskudd per måned</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">{formatKr(monthlySurplus)}</div>
                        <p className="mt-2 text-xs text-slate-500">
                          Positivt = mer luft. Negativt = må strammes inn midlertidig.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs text-slate-500">Buffer dekker omtrent</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">
                          {monthlyExpensesN > 0 ? formatMonths(bufferMonths) : '0 mnd'}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Basert på månedlige utgifter.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="font-medium text-slate-900">Neste steg (kort)</div>
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          {monthlySurplus < 0 ? (
                            <>
                              <li>• Kutt 1–3 utgifter midlertidig (til du har kontroll).</li>
                              <li>• Lag et nød-budsjett du kan leve med.</li>
                              <li>• Sjekk hva du kan få ved endring (dagpenger/ytelser).</li>
                            </>
                          ) : (
                            <>
                              <li>• Sett av litt til buffer hvis du kan.</li>
                              <li>• Definer “nød-budsjett” for trygghet.</li>
                              <li>• Sjekk forsikringer/inntektssikring hvis relevant.</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </>
                  )}

                  {economyTab === 'buffer' && (
                    <>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs text-slate-500">Buffer på konto</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">{formatKr(bufferN)}</div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs text-slate-500">Dekker omtrent</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">
                          {monthlyExpensesN > 0 ? formatMonths(bufferMonths) : '0 mnd'}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Tommelfinger: 3–6 mnd utgifter gir ofte mer ro.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="font-medium text-slate-900">Neste steg (kort)</div>
                        <ul className="mt-2 space-y-1">
                          <li>• Sett et mål (f.eks. 3 mnd utgifter).</li>
                          <li>• Lag et nød-budsjett.</li>
                          <li>• Planlegg små, automatiske innskudd.</li>
                        </ul>
                      </div>
                    </>
                  )}

                  {economyTab === 'dagpenger' && (
                    <>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs text-slate-500">Estimert dagpenger per måned</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">{formatKr(estimatedDagpengerMonthly)}</div>
                        <p className="mt-2 text-xs text-slate-500">
                          Basert på 62,4% av gjennomsnittlig månedlig brutto (forenklet).
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs text-slate-500">Forskjell</div>
                        <div className="mt-1 text-xl font-semibold text-slate-900">
                          {(differenceVsNet >= 0 ? '+' : '') + formatKr(differenceVsNet)}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Hvis du fylte netto inntekt i Månedlig oversikt, er dette vs den. Ellers vs snitt brutto/12.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="font-medium text-amber-900">Viktig</div>
                        <p className="mt-2 text-sm text-amber-900">
                          NAV-regler, tak og beregningsgrunnlag kan gi helt annet resultat.
                          Bruk dette kun som “føle på størrelsesorden”.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* QUICK LINKS */}
              <Card title="Snarveier">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-medium text-slate-900">Journal</div>
                    <p className="mt-1 text-sm text-slate-700">
                      Kopier resultatet og lim inn i journalen, så har du alt samlet.
                    </p>
                    <div className="mt-3">
                      <Button to="/journal" variant="secondary">
                        Åpne journal
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="font-medium text-slate-900">Plan</div>
                    <p className="mt-1 text-sm text-slate-700">
                      Gå til planen hvis du vil ha en konkret rekkefølge.
                    </p>
                    <div className="mt-3">
                      <Button to="/plan" variant="secondary">
                        Gå til plan
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* CHECKLISTS */}
        {topFocus === 'checklists' && (
          <div className="space-y-6">
            <Card
              title="Sjekklister i omstilling"
              subtitle="Kryss av det du har gjort. Kopier status til journal når du vil."
            >
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleCopyChecklistSummary}>Kopier status til journal</Button>
                <Button to="/journal" variant="secondary">
                  Åpne journal
                </Button>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {(Object.keys(checklistGroups) as ChecklistGroupKey[]).map((key) => {
                const group = checklistGroups[key];
                const total = group.items.length;
                const done = group.items.filter((it) => checked[it.id]).length;

                return (
                  <Card key={key} title={group.title} subtitle={group.subtitle}>
                    <div className="mb-4 text-sm text-slate-600">
                      {done}/{total} gjort
                    </div>

                    <div className="space-y-2">
                      {group.items.map((it) => {
                        const isOn = !!checked[it.id];
                        return (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => handleToggleChecklist(it.id)}
                            className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                              isOn
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-slate-200 bg-white hover:border-emerald-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 h-5 w-5 flex-none rounded border ${
                                  isOn ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'
                                }`}
                                aria-hidden
                              />
                              <div className="text-slate-900">{it.text}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* LINKS */}
        {topFocus === 'links' && (
          <div className="space-y-6">
            <Card title="Nyttige lenker" subtitle="Kuratert og delt opp – så du finner det du trenger raskt.">
              <p className="text-sm text-slate-600">
                Du kan åpne lenkene i ny fane, og lagre det viktigste i journalen.
              </p>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {usefulLinks.map((group) => (
                <Card key={group.section} title={group.section}>
                  <ul className="space-y-3">
                    {group.items.map((it) => (
                      <li key={it.href}>
                        <a
                          href={it.href}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition hover:border-emerald-200"
                        >
                          <span>{it.label}</span>
                          <span className="text-emerald-700 opacity-0 transition group-hover:opacity-100">
                            Åpne →
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
