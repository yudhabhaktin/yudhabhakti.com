---
title: Teaching a robot to dance, and what the judges actually rewarded
description: >-
  Third place and Best Design at Kontes Robot Indonesia 2017. The trophy we cared about
  was the second one, and it was won away from the arena.
published: 2017-07-15
tags: ['robotics', 'competition', 'embedded', 'campus']
---

Kontes Robot Indonesia has a division where humanoid robots perform a traditional dance
routine. It sounds whimsical. It is one of the more unforgiving problems a student team can
take on, because a dancing robot has to do the hardest thing in bipedal robotics — shift its
weight repeatedly, on purpose, in time with music — while looking effortless.

Our team took third place nationally and Best Design with a robot called Al-Fan, in the year
Gadjah Mada Robotic Team took the overall national title. I want to write about the design
award, because it taught me more.

## A dance routine is a scheduling problem with consequences

A humanoid with twenty-odd degrees of freedom is a machine for accumulating error. Every
servo has backlash. Every joint has compliance you did not model. The floor is never quite
flat, and the arena floor is never the floor you practised on.

The routine is a timed sequence of poses. Interpolate between them and you get motion. That
part is easy and produces something that falls over immediately.

What makes it work is that the centre of mass has to stay over the support polygon — the
area bounded by whichever feet are on the ground — through the entire transition, not just
at the start and end poses. A move that is stable in both keyframes can be violently
unstable halfway through, and interpolation will find that instability for you reliably.

So you spend your time not choreographing poses but choreographing *weight*. Where is the
mass, which foot is carrying it, and how long does it stay there. The dance is downstream of
that.

## The music does not adapt

This is the constraint that makes it genuinely hard. A walking robot can slow down when it
feels unstable. A dancing robot cannot, because the music is a fixed timeline and the judges
can hear it.

You are committed to hitting a pose at a wall-clock instant regardless of what the robot's
state estimate thinks. So every move gets budgeted: the transition has to complete with
enough margin that a slightly slow servo does not cascade into the next beat. We ended up
building the routine backwards from the tightest transition and padding everything else.

Real-time in the textbook sense — a deadline that is part of correctness, not a performance
target.

## Where Best Design was actually won

Here is the thing I did not expect. The design award was not decided by the routine. It was
decided by the documentation, the mechanical layout, the wiring, and our ability to explain
why we chose what we chose.

Our robot was not the flashiest in the arena. But we could open it up and show a judge a
serviceable cable run, a frame where you could reach the servo horns without disassembling
the torso, and a build log explaining the trade-offs. When something broke between rounds —
and something always breaks between rounds — we could fix it in the pit in minutes because
the machine had been designed by people who assumed it would need fixing.

That is the whole lesson. **Maintainability is a design property you can see from the
outside, and people who evaluate systems for a living can tell within about thirty
seconds.** A judge picking up your robot is doing code review with their hands.

## What transferred

I have never worked on a humanoid since. I have repeatedly worked on systems where the real
question was "how fast can someone who is not you fix this at an inconvenient time," and
that question has the same answer it had in the pit at KRI: it depends on decisions you made
weeks earlier, when it would have been easier not to.

The dance was fun. The wiring was the education.
