import React, { useEffect, useMemo, useState } from 'react';
import { InsuranceSource, InsuranceType, saveInsuranceSnapshot } from '@/api/insuranceApi';
import { useAuth } from '@/hooks/useAuth';
import { useInsurance } from '@/hooks/useInsurance';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  DRAFT_KEYS,
  markInsurancePendingSync,
  readInsuranceDraft,
  writeInsuranceDraft,
} from '@/utils/draftSync';

type StatusVariant = 'info' | 'success' | 'error';

const INSURANCE_OPTIONS: { type: InsuranceType; label: string; hint: string }[] = [
  { type: 'TREATMENT', label: 'Behandlingsforsikring', hint: 'Privat behandling uten ventetid' },
  { type: 'INCOME', label: 'Inntektsforsikring', hint: 'Ekstra inntekt hvis du mister jobben' },
  { type: 'DISABILITY', label: 'Uføreforsikring', hint: 'Økonomisk trygghet ved sykdom' },
  { type: 'LIFE', label: 'Livsforsikring', hint: 'Utbetaling til etterlatte' },
  { type: 'PENSION', label: 'Pensjon', hint: 'Tjenestepensjon du vil videreføre' },
  { type: 'UNKNOWN', label: 'Usikker / vet ikke', hint: 'Helt greit - vi hjelper deg uansett' },
];

type ContactForm = {
  firstName: string;
  lastName: string;
  ssn: string;
  phone: string;
};

type BannerMessage = { variant: StatusVariant; message: string };

export default function InsurancePage() {
  const draft = readInsuranceDraft();
  const [source, setSource] = useState<InsuranceSource | null>(draft?.source ?? 'EMPLOYER');
  const [types, setTypes] = useState<Set<InsuranceType>>(
    new Set(draft?.types ?? ['TREATMENT', 'DISABILITY'])
  );

  const {
    profile,
    isLoading: isProfileLoading,
    isSaving: isProfileSaving,
    error: profileError,
    saveProfile,
  } = useUserProfile();

  const [contact, setContact] = useState<ContactForm>({
    firstName: '',
    lastName: '',
    ssn: '',
    phone: '',
  });

  const [contactMessage, setContactMessage] = useState<BannerMessage | null>({
    variant: 'info',
    message: 'Fyll inn navn, fødselsnummer og telefon før du sender.',
  });

  const [status, setStatus] = useState<{ variant: StatusVariant; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isSending, sendInsurance } = useInsurance();

  useEffect(() => {
    setContact({
      firstName: profile.firstName,
      lastName: profile.lastName,
      ssn: profile.ssn,
      phone: profile.phone,
    });
  }, [profile]);

  useEffect(() => {
    writeInsuranceDraft({
      source,
      types: Array.from(types),
      uncertain: source === 'UNKNOWN' || types.has('UNKNOWN'),
    });

    if (!isAuthenticated) {
      markInsurancePendingSync();
    }
  }, [source, types, isAuthenticated]);

  const toggleType = (type: InsuranceType) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const inquiryText = useMemo(() => {
    const chosen = Array.from(types);
    const products =
      chosen.length === 0
        ? 'Jeg er usikker på hvilke produkter jeg trenger.'
        : `Jeg ønsker tilbud/råd på: ${chosen.map((t) => labelForType(t)).join(', ')}.`;

    const sourceText =
      source === 'EMPLOYER'
        ? 'Jeg mister dagens dekninger via arbeidsgiver.'
        : source === 'PRIVATE'
          ? 'Jeg har kun private forsikringer i dag.'
          : 'Jeg er usikker på hvilke dekninger jeg har.';

    return ['Hei Gjensidige,', sourceText, products, 'Kan dere kontakte meg for et tilbud?'].join(
      '\n'
    );
  }, [source, types]);

  const handleSaveContact = async () => {
    setContactMessage(null);
    try {
      await saveProfile(contact);
      setContactMessage({ variant: 'success', message: 'Kontaktinfo lagret.' });
    } catch {
      setContactMessage({
        variant: 'error',
        message: 'Kunne ikke lagre kontaktinfo. Prøv igjen.',
      });
    }
  };

  const handleSend = async () => {
    if (!source) {
      setStatus({ variant: 'error', message: 'Velg hvor forsikringen din kommer fra.' });
      return;
    }

    if (!isContactValid(contact)) {
      setStatus({
        variant: 'error',
        message: 'Fyll ut navn, fødselsnummer (11 siffer) og telefon før du sender.',
      });
      return;
    }

    try {
      await saveProfile(contact);
    } catch {
      setStatus({
        variant: 'error',
        message: 'Kunne ikke lagre kontaktinfo. Prøv igjen.',
      });
      return;
    }

    setStatus(null);
    setIsSaving(true);

    try {
      await saveInsuranceSnapshot({
        source,
        types: Array.from(types),
        uncertain: source === 'UNKNOWN' || types.has('UNKNOWN'),
      });

      const message = await sendInsurance().catch((err: unknown) => {
        console.warn('Kunne ikke generere forespørsel', err);
        return 'Valgene er lagret. Du kan kontakte Gjensidige direkte med teksten under.';
      });

      setStatus({ variant: 'success', message });
      localStorage.removeItem(DRAFT_KEYS.insurance);
      localStorage.removeItem(DRAFT_KEYS.insurancePending);
    } catch {
      setStatus({
        variant: 'error',
        message: 'Kunne ikke lagre forespørsel. Prøv igjen eller kontakt Gjensidige direkte.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const contactBusy = isProfileLoading || isProfileSaving;
  const sendBusy = isSaving || isSending;
  const sendDisabled = sendBusy || contactBusy;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Gjensidige</p>
        <h1 className="text-3xl font-bold">Få tilbud på forsikring</h1>
        <p className="text-slate-600 max-w-2xl">
          En konsentrert forespørsel for omstilling: velg hva du trenger, så hjelper vi deg videre
          med Gjensidige. Du kan sende en forespørsel direkte eller kopiere teksten under og
          kontakte dem selv.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold mb-1">Kontaktinformasjon</h2>
            <p className="text-sm text-slate-600">
              Vi trenger navn, fødselsnummer og telefon før vi sender til Gjensidige.
            </p>
          </div>
          {contactMessage && (
            <span
              className={`text-xs ${
                contactMessage.variant === 'success'
                  ? 'text-emerald-700'
                  : contactMessage.variant === 'error'
                    ? 'text-red-700'
                    : 'text-slate-700'
              }`}
            >
              {contactMessage.message}
            </span>
          )}
        </div>

        {profileError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {profileError}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <LabeledInput
            label="Fornavn"
            value={contact.firstName}
            onChange={(e) => setContact((c) => ({ ...c, firstName: e.target.value }))}
            disabled={contactBusy}
          />
          <LabeledInput
            label="Etternavn"
            value={contact.lastName}
            onChange={(e) => setContact((c) => ({ ...c, lastName: e.target.value }))}
            disabled={contactBusy}
          />
          <LabeledInput
            label="Fødselsnummer"
            value={contact.ssn}
            onChange={(e) => setContact((c) => ({ ...c, ssn: e.target.value }))}
            disabled={contactBusy}
            placeholder="11 siffer"
          />
          <LabeledInput
            label="Telefon"
            value={contact.phone}
            onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
            disabled={contactBusy}
            placeholder="+4799999999"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSaveContact}
            disabled={contactBusy}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            {contactBusy ? 'Lagrer...' : 'Lagre kontaktinfo'}
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Hva gjelder deg?</h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Hvor kommer forsikringene dine fra?</p>
              <div className="space-y-2">
                <Radio
                  label="Via arbeidsgiver (slutter snart)"
                  checked={source === 'EMPLOYER'}
                  onChange={() => setSource('EMPLOYER')}
                />
                <Radio
                  label="KUN privat"
                  checked={source === 'PRIVATE'}
                  onChange={() => setSource('PRIVATE')}
                />
                <Radio
                  label="Usikker"
                  checked={source === 'UNKNOWN'}
                  onChange={() => setSource('UNKNOWN')}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Hva ønsker du tilbud på?</p>
              <div className="space-y-2">
                {INSURANCE_OPTIONS.map((opt) => (
                  <label key={opt.type} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={types.has(opt.type)}
                      onChange={() => toggleType(opt.type)}
                    />
                    <span>
                      <span className="font-medium">{opt.label}</span>
                      <div className="text-xs text-slate-600">{opt.hint}</div>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleSend}
              disabled={sendDisabled}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-white shadow hover:bg-emerald-800 disabled:opacity-60"
            >
              {sendBusy ? 'Sender forespørsel...' : 'Send forespørsel til Gjensidige'}
            </button>
            <a
              href="https://www.gjensidige.no/privat/kundeservice/kontakt-oss"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-emerald-800 hover:bg-white"
            >
              Kontakt Gjensidige nå
            </a>
          </div>

          {status && (
            <p
              className={`mt-4 text-sm ${
                status.variant === 'success'
                  ? 'text-emerald-800'
                  : status.variant === 'error'
                    ? 'text-red-700'
                    : 'text-slate-700'
              }`}
            >
              {status.message}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Tekst du kan sende</h2>
            <p className="text-sm text-slate-600 mb-3">
              Kopier teksten under og send via telefon, chat eller e-post til Gjensidige.
            </p>
            <textarea
              readOnly
              value={inquiryText}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800"
              rows={8}
            />
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Hurtigvalg</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>- Telefon: 915 03 100</li>
              <li>- Chat / skjema: gjensidige.no - Kundeservice - Kontakt oss (lenke over)</li>
              <li>- Åpningstider varierer - legg igjen nummer, så ringer de deg opp.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Radio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" checked={checked} onChange={onChange} />
      <span className="text-sm text-slate-800">{label}</span>
    </label>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="text-sm text-slate-800 space-y-1">
      <span className="block font-medium">{label}</span>
      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none disabled:bg-slate-100"
      />
    </label>
  );
}

function labelForType(type: InsuranceType): string {
  const item = INSURANCE_OPTIONS.find((opt) => opt.type === type);
  return item?.label ?? type;
}

function isContactValid(contact: ContactForm): boolean {
  const ssnOk = /^\d{11}$/.test(contact.ssn.trim());
  const phoneOk = /^[+]?\d{8,15}$/.test(contact.phone.trim());
  return (
    contact.firstName.trim().length > 0 && contact.lastName.trim().length > 0 && ssnOk && phoneOk
  );
}
