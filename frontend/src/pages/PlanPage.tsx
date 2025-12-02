import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchJson } from '@/utils/api';

// -----------------------------------------------------------
// FASETEKSTER – dynamisk innhold
// -----------------------------------------------------------

const phaseSections: Record<
  string,
  {
    title: string;
    description: string;
    bullets: string[];
    diaryTitle: string;
    diaryDescription: string;
    diaryPlaceholder: string;
    actions: string[];
  }
> = {
  'Før omstilling': {
    title: 'Før omstilling – bygg trygghet tidlig',
    description:
      'Du er i en tidlig fase. Målet nå er å skaffe oversikt og forberede deg uten unødig stress.',
    bullets: [
      'Skriv ned hva som bekymrer deg konkret – ikke bare «omstilling generelt».',
      'Finn ut hvem som faktisk vet hva (leder, HR, tillitsvalgt).',
      'Sjekk hvilke forsikringer og ordninger du allerede har.',
    ],
    diaryTitle: 'Dagbok – før omstilling',
    diaryDescription:
      'Skriv ned bekymringer, spørsmål og hva du bør sjekke tidlig.',
    diaryPlaceholder:
      'Hva lurer du på nå? Hva trenger du svar på? Hva bekymrer deg?',
    actions: [
      'Lag liste over hva du vet – og hva du ikke vet.',
      'Ta kontakt med leder eller HR for avklaringer.',
      'Kartlegg dine forsikringer og økonomi.',
      'Begynn stille med oppdatering av CV.',
    ],
  },

  'Under omstilling': {
    title: 'Under omstilling – ta kontroll på endringene',
    description:
      'Endringene er i gang. Her handler planen om å beholde oversikt og bruke rettighetene dine aktivt.',
    bullets: [
      'Sørg for skriftlig informasjon om forslagene som gjelder deg.',
      'Be om et konkret møte om din rolle og dine alternativer.',
      'Lag et regneark med «nå» og «etter omstilling» for lønn og arbeidstid.',
    ],
    diaryTitle: 'Dagbok – under omstilling',
    diaryDescription:
      'Skriv ned punkter fra møter, frister og ting du må følge opp.',
    diaryPlaceholder:
      'Hva ble sagt i møtet? Hva må du følge opp? Hvilke frister kom opp?',
    actions: [
      'Be om alt skriftlig.',
      'Lag oversikt over konsekvenser (lønn, arbeidstid, arbeidsoppgaver).',
      'Book rådgiving (tillitsvalgt/HR).',
      'Loggfør alle møter i dagboken.',
    ],
  },

  'Etter omstilling': {
    title: 'Etter omstilling – juster økonomi og kurs',
    description:
      'Omstillingen er gjennomført. Nå handler det om økonomi, karriere og neste steg.',
    bullets: [
      'Oppdater budsjett basert på ny inntekt og arbeidstid.',
      'Lag en 3-måneders plan for kompetanse, CV og søknader.',
      'Vurder behov for ekstra inntektssikring.',
    ],
    diaryTitle: 'Dagbok – etter omstilling',
    diaryDescription:
      'Bruk notater til å planlegge neste steg: karriere, økonomi og mål.',
    diaryPlaceholder:
      'Hva er neste steg? Hvilke jobber vurderer du? Hva er målene dine?',
    actions: [
      'Oppdater budsjett.',
      'Planlegg kurs eller kompetanseheving.',
      'Søk på jobber eller interne muligheter.',
      'Lag en 3-måneders utviklingsplan.',
    ],
  },
};

// -----------------------------------------------------------
// TYPER
// -----------------------------------------------------------

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

// -----------------------------------------------------------
// KOMPONENT
// -----------------------------------------------------------

export default function PlanPage(): React.ReactElement {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const phaseFromQuery = searchParams.get('phase') ?? '';

  const [plan, setPlan] = useState<PlanState | null>(null);
  const [diariesByPhase, setDiariesByPhase] = useState<Record<string, string>>({});
  const [activeDiaryPhase, setActiveDiaryPhase] = useState<string>('');
  const [diaryUpdatedAt] = useState<string | null>(null);
  const [isLoadingRemotePlan, setIsLoadingRemotePlan] = useState(false);
  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [diarySaveError, setDiarySaveError] = useState<string | null>(null);

  // Den aktive fasen som styrer HELE UI-et
  const displayedPhase =
    activeDiaryPhase ||
    plan?.fase ||
    phaseFromQuery ||
    'Før omstilling';

  const phaseContent = phaseSections[displayedPhase];

  // -----------------------------------------------------------
  // LASTER PLAN FRA SERVER
  // -----------------------------------------------------------

  useEffect(() => {
    if (!isAuthenticated) return;

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

        if (!activeDiaryPhase) {
          const initialPhase =
            phaseFromQuery || remote.phase || 'Før omstilling';
          setActiveDiaryPhase(initialPhase);
        }
      } catch {
      } finally {
        setIsLoadingRemotePlan(false);
      }
    })();
  }, [isAuthenticated]);

  // -----------------------------------------------------------
  // LAGRING AV DAGBOK
  // -----------------------------------------------------------

  const handleDiaryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    setDiarySaveError(null);

    if (!activeDiaryPhase) return;

    setDiariesByPhase((current) => ({
      ...current,
      [activeDiaryPhase]: next,
    }));

    if (!isAuthenticated) return;

    setIsSavingDiary(true);
    (async () => {
      try {
        await fetchJson('/plan/me', {
          method: 'PUT',
          body: {
            persona: plan?.persona ?? 'Annet',
            phase: activeDiaryPhase,
            needs: plan?.behov ?? [],
            diary: next,
          },
        });
      } catch {
        setDiarySaveError('Kunne ikke lagre endringen nå.');
      } finally {
        setIsSavingDiary(false);
      }
    })();
  };

  // -----------------------------------------------------------
  // HANDLINGER I TOPPEN
  // -----------------------------------------------------------

  const planActions = (
    <>
      <Button
        to="/wizard"
        className="bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 border-transparent font-semibold"
      >
        Start veiviseren
      </Button>
      <Button
        to="/resources"
        className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold"
      >
        Se ressurser
      </Button>
    </>
  );

  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------

  return (
    <PageLayout
      title="Min plan"
      subtitle="Fire steg som gir deg oversikt: fase, økonomi, kompetanse og konkrete handlinger."
      actions={planActions}
      maxWidthClassName="max-w-5xl"
    >
      <Card>
        {isLoadingRemotePlan && <p className="mb-3 text-xs text-slate-500">Laster plan ...</p>}

        {/* -----------------------------------------------------------
           FASEINNHOLD
        ----------------------------------------------------------- */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
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

        {/* -----------------------------------------------------------
           DAGBOK
        ----------------------------------------------------------- */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            {phaseContent.diaryTitle}
          </h2>
          <p className="text-xs text-slate-600 mb-3">{phaseContent.diaryDescription}</p>

          <div className="mb-3 flex flex-wrap gap-2">
            {Object.keys(phaseSections).map((phaseKey) => {
              const isActive = activeDiaryPhase === phaseKey;
              const hasDiary = !!diariesByPhase[phaseKey]?.trim();

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
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-white/90' : 'bg-emerald-500'
                      }`}
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
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-y"
            placeholder={phaseContent.diaryPlaceholder}
          />

          {isSavingDiary && <p className="mt-1 text-xs text-slate-500">Lagrer ...</p>}
          {diarySaveError && <p className="mt-1 text-xs text-red-500">{diarySaveError}</p>}
        </section>

        {/* -----------------------------------------------------------
           HANDLINGER
        ----------------------------------------------------------- */}
        <h2 className="mt-6 text-lg font-semibold text-slate-900">
          Handlinger (14 dager)
        </h2>

        <ul className="mt-3 space-y-2">
          {phaseContent.actions.map((t) => (
            <li
              key={t}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
            >
              {t}
            </li>
          ))}
        </ul>

        {/* -----------------------------------------------------------
           RESSURSER
        ----------------------------------------------------------- */}
        <div className="mt-6">
          <Link
            to="/resources"
            className="block rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold hover:bg-slate-50"
          >
            Ressurser
          </Link>
        </div>
      </Card>
    </PageLayout>
  );
}
