import React from 'react';
import { FormAlert } from '../components/form/FormAlert';
import TextField from '../components/form/TextField';
import Card from '../components/Card';
import Button from '../components/Button';
import { useInsurancePage } from '../hooks/useInsurancePage';

export default function InsurancePage(): React.ReactElement {
  const { form, banner, isLoading, isSaving, isSending, needsInfo, onSaveProfile, onSendInsurance } =
    useInsurancePage();

  const {
    register,
    formState: { errors },
  } = form;

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10 text-center text-slate-700">
        Laster...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* SYSTEM-BANNER */}
      {banner && <FormAlert variant={banner.variant} message={banner.message} action={banner.action} />}

      {/* PROFILINFO SOM MÅ FYLLES UT */}
      {needsInfo && (
        <Card title="Fyll ut manglende opplysninger">
          <p className="text-sm text-slate-600 mb-4">
            For å sende inn forsikringssøknad må vi vite hvem du er.
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

      {/* SØKNADSINNSENDING */}
      {!needsInfo && (
        <Card title="Forsikring">
          <p className="text-slate-700 mb-6 text-sm md:text-base">
            Her kan du sende inn din forsikringssøknad. Når du klikker på knappen under, genereres en
            XML-fil som sendes til forsikringsselskapet.
          </p>

          <Button onClick={onSendInsurance} disabled={isSending}>
            {isSending ? 'Sender...' : 'Send søknad om forsikring'}
          </Button>
        </Card>
      )}

      {/* INFOSEKSJON */}
      <Card title="Forsikring mot inntektsbortfall">
        <p className="mb-4 text-sm md:text-base text-slate-700">
          Forsikring mot inntektsbortfall gir økonomisk trygghet hvis du mister inntekten - for eksempel
          ved sykdom, uførhet, permittering eller arbeidsledighet.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2 text-brand-dark">Vanlige typer forsikringer</h3>

        <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-slate-700">
          <li>
            <strong>Uføreforsikring:</strong> Gir månedlig utbetaling ved uførhet.
          </li>
          <li>
            <strong>Inntektsforsikring:</strong> Gir støtte ved arbeidsledighet/permittering.
          </li>
          <li>
            <strong>Yrkesskadeforsikring:</strong> Dekker skader/sykdom relatert til jobb.
          </li>
          <li>
            <strong>Livsforsikring:</strong> Engangsutbetaling til etterlatte ved dødsfall.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2 text-brand-dark">Husk å sjekke</h3>

        <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-slate-700">
          <li>Hva forsikringen faktisk dekker</li>
          <li>Hvor mye og hvor lenge du får utbetalt</li>
          <li>Skatt - en del er skattepliktig</li>
          <li>Vilkår: karens, unntak, egenandel</li>
        </ul>
      </Card>
    </div>
  );
}
