import React, { useCallback, useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchJson } from '@/utils/api';
import { API_BASE_URL } from '@/utils/config';
import {
  DRAFT_KEYS,
  markPlanPendingSync,
  readPlanDiariesDraft,
  readPlanDraft,
  writePlanDiariesDraft,
  writePlanDraft,
} from '@/utils/draftSync';

/* -----------------------------------------------------------
   FASETEKSTER
----------------------------------------------------------- */

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
    title: 'Før omstilling',
    description:
      'Du er i en tidlig fase. Målet er å skaffe oversikt og bygge trygghet før noe er avgjort.',
    bullets: [
      'Skriv ned hva som bekymrer deg konkret.',
      'Finn ut hvem som vet hva (leder, HR, tillitsvalgt).',
      'Sjekk hvilke ordninger og forsikringer du allerede har.',
    ],
    diaryTitle: 'Notater – før omstilling',
    diaryDescription: 'Tanker, spørsmål og ting du bør undersøke tidlig.',
    diaryPlaceholder: 'Hva lurer du på nå? Hva bør du finne ut av?',
    actions: [
      'Lag oversikt over hva du vet og ikke vet',
      'Snakk med leder eller HR',
      'Kartlegg økonomi og forsikringer',
      'Begynn rolig å oppdatere CV',
    ],
  },

  'Under omstilling': {
    title: 'Under omstilling',
    description: 'Endringene er i gang. Nå handler det om kontroll, dokumentasjon og riktige valg.',
    bullets: [
      'Be om skriftlig informasjon.',
      'Avklar din rolle og alternativer.',
      'Regn på konsekvenser for lønn og arbeidstid.',
    ],
    diaryTitle: 'Notater – under omstilling',
    diaryDescription: 'Møter, frister og oppfølging.',
    diaryPlaceholder: 'Hva ble sagt? Hva må følges opp?',
    actions: ['Be om alt skriftlig', 'Lag konsekvensoversikt', 'Book rådgiving', 'Loggfør møter'],
  },

  'Etter omstilling': {
    title: 'Etter omstilling',
    description: 'Omstillingen er gjennomført. Nå justerer du kurs, økonomi og neste steg.',
    bullets: ['Oppdater budsjett', 'Lag en 3-måneders plan', 'Vurder ekstra inntektssikring'],
    diaryTitle: 'Notater – etter omstilling',
    diaryDescription: 'Planlegging av neste steg.',
    diaryPlaceholder: 'Hva er målet nå?',
    actions: [
      'Oppdater budsjett',
      'Planlegg kompetanseheving',
      'Søk jobber eller interne muligheter',
      'Lag utviklingsplan',
    ],
  },
};

const PHASE_OPTIONS = Object.keys(phaseSections);

const NEED_OPTIONS = [
  'Få oversikt over rettigheter og avtaler',
  'Forstå hva omstillingen betyr for lønn og økonomi',
  'Planlegge neste karrieresteg',
  'Snakke med noen om situasjonen',
  'Få kontroll på forsikringer og inntektssikring',
];

const normalizePhase = (phase?: string | null) =>
  phase === 'For omstilling' ? 'Før omstilling' : phase || PHASE_OPTIONS[0];

/* -----------------------------------------------------------
   TYPER
----------------------------------------------------------- */

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
};

/* -----------------------------------------------------------
   KOMPONENT
----------------------------------------------------------- */

export default function PlanPage(): React.ReactElement {
  const { isAuthenticated, token, userId } = useAuth();

  const planDraft = readPlanDraft();
  const planDiariesDraft = readPlanDiariesDraft();
  const initialPhase = normalizePhase(planDraft?.phase ?? null);
  const initialNeeds = planDraft?.needs ?? [];
  const initialPersona = planDraft?.persona ?? 'Annet';
  const hasDraftDiaries = Object.values(planDiariesDraft).some(
    (entry) => typeof entry === 'string' && entry.trim().length > 0
  );
  const hasExistingDraft = Boolean(planDraft || hasDraftDiaries);

  const [plan, setPlan] = useState<PlanState | null>(
    planDraft
      ? {
          persona: initialPersona,
          fase: initialPhase,
          behov: initialNeeds,
          createdAt: new Date().toISOString(),
        }
      : null
  );
  const [selectedPhase, setSelectedPhase] = useState(initialPhase);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(initialNeeds);
  const [diariesByPhase, setDiariesByPhase] = useState<Record<string, string>>(planDiariesDraft);
  const [activeDiaryPhase, setActiveDiaryPhase] = useState(initialPhase);

  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [planSaveMessage, setPlanSaveMessage] = useState<string | null>(null);

  const displayedPhase = activeDiaryPhase || selectedPhase;
  const phaseContent = phaseSections[displayedPhase];

  /* -----------------------------------------------------------
     LASTE PLAN
  ----------------------------------------------------------- */

  const applyRemotePlan = useCallback((remote?: UserPlanResponse | null) => {
    if (!remote) return;

    const phase = normalizePhase(remote.phase);

    setSelectedPhase(phase);
    setSelectedNeeds(remote.needs ?? []);
    setActiveDiaryPhase(phase);

    setPlan({
      persona: remote.persona ?? 'Annet',
      fase: phase,
      behov: remote.needs ?? [],
      createdAt: remote.createdAt ?? new Date().toISOString(),
    });

    setDiariesByPhase(remote.diaries ?? {});

    writePlanDraft({
      persona: remote.persona ?? 'Annet',
      phase,
      needs: remote.needs ?? [],
    });
    writePlanDiariesDraft(remote.diaries ?? {});
    localStorage.removeItem(DRAFT_KEYS.planPending);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchJson<UserPlanResponse>('/plan/me').then(applyRemotePlan);
  }, [isAuthenticated, applyRemotePlan]);

  // Hold alltid et lokalt utkast oppdatert slik at gjester kan fortsette etter innlogging
  useEffect(() => {
    const persona = plan?.persona ?? 'Annet';
    const hasContent =
      hasExistingDraft ||
      selectedNeeds.length > 0 ||
      selectedPhase !== initialPhase ||
      (persona && persona !== 'Annet');

    if (!hasContent) return;

    writePlanDraft({
      persona,
      phase: selectedPhase,
      needs: selectedNeeds,
    });
    if (!isAuthenticated) {
      markPlanPendingSync();
    }
  }, [
    plan?.persona,
    selectedPhase,
    selectedNeeds,
    isAuthenticated,
    hasExistingDraft,
    initialPhase,
  ]);

  /* -----------------------------------------------------------
     HANDLERE
  ----------------------------------------------------------- */

  const toggleNeed = (need: string) =>
    setSelectedNeeds((n) => (n.includes(need) ? n.filter((x) => x !== need) : [...n, need]));

  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    setPlanSaveMessage(null);

    const next = {
      persona: plan?.persona ?? 'Annet',
      phase: selectedPhase,
      needs: selectedNeeds,
    };

    writePlanDraft(next);

    if (isAuthenticated) {
      await fetchJson('/plan/me', { method: 'PUT', body: next });
      localStorage.removeItem(DRAFT_KEYS.planPending);
    } else {
      markPlanPendingSync();
    }

    setPlanSaveMessage('Planen er lagret');
    setIsSavingPlan(false);
  };

  const handleDiaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    setDiariesByPhase((d) => {
      const next = { ...d, [activeDiaryPhase]: value };
      writePlanDiariesDraft(next);
      return next;
    });

    if (!isAuthenticated) {
      markPlanPendingSync();
      return;
    }

    setIsSavingDiary(true);
    fetchJson('/plan/me', {
      method: 'PUT',
      body: {
        persona: plan?.persona ?? 'Annet',
        phase: activeDiaryPhase,
        needs: selectedNeeds,
        diary: value,
      },
    }).finally(() => setIsSavingDiary(false));
  };

  /* -----------------------------------------------------------
     PDF
  ----------------------------------------------------------- */

  const handleDownloadPdf = async () => {
    if (!userId) return;

    const res = await fetch(`${API_BASE_URL}/system/user-profile/${userId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `plan_${userId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* -----------------------------------------------------------
     RENDER
  ----------------------------------------------------------- */

  return (
    <PageLayout
      title="Min plan"
      subtitle="En strukturert oversikt over situasjon, behov og neste steg."
      actions={
        <>
          <Button to="/resources" variant="secondary">
            Ressurser
          </Button>
          <Button onClick={handleDownloadPdf} variant="secondary">
            Last ned PDF
          </Button>
        </>
      }
      maxWidthClassName="max-w-5xl"
    >
      {/* FASEOVERSIKT */}
      <Card className="mb-6 bg-slate-50">
        <h2 className="text-lg font-semibold mb-2">{phaseContent.title}</h2>
        <p className="text-sm text-slate-700 mb-3">{phaseContent.description}</p>

        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {phaseContent.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </Card>

      {/* BEHOV */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-3">Hva trenger du nå?</h3>

        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {NEED_OPTIONS.map((need) => {
            const active = selectedNeeds.includes(need);
            return (
              <button
                key={need}
                onClick={() => toggleNeed(need)}
                className={`rounded-lg border px-3 py-2 text-sm text-left transition ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                {need}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSavePlan} disabled={isSavingPlan}>
            {isSavingPlan ? 'Lagrer…' : 'Lagre'}
          </Button>
          {planSaveMessage && <span className="text-xs text-slate-600">{planSaveMessage}</span>}
        </div>
      </Card>

      {/* NOTATER */}
      <Card>
        <h3 className="font-semibold mb-1">{phaseContent.diaryTitle}</h3>
        <p className="text-xs text-slate-600 mb-3">{phaseContent.diaryDescription}</p>

        <div className="flex gap-2 mb-3 flex-wrap">
          {PHASE_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setActiveDiaryPhase(p)}
              className={`px-3 py-1 text-xs rounded-full border ${
                activeDiaryPhase === p
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <textarea
          rows={8}
          value={diariesByPhase[activeDiaryPhase] || ''}
          onChange={handleDiaryChange}
          placeholder={phaseContent.diaryPlaceholder}
          className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-emerald-200"
        />

        {isSavingDiary && <p className="mt-1 text-xs text-slate-500">Lagrer…</p>}
      </Card>
    </PageLayout>
  );
}
