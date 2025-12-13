import React, { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';

/**
 * Hurtigregistrering av forsikringer i omstilling
 * Mål: maks 60 sek innsats, lav friksjon
 */

export type InsuranceSource = 'EMPLOYER' | 'PRIVATE' | 'UNKNOWN';

export type InsuranceType = 'TREATMENT' | 'INCOME' | 'DISABILITY' | 'LIFE' | 'PENSION' | 'UNKNOWN';

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
    hint: 'Rask tilgang til privat behandling – faller ofte bort ved jobbslutt',
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
    hint: 'Helt greit – vi tar høyde for det',
  },
];

export default function QuickInsuranceRegistration({ onSubmit }: QuickInsuranceRegistrationProps) {
  const [source, setSource] = useState<InsuranceSource | null>(null);
  const [types, setTypes] = useState<Set<InsuranceType>>(new Set());

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

  const handleSubmit = () => {
    if (!source) return;

    const payload = {
      source,
      types: Array.from(types),
      uncertain: source === 'UNKNOWN' || types.has('UNKNOWN'),
    };

    console.log('QuickInsuranceRegistration submit:', payload);

    onSubmit?.(payload);
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">Forsikringer du kan miste ved jobbslutt</h2>

      <p className="text-muted mb-6">
        Dette tar under ett minutt. Du kan være usikker – det er helt greit.
      </p>

      {/* Steg 1 – kilde */}
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

      {/* Steg 2 – typer */}
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

      <Button disabled={!source} onClick={handleSubmit}>
        Fortsett
      </Button>
    </Card>
  );
}
