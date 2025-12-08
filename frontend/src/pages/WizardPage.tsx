import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchJson } from '@/utils/api';

// ------------------------------------------------------------
// NYE PERSONAS (kort tekst – variant A)
// ------------------------------------------------------------

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

// Ekstremt kort beskrivelse – A-varianten
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

type UserPlanResponse = {
  persona: string | null;
  phase: string | null;
  needs: string[] | null;
};

// ------------------------------------------------------------
// KOMPONENT
// ------------------------------------------------------------

export default function WizardPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [persona, setPersona] = useState<PersonaKey | null>(null);
  const [phase, setPhase] = useState<string>('Før omstilling');
  const [needs, setNeeds] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  // Last fra localStorage
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
        /* ignorer */
      }
    }
  }, []);

  const personaDisplay = useMemo(
    () => (persona ? personaLabels[persona] : 'Ikke valgt'),
    [persona]
  );

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
        setStatus('Kunne ikke lagre hos serveren, men planen er lagret lokalt.');
      }
    } else {
      setStatus('Planen er lagret lokalt.');
    }

    navigate(`/plan?phase=${encodeURIComponent(plan.phase ?? '')}`);
  };

  return (
    <PageLayout
      title="Veiviser"
      subtitle="Velg rolle - vi bygger planen din."
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
        {/* ------------------------------------------------------------
            PERSONA
        ------------------------------------------------------------ */}
        <Card title="Velg situasjonen din">
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
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="font-semibold text-sm">{personaLabels[key]}</div>
                  <div className="mt-2 text-xs text-slate-600 opacity-90">{personaShort[key]}</div>
                </button>
              );
            })}
          </div>
        </Card>
        {/* ------------------------------------------------------------
            OPPSUMMERING
        ------------------------------------------------------------ */}
        <Card title="Oppsummering">
          <p className="text-sm text-slate-700 mb-3">
            <strong>Rolle:</strong> {personaDisplay}
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
