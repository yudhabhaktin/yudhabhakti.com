import { rng, type El, type Fill, type Hue } from './types';

/**
 * The parts the diagrams are built from.
 *
 * A scene is a description of a drawing, so these are named after what they show —
 * a document glyph, a tile field, a callout, a ranked list — rather than after the
 * SVG they emit. Each one takes the box it has to live in and returns the shapes
 * with the moment each should appear, so density follows the space available: the
 * same call draws a 20-tile field on a phone and a 60-tile field on a laptop,
 * without the scene knowing which it is drawing.
 */

/** A static label. */
export function label(x: number, y: number, s: string, at = 0, size = 12, fill: Fill = 'ink', opts: Partial<El> = {}): El {
  return { t: 'text', x, y, s, size, fill, anim: 'fade', at, dur: 300, ...(opts as object) } as El;
}

/** A pill: rounded box plus centred label. */
export function chip(x: number, y: number, h: number, text: string, at = 0, hue?: Hue, size = 11, mono = false): El[] {
  const w = Math.max(38, text.length * size * 0.56 + 18);
  return [
    { t: 'box', x, y, w, h, r: h / 2, fill: hue ? `${hue}-soft` : 'ink-soft', stroke: hue ? `${hue}-line` : 'rule', sw: 1, anim: 'pop', at, dur: 300 },
    { t: 'text', x: x + w / 2, y: y + h / 2 + 0.5, s: text, anchor: 'middle', size, mono, anim: 'fade', at: at + 90, dur: 240 },
  ];
}

/** A card. */
export function card(x: number, y: number, w: number, h: number, at = 0, hue?: Hue): El {
  return {
    t: 'box', x, y, w, h, r: 8,
    fill: hue ? `${hue}-soft` : 'paper',
    stroke: hue ? `${hue}-line` : 'rule',
    sw: 1.1,
    anim: 'pop', at, dur: 360,
  };
}

/** A titled card with a rule under the title, the shell most panels use. */
export function panel(x: number, y: number, w: number, h: number, title: string, at = 0, hue?: Hue, sub?: string): El[] {
  const out: El[] = [
    card(x, y, w, h, at, hue),
    label(x + 11, y + 16, title, at + 120, 11.5, 'ink', { strong: true }),
  ];
  if (sub) out.push(label(x + 11, y + 30, sub, at + 200, 10, 'muted', { mono: true }));
  out.push({ t: 'line', x1: x + 11, y1: y + (sub ? 40 : 27), x2: x + w - 11, y2: y + (sub ? 40 : 27), stroke: 'rule', sw: 1, anim: 'fade', at: at + 240, dur: 280 });
  return out;
}

/** The content box inside a panel: below the title rule, inside the padding. */
export function inner(x: number, y: number, w: number, h: number, sub = false, pad = 11) {
  const top = y + (sub ? 48 : 36);
  return { x: x + pad, y: top, w: w - pad * 2, h: y + h - top - pad };
}

/** A document glyph: page, fold, and a few lines whose shape says what it is. */
export function docIcon(x: number, y: number, s: number, kind: 'text' | 'scan' | 'image', at = 0, hue: Hue = 'blue'): El[] {
  const out: El[] = [
    { t: 'box', x, y, w: s, h: s * 1.28, r: 2, fill: 'paper', stroke: `${hue}-line`, sw: 1, anim: 'pop', at, dur: 300 },
    { t: 'path', d: `M${x + s - s * 0.34},${y} L${x + s},${y + s * 0.34} L${x + s - s * 0.34},${y + s * 0.34} Z`, stroke: `${hue}-line`, sw: 1, anim: 'fade', at: at + 80, dur: 240 },
  ];
  const lw = s * 0.62;
  if (kind === 'image') {
    out.push({ t: 'box', x: x + s * 0.18, y: y + s * 0.5, w: s * 0.64, h: s * 0.5, r: 2, fill: `${hue}-soft`, stroke: `${hue}-line`, sw: 0.8, anim: 'fade', at: at + 140, dur: 240 });
    out.push({ t: 'line', x1: x + s * 0.18, y1: y + s * 1.12, x2: x + s * 0.18 + lw, y2: y + s * 1.12, stroke: `${hue}-line`, sw: 1.4, anim: 'fade', at: at + 180, dur: 220 });
  } else {
    const rows = kind === 'scan' ? 3 : 4;
    for (let i = 0; i < rows; i++) {
      out.push({
        t: 'line',
        x1: x + s * 0.18, y1: y + s * 0.52 + i * s * 0.19, x2: x + s * 0.18 + (i === rows - 1 ? lw * 0.6 : lw), y2: y + s * 0.52 + i * s * 0.19,
        stroke: `${hue}-line`, sw: 1.2, dash: kind === 'scan' && i % 2 === 0, anim: 'fade', at: at + 140 + i * 60, dur: 220,
      });
    }
  }
  return out;
}

/**
 * A field of tiles: the corpus, the chunks, the candidate pool. `mix` sets how
 * many of the three kinds; the grid fits `w x h` and never exceeds `max`.
 */
export function tileGrid(x: number, y: number, w: number, h: number, max: number, at: number, mix: 'docs' | 'chunks' | 'plain' = 'docs', seed = 7): El[] {
  const s = 9;
  const gap = 3.4;
  const step = s + gap;
  const cw = Math.max(2, Math.floor((w + gap) / step));
  const ch = Math.max(1, Math.floor((h + gap) / step));
  const n = Math.min(max, cw * ch);
  const R = rng(seed);
  const out: El[] = [];
  for (let i = 0; i < n; i++) {
    const c = i % cw;
    const r = Math.floor(i / cw);
    const k = R();
    const hue: Hue = mix === 'plain' ? 'blue' : k < 0.78 ? 'blue' : k < 0.91 ? 'amber' : 'teal';
    out.push({
      t: 'box',
      x: x + c * step, y: y + r * step, w: s, h: s, r: 2,
      fill: mix === 'plain' ? 'ink-soft' : `${hue}-line`,
      anim: 'pop', at: at + Math.round((Math.floor(i / cw) * cw + c) * 7), dur: 260,
    });
  }
  return out;
}

/** A legend: swatch and description, stacked. */
export function legend(x: number, y: number, rows: Array<{ hue?: Hue; text: string }>, at = 0, rowH = 15, size = 10): El[] {
  const out: El[] = [];
  rows.forEach((r, i) => {
    const ry = y + i * rowH;
    out.push({ t: 'box', x, y: ry - 6, w: 8, h: 8, r: 2, fill: r.hue ? `${r.hue}-line` : 'ink-soft', stroke: r.hue ? `${r.hue}-line` : 'rule', sw: 0.8, anim: 'fade', at: at + i * 70, dur: 240 });
    out.push(label(x + 13, ry - 2, r.text, at + 40 + i * 70, size, 'muted'));
  });
  return out;
}

/** A horizontal legend, for a wide box with room under a diagram. */
export function legendRow(x: number, y: number, rows: Array<{ hue?: Hue; text: string }>, at = 0, step?: number): El[] {
  const out: El[] = [];
  let cursor = x;
  rows.forEach((r, i) => {
    out.push({ t: 'box', x: cursor, y: y - 6, w: 8, h: 8, r: 2, fill: r.hue ? `${r.hue}-line` : 'ink-soft', stroke: r.hue ? `${r.hue}-line` : 'rule', sw: 0.8, anim: 'fade', at: at + i * 90, dur: 240 });
    out.push(label(cursor + 13, y - 2, r.text, at + 40 + i * 90, 10, 'muted'));
    cursor += step ?? 13 + r.text.length * 5.6 + 22;
  });
  return out;
}

/** A callout box: a titled aside with two or three lines of detail. */
export function callout(x: number, y: number, w: number, h: number, title: string, lines: Array<[string, string]>, at = 0, hue: Hue = 'amber'): El[] {
  const out: El[] = [
    { t: 'box', x, y, w, h, r: 8, fill: `${hue}-soft`, stroke: `${hue}-line`, sw: 1, anim: 'rise', at, dur: 400 },
    label(x + 12, y + 17, title, at + 120, 11.5, 'ink', { strong: true }),
  ];
  lines.slice(0, 3).forEach(([k, v], i) => {
    const ly = y + 38 + i * 17;
    if (ly < y + h - 6) {
      out.push(label(x + 12, ly, k, at + 200 + i * 90, 10.5, 'muted'));
      out.push(label(x + w - 12, ly, v, at + 240 + i * 90, 10.5, 'ink', { anchor: 'end', strong: true }));
    }
  });
  return out;
}

/** An arrow with a label over its middle, the way the reference links columns. */
export function arrowLabel(x1: number, y1: number, x2: number, y2: number, text: string, at = 0, hue?: Hue): El[] {
  return [
    { t: 'line', x1, y1, x2, y2, stroke: hue ? `${hue}-line` : 'rule', sw: 1.4, arrow: true, anim: 'draw', at, dur: 340 },
    label((x1 + x2) / 2, Math.min(y1, y2) - 8, text, at + 160, 10, 'muted', { anchor: 'middle' }),
  ];
}

/** A vertical connector, for stacked layouts where the arrow goes downward. */
export function arrowDown(x: number, y1: number, y2: number, text: string, at = 0): El[] {
  return [
    { t: 'line', x1: x, y1, x2: x, y2, stroke: 'rule', sw: 1.4, arrow: true, anim: 'draw', at, dur: 320 },
    label(x + 6, (y1 + y2) / 2, text, at + 140, 10, 'muted'),
  ];
}

/** Rows of `key value` pairs, the shape of every table in the sequence. */
export function keyRows(x: number, y: number, w: number, rows: Array<[string, string]>, at = 0, rowH = 16, size = 10.5, valueHue?: Hue): El[] {
  const out: El[] = [];
  rows.forEach(([k, v], i) => {
    const ry = y + i * rowH;
    out.push(label(x, ry, k, at + i * 80, size, 'muted', { mono: true }));
    out.push(label(x + w, ry, v, at + 60 + i * 80, size, valueHue ? `${valueHue}-soft` : 'ink', { anchor: 'end' }));
  });
  return out;
}

/** A list of chunk ids, with the ones in both retrievers picked out. */
export function rankList(x: number, y: number, w: number, items: Array<{ id: string; score: string; both?: boolean }>, at = 0, hue?: Hue, rowH = 18, size = 10.5): El[] {
  const out: El[] = [];
  items.forEach((it, i) => {
    const ry = y + i * rowH;
    if (it.both) out.push({ t: 'box', x: x - 6, y: ry - 8, w: w + 12, h: rowH - 3, r: 4, fill: hue ? `${hue}-soft` : 'ink-soft', stroke: hue ? `${hue}-line` : 'rule', sw: 0.8, anim: 'fade', at: at + i * 70 + 220, dur: 260 });
    out.push(label(x, ry, String(i + 1), at + i * 70, size, 'faint', { mono: true }));
    out.push(label(x + 16, ry, it.id, at + i * 70 + 40, size, 'ink', { mono: true }));
    out.push(label(x + w, ry, it.score, at + i * 70 + 70, size, 'muted', { anchor: 'end', mono: true }));
  });
  return out;
}

/**
 * A layered index: the top layer sparse, the bottom dense, with a greedy walk
 * through it. This is the picture the HNSW step turns on.
 */
export function layers(x: number, y: number, w: number, h: number, at: number, seed = 11): El[] {
  const out: El[] = [];
  const R = rng(seed);
  const n = 3;
  const rowH = h / n;
  const counts = [4, 7, 11];
  const pts: Array<Array<[number, number]>> = [];
  for (let r = 0; r < n; r++) {
    const cnt = counts[Math.min(r, counts.length - 1)];
    const row: Array<[number, number]> = [];
    for (let i = 0; i < cnt; i++) {
      const px = x + 12 + ((w - 24) * (i + 0.5)) / cnt;
      const py = y + rowH * r + rowH * 0.5;
      row.push([px + (R() - 0.5) * 6, py]);
      out.push({ t: 'circle', cx: px + (R() - 0.5) * 6, cy: py, r: 3, fill: r === 0 ? 'blue-line' : 'ink-soft', stroke: r === 0 ? 'blue-line' : 'rule', sw: 0.8, anim: 'pop', at: at + r * 420 + i * 26, dur: 260 });
    }
    pts.push(row);
  }
  // The walk: top layer, then down a layer, then the widened beam at the bottom.
  const walk: Array<[number, number]> = [
    [pts[0][0][0], pts[0][0][1]],
    [pts[0][Math.min(2, pts[0].length - 1)][0], pts[0][Math.min(2, pts[0].length - 1)][1]],
    [pts[1][Math.min(3, pts[1].length - 1)][0], pts[1][Math.min(3, pts[1].length - 1)][1]],
    [pts[2][Math.min(5, pts[2].length - 1)][0], pts[2][Math.min(5, pts[2].length - 1)][1]],
  ];
  for (let i = 0; i < walk.length - 1; i++) {
    out.push({ t: 'line', x1: walk[i][0], y1: walk[i][1], x2: walk[i + 1][0], y2: walk[i + 1][1], stroke: 'amber-line', sw: 1.6, anim: 'draw', at: at + 900 + i * 260, dur: 320 });
  }
  out.push({ t: 'circle', cx: walk[walk.length - 1][0], cy: walk[walk.length - 1][1], r: 6.5, fill: 'none' as Fill, stroke: 'amber', sw: 1.8, anim: 'pop', at: at + 1900, dur: 320 });
  return out;
}

/** A small property graph: typed edges between named nodes. */
export function graph(x: number, y: number, w: number, h: number, nodes: Array<{ id: string; hue?: Hue; label: string }>, edges: Array<[number, number, string]>, at = 0): El[] {
  const out: El[] = [];
  const cx = (i: number) => x + w * (0.16 + 0.68 * (i % 3) / 2);
  const cy = (i: number) => y + h * (0.18 + 0.64 * Math.floor(i / 3) / 1);
  edges.forEach(([a, b, kind], i) => {
    const dx = cx(b) - cx(a);
    const dy = cy(b) - cy(a);
    const len = Math.hypot(dx, dy) || 1;
    // Sit each label beside its own edge, alternating sides: the midpoint of a
    // straight line between two nodes is usually another node's label.
    const off = 12 * (i % 2 === 0 ? 1 : -1);
    const ex = (cx(a) + cx(b)) / 2 + (-dy / len) * off;
    const ey = (cy(a) + cy(b)) / 2 + (dx / len) * off;
    out.push({ t: 'line', x1: cx(a), y1: cy(a), x2: cx(b), y2: cy(b), stroke: 'violet-line', sw: 1.2, arrow: true, anim: 'draw', at: at + 260 + i * 130, dur: 320 });
    out.push(label(ex, ey, kind, at + 380 + i * 130, 8.5, 'muted', { anchor: 'middle', mono: true }));
  });
  nodes.forEach((nd, i) => {
    const r = Math.max(16, Math.min(30, w / 7));
    out.push({ t: 'circle', cx: cx(i), cy: cy(i), r, fill: `${nd.hue ?? 'violet'}-soft`, stroke: `${nd.hue ?? 'violet'}-line`, sw: 1.1, anim: 'pop', at: at + i * 110, dur: 300 });
    out.push(label(cx(i), cy(i), nd.id, at + 80 + i * 110, 9.5, 'ink', { anchor: 'middle', strong: true }));
  });
  return out;
}

/** The query path: horizontal lanes, each with a duration bar. */
export function timeline(x: number, y: number, w: number, h: number, rows: Array<{ name: string; share: number; note: string; hue?: Hue }>, at = 0): El[] {
  const out: El[] = [];
  const rowH = h / rows.length;
  rows.forEach((r, i) => {
    const ry = y + i * rowH;
    out.push(label(x, ry, r.name, at + i * 90, 11, 'ink'));
    out.push(label(x + w, ry, r.note, at + 130 + i * 90, 9.5, 'muted', { anchor: 'end', mono: true }));
    out.push({ t: 'box', x, y: ry + 6, w: w, h: 5, r: 3, fill: 'ink-soft', stroke: 'rule', sw: 0.8, anim: 'fade', at: at + i * 90 + 60, dur: 220 });
    out.push({ t: 'box', x, y: ry + 6, w: Math.max(6, w * r.share), h: 5, r: 3, fill: r.hue ? `${r.hue}-line` : 'blue-line', anim: 'growx', at: at + i * 90 + 140, dur: 480 });
  });
  return out;
}

/** A proportional bar: track, then the fill that grows along it. */
export function bar(x: number, y: number, w: number, h: number, share: number, at: number, hue?: Hue): El[] {
  return [
    { t: 'box', x, y, w, h, r: h / 2, fill: 'ink-soft', stroke: 'rule', sw: 0.8, anim: 'fade', at, dur: 240 },
    { t: 'box', x, y, w: Math.max(4, w * share), h, r: h / 2, fill: hue ? `${hue}-line` : 'blue-line', anim: 'growx', at: at + 140, dur: 560 },
  ];
}

/** A stacked share bar with a legend under it, for proportions across kinds. */
export function shareBar(x: number, y: number, w: number, h: number, segs: Array<{ name: string; short?: string; share: number; hue?: Hue }>, at: number, size = 10): El[] {
  const out: El[] = [];
  const advance = (t: string) => t.length * size * 0.55;
  const total = (names: string[]) => names.reduce((a, n) => a + advance(n) + 6, 0);
  let names = segs.map((s) => s.name);
  if (size > 0 && total(names) > w) names = segs.map((s, i) => s.short ?? names[i]);
  if (size > 0 && total(names) > w) names = segs.map((n, i) => (i === 0 || i === segs.length - 1 ? n : ''));
  const last = segs.length - 1;
  let cursor = x;
  let prevEnd = -Infinity;
  segs.forEach((s, i) => {
    const sw = w * s.share;
    out.push({ t: 'box', x: cursor, y, w: Math.max(3, sw - 3), h, r: 3, fill: s.hue ? `${s.hue}-line` : 'ink-soft', stroke: 'rule', sw: 0.8, anim: 'growx', at: at + i * 130, dur: 480 });
    const nm = names[i];
    if (size > 0 && nm) {
      const lw = advance(nm);
      const lx = i === last ? Math.min(cursor, x + w - lw) : cursor;
      if (lx >= prevEnd + 5) {
        out.push(label(lx, y + h + 12, nm, at + 60 + i * 130, size, 'muted'));
        prevEnd = lx + lw;
      }
    }
    cursor += sw;
  });
  return out;
}

/** The one number a column turns on: a title, a rolling count, a subtitle. */
export function stat(x: number, y: number, w: number, title: string, to: number, sub: string, at: number, size = 26, unit?: string): El[] {
  // The parameter is `unit`, not `label`: naming it `label` shadows the helper above,
  // and the shadowing only breaks at the moment a scene passes the ninth argument.
  return [
    label(x, y, title, at - 240, 11.5, 'muted'),
    { t: 'count', x, y: y + size * 0.95, from: 0, to, size, at, dur: 1600, label: unit },
    label(x, y + size * 0.95 + (unit ? 34 : 16), sub, at + 400, 10, 'muted'),
  ];
}
