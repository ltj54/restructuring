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
        'bg-white rounded-3xl text-slate-900',
        'border border-slate-200 shadow-sm p-6 md:p-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          {title && (
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </h1>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
