import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchJson } from '@/utils/api';

type PersonaKey = 'it' | 'flyger' | 'helse' | 'industri' | 'annet';

const personaTips: Record<PersonaKey, string[]> = {
  it: [
    'Sjekk plikter/kontrakt ved outsourcing (inkl. personvern).',
    'Oppdater CV (cloud/DevOps/security) og aktiver nettverk.',
    'Vurder konsulentløp eller sertifisering (AWS/Azure).',
  ],
  flyger: [
    'Sjekk regelverk for lisens/helse og klagemuligheter.',
    'Avklar omplassering/overgangsstøtte via arbeidsgiver/NAV.',
    'Kartlegg overførbare ferdigheter: sikkerhet, prosedyrer, operativ ledelse.',
  ],
  helse: [
    'Rettigheter ved omorganisering/turnusendring og etter- og videreutdanning.',
    'Dokumenter autorisasjon/kurs og interne karriereløp.',
    'Hold oversikt over arbeidsmiljø og HMS-regelverk.',
  ],
  industri: [
    'Sjekk oppsigelsesvern og krav på sluttpakke ved nedbemanning.',
    'Vurder fagskole eller teknisk etterutdanning.',
    'NAV tilbyr kurs for teknisk drift, logistikk og industriroller.',
  ],
  annet: [
    'Sjekk arbeidskontrakt, lønnskrav og eventuell sluttavtale.',
    'Skriv CV og profiltekst som viser overførbare ferdigheter.',
    'Utforsk NAVs karriereveiledning og støtteordninger.',
  ],
};

const personaLabels: Record<PersonaKey, string> = {
  it: 'IT',
  industri: 'Industri',
  helse: 'Helse',
  flyger: 'Flyger',
  annet: 'Annet',
};

const NEED_OPTIONS: string[] = [
  'Få oversikt over rettigheter og avtaler',
  'Forstå hva omstillingen betyr for lønn og økonomi',
  'Planlegge neste karrieresteg',
  'Snakke med noen om situasjonen',
  'Få kontroll på forsikringer og inntektssikring',
];

const phaseOptions = ['Før omstilling', 'Under omstilling', 'Etter omstilling'];

type UserPlanResponse = {
  persona: string | null;
  phase: string | null;
  needs: string[] | null;
};

export default function WizardPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [persona, setPersona] = useState<PersonaKey | null>(null);
  const [phase, setPhase] = useState<string>(phaseOptions[0]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('myPlan');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserPlanResponse;
        if (parsed.persona) {
          const key = (Object.entries(personaLabels).find(
            ([, label]) => label === parsed.persona
          ) ?? [null])[0] as PersonaKey | null;
          setPersona(key);
        }
        if (parsed.phase) setPhase(parsed.phase);
        if (parsed.needs) setNeeds(parsed.needs);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const personaDisplay = useMemo(
    () => (persona ? personaLabels[persona] : 'Ikke valgt'),
    [persona]
  );

  const toggleNeed = (option: string) => {
    setNeeds((current) =>
      current.includes(option) ? current.filter((n) => n !== option) : [...current, option]
    );
  };

  const handleSave = async () => {
    setStatus(null);

    if (!persona) {
      setStatus('Velg en rolle/persona for å fortsette.');
      return;
    }

    const plan: UserPlanResponse = {
      persona: personaLabels[persona],
      phase,
      needs,
    };

    localStorage.setItem('myPlan', JSON.stringify(plan));
    localStorage.setItem('personaLabel', personaLabels[persona]);

    if (isAuthenticated) {
      try {
        await fetchJson('/plan/me', {
          method: 'PUT',
          body: {
            persona: plan.persona,
            phase: plan.phase,
            needs: plan.needs,
          },
        });
        setStatus('Planen er lagret på brukeren din.');
      } catch {
        setStatus('Kunne ikke lagre planen hos serveren, men den er lagret lokalt.');
      }
    } else {
      setStatus('Planen er lagret lokalt for denne nettleseren.');
    }

    navigate(`/plan?phase=${encodeURIComponent(plan.phase ?? '')}`);
  };

  return (
    <PageLayout
      title="Veiviser"
      subtitle="Velg rolle, fase og behov – så bygger vi planen din."
      maxWidthClassName="max-w-5xl"
      actions={
        <Button
          to="/plan"
          className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold"
        >
          Gå til plan
        </Button>
      }
    >
      <div className="space-y-6">
        <Card title="Velg situasjonen din">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(personaLabels) as PersonaKey[]).map((key) => {
              const isSelected = persona === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPersona(key)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="font-semibold">{personaLabels[key]}</div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
                    {personaTips[key].slice(0, 2).map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Velg fase og behov">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold mb-2">Fase</div>
              <div className="flex flex-wrap gap-2">
                {phaseOptions.map((option) => {
                  const active = phase === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPhase(option)}
                      className={`px-3 py-2 rounded-full text-xs border ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Hva trenger du nå?</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NEED_OPTIONS.map((need) => {
                  const active = needs.includes(need);
                  return (
                    <label
                      key={need}
                      className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={active}
                        onChange={() => toggleNeed(need)}
                      />
                      {need}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Oppsummering">
          <p className="text-sm text-slate-700 mb-3">
            <strong>Persona:</strong> {personaDisplay} <br />
            <strong>Fase:</strong> {phase} <br />
            <strong>Behov:</strong> {needs.length > 0 ? needs.join(', ') : 'Ingen valgt ennå'}
          </p>

          {status && <p className="text-sm text-slate-600 mb-3">{status}</p>}

          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleSave}>Lagre og gå til plan</Button>
            <Button to="/" className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Tilbake til start
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
