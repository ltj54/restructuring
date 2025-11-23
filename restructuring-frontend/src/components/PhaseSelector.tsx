import React from 'react';

type PhaseSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
};

const PHASE_OPTIONS = ['Før omstilling', 'Under omstilling', 'Etter omstilling'];

export default function PhaseSelector({
  value,
  onChange,
  className = '',
  label = 'Velg fase',
}: PhaseSelectorProps) {
  return (
    <div
      className={[
        'mt-6 bg-brand-soft/60 border border-brand-soft rounded-xl p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <label className="block text-sm text-slate-700 mb-2">{label}</label>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
      >
        {PHASE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

