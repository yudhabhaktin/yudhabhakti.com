---
title: Writing a system design document somebody will actually read
description: >-
  Most design docs are written to look thorough. The useful ones are written to be
  argued with.
published: 2025-11-16
tags: ['architecture', 'writing', 'engineering-management']
---

A large part of my job is turning a vague business requirement into a design an engineer can
build from. I have written a lot of these documents, and for a long time I wrote them badly
in a specific way: I wrote them to demonstrate that I had thought about the problem.

That produces a document that is comprehensive, well structured, and useless — because
nobody argues with it. They read it, they nod, and then they build something slightly
different, and nobody notices until integration.

The shift that helped was to stop treating the document as a record of a decision and start
treating it as **an instrument for finding out where people disagree.**

## The document is not the point

The value is almost entirely in what happens between the first draft and the version people
accept. If you write it alone, publish it, and get no comments, you have not achieved
consensus. You have achieved silence, and silence is what disagreement looks like when
nobody has read carefully enough to notice they disagree.

So I now write the first draft deliberately incomplete, with the open questions marked as
open. A document with three explicit "I am not sure about this, and here is why" sections
gets engaged with. A document that projects total confidence gets skimmed.

## What I put in one

Not a template exactly. More like the questions the document has to answer before it is
worth circulating.

**What problem, in the words of the person who has it.** Not the technical restatement.
If the finance team says "we cannot close the month until we have all the balances," write
that. The moment you translate it to "we need a data aggregation service," you have smuggled
in a solution and nobody can see it happen.

**What is actually true today.** The current system, honestly described, including the parts
that are embarrassing. Half of all design disagreements I have sat through were not about the
proposal at all — people held different beliefs about how the existing thing worked.

**Constraints that are real, separated from constraints that are habit.** "It must integrate
with the existing ERP" is real. "It should be a microservice" is usually habit. Writing them
in the same list gives them the same weight, which is how a preference gets promoted to a
requirement without anyone deciding to.

**The proposal, at a level someone can disagree with.** This is the hard calibration. Too
abstract and it survives review because there is nothing to object to. Too detailed and you
have spent a week specifying something that will change. I aim for: component boundaries,
data ownership, the flow of the two or three most important operations, and the failure
behaviour. Not method signatures.

**At least one alternative you took seriously.** If you cannot state a real alternative and
say why you rejected it, you did not make a decision — you had an idea and stopped. This
section is also where a reader who disagrees will go first, which makes it the most
load-bearing part of the document.

**What happens when it breaks.** Which failures are expected, what the system does, what a
human has to do. This is the section most often skipped and most often needed six months
later.

**What we are deliberately not doing.** A short list. It prevents the most common review
derailment, which is someone raising scope you already considered and dropped.

## Things I stopped doing

**Diagrams that describe boxes rather than behaviour.** A picture of five rectangles labelled
with service names conveys almost nothing. A sequence diagram of the one flow that matters
conveys a lot. If a diagram would take longer to draw than to describe in a sentence, write
the sentence.

**Writing for an imagined future reader.** I used to pad documents with context for the
hypothetical new joiner in two years. That reader does not exist yet; the reviewers do. Write
for the people in the review. If it survives, add context afterwards.

**Estimating in the design document.** Mixing "here is the shape" with "here is how long"
makes both worse, because the conversation collapses into the number and the design goes
unexamined.

**Being precious about it.** The best outcome for a design document is that review changes
it substantially. If I find myself defending a draft rather than updating it, that is a
signal I have started treating the document as mine rather than as a tool.

## The part that took me longest

A design document is a communication artefact, and its audience is usually mixed — engineers
who will build it, and stakeholders who will fund or depend on it. Those two groups need
different things, and the instinct is to write two documents.

What worked better was one document with a genuinely self-contained first page: the problem,
the proposal in a paragraph, what changes for whom, and the risks. Everything below is for
people who need it. A stakeholder who only reads page one should come away with an accurate
picture, not a marketing summary.

If page one is accurate on its own, the rest of the document is engineering. If page one
requires the rest to be honest, something is wrong with the proposal.
