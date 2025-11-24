import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { API_BASE_URL } from '../utils/config';
import { getErrorMessage } from '../utils/api';

interface InsuranceOffer {
  price: number;
  coverage: string;
}

export default function PurchasePage() {
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
    <div className="w-full max-w-3xl mx-auto px-4 py-10">
      <Card title="Ditt forsikringstilbud">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {offer ? (
          <div className="border rounded-xl p-4 bg-brand-soft/60 text-sm space-y-2">
            <p>
              <strong>Pris per måned:</strong> {offer.price} kr
            </p>
            <p>
              <strong>Dekning:</strong> {offer.coverage}
            </p>
          </div>
        ) : (
          !error && <p className="text-sm text-slate-600">Henter tilbud.</p>
        )}
      </Card>
    </div>
  );
}
