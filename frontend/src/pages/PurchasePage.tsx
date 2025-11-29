import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import { API_BASE_URL } from '../utils/config';
import { getErrorMessage } from '../utils/api';

type InsuranceOffer = {
  price: number;
  coverage: string;
};

export default function PurchasePage(): React.ReactElement {
  const [offer, setOffer] = useState<InsuranceOffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    let isMounted = true;

    const fetchOffer = async () => {
      if (!token) {
        setError('Du må være innlogget for å se tilbudet.');
        setOffer(null);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/private/offer`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = (await response.json()) as InsuranceOffer;
        if (isMounted) {
          setOffer(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setOffer(null);
          setError(getErrorMessage(err, 'Kunne ikke hente tilbud.'));
        }
      }
    };

    fetchOffer();
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <PageLayout
      title="Ditt forsikringstilbud"
      subtitle="Se pris og dekning basert på planen din."
      maxWidthClassName="max-w-3xl"
      actions={
        <Button to="/plan" className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold">
          Tilbake til plan
        </Button>
      }
    >
      <Card>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {offer ? (
          <div className="border rounded-xl p-4 bg-slate-50 text-sm space-y-2">
            <p>
              <strong>Pris per måned:</strong> {offer.price} kr
            </p>
            <p>
              <strong>Dekning:</strong> {offer.coverage}
            </p>
            <Link to="/insurance" className="text-sm text-emerald-700 font-semibold hover:underline">
              Se detaljer om dekning
            </Link>
          </div>
        ) : (
          !error && <p className="text-sm text-slate-600">Henter tilbud.</p>
        )}
      </Card>
    </PageLayout>
  );
}
