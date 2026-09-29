import { arrowDown, callout, card, chip, docIcon, inner, keyRows, label, legend, legendRow, panel, rankList, shareBar, stat, tileGrid } from './helpers';
import { clamp, cols, fit, stack, wrap, type El, type Scene, type Stage } from './types';

/**
 * Steps 5-8: what leaves the parser, where it lives, what filters it, and the
 * lexical half of retrieval.
 *
 * Same contract as the first four — a scene is a function of the box it is handed,
 * so a phone stacks what a laptop puts in columns, and nothing is dropped.
 */

const CALL_H = 64;

/** The chunk on the bench, shared by the enrichment step. */
function chunkCard(st: Stage, x: number, y: number, w: number, h: number, at: number): El[] {
  const out: El[] = [card(x, y, w, h, at), ...chip(x + 11, y + 10, 20, 'c203', at + 120, 'blue', 10, true)];
  out.push(label(x + 11, y + 46, fit('Payments Runbook \u203a Failover', w - 22, 12), at + 200, 12, 'ink', { strong: true }));
  out.push(label(x + 11, y + 60, '318 tokens \u00b7 1 of 3 chunks', at + 260, 10, 'muted', { mono: true }));
  out.push(...keyRows(x + 11, y + 78, w - 22, [['section', '4.2 \u00b7 Failover'], ['pages', '14\u201316']], at + 320, 14));
  return out;
}

export const enrichment: Scene = {
  id: 'enrich',
  title: 'Enrichment, then embedding',
  sum: 'Attach the metadata you will filter on, then turn every chunk into a vector.',
  dur: 9000,
  phases: [
    { label: 'System metadata', cap: 'Copied from the catalog: tenant, groups, dates, pipeline version.', at: 0 },
    { label: 'Extracted metadata', cap: 'One model call per document fills the fields the file never stated.', at: 1700 },
    { label: 'Embedding', cap: '768 numbers per chunk. You cannot read them, so the field is the picture.', at: 3600 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const callY = H - pad - CALL_H;
    const top = pad + 4;
    const bodyH = callY - 14 - top;

    const sysRows: Array<[string, string]> = [
      ['tenant', 'acme'],
      ['acl', '{grp:pay, grp:eng}'],
      ['lang', 'en'],
      ['parser_v', 'parse-v4'],
    ];
    const extRows: Array<[string, string]> = [
      ['doc_type', 'runbook'],
      ['effective', '2025-11'],
      ['owner', 'Team Atlas'],
      ['entities', 'Ledger Service, on-call'],
    ];

    if (tall) {
      // Phone: one panel carries the chunk and the system metadata, the second the
      // extracted fields and the vector field, so nothing has to squeeze.
      const chunkH = 118;
      out.push(...panel(pad, top, W - pad * 2, chunkH, 'Chunk c203', 60, undefined, 'Payments Runbook \u203a Failover \u00b7 318 tokens'));
      out.push(...keyRows(pad + 11, top + 56, W - pad * 2 - 22, sysRows, 1100, 15));
      const ey = top + chunkH + 12;
      const eh = callY - 14 - ey;
      out.push(...panel(pad, ey, W - pad * 2, eh, 'Extracted, then embedded', 2400, 'teal', 'one model call \u00b7 768-d vector'));
      const ei = inner(pad, ey, W - pad * 2, eh, true);
      out.push(...keyRows(ei.x, ei.y, ei.w, extRows.slice(0, 2), 2600, 15));
      const gridY = ei.y + 34;
      out.push(...tileGrid(ei.x, gridY, ei.w, Math.max(16, ey + eh - 24 - gridY), 40, 2900, 'chunks', 7));
      out.push(...legendRow(ei.x, ey + eh - 12, [{ hue: 'blue', text: 'payments' }, { hue: 'amber', text: 'ledger' }, { hue: 'teal', text: 'security' }], 3400));
    } else {
      const c = cols(pad, W - pad * 2, 2, 16);
      const leftW = c.col;
      const cardH = 104;
      out.push(...chunkCard(st, c.x(0), top, leftW, cardH, 60));
      const stackY = top + cardH + 10;
      const metaH = (callY - 14 - stackY - 10) / 2;
      // A short stage gets fewer rows rather than overlapping ones.
      const fitRows = (rowsIn: Array<[string, string]>, boxH: number, top2: number) =>
        rowsIn.slice(0, Math.max(1, Math.floor((boxH - top2 - 10) / 16)));
      out.push(...panel(c.x(0), stackY, leftW, metaH, 'System metadata \u00b7 free', 900, undefined, 'copied, exact'));
      out.push(...keyRows(c.x(0) + 11, stackY + 46, leftW - 22, fitRows(sysRows, metaH, 46), 1100, 16));
      out.push(...panel(c.x(0), stackY + metaH + 10, leftW, metaH, 'Extracted \u00b7 one call per doc', 1500, 'violet', 'closed schema, validated'));
      out.push(...keyRows(c.x(0) + 11, stackY + metaH + 56, leftW - 22, fitRows(extRows, metaH, 56), 1700, 16));
      out.push(...panel(c.x(1), top, c.col, bodyH, 'Embedding space \u00b7 768-d', 2400, 'teal', 'drawn in 2-D'));
      const ei = inner(c.x(1), top, c.col, bodyH, true);
      // From the bottom up: stat, then legend, then whatever height is left for the field.
      const statY = ei.y + ei.h - 78;
      const legendY = statY - 8 - 45;
      const fieldH = legendY - 10 - ei.y;
      out.push(...tileGrid(ei.x, ei.y, ei.w, Math.max(20, fieldH), 56, 2800, 'chunks', 7));
      out.push(...legend(ei.x, legendY, [
        { hue: 'blue', text: 'payments' },
        { hue: 'amber', text: 'ledger' },
        { hue: 'teal', text: 'security' },
      ], 3200, 15, 10));
      out.push(...stat(ei.x, statY, ei.w, 'Dimensions', 768, 'numbers per chunk', 3600, 22));
    }

    out.push(...callout(pad, callY, W - pad * 2, CALL_H, 'Metadata is what makes retrieval legible', [
      ['Filter on', 'tenant, groups, dates, doc_type'],
      ['Extract for', 'effective date, owner, entities'],
    ], 5200, 'amber'));
    return out;
  },
};

export const indexes: Scene = {
  id: 'storage',
  title: 'Storage and indexes: derived, rebuildable views',
  sum: 'The parsed intermediate representation is the source of truth. Every index is a view you can rebuild from it.',
  dur: 9500,
  phases: [
    { label: 'Originals and IR', cap: 'Object storage keeps the file and the parse; Postgres keeps the catalog.', at: 0 },
    { label: 'Derived views', cap: 'Three indexes, each answering a question the others cannot.', at: 1800 },
    { label: 'Everything is rebuildable', cap: 'Lose an index and you lose hours, not the corpus.', at: 4200 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const callY = H - pad - CALL_H;
    const top = pad + 4;
    const bodyH = callY - 16 - top;

    const irRows: Array<[string, string]> = [['doc_id', 'doc-88214'], ['hash', 'sha256:44c7\u2026'], ['parser_v', 'parse-v4'], ['status', 'indexed']];

    if (tall) {
      const srcH = 96;
      out.push(...panel(pad, top, W - pad * 2, srcH, 'Originals and the IR', 60, undefined, 'object store \u00b7 IR JSON \u00b7 crops'));
      out.push(...keyRows(pad + 11, top + 52, W - pad * 2 - 22, irRows.slice(0, 2), 400, 15));
      const idxY = top + srcH + 12;
      const idxH = callY - 14 - idxY;
      out.push(...panel(pad, idxY, W - pad * 2, idxH, 'Derived views \u00b7 rebuildable', 1900, 'amber', 'lose one and you lose hours, not the corpus'));
      out.push(...keyRows(pad + 11, idxY + 58, W - pad * 2 - 22, [
        ['BM25', 'term \u2192 postings'],
        ['HNSW', '768-d \u00b7 int8 \u00b7 filtered'],
        ['Graph', 'entities \u00b7 typed edges'],
      ], 2100, 20));
      out.push(...legendRow(pad + 11, idxY + idxH - 14, [{ hue: 'amber', text: 'built from the IR' }, { text: 'never from the original file' }], 3000));
    } else {
      const c = cols(pad, W - pad * 2, 5, 14);
      const srcW = c.col * 2 + 14;
      const srcH = bodyH * 0.42;
      out.push(...panel(pad, top, srcW, srcH, 'Object store', 60, undefined, 'originals \u00b7 IR JSON \u00b7 figure crops'));
      out.push(...legend(pad + 11, top + srcH - 46, [{ hue: 'blue', text: 'pdf' }, { hue: 'amber', text: 'scan' }, { hue: 'teal', text: 'image' }], 300, 14));
      const catX = pad + srcW + 14;
      out.push(...panel(catX, top, W - pad - catX, srcH, 'Catalog \u00b7 Postgres', 500, 'blue', 'documents \u00b7 chunks \u00b7 versions \u00b7 runs'));
      out.push(...keyRows(catX + 11, top + 56, W - pad - catX - 22, irRows, 700, 15));
      const idxTop = top + srcH + 26;
      const idxH = callY - 14 - idxTop;
      const n = 3;
      const col = cols(pad, W - pad * 2, n, 14);
      out.push(...panel(col.x(0), idxTop, col.col, idxH, 'BM25 inverted index', 1900, 'amber', 'term \u2192 postings \u00b7 analyzers'));
      out.push(...keyRows(col.x(0) + 11, idxTop + 56, col.col - 22, [['err-4092', 'c17 c88'], ['failover', 'c17 c203'], ['payments', '41k']], 2100, 15));
      out.push(...panel(col.x(1), idxTop, col.col, idxH, 'HNSW vector index', 2200, 'teal', '768-d \u00b7 int8 \u00b7 filtered'));
      out.push(...keyRows(col.x(1) + 11, idxTop + 56, col.col - 22, [['M', '16\u201332'], ['ef_search', '64\u2013256'], ['recall@10', '\u2265 0.95']], 2400, 15));
      out.push(...panel(col.x(2), idxTop, col.col, idxH, 'Graph \u00b7 optional', 2500, 'violet', 'entities \u00b7 typed edges \u00b7 provenance'));
      out.push(...keyRows(col.x(2) + 11, idxTop + 56, col.col - 22, [['nodes', '4,100'], ['edges', '11,600'], ['built by', '1 LLM pass']], 2700, 15));
      out.push(...arrowDown(col.x(0) + col.col / 2, top + srcH + 6, idxTop - 4, 'rebuild', 1600));
      out.push(...arrowDown(col.x(1) + col.col / 2, top + srcH + 6, idxTop - 4, 'rebuild', 1700));
      out.push(...arrowDown(col.x(2) + col.col / 2, top + srcH + 6, idxTop - 4, 'rebuild', 1800));
    }

    out.push(...callout(pad, callY, W - pad * 2, CALL_H, 'The IR is the source of truth', [
      ['Rebuild cost', 'hours, not days'],
      ['What breaks', 'an index, never the corpus'],
    ], 4600, 'green'));
    return out;
  },
};

export const filter: Scene = {
  id: 'filter',
  title: 'Metadata filtering: security, scope and boosts',
  sum: 'ACL filters come from the session and are non-negotiable. Scoping filters come from the query. How the engine applies them decides whether the result is fast and correct.',
  dur: 9500,
  phases: [
    { label: 'The question', cap: 'A user question, and the text the retrievers will see.', at: 0 },
    { label: 'Hard filters', cap: 'Tenant and groups are injected in code, from the authenticated session.', at: 1600 },
    { label: 'Soft filters', cap: 'doc_type, dates and boosts come from the query and the extracted metadata.', at: 3200 },
    { label: 'Where it breaks', cap: 'A selective filter strands the HNSW walk, and the engine falls back to exact search.', at: 5000 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const callY = H - pad - CALL_H;
    const top = pad + 4;
    const qH = 54;
    const out_ = out;

    out_.push(card(pad, top, W - pad * 2, qH, 60, 'blue'));
    out_.push(...chip(pad + 11, top + 10, 20, 'user', 160, 'blue', 10, true));
    out_.push(label(pad + 50, top + 24, fit('Q3 2025 security review: SSO findings', W - pad * 2 - 66, 12), 220, 12, 'ink', { strong: true }));
    out_.push(label(pad + 11, top + 42, fit('text sent to the retrievers: security review SSO findings', W - pad * 2 - 22, 10), 300, 10, 'muted', { mono: true }));

    const bodyTop = top + qH + 14;
    const bodyH = callY - 14 - bodyTop;
    const hard: Array<[string, string]> = [['tenant_id', 'acme'], ['acl \u2229', '{grp:sec, grp:eng}'], ['source', 'auth context']];
    const soft: Array<[string, string]> = [['doc_type', 'security_review'], ['modified_at', '\u2265 2025-07-01'], ['boost', 'title match \u00d7 1.4']];

    if (tall) {
      const rows = stack(bodyTop, bodyH, 2, 10);
      out_.push(...panel(pad, rows.y(0), W - pad * 2, rows.row, 'Hard \u00b7 injected in code', 1400, 'red', 'ANDed with every retriever'));
      out_.push(...keyRows(pad + 11, rows.y(0) + 52, W - pad * 2 - 22, hard, 1600, 18));
      out_.push(...panel(pad, rows.y(1), W - pad * 2, rows.row, 'Soft \u00b7 from the query', 3000, 'blue', 'the model may propose these'));
      out_.push(...keyRows(pad + 11, rows.y(1) + 52, W - pad * 2 - 22, soft, 3200, 18));
    } else {
      const c = cols(pad, W - pad * 2, 2, 16);
      out_.push(...panel(c.x(0), bodyTop, c.col, bodyH, 'Hard \u00b7 injected in code', 1400, 'red', 'ANDed with every retriever'));
      out_.push(...keyRows(c.x(0) + 11, bodyTop + 62, c.col - 22, hard, 1600, 20));
      out_.push(...legend(c.x(0) + 11, bodyTop + bodyH - 56, [
        { hue: 'red', text: 'never generated by the model' },
        { hue: 'red', text: 'hard isolation = partition, not filter' },
      ], 2100, 15));
      out_.push(...panel(c.x(1), bodyTop, c.col, bodyH, 'Soft \u00b7 from the query', 3000, 'blue', 'the model may propose these'));
      out_.push(...keyRows(c.x(1) + 11, bodyTop + 62, c.col - 22, soft, 3200, 20));
      out_.push(...legend(c.x(1) + 11, bodyTop + bodyH - 56, [
        { hue: 'blue', text: 'filter on keyword / date / numeric' },
        { hue: 'blue', text: 'selective filter \u2192 exact-search fallback' },
      ], 3700, 15));
    }

    out_.push(...callout(pad, callY, W - pad * 2, CALL_H, 'Security filters are code, not prompt', [
      ['Who decides', 'the identity provider, per request'],
      ['What to test', 'the fallback when a filter is selective'],
    ], 5600, 'amber'));
    return out_;
  },
};

export const bm25: Scene = {
  id: 'bm25',
  title: 'BM25: the lexical retriever',
  sum: 'Exact identifiers, part numbers, acronyms and names. Dense retrieval misses them; an inverted index does not.',
  dur: 9000,
  phases: [
    { label: 'Tokenise', cap: 'The same analyzer as the index: lowercased, lightly stemmed, identifiers kept whole.', at: 0 },
    { label: 'Postings', cap: 'Each term points at the chunks that contain it. This is the whole index.', at: 1500 },
    { label: 'Score', cap: 'Sum the per-term contributions, weight rare terms higher, and sort.', at: 3000 },
    { label: 'What it wins', cap: 'err-4092 is not a paraphrase problem. It has to match exactly.', at: 4600 },
  ],
  els(st) {
    const { W, H, pad, tall } = st;
    const out: El[] = [];
    const callY = H - pad - CALL_H;
    const top = pad + 4;
    const qH = 52;

    out.push(card(pad, top, W - pad * 2, qH, 60, 'blue'));
    out.push(label(pad + 11, top + 22, fit('ERR-4092 payments failover', W - pad * 2 - 66, 12), 200, 12, 'ink', { strong: true }));
    ['err-4092', 'payments', 'failover'].forEach((t, i) => {
      out.push(...chip(pad + 11 + i * 84, top + 30, 18, t, 320 + i * 90, i === 0 ? 'blue' : undefined, 10, true));
    });

    const bodyTop = top + qH + 14;
    const bodyH = callY - 14 - bodyTop;
    const postings: Array<[string, string]> = [
      ['err-4092', 'c17 c88 c203'],
      ['payments', 'c2 c9 c17 c88 \u2026 41k'],
      ['failover', 'c17 c203 c355 c410'],
    ];
    const ranks = [
      { id: 'Payments Runbook \u203a Failover', score: '8.9' },
      { id: 'INC-4507 \u203a Timeline', score: '7.4' },
      { id: 'Error catalogue \u203a ERR-4092', score: '6.8' },
      { id: 'Ledger Runbook \u203a Failover', score: '5.1' },
    ];

    if (tall) {
      const rows = stack(bodyTop, bodyH, 2, 10);
      out.push(...panel(pad, rows.y(0), W - pad * 2, rows.row, 'Inverted index', 1200, 'amber', 'term \u2192 postings, chunk level'));
      out.push(...keyRows(pad + 11, rows.y(0) + 56, W - pad * 2 - 22, postings, 1400, 17));
      out.push(...panel(pad, rows.y(1), W - pad * 2, rows.row, 'Candidates \u00b7 score', 2800, undefined, '\u03a3 per-term contributions'));
      const ri = inner(pad, rows.y(1), W - pad * 2, rows.row, true);
      out.push(...rankList(ri.x, ri.y + 10, ri.w, ranks, 3000, 'amber', 18, 10.5));
    } else {
      const c = cols(pad, W - pad * 2, 2, 16);
      out.push(...panel(c.x(0), bodyTop, c.col, bodyH, 'Inverted index', 1200, 'amber', 'term \u2192 postings, chunk level'));
      out.push(...keyRows(c.x(0) + 11, bodyTop + 66, c.col - 22, postings, 1400, 20));
      out.push(...legend(c.x(0) + 11, bodyTop + bodyH - 44, [
        { hue: 'amber', text: 'weighted by rarity, not count' },
      ], 2000, 15));
      out.push(...panel(c.x(1), bodyTop, c.col, bodyH, 'Candidates \u00b7 score', 2800, undefined, '\u03a3 per-term contributions'));
      const ri = inner(c.x(1), bodyTop, c.col, bodyH, true);
      out.push(...rankList(ri.x, ri.y + 10, ri.w, ranks, 3000, 'amber', 22, 11));
      out.push(...stat(ri.x, bodyTop + bodyH - 52, ri.w, 'Postings for payments', 41000, 'one term, one posting list', 4200, 20));
    }

    out.push(...callout(pad, callY, W - pad * 2, CALL_H, 'Where lexical search is the only answer', [
      ['Wins', 'part numbers, acronyms, error codes, names'],
      ['Loses', 'typos, synonyms, paraphrase'],
    ], 5000, 'amber'));
    return out;
  },
};

/** Steps 5-8, in order. */
export const SCENES_B: Scene[] = [enrichment, indexes, filter, bm25];
