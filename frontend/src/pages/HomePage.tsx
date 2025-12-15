import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

const steps = [
  { title: 'Start veiviseren', text: '2-3 minutter. Ingen innlogging.' },
  { title: 'Svar kort', text: 'Hva skjer og hva du trenger. Hopp over det du vil.' },
  { title: 'Se planen', text: 'Ferdig struktur for de neste dagene.' },
];

export default function HomePage(): React.ReactElement {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const redirectParam = encodeURIComponent(location.pathname + location.search + location.hash);

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-900">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 -top-16 h-96 w-96 rounded-full bg-emerald-200/40 blur-[130px]" />
        <div className="absolute right-0 top-16 h-80 w-80 rounded-full bg-sky-200/35 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 py-14 md:py-16 space-y-12">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <span className="pill">Omstilling gjort enkelt</span>
            <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
              Kort veiviser. Klar plan. Mindre støy.
            </h1>

            <p className="text-lg text-slate-700">
              Vi skjærer ned til essensen: hva som skjer, hva du trenger, og neste tre steg. Alt på
              ett sted, med journal og dokumenter klare.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button to={isAuthenticated ? '/plan' : '/wizard'}>
                {isAuthenticated ? 'Gå til planen' : 'Start veiviseren'}
              </Button>

              {!isAuthenticated && (
                <Button to={`/login?redirect=${redirectParam}`} variant="secondary">
                  Logg inn
                </Button>
              )}
            </div>

            <div className="text-sm text-slate-600 space-y-1">
              <p>• Tar 2-3 minutter.</p>
              <p>• Du kan hoppe over spørsmål.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="shadow-2xl">
              <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                Planen på under fem minutter
              </h2>

              <div className="mt-5 space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-semibold">
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
