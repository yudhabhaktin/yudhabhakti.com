---
title: From nanosatellites to palm oil estates
description: >-
  I studied Computer Science and Electronics, which sounds like hedging until you
  notice every job I have taken since has been about the seam between the two.
published: 2026-07-12
tags: ['career', 'embedded', 'engineering']
---

My degree at Universitas Gadjah Mada was Computer Science *and* Electronics. At the time
I thought of that as keeping my options open. Looking back, it was the whole thesis. Every
role I have had since has sat on the seam between software and something physical that
answers back.

## Things that answer back

The first system I worked on that genuinely frightened me was UGMSat-1, a university
nanosatellite. I wrote flight software and worked on payload electronics. What I remember
is not the code. It is the realisation that there is no patch window. Whatever you put in
the flash is what runs, and if you got it wrong, you get to think about that for the
remainder of the mission.

That does something to how you write software. You stop treating "it compiles" as progress.
You start asking what happens when the sensor returns garbage, when the clock drifts, when
power browns out mid-write.

Around the same stretch, I worked on a radiation portal monitor built for BATAN,
Indonesia's national nuclear energy agency. Same lesson, sharper edge. A detector that misses is not a
bug report — it is a thing that did not get caught.

Somewhere in the middle of all that, a team of us placed third and took Best Design at
Kontes Robot Indonesia with a dancing humanoid. Less consequential. Much more fun. Still
the same discipline: a robot that falls over during its routine has given you extremely
direct feedback.

<!-- TODO(yudha): if you have a photo of UGMSat-1, the portal monitor, or the robot,
     this is the spot for it. One image here would carry a lot. -->

## Then the world got bigger and messier

Industrial IoT at Evomo — a venture incubated inside Telkom — was the first time I had to
care about systems I could not physically reach. Factory floors, machine-level sensors,
Modbus and MQTT, telemetry arriving from equipment I had never seen. A satellite is remote
but at least it is one satellite. A fleet of gateways in other people's factories is remote
*and* plural.

At Jasa Marga it was toll gates: models running on NVIDIA Jetson devices at the roadside,
fused with LiDAR, classifying vehicles in real time. This is where edge computing stopped
being a buzzword for me and became a set of extremely boring constraints. The device is
hot. The network is bad. Someone will unplug it. You cannot SSH into a toll gate at 2am
because there are cars.

Then agribusiness — estates, refineries, logistics. The systems got further from the metal
and closer to the people. Less firmware, more integration, more standing in a room
convincing someone that the new process is worth learning.

## What actually carried over

The through-line is not a technology. I have written C++, Go, Python, TypeScript, Dart.
None of that is the point.

What carried over is a specific kind of pessimism. Hardware teaches you that the failure
you did not think about is the one that happens, and that the gap between "works on my
machine" and "works in the field" is where the entire job lives. That instinct turns out to
be just as useful when the thing you are deploying is a REST service, or a CI pipeline, or
a model behind an API.

The other thing that carried over is caring whether anyone uses it. A satellite that does
not fly is a hobby. A dashboard nobody opens is the same thing with better margins. Working
on estates and factory floors puts you in front of the people who have to live with your
software, which is uncomfortable in exactly the way that makes the software better.

## Where that leaves me

These days I work mostly on the cloud side — enterprise integration, platform engineering,
applied AI. But I still reach for the same questions. What happens when this is offline?
What does it do with bad input? Who has to fix it at 2am, and can they?

I do not think that is an embedded engineer's instinct or a cloud engineer's instinct. I
think it is just what happens when your software has spent enough time somewhere it could
embarrass you.
