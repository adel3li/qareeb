import { z } from 'zod';
import { FONT_SCALE } from '../../config';
import { INTENTIONS } from '../../content/schema';

/**
 * The backup file: plain JSON, not encrypted. Everything exported is imported (the two
 * are symmetric). Unknown fields are rejected, every record is checked, and sizes are bounded.
 */

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const iso = z.string().min(10).max(40);
const id = z.string().min(1).max(100);
const text = (max: number) => z.string().max(max);

export const backupDataSchema = z
  .object({
    settings: z
      .object({
        theme: z.enum(['system', 'light', 'dark']),
        fontScale: z.number().int().min(FONT_SCALE.min).max(FONT_SCALE.max),
        showMyDuasInFlow: z.boolean(),
      })
      .strict(),
    onboarding: z.object({ completedAt: iso.nullable() }).strict(),
    welcome: z.object({ doneOn: day.nullable() }).strict(),
    completions: z
      .array(
        z
          .object({
            date: day,
            duaId: id,
            completedAt: iso,
            intention: z.enum(INTENTIONS).optional(),
          })
          .strict(),
      )
      .max(20_000),
    notebook: z
      .array(
        z
          .object({
            id,
            date: day,
            duaId: id.optional(),
            text: text(20_000),
            createdAt: iso,
            updatedAt: iso,
          })
          .strict(),
      )
      .max(20_000),
    myDuas: z
      .array(
        z
          .object({
            id,
            text: text(2_000),
            note: text(5_000).optional(),
            createdAt: iso,
            answeredAt: z.string().max(40).optional(),
            answerNote: text(5_000).optional(),
          })
          .strict(),
      )
      .max(5_000),
    favorites: z.array(id).max(5_000),
  })
  .strict();

export const backupFileSchema = z
  .object({
    app: z.literal('qareeb'),
    backupVersion: z.literal(1),
    exportedAt: iso,
    data: backupDataSchema,
  })
  .strict();

export type BackupFile = z.infer<typeof backupFileSchema>;
