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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white text-slate-900">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.12), transparent 32%), ' +
            'radial-gradient(circle at 80% 10%, rgba(14, 165, 233, 0.12), transparent 30%), ' +
            'radial-gradient(circle at 60% 80%, rgba(94, 234, 212, 0.10), transparent 28%)',
        }}
      />

      <div className={`relative w-full mx-auto px-4 py-12 md:py-16 ${maxWidthClassName}`}>
        {(title || subtitle || actions) && (
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              {title && (
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">{title}</h1>
              )}
              {subtitle && <p className="text-lg text-slate-700">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2 print-hidden">{actions}</div>}
          </header>
        )}

        {children}
      </div>
    </main>
  );
}
