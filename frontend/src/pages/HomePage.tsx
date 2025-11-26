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
        // backend svarer ikke – vis bare standardteksten
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
            kan inntektstapsforsikring gi deg tid og ro til å finne neste steg - uten økonomisk
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
            {(offer && offer.offer) ||
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

  return (
    <>
      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2"
        >
          <Card title="Omstilling i jobben?">
            <p className="text-sm text-slate-600 mb-3">
              Få oversikt og økonomisk trygghet. Denne siden gir deg enkel oversikt over hva
              omstilling betyr for deg - lønn, rettigheter, inntektssikring og neste steg.
            </p>

            <ul className="mb-4 text-sm text-slate-700 space-y-1 list-disc list-inside">
              <li>Forstå situasjonen og fasen du er i</li>
              <li>Se rettigheter, forsikringer og ordninger du har</li>
              <li>Lag en enkel plan for de neste 14 dagene</li>
            </ul>

            <div className="flex gap-3 flex-wrap mb-6">
              <Button to="/wizard">Start veiviseren</Button>
              <Button type="button" onClick={() => setShowInsuranceModal(true)}>
                Les om inntektstapsforsikring
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">Lag min plan</h3>
              <ol className="mt-2 list-decimal pl-5 text-sm text-slate-700 space-y-1">
                <li>Situasjon og fase</li>
                <li>Økonomi og rettigheter</li>
                <li>Kompetanse, CV og nettverk</li>
                <li>Handlinger neste 14 dager</li>
              </ol>
              <Button to="/plan" className="mt-3">
                Få min plan
              </Button>
            </div>
          </Card>
        </motion.div>

        <div />
      </section>

      {showInsuranceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeInsuranceModal} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 mx-4">
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
    </>
  );
}
