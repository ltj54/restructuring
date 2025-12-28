import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchJson } from '@/utils/api';
import {
  DRAFT_KEYS,
  markPlanPendingSync,
  readPlanDraft,
  writePlanDraft,
} from '@/utils/draftSync';

type PersonaKey =
  | 'it'
  | 'industri'
  | 'helse'
  | 'flyger'
  | 'butikk'
  | 'kontor'
  | 'transport'
  | 'salg'
  | 'annet';

const personaLabels: Record<PersonaKey, string> = {
  it: 'IT',
  industri: 'Industri',
  helse: 'Helse og omsorg',
  flyger: 'Flyger / luftfart',
  butikk: 'Butikk og varehandel',
  kontor: 'Kontor og administrasjon',
  transport: 'Transport og logistikk',
  salg: 'Salg og kundeservice',
  annet: 'Annet',
};

const personaShort: Record<PersonaKey, string> = {
  it: 'Outsourcing, endring av kompetanse og roller.',
  industri: 'Nedbemanning, fagbrev og videre vei.',
  helse: 'Omorganisering, autorisasjon og turnus.',
  flyger: 'Lisens, helsekrav og omplassering.',
  butikk: 'Arbeidstid, kontrakt og videre karriere.',
  kontor: 'Digitalisering og nye arbeidsoppgaver.',
  transport: 'Sertifikater, skift og rettigheter.',
  salg: 'Mål, provisjon og videre muligheter.',
  annet: 'Generelle råd om jobb, avtaler og CV.',
};

const phaseOptions = ['Før omstilling', 'Under omstilling', 'Etter omstilling'];

const needOptions = [
  'Få oversikt over rettigheter og avtaler',
  'Forstå hva omstillingen betyr for lønn og økonomi',
  'Planlegge neste karrieresteg',
  'Snakke med noen om situasjonen',
  'Få kontroll på forsikringer og inntektssikring',
];

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

  /* -------------------------
     LOAD DRAFT
  ------------------------- */
  useEffect(() => {
    const stored = readPlanDraft();
    if (!stored) return;

    if (stored.persona) {
      const key = (
        Object.entries(personaLabels).find(([, label]) => label === stored.persona) ?? [
          null,
        ]
      )[0] as PersonaKey | null;
      setPersona(key);
    }
    if (stored.phase) setPhase(stored.phase);
    if (stored.needs) setNeeds(stored.needs);
  }, []);

  /* -------------------------
     SAVE DRAFT
  ------------------------- */
  useEffect(() => {
    if (!persona && needs.length === 0) return;

    writePlanDraft({
      persona: persona ? personaLabels[persona] : undefined,
      phase,
      needs,
    });

    if (!isAuthenticated) {
      markPlanPendingSync();
    }
  }, [persona, phase, needs, isAuthenticated]);

  /* -------------------------
     AUTO SAVE (AUTH)
  ------------------------- */
  useEffect(() => {
    if (!isAuthenticated || !persona) return;

    const handle = window.setTimeout(() => {
      fetchJson('/plan/me', {
        method: 'PUT',
        body: {
          persona: personaLabels[persona],
          phase,
          needs,
        },
      })
        .then(() => {
          localStorage.removeItem(DRAFT_KEYS.planPending);
        })
        .catch(() => undefined);
    }, 600);

    return () => window.clearTimeout(handle);
  }, [persona, phase, needs, isAuthenticated]);

  const personaDisplay = useMemo(
    () => (persona ? personaLabels[persona] : 'Ikke valgt'),
    [persona]
  );

  const toggleNeed = (need: string) =>
    setNeeds((list) =>
      list.includes(need) ? list.filter((n) => n !== need) : [...list, need]
    );

  const handleSave = async () => {
    setStatus(null);

    const plan: UserPlanResponse = {
      persona: persona ? personaLabels[persona] : null,
      phase,
      needs,
    };

    writePlanDraft(plan);

    if (isAuthenticated) {
      try {
        await fetchJson('/plan/me', {
          method: 'PUT',
          body: plan,
        });
        localStorage.removeItem(DRAFT_KEYS.planPending);
      } catch {
        /* ignore */
      }
    } else {
      markPlanPendingSync();
    }

    navigate(`/plan?phase=${encodeURIComponent(plan.phase ?? '')}`);
  };

  return (
    <PageLayout
      title="La oss få oversikt"
      subtitle="Tre enkle valg. Du kan hoppe over det som ikke passer."
      maxWidthClassName="max-w-5xl"
    >
      <div className="space-y-8">

        {/* STEP 1 */}
        <Card title="1. Hva ligner mest på din situasjon nå?">
          <p className="mb-4 text-sm text-slate-600">
            Velg det som er nærmest. Dette brukes kun for å tilpasse rådene.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(personaLabels) as PersonaKey[]).map((key) => {
              const isSelected = persona === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPersona(key)}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  <div className="font-medium">{personaLabels[key]}</div>
                  <div className="mt-2 text-xs text-slate-600">
                    {personaShort[key]}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* STEP 2 */}
        <Card title="2. Hvor er du i prosessen?">
          <p className="mb-4 text-sm text-slate-600">
            Det trenger ikke være helt presist.
          </p>

          <div className="flex flex-wrap gap-3">
            {phaseOptions.map((option) => {
              const active = option === phase;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPhase(option)}
                  className={`rounded-full px-4 py-2 text-sm border transition ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </Card>

        {/* STEP 3 */}
        <Card title="3. Hva trenger du mest hjelp med nå?">
          <p className="mb-4 text-sm text-slate-600">
            Velg én eller flere – eller hopp over.
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            {needOptions.map((need) => {
              const active = needs.includes(need);
              return (
                <button
                  key={need}
                  type="button"
                  onClick={() => toggleNeed(need)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  {need}
                </button>
              );
            })}
          </div>
        </Card>

        {/* SUMMARY */}
        <Card title="Oppsummering">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>Situasjon:</strong> {personaDisplay}
            </p>
            <p>
              <strong>Fase:</strong> {phase}
            </p>
            <p>
              <strong>Behov:</strong>{' '}
              {needs.length > 0 ? needs.join(', ') : 'Ikke spesifisert'}
            </p>
            {status && <p className="text-emerald-700">{status}</p>}
          </div>

          <div className="flex gap-3 flex-wrap mt-5">
            <Button onClick={handleSave}>Fortsett til planen</Button>
            <Button to="/" variant="secondary">
              Tilbake
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
