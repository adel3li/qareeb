/**
 * bun run check-promises: fails if the code breaks a product promise
 * (no streaks or points, no network request from src/, local day keys only,
 * zoom allowed, no external links in index.html, tokens only for colour).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { checkPromises, type SourceFile } from './lib/promises.ts';
import { ROOT } from './lib/paths.ts';

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'generated' || name === 'node_modules') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(tsx?|css|html)$/.test(name)) out.push(path);
  }
  return out;
}

const files: SourceFile[] = [...walk(join(ROOT, 'src')), join(ROOT, 'index.html')].map((path) => ({
  path: relative(ROOT, path),
  text: readFileSync(path, 'utf8'),
}));
const violations = checkPromises(files);
for (const v of violations) console.error(`${v.path}:${v.line}  ${v.rule}\n    ${v.excerpt}`);
console.log(`check-promises: ${files.length} files, ${violations.length} violation(s)`);
if (violations.length) process.exit(1);
