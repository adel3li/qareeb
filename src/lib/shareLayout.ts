/**
 * Layout of the share image (design/system/components/ShareCard): pure, no DOM, so it can be
 * tested with a fake text measurer. drawShareCard.ts measures with the canvas and draws what
 * this returns.
 *
 * Sacred text is never cut. Its size steps down with length (Qur'an 84 → 72 → 58 → 48px);
 * if it still does not fit at the smallest size, the canvas grows taller. The spec names the
 * story format as the one that grows; the post format grows too rather than ever cutting a
 * verse (a taller-than-4:5 post is the lesser harm).
 */

export type ShareFormat = 'post' | 'story';
export type ShareLevel = 'dua' | 'scene' | 'reflection';
export type FontFamily = 'quran' | 'ui' | 'heading';

export interface FontSpec {
  family: FontFamily;
  size: number;
  weight: number;
}

export type Measure = (text: string, font: FontSpec) => number;

export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT: Record<ShareFormat, number> = { post: 1350, story: 1920 };
export const QURAN_STEPS = [84, 72, 58, 48];
export const HADITH_STEPS = [60, 52, 44, 38];

export const G = {
  side: 96,
  top: 88,
  bottom: 88,
  storyExtraTop: 200,
  gap: 40,
  chip: { font: { family: 'ui', size: 32, weight: 500 } as FontSpec, padX: 26, padY: 6, lineHeight: 1.5 },
  title: { font: { family: 'heading', size: 64, weight: 700 } as FontSpec, lineHeight: 1.45 },
  arch: { padTop: 190, padSide: 56, padBottom: 56, rx: 460, ry: 320, bottomRadius: 40, stroke: 3 },
  ref: { font: { family: 'ui', size: 34, weight: 400 } as FontSpec, lineHeight: 1.6, marginTop: 20 },
  extra: { font: { family: 'ui', size: 38, weight: 400 } as FontSpec, lineHeight: 1.7, ruleWidth: 4, ruleGap: 28 },
  foot: { rule: 2, padTop: 32, logoHeight: 76, logoAspect: 2753 / 1090.06, tag: { family: 'ui', size: 30, weight: 400 } as FontSpec },
  sacredLineHeight: { quran: 2.05, hadith: 2 },
} as const;

/** Greedy word wrap at `width`. A word wider than the line gets a line of its own; nothing is dropped. */
export function wrapWords(text: string, width: number, font: FontSpec, measure: Measure): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || measure(candidate, font) <= width) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface Block {
  y: number;
  lines: string[];
  font: FontSpec;
  lineHeight: number;
}

export interface ShareLayout {
  width: number;
  height: number;
  contentX: number;
  contentWidth: number;
  chip: { x: number; y: number; width: number; height: number; text: string };
  title: Block;
  arch: { x: number; y: number; width: number; height: number };
  sacred: Block & { kind: 'quran' | 'hadith' | 'placeholder' };
  ref: Block;
  extra: (Block & { kind: 'scene' | 'reflection'; lead?: string }) | null;
  foot: { ruleY: number; logoY: number; logoWidth: number; logoHeight: number; tag: Block };
}

export interface ShareInput {
  format: ShareFormat;
  kindLabel: string;
  title: string;
  /** The sacred text with its marks, or a draft placeholder. */
  sacred: string;
  sacredKind: 'quran' | 'hadith' | 'placeholder';
  reference: string;
  /** Scene line (with its lead) or one reflection, by the user's choice. */
  extra?: { kind: 'scene' | 'reflection'; text: string; lead?: string };
  tag: string;
}

const lh = (b: { lines: string[]; font: FontSpec; lineHeight: number }) => b.lines.length * b.font.size * b.lineHeight;

export function layoutShareCard(input: ShareInput, measure: Measure): ShareLayout {
  const width = SHARE_WIDTH;
  const contentX = G.side;
  const contentWidth = width - 2 * G.side;
  const top = G.top + (input.format === 'story' ? G.storyExtraTop : 0);
  const baseHeight = SHARE_HEIGHT[input.format];

  const chipH = G.chip.font.size * G.chip.lineHeight + 2 * G.chip.padY;
  const chipW = measure(input.kindLabel, G.chip.font) + 2 * G.chip.padX;

  const titleLines = wrapWords(input.title, contentWidth, G.title.font, measure);
  const titleBlock = { lines: titleLines, font: G.title.font, lineHeight: G.title.lineHeight };

  let extraBlock: Omit<NonNullable<ShareLayout['extra']>, 'y'> | null = null;
  if (input.extra && input.extra.text.trim()) {
    const indent = input.extra.kind === 'reflection' ? G.extra.ruleWidth + G.extra.ruleGap : 0;
    const text = input.extra.lead ? `${input.extra.lead} ${input.extra.text}` : input.extra.text;
    extraBlock = {
      kind: input.extra.kind,
      lead: input.extra.lead,
      lines: wrapWords(text, contentWidth - indent, G.extra.font, measure),
      font: G.extra.font,
      lineHeight: G.extra.lineHeight,
    };
  }

  const tagBlock = { lines: [input.tag], font: G.foot.tag, lineHeight: 1.5 };
  const footH = G.foot.rule + G.foot.padTop + G.foot.logoHeight;

  const blocks = 4 + (extraBlock ? 1 : 0); // chip, title, arch, [extra], foot
  const fixed = top + G.bottom + chipH + lh(titleBlock) + (extraBlock ? lh(extraBlock) : 0) + footH + (blocks - 1) * G.gap;

  const archInnerW = contentWidth - 2 * G.arch.padSide;
  const refBlock = { lines: wrapWords(input.reference, archInnerW, G.ref.font, measure), font: G.ref.font, lineHeight: G.ref.lineHeight };
  const archChrome = G.arch.padTop + G.arch.padBottom + G.ref.marginTop + lh(refBlock);

  const steps = input.sacredKind === 'quran' ? QURAN_STEPS : HADITH_STEPS;
  const family: FontFamily = input.sacredKind === 'quran' ? 'quran' : 'ui';
  const weight = input.sacredKind === 'hadith' ? 500 : 400;
  const lineHeight = input.sacredKind === 'quran' ? G.sacredLineHeight.quran : G.sacredLineHeight.hadith;
  const available = baseHeight - fixed;

  let sacred: { lines: string[]; font: FontSpec; lineHeight: number } | null = null;
  for (const size of steps) {
    const font: FontSpec = { family, size, weight };
    const candidate = { lines: wrapWords(input.sacred, archInnerW, font, measure), font, lineHeight };
    sacred = candidate;
    if (archChrome + lh(candidate) <= available) break;
  }
  const sacredBlock = sacred!;

  // The arch takes the remaining height (flex: 1), or grows the canvas when the text needs more.
  const archH = Math.max(available, archChrome + lh(sacredBlock));
  const height = Math.ceil(fixed + archH);

  let y = top;
  const chip = { x: width - contentX - chipW, y, width: chipW, height: chipH, text: input.kindLabel };
  y += chipH + G.gap;
  const title: Block = { y, ...titleBlock };
  y += lh(titleBlock) + G.gap;
  const arch = { x: contentX, y, width: contentWidth, height: archH };
  // Text and reference are centred vertically below the arch head (justify-content: center).
  const innerTop = arch.y + G.arch.padTop + (archH - archChrome - lh(sacredBlock)) / 2;
  const sacredY = Math.max(arch.y + G.arch.padTop, innerTop);
  const sacredOut = { y: sacredY, ...sacredBlock, kind: input.sacredKind };
  const ref: Block = { y: sacredY + lh(sacredBlock) + G.ref.marginTop, ...refBlock };
  y += archH + G.gap;
  let extra: ShareLayout['extra'] = null;
  if (extraBlock) {
    extra = { y, ...extraBlock };
    y += lh(extraBlock) + G.gap;
  }
  const logoWidth = G.foot.logoHeight * G.foot.logoAspect;
  const foot = {
    ruleY: y,
    logoY: y + G.foot.rule + G.foot.padTop,
    logoWidth,
    logoHeight: G.foot.logoHeight,
    tag: { y: y + G.foot.rule + G.foot.padTop + (G.foot.logoHeight - G.foot.tag.size * 1.5) / 2, ...tagBlock },
  };

  return { width, height, contentX, contentWidth, chip, title, arch, sacred: sacredOut, ref, extra, foot };
}
