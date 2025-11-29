import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchJson } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';

export default function HomePage(): React.ReactElement {
  const [offer, setOffer] = useState<{ offer: string } | null>(null);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);

  useEffect(() => {
    async function fetchOffer() {
      try {
        const data = await fetchJson<{ offer: string }>('/offer');
        setOffer(data);
      } catch {
        // backend svarer ikke - vis bare standardteksten
      }
    }
    fetchOffer();
  }, []);

  const closeInsuranceModal = () => setShowInsuranceModal(false);

  const renderInsuranceModalContent = () => (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Inntektstapsforsikring ved omstilling</h3>
          <p className="text-sm text-gray-500">
            Hvis inntekten din faller på grunn av omstilling, nedbemanning eller endret stilling,
            kan inntektstapsforsikring gi deg tid og ro til å finne neste steg – uten økonomisk
            krasj.
          </p>
        </div>
        <button
          onClick={closeInsuranceModal}
          aria-label="Lukk"
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </header>

      <div className="mt-4 space-y-4 text-sm text-gray-700">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-1">Hva er det?</h4>
            <p>
              En forsikring som gir deg en avtalt månedlig utbetaling når du mister inntekt på grunn
              av omstilling.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Når hjelper den?</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>stilling forsvinner ved outsourcing/nedbemanning</li>
              <li>du går ned i lønn/stilling etter omorganisering</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Hva dekker den ikke?</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>frivillig jobbskifte</li>
              <li>«lei av jobben»-situasjoner</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p>
            {offer?.offer ||
              'Dekningen tilpasses lønnen din slik at du kan dekke utgiftene mens du finner neste løsning.'}
          </p>
          <Link
            to="/plan"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition"
          >
            Se hvor mye jeg kan få
          </Link>
        </div>
      </div>
    </>
  );

  const quickBenefits = [
    {
      title: 'Rask oversikt',
      text: 'Forstå hvilken fase du er i og hva som må avklares først.',
    },
    {
      title: 'Trygg økonomi',
      text: 'Se rettigheter, dekninger og beløp tilpasset situasjonen din.',
    },
    {
      title: 'Handling nå',
      text: '14-dagers plan med små oppgaver som gir effekt og ro.',
    },
  ];

  const navigationShortcuts = [
    {
      title: 'Situasjon',
      text: 'Kartlegg fase, tidslinje og hva arbeidsgiver har kommunisert.',
      link: '/wizard',
    },
    {
      title: 'Økonomi og rettigheter',
      text: 'Lønn, sluttpakker, NAV, forsikringer og frister.',
      link: '/plan',
    },
    {
      title: 'Kompetanse og CV',
      text: 'Oppdater CV, portefølje og nettverk slik at du er søknadsklar.',
      link: '/plan',
    },
    {
      title: 'Handlinger',
      text: 'Prioriter tre ting denne uken som flytter deg nærmere neste jobb.',
      link: '/plan',
    },
  ];

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

      <div className="relative w-full max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-10">
        <section className="grid md:grid-cols-5 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="md:col-span-3 space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100 shadow">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Hensikt: Gi deg oversikt, ro og konkrete valg når jobben endrer seg
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                Stå støtt i omstilling – bygg planen din på noen minutter
              </h1>
              <p className="text-lg text-slate-700">
                Vi samler alt på ett sted: fasekartlegging, økonomi, rettigheter, forsikringer og
                handlinger du kan ta de neste dagene. Du slipper å gjette hva som er viktigst.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                to="/wizard"
                className="bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 font-semibold border-transparent shadow-lg shadow-emerald-400/30 hover:shadow-emerald-200/50"
              >
                Start veiviseren
              </Button>
              <Button
                to="/plan"
                className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold"
              >
                Bygg min plan
              </Button>
              <Button
                type="button"
                onClick={() => setShowInsuranceModal(true)}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Les om inntektstapsforsikring
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickBenefits.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-emerald-100 bg-white p-4 text-slate-800 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-700 mt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="md:col-span-2"
          >
            <Card className="bg-white text-slate-900 shadow-xl border-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">
                    Planen din
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">14-dagers ro-plan</h2>
                  <p className="text-sm text-slate-600">
                    En enkel rekkefølge som gir effekt raskt, uten å bruke all tiden din.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">
                  Klar til start
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  'Kartlegg situasjonen og fasen du er i',
                  'Økonomi og rettigheter: hva har du, hva mangler du',
                  'Kompetanse, CV og nettverk – gjør deg søknadsklar',
                  'Handlinger neste 14 dager med tydelige delmål',
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                      {index + 1}
                    </div>
                    <div className="text-sm text-slate-700">{step}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button to="/plan" className="bg-emerald-500 text-slate-900 border-transparent font-semibold">
                  Åpne planen
                </Button>
                <Button to="/wizard" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                  Hopp til veiviseren
                </Button>
              </div>
            </Card>
          </motion.div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <Card
            title="Prioriter disse stegene først"
            className="bg-white text-slate-900 shadow-lg border-slate-100"
            actions={
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
                Mest effekt
              </span>
            }
          >
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">Få oversikt over økonomien</p>
                  <p>Se hva som skjer med lønn, sluttpakker og dagpenger, og legg inn dekninger.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-500 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">Dokumenter det viktigste</p>
                  <p>Oppdater CV, LinkedIn og et kort sammendrag du kan bruke i samtaler.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">Planlegg de neste 14 dagene</p>
                  <p>Små, realistiske handlinger med milepæler som gir deg kontroll og fremdrift.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Trygghet og dekning"
            className="bg-white text-slate-900 shadow-lg border-slate-100"
            actions={
              <Button
                type="button"
                onClick={() => setShowInsuranceModal(true)}
                className="bg-emerald-500 text-slate-900 border-transparent font-semibold"
              >
                Se detaljene
              </Button>
            }
          >
            <p className="text-sm text-slate-700">
              {offer?.offer ||
                'Dekningen tilpasses lønnen din. Se hvor mye du kan få de neste månedene hvis inntekten faller.'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Hva vi beregner</p>
                <p className="mt-1 font-semibold text-slate-900">Dekning per måned</p>
                <p>Tilpasset lønn, sluttpakke og dagpenger.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Når den slår inn</p>
                <p className="mt-1 font-semibold text-slate-900">Ved omstilling og nedbemanning</p>
                <p>Gir ro mens du finner neste steg.</p>
              </div>
            </div>
            <div className="mt-4">
              <Button to="/plan" className="bg-white text-emerald-700 border-emerald-200 font-semibold">
                Regn på min dekning
              </Button>
            </div>
          </Card>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-600 font-semibold uppercase tracking-[0.15em]">
                Naviger etter behov
              </p>
              <h3 className="text-2xl font-semibold text-slate-900">Finn raskt frem til det du trenger</h3>
              <p className="text-slate-700">
                Hopper du inn for å sjekke én ting? Velg snarveien som passer situasjonen akkurat nå.
              </p>
            </div>
            <Button to="/wizard" className="bg-white text-slate-900 border-transparent font-semibold">
              Start guiding
            </Button>
          </div>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {navigationShortcuts.map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="group rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 hover:border-emerald-300 hover:-translate-y-1 transition-transform shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  <span className="text-xs text-emerald-700 group-hover:text-emerald-600">Gå</span>
                </div>
                <p className="text-sm text-slate-700 mt-2">{item.text}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {showInsuranceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeInsuranceModal} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 mx-4">
            {renderInsuranceModalContent()}
            <footer className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeInsuranceModal}
                className="border border-slate-300 text-slate-800 px-4 py-2 rounded-xl text-sm hover:bg-slate-50 transition"
              >
                Lukk
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
