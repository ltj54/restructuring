import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '@/components/Button';

export default function HomePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-14 space-y-16">

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm"
        >
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Hva er viktigst for deg akkurat nå?
            </h1>

            <p className="text-lg text-slate-700">
              Når jobb, økonomi eller forsikring er i spill, hjelper vi deg å
              prioritere riktig – uten stress.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button to="/wizard">Få oversikt nå</Button>
              <Button to="/wizard/unsure" variant="secondary">
                Jeg er usikker
              </Button>
            </div>

            <p className="text-sm text-slate-600">
              Tar 2–3 minutter. Ingen salg. Du kan hoppe over spørsmål.
            </p>
          </div>
        </motion.section>

        {/* PRIMARY ACTION BLOCKS */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="space-y-6"
        >
          <h2 className="text-2xl md:text-3xl font-semibold">
            Velg det som føles mest riktig nå
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Link to="/wizard?focus=jobb" className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-emerald-300">
              <h3 className="text-xl font-semibold">💼 Jobb & inntekt</h3>
              <p className="mt-3 text-slate-700">
                Forstå situasjonen, rettigheter og hva som bør gjøres først.
              </p>
              <div className="mt-6 font-medium text-emerald-700">Start her →</div>
            </Link>

            <Link to="/wizard?focus=okonomi" className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-emerald-300">
              <h3 className="text-xl font-semibold">🛡️ Økonomi & forsikring</h3>
              <p className="mt-3 text-slate-700">
                Sikre det viktigste først – vent med resten.
              </p>
              <div className="mt-6 font-medium text-emerald-700">Få oversikt →</div>
            </Link>

            <Link to="/journal" className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-emerald-300">
              <h3 className="text-xl font-semibold">🧠 Tanker & støtte</h3>
              <p className="mt-3 text-slate-700">
                Få det ut av hodet og ned på ett sted.
              </p>
              <div className="mt-6 font-medium text-emerald-700">Skriv litt →</div>
            </Link>
          </div>
        </motion.section>

        {/* UNSURE SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="text-2xl font-semibold">Usikker på hva du trenger?</h2>
          <p className="mt-3 max-w-2xl text-slate-700">
            Det er helt normalt. Vi stiller noen enkle spørsmål og hjelper deg
            å sortere – i ditt tempo.
          </p>
          <div className="mt-5">
            <Button to="/wizard/unsure">Hjelp meg å finne ut av det</Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
