/**
 * Captures the app's screens for review against docs/screens/built/.
 * Runs against a running build (bun run build && bunx vite preview --port 4173).
 *
 *   bun scripts/screenshots.ts [outDir] [--only name,name] [--theme light|dark]
 *
 * The clock is fixed at Monday 23 November 2026 09:00 in Riyadh, and sample user
 * data marked «مثال» is put in storage. Development tool only: not shipped.
 */
import { chromium, type Page } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const args = process.argv.slice(2);
const out = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--')) ?? 'screens-out';
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const themes = args.includes('--theme') ? [args[args.indexOf('--theme') + 1]] : ['light', 'dark'];

const env = (value: unknown) => JSON.stringify({ state: { value }, version: 1 });
const at = (day: string, h = 9) => `${day}T0${h}:00:00.000Z`.replace('T09', 'T06');

export const SAMPLE: Record<string, unknown> = {
  'qareeb:onboarding:v1': { completedAt: '2026-11-14T06:00:00.000Z' },
  'qareeb:welcome:v1': { doneOn: '2026-11-14' },
  'qareeb:completions:v1': [
    { date: '2026-11-14', duaId: 'dua_0001', completedAt: at('2026-11-14') },
    { date: '2026-11-18', duaId: 'dua_0003', completedAt: at('2026-11-18'), intention: 'sujood' },
    { date: '2026-11-20', duaId: 'dua_0002', completedAt: at('2026-11-20'), intention: 'now' },
    { date: '2026-11-22', duaId: 'dua_0001', completedAt: at('2026-11-22'), intention: 'after_prayer' },
  ],
  'qareeb:notebook:v1': [
    { id: 'n1', date: '2026-11-20', duaId: 'dua_0002', text: 'مثال: ضيقٌ حملته أسبوعًا، وكتبته هنا أول مرة.', createdAt: at('2026-11-20'), updatedAt: at('2026-11-20') },
    { id: 'n2', date: '2026-11-20', text: 'مثال: سطر كُتب بلا دعاء، من زر «اكتب الآن».', createdAt: '2026-11-20T15:00:00.000Z', updatedAt: '2026-11-20T15:00:00.000Z' },
    { id: 'n3', date: '2026-11-22', duaId: 'dua_0001', text: 'مثال: شعرتُ أن الطريق أوضح حين طلبتُه بدل أن أفترضه.', createdAt: at('2026-11-22'), updatedAt: at('2026-11-22') },
  ],
  'qareeb:my-duas:v1': [
    { id: 'm1', text: 'مثال: التوفيق في العمل الجديد', createdAt: '2026-11-20T06:00:00.000Z' },
    { id: 'm2', text: 'مثال: شفاء أمي', note: 'كل ليلة قبل النوم', createdAt: '2026-11-11T06:00:00.000Z' },
    { id: 'm3', text: 'مثال: صلح بين أخويّ', createdAt: '2026-11-01T06:00:00.000Z', answeredAt: '2026-11-15T06:00:00.000Z', answerNote: 'مثال: اتصل أحدهما بالآخر دون أن يطلب أحد.' },
  ],
  'qareeb:favorites:v1': ['dua_0002', 'dua_0003'],
};

async function open(page: Page, hash: string, data: Record<string, unknown> | null = SAMPLE) {
  await page.goto(`${BASE}/`);
  await page.evaluate((d) => {
    localStorage.clear();
    if (d) for (const [k, v] of Object.entries(d)) localStorage.setItem(k, JSON.stringify({ state: { value: v }, version: 1 }));
  }, data);
  await page.goto(`${BASE}/${hash}`);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}
void env;

type Shot = { name: string; run: (p: Page) => Promise<void>; full?: boolean; size?: [number, number]; fontScale?: number };

const SHOTS: Shot[] = [
  { name: 'onboarding-1', run: (p) => open(p, '#/today', null) },
  { name: 'onboarding-4', run: async (p) => { await open(p, '#/today', null); for (let i = 0; i < 3; i++) await p.getByRole('button', { name: 'التالي' }).click(); } },
  { name: 'today-welcome', full: true, run: (p) => open(p, '#/today', { 'qareeb:onboarding:v1': { completedAt: '2026-11-23T05:00:00.000Z' } }) },
  { name: 'today', full: true, run: (p) => open(p, '#/today') },
  { name: 'today-sections', full: true, run: async (p) => { await open(p, '#/today'); for (const t of ['الموقف', 'المعنى', 'وقفات']) await p.getByRole('button', { name: t, exact: true }).click(); } },
  { name: 'today-done', full: true, run: (p) => open(p, '#/today', { ...SAMPLE, 'qareeb:completions:v1': [...(SAMPLE['qareeb:completions:v1'] as object[]), { date: '2026-11-23', duaId: 'dua_0002', completedAt: '2026-11-23T06:00:00.000Z' }] }) },
  { name: 'live-1-paced', run: async (p) => { await open(p, '#/today'); await p.getByRole('button', { name: /عِش الدعاء/ }).click(); await p.waitForTimeout(400); } },
  { name: 'live-1', run: async (p) => { await open(p, '#/today'); await p.getByRole('button', { name: /عِش الدعاء/ }).click(); await p.getByRole('button', { name: 'أظهر النص كاملًا' }).click(); } },
  { name: 'live-5', full: true, run: async (p) => { await open(p, '#/today'); await p.getByRole('button', { name: /عِش الدعاء/ }).click(); for (let i = 0; i < 4; i++) { await p.getByRole('button', { name: 'أظهر النص كاملًا' }).click().catch(() => {}); await p.getByRole('button', { name: 'التالي', exact: true }).click(); } await p.getByRole('button', { name: 'أظهر النص كاملًا' }).click().catch(() => {}); } },
  { name: 'live-intention', run: async (p) => { await toIntention(p); await p.getByRole('button', { name: 'في السجود' }).click(); } },
  { name: 'live-notebook', run: async (p) => { await toIntention(p); await p.getByRole('button', { name: 'متابعة' }).click(); await p.getByRole('textbox').fill('سطر يكتبه المستخدم عمّا وجده.'); } },
  { name: 'live-mydua', run: async (p) => { await toIntention(p); await p.getByRole('button', { name: 'متابعة' }).click(); await p.getByRole('button', { name: 'إتمام' }).click(); await p.getByRole('textbox').fill('شفاء من أحب'); } },
  { name: 'live-closing', run: async (p) => { await toIntention(p); await p.getByRole('button', { name: 'متابعة' }).click(); await p.getByRole('button', { name: 'إتمام' }).click(); await p.getByRole('button', { name: 'لا الآن' }).click(); await p.waitForTimeout(300); } },
  { name: 'live-confirm-close', run: async (p) => { await toIntention(p); await p.getByRole('button', { name: 'متابعة' }).click(); await p.getByRole('textbox').fill('سطر لم يُحفظ بعد.'); await p.getByRole('button', { name: 'إغلاق عِش الدعاء' }).click(); } },
  { name: 'share-post', run: async (p) => { await open(p, '#/today'); await p.getByRole('button', { name: 'مشاركة الدعاء' }).first().click(); await p.getByRole('img', { name: /معاينة/ }).waitFor(); } },
  { name: 'share-story', run: async (p) => { await open(p, '#/dua/dua_0003'); await p.getByRole('button', { name: 'مشاركة الدعاء' }).first().click(); await p.getByRole('radio', { name: 'قصة' }).click(); await p.getByRole('radio', { name: 'مع وقفة' }).click(); await p.getByRole('img', { name: /معاينة/ }).waitFor(); } },
  { name: 'library', run: (p) => open(p, '#/library') },
  { name: 'library-search', run: async (p) => { await open(p, '#/library'); await p.getByRole('searchbox').fill('يونس'); } },
  { name: 'library-noresults', run: async (p) => { await open(p, '#/library'); await p.getByRole('searchbox').fill('كلمة غير موجودة'); } },
  { name: 'library-favorites', run: async (p) => { await open(p, '#/library'); await p.getByRole('tab', { name: 'المفضلة' }).click(); } },
  { name: 'library-empty', run: (p) => open(p, '#/library', { 'qareeb:onboarding:v1': { completedAt: '2026-11-23T05:00:00.000Z' } }) },
  { name: 'dua-page-hadith', full: true, run: async (p) => { await open(p, '#/dua/dua_0003'); for (const t of ['نص الحديث كاملًا', 'متى يُدعى به']) await p.getByRole('button', { name: t }).click(); } },
  { name: 'dua-not-found', run: (p) => open(p, '#/dua/dua_9999') },
  { name: 'notebook-found', run: (p) => open(p, '#/notebook') },
  { name: 'notebook-write', run: async (p) => { await open(p, '#/notebook'); await p.getByRole('button', { name: 'اكتب الآن' }).click(); await p.getByRole('textbox').fill('سطر يُكتب بلا دعاء.'); } },
  { name: 'notebook-delete', run: async (p) => { await open(p, '#/notebook'); await p.getByRole('button', { name: 'حذف ما كتبته' }).first().click(); } },
  { name: 'notebook-empty', run: (p) => open(p, '#/notebook', { 'qareeb:onboarding:v1': { completedAt: '2026-11-23T05:00:00.000Z' } }) },
  { name: 'mydua-open', run: async (p) => { await open(p, '#/notebook'); await p.getByRole('tab', { name: 'دعواتي' }).click(); } },
  { name: 'mydua-add', run: async (p) => { await open(p, '#/notebook'); await p.getByRole('tab', { name: 'دعواتي' }).click(); await p.getByRole('button', { name: 'أضف حاجة' }).click(); await p.getByLabel('حاجتك').fill('التوفيق في الامتحان'); } },
  { name: 'mydua-answered-sheet', run: async (p) => { await open(p, '#/notebook'); await p.getByRole('tab', { name: 'دعواتي' }).click(); await p.getByRole('switch').first().click(); } },
  { name: 'mydua-answered', run: async (p) => { await open(p, '#/notebook'); await p.getByRole('tab', { name: 'دعواتي' }).click(); await p.getByRole('radio', { name: 'استُجيبت' }).click(); } },
  { name: 'mydua-empty', run: async (p) => { await open(p, '#/notebook', { 'qareeb:onboarding:v1': { completedAt: '2026-11-23T05:00:00.000Z' } }); await p.getByRole('tab', { name: 'دعواتي' }).click(); } },
  { name: 'calendar', run: (p) => open(p, '#/calendar') },
  { name: 'calendar-day', full: true, run: async (p) => { await open(p, '#/calendar'); await p.getByRole('button', { name: /الأحد ١٢/ }).click(); } },
  { name: 'calendar-prev', run: async (p) => { await open(p, '#/calendar'); await p.getByRole('button', { name: 'الشهر السابق' }).click(); } },
  { name: 'calendar-reminder', run: async (p) => { await open(p, '#/calendar'); await p.getByRole('button', { name: 'أضف تذكيرًا إلى تقويمك' }).click(); } },
  { name: 'settings', full: true, run: (p) => open(p, '#/settings') },
  { name: 'settings-privacy', run: async (p) => { await open(p, '#/settings'); await p.getByRole('button', { name: 'سياسة الخصوصية' }).click(); } },
  { name: 'settings-about-content', run: async (p) => { await open(p, '#/settings'); await p.getByRole('button', { name: 'عن المحتوى' }).click(); } },
  { name: 'settings-erase', run: async (p) => { await open(p, '#/settings'); await p.getByRole('button', { name: 'امسح كل بياناتي' }).click(); } },
  { name: 'error', run: async (p) => { await p.route(/duas-.*\.js$/, (r) => r.abort()); await open(p, '#/today'); } },
  { name: 'settings-import', run: async (p) => { await open(p, '#/settings'); await p.locator('input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'qareeb', backupVersion: 1, exportedAt: '2026-11-22T10:00:00.000Z', data: { settings: { theme: 'system', fontScale: 16, showMyDuasInFlow: true }, completions: SAMPLE['qareeb:completions:v1'], notebook: SAMPLE['qareeb:notebook:v1'], myDuas: SAMPLE['qareeb:my-duas:v1'], favorites: SAMPLE['qareeb:favorites:v1'] } })) }); } },
  { name: 'settings-import-error', run: async (p) => { await open(p, '#/settings'); await p.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"other"}') }); } },
  { name: 'large-text-today', size: [360, 640], fontScale: 24, run: (p) => open(p, '#/today', { ...SAMPLE, 'qareeb:settings:v1': { theme: 'system', fontScale: 24, showMyDuasInFlow: true } }) },
  { name: 'large-text-calendar', size: [360, 640], full: true, run: (p) => open(p, '#/calendar', { ...SAMPLE, 'qareeb:settings:v1': { theme: 'system', fontScale: 24, showMyDuasInFlow: true } }) },
  { name: 'large-text-live', size: [360, 640], run: async (p) => { await open(p, '#/today', { ...SAMPLE, 'qareeb:settings:v1': { theme: 'system', fontScale: 24, showMyDuasInFlow: true } }); await p.getByRole('button', { name: /عِش الدعاء/ }).click(); await p.getByRole('button', { name: 'أظهر النص كاملًا' }).click(); } },
  { name: 'small-today', size: [360, 640], full: true, run: (p) => open(p, '#/today') },
  { name: 'wide-today', size: [1280, 820], run: (p) => open(p, '#/today') },
  { name: 'wide-calendar', size: [1280, 820], run: (p) => open(p, '#/calendar') },
];

async function toIntention(p: Page) {
  await open(p, '#/today');
  await p.getByRole('button', { name: /عِش الدعاء/ }).click();
  for (let i = 0; i < 5; i++) {
    await p.getByRole('button', { name: 'أظهر النص كاملًا' }).click().catch(() => {});
    await p.getByRole('button', { name: i === 4 ? 'يا ربّ' : 'التالي', exact: true }).click();
  }
}

// In the cloud environment a Chromium is pre-installed; elsewhere Playwright's own is used.
const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(LOCAL_CHROMIUM) ? { executablePath: LOCAL_CHROMIUM } : {});
for (const theme of themes) {
  const dir = join(out, theme);
  mkdirSync(dir, { recursive: true });
  for (const shot of SHOTS) {
    if (only && !only.includes(shot.name)) continue;
    const [width, height] = shot.size ?? [390, 844];
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: theme as 'light' | 'dark', locale: 'ar-SA', timezoneId: 'Asia/Riyadh', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.clock.setFixedTime(new Date('2026-11-23T09:00:00+03:00'));
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    try {
      await shot.run(page);
      await page.screenshot({ path: join(dir, `${shot.name}.png`), fullPage: !!shot.full });
      console.log(`${theme}/${shot.name}${errors.length ? '  ! ' + errors.join(' | ') : ''}`);
    } catch (e) {
      console.error(`✗ ${theme}/${shot.name}: ${(e as Error).message.split('\n')[0]}`);
    }
    await ctx.close();
  }
}
await browser.close();
