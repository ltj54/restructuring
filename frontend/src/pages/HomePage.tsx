import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '@/components/Button';

const helpCards = [
  {
    title: 'Økonomi & buffer',
    subtitle: 'Hva skal jeg sikre først?',
    bullets: ['Buffer', 'Faste utgifter', 'Kortsiktig risiko'],
    to: '/wizard?focus=okonomi',
  },
  {
    title: 'Forsikring',
    subtitle: 'Hva må jeg ha - og hva kan vente?',
    bullets: ['Dekning som betyr noe nå', 'Hull / overforsikring', 'Prioritering'],
    to: '/insurance',
  },
  {
    title: 'Jobb & omstilling',
    subtitle: 'Hva gjør jeg nå - og hva kan vente?',
    bullets: ['Rekkefølge', 'Neste praktiske steg', 'Redusere stress'],
    to: '/wizard?focus=jobb',
  },
  {
    title: 'Min plan',
    subtitle: 'Samlet oversikt - på ett sted',
    bullets: ['Gå rett på svaret', 'Neste steg samlet', 'Ingen omveier'],
    to: '/plan',
  },
  {
    title: 'Tanker & notater',
    subtitle: 'Få det ut av hodet',
    bullets: ['Lav terskel', 'Høy verdi', 'Mindre stress nå'],
    to: '/journal',
  },
  {
    title: 'Jeg er usikker',
    subtitle: 'Hjelp meg å finne ut av det',
    bullets: ['Starter veiviseren', 'Ekstra rolig tempo', 'Trygg start nå'],
    to: '/wizard',
  },
];

const steps = [
  {
    title: 'Forstå situasjonen',
    text: 'Noen få spørsmål - hopp over det du vil.',
  },
  {
    title: 'Sorter støy',
    text: 'Vi filtrerer bort det som ikke er relevant nå.',
  },
  {
    title: 'Få planen',
    text: 'Konkrete neste steg, ikke lange råd.',
  },
];

export default function HomePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm"
        >
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Hva skal du gjøre nå?
            </h1>
            <p className="text-lg text-slate-700">
              Få klare neste steg når jobb, økonomi eller forsikring er i spill.
            </p>
            <p className="text-sm text-slate-600">
              Tar 2-3 minutter. Du kan hoppe over spørsmål.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button to="/wizard">Finn neste steg nå</Button>
              <Button to="/plan" variant="secondary">
                Se planen direkte
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Ikke bytt for å spare - handle riktig når alt er uoversiktlig.
            </p>
          </div>
        </motion.section>

        {/* HELP CARDS */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Hva trenger du hjelp med akkurat nå?
            </h2>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {helpCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className={[
                  'group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition',
                  'hover:border-emerald-300 hover:shadow-md',
                ].join(' ')}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.title}
                </div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{card.subtitle}</p>
                <ul className="mt-4 space-y-1 text-sm text-slate-700">
                  {card.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className="mt-4 text-sm font-medium text-emerald-700">
                  Finn neste steg
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* OUTCOME */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="text-2xl md:text-3xl font-semibold">
            Dette får du på noen minutter
          </h2>
          <div className="mt-4 space-y-2 text-slate-700">
            <p>En tydelig prioritering av hva som er viktig nå</p>
            <p>Hva du trygt kan ignorere foreløpig</p>
            <p>En enkel plan for de neste dagene</p>
            <p>Alt samlet - ikke spredt over ti steder</p>
          </div>
          <p className="mt-4 text-sm text-slate-600">Ingen salg. Ingen binding.</p>
        </motion.section>

        {/* HOW IT WORKS */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="text-2xl md:text-3xl font-semibold">Slik fungerer det</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 p-5">
                <div className="text-xs font-semibold text-slate-500">
                  {index + 1}. {step.title}
                </div>
                <p className="mt-2 text-sm text-slate-700">{step.text}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}


