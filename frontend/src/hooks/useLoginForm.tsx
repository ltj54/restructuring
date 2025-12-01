import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'react-router-dom';

import { LoginFormValues, loginSchema } from '@/utils/validation/authSchemas';
import { useAuth } from './useAuth';
import { FormFeedback } from '@/components/form/types';
import { getErrorMessage, isApiError } from '@/utils/api';

export function useLoginForm() {
  const location = useLocation() as { state?: { from?: string } };
  const redirectTarget = useMemo(() => location.state?.from, [location.state?.from]);

  const { login, isAuthenticating } = useAuth();

  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(async (values: LoginFormValues) => {
        setFeedback(null);

        try {
          await login(
            { email: values.email, password: values.password },
            { redirectTo: redirectTarget || undefined }
          );
        } catch (err) {
          if (isApiError(err)) {
            if (err.status === 401) {
              setFeedback({
                variant: 'error',
                message: 'Ugyldig e-post eller passord.',
              });
              return;
            }
            if (err.status === 404) {
              setFeedback({
                variant: 'error',
                message: 'Brukeren finnes ikke.',
                action: {
                  type: 'link',
                  to: '/register',
                  label: 'Registrer deg her.',
                },
              });
              return;
            }
            if (err.status >= 500) {
              setFeedback({
                variant: 'error',
                message: 'Det oppstod en teknisk feil. Prøv igjen senere.',
              });
              return;
            }
          }

          // Fallback
          setFeedback({
            variant: 'error',
            message: getErrorMessage(err, 'Innlogging feilet.'),
          });
        }
      }),
    [form, login, redirectTarget]
  );

  return {
    form,
    feedback,
    isSubmitting: isAuthenticating,
    onSubmit,
  };
}
