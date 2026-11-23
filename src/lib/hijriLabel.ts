import { parseLocalDateString } from './dates';
import { getFormattedHijriDate } from './hijri';

const weekday = (() => {
  try {
    return new Intl.DateTimeFormat('ar-SA', { weekday: 'long' });
  } catch {
    return null;
  }
})();

/** «الاثنين ١٣ جمادى الآخرة ١٤٤٨ هـ» for a local day "YYYY-MM-DD". */
export function hijriDayLabel(localDay: string, withWeekday = true): string {
  const date = parseLocalDateString(localDay);
  if (!date) return localDay;
  date.setHours(12);
  const hijri = getFormattedHijriDate(date);
  return withWeekday && weekday ? `${weekday.format(date)} ${hijri}` : hijri;
}
