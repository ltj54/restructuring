import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FormAlert } from '@/components/form/FormAlert';
import TextField from '@/components/form/TextField';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useResetPasswordForm } from '@/hooks/useResetPasswordForm';
import PageLayout from '@/components/PageLayout';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { form, feedback, isSubmitting, onSubmit } = useResetPasswordForm(token);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageLayout
      title="Tilbakestill passord"
      subtitle="Sett et nytt passord for å komme videre."
      maxWidthClassName="max-w-xl"
    >
      <Card>
        {feedback && (
          <FormAlert
            variant={feedback.variant}
            message={feedback.message}
            action={feedback.action}
          />
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <input type="hidden" {...register('token')} />

          <TextField
            type="password"
            label="Nytt passord"
            placeholder="Nytt passord"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <TextField
            type="password"
            label="Bekreft nytt passord"
            placeholder="Bekreft nytt passord"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register('confirm')}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Oppdaterer.' : 'Oppdater passord'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/login" className="text-brand-dark font-medium hover:underline">
            Tilbake til innlogging
          </Link>
        </p>
      </Card>
    </PageLayout>
  );
}
