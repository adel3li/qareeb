import { getFormattedHijriDate } from './hijri';
import { parseLocalDateString } from './dates';

let weekdayFormat: Intl.DateTimeFormat | null = null;

/** «الاثنين ١٣ جمادى الآخرة ١٤٤٨ هـ» for a local day. */
export function hijriDayLabel(localDay: string): string {
  const date = parseLocalDateString(localDay);
  if (!date) return localDay;
  return `${weekdayName(date)} ${getFormattedHijriDate(date)}`;
}

/** «١٣ جمادى الآخرة ١٤٤٨ هـ», for a local day or a full timestamp read in local time. */
export function hijriDate(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseLocalDateString(value) : new Date(value);
  return date && !Number.isNaN(date.getTime()) ? getFormattedHijriDate(date) : value;
}

export function weekdayName(date: Date): string {
  try {
    weekdayFormat ??= new Intl.DateTimeFormat('ar-SA', { weekday: 'long' });
    return weekdayFormat.format(date);
  } catch {
    return '';
  }
}
