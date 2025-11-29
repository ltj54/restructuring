import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import PageLayout from '../components/PageLayout';

export default function ResourcesPage(): React.ReactElement {
  const [inntekt, setInntekt] = useState<number>(0);
  const [utgifter, setUtgifter] = useState<number>(0);
  const [buffer, setBuffer] = useState<number>(0);

  const overskudd = useMemo(() => inntekt - utgifter, [inntekt, utgifter]);
  const bufferMnd = useMemo(
    () => (utgifter > 0 ? (buffer / utgifter).toFixed(1) : '0'),
    [buffer, utgifter]
  );

  return (
    <PageLayout
      title="Ressurser"
      subtitle="Enkle kalkyler og lenker du kan bruke mens du jobber med planen din."
      maxWidthClassName="max-w-4xl"
    >
      <div className="space-y-6">
        <Card title="Økonomi">
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

            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div>Overskudd per måned: {overskudd.toLocaleString('nb-NO')} kr</div>
              <div>Buffer dekker: {bufferMnd} måneder</div>
            </div>
          </div>
        </Card>

        <Card title="Nyttige lenker">
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
            <li>
              <a
                href="https://www.nav.no"
                className="text-emerald-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                NAV - rettigheter ved omstilling
              </a>
            </li>
            <li>
              <a
                href="https://www.skatteetaten.no"
                className="text-emerald-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                Skatteetaten - skattetrekk og endringer
              </a>
            </li>
          </ul>
        </Card>
      </div>
    </PageLayout>
  );
}
