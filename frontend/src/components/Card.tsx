import React from 'react';

type CardProps = {
  title?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function Card({ title, actions, className = '', children }: CardProps) {
  return (
    <section
      className={[
        'surface-card text-slate-900',
        'rounded-3xl p-6 md:p-7 shadow-lg shadow-slate-200/40 border border-slate-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(title || actions) && (
        <header className="mb-5 flex items-start justify-between gap-3">
          {title && <h1 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h1>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="text-sm md:text-base text-slate-800">{children}</div>
    </section>
  );
}
