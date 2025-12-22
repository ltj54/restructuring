import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { InsuranceSource, InsuranceType, saveInsuranceSnapshot } from '@/api/insuranceApi';
import { API_BASE_URL, fetchJson, getErrorMessage } from '@/utils/api';

type ContactInfo = {
  firstName: string;
  lastName: string;
  ssn: string;
  phone: string;
};

type Option = {
  id: string;
  title: string;
  description?: string;
};

const EMPTY_CONTACT: ContactInfo = {
  firstName: '',
  lastName: '',
  ssn: '',
  phone: '',
};

const buildContactPayload = (contact: ContactInfo) => ({
  firstName: contact.firstName.trim(),
  lastName: contact.lastName.trim(),
  ssn: contact.ssn.trim(),
  phone: contact.phone.trim(),
});

const isContactComplete = (contact: ContactInfo) =>
  Boolean(
    contact.firstName.trim() &&
      contact.lastName.trim() &&
      contact.ssn.trim() &&
      contact.phone.trim()
  );

const originOptions: Option[] = [
  { id: 'employer', title: 'Via arbeidsgiver (slutter snart)' },
  { id: 'private', title: 'KUN privat' },
  { id: 'unsure', title: 'Usikker' },
];

const offerOptions: Option[] = [
  {
    id: 'treatment',
    title: 'Behandlingsforsikring',
    description: 'Privat behandling uten ventetid',
  },
  {
    id: 'income',
    title: 'Inntektsforsikring',
    description: 'Ekstra inntekt hvis du mister jobben',
  },
  {
    id: 'disability',
    title: 'Uføreforsikring',
    description: 'Økonomisk trygghet ved sykdom',
  },
  {
    id: 'life',
    title: 'Livsforsikring',
    description: 'Utbetaling til etterlatte',
  },
  {
    id: 'pension',
    title: 'Pensjon',
    description: 'Tjenestepensjon du vil videreføre',
  },
  {
    id: 'unknown',
    title: 'Usikker / vet ikke',
    description: 'Helt greit - vi hjelper deg uansett',
  },
];

export default function InsurancePage() {
  const { isAuthenticated } = useAuth();
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [snapshotStatus, setSnapshotStatus] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const [offers, setOffers] = useState<string[]>([]);
  const [message, setMessage] = useState<string>(
    'Hei Gjensidige,\nKan dere kontakte meg for et tilbud?'
  );
  const [isSending, setIsSending] = useState(false);

  /* =========================
     SAVE CONTACT
  ========================= */

  const saveContact = useCallback(async (options?: { silent?: boolean }) => {
    if (!isAuthenticated) {
      if (!options?.silent) {
        setContactStatus('Kontaktinfo lagres forst n+r du er innlogget.');
      }
      return;
    }

    const payload = buildContactPayload(contact);
    if (!isContactComplete(payload)) {
      if (!options?.silent) {
        setContactStatus('Fyll inn alle feltene for + lagre.');
      }
      return;
    }

    try {
      await fetchJson('/user/me', {
        method: 'PUT',
        body: payload,
      });
      if (!options?.silent) {
        setContactStatus('Kontaktinfo lagret.');
      }
    } catch (err) {
      if (!options?.silent) {
        setContactStatus(getErrorMessage(err, 'Kunne ikke lagre kontaktinfo.'));
      }
    }
  }, [contact, isAuthenticated, saveContact]);

  const saveSnapshot = async () => {
    setSnapshotStatus(null);
    if (!isAuthenticated) {
      setSnapshotStatus('Logg inn for å lagre forsikringsvalgene.');
      return;
    }

    const sourceMap: Record<string, InsuranceSource> = {
      employer: 'EMPLOYER',
      private: 'PRIVATE',
      unsure: 'UNKNOWN',
    };
    const typeMap: Record<string, InsuranceType> = {
      treatment: 'TREATMENT',
      income: 'INCOME',
      disability: 'DISABILITY',
      life: 'LIFE',
      pension: 'PENSION',
      unknown: 'UNKNOWN',
    };

    const source = origin ? sourceMap[origin] : 'UNKNOWN';
    const types = Array.from(
      new Set(offers.map((offer) => typeMap[offer]).filter(Boolean))
    );
    const uncertain = origin === 'unsure' || offers.includes('unknown');

    try {
      await saveInsuranceSnapshot({ source, types, uncertain });
      setSnapshotStatus('Forsikringsvalg lagret.');
    } catch {
      setSnapshotStatus('Kunne ikke lagre forsikringsvalgene.');
    }
  };
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!origin && offers.length === 0) return;

    const handle = window.setTimeout(() => {
      const sourceMap: Record<string, InsuranceSource> = {
        employer: 'EMPLOYER',
        private: 'PRIVATE',
        unsure: 'UNKNOWN',
      };
      const typeMap: Record<string, InsuranceType> = {
        treatment: 'TREATMENT',
        income: 'INCOME',
        disability: 'DISABILITY',
        life: 'LIFE',
        pension: 'PENSION',
        unknown: 'UNKNOWN',
      };

      const source = origin ? sourceMap[origin] : 'UNKNOWN';
      const types = Array.from(
        new Set(offers.map((offer) => typeMap[offer]).filter(Boolean))
      );
      const uncertain = origin === 'unsure' || offers.includes('unknown');

      saveInsuranceSnapshot({ source, types, uncertain })
        .then(() => {
          setSnapshotStatus('Forsikringsvalg lagret.');
        })
        .catch(() => {
          setSnapshotStatus('Kunne ikke lagre forsikringsvalgene.');
        });
    }, 600);

    return () => window.clearTimeout(handle);
  }, [isAuthenticated, origin, offers]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isContactComplete(contact)) return;

    const handle = window.setTimeout(() => {
      saveContact({ silent: true });
    }, 600);

    return () => window.clearTimeout(handle);
  }, [contact, isAuthenticated, saveContact]);

  const handleSendRequest = async () => {
    setSnapshotStatus(null);
    if (!isAuthenticated) {
      setSnapshotStatus('Logg inn for å sende forespørselen.');
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/insurance/send`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        setSnapshotStatus('Kunne ikke sende forespørselen.');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'insurance_request.xml';
      link.click();
      URL.revokeObjectURL(url);

      await fetch(`${API_BASE_URL}/insurance/request`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).catch(() => undefined);

      setSnapshotStatus('Forespørsel sendt. Filen er lastet ned.');
    } catch {
      setSnapshotStatus('Kunne ikke sende forespørselen.');
    } finally {
      setIsSending(false);
    }
  };

  /* =========================
     GENERATED TEXT
  ========================= */

  const offerSummary = useMemo(() => {
    const selected = offerOptions.filter((option) => offers.includes(option.id));
    if (selected.length === 0) return '';
    return `---\nValgte tilbud:\n${selected
      .map((option) => `- ${option.title}`)
      .join('\n')}`;
  }, [offers]);

  const stripOfferSummary = (value: string) => {
    const marker = '\n---\nValgte tilbud:\n';
    const markerIndex = value.indexOf(marker);
    return markerIndex === -1 ? value : value.slice(0, markerIndex);
  };

  const renderedMessage = useMemo(() => {
    const base = stripOfferSummary(message).trimEnd();
    if (!offerSummary) return base;
    return `${base}\n\n${offerSummary}`;
  }, [message, offerSummary]);

  const toggleOffer = (id: string) => {
    setOffers((list) => (list.includes(id) ? list.filter((o) => o !== id) : [...list, id]));
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <PageLayout
      title="Forsikring"
      subtitle="Svar på noen korte spørsmål og fyll inn kontaktinfo."
      maxWidthClassName="max-w-5xl"
    >
      <div className="space-y-6">
        <Card title="Hvor kommer forsikringene dine fra?">
          <div className="flex flex-wrap gap-3">
            {originOptions.map((option) => {
              const active = origin === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setOrigin(option.id)}
                  className={`rounded-full px-4 py-2 text-sm border transition ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-200'
                  }`}
                >
                  {option.title}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Hva ønsker du tilbud på?">
          <div className="grid md:grid-cols-2 gap-3">
            {offerOptions.map((option) => {
              const active = offers.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOffer(option.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-200'
                  }`}
                >
                  <div className="font-semibold text-sm">{option.title}</div>
                  {option.description && (
                    <div className="mt-1 text-xs opacity-90">{option.description}</div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <Button onClick={saveSnapshot}>Lagre forsikringsvalg</Button>
            <Button onClick={handleSendRequest} variant="secondary" disabled={isSending}>
              {isSending ? 'Sender...' : 'Send forespørsel til Gjensidige'}
            </Button>
            {snapshotStatus && (
              <span className="text-xs text-slate-600">{snapshotStatus}</span>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Kontaktinformasjon">
            <div className="space-y-3">
              <input
                placeholder="Fornavn"
                value={contact.firstName}
                onChange={(e) =>
                  setContact({ ...contact, firstName: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />

              <input
                placeholder="Etternavn"
                value={contact.lastName}
                onChange={(e) =>
                  setContact({ ...contact, lastName: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />

              <input
                placeholder="Fødselsnummer"
                value={contact.ssn}
                onChange={(e) =>
                  setContact({ ...contact, ssn: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />

              <input
                placeholder="Telefon"
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />

              <div className="flex items-center gap-3">
                <Button onClick={saveContact}>Lagre kontaktinfo</Button>
                {contactStatus && (
                  <span className="text-xs text-slate-600">{contactStatus}</span>
                )}
              </div>
            </div>
          </Card>

          <Card title="Meldingsmal">
            <textarea
              value={renderedMessage}
              onChange={(e) => {
                setMessage(stripOfferSummary(e.target.value));
              }}
              className="w-full h-48 rounded-xl border border-slate-200 p-3 text-sm"
            />
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}





