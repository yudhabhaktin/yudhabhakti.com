---
title: When your users ask questions that span a database and a document
description: >-
  Retrieval-augmented generation works well over documents and badly over ledgers.
  Most real questions need both, and the gap between them is where these systems fail.
published: 2026-07-26
tags: ['llm', 'rag', 'architecture', 'applied-ai']
---

Most RAG tutorials assume a corpus of documents. Embed the chunks, retrieve the nearest
neighbours, hand them to a model. It works, and it demos beautifully.

Then you put it in front of people who do a job, and they ask something like:

> How many times did we have to stop the line last month, and what does the procedure say
> I should do when it happens?

That is two questions wearing a coat. The first half is a `COUNT(*)` with a date filter
against a transactional system. The second half is a document lookup. A pipeline built for
one of those will fail the other, usually while sounding completely confident.

This is a note on what I have learned building assistants that have to answer both kinds of
question. It is deliberately general — the specifics belong to the places I built them.

## Why vector search cannot count

Retrieval finds text that is *semantically similar* to a query. Nothing about that operation
is aggregation.

Ask "how many stoppages last month" of a vector index and you get the chunks that talk most
about stoppages. If the underlying records happen to be text, you might retrieve twelve of
them, and the model will happily tell you the answer is twelve — not because it counted, but
because twelve is how many you gave it. Your `top_k` became the answer.

That failure is quiet, plausible, and wrong, which is the worst combination available. It
is also not fixable by better embeddings or a bigger `top_k`, because the problem is not
retrieval quality. It is that the question needed an aggregate and you ran a similarity
search.

The corollary is just as true in reverse. Text-to-SQL over a well-modelled schema answers
"how many" precisely and has nothing whatsoever to say about what the procedure requires.

## Route, or fuse

Two workable shapes, and the choice matters more than the model does.

**Routing.** Classify the question first, then send it down one path. Cheap, predictable,
easy to debug — you can always point at which branch ran. The weakness is that
classification becomes a hard boundary, and compound questions like the one above sit
exactly on it.

**Fusion.** Run both retrievers, merge what comes back, let the model compose the answer.
Handles compound questions naturally. Costs more per query, and merging is genuinely
fiddly: you are combining a result set that has row semantics with one that has passage
semantics, and relevance scores from the two are not comparable numbers no matter how
tempting it is to treat them that way.

In practice I have ended up somewhere in between more often than not — classify into
`structured`, `unstructured`, or `both`, and only pay for fusion on the third branch. The
three-way split is worth the extra class. Most questions really are one or the other, and
you would rather not pay fusion cost on all of them.

## Treat text-to-SQL as an attack surface

Once part of your pipeline generates SQL from user input, you have built something that
deserves the same paranoia as any other query construction.

Things worth being strict about:

- **Read-only credentials.** Not "the prompt says not to write." A database role that cannot
  write. The prompt is not a security control — it is a suggestion to a system that is
  designed to be agreeable.
- **A constrained surface.** Views over base tables, not the whole schema. This helps
  correctness as much as safety; a model reasons better about six well-named views than
  sixty tables with a decade of naming drift.
- **Query limits.** Timeouts and row caps, because an unbounded generated join will find
  its way to production eventually.
- **Log the generated SQL.** When someone reports a wrong number, the query is the only
  artefact that tells you what actually happened.

## Retrieval quality is mostly a data problem

Almost everything that improved answer quality for me happened before the model was
involved.

**Chunking follows document structure, not character count.** Procedures and policies have
sections and clauses that mean something. Splitting every 500 characters cuts a requirement
in half and produces chunks that are locally coherent and globally useless. Split on the
structure the document already has.

**Metadata does the heavy lifting.** Document type, effective date, which site or unit it
applies to, whether it is still current. A superseded procedure retrieved with perfect
semantic relevance is a wrong answer with good vibes. Most of the retrieval bugs I have
chased were fixed with a filter, not a better embedding.

**Hybrid lexical plus semantic beats either.** Real users search for equipment codes, form
numbers, and internal shorthand. Embeddings are bad at exact rare tokens; BM25 is excellent
at them. Running both and reciprocally fusing the ranks is a small amount of code for a
large amount of recall.

**Citations are not a feature, they are the product.** People do not trust an assistant
about a compliance question, and they are right not to. What they will do is use it to find
the clause faster. An answer that links to the source it came from is useful even when the
summary is imperfect. An answer with no provenance is unusable even when it is correct,
because there is no way to tell which case you are in.

## Evaluate on questions people actually asked

The single most valuable thing I have done on these projects is keep a file of real
questions, with the answer a human considers correct.

Not synthetic questions. Real ones, collected from users, including the badly-phrased ones
and the ones with typos and the ones that are three questions at once. Every change to
chunking, retrieval, or routing runs against that file before it ships.

It is unglamorous, it needs maintaining, and it is the only thing that reliably caught
regressions for me. Vibes-based evaluation works right up until the day you change the
chunker and quietly break every question about one document type.

## What I would tell someone starting

Work out the shape of the questions first. Sit with the people who will use it and write
down thirty real ones before choosing a single component. The split between "needs the
ledger" and "needs the document" will tell you the architecture, and it is almost never the
split you assumed.

Then build the boring version. Routing, filters, citations, an eval file. The interesting
techniques are worth reaching for after you know which of your questions are still wrong —
and by then you will have earned the right to be interesting about it.
