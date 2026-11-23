import type { Dua } from '../../content/types';
import { ar } from '../../copy/ar';
import { kindLabel, referenceOf } from '../dua/reference';
import { ARCH, block, GAP, PAD_BOTTOM, PAD_TOP, PAD_X, planSacred, WIDTH, type Format, type Level, type Measure } from './layout';

/** Token values from tokens.css, read at draw time, so the image follows the current theme. */
function tokens() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(`--${name}`).trim();
  return {
    dark: css.colorScheme.includes('dark'),
    page: v('page'), glow: v('glow'), sunken: v('surface-sunken'), text: v('text'), body: v('text-body'), muted: v('text-muted'),
    accent: v('accent'), hairline: v('hairline'), sacredBg: v('sacred-bg'), frame: v('sacred-frame'), quran: v('sacred-quran'), hadith: v('sacred-hadith'),
    fontUi: v('font-ui'), fontHeading: v('font-heading'), fontQuran: v('font-quran'),
  };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function archPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const rx = Math.min(460, w / 2);
  const ry = Math.min(320, h - 40);
  const rb = 40;
  ctx.beginPath();
  ctx.moveTo(x, y + ry);
  ctx.ellipse(x + rx, y + ry, rx, ry, 0, Math.PI, 1.5 * Math.PI);
  ctx.lineTo(x + w - rx, y);
  ctx.ellipse(x + w - rx, y + ry, rx, ry, 0, 1.5 * Math.PI, 2 * Math.PI);
  ctx.lineTo(x + w, y + h - rb);
  ctx.arcTo(x + w, y + h, x + w - rb, y + h, rb);
  ctx.lineTo(x + rb, y + h);
  ctx.arcTo(x, y + h, x, y + h - rb, rb);
  ctx.closePath();
}

/**
 * Draws the share image (ShareCard): kind, title, the dua in the arch with its
 * reference, then by choice the scene line or one reflection, and the foot.
 * Never anything the user wrote. Waits for the fonts first.
 */
export async function drawShareCard(dua: Dua, format: Format, level: Level): Promise<HTMLCanvasElement> {
  const t = tokens();
  const quran = dua.kind === 'quran';
  const sacredFont = (size: number) => (quran ? `400 ${size}px ${t.fontQuran}` : `500 ${size}px ${t.fontUi}`);
  const titleFont = `700 64px ${t.fontHeading}`;
  const uiFont = (size: number, weight = 400) => `${weight} ${size}px ${t.fontUi}`;
  await Promise.all([document.fonts.load(sacredFont(84), dua.text), document.fonts.load(titleFont, dua.title), document.fonts.load(uiFont(38), 'ا'), document.fonts.load(uiFont(38, 600), 'ا')]);
  await document.fonts.ready;
  const logo = await loadImage(t.dark ? '/icons/lockup-on-dark.svg' : '/icons/lockup-on-light.svg');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const measure: Measure = (text, font) => {
    ctx.font = font;
    ctx.direction = 'rtl';
    return ctx.measureText(text).width;
  };
  const inner = WIDTH - 2 * PAD_X;

  const title = block(dua.title, inner, titleFont, 64, 1.45, measure);
  const extraText = level === 'scene' ? `${ar.card.sceneLabel} · ${dua.sceneLine}` : level === 'reflection' ? dua.reflections[0] ?? '' : '';
  const extra = extraText ? block(extraText, level === 'reflection' ? inner - 32 : inner, uiFont(38, 600), 38, 1.7, measure) : null;
  const chipH = 32 * 1.5 + 12;
  const footH = 2 + 32 + 76;
  const fixedHeight = PAD_TOP[format] + chipH + GAP + title.height + GAP + (extra ? GAP + extra.height : 0) + GAP + footH + PAD_BOTTOM;
  const plan = planSacred({ format, fixedHeight, sacredText: dua.text, quran, fontFor: sacredFont, measure });

  canvas.width = WIDTH;
  canvas.height = Math.ceil(plan.height);
  ctx.direction = 'rtl';
  ctx.textBaseline = 'middle';

  // Ground and the glow.
  ctx.fillStyle = t.page;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(WIDTH / 2, canvas.height * 0.4);
  ctx.scale(1, (canvas.height * 0.42) / (WIDTH * 0.7));
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, WIDTH * 0.7);
  g.addColorStop(0, t.glow);
  g.addColorStop(0.72, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(-WIDTH, -WIDTH * 2, WIDTH * 2, WIDTH * 4);
  ctx.restore();

  const right = WIDTH - PAD_X;
  let y = PAD_TOP[format];

  // Kind chip.
  const kind = kindLabel(dua);
  ctx.font = uiFont(32, 500);
  const chipW = ctx.measureText(kind).width + 52;
  ctx.fillStyle = t.sunken;
  ctx.beginPath();
  ctx.roundRect(right - chipW, y, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.fillStyle = t.muted;
  ctx.textAlign = 'center';
  ctx.fillText(kind, right - chipW / 2, y + chipH / 2);
  y += chipH + GAP;

  // Title.
  ctx.font = titleFont;
  ctx.fillStyle = t.text;
  ctx.textAlign = 'right';
  title.lines.forEach((line, i) => ctx.fillText(line, right, y + (i + 0.5) * 64 * 1.45));
  y += title.height + GAP;

  // The arch with the dua, never cut.
  archPath(ctx, PAD_X, y, inner, plan.archHeight);
  ctx.fillStyle = t.sacredBg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = t.frame;
  ctx.stroke();
  const s = plan.sacred;
  const contentH = s.height + ARCH.refGap + ARCH.refSize * 1.6;
  let sy = y + ARCH.padTop + Math.max(0, (plan.archHeight - ARCH.padTop - ARCH.padBottom - contentH) / 2);
  ctx.textAlign = 'center';
  ctx.font = sacredFont(s.size);
  ctx.fillStyle = quran ? t.quran : t.hadith;
  const [open, close] = quran ? ['﴿', '﴾'] : ['«', '»'];
  const marked = [...s.lines];
  marked[0] = open + marked[0];
  marked[marked.length - 1] = marked[marked.length - 1] + close;
  marked.forEach((line, i) => ctx.fillText(line, WIDTH / 2, sy + (i + 0.5) * s.size * s.lineHeight));
  sy += s.height + ARCH.refGap;
  ctx.font = uiFont(ARCH.refSize);
  ctx.fillStyle = t.muted;
  ctx.fillText(referenceOf(dua), WIDTH / 2, sy + ARCH.refSize * 0.8);
  y += plan.archHeight;

  // The scene line or one reflection.
  if (extra) {
    y += GAP;
    ctx.textAlign = 'right';
    const lh = 38 * 1.7;
    if (level === 'reflection') {
      ctx.fillStyle = t.accent;
      ctx.fillRect(right - 4, y, 4, extra.height);
      ctx.font = uiFont(38);
      ctx.fillStyle = t.body;
      extra.lines.forEach((line, i) => ctx.fillText(line, right - 32, y + (i + 0.5) * lh));
    } else {
      const label = `${ar.card.sceneLabel} ·`;
      extra.lines.forEach((line, i) => {
        const cy = y + (i + 0.5) * lh;
        if (i === 0 && line.startsWith(label)) {
          ctx.font = uiFont(38, 600);
          ctx.fillStyle = t.accent;
          ctx.fillText(label, right, cy);
          const w = ctx.measureText(`${label} `).width;
          ctx.font = uiFont(38);
          ctx.fillStyle = t.body;
          ctx.fillText(line.slice(label.length + 1), right - w, cy);
        } else {
          ctx.font = uiFont(38);
          ctx.fillStyle = t.body;
          ctx.fillText(line, right, cy);
        }
      });
    }
    y += extra.height;
  }

  // Foot: the lockup and the tagline over a hairline.
  y = canvas.height - PAD_BOTTOM - footH;
  ctx.fillStyle = t.hairline;
  ctx.fillRect(PAD_X, y, inner, 2);
  const footMid = y + 2 + 32 + 38;
  if (logo) {
    const h = 76;
    const w = (logo.naturalWidth / logo.naturalHeight) * h || 190;
    ctx.drawImage(logo, right - w, footMid - h / 2, w, h);
  }
  ctx.font = uiFont(30);
  ctx.fillStyle = t.muted;
  ctx.textAlign = 'left';
  ctx.fillText(ar.share.tag, PAD_X, footMid);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
}
