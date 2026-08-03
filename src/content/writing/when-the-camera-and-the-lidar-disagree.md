---
title: When the camera and the LiDAR disagree
description: >-
  Notes on fusing vision with LiDAR for real-time vehicle classification — why we moved
  from classification to detection, and why sensor disagreement turned out to be the most
  useful signal we had.
published: 2021-10-23
tags: ['edge', 'ml', 'computer-vision', 'sensors', 'deployment']
---

For most of this year I have been working on real-time vehicle classification at roadside
gates: a vehicle arrives, and within a fraction of a second the system has to decide what
kind of vehicle it is, because something downstream — a barrier, a charge, a record — depends
on the answer.

Two sensors watch the lane. A camera and a LiDAR. Getting them to agree, and understanding
what it means when they do not, was most of the work.

## We started with classification, which was the wrong shape

The first version was a classifier. Take the image, run it through a network, get a class out
of a fixed set. This is the problem shape you get in every tutorial and every benchmark, and
it performed well on our held-out set.

It performed well because our held-out set had inherited an assumption we had not noticed:
that the vehicle is already isolated, centred, and alone.

In a real lane, none of that holds:

- A motorcycle sits beside a truck and both are in frame.
- A trailer extends past the frame, so the classifier sees a fragment.
- A vehicle triggers the capture early and is half in the image.
- Something occludes something else at exactly the moment you sample.

A classifier has no vocabulary for any of this. It is obliged to return a class for whatever
it is handed, with a confidence that reflects how well the pixels match a category — not
whether the question made sense. Hand it a photograph containing two vehicles and it does not
say "there are two." It says one of them, confidently.

**Classification presupposes a segmentation step you have not built.** In the lab that step is
performed silently by whoever built the dataset. In the field there is nobody to do it.

So we moved to detection: find the objects, place a box around each, then classify each box.
That change fixed a whole category of failure at once. Multiple objects became representable.
Partial objects became detectable as partial. And critically, the box is a geometric claim —
something you can check against another sensor, which a bare class label is not.

That last property is what made fusion possible at all.

## What the second sensor is actually for

The naive reason to add LiDAR is accuracy: two sensors, average them, better answer. That is
not the reason, and averaging them is a mistake.

The reason is that **the two sensors are wrong for unrelated reasons.**

A camera measures appearance. It is defeated by things that change appearance without
changing the vehicle: low sun straight into the lens, headlights at night, a wet road
throwing reflections, heavy rain, an unusual paint scheme or livery, a shadow that reads as
an edge.

A LiDAR measures geometry. Length, height, and profile are physical facts it recovers
directly, in the dark, in conditions where the camera is having a bad time. It is defeated by
its own things: heavy rain and spray produce spurious returns, dark or wet surfaces return
weakly, resolution falls off with distance, and it cannot read anything painted on a surface.

Because the failure modes are close to independent, the combination is far more robust than
either — but only if you combine them in a way that *preserves* the independence. Blend the
two into one averaged score and you have thrown away the only thing you bought.

## Fuse at the decision level, and keep the disagreement

We fused late. Each sensor produces its own hypothesis — camera: a class with a confidence;
LiDAR: a geometric profile with dimensions — and a small amount of explicit, readable logic
reconciles them.

Explicit logic, not a learned fusion head. That was deliberate. This decision has consequences
for someone, and when it goes wrong a human has to be able to look at a log line and
understand why. A learned fusion layer that is two per cent better and completely opaque is
a bad trade in a system somebody has to operate and defend.

The rules that mattered were mostly about geometry overruling appearance. Physical dimensions
are hard evidence. If the LiDAR profile is unambiguous and the camera disagrees, the geometry
usually wins, because appearance has far more ways to lie about a vehicle than length does.

**And then the important part: we logged every disagreement.**

That turned out to be the most valuable data in the system. Disagreement is not noise — it is
an automatically generated queue of exactly the cases the system finds hard, produced without
anyone labelling anything. Every morning there was a set of frames where the two sensors saw
different worlds, and that set was where the fog lights, the unusual trailers, the roof racks,
the one lane with a reflective surface, and every genuine model weakness lived.

Sorting training effort by disagreement rate beat every other prioritisation we tried. A
single-sensor system cannot do this at all. It has confidence, and confidence is a statement
about the model's expectations, not about the world — it is perfectly capable of being high
and wrong, which is the failure you most need to find.

## Calibration is the entire game

Fusion assumes both sensors agree about space and time. Neither is free.

**Space.** The extrinsic calibration — where each sensor sits relative to the other — has to
be accurate enough that a box in the image and a cluster in the point cloud can be matched
with confidence. It also drifts. Mounts vibrate. Metal expands in the sun and contracts at
night. Someone reverses a maintenance vehicle into a pole. A system that only calibrates at
installation degrades silently, and the symptom is not an error message, it is a slow rise in
disagreements that looks like a model problem.

We ended up treating recalibration as routine maintenance rather than an incident, and
monitoring calibration health as a first-class metric.

**Time.** This one is unforgiving and easy to underestimate. A vehicle at 60 km/h covers
about 1.7 metres in 100 milliseconds. If your camera frame and your LiDAR sweep are 100 ms
apart, you are fusing two observations of a vehicle that was in materially different places,
and in dense traffic you can associate the camera's view of one vehicle with the LiDAR's view
of the next one — which produces a confident, coherent, entirely wrong answer.

You want hardware triggering, or at minimum a shared clock and timestamps you trust at the
source. Timestamps applied when a message is *received* by software are not timestamps, they
are a measurement of your own queueing delay.

## Rolling it out, which was most of the effort

The model was a fraction of the work. The rest was getting it into the field without breaking
anything, across sites that were all subtly different.

**Every site is its own deployment.** Mounting height, angle, lane width, approach speed,
ambient light, how far the lane is from the sensor. A configuration tuned at the pilot site
degrades elsewhere, and the honest response is site-specific *calibration and configuration*
rather than site-specific models. One model with per-site parameters can be maintained. A
model per site cannot — you will not retrain them all, and the fleet will silently fragment
into versions nobody can account for.

**Shadow mode first.** New model runs alongside the incumbent, sees live traffic, and its
output goes to a log rather than to the barrier. You get real data on real distribution with
zero consequences, and you find out how the two versions differ before anyone is affected. I
would not roll out a decision-making model any other way now. Every accuracy number obtained
before shadow mode was an estimate; the first honest number came out of it.

**Waves, with a canary.** One site, then a few, then the rest. A staged rollout is not
caution, it is the only mechanism by which a mistake costs one site instead of all of them.

**Health that means something.** "The process is running" is not health. A vision process
that is running and producing plausible-looking rubbish is worse than one that has crashed,
because nothing pages anybody. Health had to mean recent output exists, is plausible, and the
two sensors are still agreeing at roughly their historical rate. That last one caught real
faults — a lens gradually obscured, a mount knocked out of alignment — long before anything
else would have.

**Rollback that survives the thing it is rolling back.** If a bad update can make a device
unreachable, the rollback cannot depend on reaching it. It has to be local, automatic, and on
a timer.

The performance side of this — why a model that hits its latency target on the bench misses
it on a pole in the afternoon — is
[its own set of problems](/writing/models-that-are-fast-in-the-lab), and mostly a story about
thermal throttling and preprocessing.

## What I would carry to the next one

**Match the problem shape before optimising the model.** Months of accuracy work on the
classifier were worth less than the structural change to detection, because the classifier
was answering a question the field was not asking.

**Add sensors for uncorrelated failure, not for accuracy.** If a second input fails in the
same conditions as the first, it is cost without robustness. The question to ask about any
additional sensor is: when this one is wrong, is the other one also wrong?

**Instrument disagreement everywhere.** This generalises well beyond sensors. Two models, a
model and a rule, a new pipeline and the old one — anywhere two things answer the same
question, the cases where they diverge are the cheapest high-quality dataset you will ever
get. I now build that logging in from the start.

**Confidence is not correctness.** Every seriously wrong output this system produced was
produced confidently. The value of the second sensor was never that it was more accurate. It
was that it was the only thing in the system capable of contradicting the first.
