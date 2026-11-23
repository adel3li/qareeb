import type { Intention } from '../content/types';

export type ThemeChoice = 'system' | 'light' | 'dark';

export interface Settings {
  theme: ThemeChoice;
  /** Root font size in px (FONT_SCALE in src/config.ts). */
  fontScale: number;
  /** Show three of the user's open needs during «عِش الدعاء». */
  showMyDuasInFlow: boolean;
}

export interface Completion {
  /** Local day from toLocalDateString(). */
  date: string;
  /** The dua that was shown that day, stored, never recomputed from the date. */
  duaId: string;
  completedAt: string;
  intention?: Intention;
}

export interface NotebookEntry {
  id: string;
  date: string;
  duaId?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyDua {
  id: string;
  text: string;
  note?: string;
  createdAt: string;
  answeredAt?: string;
  answerNote?: string;
}

export interface Draft {
  notebookText?: string;
  updatedAt: string;
}
