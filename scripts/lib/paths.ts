import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CONTENT_DIR = join(ROOT, 'content');
export const DUAS_DIR = join(CONTENT_DIR, 'duas');
export const SOURCES_DIR = join(CONTENT_DIR, 'sources');
export const RETIRED_IDS = join(CONTENT_DIR, 'retired-ids.json');
export const GENERATED_DIR = join(ROOT, 'src', 'content', 'generated');
