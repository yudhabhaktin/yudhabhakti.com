---
title: Detection thresholds and the cost of being wrong
description: >-
  Working on a radiation portal monitor taught me that choosing a threshold is not a
  technical decision. It is a decision about which mistake you would rather make.
published: 2018-02-26
tags: ['embedded', 'instrumentation', 'statistics', 'campus']
---

Over January and February this year I worked on the embedded side of a radiation portal
monitor — the "Merah Putih" system — built for BATAN, Indonesia's national nuclear energy
agency. A portal monitor is the thing a vehicle drives through that decides whether it is
carrying something it should not be.

Two months is not long. It was long enough to overturn the assumption I walked in with.

I am going to keep this conceptual rather than specific. The general problem is well
documented in the public literature and worth writing about; the particulars of a detection
system built for a national agency are not mine to publish.

## The thing nobody tells you about detection

I arrived thinking the job was sensitivity. Build a detector good enough to see the signal,
and you are done.

The actual job is that **there is always a signal.** Background radiation is everywhere —
from the ground, from building materials, from the sky, from the cargo itself. A truck full
of bananas is measurably radioactive. So is a load of ceramic tiles, fertiliser, or granite.

So the detector is never choosing between "something" and "nothing." It is choosing between
"the usual amount of something" and "more than usual," and both of those are random
variables. Counting statistics are Poisson: even with a perfectly stable source, the number
of counts in a fixed window fluctuates. Two identical measurements of an identical truck
will not agree.

You are not detecting a threat. You are detecting a *deviation*, in a quantity that deviates
on its own.

## Which means the threshold is a values question

Set the threshold low and you catch more real events — and you also stop trucks full of
bananas. Every false alarm costs someone time, and worse, it teaches the operator that
alarms are noise. A system that cries wolf gets ignored, and an ignored detector has an
effective sensitivity of zero regardless of what the datasheet says.

Set the threshold high and the operators trust it — right up until the one time it matters.

There is no setting that avoids both errors. There is only a trade, and the trade is not
made by the detector or by the engineer. It is a policy decision about which failure the
institution is willing to own.

That was genuinely disorienting for me as an undergraduate. I wanted the answer to be in the
physics. The physics gives you the shape of the curve. It does not tell you where to stand
on it.

## What that changed about how I build

**Background is not noise to be removed, it is context to be modelled.** A fixed threshold
across all conditions is wrong because the baseline moves — with weather, with time of day,
with what came through before. A system that adapts its expectation to current conditions
outperforms a more sensitive one that assumes the world is stationary.

**Integration time is a real dial.** Count longer and the statistics tighten. But the truck
is moving, so the time you have is set by physics and traffic, not by what you would like.
Almost every sensing system has this trade buried in it somewhere: precision against
latency, and something external deciding how much latency you are allowed.

**The alarm is a user interface.** What the operator sees, how fast, and what they are
supposed to do about it, determines whether the system works. I have watched well-built
detection systems fail because the alarm gave someone no actionable next step. The
instrument was fine. The loop through the human was broken.

## Where this comes back

Every threshold I have set since has felt like the same question wearing different clothes.
An anomaly detector on a factory line. A confidence cut-off on a vision model deciding
whether a truck load passes inspection. A retrieval system deciding whether a document is
relevant enough to show someone.

In every case the instinct people have — including mine — is to ask "how accurate is it?"
That question has no useful answer on its own. The useful question is: **when it is wrong,
which direction do you want it to be wrong in, and who pays?**

Ask that first. The threshold falls out of the answer.
