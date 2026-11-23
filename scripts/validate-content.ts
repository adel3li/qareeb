/** Schema, sacred-text and review checks on content/duas (03 §7). Fails on any error. */
import { validateAll } from './lib/validate';

const { errors, warnings, cards } = validateAll();
warnings.forEach((w) => console.warn('! ' + w));
errors.forEach((e) => console.error('✗ ' + e));
console.log(`${cards.length} cards checked: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
