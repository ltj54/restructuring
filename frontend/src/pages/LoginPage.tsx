import React from 'react';
import { Link } from 'react-router-dom';
import { FormAlert } from '../components/form/FormAlert';
import TextField from '../components/form/TextField';
import Card from '../components/Card';
import Button from '../components/Button';
import { useLoginForm } from '../hooks/useLoginForm';
import PageLayout from '../components/PageLayout';

export default function LoginPage() {
  const { form, feedback, isSubmitting, onSubmit } = useLoginForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageLayout
      title="Logg inn"
      subtitle="Gå videre til plan, veiviser og dekninger."
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logger inn...' : 'Logg inn'}
          </Button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-slate-600 hover:text-brand-dark hover:underline"
            >
              Glemt passord?
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Har du ikke konto?{' '}
          <Link to="/register" className="text-brand-dark font-medium hover:underline">
            Registrer deg her
          </Link>
          .
        </p>
      </Card>
    </PageLayout>
  );
}
