import React, { useEffect, useState } from 'react';
import {
  analyzeCoverageGaps,
  analyzeCoverageLoss,
  CoverageGapAnalysisRequest,
  CoverageGapAnalysisResponse,
  CoverageLossAnalysisResponse,
  getInsuranceProducts,
  getMyInsurances,
  InsuranceProductDto,
  UserInsuranceResponse,
} from '@/api/insuranceApi';
import RegisterInsuranceForm from '@/components/insurance/RegisterInsuranceForm';

type TabKey = 'loss' | 'gaps' | 'catalog';

const severityLabel: Record<string, string> = {
  CRITICAL: 'Kritisk',
  HIGH: 'Høy',
  MEDIUM: 'Moderat',
  LOW: 'Lav',
};

const severityColorClass: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('loss');

  // -------- KATALOG --------
  const [products, setProducts] = useState<InsuranceProductDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // -------- MINE FORSIKRINGER --------
  const [myInsurances, setMyInsurances] = useState<UserInsuranceResponse[]>([]);
  const [loadingMyInsurances, setLoadingMyInsurances] = useState(false);

  // -------- LOSS --------
  const [lossResult, setLossResult] = useState<CoverageLossAnalysisResponse | null>(null);
  const [lossLoading, setLossLoading] = useState(false);

  // -------- GAP --------
  const [gapForm, setGapForm] = useState<CoverageGapAnalysisRequest>({
    age: 45,
    hasChildren: true,
    hasMortgage: true,
    bufferMonths: 1,
    hasPrivateHealth: false,
    hasPrivateDisability: false,
    hasCriticalIllness: false,
    hasTravel: true,
    hasChildInsurance: false,
  });
  const [gapResult, setGapResult] = useState<CoverageGapAnalysisResponse | null>(null);
  const [gapLoading, setGapLoading] = useState(false);

  // -------- INIT --------
  useEffect(() => {
    setLoadingProducts(true);
    setProductsError(null);
    getInsuranceProducts()
      .then(setProducts)
      .catch(() => setProductsError('Kunne ikke laste forsikringskatalogen.'))
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    if (activeTab !== 'loss') return;

    setLoadingMyInsurances(true);
    getMyInsurances()
      .then(setMyInsurances)
      .finally(() => setLoadingMyInsurances(false));
  }, [activeTab]);

  // -------- HANDLERS --------
  const handleGapChange = (field: keyof CoverageGapAnalysisRequest, value: boolean | number) => {
    setGapForm((prev) => ({ ...prev, [field]: value as never }));
  };

  const runLossAnalysis = async () => {
    setLossLoading(true);
    try {
      const result = await analyzeCoverageLoss();
      setLossResult(result);
    } finally {
      setLossLoading(false);
    }
  };

  const runGapAnalysis = async () => {
    setGapLoading(true);
    try {
      const result = await analyzeCoverageGaps(gapForm);
      setGapResult(result);
    } finally {
      setGapLoading(false);
    }
  };

  // -------- UI --------
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Forsikring i omstilling</h1>

      <div className="mb-6 flex gap-4 border-b">
        <TabButton tab="loss" activeTab={activeTab} onClick={setActiveTab}>
          Hva mister jeg?
        </TabButton>
        <TabButton tab="gaps" activeTab={activeTab} onClick={setActiveTab}>
          Behovsanalyse
        </TabButton>
        <TabButton tab="catalog" activeTab={activeTab} onClick={setActiveTab}>
          Produktkatalog
        </TabButton>
      </div>

      {/* ================= LOSS ================= */}
      {activeTab === 'loss' && (
        <section className="space-y-6">
          <RegisterInsuranceForm
            onSaved={() => {
              runLossAnalysis();
              getMyInsurances().then(setMyInsurances);
            }}
          />

          <div>
            <h2 className="mb-2 text-xl font-semibold">Mine forsikringer</h2>

            {loadingMyInsurances && <p className="text-slate-500">Laster forsikringer…</p>}

            {!loadingMyInsurances && myInsurances.length === 0 && (
              <p className="text-slate-600">Du har ikke registrert noen forsikringer ennå.</p>
            )}

            <ul className="space-y-2">
              {myInsurances.map((i) => (
                <li key={i.id} className="rounded border bg-white p-3">
                  <div className="flex justify-between gap-4">
                    <div>
                      <strong>{i.productName || 'Ukjent produkt'}</strong>
                      <div className="text-sm text-slate-600">{i.providerName}</div>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs">{i.source}</span>
                  </div>

                  {i.notes && <div className="mt-1 text-xs text-slate-600">{i.notes}</div>}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={runLossAnalysis}
            disabled={lossLoading}
            className="rounded bg-slate-900 px-4 py-2 text-white"
          >
            {lossLoading ? 'Analyserer…' : 'Analyser hva jeg mister'}
          </button>

          {lossResult && (
            <ul className="space-y-2">
              {lossResult.losses.map((l, i) => (
                <li key={i} className={`rounded border p-2 ${severityColorClass[l.severity]}`}>
                  <strong>{l.area}</strong> – {l.description}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ================= GAP ================= */}
      {activeTab === 'gaps' && (
        <section className="space-y-4">
          <button
            onClick={runGapAnalysis}
            disabled={gapLoading}
            className="rounded bg-slate-900 px-4 py-2 text-white"
          >
            {gapLoading ? 'Analyserer…' : 'Analyser hull'}
          </button>

          {gapResult && (
            <ul className="space-y-4">
              {gapResult.gaps.map((g, i) => (
                <li key={i} className={`rounded border p-3 ${severityColorClass[g.severity]}`}>
                  <div className="flex justify-between">
                    <strong>{g.area}</strong>
                    <span className="text-xs font-semibold uppercase">
                      {severityLabel[g.severity]}
                    </span>
                  </div>

                  <p className="mt-1 text-sm">{g.recommendedAction}</p>

                  {g.recommendedProducts?.length > 0 && (
                    <div className="mt-3 rounded bg-white/60 p-3">
                      <div className="mb-1 text-xs font-semibold text-slate-600">
                        Anbefalte produkter
                      </div>
                      <ul className="space-y-1 text-sm">
                        {g.recommendedProducts.map((p) => (
                          <li key={p.id}>
                            {p.name} <span className="text-slate-500">({p.provider})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ================= CATALOG ================= */}
      {activeTab === 'catalog' && (
        <section>
          {loadingProducts && <p>Laster…</p>}
          {productsError && <p className="text-red-600">{productsError}</p>}

          {products.map((p) => (
            <div key={p.id} className="mb-2 border-b pb-2">
              <strong>{p.name}</strong> ({p.providerName})
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function TabButton({
  tab,
  activeTab,
  onClick,
  children,
}: {
  tab: TabKey;
  activeTab: TabKey;
  onClick: (t: TabKey) => void;
  children: React.ReactNode;
}) {
  const active = tab === activeTab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`pb-2 ${active ? 'border-b-2 font-semibold' : 'text-slate-500'}`}
    >
      {children}
    </button>
  );
}
