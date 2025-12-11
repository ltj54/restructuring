import React, { useEffect, useState } from 'react';
import { FormAlert } from '@/components/form/FormAlert';
import TextField from '@/components/form/TextField';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { useInsurancePage } from '@/hooks/useInsurancePage';
import { API_BASE_URL } from '@/utils/config';
import { getErrorMessage } from '@/utils/api';

type InsuranceOffer = {
  price: number;
  coverage: string;
};

export default function InsurancePage(): React.ReactElement {
  const {
    form,
    banner,
    isLoading,
    isSaving,
    isSending,
    needsInfo,
    onSaveProfile,
    onSendInsurance,
  } = useInsurancePage();

  const [offer, setOffer] = useState<InsuranceOffer | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const {
    register,
    formState: { errors },
  } = form;

  useEffect(() => {
    let isMounted = true;

    const fetchOffer = async () => {
      if (!token) {
        setOffer(null);
        setOfferError('Du må være innlogget for å se tilbudet.');
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
          setOfferError(null);
        }
      } catch (err) {
        if (isMounted) {
          setOffer(null);
          setOfferError(getErrorMessage(err, 'Kunne ikke hente tilbud.'));
        }
      }
    };

    fetchOffer();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <PageLayout
        title="Inntektstapsforsikring"
        subtitle="Henter informasjon ..."
        maxWidthClassName="max-w-4xl"
      >
        <div className="text-center text-slate-700">Laster ...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Inntektstapsforsikring"
      subtitle="Send inn opplysningene dine og få beregnet dekningen som passer planen din."
      maxWidthClassName="max-w-4xl"
      actions={
        <Button
          to="/plan"
          className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold"
        >
          Tilbake til plan
        </Button>
      }
    >
      <div className="space-y-6">
        <Card title="Ditt forsikringstilbud">
          {offerError && <p className="mb-3 text-sm text-red-600">{offerError}</p>}
          {offer ? (
            <div className="border rounded-xl p-4 bg-slate-50 text-sm space-y-2">
              <p>
                <strong>Pris per måned:</strong> {offer.price} kr
              </p>
              <p>
                <strong>Dekning:</strong> {offer.coverage}
              </p>
            </div>
          ) : (
            !offerError && <p className="text-sm text-slate-600">Henter tilbud ...</p>
          )}
        </Card>

        {banner && (
          <FormAlert variant={banner.variant} message={banner.message} action={banner.action} />
        )}

        {needsInfo && (
          <Card title="Fyll ut manglende opplysninger">
            <p className="text-sm text-slate-600 mb-4">
              For å sende inn forsikringssøkaden må vi vite hvem du er.
            </p>

            <form onSubmit={onSaveProfile} className="flex flex-col gap-4">
              <TextField
                label="Fornavn"
                placeholder="Fornavn"
                error={errors.firstName?.message}
                autoComplete="given-name"
                {...register('firstName')}
              />

              <TextField
                label="Etternavn"
                placeholder="Etternavn"
                error={errors.lastName?.message}
                autoComplete="family-name"
                {...register('lastName')}
              />

              <TextField
                label="Fødselsnummer"
                placeholder="Fødselsnummer (11 siffer)"
                error={errors.ssn?.message}
                inputMode="numeric"
                autoComplete="off"
                {...register('ssn')}
              />

              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Lagrer...' : 'Lagre informasjon'}
              </Button>
            </form>
          </Card>
        )}

        <Card title="Send inn søknad">
          <p className="text-sm text-slate-700 mb-4">
            Når du sender inn, får du bekreftelse på e-post.
          </p>
          <Button type="button" onClick={onSendInsurance} disabled={isSending}>
            {isSending ? 'Sender...' : 'Send søknad'}
          </Button>
        </Card>
      </div>
    </PageLayout>
  );
}
