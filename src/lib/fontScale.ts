import { FONT_SCALE } from '../config';

/** Reads Western or Arabic-Indic digits; NaN when there are none. */
export function parseDigits(input: string): number {
  const western = input.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const digits = western.replace(/[^\d]/g, '');
  return digits ? Number(digits) : Number.NaN;
}

/** Clamps a typed size into range; keeps the previous value when nothing valid was typed. */
export function clampFontScale(value: number, previous: number = FONT_SCALE.default): number {
  if (!Number.isFinite(value)) return previous;
  return Math.min(FONT_SCALE.max, Math.max(FONT_SCALE.min, Math.round(value)));
}
