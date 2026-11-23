/**
 * bun run validate-content: the checks of docs/handoff/03-content-model.md §7
 * on every card in content/duas. Exits 1 on any error.
 */
import { readCardFiles, readRetiredIds } from './lib/cards.ts';
import { quranLookup } from './lib/quranLookup.ts';
import { validateCards } from './lib/validate.ts';

const { cards, problems } = validateCards(readCardFiles(), { retiredIds: readRetiredIds(), quran: quranLookup() });
const errors = problems.filter((p) => !p.warning);
for (const p of problems) console[p.warning ? 'warn' : 'error'](`${p.warning ? 'warning' : 'error'} ${p.file}: ${p.message}`);
console.log(`validate-content: ${cards.length} card(s), ${errors.length} error(s), ${problems.length - errors.length} warning(s)`);
if (errors.length) process.exit(1);
