---
title: LoRa is not Wi-Fi with better range
description: >-
  Everything that goes wrong with a LoRa deployment goes wrong because someone treated
  airtime as free. It is the only thing that is not.
published: 2020-11-08
tags: ['iot', 'lora', 'protocols', 'industrial', 'architecture']
---

Once you have wired up the machines that have power and an Ethernet drop, you are left with
the sensors that have neither. The tank at the far end of the yard. The pump in a building
with no network. The gate on a boundary road, two kilometres from anything.

This is where someone in the room says LoRa, and everyone nods, and the deployment is
budgeted as though LoRa were Wi-Fi that reaches further.

It is not. It is a **link budget with a duty cycle attached**, and almost every LoRa project
that disappoints people does so because that sentence was not internalised early enough.

## The trade you cannot get out of

LoRa's range comes from chirp spread spectrum, and the dial is the spreading factor. Turn it
up and the signal survives at a lower signal-to-noise ratio, so it goes further and through
more concrete.

The cost is airtime, and it is not linear. Each step up the spreading factor roughly doubles
how long a given payload occupies the channel. Between the cheapest and most expensive
settings, the same handful of bytes can take something like twenty times as long to transmit.

Which means range, capacity, and battery life are all the same dial:

- **Longer range** → longer airtime → **fewer messages per hour** and **more battery per
  message**
- More devices → more airtime competing for the same channel → **collisions**, which in an
  unacknowledged protocol you do not find out about

There is no configuration that is good at everything. There is a budget, and you are
spending it whether or not you have written it down.

## Airtime is the scarce resource. Not bandwidth

This is the reframe that made the technology make sense to me.

With Wi-Fi or cellular you think in throughput. With LoRa you think in **seconds of channel
occupancy per device per hour**, because regulators and network operators both cap it, and
because the physics caps it before they do.

Everything follows from that:

**Your payload is a dozen or so bytes.** Not "keep it small." Actually that. You are not
sending JSON. You are packing a binary structure — a scaled integer here, a bitfield there,
a two-bit status code — and writing a decoder on the other end.

And now you have built a register map. Same object I complained about with
[Modbus](/writing/modbus-mqtt-and-the-factory-floor): an implicit contract between a device
in a field and a decoder in a cloud, with nothing to enforce it and nothing to announce when
it changes. Version the payload. Spend one of your precious bits on a format version. You
will be grateful in eighteen months when half the fleet is on old firmware and the other half
is not.

**You cannot send a heartbeat every ten seconds.** People try. A sensor reporting every ten
seconds at a long spreading factor is one device consuming an unreasonable share of a shared
channel, and it will still be flat inside a year.

The discipline this forces is genuinely useful: you have to decide what the data is *for*
before you decide how often to send it. Most telemetry people ask for at ten-second
resolution is looked at once a day. Send on change with a floor and a ceiling — report when
the value moves more than a threshold, at minimum every hour so you can tell "unchanged"
from "dead" — and you have cut your airtime by an order of magnitude while losing nothing
anybody was using.

## Downlink is where the assumptions break

This is the one that bites hardest, and it is barely mentioned in the marketing.

A LoRa uplink is a device deciding to talk. A downlink is the network wanting to talk to a
device that is asleep. In the low-power operating class — which is the one you want, because
the others cost battery continuously — the device only opens a brief receive window *after*
it transmits.

So "push a configuration change to that sensor" is not an operation that exists. What exists
is "queue a change, and it will apply the next time the device happens to check in," which
may be an hour, or tomorrow, or never if it is out of range that day.

Practical consequences:

- **No remote firmware update.** Not "hard." At these payload sizes and duty cycles, pushing
  a firmware image is a theoretical exercise. Plan for someone physically visiting the
  device, and choose your hardware accordingly.
- **Configuration must be a device-side decision.** Ship sensible defaults and let the device
  decide, rather than designing a system where the cloud steers the edge.
- **Acknowledgements are expensive.** Confirmed messages consume downlink capacity that
  scales badly with fleet size. Design the application to tolerate loss instead. Sequence
  numbers so the server can spot gaps, and readings that are absolute rather than
  incremental — because a lost delta is a permanently wrong total, and a lost absolute
  reading is just a gap.

That last point is the general one. **Make every message independently meaningful.** Any
protocol where the receiver reconstructs state by accumulating messages will eventually be
wrong over a lossy link, and it will be wrong quietly.

## So what is it actually for

Having listed the constraints: within them it is excellent, and nothing else does the same
job.

**Good fit:** small, infrequent, loss-tolerant readings from somewhere with no power and no
cable. Tank level. Vibration RMS. Temperature and humidity. Gate open or closed. Runtime
hours. Years on a battery, kilometres from the gateway, no SIM and no monthly fee per device.

**Bad fit:** anything you need now. Anything you need acknowledged quickly. Anything with a
real payload. Anything where a missed message is a problem rather than an inconvenience.
Control — do not put an actuator on the far end of a link that cannot promise to reach it.

The engineering judgement is not "LoRa or Ethernet." Real sites are mixed, and the useful
question is per-signal rather than per-site: for *this* measurement, what is the smallest,
cheapest, most boring link that carries what it is worth?

In practice that produced three tiers on the same site. Wired Modbus over Ethernet for
machines with power and a cable. Cellular for a handful of things that needed to be current.
LoRa for the long tail of cheap sensors where nobody was going to run conduit.

## The bit that made it work

Three transports, and upstream of the gateway, one schema.

The gateway absorbs it: decodes the LoRa binary, polls the Modbus registers, validates
everything against what the equipment can physically do, buffers when the uplink is gone, and
publishes one clean versioned message shape. Nothing further up knows or cares which sensor
arrived over which link.

That is the same component I keep rebuilding, and this was the deployment that convinced me
it is not a pattern I happen to like — it is the only place the mess *can* go. Push transport
details upward and every consumer inherits them forever.

## What I actually took from it

The constraint is the useful part.

When a link costs nothing, you send everything, and you never find out which of it mattered.
When you are rationing bytes per hour, you are forced into a conversation with the person who
wants the data about what they will genuinely do with it — and that conversation, not the
radio, is where most of the value in these systems is.

I have caught myself since, on projects with no bandwidth constraint at all, asking the LoRa
question anyway: if you could only send twelve bytes an hour, what would you put in them?

The answers are usually shorter than the specification.
