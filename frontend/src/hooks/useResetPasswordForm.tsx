import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '@/utils/config';
import { FormFeedback } from '@/components/form/types';
import { ResetPasswordFormValues, resetPasswordSchema } from '@/utils/validation/authSchemas';
import { getErrorMessage } from '@/utils/api';

export function useResetPasswordForm(token: string) {
  const [feedback, setFeedback] = useState<FormFeedback | null>(() =>
    token
      ? null
      : {
          variant: 'error',
          message: 'Ugyldig eller manglende tilbakestillingslenke.',
        }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '', confirm: '' },
    mode: 'onTouched',
  });

  useEffect(() => {
    form.setValue('token', token, { shouldValidate: true, shouldDirty: false });
  }, [form, token]);

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(async (values: ResetPasswordFormValues) => {
        setFeedback(null);
        setIsSubmitting(true);
        try {
          const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: values.token,
              password: values.password,
            }),
          });

          if (response.ok) {
            setFeedback({
              variant: 'success',
              message: 'Passordet er oppdatert! Du kan nå logge inn.',
            });
            form.reset({ token: values.token, password: '', confirm: '' });
          } else {
            setFeedback({
              variant: 'error',
              message: 'Kunne ikke oppdatere passordet. Lenken kan være utløpt.',
            });
          }
        } catch (err) {
          setFeedback({
            variant: 'error',
            message: getErrorMessage(err, 'Ingen kontakt med serveren.'),
          });
        } finally {
          setIsSubmitting(false);
        }
      }),
    [form]
  );

  return { form, feedback, isSubmitting, onSubmit };
}
