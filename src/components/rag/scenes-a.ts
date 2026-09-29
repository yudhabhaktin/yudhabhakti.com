import { chip, chipRow, panel } from './helpers';
import { cols, stack, type El, type Scene, type Stage } from './types';

/**
 * The first four steps: what lands in the corpus, how copies are removed, how the
 * cheap parsers are tried before the expensive one, and how a document is split.
 *
 * Every scene measures itself from the stage box it is handed, which is why the
 * same code stacks on a phone and forms rows on a laptop.
 */

const corpus: Scene = {
  id: 'corpus',
  title: 'The corpus',
  sum: '100,000 documents in a dozen formats, with no common structure.',
  dur: 10000,
  phases: [
    { at: 0, label: 'Files land', cap: 'Documents arrive from drives, wikis, mailboxes and scanners. Nothing has been cleaned yet.' },
    { at: 3600, label: 'Formats are mixed', cap: 'Born-digital PDFs, <b>scans</b>, HTML pages, spreadsheets and mail exports sit side by side. That mix decides the parsing budget.' },
    { at: 6200, label: '100,000 documents', cap: 'The corpus is fixed first: page count, format share and language mix become the denominator every later claim is measured against.' },
  ],
  els(st: Stage): El[] {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const cn = tall ? 4 : 8, rn = 3, gap = 6;
    const areaH = (H - 2 * pad) * (tall ? 0.46 : 0.56);
    const tw = (W - 2 * pad - (cn - 1) * gap) / cn;
    const th = (areaH - (rn - 1) * gap) / rn;
    const N = cn * rn;
    for (let i = 0; i < N; i++) {
      const c = i % cn, r = Math.floor(i / cn), at = 120 + i * 70;
      const x = pad + c * (tw + gap), y = pad + r * (th + gap);
      out.push({ t: 'box', x, y, w: tw, h: th, r: 6, fill: 'ink-soft', stroke: 'rule', sw: 1, anim: 'pop', at, dur: 420 });
      for (let k = 0; k < 3; k++) {
        out.push({
          t: 'box', x: x + tw * 0.16, y: y + th * (0.3 + k * 0.2), w: tw * (k === 2 ? 0.4 : 0.66),
          h: Math.max(2, th * 0.07), r: 2, fill: i % 5 === 0 ? 'accent' : 'faint', anim: 'growx', at: at + 140 + k * 40, dur: 300,
        });
      }
    }
    out.push(...chipRow(pad, pad + areaH + 12, tall ? 3 : 5, 26, 6, [
      ['PDF 62k', 'accent'], ['Scan 14k', 'ink'], ['HTML 12k', 'ink'], ['Sheet 8k', 'ink'], ['Mail 4k', 'ink'],
    ], 3500, 90));
    // Anchored to the bottom edge, not to the grid: a short stage has to keep it.
    out.push({ t: 'count', x: pad, y: H - pad - (tall ? 28 : 36) * 0.9 - 10, from: 0, to: 100000, size: tall ? 28 : 36, fill: 'ink', at: 6100, dur: 3200, label: 'documents in the corpus' });
    return out;
  },
};

const manifest: Scene = {
  id: 'manifest',
  title: 'Manifest and dedupe',
  sum: 'Hash every file, then drop the copies before anything is parsed.',
  dur: 10000,
  phases: [
    { at: 0, label: 'Hash every file', cap: 'A content hash per file turns "similar" into "identical". Filenames and timestamps are not trustworthy.' },
    { at: 3400, label: 'Copies collapse', cap: 'A typical corpus carries <b>8-15%</b> duplicates: shared drives, re-exports, the same PDF mailed twice.' },
    { at: 6400, label: 'The manifest', cap: 'What survives is a manifest of unique documents with source path, hash and parse status. Everything downstream counts from here.' },
  ],
  els(st: Stage): El[] {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const n = 6, gap = 8, cn = tall ? 3 : 6, rn = tall ? 2 : 1;
    const areaH = (H - 2 * pad) * (tall ? 0.42 : 0.5);
    const tw = (W - 2 * pad - (cn - 1) * gap) / cn;
    const th = (areaH - (rn - 1) * gap) / rn;
    const hashes = ['3f9a', '7c21', 'a04e', 'b7d3', '7c21', 'b7d3'];
    const dupe = new Set([1, 4]);
    for (let i = 0; i < n; i++) {
      const c = i % cn, r = Math.floor(i / cn), at = 100 + i * 90;
      const x = pad + c * (tw + gap), y = pad + r * (th + gap);
      const isDupe = dupe.has(i);
      out.push({
        t: 'box', x, y, w: tw, h: th, r: 6, fill: isDupe ? 'accent-soft' : 'ink-soft',
        stroke: isDupe ? 'accent-line' : 'rule', sw: 1, anim: 'pop', at, dur: 380,
      });
      out.push({ t: 'text', x: x + 6, y: y + 13, s: `#${hashes[i]}`, size: 11, mono: true, fill: isDupe ? 'accent' : 'muted', anim: 'fade', at: at + 160, dur: 240 });
      for (let k = 0; k < 2; k++) {
        out.push({ t: 'box', x: x + 6, y: y + 24 + k * 9, w: tw * (k ? 0.4 : 0.62), h: 3, r: 2, fill: 'faint', anim: 'growx', at: at + 220 + k * 50, dur: 260 });
      }
      if (isDupe) out.push({ t: 'text', x: x + tw - 6, y: y + 13, s: 'copy', anchor: 'end', size: 10.5, fill: 'accent', anim: 'fade', at: 3600 + i * 120, dur: 260 });
    }
    const by = pad + areaH + 16;
    out.push(...chip(pad, by, 26, 'duplicates dropped', 'accent-soft', 'accent-line', 6100));
    const barY = by + 44, barW = W - 2 * pad;
    out.push({ t: 'box', x: pad, y: barY, w: barW, h: 14, r: 7, fill: 'ink-soft', stroke: 'rule', sw: 1, anim: 'fade', at: 2400, dur: 300 });
    out.push({ t: 'box', x: pad, y: barY, w: barW * 0.884, h: 14, r: 7, fill: 'accent', anim: 'growx', at: 6500, dur: 2200 });
    out.push({ t: 'count', x: pad, y: barY + 32, from: 100000, to: 88412, size: 13, fill: 'muted', at: 6600, dur: 2200, label: 'unique documents kept' });
    return out;
  },
};

const parsing: Scene = {
  id: 'parsing',
  title: 'Tiered parsing',
  sum: 'Text layer first, OCR second, a vision model only where it pays.',
  dur: 11000,
  phases: [
    { at: 0, label: 'Try the text layer', cap: 'About <b>71%</b> of a mixed corpus still carries a real text layer. Extracting it is instant and free, so it goes first.' },
    { at: 3700, label: 'Fall back to OCR', cap: 'Scanned pages go to OCR: roughly <b>2 seconds a page</b>, and quality collapses on rotated or low-contrast scans.' },
    { at: 7400, label: 'Escalate to vision', cap: 'Only pages OCR mangles — tables, stamps, handwriting — reach a vision model at <b>20+ seconds and real cost</b>. Routing is the whole trick.' },
  ],
  els(st: Stage): El[] {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const qn = tall ? 4 : 6, gap = 6, qh = 34;
    const c = cols(pad, W - 2 * pad, qn, gap);
    for (let i = 0; i < qn; i++) {
      out.push({ t: 'box', x: c.x(i), y: pad, w: c.col, h: qh, r: 5, fill: 'ink-soft', stroke: 'rule', sw: 1, anim: 'pop', at: 100 + i * 70, dur: 360 });
    }
    out.push({ t: 'text', x: pad, y: pad + qh + 14, s: 'incoming documents', size: 11.5, fill: 'muted', anim: 'fade', at: 900, dur: 300 });
    const lanes: [string, string, string, number][] = [
      ['Text layer', '71% · instant', '71,000 docs', 0.71],
      ['OCR', '22% · ~2s a page', '22,000 docs', 0.22],
      ['Vision model', '7% · 20s a page', '7,000 docs', 0.07],
    ];
    const top = pad + qh + 26;
    const rows = stack(top, H - pad - top, 3, 8);
    lanes.forEach(([name, cost, volume, share], i) => {
      const at = 1600 + i * 1400, y = rows.y(i), x = pad, w = W - 2 * pad;
      out.push(...panel(x, y, w, rows.row, name, i === 2, at, 380));
      out.push(...chip(x + 10, y + 30, 20, cost, 'ink-soft', 'rule', at + 260, 11));
      out.push({ t: 'text', x: x + w - 10, y: y + 40, s: volume, anchor: 'end', size: 12, fill: 'muted', anim: 'fade', at: at + 900, dur: 300 });
      const dotN = Math.max(4, Math.round(share * 14));
      const dw = (w - 24) / 14;
      for (let k = 0; k < dotN; k++) {
        out.push({
          t: 'box', x: x + 12 + k * dw, y: y + rows.row - 20, w: dw * 0.66, h: 9, r: 3,
          fill: i === 2 ? 'accent' : 'ink', anim: 'growy', at: at + 700 + k * 45, dur: 320,
        });
      }
    });
    return out;
  },
};

const chunking: Scene = {
  id: 'chunking',
  title: 'Structure-aware chunking',
  sum: 'Split on headings and tables, never mid-sentence, with overlap.',
  dur: 10000,
  phases: [
    { at: 0, label: 'Split on structure', cap: 'Chunks follow the document hierarchy: a heading keeps its section, a paragraph stays whole. Fixed 512-token windows cut sentences in half and hurt retrieval.' },
    { at: 3300, label: 'Keep tables whole', cap: 'A table is one chunk even when it exceeds the budget: split the header from its rows and both halves become unanswerable.' },
    { at: 6600, label: 'Overlap the edges', cap: 'A <b>60-token</b> overlap carries the sentence that straddles the boundary, so a fact cut in two is still retrievable from one chunk.' },
  ],
  els(st: Stage): El[] {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const pageH = (H - 2 * pad) * (tall ? 0.3 : 0.34);
    out.push({ t: 'box', x: pad, y: pad, w: W - 2 * pad, h: pageH, r: 8, fill: 'panel', stroke: 'rule', sw: 1, anim: 'fade', at: 0, dur: 300 });
    out.push({ t: 'text', x: pad + 10, y: pad + 15, s: 'annual-report-2024.pdf · page 41', size: 11, mono: true, fill: 'muted', anim: 'fade', at: 150, dur: 300 });
    const rows: [number, number][] = [[0.18, 0], [0.28, 0], [0.28, 0], [0.34, 1], [0.2, 0]];
    let yy = pad + 26;
    rows.forEach(([w, isTable], i) => {
      out.push({
        t: 'box', x: pad + 12, y: yy, w: (W - 2 * pad - 24) * w * 1.7, h: 6, r: 3,
        fill: isTable ? 'accent' : i === 0 ? 'ink' : 'faint', anim: 'growx', at: 200 + i * 110, dur: 320,
      });
      yy += 13;
    });
    const cTop = pad + pageH + 16, cAvail = H - pad - cTop;
    const labels: [string, string, number, boolean][] = [
      ['§ 3.2 heading', 'ink', 40, false],
      ['para · 180 tok', 'muted', 180, false],
      ['para · 210 tok', 'muted', 210, false],
      ['table · 512 tok', 'accent', 512, true],
      ['para · 120 tok', 'muted', 120, false],
    ];
    const rowsC = stack(cTop, cAvail, labels.length, 6);
    labels.forEach(([label, tone, tokens, isTable], i) => {
      const at = 1500 + i * 500, y = rowsC.y(i);
      out.push({
        t: 'box', x: pad, y, w: W - 2 * pad, h: rowsC.row, r: 6,
        fill: isTable ? 'accent-soft' : 'ink-soft', stroke: isTable ? 'accent-line' : 'rule', sw: 1, anim: 'rise', at, dur: 380,
      });
      out.push({ t: 'text', x: pad + 10, y: y + rowsC.row / 2, s: label, size: 12, fill: tone as 'ink', anim: 'fade', at: at + 140, dur: 240 });
      out.push({ t: 'text', x: W - pad - 10, y: y + rowsC.row / 2, s: `${tokens} tok`, anchor: 'end', size: 11, fill: 'faint', anim: 'fade', at: at + 200, dur: 240 });
      if (i > 0 && i < labels.length - 1) {
        out.push({ t: 'box', x: pad + 2, y: y - 3, w: (W - 2 * pad) * 0.5, h: 3, r: 2, fill: 'accent', anim: 'growx', at: 6800 + i * 250, dur: 500 });
      }
    });
    return out;
  },
};

export const SCENES_A: Scene[] = [corpus, manifest, parsing, chunking];
