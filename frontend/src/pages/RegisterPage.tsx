import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FormAlert } from '@/components/form/FormAlert';
import TextField from '@/components/form/TextField';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';
import { useRegisterForm } from '@/hooks/useRegisterForm';

export default function RegisterPage() {
  const { form, feedback, isSubmitting, onSubmit } = useRegisterForm();
  const {
    register,
    formState: { errors },
  } = form;

  const location = useLocation();
  const navigate = useNavigate();

  // read redirect param
  const query = new URLSearchParams(location.search);
  const redirectTo = query.get('redirect') || '/insurance';

  return (
    <PageLayout
      title="Registrer konto"
      subtitle="Opprett en konto for å lagre plan og fremdrift."
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

        <form
          onSubmit={form.handleSubmit(async (data) => {
            const success = await onSubmit(data);

            if (success) {
              navigate(redirectTo, { replace: true });
            }
          })}
          className="flex flex-col gap-5 mt-4"
        >
          <TextField
            type="email"
            label="E-post"
            placeholder="E-post"
            error={errors.email?.message}
            autoComplete="email"
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
            label="Gjenta passord"
            placeholder="Gjenta passord"
            autoComplete="new-password"
            error={errors.repeatPassword?.message}
            {...register('repeatPassword')}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrerer.' : 'Registrer'}
          </Button>

          <div className="text-center mt-1">
            <Link
              to={`/login?redirect=${encodeURIComponent(
                location.pathname + location.search + location.hash
              )}`}
              className="text-sm text-slate-600 hover:text-brand-dark hover:underline"
            >
              Har du konto? Logg inn
            </Link>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}
