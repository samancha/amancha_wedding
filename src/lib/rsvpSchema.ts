import { z } from 'zod';

export const rsvpSchema = z.object({
  name: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().min(1),
  attending: z.enum(['yes', 'no']).optional(),
  rehearsalDinner: z.enum(['yes', 'no']).optional(),
  brunch: z.enum(['yes', 'no']).optional(),
  meal: z.string().optional(),
  allergies: z.string().optional(),
  additionalGuests: z
    .array(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        rehearsalDinner: z.enum(['yes', 'no']).optional(),
        brunch: z.enum(['yes', 'no']).optional(),
        meal: z.string().optional(),
        allergies: z.string().optional(),
      })
    )
    .optional(),
});
