import React, { useMemo, useState } from 'react';
import Card from '@/components/Card';
import PageLayout from '@/components/PageLayout';
import AddToJournalModal from '@/components/AddToJournalModal';

export default function ResourcesPage(): React.ReactElement {
  // ------------------------------
  // ØKONOMI-KALKULATOR
  // ------------------------------
  const [inntekt, setInntekt] = useState<number>(0);
  const [utgifter, setUtgifter] = useState<number>(0);
  const [buffer, setBuffer] = useState<number>(0);

  const overskudd = useMemo(() => inntekt - utgifter, [inntekt, utgifter]);

  const bufferMnd = useMemo(() => {
    if (utgifter <= 0) return 0;
    return Number((buffer / utgifter).toFixed(1));
  }, [buffer, utgifter]);

  const bufferColor =
    bufferMnd >= 6 ? 'text-emerald-700' : bufferMnd >= 3 ? 'text-amber-600' : 'text-red-600';

  // ------------------------------
  // DAGPENGER-KALKULATOR (forenklet)
  // ------------------------------
  const [brutto12, setBrutto12] = useState<number>(0);

  const dagpenger = useMemo(() => {
    // NAV-regel: ca 62.4 % av inntekt – forenklet.
    const yearly = brutto12 * 0.624;
    return Math.round(yearly / 12);
  }, [brutto12]);

  const dagpengerDiff = useMemo(() => {
    return Math.round(inntekt - dagpenger || 0);
  }, [inntekt, dagpenger]);

  // ------------------------------
  // JOURNAL-INTEGRASJON
  // ------------------------------
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalContent, setJournalContent] = useState('');

  function openJournalWithEconomy() {
    setJournalContent(
      `
Økonomioppdatering:

• Netto inntekt: ${inntekt.toLocaleString('nb-NO')} kr
• Utgifter: ${utgifter.toLocaleString('nb-NO')} kr
• Overskudd: ${overskudd.toLocaleString('nb-NO')} kr
• Buffer: ${buffer.toLocaleString('nb-NO')} kr (${bufferMnd} måneder)
    `.trim()
    );
    setJournalOpen(true);
  }

  function openJournalWithDagpenger() {
    setJournalContent(
      `
Dagpenge-beregning:

• Brutto lønn siste 12 mnd: ${brutto12.toLocaleString('nb-NO')} kr
• Estimert dagpenger: ${dagpenger.toLocaleString('nb-NO')} kr / mnd
• Differanse fra lønn: ${dagpengerDiff.toLocaleString('nb-NO')} kr / mnd
    `.trim()
    );
    setJournalOpen(true);
  }

  // ------------------------------
  // COMPONENT
  // ------------------------------
  return (
    <PageLayout
      title="Ressurser"
      subtitle="Verktøy, kalkyler og sjekklister du kan bruke mens du jobber med omstilling og planlegging."
      maxWidthClassName="max-w-4xl"
    >
      <div className="space-y-6">
        {/* =======================================
            1. ØKONOMISK TRYGGHET
           ======================================= */}
        <Card title="Økonomisk oversikt">
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="text-slate-700">Månedlig netto inntekt (kr)</span>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                value={inntekt || ''}
                onChange={(e) => setInntekt(Number(e.target.value || 0))}
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-700">Månedlige utgifter (kr)</span>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                value={utgifter || ''}
                onChange={(e) => setUtgifter(Number(e.target.value || 0))}
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-700">Buffer på konto (kr)</span>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                value={buffer || ''}
                onChange={(e) => setBuffer(Number(e.target.value || 0))}
              />
            </label>

            <div className="rounded-xl bg-slate-50 p-3 text-sm space-y-1">
              <div>
                Overskudd per måned:{' '}
                <span className={overskudd >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                  {overskudd.toLocaleString('nb-NO')} kr
                </span>
              </div>
              <div>
                Buffer dekker: <span className={bufferColor}>{bufferMnd} måneder</span>
              </div>

              {/* Dynamisk tilbakemelding */}
              <div className="pt-2 text-slate-600">
                {bufferMnd >= 6 && (
                  <>Du ligger trygt! Bufferen gir deg godt handlingsrom i omstilling.</>
                )}
                {bufferMnd >= 3 && bufferMnd < 6 && (
                  <>OK buffer. Du er relativt trygg, men følg med på utgiftene.</>
                )}
                {bufferMnd > 0 && bufferMnd < 3 && (
                  <>Bufferen er lav – vurder å redusere utgifter midlertidig.</>
                )}
                {bufferMnd === 0 && <>Skriv inn tall for å få en vurdering.</>}
              </div>

              {/* 💾 Legg til i journalen */}
              <button
                className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm"
                onClick={openJournalWithEconomy}
              >
                Legg denne beregningen i journalen
              </button>
            </div>
          </div>
        </Card>

        {/* =======================================
            2. DAGPENGER
           ======================================= */}
        <Card title="Dagpengekalkulator (forenklet)">
          <div className="space-y-4 text-sm">
            <label className="block">
              <span className="text-slate-700">Brutto inntekt siste 12 måneder (kr)</span>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                value={brutto12 || ''}
                onChange={(e) => setBrutto12(Number(e.target.value || 0))}
              />
            </label>

            <div className="rounded-xl bg-slate-50 p-3 space-y-1">
              <div>
                Estimerte dagpenger:{' '}
                <span className="text-slate-800 font-medium">
                  {dagpenger.toLocaleString('nb-NO')} kr / mnd
                </span>
              </div>
              <div>
                Differanse fra lønn:{' '}
                <span className={dagpengerDiff >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                  {dagpengerDiff.toLocaleString('nb-NO')} kr / mnd
                </span>
              </div>

              <div className="pt-2 text-slate-600">
                Tall er kun et grovt estimat basert på NAVs standardmodell (62.4 %).
              </div>

              {/* 💾 Legg til i journal */}
              <button
                className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm"
                onClick={openJournalWithDagpenger}
              >
                Legg denne beregningen i journalen
              </button>
            </div>
          </div>
        </Card>

        {/* =======================================
            3. SJEKKLISTER
           ======================================= */}
        <Card title="Sjekklister i omstilling">
          <div className="grid gap-6 md:grid-cols-2 text-sm">
            <div>
              <h3 className="font-medium text-slate-800 mb-2">Økonomi</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Sjekk dagpengerettigheter hos NAV</li>
                <li>Lag oversikt over faste utgifter</li>
                <li>Reduser 1–3 utgifter midlertidig</li>
                <li>Regn ut hvor lenge bufferen varer</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-slate-800 mb-2">Jobbsøking</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Oppdater CV og LinkedIn</li>
                <li>Kontakt tidligere kollegaer / nettverk</li>
                <li>Sett mål: 3–5 søknader per uke</li>
                <li>Lag liste over aktuelle stillinger</li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-medium text-slate-800 mb-2">Mental struktur</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Lag en enkel dagsplan</li>
                <li>Sett 1–3 konkrete mål for hver dag</li>
                <li>Før logg over hva du gjør</li>
                <li>Ta pauser uten dårlig samvittighet</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* =======================================
            4. NYTTIGE LENKER
           ======================================= */}
        <Card title="Nyttige lenker">
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
            <li>
              <a
                href="https://www.nav.no"
                className="text-emerald-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                NAV – dagpenger, tiltak og hjelp ved omstilling
              </a>
            </li>
            <li>
              <a
                href="https://www.arbeidsplassen.no"
                className="text-emerald-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                Arbeidsplassen – finn ledige stillinger
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/jobs"
                className="text-emerald-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn Jobs – jobbsøking via nettverk
              </a>
            </li>
            <li>
              <a
                href="https://www.coursera.org"
                className="text-emerald-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                Coursera – gratis kurs og kompetanseløft
              </a>
            </li>
            <li>
              <a
                href="https://www.skatteetaten.no"
                className="text-emerald-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                Skatteetaten – endre skattekort eller sjekke fradrag
              </a>
            </li>
          </ul>
        </Card>
      </div>

      {/* Modal */}
      <AddToJournalModal
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        defaultContent={journalContent}
      />
    </PageLayout>
  );
}
