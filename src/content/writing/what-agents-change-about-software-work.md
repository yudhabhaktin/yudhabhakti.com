---
title: What agentic development actually changes, and what it does not
description: >-
  A year in, the interesting question is no longer whether these tools work. It is which
  parts of the job were ever about writing code.
published: 2026-03-22
tags: ['ai', 'engineering-management', 'industry', 'workflow']
---

The argument about whether AI coding tools are useful is mostly over in the teams I work
with. They are in the workflow, the same way version control and CI are in the workflow, and
the conversation has moved on to harder questions about what to do differently.

This is my attempt at those questions, written from inside a team rather than from a
position on the industry.

## The part that is real

Implementation is cheaper. Not free, and not uniformly — but the cost of turning a decided
design into working code has fallen enough to change what is worth doing.

The clearest effect is on work that was previously below the threshold of worth-it. The
internal tool nobody had time for. The test coverage on the module everyone avoids. The
migration deferred for three quarters because the payoff did not justify two weeks. A lot of
that is now a day, and a surprising amount of accumulated organisational debt is debt only
because paying it was tedious rather than difficult.

The second effect is on unfamiliar territory. Getting oriented in a codebase you did not
write, or a language you use twice a year, is much faster. For a lead spread across several
products, this is the change I feel most.

## The part that is overstated

**Deciding what to build did not get easier.** It is still the hardest part and it is still
bottlenecked on talking to people who have the problem. No agent has told me what the finance
team actually needs at month end, because that information exists in a conversation that has
not happened yet.

**Understanding a system did not get cheaper in the way it looks like it did.** You can get
an explanation of any component in seconds. You cannot get, in seconds, the thing that makes
someone genuinely useful in a system — the accumulated sense of which parts are fragile, what
broke last time, which invariant nobody wrote down. That comes from time and incidents.

**Review did not get faster.** It got more important and more voluminous. This is the real
constraint now, and I do not think the tooling has caught up to it.

## The thing I actually worry about

Not job displacement. The thing I worry about is **accountability drift**.

Software has always had a chain where someone is responsible for each part. Agentic
development stretches that chain in a way that is easy to miss, because the artefact looks
the same. A merged pull request looks identical whether its author can defend every line or
skimmed it and trusted the tests.

The failure will not be dramatic. It will be a system that works, that passes review, that
nobody on the team can reason about when it behaves strangely at an inconvenient moment. And
by the time you find out, the person who merged it has moved teams.

I do not think the answer is process. Requiring people to attest that they understand their
diffs produces attestation, not understanding. What has worked on my team is cultural and
smaller: we ask people to explain changes conversationally, as the ordinary way we discuss
work. Fluency shows up quickly, and so does its absence. That was true before these tools and
is just more load-bearing now.

## What I think this does to how teams are shaped

Speculative, and I hold it loosely.

**The value of specification goes up.** The scarce skill is stating precisely what should be
true, in a way that survives contact with an implementer that has no shared context. This is
the design document skill, the good-ticket skill, the acceptance-criteria skill — all of
which were previously undervalued because a human implementer would fill gaps from context.

**The gap between "can code" and "can engineer" widens.** Producing a working implementation
of a specified thing is now broadly available. Deciding what should exist, what the failure
modes are, and what you are trading away — that is not, and the difference is more visible
than it was.

**Junior engineering is the open problem.** The traditional path ran through exactly the work
that is now cheapest. You learned by writing the boring implementation, being stuck, and
getting unstuck. If that rung is gone, something has to replace it, and I have not seen a
convincing answer. My own imperfect approach has been to hand juniors more design and
review responsibility earlier than I would have, which is uncomfortable for everyone and
better than the alternative of giving them work an agent does in a minute.

## The summary I would defend

The tools are good, the productivity claims are directionally right, and neither of those is
the interesting part.

What has actually happened is that a set of activities that were always the real work —
understanding a domain, deciding what to build, being accountable for what ships — are now a
larger fraction of the job, because the activity that used to sit alongside them has
shrunk.

That is a change in mix, not a change in kind. It rewards the same people it always
rewarded, slightly more obviously.
