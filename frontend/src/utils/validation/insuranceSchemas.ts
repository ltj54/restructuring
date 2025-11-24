import { z } from 'zod';

/**
 * Skjema for brukerens forsikringsprofil (grunnleggende info)
 */
export const insuranceProfileSchema = z.object({
  firstName: z.string().min(1, 'Fornavn er påkrevd'),
  lastName: z.string().min(1, 'Etternavn er påkrevd'),
  ssn: z.string().regex(/^\d{11}$/, 'Fødselsnummer må være 11 siffer'),
});

/** Typedata for useForm */
export type InsuranceProfileFormValues = z.infer<typeof insuranceProfileSchema>;
