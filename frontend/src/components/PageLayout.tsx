import React from 'react';

type PageLayoutProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClassName?: string;
};

export default function PageLayout({
  title,
  subtitle,
  actions,
  children,
  maxWidthClassName = 'max-w-6xl',
}: PageLayoutProps): React.ReactElement {
  return (
    <main className="relative min-h-screen overflow-hidden text-slate-900">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-200/35 blur-[110px]" />
        <div className="absolute right-0 top-6 h-72 w-72 rounded-full bg-sky-200/35 blur-[120px]" />
        <div className="absolute left-12 bottom-10 h-64 w-64 rounded-full bg-emerald-100/35 blur-[120px]" />
      </div>

      <div className={`relative w-full mx-auto px-4 py-12 md:py-16 ${maxWidthClassName}`}>
        {(title || subtitle || actions) && (
          <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              {title && (
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">{title}</h1>
              )}
              {subtitle && <p className="text-lg text-slate-700">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-3 print-hidden">{actions}</div>}
          </header>
        )}

        {children}
      </div>
    </main>
  );
}
