import { z } from 'zod';
import { FONT_SCALE } from '../config';

/**
 * The shapes stored under each key (docs/reference/storage.md), as Zod
 * schemas: the stores' types come from here, and an imported backup is
 * checked against them record by record. Unknown fields are rejected.
 */

const localDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoTime = z.iso.datetime({ offset: true });
const duaId = z.string().regex(/^dua_\d{4}$/);
const id = z.string().min(1).max(64);
const userText = z.string().max(10_000);

export const INTENTIONS = ['sujood', 'after_prayer', 'before_sleep', 'now'] as const;
export const intentionSchema = z.enum(INTENTIONS);
export type Intention = z.infer<typeof intentionSchema>;

export const settingsSchema = z.strictObject({
  theme: z.enum(['system', 'light', 'dark']),
  fontScale: z.number().int().min(FONT_SCALE.min).max(FONT_SCALE.max),
  showMyDuasInFlow: z.boolean(),
});
export type Settings = z.infer<typeof settingsSchema>;

export const completionSchema = z.strictObject({
  date: localDay,
  duaId,
  completedAt: isoTime,
  intention: intentionSchema.optional(),
});
export type Completion = z.infer<typeof completionSchema>;

export const notebookEntrySchema = z.strictObject({
  id,
  date: localDay,
  duaId: duaId.optional(),
  text: userText.min(1),
  createdAt: isoTime,
  updatedAt: isoTime,
});
export type NotebookEntry = z.infer<typeof notebookEntrySchema>;

export const myDuaSchema = z.strictObject({
  id,
  text: userText.min(1),
  note: userText.optional(),
  createdAt: isoTime,
  answeredAt: isoTime.optional(),
  answerNote: userText.optional(),
});
export type MyDua = z.infer<typeof myDuaSchema>;

export const draftSchema = z.strictObject({
  notebookText: userText.optional(),
  myDuaText: userText.optional(),
  updatedAt: isoTime,
});
export type Draft = z.infer<typeof draftSchema>;

export const DEFAULT_SETTINGS: Settings = { theme: 'system', fontScale: FONT_SCALE.default, showMyDuasInFlow: true };
