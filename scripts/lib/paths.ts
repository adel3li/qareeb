import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DUAS_DIR = path.join(ROOT, 'content/duas');
export const SOURCES_DIR = path.join(ROOT, 'content/sources');
export const RETIRED_IDS_FILE = path.join(ROOT, 'content/retired-ids.json');
export const GENERATED_FILE = path.join(ROOT, 'src/content/generated/duas.json');
