import React from 'react';
import { Link } from 'react-router-dom';
import { FormAlert } from '../components/form/FormAlert';
import TextField from '../components/form/TextField';
import Card from '../components/Card';
import Button from '../components/Button';
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';
import PageLayout from '../components/PageLayout';

export default function ForgotPasswordPage() {
  const { form, feedback, isSubmitting, onSubmit } = useForgotPasswordForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageLayout
      title="Glemt passord"
      subtitle="Vi sender deg en lenke for å velge nytt passord."
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
          <TextField
            type="email"
            label="Din e-postadresse"
            placeholder="Din e-postadresse"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sender.' : 'Send tilbakestillingslenke'}
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
