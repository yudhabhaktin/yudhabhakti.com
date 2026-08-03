---
title: Modbus, MQTT, and the machines that were never meant to talk to you
description: >-
  Industrial telemetry is not a protocol problem. It is an archaeology problem with a
  protocol attached.
published: 2020-06-14
tags: ['iot', 'industrial', 'protocols', 'architecture']
---

My first job out of university was building industrial IoT products — connecting machines on
factory floors to a platform that could tell a plant manager how their equipment was
actually performing.

I expected the hard part to be scale, or the cloud architecture, or the analytics. It was
none of those. The hard part was that the machines were built by people who never imagined
you would ask them anything.

## Modbus is from 1979 and it is not going anywhere

If you have not met it: Modbus is a protocol for reading and writing numbered registers over
a serial line or TCP. That is the whole thing. It is old, it is simple, and it is
*everywhere* on factory floors, because it is simple enough that every PLC vendor implements
it and old enough that everything already speaks it.

What Modbus does not have is semantics. You can read register 40012. Modbus will not tell
you that register 40012 is spindle speed in RPM, or that it is a signed 16-bit value, or
that the vendor scaled it by ten because they needed one decimal place and integers were
what they had.

That information lives in a PDF. Sometimes the PDF is in a language you do not read.
Sometimes the PDF describes a firmware revision that is not the one installed. Sometimes
there is no PDF and there is a person named Pak Budi who knows, and Pak Budi is on leave.

**Integration work in this domain is mostly archaeology.** Reading the register map,
validating it against a machine that is running, and discovering that byte order is
big-endian except on the one vendor where it is not.

## The register map is a contract nobody signed

Once you have decoded a machine, you have built something fragile: an implicit contract
between your code and a device that has no idea your code exists.

Nothing stops a maintenance engineer from swapping a controller for a newer model where the
registers moved. Nothing announces it. Your telemetry just quietly becomes wrong — not
absent, which you would notice, but *wrong*, which you might not.

The defence I settled on was validation at the edge. Range checks on every value, derived
from what the machine can physically do. A spindle that reports 40,000 RPM is not fast, it
is misconfigured. Catching that at the gateway, next to the machine, is worth ten dashboards
downstream, because by the time a bad value reaches an aggregate nobody can tell which
machine lied.

## Where MQTT comes in, and what it does not solve

Modbus is polled: you ask, it answers. That is fine for one machine on a bench and
unworkable for a floor of them over a link you do not control.

MQTT flips it. The gateway polls locally over Modbus, then publishes changes to a broker.
The plant network stays chatty; the uplink carries a fraction of that.

The genuinely useful part is not the pub/sub. It is that a broker-based design forces you to
answer the offline question honestly. Factory connectivity is bad. Not "occasionally
degraded" — actually bad, with outages measured in hours, often because someone unplugged
something to run a vacuum cleaner.

So the gateway buffers. Locally, persistently, with a bounded store and an explicit policy
for what to drop when it fills. And then you get to make an uncomfortable decision: when the
link returns and you have four hours of backlog, do you replay it all, or do you skip to
current state? For OEE you need the history. For a live dashboard you need now. Doing both
means two paths and two sets of bugs.

Nobody's architecture diagram has this on it. It is most of the work.

## The pattern that survived

The gateway pattern is the thing I still reach for. One small process, physically near the
equipment, that:

- speaks the local dialect, however cursed
- validates against physical reality before anything leaves the building
- buffers when the uplink is gone
- publishes one clean, versioned schema upward

Everything upstream then gets to be ignorant of Modbus, of vendor quirks, of which PLC
generation is installed at which plant. The mess is contained in the one component that is
allowed to be messy.

I have rebuilt some version of that component in four different contexts now — factory
floors, roadside devices, a photo booth. The domain changes. The shape does not.

## The part I underrated

I spent that job thinking the value was in the platform. Looking back, the value was in the
demos I did on factory floors, standing next to a machine with the person who runs it,
watching them see their own line's numbers for the first time.

That is where you find out whether the number you computed means what you think it means.
It usually does not, at first. There is no substitute for being in the building.
