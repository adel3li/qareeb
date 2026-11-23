import type { AppDua } from '../../content/types';
import { ar } from '../../copy/ar';
import { sourceReference } from '../../lib/reference';
import { fitText, wrapWords, type Measure } from '../../lib/shareLayout';

/**
 * The share image (design/system/components/ShareCard), drawn on a canvas
 * at 1080×1350 (post) or 1080×1920 (story) in the current theme. Colours are
 * read from the tokens on <html>. Sacred text is never cut: its size steps
 * down (84 → 72 → 58 → 48px for the Qur'an) and the image grows when even the
 * smallest size does not fit.
 */

export type ShareFormat = 'post' | 'story';
export type ShareLevel = 'dua' | 'scene' | 'reflection';

const W = 1080;
const SIDE = 96;
const INNER = W - SIDE * 2;
const FONT_UI = '"Noto Sans Arabic", system-ui, sans-serif';
const FONT_KUFI = '"Noto Kufi Arabic", "Noto Sans Arabic", sans-serif';
const FONT_QURAN = '"KFGQPC HAFS", serif';

type Palette = Record<'page' | 'text' | 'textBody' | 'textMuted' | 'accent' | 'surfaceSunken' | 'hairline' | 'sacredQuran' | 'sacredHadith' | 'sacredFrame' | 'sacredBg' | 'glow', string>;

function palette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(`--${name}`).trim();
  return {
    page: v('page'),
    text: v('text'),
    textBody: v('text-body'),
    textMuted: v('text-muted'),
    accent: v('accent'),
    surfaceSunken: v('surface-sunken'),
    hairline: v('hairline'),
    sacredQuran: v('sacred-quran'),
    sacredHadith: v('sacred-hadith'),
    sacredFrame: v('sacred-frame'),
    sacredBg: v('sacred-bg'),
    glow: v('glow'),
  };
}

export function isDarkTheme(): boolean {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit) return explicit === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

async function ensureFonts(dua: AppDua): Promise<void> {
  const sacredFont = dua.kind === 'quran' ? `84px ${FONT_QURAN}` : `500 66px ${FONT_UI}`;
  await Promise.all([
    document.fonts.load(sacredFont, dua.text),
    document.fonts.load(`700 64px ${FONT_KUFI}`, dua.title),
    document.fonts.load(`500 32px ${FONT_UI}`, 'من القرآن'),
    document.fonts.load(`400 38px ${FONT_UI}`, dua.sceneLine),
  ]);
  await document.fonts.ready;
}

/** The arch: elliptical head over rounded bottom corners, radii clamped as CSS does. */
function archPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  let rx = 460;
  let ry = 320;
  const scale = Math.min(1, w / (2 * rx), (h - 40) / ry);
  rx *= scale;
  ry *= scale;
  const r = 40;
  ctx.beginPath();
  ctx.moveTo(x, y + ry);
  ctx.ellipse(x + rx, y + ry, rx, ry, 0, Math.PI, Math.PI * 1.5);
  ctx.lineTo(x + w - rx, y);
  ctx.ellipse(x + w - rx, y + ry, rx, ry, 0, Math.PI * 1.5, Math.PI * 2);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.closePath();
}

export async function drawShareCard(dua: AppDua, format: ShareFormat, level: ShareLevel): Promise<HTMLCanvasElement> {
  await ensureFonts(dua);
  const c = palette();
  const dark = isDarkTheme();
  const lockup = await loadImage(`/brand/lockup-on-${dark ? 'dark' : 'light'}.svg`);

  const probe = document.createElement('canvas').getContext('2d')!;
  const measureWith = (font: (size: number) => string): Measure => (text, size) => {
    probe.font = font(size);
    return probe.measureText(text).width;
  };
  const quran = dua.kind === 'quran';
  const sacredFont = (size: number) => (quran ? `${size}px ${FONT_QURAN}` : `500 ${size}px ${FONT_UI}`);
  const sacredSizes = quran ? [84, 72, 58, 48] : [66, 56, 46, 38];
  const sacredLh = quran ? 2.05 : 2;
  const marked = quran ? `﴿${dua.text}﴾` : `«${dua.text}»`;

  // Fixed blocks.
  const top = format === 'story' ? 88 + 200 : 88;
  const chipH = 60;
  const titleLines = wrapWords(dua.title, INNER, 64, measureWith((s) => `700 ${s}px ${FONT_KUFI}`));
  const titleH = titleLines.length * 64 * 1.45;
  const extraText = level === 'scene' ? `${ar.card.scenePrefix} · ${dua.sceneLine}` : level === 'reflection' ? dua.reflections[0] : '';
  const extraLines = extraText ? wrapWords(extraText, level === 'reflection' ? INNER - 32 : INNER, 38, measureWith((s) => `400 ${s}px ${FONT_UI}`)) : [];
  const extraH = extraLines.length * 38 * 1.7;
  const footH = 34 + 76;
  const gap = 40;
  const fixed = top + chipH + gap + titleH + gap + (extraH ? gap + extraH : 0) + gap + footH + 88;

  // The arch takes what is left; the sacred text fits inside or the image grows.
  const baseH = format === 'story' ? 1920 : 1350;
  const archPadTop = 190;
  const archPadBottom = 56;
  const refH = 20 + 34 * 1.6;
  const archInnerW = INNER - 112;
  const available = baseH - fixed - archPadTop - archPadBottom - refH;
  const fit = fitText(marked, sacredSizes, sacredLh, archInnerW, Math.max(available, 0), measureWith(sacredFont));
  const H = fit.fits ? baseH : Math.ceil(fixed + archPadTop + archPadBottom + refH + fit.height);
  const archH = H - fixed;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.direction = 'rtl';
  ctx.textBaseline = 'middle';

  // Ground and the light inside the door.
  ctx.fillStyle = c.page;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, W * 0.7);
  glow.addColorStop(0, c.glow);
  glow.addColorStop(0.72, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  let y = top;
  // Kind chip at the start (right).
  ctx.font = `500 32px ${FONT_UI}`;
  const kind = quran ? ar.card.fromQuran : ar.card.fromSunnah;
  const chipW = ctx.measureText(kind).width + 52;
  ctx.fillStyle = c.surfaceSunken;
  ctx.beginPath();
  ctx.roundRect(W - SIDE - chipW, y, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.fillStyle = c.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText(kind, W - SIDE - chipW / 2, y + chipH / 2 + 2);
  y += chipH + gap;

  // Title.
  ctx.font = `700 64px ${FONT_KUFI}`;
  ctx.fillStyle = c.text;
  ctx.textAlign = 'right';
  titleLines.forEach((line, i) => ctx.fillText(line, W - SIDE, y + 64 * 1.45 * (i + 0.5)));
  y += titleH + gap;

  // The arch and the sacred text, centred in it.
  archPath(ctx, SIDE, y, INNER, archH);
  ctx.fillStyle = c.sacredBg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = c.sacredFrame;
  ctx.stroke();
  const block = fit.height + refH;
  const innerTop = y + archPadTop;
  const innerH = archH - archPadTop - archPadBottom;
  let ty = innerTop + Math.max(0, (innerH - block) / 2);
  ctx.textAlign = 'center';
  ctx.font = sacredFont(fit.fontSize);
  ctx.fillStyle = quran ? c.sacredQuran : c.sacredHadith;
  for (const line of fit.lines) {
    ctx.fillText(line, W / 2, ty + (fit.fontSize * sacredLh) / 2);
    ty += fit.fontSize * sacredLh;
  }
  ctx.font = `400 34px ${FONT_UI}`;
  ctx.fillStyle = c.textMuted;
  ctx.fillText(sourceReference(dua), W / 2, ty + 20 + (34 * 1.6) / 2);
  y += archH + gap;

  // The scene line or a reflection.
  if (extraLines.length) {
    ctx.textAlign = 'right';
    const x = level === 'reflection' ? W - SIDE - 32 : W - SIDE;
    if (level === 'reflection') {
      ctx.fillStyle = c.accent;
      ctx.fillRect(W - SIDE - 4, y, 4, extraH);
    }
    extraLines.forEach((line, i) => {
      const ly = y + 38 * 1.7 * (i + 0.5);
      ctx.font = `400 38px ${FONT_UI}`;
      ctx.fillStyle = c.textBody;
      if (level === 'scene' && i === 0 && line.startsWith(ar.card.scenePrefix)) {
        ctx.font = `600 38px ${FONT_UI}`;
        ctx.fillStyle = c.accent;
        ctx.fillText(ar.card.scenePrefix, x, ly);
        const prefixW = ctx.measureText(ar.card.scenePrefix).width;
        ctx.font = `400 38px ${FONT_UI}`;
        ctx.fillStyle = c.textBody;
        ctx.fillText(line.slice(ar.card.scenePrefix.length), x - prefixW, ly);
      } else ctx.fillText(line, x, ly);
    });
    y += extraH + gap;
  }

  // Foot: a hairline, the lockup at the start, the tagline at the end.
  ctx.fillStyle = c.hairline;
  ctx.fillRect(SIDE, y, INNER, 2);
  y += 34;
  const logoW = (lockup.naturalWidth / lockup.naturalHeight) * 76;
  ctx.drawImage(lockup, W - SIDE - logoW, y, logoW, 76);
  ctx.font = `400 30px ${FONT_UI}`;
  ctx.fillStyle = c.textMuted;
  ctx.textAlign = 'left';
  ctx.fillText(ar.app.tagline, SIDE, y + 38);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'));
}
