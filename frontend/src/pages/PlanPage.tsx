import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import { fetchJson } from '../utils/api';

const phaseSections: Record<
  string,
  {
    title: string;
    description: string;
    bullets: string[];
  }
> = {
  'Før omstilling': {
    title: 'Før omstilling - bygg trygghet tidlig',
    description:
      'Du er i en tidlig fase. Hovedmålet nå er å skaffe oversikt og forberede deg uten å skape unødig stress.',
    bullets: [
      'Skriv ned hva som bekymrer deg konkret - ikke bare «omstilling generelt».',
      'Finn ut hvem som faktisk vet hva (leder, HR, tillitsvalgt).',
      'Sjekk hvilke forsikringer og ordninger du allerede har via jobb eller fagforening.',
    ],
  },
  'Under omstilling': {
    title: 'Under omstilling - ta kontroll på endringene',
    description:
      'Endringene er i gang. Her handler planen om å beholde oversikt og bruke rettighetene dine aktivt.',
    bullets: [
      'Sørg for skriftlig informasjon om forslagene som gjelder deg.',
      'Be om et konkret møte om din rolle og dine alternativer.',
      'Lag et enkelt regneark med «nå» og «etter omstilling» for lønn og arbeidstid.',
    ],
  },
  'Etter omstilling': {
    title: 'Etter omstilling - juster økonomi og kurs',
    description:
      'Omstillingen er gjennomført. Planen flyttes nå over på økonomi, videre karriere og hva som skal være neste steg for deg.',
    bullets: [
      'Oppdater budsjett med reell inntekt og kostnader etter omstilling.',
      'Lag en konkret 3-måneders plan for kompetanse, CV og søknader.',
      'Vurder behov for ekstra inntektssikring hvis inntekten er mer usikker enn før.',
    ],
  },
};

type PlanState = {
  persona: string;
  fase: string;
  behov: string[];
  createdAt: string;
};

type UserPlanResponse = {
  persona: string | null;
  phase: string | null;
  needs: string[] | null;
  diary: string | null;
  diaries?: Record<string, string> | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export default function PlanPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const phaseFromQuery = searchParams.get('phase') ?? '';

  const [plan, setPlan] = useState<PlanState | null>(null);
  const [diariesByPhase, setDiariesByPhase] = useState<Record<string, string>>({});
  const [activeDiaryPhase, setActiveDiaryPhase] = useState<string>('');
  const [diaryUpdatedAt, setDiaryUpdatedAt] = useState<string | null>(null);
  const [isLoadingRemotePlan, setIsLoadingRemotePlan] = useState(false);
  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [diarySaveError, setDiarySaveError] = useState<string | null>(null);

  const effectivePhase = phaseFromQuery || plan?.fase || '';
  const phaseContent = effectivePhase ? phaseSections[effectivePhase] : undefined;
  const displayedPhase = activeDiaryPhase || effectivePhase;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoadingRemotePlan(true);
    (async () => {
      try {
        const remote = await fetchJson<UserPlanResponse | undefined>('/plan/me');

        if (!remote) {
          setIsLoadingRemotePlan(false);
          return;
        }

        const normalizedPlan: PlanState | null = remote.phase
          ? {
              persona: remote.persona ?? 'Annet',
              fase: remote.phase,
              behov: remote.needs ?? [],
              createdAt: remote.createdAt ?? new Date().toISOString(),
            }
          : null;

        setPlan(normalizedPlan);

        const allDiaries: Record<string, string> = {
          ...(remote.diaries ?? {}),
        };

        if (remote.phase && remote.diary && !allDiaries[remote.phase]) {
          allDiaries[remote.phase] = remote.diary;
        }

        setDiariesByPhase(allDiaries);

        if (remote.diary) {
          setDiaryUpdatedAt(remote.updatedAt ?? remote.createdAt ?? null);
        }

        if (!activeDiaryPhase) {
          const initialPhase = effectivePhase || remote.phase || 'Før omstilling';
          setActiveDiaryPhase(initialPhase);
        }
      } catch {
        // Ignorer nettverksfeil - da vises bare det vi evt. har i minnet
      } finally {
        setIsLoadingRemotePlan(false);
      }
    })();
  }, [isAuthenticated, activeDiaryPhase, effectivePhase]);

  const handleDiaryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    setDiarySaveError(null);

    if (!activeDiaryPhase) {
      return;
    }

    setDiariesByPhase((current) => ({
      ...current,
      [activeDiaryPhase]: next,
    }));

    if (!isAuthenticated) {
      return;
    }

    setIsSavingDiary(true);

    (async () => {
      try {
        const now = new Date().toISOString();
        await fetchJson('/plan/me', {
          method: 'PUT',
          body: {
            persona: plan?.persona ?? 'Annet',
            phase: activeDiaryPhase || plan?.fase || effectivePhase,
            needs: plan?.behov ?? [],
            diary: next,
          },
        });
        setDiaryUpdatedAt(now);
      } catch {
        setDiarySaveError('Kunne ikke lagre endringen nå.');
      } finally {
        setIsSavingDiary(false);
      }
    })();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10">
      <Card title="Min plan">
        {isLoadingRemotePlan && <p className="mb-3 text-xs text-slate-500">Laster plan ...</p>}

        {!plan ? (
          <>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              Ingen plan funnet.{' '}
              <Link to="/wizard" className="text-brand-dark font-medium underline">
                Start veiviser
              </Link>
              .
            </div>

            {phaseContent && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
                  {phaseContent.title}
                </h2>
                <p className="text-sm text-slate-700 mb-3">{phaseContent.description}</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                  {phaseContent.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <b>Rolle:</b> {plan.persona}
                </div>
                <div>
                  <b>Fase:</b> {displayedPhase || plan.fase}
                </div>
                <div className="md:col-span-2">
                  <b>Behov:</b> {plan.behov.join(', ') || '-'}
                </div>
              </div>
              <div className="text-slate-500 mt-2 text-xs">
                Laget: {new Date(plan.createdAt).toLocaleString()}
              </div>
            </div>

            {phaseContent && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
                  {phaseContent.title}
                </h2>
                <p className="text-sm text-slate-700 mb-3">{phaseContent.description}</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                  {phaseContent.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              Dagbok for denne fasen
            </h2>
            {diaryUpdatedAt && !isSavingDiary && (
              <span className="text-xs text-slate-500">
                Lagret{' '}
                {new Date(diaryUpdatedAt).toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Skriv korte notater om møter, avtaler, avtaler du har gjort med deg selv og ting du vil
            følge opp. Notatene lagres på denne brukeren.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {Object.keys(phaseSections).map((phaseKey) => {
              const hasDiary = !!diariesByPhase[phaseKey]?.trim();
              const isActive = activeDiaryPhase === phaseKey;

              return (
                <button
                  key={phaseKey}
                  type="button"
                  onClick={() => setActiveDiaryPhase(phaseKey)}
                  className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <span>{phaseKey}</span>
                  {hasDiary && (
                    <span
                      aria-hidden="true"
                      className={
                        isActive
                          ? 'inline-block w-1.5 h-1.5 rounded-full bg-white/90'
                          : 'inline-block w-1.5 h-1.5 rounded-full bg-emerald-500'
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>
          <textarea
            value={(activeDiaryPhase && diariesByPhase[activeDiaryPhase]) || ''}
            onChange={handleDiaryChange}
            rows={8}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand resize-y"
            placeholder="F.eks. hva ble sagt på siste møte, hva du vil spørre om neste gang, eller hvordan situasjonen påvirker deg nå."
          />
          {isSavingDiary && <p className="mt-1 text-xs text-slate-500">Lagrer ...</p>}
          {diarySaveError && <p className="mt-1 text-xs text-red-500">{diarySaveError}</p>}
        </section>

        <h2 className="mt-6 text-lg font-semibold">Handlinger (14 dager)</h2>
        <ul className="mt-3 space-y-2">
          {[
            'Skaff formell oversikt (datoer, møter, referat).',
            'Lag et enkelt budsjett og identifiser buffer.',
            'Oppdater CV + 3 jobbsøknader eller interne muligheter.',
            'Book en samtale med rådgiver/mentor.',
          ].map((t) => (
            <li key={t} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            to="/resources"
            className="block rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold hover:bg-slate-50"
          >
            Ressurser
          </Link>
        </div>
      </Card>
    </div>
  );
}
