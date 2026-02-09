import { HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';

export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpsError('invalid-argument', result.error.flatten().formErrors.join('; ') || 'Invalid request payload.');
  }
  return result.data;
}
