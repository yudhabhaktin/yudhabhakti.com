import { type El, type Fill } from './types';

/**
 * The shapes the scenes are built from.
 *
 * These exist so a scene reads as a description of a diagram rather than as
 * geometry: a card, a bar, a lane, a piece of text. Each helper returns the
 * primitives and the moment they should appear, so a scene never has to repeat
 * the timing rules.
 */

/** A static label. */
export function label(x: number, y: number, s: string, at = 0, size = 12.5, fill: Fill = 'ink', opts: Partial<El> = {}): El {
  return { t: 'text', x, y, s, size, fill, anim: 'fade', at, dur: 300, ...(opts as object) } as El;
}

/** A pill: rounded box plus centred label. */
export function chip(x: number, y: number, h: number, text: string, at = 0, accent = false, size = 12): El[] {
  const w = Math.max(52, text.length * size * 0.56 + 20);
  return [
    { t: 'box', x, y, w, h, r: h / 2, fill: accent ? 'accent-soft' : 'ink-soft', stroke: accent ? 'accent-line' : 'rule', sw: 1, anim: 'pop', at, dur: 320 },
    { t: 'text', x: x + w / 2, y: y + h / 2 + 0.5, s: text, anchor: 'middle', size, anim: 'fade', at: at + 90, dur: 260 },
  ];
}

/** A card. The shape most scenes are built out of. */
export function card(x: number, y: number, w: number, h: number, at = 0, accent = false): El {
  return {
    t: 'box', x, y, w, h, r: 8,
    fill: accent ? 'accent-soft' : 'ink-soft',
    stroke: accent ? 'accent-line' : 'rule',
    sw: accent ? 1.2 : 1,
    anim: 'pop', at, dur: 380,
  };
}

/** A document: card plus two lines of copy. */
export function docCard(x: number, y: number, w: number, h: number, name: string, tag: string, at: number, accent = false): El[] {
  return [
    card(x, y, w, h, at, accent),
    label(x, y + h / 2 - 4, name, at + 140, 12, 'ink', { strong: true }),
    label(x, y + h / 2 + 12, tag, at + 220, 10.5, 'muted', { mono: true }),
  ];
}

/** A proportional bar: track, then the fill that grows along it. */
export function bar(x: number, y: number, w: number, h: number, share: number, at: number, accent = true): El[] {
  return [
    { t: 'box', x, y, w, h, r: h / 2, fill: 'ink-soft', stroke: 'rule', sw: 1, anim: 'fade', at, dur: 260 },
    { t: 'box', x, y, w: Math.max(4, w * share), h, r: h / 2, fill: accent ? 'accent' : 'ink', anim: 'growx', at: at + 140, dur: 600 },
  ];
}

/**
 * A stacked share bar: segments sized by `share`, with a legend under it.
 * Returns the shapes; the caller positions it.
 */
export function shareBar(x: number, y: number, w: number, h: number, segs: Array<{ name: string; short?: string; share: number }>, at: number, size = 10.5): El[] {
  const out: El[] = [];
  const advance = (t: string) => t.length * size * 0.55;
  const total = (names: string[]) => names.reduce((a, n) => a + advance(n) + 6, 0);

  // A legend that does not fit is worse than a shorter one: fall back to short
  // names, then to just the ends, and drop any label that would touch its neighbour.
  let names = segs.map((s) => s.name);
  if (size > 0 && total(names) > w) names = segs.map((s, i) => s.short ?? names[i]);
  if (size > 0 && total(names) > w) names = segs.map((n, i) => (i === 0 || i === segs.length - 1 ? n : ''));

  const last = segs.length - 1;
  let cursor = x;
  let prevEnd = -Infinity;
  segs.forEach((s, i) => {
    const sw = w * s.share;
    out.push({ t: 'box', x: cursor, y, w: Math.max(3, sw - 3), h, r: 3, fill: i === 0 ? 'accent' : 'ink-soft', stroke: 'rule', sw: 1, anim: 'growx', at: at + i * 130, dur: 520 });
    const nm = names[i];
    if (size > 0 && nm) {
      const lw = advance(nm);
      const lx = i === last ? Math.min(cursor, x + w - lw) : cursor;
      if (lx >= prevEnd + 5) {
        out.push(label(lx, y + h + 13, nm, at + 60 + i * 130, size, 'muted'));
        prevEnd = lx + lw;
      }
    }
    cursor += sw;
  });
  return out;
}

/** A titled panel with a rule under the title. Used by the index scene. */
export function panel(x: number, y: number, w: number, h: number, title: string, at = 0): El[] {
  return [
    card(x, y, w, h, at),
    label(x + 11, y + 16, title, at + 130, 11.5, 'ink', { strong: true }),
    { t: 'line', x1: x + 11, y1: y + 25, x2: x + w - 11, y2: y + 25, stroke: 'rule', sw: 1, anim: 'fade', at: at + 190, dur: 300 },
  ];
}

/**
 * A lane: title on the left, a track and fill across, volume on the right.
 * Three lanes side by side is most of the parsing step.
 */
export function lane(x: number, y: number, w: number, h: number, title: string, share: number, volume: string, at: number, accent = false): El[] {
  const trackY = y + h - 16;
  return [
    label(x, y + 10, title, at, 12, 'ink', { strong: accent }),
    label(x + w, y + 10, volume, at + 120, 11, 'muted', { anchor: 'end' }),
    ...bar(x, trackY, w, 9, share, at + 160, accent),
  ];
}
