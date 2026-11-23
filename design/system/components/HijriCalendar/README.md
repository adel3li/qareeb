# HijriCalendar

The month view of المداومة: real Hijri months (Umm al-Qura), weeks from Saturday, the days the user lived a dua marked quietly.

**Look:** a `surface` card. The head: IconButtons for the previous and next month (`chevron-right` is previous in RTL; next is disabled past the current month) around the month name in 17px/600. Weekday initials in 12px, `text-muted`. Days are 44px circles in Arabic-Indic digits:
- lived: `surface-sunken` fill, weight 600, a 4px `cta` dot under the number;
- today: a 1px dashed `accent` ring;
- the chosen day: a 2px `text` ring (`aria-pressed`);
- future days: `text-muted`.

Under the card, the chosen day's detail: the dua's short title, the intention and the user's note; for a day without one: «لم تعش دعاءً في هذا اليوم. لا بأس، فاليوم التالي ينتظرك.» Then the secondary Button «أضف تذكيرًا إلى تقويمك» (downloads an .ics file).

**The consumer provides** the month (from `src/lib/hijri.ts`, stepping by real Hijri months, never by Gregorian offsets), the set of lived local days with their stored dua ids, the chosen day and `onSelect`. Each day's `aria-label` says it in words: «الأحد ١٢، عشتَ فيه دعاءً».

**Never** show a total, a count of consecutive days, a percentage, or a weekly chart.
