import { chip, panel } from './helpers';
import { cols, fit, stack, wrap, type El, type Scene, type Stage } from './types';

/**
 * The last four steps: what each chunk gains, where the three indexes live, how a
 * query is answered twice and fused once, and how the answer is kept grounded.
 */

const enrichment: Scene = {
  id: 'enrichment',
  title: 'Enrichment and embedding',
  sum: 'Every chunk gains metadata, a summary and a vector.',
  dur: 11000,
  phases: [
    { at: 0, label: 'Attach metadata', cap: 'Section path, page, language, document type and updated-at are lifted from the parse. They become the filters that make retrieval cheap later.' },
    { at: 3600, label: 'Write a summary', cap: 'A one-line summary gives the reranker and the answer model a cheap first look at context they cannot afford to read in full.' },
    { at: 7200, label: 'Embed the chunk', cap: 'The chunk becomes a <b>768-dimension</b> vector. Same text, same vector — which is what makes the index reproducible after a re-embed.' },
  ],
  els(st: Stage): El[] {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const headH = 32;
    out.push({ t: 'box', x: pad, y: pad, w: W - 2 * pad, h: headH, r: 6, fill: 'accent-soft', stroke: 'accent-line', sw: 1, anim: 'fade', at: 0, dur: 300 });
    out.push({ t: 'text', x: pad + 10, y: pad + headH / 2, s: 'chunk 41-003 · "Refund policy"', size: 12, mono: true, fill: 'ink', anim: 'fade', at: 140, dur: 300 });
    const top = pad + headH + 14, avail = H - pad - top;

    const meta = (x: number, y: number, w: number, h: number): El[] => {
      const els = panel(x, y, w, h, 'metadata', false, 300, 380);
      const items = ['section: 4.2 Refunds', 'page: 41', 'lang: en', 'type: policy_pdf'];
      const room = Math.max(1, Math.floor((h - 40) / 15));
      const show = items.slice(0, Math.min(items.length, room));
      const step = (h - 40) / Math.max(1, show.length);
      show.forEach((s, i) => {
        els.push({ t: 'text', x: x + 10, y: y + 34 + i * step, s: fit(s, w - 20, 11), size: 11, mono: true, fill: 'muted', anim: 'rise', at: 500 + i * 220, dur: 320 });
      });
      return els;
    };

    const summary = (x: number, y: number, w: number, h: number): El[] => {
      const els = panel(x, y, w, h, 'summary', false, 2200, 380);
      const line = 'Refunds are issued within 5 business days and need an order id.';
      const per = Math.max(12, Math.floor((w - 20) / (12 * 0.55)));
      const lines = [line.slice(0, per), line.slice(per)];
      lines.slice(0, h > 96 ? 2 : 1).forEach((l, i) => {
        els.push({ t: 'text', x: x + 10, y: y + 38 + i * 17, s: l, size: 12, fill: 'ink', anim: 'rise', at: 2600 + i * 260, dur: 320 });
      });
      if (h > 110) els.push({ t: 'circle', cx: x + 14, cy: y + h - 16, r: 3.5, fill: 'accent', anim: 'fade', at: 3400, dur: 300 });
      if (h > 110) els.push({ t: 'text', x: x + 24, y: y + h - 16, s: 'distilled, not stored as truth', size: 11, fill: 'faint', anim: 'fade', at: 3450, dur: 300 });
      return els;
    };

    const vector = (x: number, y: number, w: number, h: number): El[] => {
      const els = panel(x, y, w, h, 'embedding · 768 dims', true, 7000, 380);
      els.push({ t: 'bars', x: x + 10, y: y + 36, w: w - 20, h: Math.min(h * 0.44, 96), n: tall ? 32 : 48, fill: 'accent', stagger: 18, at: 7500, dur: 500 });
      els.push(...chip(x + 10, y + h - 32, 22, 'normalised · cosine ready', 'ink-soft', 'rule', 8600, 11).map((e) => ({ ...e })));
      return els;
    };

    if (tall) {
      const h1 = avail * 0.3, h2 = avail * 0.26, h3 = avail - h1 - h2 - 16;
      out.push(...meta(pad, top, W - 2 * pad, h1));
      out.push(...summary(pad, top + h1 + 8, W - 2 * pad, h2));
      out.push(...vector(pad, top + h1 + h2 + 16, W - 2 * pad, h3));
    } else {
      const col = cols(pad, W - 2 * pad, 2, 14);
      out.push(...meta(col.x(0), top, col.col, avail * 0.46));
      out.push(...summary(col.x(0), top + avail * 0.46 + 10, col.col, avail * 0.54 - 10));
      out.push(...vector(col.x(1), top, col.col, avail));
    }
    return out;
  },
};

const indexes: Scene = {
  id: 'indexes',
  title: 'Storage and indexes',
  sum: 'Three indexes over the same chunks: vectors, terms, metadata.',
  dur: 10000,
  phases: [
    { at: 0, label: 'Vector index', cap: 'HNSW keeps the vectors in a navigable graph: a search touches a few hundred nodes instead of comparing 88,412 vectors.' },
    { at: 3400, label: 'Lexical index', cap: 'An inverted index of terms and posting lists answers the exact matches — order codes, product names, error strings — that embeddings blur away.' },
    { at: 6800, label: 'Metadata store', cap: 'Filters live here. Narrowing to one section or one year before searching is the cheapest speed-up in the pipeline.' },
  ],
  els(st: Stage): El[] {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const headH = 28;
    out.push({ t: 'box', x: pad, y: pad, w: W - 2 * pad, h: headH, r: 6, fill: 'ink-soft', stroke: 'rule', sw: 1, anim: 'fade', at: 0, dur: 300 });
    out.push({ t: 'text', x: pad + 10, y: pad + headH / 2, s: '88,412 chunks · vectors + terms + metadata', size: 11.5, fill: 'muted', anim: 'fade', at: 150, dur: 300 });
    const top = pad + headH + 12;
    const avail = H - pad - 34 - top;

    if (tall) {
      const rows = stack(top, avail, 3, 8);
      out.push(...hnsw(pad, rows.y(0), W - 2 * pad, rows.row, 300));
      out.push(...lexical(pad, rows.y(1), W - 2 * pad, rows.row, 3700));
      out.push(...filters(pad, rows.y(2), W - 2 * pad, rows.row, 7100));
    } else {
      const c = cols(pad, W - 2 * pad, 3, 12);
      out.push(...hnsw(c.x(0), top, c.col, avail, 300));
      out.push(...lexical(c.x(1), top, c.col, avail, 3700));
      out.push(...filters(c.x(2), top, c.col, avail, 7100));
    }
    out.push(...chip(pad, H - pad - 26, 26, 'one chunk id joins all three', 'accent-soft', 'accent-line', 8400));
    return out;
  },
};

function hnsw(x: number, y: number, w: number, h: number, at: number): El[] {
  const els = panel(x, y, w, h, 'vector index · HNSW', false, at, 380);
  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const ly = y + 40 + i * ((h - 52) / layers);
    const count = 9 - i * 3;
    const dw = (w - 24) / count;
    for (let k = 0; k < count; k++) {
      const cx = x + 12 + k * dw + dw / 2;
      els.push({ t: 'circle', cx, cy: ly, r: 3.2, fill: 'accent', anim: 'pop', at: at + 300 + i * 320 + k * 40, dur: 260 });
      if (i < layers - 1) {
        els.push({ t: 'line', x1: cx, y1: ly + 4, x2: x + 12 + ((k * 2) % count) * dw + dw / 2, y2: ly + (h - 52) / layers - 4, stroke: 'rule', sw: 1, anim: 'draw', at: at + 500 + i * 320 + k * 40, dur: 400 });
      }
    }
  }
  return els;
}

function lexical(x: number, y: number, w: number, h: number, at: number): El[] {
  const els = panel(x, y, w, h, 'lexical index · inverted', false, at, 380);
  const room = Math.max(1, Math.floor((h - 40) / 18));
  const terms = ['refund', 'invoice', 'order id'].slice(0, room);
  const rows = stack(y + 34, h - 44, terms.length, Math.max(6, (h - 44) / terms.length - 12));
  terms.forEach((term, i) => {
    els.push({ t: 'text', x: x + 10, y: rows.y(i), s: term, size: 11, mono: true, fill: 'ink', anim: 'fade', at: at + 300 + i * 260, dur: 300 });
    els.push({ t: 'box', x: x + 10 + w * 0.34, y: rows.y(i) - 4, w: (w - 20) * 0.56, h: 8, r: 4, fill: 'ink-soft', stroke: 'rule', sw: 1, anim: 'fade', at: at + 340 + i * 260, dur: 240 });
    els.push({ t: 'box', x: x + 10 + w * 0.34, y: rows.y(i) - 4, w: (w - 20) * 0.56 * (0.45 + i * 0.2), h: 8, r: 4, fill: 'accent', anim: 'growx', at: at + 420 + i * 260, dur: 480 });
  });
  return els;
}

function filters(x: number, y: number, w: number, h: number, at: number): El[] {
  const els = panel(x, y, w, h, 'metadata store · filters', false, at, 380);
  const room = Math.max(1, Math.floor((h - 38) / 20));
  const rows: [string, string][] = [['section', '4.2 Refunds'], ['year', '2024'], ['type', 'policy_pdf']].slice(0, room);
  const layout = stack(y + 32, h - 44, rows.length, Math.max(8, (h - 44) / rows.length - 14));
  rows.forEach(([k, v], i) => {
    els.push({ t: 'text', x: x + 10, y: layout.y(i), s: k, size: 11, fill: 'muted', anim: 'fade', at: at + 300 + i * 240, dur: 280 });
    els.push({ t: 'text', x: x + w * 0.42, y: layout.y(i), s: v, size: 11, mono: true, fill: 'ink', anim: 'fade', at: at + 360 + i * 240, dur: 280 });
    els.push({ t: 'line', x1: x + 8, y1: layout.y(i) + 10, x2: x + w - 8, y2: layout.y(i) + 10, stroke: 'rule', sw: 1, anim: 'fade', at: at + 400 + i * 240, dur: 240 });
  });
  return els;
}

const retrieval: Scene = {
  id: 'retrieval',
  title: 'Hybrid retrieval and rerank',
  sum: 'Two searches, one fused ranking, then a cross-encoder cuts to eight.',
  dur: 12000,
  phases: [
    { at: 0, label: 'Two indexes answer', cap: 'The query hits the lexical and the vector index at once. Each returns <b>100 candidates</b>; neither list on its own is good enough.' },
    { at: 4200, label: 'Fuse the rankings', cap: 'Reciprocal rank fusion scores by <i>position</i>, not raw score: rank 1 in both lists beats rank 1 in one. Forty candidates survive.' },
    { at: 7600, label: 'Rerank to eight', cap: 'A cross-encoder reads the query and each candidate together, and trims forty down to the <b>eight</b> passages the answer model will see.' },
  ],
  els(st: Stage): El[] {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const query = '"how long do refunds take?"';
    if (tall) {
      const rows = stack(pad, H - 2 * pad, 5, 8);
      out.push({ t: 'box', x: pad, y: rows.y(0), w: W - 2 * pad, h: rows.row, r: 6, fill: 'accent-soft', stroke: 'accent-line', sw: 1.2, anim: 'pop', at: 100, dur: 360 });
      out.push({ t: 'text', x: pad + 10, y: rows.y(0) + rows.row / 2, s: fit(query, W - 2 * pad - 20, 12.5), size: 12.5, fill: 'ink', anim: 'fade', at: 250, dur: 300 });
      const half = (W - 2 * pad - 8) / 2;
      out.push(...rung(pad, rows.y(1), half, rows.row, 'BM25 top 100', 900));
      out.push(...rung(pad + half + 8, rows.y(1), half, rows.row, 'vector top 100', 1200));
      out.push(...rung(pad, rows.y(2), W - 2 * pad, rows.row, 'fusion · 40 candidates', 4300));
      out.push(...rung(pad, rows.y(3), W - 2 * pad, rows.row, 'cross-encoder rerank', 7700));
      out.push(...rung(pad, rows.y(4), W - 2 * pad, rows.row, 'top 8 → answer model', 9200));
    } else {
      const c = cols(pad, W - 2 * pad, 4, 12);
      const mid = pad + (H - 2 * pad) * 0.34;
      out.push({ t: 'box', x: c.x(0), y: pad, w: c.col, h: 34, r: 6, fill: 'accent-soft', stroke: 'accent-line', sw: 1.2, anim: 'pop', at: 100, dur: 360 });
      out.push({ t: 'text', x: c.x(0) + 8, y: pad + 17, s: 'query', size: 11.5, fill: 'muted', anim: 'fade', at: 220, dur: 260 });
      out.push({ t: 'text', x: c.x(0) + 8, y: mid - 26, s: fit(query, c.col - 16, 11.5), size: 11.5, fill: 'ink', anim: 'fade', at: 320, dur: 300 });
      out.push(...rung(c.x(0), mid, c.col, 40, 'BM25 top 100', 900));
      out.push(...rung(c.x(0), mid + 52, c.col, 40, 'vector top 100', 1200));
      out.push(...rung(c.x(1), mid + 26, c.col, 40, 'rank fusion · 40', 4300));
      out.push(...rung(c.x(2), mid + 26, c.col, 40, 'rerank · top 8', 7700));
      out.push(...rung(c.x(3), mid + 26, c.col, 40, 'answer model', 9200));
    }
    return out;
  },
};

function rung(x: number, y: number, w: number, h: number, label: string, at: number): El[] {
  return [
    { t: 'box', x, y, w, h, r: 6, fill: 'ink-soft', stroke: 'rule', sw: 1, anim: 'rise', at, dur: 380 },
    { t: 'text', x: x + 10, y: y + h / 2, s: fit(label, w - 20, 12), size: 12, fill: 'ink', anim: 'fade', at: at + 160, dur: 260 },
  ];
}

const answer: Scene = {
  id: 'answer',
  title: 'Grounded answer',
  sum: 'Eight passages in, one cited answer out — or an honest refusal.',
  dur: 12000,
  phases: [
    { at: 0, label: 'Assemble context', cap: 'The eight passages are pasted in rank order, each with an id. Nothing else from the corpus can reach the model.' },
    { at: 4200, label: 'Answer with citations', cap: 'Every sentence carries the passage id it came from, so a reader can check the claim in one tap.' },
    { at: 8200, label: 'Refuse when unsupported', cap: 'If the passages do not support an answer the pipeline says so. A confident wrong answer costs more than a refusal.' },
  ],
  els(st: Stage): El[] {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const n = 8;
    const ctxH = (H - 2 * pad) * (tall ? 0.46 : 0.52);
    const rows = stack(pad, ctxH, n, 4);
    const titles = ['Refund policy §4.2 · p41', 'Order terms §7 · p88', 'Support FAQ · refund timing'];
    for (let i = 0; i < n; i++) {
      const cited = i < 3;
      out.push({
        t: 'box', x: pad, y: rows.y(i), w: W - 2 * pad, h: rows.row, r: 5,
        fill: cited ? 'accent-soft' : 'ink-soft', stroke: cited ? 'accent-line' : 'rule', sw: 1, anim: 'rise', at: 100 + i * 90, dur: 340,
      });
      out.push({
        t: 'text', x: pad + 8, y: rows.y(i) + rows.row / 2, s: `[${i + 1}] ${titles[i] ?? `passage ${i + 1}`}`,
        size: 11, fill: cited ? 'ink' : 'faint', anim: 'fade', at: 220 + i * 90, dur: 260,
      });
    }
    const top = pad + ctxH + 14, avail = H - pad - top;
    out.push({ t: 'box', x: pad, y: top, w: W - 2 * pad, h: avail * (tall ? 0.58 : 0.62), r: 8, fill: 'panel', stroke: 'rule', sw: 1, anim: 'fade', at: 4000, dur: 340 });
    out.push({ t: 'text', x: pad + 10, y: top + 14, s: 'answer', size: 11, fill: 'muted', anim: 'fade', at: 4200, dur: 260 });
    const answerLines = wrap('Refunds are processed within 5 business days of approval [1][2]. An order id is required [1].', W - 2 * pad - 20, 12.5).slice(0, 3);
    answerLines.forEach((line, i) => {
      out.push({ t: 'text', x: pad + 10, y: top + 36 + i * 17, s: line, size: 12.5, fill: 'ink', anim: 'rise', at: 4600 + i * 320, dur: 420 });
    });
    out.push(...chip(pad, top + avail * (tall ? 0.58 : 0.62) + 10, 26, 'no support → "I cannot answer that"', 'accent-soft', 'accent-line', 8500));
    return out;
  },
};

export const SCENES_B: Scene[] = [enrichment, indexes, retrieval, answer];
