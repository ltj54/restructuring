import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '@/utils/config';
import { FormFeedback } from '@/components/form/types';
import { ForgotPasswordFormValues, forgotPasswordSchema } from '@/utils/validation/authSchemas';
import { getErrorMessage } from '@/utils/api';

export function useForgotPasswordForm() {
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(async (values: ForgotPasswordFormValues) => {
        setFeedback(null);
        setIsSubmitting(true);
        try {
          const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });

          if (res.ok) {
            setFeedback({
              variant: 'success',
              message:
                'Dersom adressen finnes i systemet, er det sendt en lenke for å tilbakestille passordet.',
            });
            form.reset({ email: values.email });
          } else {
            setFeedback({
              variant: 'error',
              message: 'Kunne ikke sende e-post. Prøv igjen senere.',
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
