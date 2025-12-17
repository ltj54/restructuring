import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { InsuranceSource, InsuranceType, saveInsuranceSnapshot } from '@/api/insuranceApi';
import { useAuth } from '@/hooks/useAuth';
import {
  DRAFT_KEYS,
  markInsurancePendingSync,
  readInsuranceDraft,
  writeInsuranceDraft,
} from '@/utils/draftSync';

/**
 * Forsikring (kort) av forsikringer i omstilling
 * Mål: maks 60 sek innsats, lav friksjon
 */

interface QuickInsuranceRegistrationProps {
  onSubmit?: (data: {
    source: InsuranceSource;
    types: InsuranceType[];
    uncertain: boolean;
  }) => void;
}

const INSURANCE_OPTIONS: { type: InsuranceType; label: string; hint: string }[] = [
  {
    type: 'TREATMENT',
    label: 'Behandlingsforsikring',
    hint: 'Rask tilgang til privat behandling - faller ofte bort ved jobbslutt',
  },
  {
    type: 'INCOME',
    label: 'Inntektsforsikring',
    hint: 'Ekstra inntekt hvis du mister jobben',
  },
  {
    type: 'DISABILITY',
    label: 'Uføreforsikring',
    hint: 'Økonomisk trygghet ved varig sykdom',
  },
  {
    type: 'LIFE',
    label: 'Livsforsikring',
    hint: 'Utbetaling til etterlatte',
  },
  {
    type: 'PENSION',
    label: 'Pensjon',
    hint: 'Tjenestepensjon via arbeidsgiver',
  },
  {
    type: 'UNKNOWN',
    label: 'Usikker / vet ikke',
    hint: 'Helt greit - vi tar høyde for det',
  },
];

export default function QuickInsuranceRegistration({ onSubmit }: QuickInsuranceRegistrationProps) {
  const draft = readInsuranceDraft();
  const [source, setSource] = useState<InsuranceSource | null>(draft?.source ?? null);
  const [types, setTypes] = useState<Set<InsuranceType>>(new Set(draft?.types ?? []));
  const [saving, setSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    writeInsuranceDraft({
      source,
      types: Array.from(types),
      uncertain: (source ?? undefined) === 'UNKNOWN' || types.has('UNKNOWN'),
    });

    if (!isAuthenticated) {
      markInsurancePendingSync();
    }
  }, [source, types, isAuthenticated]);

  const toggleType = (type: InsuranceType) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!source) return;

    const payload = {
      source,
      types: Array.from(types),
      uncertain: source === 'UNKNOWN' || types.has('UNKNOWN'),
    };

    setSaving(true);

    if (!isAuthenticated) {
      markInsurancePendingSync();
      onSubmit?.(payload);
      navigate('/insurance');
      setSaving(false);
      return;
    }

    try {
      await saveInsuranceSnapshot(payload);
      onSubmit?.(payload);
      localStorage.removeItem(DRAFT_KEYS.insurance);
      localStorage.removeItem(DRAFT_KEYS.insurancePending);
      navigate('/insurance');
    } catch (e) {
      console.error('Kunne ikke lagre snapshot', e);
      alert('Kunne ikke lagre valg. Forsøk igjen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Forsikring (kort)</h1>
        <p className="text-slate-600 max-w-2xl">
          Registrer raskt hvilke forsikringer du kan miste når du slutter i jobben.
        </p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-2">Forsikringer du kan miste ved jobbslutt</h2>

        <p className="text-muted mb-6">
          Dette tar under ett minutt. Du kan være usikker - det er helt greit.
        </p>

        {/* Steg 1 - kilde */}
        <div className="mb-6">
          <p className="font-medium mb-2">Har du forsikringer gjennom arbeidsgiver?</p>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="source"
                checked={source === 'EMPLOYER'}
                onChange={() => setSource('EMPLOYER')}
              />
              Ja
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="source"
                checked={source === 'UNKNOWN'}
                onChange={() => setSource('UNKNOWN')}
              />
              Usikker
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="source"
                checked={source === 'PRIVATE'}
                onChange={() => setSource('PRIVATE')}
              />
              Nei, kun private forsikringer
            </label>
          </div>
        </div>

        {/* Steg 2 - typer */}
        {(source === 'EMPLOYER' || source === 'UNKNOWN') && (
          <div className="mb-6">
            <p className="font-medium mb-2">Hvilke typer gjelder for deg?</p>

            <div className="flex flex-col gap-3">
              {INSURANCE_OPTIONS.map((opt) => (
                <label key={opt.type} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={types.has(opt.type)}
                    onChange={() => toggleType(opt.type)}
                  />
                  <span>
                    <span className="font-medium">{opt.label}</span>
                    <div className="text-sm text-muted">{opt.hint}</div>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <Button disabled={!source || saving} onClick={handleSubmit}>
          {saving ? 'Lagrer...' : 'Fortsett'}
        </Button>
      </Card>
    </div>
  );
}
