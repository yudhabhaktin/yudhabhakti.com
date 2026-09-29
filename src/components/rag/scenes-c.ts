import { arrowDown, arrowLabel, callout, card, chip, docIcon, graph, inner, keyRows, label, layers, legend, legendRow, panel, rankList, stat, timeline } from './helpers';
import { clamp, cols, fit, stack, type El, type Scene, type Stage } from './types';

/**
 * Steps 9-12: the two retrievers, what happens to their results, the third
 * retriever that exists for multi-hop questions, and the query path measured
 * end to end.
 */

const CALL_H = 64;

export const dense: Scene = {
  id: 'dense',
  title: 'Semantic search: embeddings and HNSW',
  sum: 'Meaning, not keywords. The query becomes a vector, and an approximate nearest-neighbour graph finds its neighbours.',
  dur: 9500,
  phases: [
    { label: 'Embed the query', cap: 'Same model as the index, with the query-side prefix the model was trained with.', at: 0 },
    { label: 'Walk the graph', cap: 'A greedy walk from the sparse top layer down to the dense one.', at: 1900 },
    { label: 'Overfetch', cap: '100 to 200 candidates per retriever, because fusion and reranking come next.', at: 4400 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const callY = H - pad - CALL_H;
    const top = pad + 4;
    const qH = 54;

    out.push(card(pad, top, W - pad * 2, qH, 60, 'blue'));
    out.push(label(pad + 11, top + 22, fit('How do we fail over payments to the secondary region?', W - pad * 2 - 22, 12), 200, 12, 'ink', { strong: true }));
    out.push(label(pad + 11, top + 42, fit('\u2192 the retrievers never see this sentence, only its vector', W - pad * 2 - 22, 10), 320, 10, 'muted', { mono: true }));

    const bodyTop = top + qH + 14;
    const bodyH = callY - 14 - bodyTop;
    const params: Array<[string, string]> = [['M', '16\u201332'], ['ef_construction', '128\u2013256'], ['ef_search', '64\u2013256'], ['recall@10', '\u2265 0.95']];

    if (tall) {
      const q1H = 98;
      out.push(...panel(pad, bodyTop, W - pad * 2, q1H, 'Query vector \u00b7 768-d', 1000, 'blue', 'e5 / bge style: the prefix matters'));
      out.push(...chip(pad + 11, bodyTop + 50, 20, '[0.12, \u22120.03, 0.44, \u2026]', 1200, 'blue', 10, true));
      out.push(...keyRows(pad + 11, bodyTop + 74, W - pad * 2 - 22, params.slice(0, 2), 1500, 14));
      const hy = bodyTop + q1H + 12;
      const hh = callY - 14 - hy;
      out.push(...panel(pad, hy, W - pad * 2, hh, 'ANN index \u00b7 HNSW', 1900, 'teal', 'three layers, walked greedily'));
      const li = inner(pad, hy, W - pad * 2, hh, true);
      out.push(...layers(li.x, li.y, li.w, Math.max(20, li.h - 18), 2200, 11));
      out.push(...legendRow(li.x, hy + hh - 12, [{ hue: 'blue', text: 'layer 2 \u00b7 sparse entry' }, { text: 'layer 0 \u00b7 all vectors' }], 3400));
    } else {
      const c = cols(pad, W - pad * 2, 2, 16);
      const q1H = Math.max(100, bodyH * 0.36);
      out.push(...panel(c.x(0), bodyTop, c.col, q1H, 'Query vector', 1000, 'blue', 'e5 / bge style: prefix matters'));
      out.push(...chip(c.x(0) + 11, bodyTop + 52, 20, '[0.12, \u22120.03, 0.44, \u2026]', 1200, 'blue', 10, true));
      out.push(label(c.x(0) + 11, bodyTop + 88, '768 numbers', 1400, 10.5, 'muted', { mono: true }));
      const py = bodyTop + q1H + 10;
      out.push(...panel(c.x(0), py, c.col, callY - 14 - py, 'Index parameters worth measuring', 1600, 'teal', 'defaults are not a decision'));
      out.push(...keyRows(c.x(0) + 11, py + 54, c.col - 22, params.slice(0, Math.max(2, Math.floor((callY - 14 - py - 64) / 18))), 1800, 18));
      out.push(...panel(c.x(1), bodyTop, c.col, bodyH, 'ANN index \u00b7 HNSW', 1900, 'teal', 'three layers, walked greedily'));
      const li = inner(c.x(1), bodyTop, c.col, bodyH, true);
      out.push(...layers(li.x, li.y + 10, li.w, Math.max(40, li.h - 60), 2200, 11));
      out.push(...legend(li.x, bodyTop + bodyH - 46, [
        { hue: 'blue', text: 'layer 2 \u00b7 sparse entry point' },
        { text: 'layer 1 \u00b7 the highway' },
        { text: 'layer 0 \u00b7 every vector' },
      ], 3400, 15));
    }

    out.push(...callout(pad, callY, W - pad * 2, CALL_H, 'Approximate, so measure it', [
      ['Overfetch', '100\u2013200 candidates per retriever'],
      ['Recall', 'against brute force, not vibes'],
    ], 5200, 'green'));
    return out;
  },
};

export const hybrid: Scene = {
  id: 'hybrid',
  title: 'Hybrid retrieval: fuse, then rerank',
  sum: 'Run both retrievers with the same filters, merge with reciprocal rank fusion, and let a cross-encoder choose the final few.',
  dur: 10000,
  phases: [
    { label: 'Two lists', cap: 'BM25 and dense search run in parallel on identical filters.', at: 0 },
    { label: 'Fuse', cap: 'Reciprocal rank fusion, using rank rather than score, so the two scales never have to agree.', at: 1700 },
    { label: 'Rerank', cap: 'A cross-encoder reads the query and each chunk together. 60 in, 5 out, 100 to 400 ms.', at: 4200 },
    { label: 'Expand', cap: 'Retrieve small chunks, answer from their parents, at most three per document.', at: 6400 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const callY = H - pad - CALL_H;
    const top = pad + 4;
    const bodyH = callY - 14 - top;

    const lex = [
      { id: 'c203', score: '8.9', both: true },
      { id: 'c88', score: '8.1', both: true },
      { id: 'c355', score: '7.4' },
      { id: 'c410', score: '6.2', both: true },
      { id: 'c77', score: '5.5' },
    ];
    const vec = [
      { id: 'c88', score: '0.91', both: true },
      { id: 'c203', score: '0.88', both: true },
      { id: 'c512', score: '0.84' },
      { id: 'c410', score: '0.79', both: true },
      { id: 'c31', score: '0.74' },
    ];

    if (tall) {
      const listH = 108;
      out.push(...panel(pad, top, W - pad * 2, listH, 'BM25 \u00b7 top 8 of 100', 60, 'amber', 'identical filters'));
      out.push(...rankList(pad + 11, top + 56, W - pad * 2 - 22, lex.slice(0, 3), 300, 'amber', 17, 10.5));
      const y2 = top + listH + 10;
      out.push(...panel(pad, y2, W - pad * 2, listH, 'Dense \u00b7 top 8 of 100', 900, 'teal', 'identical filters'));
      out.push(...rankList(pad + 11, y2 + 56, W - pad * 2 - 22, vec.slice(0, 3), 1100, 'teal', 17, 10.5));
      const cy = y2 + listH + 10;
      out.push(...chip(pad, cy, 22, 'Fuse \u00b7 RRF', 1800, 'blue', 10.5));
      out.push(...chip(pad + 92, cy, 22, 'Rerank \u00b7 60 \u2192 5', 3600, 'violet', 10.5));
      out.push(label(pad, cy + 32, 'expand to parents \u00b7 \u2264 3 per document', 6000, 10.5, 'muted'));
    } else {
      const c = cols(pad, W - pad * 2, 2, 16);
      const listH = bodyH * 0.5;
      out.push(...panel(c.x(0), top, c.col, listH, 'BM25 \u00b7 top 8 of 100', 60, 'amber', 'identical filters'));
      out.push(...rankList(c.x(0) + 11, top + 62, c.col - 22, lex, 300, 'amber', 19, 11));
      out.push(...panel(c.x(1), top, c.col, listH, 'Dense \u00b7 top 8 of 100', 900, 'teal', 'identical filters'));
      out.push(...rankList(c.x(1) + 11, top + 62, c.col - 22, vec, 1100, 'teal', 19, 11));
      const chainTop = top + listH + 18;
      const chainH = callY - 14 - chainTop;
      const cols3 = cols(pad, W - pad * 2, 3, 14);
      out.push(...panel(cols3.x(0), chainTop, cols3.col, chainH, 'Fuse \u00b7 RRF', 1800, 'blue', 'score = \u03a3 1 / (60 + rank)'));
      out.push(...keyRows(cols3.x(0) + 11, chainTop + 56, cols3.col - 22, [['c203', '1 + 2'], ['c88', '2 + 1'], ['c410', '4 + 4']], 2000, 16));
      out.push(...panel(cols3.x(1), chainTop, cols3.col, chainH, 'Cross-encoder rerank', 3600, 'violet', 'reads (query, chunk) together'));
      out.push(...keyRows(cols3.x(1) + 11, chainTop + 56, cols3.col - 22, [['in', '60'], ['out', '5'], ['cost', '100\u2013400 ms']], 3800, 16));
      out.push(...panel(cols3.x(2), chainTop, cols3.col, chainH, 'Expand to parents', 6000, 'green', 'answer from the parent chunk'));
      out.push(...keyRows(cols3.x(2) + 11, chainTop + 56, cols3.col - 22, [['per doc', '\u2264 3 chunks'], ['citations', 'parent id'], ['context', 'section + summary']], 6200, 16));
      out.push(...arrowLabel(cols3.x(0) + cols3.col, chainTop + chainH / 2, cols3.x(1) - 4, chainTop + chainH / 2, 'fused', 3200, 'blue'));
      out.push(...arrowLabel(cols3.x(1) + cols3.col, chainTop + chainH / 2, cols3.x(2) - 4, chainTop + chainH / 2, 'top 5', 6000, 'violet'));
    }

    out.push(...callout(pad, callY, W - pad * 2, CALL_H, 'Fusion buys recall, reranking buys precision', [
      ['Fuse', 'ranks, not scores'],
      ['Rerank', 'top 60 in, 5 out'],
    ], 7000, 'amber'));
    return out;
  },
};

export const graphrag: Scene = {
  id: 'graphrag',
  title: 'GraphRAG for multi-hop questions',
  sum: 'Extract entities and typed relationships with provenance, then use the graph as a third retriever for the questions text search cannot reach.',
  dur: 11000,
  phases: [
    { label: 'Extract', cap: 'One pass over the chunks with a closed schema: services, teams, incidents, policies.', at: 0 },
    { label: 'Connect', cap: 'Typed edges, each one pointing back at the chunk that asserted it.', at: 2200 },
    { label: 'Retrieve', cap: 'The question walks the graph and pulls the neighbourhood, not just the nearest vectors.', at: 5200 },
    { label: 'Answer with provenance', cap: 'Every hop is a citation, which is what makes a multi-hop answer checkable.', at: 7600 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const callY = H - pad - CALL_H;
    const top = pad + 4;
    const bodyH = callY - 14 - top;

    const nodes = [
      { id: 'Payments', hue: 'blue' as const, label: 'Service' },
      { id: 'Ledger', hue: 'teal' as const, label: 'Service' },
      { id: 'Checkout', hue: 'blue' as const, label: 'Service' },
      { id: 'Team Atlas', hue: 'amber' as const, label: 'Team' },
      { id: 'Team Orion', hue: 'amber' as const, label: 'Team' },
      { id: 'INC-4412', hue: 'violet' as const, label: 'Incident' },
    ];
    const edges: Array<[number, number, string]> = [
      [2, 0, 'calls'],
      [0, 1, 'depends on'],
      [0, 3, 'owned by'],
      [1, 4, 'owned by'],
      [5, 0, 'caused by'],
    ];
    const prov: Array<[string, string]> = [
      ['chunk c203', 'Payments Runbook \u203a Overview'],
      ['chunk c88', 'INC-4412 \u203a Root cause'],
      ['edge 41', 'Payments \u2192 Ledger'],
    ];

    if (tall) {
      const rows = stack(top, bodyH, 2, 10);
      out.push(...panel(pad, rows.y(0), W - pad * 2, rows.row, 'The graph', 600, 'violet', '6 of 4,100 nodes'));
      const gi = inner(pad, rows.y(0), W - pad * 2, rows.row, true);
      out.push(...graph(gi.x, gi.y + 8, gi.w, Math.max(60, gi.h - 20), nodes.slice(0, 6), edges, 800));
      out.push(...panel(pad, rows.y(1), W - pad * 2, rows.row, 'Provenance', 3600, undefined, 'every edge cites a chunk'));
      out.push(...keyRows(pad + 11, rows.y(1) + 52, W - pad * 2 - 22, prov, 3800, 17));
    } else {
      const c = cols(pad, W - pad * 2, 5, 14);
      const gw = c.col * 3 + 28;
      out.push(...panel(pad, top, gw, bodyH, 'The graph', 600, 'violet', '6 of 4,100 nodes \u00b7 typed edges'));
      const gi = inner(pad, top, gw, bodyH, true);
      out.push(...graph(gi.x, gi.y + 10, gi.w, Math.max(80, gi.h - 40), nodes, edges, 800));
      out.push(...legend(gi.x, top + bodyH - 34, [
        { hue: 'blue', text: 'service' },
        { hue: 'amber', text: 'team' },
        { hue: 'violet', text: 'incident / policy' },
      ], 4600, 15));
      const px = pad + gw + 14;
      const pw = W - pad - px;
      out.push(...panel(px, top, pw, bodyH * 0.46, 'Provenance', 3600, undefined, 'every edge cites a chunk'));
      out.push(...keyRows(px + 11, top + 58, pw - 22, prov, 3800, 18));
      out.push(...panel(px, top + bodyH * 0.46 + 12, pw, bodyH * 0.54 - 12, 'Why a third retriever', 6400, 'teal', 'text search answers one hop'));
      out.push(...keyRows(px + 11, top + bodyH * 0.46 + 70, pw - 22, [
        ['Wins', 'multi-hop, corpus-wide'],
        ['Cost', 'one LLM pass at build'],
        ['Risk', 'schema drift'],
      ], 6600, 18));
    }

    out.push(...callout(pad, callY, W - pad * 2, CALL_H, 'A graph is a retriever, not a diagram', [
      ['Feeds', 'entity neighbourhoods into the prompt'],
      ['Fails when', 'the schema drifts and edges go stale'],
    ], 8400, 'violet'));
    return out;
  },
};

export const answer: Scene = {
  id: 'query',
  title: 'The query path, end to end',
  sum: 'From an authenticated question to a streamed, cited answer. Retrieval is the cheap part; the prompt and the first token cost the rest.',
  dur: 9000,
  phases: [
    { label: 'Auth first', cap: 'The session resolves to groups, and the groups become the filter, in code.', at: 0 },
    { label: 'Retrieval in parallel', cap: 'BM25, the vector index and the graph run at once on the same filters.', at: 1200 },
    { label: 'Rerank and cut', cap: 'Fuse, rerank, then keep at most three chunks per document.', at: 2600 },
    { label: 'Answer', cap: 'Prompt, stream, cite. The first token arrives around 1.5 s.', at: 4200 },
    { label: 'Measure it', cap: 'Log the chunk ids and the trace id, and keep the eval set in CI.', at: 6400 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const callY = H - pad - CALL_H;
    const top = pad + 4;
    const bodyH = callY - 14 - top;

    const rows = [
      { name: 'Auth + ACL resolve', share: 0.02, note: '15 ms', hue: 'red' as const },
      { name: 'BM25 \u00b7 ANN \u00b7 graph', share: 0.22, note: '350 ms', hue: 'blue' as const },
      { name: 'Fuse (RRF)', share: 0.02, note: '30 ms', hue: 'violet' as const },
      { name: 'Cross-encoder rerank', share: 0.14, note: '220 ms', hue: 'amber' as const },
      { name: 'Prompt \u2192 first token', share: 0.6, note: '890 ms', hue: 'teal' as const },
    ];

    if (tall) {
      const tlH = bodyH * 0.52;
      out.push(...panel(pad, top, W - pad * 2, tlH, 'Where the 1.5 seconds go', 300, undefined, 'one question, six stages'));
      out.push(...timeline(pad + 11, top + 54, W - pad * 2 - 22, tlH - 74, rows, 600));
      const statsTop = top + tlH + 12;
      const statsH = callY - 12 - statsTop;
      const sr = stack(statsTop, statsH, 2, 8);
      out.push(...chip(pad, sr.y(0), 22, 'retrieval + rerank \u2248 0.6 s', 4600, 'teal', 10.5));
      out.push(...chip(pad, sr.y(1), 22, 'first token \u2248 1.5 s', 4800, 'amber', 10.5));
    } else {
      const c = cols(pad, W - pad * 2, 5, 14);
      const tw = c.col * 3 + 28;
      out.push(...panel(pad, top, tw, bodyH, 'Where the 1.5 seconds go', 300, undefined, 'one question, six stages'));
      out.push(...timeline(pad + 11, top + 62, tw - 22, bodyH - 96, rows, 600));
      const px = pad + tw + 14;
      const pw = W - pad - px;
      out.push(...stat(px + 11, top + 30, pw - 22, 'Retrieval + rerank', 600, 'milliseconds before the prompt', 4400, 26, 'ms'));
      out.push(...stat(px + 11, top + bodyH * 0.55, pw - 22, 'First token', 1500, 'milliseconds from submit', 4900, 26, 'ms'));
      out.push(...legend(px + 11, top + bodyH - 40, [
        { hue: 'amber', text: 'log chunk ids + trace id' },
        { hue: 'teal', text: 'same eval set in CI' },
      ], 6000, 15));
    }

    out.push(...callout(pad, callY, W - pad * 2, CALL_H, 'Retrieval is the cheap half', [
      ['Budget', 'retrieval under half the latency'],
      ['Instrument', 'trace id on every answer'],
    ], 7000, 'green'));
    return out;
  },
};

/** Steps 9-12, in order. */
export const SCENES_C: Scene[] = [dense, hybrid, graphrag, answer];
