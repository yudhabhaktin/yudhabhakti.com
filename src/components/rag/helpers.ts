import { fit, type El, type Fill, type Stage } from './types';

/** A pill: rounded box plus centred label. Returns both shapes. */
export function chip(x: number, y: number, h: number, label: string, fill: Fill = 'ink-soft', stroke: Fill = 'rule', at = 0, size = 12): El[] {
  const w = Math.max(46, label.length * size * 0.56 + 20);
  return [
    { t: 'box', x, y, w, h, r: h / 2, fill, stroke, sw: 1, anim: 'pop', at, dur: 320 },
    { t: 'text', x: x + w / 2, y: y + h / 2 + 0.5, s: label, anchor: 'middle', size, anim: 'fade', at: at + 90, dur: 260 },
  ];
}

/** Chips laid out left to right, wrapping every `per` items. */
export function chipRow(x0: number, y0: number, per: number, hgt: number, gap: number, items: [string, Fill][], at: number, step = 110): El[] {
  const out: El[] = [];
  let x = x0, y = y0, i = 0;
  for (const [label, fill] of items) {
    if (i > 0 && i % per === 0) { y += hgt + gap; x = x0; }
    const w = Math.max(46, label.length * 12 * 0.56 + 20);
    out.push(...chip(x, y, hgt, label, fill === 'accent' ? 'accent-soft' : 'ink-soft', fill === 'accent' ? 'accent' : 'rule', at + i * step));
    x += w + 6;
    i++;
  }
  return out;
}

/** Panel with a title bar — the shape the index and retrieval scenes are built from. */
export function panel(x: number, y: number, w: number, h: number, title: string, accent = false, at = 0, dur = 380): El[] {
  return [
    { t: 'box', x, y, w, h, r: 8, fill: 'panel', stroke: 'rule', sw: 1, anim: 'pop', at, dur },
    { t: 'box', x, y, w: 22, h: 22, r: 8, fill: accent ? 'accent-soft' : 'ink-soft', stroke: accent ? 'accent-line' : 'rule', sw: 1, at: at + 60, dur: 320 },
    { t: 'text', x: x + 9, y: y + 12, s: fit(title, w - 18, 11.5), size: 11.5, strong: true, fill: accent ? 'accent' : 'ink', anim: 'fade', at: at + 140, dur: 260 },
  ];
}
