import { FONT_SCALE } from '../config';

/** Western digits for Arabic-Indic and Eastern Arabic-Indic ones. */
export function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}

/**
 * The text-size field is corrected when it loses focus, never while typing
 * (Alhamd's U-06). Returns the clamped value, or the previous one when the
 * input has no number.
 */
export function parseFontScale(input: string, previous: number): number {
  const digits = toWesternDigits(input).replace(/[^\d]/g, '');
  if (!digits) return previous;
  return clampFontScale(Number(digits));
}

export function clampFontScale(value: number): number {
  return Math.min(FONT_SCALE.max, Math.max(FONT_SCALE.min, Math.round(value)));
}
