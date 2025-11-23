import { z } from 'zod';

/**
 * Schema for registrering
 */
export const registerSchema = z
  .object({
    email: z.string().email('Ugyldig e-postadresse'),
    password: z.string().min(6, 'Passord må være minst 6 tegn'),
    repeatPassword: z.string().min(6, 'Passord må være minst 6 tegn'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Passordene matcher ikke',
    path: ['repeatPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Schema for login
 */
export const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(6, 'Passord må være minst 6 tegn'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Glemt passord
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Tilbakestilling av passord
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Ugyldig tilbakestillingslenke'),
    password: z.string().min(6, 'Passord må være minst 6 tegn'),
    confirm: z.string().min(6, 'Passord må være minst 6 tegn'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passordene matcher ikke',
    path: ['confirm'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
