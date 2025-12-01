import React from 'react';
import { Link } from 'react-router-dom';
import { FormAlert } from '@/components/form/FormAlert';
import TextField from '@/components/form/TextField';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import PageLayout from '@/components/PageLayout';

export default function RegisterPage() {
  const { form, feedback, apiMessage, isSubmitting, onSubmit } = useRegisterForm();

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageLayout
      title="Registrer deg"
      subtitle="Lagre plan, dagbok og beregninger på din bruker."
      maxWidthClassName="max-w-xl"
    >
      <Card>
        {/* API health message */}
        {apiMessage && <FormAlert variant="info" message={apiMessage} />}

        {/* Feedback after submit */}
        {feedback && (
          <FormAlert
            variant={feedback.variant}
            message={feedback.message}
            action={feedback.action}
          />
        )}

        {/* FORM */}
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-4">
          <TextField
            type="email"
            label="E-post"
            placeholder="E-post"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <TextField
            type="password"
            label="Passord"
            placeholder="Passord"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <TextField
            type="password"
            label="Bekreft passord"
            placeholder="Bekreft passord"
            autoComplete="new-password"
            error={errors.repeatPassword?.message}
            {...register('repeatPassword')}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrerer...' : 'Registrer'}
          </Button>
        </form>

        {/* LINK TO LOGIN */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Har du allerede en konto?{' '}
          <Link to="/login" className="text-brand-dark font-medium hover:underline">
            Logg inn her
          </Link>
          .
        </p>
      </Card>
    </PageLayout>
  );
}
