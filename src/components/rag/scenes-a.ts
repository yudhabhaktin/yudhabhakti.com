import { bar, card, chip, docCard, label, lane, shareBar } from './helpers';
import { cols, fit, stack, type El, type Scene, type Stage } from './types';

/**
 * Steps 1-4. Each scene is a pure function of the stage box: it reads the width
 * and height it has been given and lays itself out, so the same scene is a stack
 * on a phone and a row on a laptop without a second code path.
 *
 * Sparse on purpose. A stage 337 px wide can hold about fifteen shapes before it
 * stops being a diagram and starts being noise, so each step draws one idea:
 * a count, a bar, three lanes.
 */

/** Shared header: the one number a scene turns on. */
function counter(st: Stage, to: number, lab: string, at: number, size?: number): El[] {
  const s = size ?? (st.tall ? 30 : 32);
  return [{ t: 'count', x: st.pad, y: st.pad + s * 0.72, from: 0, to, size: s, at, dur: 2200, label: lab }];
}

export const corpus: Scene = {
  id: 'corpus',
  title: 'The corpus',
  sum: 'Everything the company knows, in whatever format it happens to be in.',
  dur: 8200,
  phases: [
    { label: 'Ingest', cap: 'Three sources, three formats, no shared schema.', at: 0 },
    { label: 'Formats', cap: 'Text, scans and HTML behave differently downstream.', at: 1900 },
    { label: 'Scale', cap: '100,000 documents is a number nobody can hold in their head.', at: 3700 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [...counter(st, 100000, 'documents in the corpus', 3700)];
    const top = pad + (tall ? 30 : 32) * 0.72 + 46;
    const bottom = H - pad - 52;
    const docs = [
      { name: 'structured text', tag: 'policy_pdf' },
      { name: 'scanned pages', tag: 'scan_tiff' },
      { name: 'intranet pages', tag: 'intranet_html' },
    ];
    if (tall) {
      const rows = stack(top, bottom - top, docs.length, 8);
      docs.forEach((d, i) => out.push(...docCard(pad, rows.y(i), W - pad * 2, rows.row, d.name, d.tag, 120 + i * 170)));
    } else {
      const c = cols(pad, W - pad * 2, docs.length, 12);
      docs.forEach((d, i) => out.push(...docCard(c.x(i), top, c.col, bottom - top, d.name, d.tag, 120 + i * 170)));
    }
    out.push(...shareBar(pad, H - pad - 34, W - pad * 2, 11, [
      { name: 'text layer', short: 'text', share: 0.6 },
      { name: 'OCR', share: 0.26 },
      { name: 'vision', short: 'vision', share: 0.09 },
      { name: 'other', share: 0.05 },
    ], 1900));
    return out;
  },
};

export const manifest: Scene = {
  id: 'manifest',
  title: 'Manifest and dedupe',
  sum: 'Hash every file at ingest, collapse the copies, keep one number.',
  dur: 8200,
  phases: [
    { label: 'Hash', cap: 'Every file gets a hash before anything else happens.', at: 0 },
    { label: 'Collapse', cap: 'Two of these six are the same document wearing different names.', at: 1500 },
    { label: 'Count', cap: 'Dedupe is where the corpus number stops being a lie.', at: 3300 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [...counter(st, 88412, 'unique documents kept', 3300, tall ? 28 : 30)];
    const top = pad + (tall ? 28 : 30) * 0.72 + 50;
    const bottom = H - pad - 56;
    const n = tall ? 4 : 6;
    const files = ['refunds.pdf', 'refunds (1).pdf', 'invoices.xlsx', 'handbook.docx', 'handbook copy.docx', 'suppliers.csv'];
    const dupes = [1, 4];
    if (tall) {
      const rows = stack(top, (bottom - top) * 0.72, n, 7);
      for (let i = 0; i < n; i++) {
        out.push(card(pad, rows.y(i), W - pad * 2, rows.row, 120 + i * 130));
        out.push(label(pad + 11, rows.y(i) + rows.row / 2, files[i], 240 + i * 130, 11.5));
        if (dupes.includes(i)) out.push(label(W - pad - 11, rows.y(i) + rows.row / 2, 'same hash', 1500 + i * 130, 10.5, 'accent', { anchor: 'end' }));
      }
    } else {
      const c = cols(pad, W - pad * 2, 3, 12);
      const rows = stack(top, (bottom - top) * 0.62, 2, 10);
      files.forEach((f, i) => {
        const x = c.x(i % 3);
        const y = rows.y(Math.floor(i / 3));
        out.push(card(x, y, c.col, rows.row, 120 + i * 110));
        out.push(label(x + 11, y + rows.row / 2, fit(f, c.col - 70, 11.5), 240 + i * 110, 11.5));
        if (dupes.includes(i)) out.push(label(x + c.col - 11, y + rows.row / 2, 'same hash', 1500 + i * 110, 10.5, 'accent', { anchor: 'end' }));
      });
    }
    out.push(...shareBar(pad, H - pad - 32, W - pad * 2, 11, [
      { name: 'kept', share: 0.884 },
      { name: 'dropped', short: 'dup', share: 0.116 },
    ], 3300));
    return out;
  },
};

export const parsing: Scene = {
  id: 'parsing',
  title: 'Tiered parsing',
  sum: 'Spend the expensive model only on the pages that need it.',
  dur: 8000,
  phases: [
    { label: 'Cheap tier', cap: 'The text layer is free, and it covers most of the corpus.', at: 0 },
    { label: 'OCR', cap: 'Scanned pages go through OCR, which is slow but predictable.', at: 1100 },
    { label: 'Vision', cap: 'Diagrams, tables and stamps go to a vision model. This is the 6%.', at: 2300 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const lanes = [
      { title: 'text layer', share: 0.71, volume: '71,000 docs', accent: false },
      { title: 'OCR', share: 0.22, volume: '22,000 docs', accent: false },
      { title: 'vision model', share: 0.07, volume: '7,000 docs', accent: true },
    ];
    const top = pad + 34;
    const bottom = H - pad - 40;
    const heights = 64;
    const gap = tall ? 12 : 14;
    if (tall) {
      const rows = stack(top, Math.min(bottom - top, lanes.length * heights + (lanes.length - 1) * gap), lanes.length, gap);
      lanes.forEach((l, i) => out.push(...lane(pad, rows.y(i), W - pad * 2, heights, l.title, l.share, l.volume, 120 + i * 1050, l.accent)));
    } else {
      const c = cols(pad, W - pad * 2, lanes.length, 14);
      lanes.forEach((l, i) => out.push(...lane(c.x(i), top, c.col, heights, l.title, l.share, l.volume, 120 + i * 1050, l.accent)));
    }
    out.push(label(pad, H - pad - 16, 'tier by signal, not by confidence', 3200, 11.5, 'muted'));
    return out;
  },
};

export const chunking: Scene = {
  id: 'chunking',
  title: 'Structure-aware chunking',
  sum: 'Split on the document structure, not on a character count.',
  dur: 8000,
  phases: [
    { label: 'Structure', cap: 'One parsed document, with its headings and its table intact.', at: 0 },
    { label: 'Chunks', cap: 'Chunks follow sections. The table stays whole.', at: 1500 },
    { label: 'Overlap', cap: 'A little overlap, so a sentence cut in half is still findable.', at: 3600 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const pageH = tall ? 96 : 84;
    const top = pad + 26;
    out.push(card(pad, top, W - pad * 2, pageH, 80));
    out.push(label(pad + 12, top + 16, 'Refunds and returns', 200, 12, 'ink', { strong: true }));
    out.push({ t: 'line', x1: pad + 12, y1: top + 27, x2: pad + W - pad * 2 - 12, y2: top + 27, stroke: 'rule', sw: 1, anim: 'fade', at: 240, dur: 300 });
    ['4.1 Eligibility', '4.2 Refunds', 'Table 3: refund paths'].forEach((s, i) => {
      out.push(label(pad + 12, top + 44 + i * 17, s, 320 + i * 140, 11.5, 'muted'));
    });
    const chunksTop = top + pageH + 18;
    const rows = stack(chunksTop, H - pad - 12 - chunksTop, 4, 7);
    const names = ['§4.1 eligibility', '§4.2 refunds', 'Table 3', '§4.3 exchanges'];
    const tokens = ['142 tokens', '318 tokens', '96 tokens', '176 tokens'];
    names.forEach((n, i) => {
      out.push(card(pad, rows.y(i), W - pad * 2, rows.row, 1500 + i * 260));
      out.push(label(pad + 11, rows.y(i) + rows.row / 2, n, 1640 + i * 260, 11.5));
      out.push(label(W - pad - 11, rows.y(i) + rows.row / 2, tokens[i], 1700 + i * 260, 10.5, 'muted', { anchor: 'end' }));
    });
    out.push({ t: 'box', x: pad + 4, y: rows.y(1) - 3, w: W - pad * 2 - 8, h: 4, r: 2, fill: 'accent', anim: 'growx', at: 3700, dur: 500 });
    out.push({ t: 'box', x: pad + 4, y: rows.y(2) - 3, w: W - pad * 2 - 8, h: 4, r: 2, fill: 'accent', anim: 'growx', at: 3950, dur: 500 });
    return out;
  },
};

export const SCENES_A: Scene[] = [corpus, manifest, parsing, chunking];
