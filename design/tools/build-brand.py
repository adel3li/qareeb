"""Builds the logo and icon SVGs of «قريب» (the open-door identity) into design/brand/.

The wordmark is the word shaped by HarfBuzz in Reem Kufi Bold (OFL, design/brand/font/) and
converted to outlines, so no font is needed to show it. The door mark is drawn here.
Colours come from the "bab" block of design/tokens.css.

Usage:  pip install fonttools brotli uharfbuzz
        python3 design/tools/build-brand.py          # then: node design/tools/render-icons.mjs
"""
import io
import pathlib

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'brand'
FONT = OUT / 'font' / 'ReemKufi-Bold.arabic.woff2'
NAME = 'قريب'

# Tokens, "bab" direction (design/tokens.css)
INK, SAND = '#1c1a17', '#f2eee6'                # --text, light / dark
STONE_L, STONE_D = '#7a6850', '#c4b294'         # --accent, light / dark
TQ_L, TQ_D = '#0c6f68', '#4cc7ba'               # --cta, light / dark
BASALT = '#12110f'                              # --page, dark


def shape(text):
    tt = TTFont(FONT)
    tt.flavor = None
    buf = io.BytesIO()
    tt.save(buf)
    data = buf.getvalue()
    tt = TTFont(io.BytesIO(data))
    font = hb.Font(hb.Face(hb.Blob(data)))
    hbuf = hb.Buffer()
    hbuf.add_str(text)
    hbuf.guess_segment_properties()
    hb.shape(font, hbuf, {})
    glyphs, order = tt.getGlyphSet(), tt.getGlyphOrder()
    pen, bounds = SVGPathPen(glyphs), BoundsPen(glyphs)
    x = 0
    for info, pos in zip(hbuf.glyph_infos, hbuf.glyph_positions):
        t = (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset)  # y down, baseline at 0
        glyphs[order[info.codepoint]].draw(TransformPen(pen, t))
        glyphs[order[info.codepoint]].draw(TransformPen(bounds, t))
        x += pos.x_advance
    return pen.getCommands(), bounds.bounds


WORD, (WX0, WY0, WX1, WY1) = shape(NAME)
STEM = 140  # thickness of the base stroke of the final ب, in font units


def arch(cx, base, a, rise, top):
    """Centreline of the door: two jambs and a semi-elliptical head (rise:half-width = 2:3)."""
    spring = top + rise
    return f'M{cx - a:g} {base:g} V{spring:g} A{a:g} {rise:g} 0 0 1 {cx + a:g} {spring:g} V{base:g}'


def glow(gid, colour, opacity, cy='88%', r='80%'):
    return (f'<radialGradient id="{gid}" cx="50%" cy="{cy}" r="{r}">'
            f'<stop offset="0" stop-color="{colour}" stop-opacity="{opacity}"/>'
            f'<stop offset="0.6" stop-color="{colour}" stop-opacity="{opacity * 0.3:.3f}"/>'
            f'<stop offset="1" stop-color="{colour}" stop-opacity="0"/></radialGradient>')


def svg(view, body, label, w=None, h=None):
    size = f' width="{w}" height="{h}"' if w else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}"{size} role="img" aria-label="{label}">'
            f'<title>{label}</title>{body}</svg>\n')


# ── Wordmark ────────────────────────────────────────────────────────────────
PAD = 40


def wordmark(fill):
    x, y = WX0 - PAD, WY0 - PAD
    w, h = WX1 - WX0 + 2 * PAD, WY1 - WY0 + 2 * PAD
    return svg(f'{x:g} {y:g} {w:g} {h:g}', f'<path fill="{fill}" d="{WORD}"/>', 'قريب')


# ── Lockup: the word walks into the open door ───────────────────────────────
# The base stroke of the final ب continues as the door's threshold.
L_SW, L_A, L_RISE = 84, 222, 148         # door stroke, half-width (centreline), arch rise
L_TOP = -800 + L_SW / 2                  # outer top of the arch, above the dots of ق: the door is the tallest thing
L_GAP, L_EXT = 150, 70                   # ب to the door's outer jamb; threshold past the far jamb
L_CX = WX0 - L_GAP - (L_A + L_SW / 2)
L_LEFT = L_CX - L_A - L_SW / 2 - L_EXT


def lockup(word_fill, door, light=None, opacity=0.0):
    base = -STEM + 1
    d = arch(L_CX, base, L_A, L_RISE, L_TOP)
    body = ''
    if light:
        body += f'<defs>{glow("l", light, opacity, cy="85%", r="75%")}</defs><path fill="url(#l)" d="{d} Z"/>'
    body += f'<path fill="none" stroke="{door}" stroke-width="{L_SW}" stroke-linejoin="round" d="{d}"/>'
    body += f'<rect fill="{word_fill}" x="{L_LEFT:g}" y="{-STEM}" width="{WX0 + 120 - L_LEFT:g}" height="{STEM}"/>'
    body += f'<path fill="{word_fill}" d="{WORD}"/>'
    x, y = L_LEFT - PAD, L_TOP - L_SW / 2 - PAD
    w, h = WX1 + PAD - x, WY1 + PAD - y
    return svg(f'{x:g} {y:g} {w:g} {h:g}', body, 'قريب')


# ── Door mark and icons (1024 grid) ─────────────────────────────────────────
M_A, M_RISE, M_TOP, M_BASE, M_EXT = 176, 118, 250, 790, 70


def door_mark(stroke, sw, light=None, opacity=0.0, spill=False, scale=1.0, gid='g'):
    d = arch(512, M_BASE, M_A, M_RISE, M_TOP)
    parts, defs = [], ''
    if light:
        defs += glow(gid, light, opacity)
        if spill:  # light falling out of the doorway onto the ground
            defs += (f'<linearGradient id="{gid}s" x1="0" y1="0" x2="0" y2="1">'
                     f'<stop offset="0" stop-color="{light}" stop-opacity="{opacity * 0.5:.3f}"/>'
                     f'<stop offset="1" stop-color="{light}" stop-opacity="0"/></linearGradient>')
            parts.append(f'<path fill="url(#{gid}s)" d="M{512 - M_A} {M_BASE} H{512 + M_A} L{512 + M_A + 90} 1024 H{512 - M_A - 90} Z"/>')
        parts.append(f'<path fill="url(#{gid})" d="{d} Z"/>')
    parts.append(f'<path fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" d="{d}"/>')
    parts.append(f'<path fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" d="M{512 - M_A - M_EXT} {M_BASE} H{512 + M_A + M_EXT}"/>')
    g = ''.join(parts)
    if scale != 1.0:
        g = f'<g transform="translate(512 520) scale({scale}) translate(-512 -520)">{g}</g>'
    return (f'<defs>{defs}</defs>' if defs else '') + g


def icon(shape='rounded', sw=48, spill=True, scale=1.0):
    bg = {'rounded': f'<rect width="1024" height="1024" rx="228" fill="{BASALT}"/>',
          'square': f'<rect width="1024" height="1024" fill="{BASALT}"/>'}[shape]
    return svg('0 0 1024 1024', bg + door_mark(STONE_D, sw, TQ_D, 0.9, spill, scale), 'قريب', 1024, 1024)


FILES = {
    'wordmark.svg': wordmark('currentColor'),
    'wordmark-on-light.svg': wordmark(INK),
    'wordmark-on-dark.svg': wordmark(SAND),
    'lockup.svg': lockup('currentColor', 'currentColor'),
    'lockup-on-light.svg': lockup(INK, STONE_L, TQ_L, 0.45),
    'lockup-on-dark.svg': lockup(SAND, STONE_D, TQ_D, 0.8),
    'mark.svg': svg('200 200 624 650', door_mark('currentColor', 48), 'قريب'),
    'icon.svg': icon('rounded'),                          # 1024 master; PWA "any" icons
    'icon-full.svg': icon('square'),                      # apple-touch-icon: iOS rounds the corners itself
    'icon-maskable.svg': icon('square', scale=0.78),      # mark inside the 80% safe circle
    'favicon.svg': icon('rounded', sw=80, spill=False),   # heavier line for 16 to 32 px
}

for name, text in FILES.items():
    (OUT / name).write_text(text, encoding='utf-8')
print(f'{len(FILES)} files written to {OUT.relative_to(ROOT.parent)}')
