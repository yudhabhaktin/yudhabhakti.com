---
title: Software with no patch window
description: >-
  Working on flight software for a university nanosatellite changed how I write code
  everywhere else, mostly by removing an option I had been quietly relying on.
published: 2018-05-20
tags: ['embedded', 'reliability', 'campus', 'space']
---

I worked on flight software and payload electronics for UGMSat-1, a nanosatellite research
project at Universitas Gadjah Mada. It is the project I bring up most often when someone
asks why I write software the way I do.

The reason is simple and slightly embarrassing: until then, every system I had built had an
implicit escape hatch. If it broke, I would fix it. That assumption was so deep in my
thinking that I did not know it was an assumption until it was removed.

## What "no patch window" does to you

Once you accept that the version you flash is the version that runs, a set of questions
becomes mandatory that had previously been optional.

**What happens when this fails and nobody is looking?** Not "how do I get alerted" — there
is nobody to alert. The system has to handle it or not handle it. Those are the two options.

**What is the recovery path from every state?** Not the happy path with error handling
bolted on. Every state, including the ones you reached by accident. A state machine that can
enter a state it cannot leave is a system that will eventually stop, and "eventually" is not
a long time.

**What does it do with garbage?** Sensors return nonsense. Not sometimes — routinely, on
power-up, during transients, when a connector is marginal. Code that assumes a plausible
reading is code that will act confidently on a value that means nothing.

## The specific habits I picked up

**Watchdogs, and respecting them.** A watchdog timer resets the system if the main loop
stops petting it. The temptation is to pet it from a timer interrupt so it never fires,
which converts a safety mechanism into decoration. Pet it from the place that proves the
system is actually making progress, and let it fire when it should.

**Assume brownouts mid-write.** Power is not clean. If you are writing to non-volatile
storage when the voltage sags, you can end up with a half-written record that is neither the
old value nor the new one. Anything that matters needs to survive being interrupted
partway — write-then-commit, checksums, a known-good fallback.

**Bound everything.** No unbounded loops, no unbounded buffers, no dynamic allocation in the
steady state. Not because dynamic memory is evil but because you want the failure to happen
on the bench at compile time, not much later somewhere you cannot reach.

**Telemetry is not logging.** On a system you cannot attach a debugger to, the beacon is the
only thing standing between you and total ignorance. What you choose to transmit is what you
will be able to reason about later, and you have to make that call before you know what will
go wrong. That is a genuinely hard design problem and I do not think I did it well.

## The part that generalises

Almost none of this is space-specific. I have since deployed models to Jetson devices at
roadside toll gates, gateways on factory floors, and a kiosk agent in a photo booth. In
every case the same reduction applies: **the machine is somewhere inconvenient, and your
ability to intervene is worse than you are imagining.**

Cloud engineering hides this, which is mostly a good thing. You can redeploy in ninety
seconds, so you optimise for iteration speed and that is the correct trade. But the habit of
asking "what does this do when nobody is watching" does not stop being useful just because
you *could* fix it quickly. Most production incidents I have been near were not caused by
the absence of a fix. They were caused by a system confidently doing the wrong thing for
hours before anyone noticed.

<!-- TODO(yudha): worth adding what your specific contribution was — which subsystem,
     which board, what you personally wrote. Right now this reads as a reflection on the
     project rather than on your work in it, and the specifics would make it yours. -->

## An honest caveat

I was an undergraduate on a university project. I do not want to overclaim: this was not a
flagship mission, and plenty of what we built would not survive review by people who do this
professionally.

But the constraint was real, and constraints teach regardless of scale. I learned more from
a small satellite I could not reach than from any system I could redeploy at will.
