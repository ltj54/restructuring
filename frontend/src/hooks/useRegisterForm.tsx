import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '@/utils/config';
import { FormFeedback } from '@/components/form/types';

import { RegisterFormValues, registerSchema } from '@/utils/validation/authSchemas';

import { getErrorMessage } from '@/utils/api';

export function useRegisterForm() {
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // FORM SETUP
  // -------------------------------------------------------------
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      repeatPassword: '',
    },
    mode: 'onTouched',
  });

  // -------------------------------------------------------------
  // TEST API HELLO
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/hello`);
        if (!isMounted) return;

        if (response.ok) {
          setApiMessage(await response.text());
        }
      } catch {
        if (isMounted) setApiMessage(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // -------------------------------------------------------------
  // HANDLE SUBMIT
  // -------------------------------------------------------------
  const onSubmit = useMemo(
    () =>
      form.handleSubmit(async (values: RegisterFormValues) => {
        setFeedback(null);
        setIsSubmitting(true);

        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
            }),
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            setFeedback({
              variant: 'error',
              message:
                typeof (data as { message?: unknown }).message === 'string'
                  ? (data as { message: string }).message
                  : 'Noe gikk galt ved registrering.',
            });
            return;
          }

          setFeedback({
            variant: 'success',
            message: 'Bruker registrert! Du kan nå logge inn.',
          });

          // Send brukeren til login etter vellykket registrering
          navigate('/login', { replace: true });
        } catch (err) {
          setFeedback({
            variant: 'error',
            message: getErrorMessage(err, 'Kunne ikke koble til serveren.'),
          });
        } finally {
          setIsSubmitting(false);
        }
      }),
    [form, navigate]
  );

  // -------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------
  return {
    form,
    feedback,
    apiMessage,
    isSubmitting,
    onSubmit,
  };
}
