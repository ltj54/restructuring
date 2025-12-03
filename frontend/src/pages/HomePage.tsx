import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

const steps = [
  { title: 'Start veiviseren', text: 'Tar 2–3 minutter. Ingen innlogging kreves.' },
  { title: 'Svar kort', text: 'Situasjon og økonomi. Du kan hoppe over alt du ikke vet.' },
  { title: 'Få planen', text: '14-dagers oppgaver, maler og hvem du bør snakke med først.' },
];

export default function HomePage(): React.ReactElement {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const redirectParam = encodeURIComponent(
    location.pathname + location.search + location.hash,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/25 to-white text-slate-900">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 20%, rgba(16, 185, 129, 0.12), transparent 32%), ' +
            'radial-gradient(circle at 75% 15%, rgba(14, 165, 233, 0.12), transparent 30%), ' +
            'radial-gradient(circle at 60% 80%, rgba(94, 234, 212, 0.08), transparent 28%)',
        }}
      />

      <div className="relative w-full max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-10">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
              Omstilling gjort enkelt
            </p>

            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Én kort veiviser som forteller deg hva du skal gjøre nå
            </h1>

            <p className="text-lg text-slate-700">
              Vi kutter alt støyet. Start veiviseren, svar kort, og få en plan som viser hva du bør
              gjøre denne uken – og hvordan du sikrer pengene dine.
            </p>

            <div className="flex flex-wrap gap-3">
              {/* START / SE PLANEN MIN */}
              <Button
                to={isAuthenticated ? '/plan' : '/wizard'}
                className="bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 font-semibold border-transparent shadow-lg shadow-emerald-400/30 hover:shadow-emerald-200/50"
              >
                {isAuthenticated ? 'Se planen min' : 'Start veiviseren'}
              </Button>

              {/* LOGIN BUTTON (ONLY WHEN NOT LOGGED IN) */}
              {!isAuthenticated && (
                <Button
                  to={`/login?redirect=${redirectParam}`}
                  className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm"
                >
                  Logg inn
                </Button>
              )}
            </div>

            <div className="text-sm text-slate-600 space-y-1">
              <p>• Ingen innlogging nødvendig for å teste.</p>
              <p>• Tar 2–3 minutter. Du kan hoppe over spørsmål.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="bg-white text-slate-900 shadow-xl border-slate-100">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">
                Slik fungerer det
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                På plass på under 5 min
              </h2>

              <div className="mt-5 space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">{step.title}</p>
                      <p className="text-sm text-slate-700">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
