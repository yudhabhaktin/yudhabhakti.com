---
title: Drawing a RAG pipeline that survives a phone screen
description: >-
  A sort of step-through explainer of a retrieval pipeline, and the part that turned out to
  be the work: making a wide landscape diagram legible on the device most people will open
  it on.
published: 2026-09-29
tags: ['rag', 'llm', 'design', 'web', 'applied-ai']
draft: false
---

Retrieval pipelines are usually explained as one wide diagram. Boxes left to right, an arrow
between each, a sidebar of steps down the left. It is a good shape for a conference slide and
a bad shape for the device most people will open it on.

I found a walkthrough like that a few weeks ago and liked the form: pick a step, press play,
watch the stage fill in. So I built one for this site.

The pipeline was the easy half — making the diagram legible on a phone took the time — which is
where I read everything, and probably where you are reading this.

## The diagram was the problem, not the pipeline

Take a 16:9 stage and put it in a 390&nbsp;px-wide viewport and the arithmetic is brutal. The
drawing scales to fit the width, so a 12&nbsp;px label is rendered at about 4.7&nbsp;px. The
usual answer is to let the reader pinch and zoom, which works in the sense that it is
possible. Pinch to zoom is not an answer.

The fix I settled on is to stop drawing in a fixed coordinate space. There is no 16:9 here. Each scene is a function of the box it is handed — it reads the width and height of the stage,
decides whether the room it has is wide or tall, and lays itself out accordingly. On a phone
the same scene becomes a vertical stack with the type at its real size. On a laptop the
identical code forms rows and columns, because the box is wide. The breakpoint is a property
of the drawing, not a media query in a stylesheet, so a short landscape window in a browser
gets a sensible answer too.

One more decision followed from that. The stage's box is measured in CSS pixels and the SVG
is drawn in the same units, one unit to one pixel. It means the labels are authored at 11 to
13&nbsp;px and stay at 11 to 13&nbsp;px no matter the screen, instead of being scaled into
whatever the container happens to be.

## What the page does

There are eight steps: the corpus, manifest and dedupe, tiered parsing, structure-aware
chunking, enrichment and embedding, the three indexes, hybrid retrieval and reranking, and
the answer with its citations. Each step has two or three phases with their own caption, so
the narration changes as the scene fills in rather than sitting static next to it.

You can press play and let it run through the whole thing, step by step. You can scrub. You
can deep-link a single step — `#s=6` opens storage and indexes. The arrow keys work too, if you
are on a keyboard. Under the diagram the same pipeline is written out in prose — which is what a reader without JavaScript gets and what I would quote if someone asked
me what the pipeline actually does.

## How it is put together

The site is Astro with static output, and this page is one island: React for the shell
(steps, phases, captions, controls) and the Web Animations API for the motion.

Scenes are data. Every shape in a scene carries two numbers: the millisecond it should appear,
and how long it takes. Playback is one animation frame loop that advances a single millisecond value and
writes it onto those paused animations. React renders once per step and never per
frame, which is why scrubbing on a phone is smooth rather than approximate. Scrubbing is
also exact in both directions, because a scene is a pure function of that one number instead
of a pile of transitions that were started at some point in the past.

Two details I would keep in any diagram like this — both cost nothing. Every colour is a site
token,
so the diagram follows the light/dark toggle without a second palette to maintain. And
`prefers-reduced-motion` renders the finished state with the play control hidden, because an
animation someone did not ask for is a worse default than a still picture.

## The bugs a measurement finds and an eye does not

I cannot see these screenshots, so I checked by measuring instead. For every step, at every
width I cared about, compare the bounding box of each text element against the stage
box, and every pair of labels against each other. Anything outside the box is clipped — anything overlapping by more than a third of its area
counts as a collision.

That found three things I would otherwise have shipped. A counter overlapped the caption
underneath it once the number got large. The rows in a short panel collapsed into each other
because their spacing was derived from the panel height without a floor. And the answer text
in the last scene ran past the edge of the stage below about 320&nbsp;px. None of them would
have been obvious one at a time; all of them were trivial once the check existed.

It also caught a bug I would not have found by looking at all: the element animations were
accumulating. React reuses the same SVG nodes when only the geometry changed, and each
re-render added another animation with `fill: both` on top of the previous one. The picture
looked fine. It was five animations deep on the same rectangle.

## What it is not

The numbers in it are illustrative. A hundred thousand documents, 88,412 unique after
dedupe, 768-dimension vectors, a 71/22/7 split between the text layer, OCR and a vision model.
They are illustrative. Those are the shapes of the answer, not measurements from a corpus
I processed. If you put
your own numbers in, they should come from your own pipeline; otherwise the diagram teaches a
number that nobody can reproduce.

It is also one page — not a library. There is no plugin, no config, and the scenes are hard
coded to this pipeline. That seemed like the right scope for a diagram whose whole purpose is
to be understood in a couple of minutes.

## Where the form came from

The shape of the page — a step list beside an animated stage, phases inside a step, play and
scrub — comes from
["Inside a 100,000-document RAG knowledge base"](https://ardyadipta.github.io/blog/rag-pipeline-explainer.html)
by Ardya Dipta Nandaviri. That is a genuinely good walkthrough of the same pipeline and worth
your time on its own. Credit for the idea is his; this implementation, its scenes, copy and
player are mine, and the two differ in the way the drawing is laid out.

You can [open the walkthrough](/rag) and press play.
