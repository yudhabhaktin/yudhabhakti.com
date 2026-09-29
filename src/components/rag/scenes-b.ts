import { bar, card, chip, label, panel } from './helpers';
import { cols, fit, stack, wrap, type El, type Scene, type Stage } from './types';

/** Steps 5-8. Same contract as the first four: one idea per step, drawn in the box. */

export const enrichment: Scene = {
  id: 'enrichment',
  title: 'Enrichment and embedding',
  sum: 'Every chunk leaves with metadata, a summary, and a vector.',
  dur: 8200,
  phases: [
    { label: 'Metadata', cap: 'Section, year, type — the fields you will filter on later.', at: 0 },
    { label: 'Summary', cap: 'A short summary, so the reader gets context without the whole chunk.', at: 1200 },
    { label: 'Embedding', cap: '768 numbers per chunk. This is the part you cannot read.', at: 2900 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const inner = W - pad * 2;
    const chunkH = 52;
    const top = pad + 22;
    out.push(card(pad, top, inner, chunkH, 80));
    out.push(label(pad + 11, top + chunkH / 2 - 4, '§4.2 Refunds', 200, 12, 'ink', { strong: true }));
    out.push(label(pad + 11, top + chunkH / 2 + 12, '318 tokens', 280, 10.5, 'muted', { mono: true }));

    const bodyTop = top + chunkH + 16;
    const bodyH = H - pad - bodyTop - 6;
    if (tall) {
      const rows = stack(bodyTop, bodyH, 3, 10);
      ['section: 4.2 Refunds', 'year: 2024', 'type: policy_pdf'].forEach((t, i) => {
        out.push(...chip(pad, rows.y(i), 24, t, 700 + i * 190, false, 11));
      });
      out.push(card(pad, rows.y(1) + 30, inner, 40, 1900));
      out.push(label(pad + 11, rows.y(1) + 42, 'Refunds are issued within 5', 2050, 11, 'ink'));
      out.push(label(pad + 11, rows.y(1) + 56, 'business days of approval.', 2140, 11, 'ink'));
      out.push(label(pad, rows.y(2) + 30, 'vector: 768 dimensions', 3000, 11, 'muted'));
      out.push({ t: 'bars', x: pad, y: rows.y(2) + 38, w: inner, h: Math.max(14, H - pad - (rows.y(2) + 38)), n: 12, fill: 'accent', at: 3100, dur: 520, stagger: 34 });
    } else {
      const c = cols(pad, inner, 3, 16);
      const full = H - pad - bodyTop - 6;
      ['section: 4.2 Refunds', 'year: 2024', 'type: policy_pdf'].forEach((t, i) => {
        out.push(...chip(c.x(0), bodyTop + i * 32, 24, t, 700 + i * 190, false, 11));
      });
      out.push(card(c.x(1), bodyTop, c.col, full, 1900));
      out.push(label(c.x(1) + 11, bodyTop + 18, 'Refunds are issued', 2050, 11, 'ink'));
      out.push(label(c.x(1) + 11, bodyTop + 33, 'within 5 business', 2140, 11, 'ink'));
      out.push(label(c.x(1) + 11, bodyTop + 48, 'days of approval.', 2230, 11, 'ink'));
      out.push(label(c.x(2), bodyTop + 12, 'vector: 768 dimensions', 3000, 11, 'muted'));
      out.push({ t: 'bars', x: c.x(2), y: bodyTop + 22, w: c.col, h: full - 24, n: 12, fill: 'accent', at: 3100, dur: 520, stagger: 34 });
    }
    return out;
  },
};

export const indexes: Scene = {
  id: 'indexes',
  title: 'Storage and indexes',
  sum: 'One store, three ways in: vectors, terms, and metadata.',
  dur: 8200,
  phases: [
    { label: 'Vectors', cap: 'An approximate nearest-neighbour index. Fast, not exact.', at: 0 },
    { label: 'Terms', cap: 'An inverted index, for the queries that are really a string match.', at: 1400 },
    { label: 'Filters', cap: 'Metadata filters, applied before either of them ranks anything.', at: 3200 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const inner = W - pad * 2;
    const top = pad + 26;
    const gap = tall ? 10 : 14;
    const boxes = [
      { title: 'vector index · hnsw', accent: false },
      { title: 'lexical index · inverted', accent: false },
      { title: 'metadata filters', accent: true },
    ];
    const layout = (i: number) => {
      if (tall) {
        const rows = stack(top, H - pad - 14 - top, boxes.length, gap);
        return { x: pad, y: rows.y(i), w: inner, h: rows.row };
      }
      const c = cols(pad, inner, boxes.length, gap);
      return { x: c.x(i), y: top, w: c.col, h: H - pad - 14 - top };
    };

    const a = layout(0);
    out.push(...panel(a.x, a.y, a.w, a.h, boxes[0].title, 100));
    const dots = (() => {
      const cx = cols(a.x + 18, a.w - 36, 3, 10);
      const cy = stack(a.y + 40, Math.max(20, a.h - 54), 2, 12);
      const pts: Array<[number, number]> = [];
      for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) pts.push([cx.x(k) + cx.col / 2, cy.y(r) + cy.row / 2]);
      return pts;
    })();
    dots.forEach((p, i) => out.push({ t: 'circle', cx: p[0], cy: p[1], r: 4, fill: i < 3 ? 'accent' : 'ink-soft', stroke: 'accent-line', sw: 1, anim: 'pop', at: 260 + i * 60, dur: 320 }));
    [[0, 1], [1, 2], [2, 4], [3, 4]].forEach(([i, j], k) => {
      out.push({ t: 'line', x1: dots[i][0], y1: dots[i][1], x2: dots[j][0], y2: dots[j][1], stroke: 'accent-line', sw: 1, dash: true, anim: 'fade', at: 620 + k * 90, dur: 300 });
    });

    const b = layout(1);
    out.push(...panel(b.x, b.y, b.w, b.h, boxes[1].title, 1400));
    ['refund', 'invoice', 'order id'].slice(0, Math.max(1, Math.floor((b.h - 44) / 26))).forEach((t, i) => {
      const rowH = 22;
      const y = b.y + 36 + i * (rowH + 4);
      out.push(label(b.x + 11, y + 8, t, 1560 + i * 180, 11, 'ink', { mono: true }));
      out.push(...bar(b.x + 76, y, Math.max(24, b.w - 88), 8, 0.9 - i * 0.24, 1640 + i * 180, false));
    });

    const c3 = layout(2);
    out.push(...panel(c3.x, c3.y, c3.w, c3.h, boxes[2].title, 3200));
    const rows2: Array<[string, string]> = [['section', '4.2 Refunds'], ['year', '2024'], ['type', 'policy_pdf']];
    rows2.slice(0, Math.max(1, Math.floor((c3.h - 44) / 24))).forEach(([k, v], i) => {
      const y = c3.y + 38 + i * 24;
      out.push(label(c3.x + 11, y, k, 3380 + i * 160, 11, 'muted'));
      out.push(label(c3.x + c3.w - 11, y, v, 3440 + i * 160, 11, 'ink', { anchor: 'end' }));
    });
    return out;
  },
};

export const retrieval: Scene = {
  id: 'retrieval',
  title: 'Hybrid retrieval and rerank',
  sum: 'Two searches, one fused list, one reranker, then the answer.',
  dur: 7800,
  phases: [
    { label: 'Two searches', cap: 'A term search and a vector search, over the same corpus.', at: 0 },
    { label: 'Fuse', cap: 'Reciprocal rank fusion, so neither search can dominate.', at: 1500 },
    { label: 'Rerank', cap: 'A cross-encoder reorders the top candidates. This is the slow step.', at: 3300 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const inner = W - pad * 2;
    const rows: Array<{ text: string; accent: boolean; at: number; h: number; mono?: boolean }> = [
      { text: 'query: how long do refunds take', accent: false, at: 80, h: 28, mono: true },
      { text: 'lexical: 412 hits', accent: false, at: 620, h: 26 },
      { text: 'vector: 118 hits', accent: false, at: 860, h: 26 },
      { text: 'fuse → 60 candidates', accent: false, at: 1600, h: 26 },
      { text: 'rerank → 5 passages', accent: true, at: 3400, h: 26 },
    ];
    if (tall) {
      const gap = 14;
      const totalH = rows.reduce((a, r) => a + r.h, 0) + gap * (rows.length - 1);
      const top = pad + Math.max(0, (H - pad * 2 - totalH) / 2);
      let y = top;
      rows.forEach((r, i) => {
        if (i > 0) out.push({ t: 'line', x1: pad + 14, y1: y - gap, x2: pad + 14, y2: y, stroke: 'rule', sw: 1, anim: 'fade', at: r.at - 160, dur: 260 });
        out.push(...chip(pad, y, r.h, r.text, r.at, r.accent, 11));
        y += r.h + gap;
      });
    } else {
      const c = cols(pad, inner, 3, 18);
      const cx = (i: number) => c.x(i) + c.col / 2;
      out.push(...chip(cx(1) - Math.max(52, rows[0].text.length * 6.16 + 20) / 2, pad + 6, 28, rows[0].text, 80, false, 11));
      out.push(...chip(cx(0) - Math.max(52, rows[1].text.length * 6.16 + 20) / 2, pad + 58, 26, rows[1].text, 620, false, 11));
      out.push(...chip(cx(2) - Math.max(52, rows[2].text.length * 6.16 + 20) / 2, pad + 58, 26, rows[2].text, 860, false, 11));
      out.push(...chip(cx(1) - Math.max(52, rows[3].text.length * 6.16 + 20) / 2, pad + 110, 26, rows[3].text, 1600, false, 11));
      out.push(...chip(cx(1) - Math.max(52, rows[4].text.length * 6.16 + 20) / 2, pad + 162, 26, rows[4].text, 3400, true, 11));
      const mid = pad + 6 + 14;
      [[cx(1), mid + 22, cx(0), pad + 58], [cx(1), mid + 22, cx(2), pad + 58], [cx(0), pad + 88, cx(1), pad + 110], [cx(2), pad + 88, cx(1), pad + 110], [cx(1), pad + 140, cx(1), pad + 162]].forEach((p, i) => {
        out.push({ t: 'line', x1: p[0], y1: p[1], x2: p[2], y2: p[3], stroke: 'rule', sw: 1, anim: 'draw', at: 400 + i * 120, dur: 300 });
      });
    }
    return out;
  },
};

export const answer: Scene = {
  id: 'answer',
  title: 'The grounded answer',
  sum: 'Answer from the retrieved passages, cite each claim, refuse when they disagree.',
  dur: 7800,
  phases: [
    { label: 'Passages', cap: 'Five passages, ranked. The reranker decided the order.', at: 0 },
    { label: 'Answer', cap: 'The model writes from these passages only, and cites them.', at: 1600 },
    { label: 'Refusal', cap: 'If the passages disagree, the answer says so instead of guessing.', at: 3600 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const inner = W - pad * 2;
    const top = pad + 26;
    const rows = stack(top, (H - pad - 16 - top) * (tall ? 0.55 : 0.5), 4, 7);
    const names = ['§4.2 Refunds · 2024', '§4.2 Refunds · 2023', 'Table 3: paths', '§4.3 Exchanges'];
    const scores = ['0.94', '0.89', '0.81', '0.62'];
    names.forEach((n, i) => {
      out.push(card(pad, rows.y(i), inner, rows.row, 100 + i * 220, i === 0));
      out.push(label(pad + 11, rows.y(i) + rows.row / 2, n, 200 + i * 220, 11.5));
      out.push(label(W - pad - 11, rows.y(i) + rows.row / 2, scores[i], 240 + i * 220, 10.5, 'muted', { anchor: 'end', mono: true }));
    });
    const boxTop = rows.y(3) + rows.row + 16;
    const boxH = H - pad - boxTop - (tall ? 30 : 0);
    out.push(card(pad, boxTop, inner, Math.max(40, boxH), 1700));
    const lines = wrap('Refunds are processed within 5 business days of approval [1][2]. An order id is required [1].', inner - 24, 11.5).slice(0, 3);
    lines.forEach((l, i) => out.push(label(pad + 12, boxTop + 18 + i * 16, l, 1900 + i * 340, 11.5)));
    if (tall) out.push(...chip(pad, H - pad - 24, 24, 'if passages disagree: say so', 3700, false, 10.5));
    return out;
  },
};

export const SCENES_B: Scene[] = [enrichment, indexes, retrieval, answer];
