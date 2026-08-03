---
title: KOMURINDO — pointing an antenna at a rocket that will not wait
description: >-
  We built an antenna tracker for a ballistic rocket payload. The hard part was never
  the maths. It was that the rocket does not care whether you are ready.
published: 2015-09-20
tags: ['embedded', 'competition', 'rf', 'campus']
---

<!-- TODO(yudha): confirm the year. I dated this 2015 because that fits your degree
     timeline, but check it against your own records before publishing. If you placed,
     say so here — search turned up a 1st place in Muatan Roket at KOMURINDO/KOMBAT 2015
     under a similar name and I did not want to claim it for you incorrectly. -->

KOMURINDO is the Indonesian student rocket payload competition. Teams build a payload,
it goes up on a rocket, and you have a few minutes to prove your electronics did
something useful on the way down.

Our team worked on the Antenna Tracker System for a ballistic payload. Someone else's job
was to survive the launch. Ours was to make sure that when it started talking, we were
listening.

## The problem, stated simply

A payload transmits telemetry. The transmitter is small and its antenna is omnidirectional,
because a tumbling payload cannot aim at anything. That means the signal is weak in every
direction equally.

On the ground you want a directional antenna — a Yagi — because gain is the cheapest thing
you can add to a link budget. But a directional antenna only helps if it is pointed at the
thing you want to hear. And the thing you want to hear is a rocket.

So: a Yagi on a pan-tilt rig, two servos, and something that decides where to point.

## Everything I assumed was wrong

The naive version is easy. The payload sends GPS. You know where you are standing. Compute
azimuth and elevation, drive the servos, done. I wrote that in an afternoon and felt
extremely competent.

Then you think about it for one more minute.

**You need the signal in order to know where to point, and you need to point in order to get
the signal.** At the moment the payload is furthest away and the link is weakest, you are
relying on data that arrives over that same weak link. The system's worst case is exactly
where it is most needed.

**GPS is late.** The position you receive describes where the payload was, not where it is.
For something moving slowly this is a rounding error. For something on a ballistic arc it is
the difference between pointing at the rocket and pointing at where the rocket used to be.
We ended up extrapolating forward from the last known velocity vector, which felt like
cheating and worked far better than the honest version.

**Servos have a slew rate.** Near apogee the angular rate is manageable. On the way up and
during descent it is not, and the mount simply cannot rotate as fast as the geometry
demands. There is no software fix for a motor that is already at full speed.

**Acquisition is a separate problem from tracking.** Before the first packet arrives you
have nothing to track. We ended up pre-pointing at the expected launch azimuth and elevation
and treating the first valid fix as a handover from open-loop guessing to closed-loop
tracking.

## What we actually built

A microcontroller reading telemetry from the radio, parsing the payload's GPS, computing
the pointing solution, and driving two servos through a simple control loop. A local GPS and
a magnetometer to know where the ground station itself was and which way it faced — you
cannot compute a bearing if you do not know your own heading, and "just line it up with
north by eye" is a sentence that sounds fine until you say it out loud in a field.

Plus a manual override, because the most useful feature in the entire system was a human
with a joystick who could see the rocket.

## The field is not the lab

We tested on campus by walking a transmitter around the field while the tracker followed.
It worked beautifully. A person walking is slow, stays at roughly zero elevation, and
politely does not leave.

At the launch site none of those hold. The rocket goes nearly vertical, which means azimuth
becomes ill-conditioned near the zenith — a small positional error swings the required
bearing wildly, and the mount chases itself. Our test data had never gone above about five
degrees of elevation, so we had simply never seen the failure mode that dominates the actual
flight.

That is the lesson I still carry. Not "test more." Specifically: **your test conditions
encode assumptions you did not know you were making**, and the ones that matter are the ones
you never varied.

<!-- TODO(yudha): a photo of the ground station rig, or the team at the launch site,
     belongs here. This post is the best candidate on the site for one. -->

## Why I still think about it

Years later I built inference stacks on Jetson devices at roadside toll gates, and the
constraints rhymed almost exactly. A device you cannot reach. A sensor whose data arrives
late. A physical process that will not slow down for you. A control loop that has to make a
decision with the information it has rather than the information it wants.

I did not know at the time that a student rocket competition was training for
industrial edge computing. It was.
