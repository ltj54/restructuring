import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

const steps = [
  {
    title: 'Avklar situasjonen',
    text: 'Svar på noen korte spørsmål for å forstå hvor du står.',
  },
  {
    title: 'Velg hva som er viktig',
    text: 'Marker det som er relevant for deg akkurat nå.',
  },
  {
    title: 'Få planen',
    text: 'En enkel struktur for de neste dagene.',
  },
];

export default function HomePage(): React.ReactElement {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const redirectParam = encodeURIComponent(
    location.pathname + location.search + location.hash
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <section className="space-y-10">
          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="p-10 border border-slate-200 shadow-sm">
              <div className="max-w-2xl space-y-6">
                <span className="inline-block rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-700">
                  Omstilling - oversikt og neste steg
                </span>

                <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                  En klar plan.
                  <br />
                  Når det gjelder.
                </h1>

                <p className="text-lg text-slate-600">
                  Få oversikt over situasjonen din og hva som bør gjøres videre.
                  Alt samlet på ett sted.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button to="/wizard">
                    {isAuthenticated ? 'Gå til veiviser' : 'Start veiviseren'}
                  </Button>

                  {!isAuthenticated && (
                    <Button to={`/login?redirect=${redirectParam}`} variant="secondary">
                      Logg inn
                    </Button>
                  )}
                </div>

                <p className="text-sm text-slate-500">
                  Tar 2-3 minutter • Du kan hoppe over spørsmål
                </p>
              </div>
            </Card>
          </motion.div>

          {/* STEPS */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <Card className="p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Slik fungerer det</h2>

              <div className="space-y-5">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-slate-600">{step.text}</p>
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
