---
title: What actually changed after six months of coding with an agent
description: >-
  Notes from using Claude Code daily. The productivity claims are roughly right and
  roughly beside the point — what moved was where the bottleneck sits.
published: 2025-12-14
tags: ['ai', 'tooling', 'engineering-management', 'workflow']
---

I have been using Claude Code as part of my daily work for a while now. I want to write down
what changed, because most of what I read on this subject is either a demo of something
trivial or an argument about whether the whole category is legitimate, and neither is useful
if you are trying to decide how to work.

Short version: the speed claims are broadly real, and they matter less than I expected,
because the constraint moved rather than disappeared.

## Where it is genuinely strong

**Unfamiliar code.** This is the use I did not anticipate and now rely on most. Dropping into
a repository I did not write and asking what a subsystem does — and then asking follow-up
questions against the actual source rather than the README — collapses the slowest part of
touching someone else's code. It is not always right, but it is right enough to orient, and
orientation was the expensive part.

**Mechanical transformation with a clear specification.** Migrating a test suite between
frameworks. Applying a consistent change across many files. Writing the boring half of an
integration once the interesting half is decided. Work where correctness is checkable and the
shape is known.

**Tests, especially the ones I would skip.** I know which edge cases I ought to cover and I
have historically written about two thirds of them. That fraction went up, mostly because the
marginal cost of the boring third fell.

**First drafts of things I would otherwise put off.** A script, a Terraform module for
something I have set up by hand three times, a migration I have been avoiding. The gap
between "I should automate this" and "I have automated this" narrowed considerably.

## Where it is not

**Anything requiring context that lives in people.** Why the finance team needs the cutoff at
that hour. Which vendor integration is politically load-bearing. Why a previous engineer made
a choice that looks wrong and is not. None of that is in the repository, so none of it is
available, and confident output built on a missing constraint is worse than no output.

**Genuinely novel domain logic.** When the hard part is deciding what the system should do,
generating an implementation of a decision I have not made is not help.

**Judging its own confidence.** It does not reliably distinguish "this is a well-trodden
pattern" from "I am extrapolating." Both arrive in the same tone. That is the failure mode
you have to build habits around.

## The bottleneck moved to review

This is the actual change and it took me a while to name.

Writing code was never the slowest part of shipping software for me, but it was a real part.
Now it is small. What has not got faster is *understanding* code well enough to be
responsible for it — and that is now nearly the whole job.

Which produces a specific temptation. When a diff arrives that looks plausible, passes tests,
and is larger than something you would have written by hand, the cost of reviewing it
properly is higher than the cost of accepting it. Accepting feels efficient. It is how you
end up as the owner of a system nobody understands, including you.

The rule I settled on: **I do not merge code I could not have written, or could not explain
to someone else.** Not "code I did not write" — that would rule out the whole thing. Code I
could not defend line by line in a review.

Sometimes that means asking for it to be simpler. Often the second version is better anyway,
because the first draft optimised for looking complete.

## What I changed about how I work

**Smaller units.** Long autonomous runs produce diffs too large to review honestly, and an
unreviewed large diff is a liability regardless of who wrote it. Short cycles with a look at
each one.

**Write the constraints down first.** The quality of the output tracks the quality of the
specification almost linearly. This is the same skill as writing a good design document or a
good ticket, and it turns out I was relying on shared context to paper over vague
requirements more than I realised. An agent has no shared context, so vagueness surfaces
immediately — which has made me better at writing requirements for humans too.

**Version control discipline got stricter, not looser.** Small commits, clear messages,
never a dirty tree before a large change. When more code moves per hour, the ability to
reset cleanly matters more.

**Tests before, not after.** If a check exists, the loop can close on its own. If not, I am
the check, and I am slower and less consistent than a test.

## The thing I am unresolved about

I mentored for a year, and the part of mentoring that works is watching someone be stuck and
resisting the urge to fix it for them. Being stuck is where the learning happens.

Agentic tools are extremely good at removing that experience. A junior engineer now has a
patient, infinitely available thing that will resolve any stuckness immediately. I do not
know what that does to how people develop judgement, and I am suspicious of anyone confident
in either direction.

What I have started doing on my own team is asking people to explain changes rather than
demonstrate them. Not as a test — as the normal way we talk about work. If the explanation
is fluent, the understanding is there regardless of what produced the diff. If it is not,
that is the conversation we needed to have, and it would have been needed before these tools
existed too.

## Would I go back

No. But I would push back on the framing that this is mainly about speed.

What it changed for me is that the expensive parts of software engineering are now more
clearly the expensive parts: deciding what to build, understanding what exists, and being
accountable for what ships. Typing was never the job. It is just more obvious now.
