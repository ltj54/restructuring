import { useEffect, useState } from 'react';
import { getMyInsurances, UserInsuranceResponse } from '@/api/insuranceApi';

const sourceLabel: Record<string, string> = {
  EMPLOYER: 'Via arbeidsgiver',
  PRIVATE: 'Privat',
  OTHER: 'Annet',
};

export default function MyInsurances() {
  const [items, setItems] = useState<UserInsuranceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyInsurances()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Laster forsikringer…</p>;
  }

  if (items.length === 0) {
    return <p className="text-slate-600">Du har ikke registrert noen forsikringer ennå.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-slate-900">
                {i.productName || 'Ukjent produkt'}
              </div>
              <div className="text-sm text-slate-600">{i.providerName}</div>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {sourceLabel[i.source]}
            </span>
          </div>

          {(i.validFrom || i.validTo) && (
            <div className="mt-2 text-xs text-slate-500">
              Gyldig
              {i.validFrom && ` fra ${i.validFrom}`}
              {i.validTo && ` til ${i.validTo}`}
            </div>
          )}

          {i.notes && <div className="mt-2 text-xs text-slate-600">{i.notes}</div>}
        </div>
      ))}
    </div>
  );
}
