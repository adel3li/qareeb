import { z } from 'zod';

/**
 * The stored shapes, as Zod schemas: the backup import checks every record with
 * them, and the types below are what the stores hold. A change here is a change
 * of a stored shape: migration, test, and docs/reference/storage.md.
 */

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const iso = z.string().max(40).refine((s) => !Number.isNaN(Date.parse(s)), 'not a date');
const id = z.string().min(1).max(64);
const userText = z.string().max(10_000);

export const INTENTIONS = ['sujood', 'after_prayer', 'before_sleep', 'now'] as const;

export const SettingsShape = z.strictObject({
  theme: z.enum(['system', 'light', 'dark']),
  /** Root font size in px, 14–24. */
  fontScale: z.number().int().min(14).max(24),
  /** Show three of the user's needs during «عِش الدعاء». */
  showMyDuasInFlow: z.boolean(),
});
export const OnboardingShape = z.strictObject({ completedAt: iso.nullable() });
export const WelcomeShape = z.strictObject({ doneOn: day.nullable() });
export const CompletionShape = z.strictObject({
  date: day,
  duaId: id,
  completedAt: iso,
  intention: z.enum(INTENTIONS).optional(),
});
export const NoteShape = z.strictObject({
  id,
  date: day,
  duaId: id.optional(),
  text: userText.min(1),
  createdAt: iso,
  updatedAt: iso,
});
export const MyDuaShape = z.strictObject({
  id,
  text: z.string().min(1).max(500),
  note: userText.optional(),
  createdAt: iso,
  answeredAt: iso.optional(),
  answerNote: userText.optional(),
});
export const DraftShape = z.strictObject({
  notebookText: userText.optional(),
  needText: z.string().max(500).optional(),
  updatedAt: iso,
});

export const SHAPES = {
  settings: SettingsShape,
  onboarding: OnboardingShape,
  welcome: WelcomeShape,
  completions: z.array(CompletionShape).max(50_000),
  notebook: z.array(NoteShape).max(50_000),
  myDuas: z.array(MyDuaShape).max(10_000),
  favorites: z.array(id).max(10_000),
  drafts: z.record(id, DraftShape),
} as const;

export type Settings = z.infer<typeof SettingsShape>;
export type Completion = z.infer<typeof CompletionShape>;
export type Note = z.infer<typeof NoteShape>;
export type MyDua = z.infer<typeof MyDuaShape>;
export type Draft = z.infer<typeof DraftShape>;
export type Intention = (typeof INTENTIONS)[number];

export interface StoredData {
  settings: Settings;
  onboarding: z.infer<typeof OnboardingShape>;
  welcome: z.infer<typeof WelcomeShape>;
  completions: Completion[];
  notebook: Note[];
  myDuas: MyDua[];
  favorites: string[];
  drafts: Record<string, Draft>;
}

export const DEFAULTS: StoredData = {
  settings: { theme: 'system', fontScale: 16, showMyDuasInFlow: true },
  onboarding: { completedAt: null },
  welcome: { doneOn: null },
  completions: [],
  notebook: [],
  myDuas: [],
  favorites: [],
  drafts: {},
};
