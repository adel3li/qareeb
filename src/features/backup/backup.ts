import { z } from 'zod';
import { DEFAULTS, SHAPES, type StoredData } from '../../state/shapes';

/**
 * The backup file: plain, unencrypted JSON the user owns (the privacy policy says so).
 * Export and import are symmetric: every stored value is exported, and everything
 * exported is imported. Import checks every record with Zod, rejects unknown fields
 * and files over the size limit, and changes nothing until the user confirms.
 */

export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

const DataShape = z.strictObject({
  settings: SHAPES.settings,
  onboarding: SHAPES.onboarding.optional(),
  welcome: SHAPES.welcome.optional(),
  completions: SHAPES.completions,
  notebook: SHAPES.notebook,
  myDuas: SHAPES.myDuas,
  favorites: SHAPES.favorites,
  drafts: SHAPES.drafts.optional(),
});

const BackupShape = z.strictObject({
  app: z.literal('qareeb'),
  backupVersion: z.literal(BACKUP_VERSION),
  exportedAt: z.string().refine((s) => !Number.isNaN(Date.parse(s))),
  data: DataShape,
});

export type Backup = z.infer<typeof BackupShape>;

export function buildBackup(data: StoredData, now = new Date()): Backup {
  return { app: 'qareeb', backupVersion: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

export function backupFileName(localDay: string): string {
  return `qareeb-backup-${localDay}.json`;
}

export interface BackupSummary {
  days: number;
  entries: number;
  needs: number;
  favorites: number;
  exportedAt: string;
}

export type ParseResult =
  | { ok: true; data: StoredData; summary: BackupSummary }
  | { ok: false; reason: 'too_large' | 'invalid' };

export function parseBackup(text: string): ParseResult {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) return { ok: false, reason: 'too_large' };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  const parsed = BackupShape.safeParse(json);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  const d = parsed.data.data;
  const days = new Set(d.completions.map((c) => c.date));
  if (days.size !== d.completions.length) return { ok: false, reason: 'invalid' };
  const data: StoredData = {
    settings: d.settings,
    onboarding: d.onboarding ?? { completedAt: parsed.data.exportedAt },
    welcome: d.welcome ?? DEFAULTS.welcome,
    completions: d.completions,
    notebook: d.notebook,
    myDuas: d.myDuas,
    favorites: [...new Set(d.favorites)],
    drafts: d.drafts ?? {},
  };
  return {
    ok: true,
    data,
    summary: { days: days.size, entries: d.notebook.length, needs: d.myDuas.length, favorites: data.favorites.length, exportedAt: parsed.data.exportedAt },
  };
}
