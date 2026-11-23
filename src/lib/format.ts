import { getFormattedHijriDate } from './hijri';
import { parseLocalDateString } from './dates';

const weekday = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' });

/** «الاثنين ١٣ جمادى الآخرة ١٤٤٨ هـ» for a Date. */
export function hijriWithWeekday(date: Date): string {
  return `${weekday.format(date)} ${getFormattedHijriDate(date)}`;
}

/** The Hijri label of a stored local day ("YYYY-MM-DD"), read as a local day (never UTC). */
export function hijriOfDay(localDay: string, withWeekday = true): string {
  const d = parseLocalDateString(localDay);
  if (!d) return localDay;
  d.setHours(12);
  return withWeekday ? hijriWithWeekday(d) : getFormattedHijriDate(d);
}

/** The Hijri label of a full ISO timestamp, in the user's time zone. */
export function hijriOfTimestamp(iso: string): string {
  return getFormattedHijriDate(new Date(iso));
}
