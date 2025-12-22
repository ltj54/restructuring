import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchJson } from '@/utils/api';
import { DRAFT_KEYS, markPlanPendingSync, readPlanDraft, writePlanDraft } from '@/utils/draftSync';

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
  it: 'Outsourcing og oppdatering av kompetanse.',
  industri: 'Nedbemanning og faglig viderevei.',
  helse: 'Omorganisering og autorisasjon.',
  flyger: 'Lisens, helsekrav og omplassering.',
  butikk: 'Arbeidstid, kontrakt og videre karriere.',
  kontor: 'Digitalisering og nye roller.',
  transport: 'Sertifikater, skift og rettigheter.',
  salg: 'Kundeansvar, mål og videre muligheter.',
  annet: 'Generelle råd om avtaler og CV.',
};

const phaseOptions = ['For omstilling', 'Under omstilling', 'Etter omstilling'];

const needOptions = [
  'Få oversikt over rettigheter og avtaler',
  'Forstå hva omstillingen betyr for lonn og okonomi',
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

  useEffect(() => {
    const stored = readPlanDraft();
    if (!stored) return;

    if (stored.persona) {
      const key = (Object.entries(personaLabels).find(([_, label]) => label === stored.persona) ?? [
        null,
      ])[0] as PersonaKey | null;
      setPersona(key);
    }
    if (stored.phase) setPhase(stored.phase);
    if (stored.needs) setNeeds(stored.needs);
  }, []);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!persona) return;

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
    setNeeds((list) => (list.includes(need) ? list.filter((n) => n !== need) : [...list, need]));

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

    writePlanDraft(plan);

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
        localStorage.removeItem(DRAFT_KEYS.planPending);
        setStatus('Planen er lagret på brukeren din.');
      } catch {
        setStatus('Kunne ikke lagre hos serveren, men planen er lagret lokalt.');
      }
    } else {
      markPlanPendingSync();
      setStatus('Planen er lagret lokalt og flyttes til brukeren din når du logger inn.');
    }

    navigate(`/plan?phase=${encodeURIComponent(plan.phase ?? '')}`);
  };

  return (
    <PageLayout
      title="Veiviser"
      subtitle="Tre raske valg. Ferdig plan og journal starter på 3 minutter."
      maxWidthClassName="max-w-5xl"
      actions={
        <Button to="/plan" variant="secondary">
          Gå til plan
        </Button>
      }
    >
      <div className="space-y-6">
        <Card title="1. Velg situasjonen din">
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
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  <div className="font-semibold text-sm">{personaLabels[key]}</div>
                  <div className="mt-2 text-xs text-slate-600 opacity-90">{personaShort[key]}</div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="2. Hvor er du i prosessen?">
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
                      : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-200'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="3. Hva trenger du mest akkurat nå?">
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
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-200'
                  }`}
                >
                  {need}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Oppsummering">
          <div className="space-y-2 text-sm text-neutral-100">
            <p>
              <strong>Rolle:</strong> {personaDisplay}
            </p>
            <p>
              <strong>Fase:</strong> {phase}
            </p>
            <p>
              <strong>Behov:</strong>{' '}
              {needs.length > 0 ? needs.join('  ') : 'Ingen valgt ennå. Du kan hoppe over.'}
            </p>
            {status && <p className="text-emerald-200">{status}</p>}
          </div>

          <div className="flex gap-3 flex-wrap mt-4">
            <Button onClick={handleSave}>Lagre og gå til plan</Button>
            <Button to="/" variant="secondary">
              Tilbake til start
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
