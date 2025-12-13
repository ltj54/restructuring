import React, { useState } from 'react';
import { registerMyInsurance } from '@/api/insuranceApi';

type InsuranceSource = 'EMPLOYER' | 'PRIVATE' | 'OTHER';

export default function RegisterInsuranceForm({ onSaved }: { onSaved?: () => void }) {
  const [source, setSource] = useState<InsuranceSource>('EMPLOYER');
  const [providerName, setProviderName] = useState('');
  const [productName, setProductName] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await registerMyInsurance({
        source,
        providerName: providerName || undefined,
        productName: productName || undefined,
        validFrom: validFrom || undefined,
        validTo: validTo || undefined,
        notes: notes || undefined,
      });

      onSaved?.();

      setProviderName('');
      setProductName('');
      setValidFrom('');
      setValidTo('');
      setNotes('');
    } catch (e) {
      console.error(e);
      alert('Kunne ikke lagre forsikring');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">Registrer forsikring</h3>

      <div className="space-y-3">
        <label className="block text-sm">
          Kilde
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as InsuranceSource)}
            className="mt-1 w-full rounded border px-2 py-1"
          >
            <option value="EMPLOYER">Gjennom arbeidsgiver</option>
            <option value="PRIVATE">Privat</option>
            <option value="OTHER">Annet</option>
          </select>
        </label>

        <label className="block text-sm">
          Forsikringsselskap
          <input
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1"
            placeholder="f.eks. Storebrand, If, Gjensidige"
          />
        </label>

        <label className="block text-sm">
          Produkt / dekning
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1"
            placeholder="f.eks. Behandlingsforsikring"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            Gyldig fra
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </label>

          <label className="block text-sm">
            Gyldig til
            <input
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </label>
        </div>

        <label className="block text-sm">
          Notater
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1"
            rows={3}
            placeholder="Valgfritt"
          />
        </label>

        <button
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          {saving ? 'Lagrer…' : 'Lagre forsikring'}
        </button>
      </div>
    </div>
  );
}
