import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormFeedback } from '@/components/form/types';
import { useUserProfile } from './useUserProfile';
import { useInsurance } from './useInsurance';

import {
  InsuranceProfileFormValues,
  insuranceProfileSchema,
} from '@/utils/validation/insuranceSchemas';

import { getErrorMessage } from '@/utils/api';

export function useInsurancePage() {
  const {
    profile,
    isLoading,
    isSaving,
    error: userProfileError,
    needsInfo,
    saveProfile,
  } = useUserProfile();

  const { isSending, error: insuranceError, sendInsurance } = useInsurance();

  const [banner, setBanner] = useState<FormFeedback | null>(null);

  // -----------------------------------------------------------
  //  FORM SETUP
  // -----------------------------------------------------------
  const form = useForm<InsuranceProfileFormValues>({
    resolver: zodResolver(insuranceProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      ssn: profile.ssn,
      phone: profile.phone,
    },
    mode: 'onTouched',
  });

  // Oppdater form hvis profile endrer seg
  useEffect(() => {
    form.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      ssn: profile.ssn,
      phone: profile.phone,
    });
  }, [form, profile]);

  // -----------------------------------------------------------
  //  ERROR HÅNDTERING
  // -----------------------------------------------------------
  useEffect(() => {
    if (userProfileError) {
      setBanner({ variant: 'error', message: userProfileError });
    }
  }, [userProfileError]);

  useEffect(() => {
    if (insuranceError) {
      setBanner({ variant: 'error', message: insuranceError });
    }
  }, [insuranceError]);

  // -----------------------------------------------------------
  //  LAGRE PROFIL
  // -----------------------------------------------------------
  const onSaveProfile = useMemo(
    () =>
      form.handleSubmit(async (values: InsuranceProfileFormValues) => {
        setBanner(null);

        try {
          await saveProfile(values);

          setBanner({
            variant: 'success',
            message: 'Informasjon lagret. Du kan nå sende søknaden.',
          });
        } catch (err) {
          setBanner({
            variant: 'error',
            message: getErrorMessage(err, 'Klarte ikke å lagre informasjon. Prøv igjen.'),
          });
        }
      }),
    [form, saveProfile]
  );

  // -----------------------------------------------------------
  //  SEND FORSIKRINGSØKNAD
  // -----------------------------------------------------------
  const onSendInsurance = useCallback(async () => {
    setBanner(null);

    try {
      const message = await sendInsurance();
      setBanner({ variant: 'success', message });
    } catch (err) {
      setBanner({
        variant: 'error',
        message: getErrorMessage(err, 'Kunne ikke generere forsikringssøknad.'),
      });
    }
  }, [sendInsurance]);

  // -----------------------------------------------------------
  //  RETURN
  // -----------------------------------------------------------
  return {
    form,
    banner,
    isLoading,
    isSaving,
    isSending,
    needsInfo,
    onSaveProfile,
    onSendInsurance,
  };
}
