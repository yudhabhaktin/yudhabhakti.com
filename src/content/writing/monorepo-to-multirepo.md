---
title: We went from a monorepo to many repos, which is the unfashionable direction
description: >-
  Most writing on this topic argues for consolidation. We split, deliberately, and the
  reasons had almost nothing to do with the code.
published: 2025-10-19
tags: ['architecture', 'platform', 'engineering-management']
---

Nearly everything written about repository structure argues one way: consolidate. Google has
a monorepo, therefore monorepo. The tooling has improved, the arguments are well rehearsed,
and if you say "we split our monorepo" in a room of engineers, someone will assume you did
it by accident.

We did it on purpose, over a couple of months in late 2025, and I want to write down why —
because the reasons were almost entirely organisational, and the technical arguments people
usually have about this were mostly beside the point.

## First, a distinction I kept having to make

A monorepo is not a monolith. They get conflated constantly, including by me, and it makes
the conversation worse.

- **Monolith / services** is a *runtime* question. How many processes deploy, how they
  communicate, where the transaction boundary sits.
- **Monorepo / multirepo** is a *source layout* question. Where the code lives and who can
  see it.

You can have a monolith in a monorepo, services in a monorepo, or a monolith split across
several repos and be miserable in all four configurations for different reasons.

I mention this because I have written elsewhere that for [bykami](/writing/building-bykami)
I deliberately chose a monolith, and someone will reasonably ask how that squares with
splitting repositories here. It squares fine. Different axis, different team size, different
problem. bykami is one person; if it were a repository per domain I would have made my own
life worse for no reason.

## What actually pushed us

**Access boundaries.** This was the big one and it is barely discussed in the usual monorepo
debate, because the usual debate assumes everyone with commit access is on staff.

We worked with external vendor teams. A vendor delivering one component does not need read
access to everything the organisation has ever written — not because anyone distrusts them,
but because "grant the minimum required" is a rule you either follow or do not. Monorepo
tooling has answers here, and they range from "possible" to "brittle." A repository boundary
is a permission boundary that every tool already understands, including the ones you have
not adopted yet.

**CI blast radius.** In a monorepo, a change anywhere can trigger builds everywhere unless
your affected-target detection is genuinely good. Ours was adequate rather than good, and
the failure mode is corrosive: pipelines get slower, people stop reading CI failures because
half of them are unrelated, and then a real failure goes unnoticed for a day.

Scoped repositories gave us pipelines whose results were, by construction, about the thing
that changed.

**Release cadence.** Different products shipped on different rhythms, some tied to business
cycles we did not control. A shared repository creates a soft pressure toward shared
release timing, and where it does not, it creates the constant question of what is safe to
cut a release from.

**Ownership legibility.** With several teams in one repository, "who owns this directory" is
a convention. Code owners help. But new joiners read structure before they read config, and
a repository named after a thing, containing that thing, owned by one team, needs no
explanation.

## What it cost, honestly

I do not want to write the version of this post where the decision was obviously correct.

**Dependency drift is now real and constant.** Shared libraries get versioned, and versions
diverge. In a monorepo, one atomic commit updates everything. Now the same change means a
release, then coordinated bumps, and someone will be four versions behind before you notice.
This is the single biggest ongoing tax and it never goes away.

**Cross-cutting changes need choreography.** A change spanning several repositories cannot be
one atomic commit or one review. It is now a sequence with an ordering constraint, and the
intermediate states have to be valid. Backwards-compatible-then-migrate-then-clean-up,
every time.

**Tooling gets duplicated.** Linters, CI templates, release scripts, dependency policies —
each repository wants its own copy, and copies drift. Reusable workflow templates help a
great deal and are worth building *before* the split rather than after. We did some of this
after, and it showed.

**Discovery gets worse.** Grepping one tree is a real superpower and you will miss it. Good
search across an organisation partially replaces it. Partially.

## What I would tell someone deciding

Ask what is actually hurting.

If the pain is *coordination between teams* — access, ownership, release timing,
unrelated CI noise — repository boundaries help, because those are all organisational
problems and a repository is an organisational object.

If the pain is *keeping code consistent* — shared libraries drifting, cross-cutting refactors
being painful, duplicated tooling — splitting makes it worse. Those are the exact things a
monorepo is good at.

We had the first kind. Someone with the second kind reading a post titled like this one
should not take it as encouragement.

The honest summary is that this is not a question about code. It is a question about how many
groups of people need to move independently, and how much you are willing to pay in
consistency to let them.
