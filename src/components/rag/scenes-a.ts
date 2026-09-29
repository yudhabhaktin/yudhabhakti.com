import { arrowDown, arrowLabel, bar, callout, card, chip, docIcon, keyRows, label, legend, legendRow, panel, inner, shareBar, stat, tileGrid } from './helpers';
import { clamp, cols, fit, stack, type El, type Scene, type Stage } from './types';

/**
 * Steps 1-4: the corpus and the road from documents to chunks.
 *
 * Each scene draws the same information the reference does — the counts, the kinds,
 * the callouts — but as a function of the box it was handed. A wide stage gets the
 * three-column picture; a phone gets the same three numbers side by side with one
 * shared field under them and the callout below. Nothing is dropped, only arranged.
 */

const CALL_H = 62;

/** The three headline numbers, wide: a column each with its own picture. */
function corpusWide(st: Stage, out: El[]) {
  const { W, H, pad } = st;
  const top = pad + 6;
  const bodyH = H - pad - CALL_H - 20 - top;
  const c = cols(pad, W - pad * 2, 3, 14);
  const titles = ['Documents', 'Pages', 'Chunks'];
  const counts = [100000, 1500000, 2000000];
  const subs = ['~15 pages each', 'layout · OCR · vision captions', '~400 tokens · tables kept whole'];
  titles.forEach((t, i) => {
    out.push(...panel(c.x(i), top, c.col, bodyH, t, 120 + i * 140, undefined, subs[i]));
  });
  // Documents: a field of glyphs, then the kind split.
  out.push(...tileGrid(c.x(0) + 11, inner(c.x(0), top, c.col, bodyH, true).y, c.col - 22, bodyH * 0.34, 48, 300, 'docs', 7));
  out.push(...legend(c.x(0) + 11, top + bodyH * 0.62, [
    { hue: 'blue', text: 'text-native PDF / Office · ~70%' },
    { hue: 'amber', text: 'scanned PDF · ~20%' },
    { hue: 'teal', text: 'image only · ~10%' },
  ], 900));
  // Pages: stacked sheets.
  const pi = inner(c.x(1), top, c.col, bodyH, true);
  for (let i = 0; i < 10; i++) {
    out.push({
      t: 'box', x: pi.x + 16 + (i % 2) * 4, y: pi.y + pi.h * 0.62 - i * (pi.h * 0.055), w: pi.w - 40, h: 3.2, r: 1.6,
      fill: 'blue-line', anim: 'rise', at: 700 + i * 70, dur: 300,
    });
  }
  out.push(...legend(pi.x, top + bodyH * 0.78, [
    { hue: 'blue', text: 'text layer · layout model' },
    { hue: 'amber', text: 'OCR with confidence' },
    { hue: 'teal', text: 'vision caption' },
  ], 1200));
  // Chunks: a field, one tile per ~400 tokens.
  const ci = inner(c.x(2), top, c.col, bodyH, true);
  out.push(...tileGrid(ci.x, ci.y + 6, ci.w, bodyH * 0.42, 60, 900, 'chunks', 13));
  out.push(...legend(ci.x, top + bodyH * 0.72, [
    { hue: 'blue', text: 'body text' },
    { hue: 'amber', text: 'table' },
    { hue: 'teal', text: 'figure caption' },
  ], 1400));
  out.push(...arrowLabel(c.x(0) + c.col + 2, top + bodyH * 0.4, c.x(1) - 2, top + bodyH * 0.4, '× 15', 520));
  out.push(...arrowLabel(c.x(1) + c.col + 2, top + bodyH * 0.4, c.x(2) - 2, top + bodyH * 0.4, 'chunk', 820));
}

/** The same three numbers on a phone: side by side, one field, one callout. */
function corpusTall(st: Stage, out: El[]) {
  const { W, H, pad } = st;
  const top = pad + 4;
  const innerW = W - pad * 2;
  const c = cols(pad, innerW, 3, 8);
  const titles = ['documents', 'pages', 'chunks'];
  const counts = [100000, 1500000, 2000000];
  titles.forEach((t, i) => {
    out.push(label(c.x(i), top + 10, t, 120 + i * 120, 10.5, 'muted'));
    out.push({ t: 'count', x: c.x(i), y: top + 36, from: 0, to: counts[i], size: c.col > 96 ? 20 : 18, at: 300 + i * 260, dur: 1500 });
  });
  const fieldTop = top + 54;
  const fieldH = Math.max(34, H * 0.16);
  out.push(...tileGrid(pad, fieldTop, innerW, fieldH, 40, 300, 'chunks', 5));
  const legY = fieldTop + fieldH + 16;
  out.push(...legendRow(pad, legY, [
    { hue: 'blue', text: 'text' },
    { hue: 'amber', text: 'table' },
    { hue: 'teal', text: 'figure' },
  ], 900));
  const callY = H - pad - CALL_H;
  out.push(...callout(pad, callY, innerW, CALL_H, 'Where the money goes', [
    ['Embedding ~700M tokens', '≈ $15–100'],
    ['Parsing 1.5M pages', '≈ $1,000–6,000'],
  ], 4200, 'amber'));
}

export const corpus: Scene = {
  id: 'corpus',
  title: 'The corpus at scale',
  sum: 'Fix the numbers first — 100,000 documents is about 1.5 million pages and about 2 million chunks.',
  dur: 11000,
  phases: [
    { label: 'Documents', cap: '<b>100,000 documents</b> arrive from file shares, wikis and ticketing: about 70% text-native, 20% scanned, 10% images.', at: 0 },
    { label: 'Pages', cap: 'At ~15 pages each that is <b>~1.5 million pages</b>. Per page, parsing costs 10–100× more than embedding.', at: 3100 },
    { label: 'Chunks', cap: 'Structure-aware chunking at ~400 tokens gives <b>~2 million chunks</b>. Embedding them all costs tens of dollars.', at: 5800 },
    { label: 'Where it hurts', cap: 'Embedding ~700M tokens is ≈ $15–100. Parsing 1.5M pages is ≈ $1,000–6,000 and most of the engineering time.', at: 8500 },
  ],
  els(st) {
    const out: El[] = [];
    if (st.tall) corpusTall(st, out);
    else corpusWide(st, out);
    return out;
  },
};

export const manifest: Scene = {
  id: 'manifest',
  title: 'Ingestion starts with a manifest',
  sum: 'Catalog every document before parsing: stable id, content hash, ACLs, versions. Then collapse the duplicates.',
  dur: 10500,
  phases: [
    { label: 'Sources', cap: 'Documents arrive from a file share, a wiki and a ticketing system — the same file in three places is normal.', at: 0 },
    { label: 'Catalog', cap: 'Every document gets a row before any parsing: <b>doc_id</b>, SHA-256 hash, source URI, tenant, ACL groups, timestamps.', at: 2400 },
    { label: 'Dedupe', cap: 'The same hash in three folders collapses to one canonical row. Skip this and the top ten results contain five copies.', at: 5200 },
    { label: 'Why it pays', cap: 'Idempotency (unchanged hash → skip), incremental reprocessing, lineage by parser version, clean deletes via tombstones.', at: 8000 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const w = W - pad * 2;
    const top = pad + 4;
    const callH = 74;
    const bodyH = H - pad - callH - 18 - top;
    if (tall) {
      const rows = stack(top, bodyH * 0.52, 2, 10);
      out.push(...panel(pad, rows.y(0), w, rows.row, 'Sources', 100, undefined, 'file share · wiki · ticketing'));
      ['\\fileshare/policies', 'wiki.acme.com/eng', 'tickets/ACME-4092'].forEach((s, i) => {
        out.push(...chip(pad + 11 + i * (w / 3.2), rows.y(0) + rows.row - 30, 20, s, 400 + i * 160, 'blue', 9.5, true));
      });
      out.push(...arrowDown(pad + 18, rows.y(0) + rows.row + 2, rows.y(1) - 2, 'catalog', 1200));
      out.push(...panel(pad, rows.y(1), w, rows.row, 'Document catalog', 1400, undefined, 'doc_id · hash · acl · status'));
      const rowsB = [
        ['doc_id', 'acme-8842'],
        ['sha256', '9f2c…41d0'],
        ['acl_groups', 'grp:eng, grp:all'],
        ['status', 'queued'],
      ].slice(0, Math.max(1, Math.floor((rows.row - 46) / 17)));
      out.push(...keyRows(pad + 12, rows.y(1) + 50, w - 24, rowsB, 1700, 17, 10));
      const noteY = rows.y(1) + rows.row + 12;
      out.push(...chip(pad, noteY, 22, 'same hash ×3 → 1 row', 5400, 'amber', 10.5));
    } else {
      const c = cols(pad, w, 3, 14);
      const panelH = bodyH;
      out.push(...panel(c.x(0), top, c.col, panelH, 'Sources', 100, undefined, 'share · wiki · tickets'));
      ['/policies', 'wiki/eng', 'ACME-4092'].forEach((s, i) => {
        out.push(...chip(c.x(0) + 11, top + 54 + i * 30, 20, s, 400 + i * 170, 'blue', 10, true));
      });
      out.push(...panel(c.x(1), top, c.col, panelH, 'Document catalog', 900, undefined, 'Postgres · one row per document'));
      out.push(...keyRows(c.x(1) + 12, top + 56, c.col - 24, [
        ['doc_id', 'acme-8842'],
        ['sha256', '9f2c…41d0'],
        ['source', 'share/policies'],
        ['acl', 'grp:eng'],
        ['parser_v', 'p3.2'],
        ['status', 'queued'],
      ].slice(0, Math.max(2, Math.floor((panelH - 76) / 17))), 1100, 17, 10));
      out.push(...panel(c.x(2), top, c.col, panelH, 'Dedupe', 2400, undefined, 'before parsing, not after'));
      out.push(...keyRows(c.x(2) + 12, top + 56, c.col - 24, [
        ['exact', 'same sha256 → 1 row'],
        ['near', 'MinHash · v3 vs v4'],
        ['canonical', 'newest / authoritative'],
        ['tombstones', 'delete without orphans'],
      ], 2600, 19, 10));
      out.push(...arrowLabel(c.x(0) + c.col + 2, top + panelH * 0.42, c.x(1) - 2, top + panelH * 0.42, 'catalog', 700));
      out.push(...arrowLabel(c.x(1) + c.col + 2, top + panelH * 0.42, c.x(2) - 2, top + panelH * 0.42, 'dedupe', 2200));
    }
    const callY = H - pad - callH;
    out.push(...callout(pad, callY, w, callH, 'What the manifest buys you', [
      ['idempotency', 'unchanged hash → skip'],
      ['lineage', 'reprocess by parser version'],
      ['deletes', 'tombstones, no orphans'],
    ], 8200, 'green'));
    return out;
  },
};

export const parsing: Scene = {
  id: 'parsing',
  title: 'Tiered parsing into one canonical form',
  sum: 'Route each document to the cheapest tier that can read it; every tier emits the same intermediate representation.',
  dur: 12000,
  phases: [
    { label: 'Route', cap: 'A cheap probe decides per document — often per page: is there extractable text, is it one big image, are there figures?', at: 0 },
    { label: 'Tier 0', cap: 'Text-native files get text plus a layout model for reading order, headings and tables. Watch repeated headers and two-column pages.', at: 2400 },
    { label: 'Tier 1 and 2', cap: 'Scans go to OCR and keep their confidence scores. Figures and screenshots go to a vision model that writes a structured caption.', at: 5400 },
    { label: 'Canonical IR', cap: 'Every tier emits one IR: an ordered list of blocks with type, text, page and bounding box. Everything downstream is built from this.', at: 8600 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const w = W - pad * 2;
    const top = pad + 4;
    const tiers = [
      { name: 'tier 0 · text layer', share: 0.71, note: '71% · cheap', hue: 'blue' as const, at: 2400 },
      { name: 'tier 1 · OCR', share: 0.22, note: '22% · slow', hue: 'amber' as const, at: 5400 },
      { name: 'tier 2 · vision model', share: 0.07, note: '7% · 10–100× per page', hue: 'teal' as const, at: 5400 },
    ];
    if (tall) {
      out.push(...chip(pad, top, 22, 'queue → probe → route', 100, 'blue', 10.5, true));
      const rows = stack(top + 34, H - pad - 34 - (top + 34) - 54, 3, 12);
      tiers.forEach((t, i) => {
        out.push(...chip(pad, rows.y(i), 22, t.name, t.at + 120, t.hue, 10));
        out.push(label(W - pad, rows.y(i) + 11, t.note, t.at + 200, 9.5, 'muted', { anchor: 'end' }));
        out.push(...bar(pad, rows.y(i) + 28, w, 7, t.share, t.at + 260, t.hue));
      });
      const irY = rows.y(2) + 48;
      out.push(...panel(pad, irY, w, 46, 'Canonical IR', 8800, undefined, '{type, text, page, bbox}[]'));
      out.push(...legendRow(pad, H - pad - 8, [
        { hue: 'blue', text: 'paragraph' },
        { hue: 'amber', text: 'table' },
        { hue: 'teal', text: 'figure' },
      ], 9400));
    } else {
      const c = cols(pad, w, 4, 12);
      const panelH = H - pad * 2 - 4;
      out.push(...panel(c.x(0), top, c.col, panelH, 'Queue', 100, undefined, 'probe & route'));
      ['has text?', 'one image?', 'figures?', 'two columns?'].forEach((q, i) => {
        out.push(...chip(c.x(0) + 11, top + 58 + i * 30, 20, q, 400 + i * 150, undefined, 10));
      });
      out.push(...panel(c.x(1), top, c.col, panelH, 'Tier 0', 2400, 'blue', 'text + layout model'));
      out.push(...keyRows(c.x(1) + 12, top + 58, c.col - 24, [
        ['share', '71%'],
        ['read', 'text layer'],
        ['keep', 'headings, tables'],
        ['watch', 'repeated headers'],
      ], 2600, 22, 10));
      out.push(...panel(c.x(2), top, c.col, panelH, 'Tier 1 · Tier 2', 4200));
      out.push(...keyRows(c.x(2) + 12, top + 58, c.col - 24, [
        ['OCR', '22% · with confidence'],
        ['vision', '7% · structured caption'],
        ['cost', '10–100× embedding'],
      ], 4400, 24, 10));
      out.push(...panel(c.x(3), top, c.col, panelH, 'Canonical IR', 8600, 'green', '{type, text, page, bbox}[]'));
      out.push(...keyRows(c.x(3) + 12, top + 62, c.col - 24, [
        ['block', 'type'],
        ['text', 'normalised'],
        ['page', '1-based'],
        ['bbox', 'x0 y0 x1 y1'],
      ], 8800, 22, 10));
      out.push(...arrowLabel(c.x(0) + c.col + 2, top + panelH * 0.45, c.x(1) - 2, top + panelH * 0.45, 'route', 1200));
      out.push(...arrowLabel(c.x(1) + c.col + 2, top + panelH * 0.45, c.x(2) - 2, top + panelH * 0.45, 'tier', 4000));
      out.push(...arrowLabel(c.x(2) + c.col + 2, top + panelH * 0.45, c.x(3) - 2, top + panelH * 0.45, 'IR', 8400));
    }
    return out;
  },
};

export const chunking: Scene = {
  id: 'chunking',
  title: 'Chunking that respects structure',
  sum: 'Split on headings, keep tables whole, prepend a breadcrumb, and link small chunks to a bigger parent.',
  dur: 11500,
  phases: [
    { label: 'Headings', cap: 'Detect the heading hierarchy first. On heterogeneous corpora, structure-aware splitting beats fixed-size windows.', at: 0 },
    { label: 'Split', cap: 'Split on headings, then to <b>~300–500 tokens</b> with 10–15% overlap. Never split a table.', at: 2800 },
    { label: 'Breadcrumb', cap: 'Prepend the path to every chunk: Document › Section › Subsection (page). Nearly free, and it helps BM25 and embeddings alike.', at: 5800 },
    { label: 'Parent-child', cap: 'Index small chunks for precision but store a <b>parent_id</b>: retrieve on children, hand the model the parent.', at: 8600 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const w = W - pad * 2;
    const top = pad + 4;
    if (tall) {
      const docH = Math.max(70, H * 0.22);
      out.push(...panel(pad, top, w, docH, 'Parsed document (IR)', 100, undefined, 'headings → sections → tables'));
      ['1  Failover', '1.2  Health checks', '1.3  DNS failover', 'Table 2 · probe timings'].forEach((s, i) => {
        out.push(label(pad + 14, top + 52 + i * 15, s, 300 + i * 150, 10, i === 3 ? 'amber' : 'muted', { mono: i > 0 }));
      });
      const cTop = top + docH + 12;
      const cH = H - pad - 78 - cTop;
      const rows = stack(cTop, cH, 4, 7);
      const names = ['§1 failover', '§1.2 health checks', 'Table 2 (whole)', '§1.3 dns failover'];
      names.forEach((n, i) => {
        const isTable = n.includes('Table');
        out.push(...chip(pad, rows.y(i), Math.min(24, rows.row), n, 2800 + i * 320, isTable ? 'amber' : 'blue', 10));
        out.push(label(W - pad, rows.y(i) + Math.min(24, rows.row) / 2, `${[142, 318, 96, 176][i]} tok`, 3000 + i * 320, 9.5, 'muted', { anchor: 'end', mono: true }));
      });
      out.push(...arrowDown(pad + 16, cTop + cH + 2, H - pad - 74, 'children → parent_id', 7200));
      out.push(...panel(pad, H - pad - 70, w, 64, 'Parent chunk · ~1,500 tokens', 8600, 'green', 'section “Failover” — handed to the model'));
    } else {
      const c = cols(pad, w, 3, 14);
      const panelH = H - pad * 2 - 4;
      out.push(...panel(c.x(0), top, c.col, panelH, 'Parsed document (IR)', 100, undefined, 'heading hierarchy first'));
      ['1  Failover', '1.2  Health checks', '1.3  DNS failover', 'Table 2 · probe timings'].forEach((s, i) => {
        out.push(label(c.x(0) + 12, top + 60 + i * 22, s, 300 + i * 160, 10.5, i === 3 ? 'amber' : 'muted', { mono: i > 0 }));
      });
      out.push(label(c.x(0) + 12, top + panelH - 30, 'table kept whole · header row repeated', 1200, 9.5, 'muted'));
      out.push(...panel(c.x(1), top, c.col, panelH, 'Chunks', 2800, undefined, '300–500 tokens · 10–15% overlap'));
      const rows = stack(top + 78, panelH - 96, 4, 8);
      const names = ['§1 failover', '§1.2 health checks', 'Table 2 (whole)', '§1.3 dns failover'];
      names.forEach((n, i) => {
        out.push(...chip(c.x(1) + 12, rows.y(i), 22, n, 2900 + i * 300, n.includes('Table') ? 'amber' : 'blue', 10));
        out.push(label(c.x(1) + c.col - 12, rows.y(i) + 11, `${[142, 318, 96, 176][i]} tok`, 3100 + i * 300, 9.5, 'muted', { anchor: 'end', mono: true }));
      });
      out.push(...panel(c.x(2), top, c.col, panelH, 'Parent-child', 5800, 'green', 'breadcrumb: doc › § › sub (page)'));
      out.push(...keyRows(c.x(2) + 12, top + 70, c.col - 24, [
        ['child', 'indexed · precise'],
        ['parent', '~1,500 tokens'],
        ['retrieve', 'on children'],
        ['hand to model', 'the parent'],
      ], 6000, 22, 10));
      out.push(label(c.x(2) + 12, top + panelH - 40, 'child · ~400 tokens', 7200, 10, 'blue', { strong: true }));
      out.push(label(c.x(2) + 12, top + panelH - 22, 'parent_id → section “Failover”', 7400, 9.5, 'muted', { mono: true }));
      out.push(...arrowLabel(c.x(0) + c.col + 2, top + panelH * 0.4, c.x(1) - 2, top + panelH * 0.4, 'split', 2500));
      out.push(...arrowLabel(c.x(1) + c.col + 2, top + panelH * 0.4, c.x(2) - 2, top + panelH * 0.4, 'link', 5600));
    }
    return out;
  },
};

export const SCENES_A: Scene[] = [corpus, manifest, parsing, chunking];
