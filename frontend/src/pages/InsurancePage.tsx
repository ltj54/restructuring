import React from 'react';
import { FormAlert } from '../components/form/FormAlert';
import TextField from '../components/form/TextField';
import Card from '../components/Card';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import { useInsurancePage } from '../hooks/useInsurancePage';

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

  const {
    register,
    formState: { errors },
  } = form;

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
        <Button to="/plan" className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold">
          Tilbake til plan
        </Button>
      }
    >
      <div className="space-y-6">
        {banner && <FormAlert variant={banner.variant} message={banner.message} action={banner.action} />}

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
            Vi bruker planen din og opplysningene over til å beregne dekning. Når du sender inn, får du bekreftelse på e-post.
          </p>
          <Button type="button" onClick={onSendInsurance} disabled={isSending}>
            {isSending ? 'Sender...' : 'Send søknad'}
          </Button>
        </Card>
      </div>
    </PageLayout>
  );
}
