import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { writePlanDraft, markPlanPendingSync } from '@/utils/draftSync';

const phaseOptions = [
  'Jeg er helt i startfasen',
  'Midt i noe uavklart',
  'Har kommet et stykke, men er fortsatt usikker',
];

const needOptions = [
  'Få litt oversikt og ro',
  'Forstå hva jeg bør gjøre først',
  'Snakke eller skrive litt om situasjonen',
  'Se hva som kan vente',
];

export default function UnsureWizardPage(): React.ReactElement {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);

  const handleContinue = () => {
    writePlanDraft({
      phase: phase ?? 'Ikke spesifisert',
      needs: need ? [need] : [],
    });

    markPlanPendingSync();
    navigate('/plan');
  };

  return (
    <PageLayout
      title="La oss ta det rolig"
      subtitle="Du trenger ikke vite alt nå. Vi starter enkelt."
      maxWidthClassName="max-w-4xl"
    >
      <div className="space-y-8">

        {/* INTRO */}
        <Card>
          <p className="text-slate-700 text-sm leading-relaxed">
            Mange som er i omstilling er usikre på hva de egentlig trenger.
            Det er helt normalt.
          </p>
          <p className="mt-2 text-slate-700 text-sm leading-relaxed">
            Her stiller vi bare noen få, enkle spørsmål – og du kan hoppe over
            det som ikke passer.
          </p>
        </Card>

        {/* STEP 1 */}
        <Card title="Hvor er du akkurat nå?">
          <p className="mb-4 text-sm text-slate-600">
            Velg det som føles nærmest – det trenger ikke være presist.
          </p>

          <div className="space-y-3">
            {phaseOptions.map((option) => {
              const active = option === phase;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPhase(option)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </Card>

        {/* STEP 2 */}
        <Card title="Hva hadde vært mest hjelpsomt nå?">
          <p className="mb-4 text-sm text-slate-600">
            Velg én ting – eller hopp over.
          </p>

          <div className="space-y-3">
            {needOptions.map((option) => {
              const active = option === need;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setNeed(option)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </Card>

        {/* ACTIONS */}
        <Card>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleContinue}>
              Ta meg videre
            </Button>
            <Button to="/" variant="secondary">
              Tilbake
            </Button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Du kan endre alt senere. Ingenting her er bindende.
          </p>
        </Card>
      </div>
    </PageLayout>
  );
}
