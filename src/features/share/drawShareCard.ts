import { ar } from '../../copy/ar';
import type { Dua } from '../../content/types';
import { displayTextOf, kindLabel, referenceOf } from '../../lib/reference';
import { G, layoutShareCard, type Block, type FontSpec, type ShareFormat, type ShareLayout, type ShareLevel } from '../../lib/shareLayout';

/**
 * Draws the share image (design/system/components/ShareCard) on a canvas, in the user's
 * current theme. Every colour is read from the design tokens at draw time; the sacred text
 * is never cut (src/lib/shareLayout.ts). Nothing the user wrote is ever drawn.
 */

type Tokens = Record<
  'page' | 'glow' | 'text' | 'textMuted' | 'textBody' | 'accent' | 'surfaceSunken' | 'sacredBg' | 'sacredFrame' | 'sacredQuran' | 'sacredHadith' | 'hairline' | 'danger',
  string
> & { fontUi: string; fontHeading: string; fontQuran: string };

function readTokens(): Tokens {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    page: v('--page'),
    glow: v('--glow'),
    text: v('--text'),
    textMuted: v('--text-muted'),
    textBody: v('--text-body'),
    accent: v('--accent'),
    surfaceSunken: v('--surface-sunken'),
    sacredBg: v('--sacred-bg'),
    sacredFrame: v('--sacred-frame'),
    sacredQuran: v('--sacred-quran'),
    sacredHadith: v('--sacred-hadith'),
    hairline: v('--hairline'),
    danger: v('--danger'),
    fontUi: v('--font-ui') || 'sans-serif',
    fontHeading: v('--font-heading') || 'sans-serif',
    fontQuran: v('--font-quran') || 'serif',
  };
}

function fontString(f: FontSpec, t: Tokens): string {
  const family = f.family === 'quran' ? t.fontQuran : f.family === 'heading' ? t.fontHeading : t.fontUi;
  return `${f.weight} ${f.size}px ${family}`;
}

/** The same colour fully transparent (the end stop of the glow), without writing a colour literal. */
function transparentOf(color: string): string {
  const parts = color.match(/^(\w+)\((.*)\)$/);
  if (!parts) return 'transparent';
  const channels = parts[2].split(/[\s,/]+/).filter(Boolean).slice(0, 3);
  return `${parts[1].replace(/a$/, '')}a(${channels.join(', ')}, 0)`;
}

function isDarkTheme(): boolean {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'dark') return true;
  if (chosen === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export interface ShareOptions {
  dua: Dua;
  format: ShareFormat;
  level: ShareLevel;
}

function inputFor({ dua, format, level }: ShareOptions) {
  const shown = displayTextOf(dua);
  const sacredKind = shown.isPlaceholder ? ('placeholder' as const) : dua.kind === 'quran' ? ('quran' as const) : ('hadith' as const);
  const sacred = sacredKind === 'quran' ? `﴿${shown.text}﴾` : sacredKind === 'hadith' ? `«${shown.text}»` : shown.text;
  const reflection = dua.reflections[0];
  const extra =
    level === 'scene'
      ? { kind: 'scene' as const, lead: ar.today.sceneLead, text: dua.sceneLine }
      : level === 'reflection' && reflection
        ? { kind: 'reflection' as const, text: reflection }
        : undefined;
  return { format, kindLabel: kindLabel(dua.kind), title: dua.title, sacred, sacredKind, reference: referenceOf(dua), extra, tag: ar.tagline };
}

async function loadFonts(layout: ShareLayout, t: Tokens): Promise<void> {
  if (!document.fonts) return;
  const specs: [FontSpec, string][] = [
    [layout.title.font, layout.title.lines.join(' ')],
    [layout.sacred.font, layout.sacred.lines.join(' ')],
    [G.chip.font, layout.chip.text],
    [{ ...G.extra.font, weight: 600 }, ar.today.sceneLead],
  ];
  await Promise.all(specs.map(([f, text]) => document.fonts.load(fontString(f, t), text).catch(() => [])));
  await document.fonts.ready;
}

function drawLines(ctx: CanvasRenderingContext2D, block: Block, t: Tokens, x: number, align: CanvasTextAlign, color: string) {
  ctx.font = fontString(block.font, t);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const step = block.font.size * block.lineHeight;
  block.lines.forEach((line, i) => ctx.fillText(line, x, block.y + step * i + step / 2));
}

function archPath(ctx: CanvasRenderingContext2D, a: ShareLayout['arch']) {
  // CSS scales every radius down together when they do not fit the box.
  const f = Math.min(1, a.width / (2 * G.arch.rx), a.height / (G.arch.ry + G.arch.bottomRadius));
  const rx = G.arch.rx * f;
  const ry = G.arch.ry * f;
  const br = G.arch.bottomRadius * f;
  const { x, y, width: w, height: h } = a;
  ctx.beginPath();
  ctx.moveTo(x, y + ry);
  ctx.ellipse(x + rx, y + ry, rx, ry, 0, Math.PI, 1.5 * Math.PI);
  ctx.lineTo(x + w - rx, y);
  ctx.ellipse(x + w - rx, y + ry, rx, ry, 0, 1.5 * Math.PI, 2 * Math.PI);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + br, y + h);
  ctx.arcTo(x, y + h, x, y + h - br, br);
  ctx.closePath();
}

export async function drawShareCard(canvas: HTMLCanvasElement, options: ShareOptions): Promise<void> {
  const t = readTokens();
  const probe = canvas.getContext('2d');
  if (!probe) throw new Error('Canvas 2D is not available');
  probe.direction = 'rtl';
  const measure = (text: string, f: FontSpec) => {
    probe.font = fontString(f, t);
    return probe.measureText(text).width;
  };
  // Measure once to know which fonts to load, then again with the fonts in place.
  await loadFonts(layoutShareCard(inputFor(options), measure), t);
  const layout = layoutShareCard(inputFor(options), measure);
  const logo = await loadImage(isDarkTheme() ? 'brand/lockup-on-dark.svg' : 'brand/lockup-on-light.svg');

  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext('2d')!;
  ctx.direction = 'rtl';
  const W = layout.width;
  const H = layout.height;
  const right = layout.contentX + layout.contentWidth;

  // Ground and the light inside the door.
  ctx.fillStyle = t.page;
  ctx.fillRect(0, 0, W, H);
  if (t.glow) {
    const rx = 0.7 * W;
    const ry = 0.42 * H;
    ctx.save();
    ctx.translate(W / 2, 0.4 * H);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, t.glow);
    g.addColorStop(0.72, transparentOf(t.glow));
    ctx.fillStyle = g;
    ctx.fillRect(-W, -H * (rx / ry), 2 * W, 2 * H * (rx / ry));
    ctx.restore();
  }

  // Kind chip.
  const c = layout.chip;
  ctx.fillStyle = t.surfaceSunken;
  ctx.beginPath();
  ctx.roundRect(c.x, c.y, c.width, c.height, c.height / 2);
  ctx.fill();
  ctx.font = fontString(G.chip.font, t);
  ctx.fillStyle = t.textMuted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(c.text, c.x + c.width / 2, c.y + c.height / 2);

  // Title.
  drawLines(ctx, layout.title, t, right, 'right', t.text);

  // The arch and the sacred text, never cut.
  archPath(ctx, layout.arch);
  ctx.fillStyle = t.sacredBg;
  ctx.fill();
  ctx.lineWidth = G.arch.stroke;
  ctx.strokeStyle = t.sacredFrame;
  ctx.stroke();
  const sacredColor = layout.sacred.kind === 'quran' ? t.sacredQuran : layout.sacred.kind === 'hadith' ? t.sacredHadith : t.danger;
  drawLines(ctx, layout.sacred, t, W / 2, 'center', sacredColor);
  drawLines(ctx, layout.ref, t, W / 2, 'center', t.textMuted);

  // Scene line or one reflection.
  const e = layout.extra;
  if (e) {
    const step = e.font.size * e.lineHeight;
    if (e.kind === 'reflection') {
      ctx.fillStyle = t.accent;
      ctx.fillRect(right - G.extra.ruleWidth, e.y, G.extra.ruleWidth, step * e.lines.length);
      drawLines(ctx, e, t, right - G.extra.ruleWidth - G.extra.ruleGap, 'right', t.textBody);
    } else {
      const [first, ...rest] = e.lines;
      const lead = e.lead && first.startsWith(e.lead) ? e.lead : '';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';
      let x = right;
      if (lead) {
        ctx.font = fontString({ ...e.font, weight: 600 }, t);
        ctx.fillStyle = t.accent;
        ctx.fillText(lead, x, e.y + step / 2);
        x -= ctx.measureText(`${lead} `).width;
      }
      ctx.font = fontString(e.font, t);
      ctx.fillStyle = t.textBody;
      ctx.fillText(first.slice(lead.length).trim(), x, e.y + step / 2);
      drawLines(ctx, { ...e, y: e.y + step, lines: rest }, t, right, 'right', t.textBody);
    }
  }

  // Foot: rule, lockup at the start (right), the line at the end.
  const f = layout.foot;
  ctx.fillStyle = t.hairline;
  ctx.fillRect(layout.contentX, f.ruleY, layout.contentWidth, G.foot.rule);
  if (logo) ctx.drawImage(logo, right - f.logoWidth, f.logoY, f.logoWidth, f.logoHeight);
  drawLines(ctx, f.tag, t, layout.contentX, 'left', t.textMuted);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
}
