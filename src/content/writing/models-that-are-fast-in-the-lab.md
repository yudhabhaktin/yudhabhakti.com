---
title: Your model is fast in the lab and slow on the pole
description: >-
  Notes on getting neural networks to run in real time on edge devices, where the
  benchmark you optimised is almost never the one that matters.
published: 2022-03-19
tags: ['edge', 'ml', 'performance', 'deployment']
---

I spent a couple of years putting computer vision models on NVIDIA Jetson devices doing
real-time classification in the field — outdoors, unattended, on hardware bolted to
infrastructure.

The recurring experience was this: the model hits its latency target on the bench, gets
deployed, and is slower. Sometimes much slower. Sometimes only in the afternoon.

Here is what was actually going on, roughly in order of how much time each one cost me.

## Preprocessing is the bottleneck more often than the model

Everyone benchmarks the forward pass. It is the part with a number attached, and frameworks
report it for you.

Meanwhile the actual pipeline is: pull a frame off the camera, convert colour space, resize,
normalise, move it to the GPU, run inference, move results back, post-process. On a desktop
with a fast CPU those steps disappear into the noise. On an embedded SoC with a modest CPU
and shared memory bandwidth, they can dominate — I have seen preprocessing take longer than
the network it was feeding.

Profile the loop, not the model. If you have only optimised the part that TensorRT reports,
you may have optimised the minority of your latency.

## Quantisation is free performance right up until it is not

Converting from FP32 to FP16 is usually close to free on hardware with tensor cores, and the
accuracy cost is often unmeasurable.

INT8 is a different proposition. It needs a calibration pass over representative data, and
"representative" is doing enormous work in that sentence. Calibrate on clean daytime images
and you get a model that is fast and confident and wrong at dusk. The failure is not uniform
degradation — it is specific classes falling apart under specific conditions, which is much
harder to notice than an across-the-board accuracy drop.

If you quantise, evaluate on the ugly subset of your data specifically. The average metric
will hide exactly the regression you care about.

## Thermal throttling is a real deployment constraint

This is the one that surprised me most, and it is the one that explains "slow in the
afternoon."

An edge device in a sealed enclosure in the tropics does not have the thermal headroom it
had on your desk. Sustained inference heats it up, and the SoC responds by reducing clocks.
Your benchmark measured a cold device running for thirty seconds. Production is a hot device
running for months.

Measure sustained throughput after the device has reached thermal equilibrium, in an
enclosure, in the environment. The number will be lower than your benchmark, and that lower
number is the real one.

You can also just accept it and size for the throttled case. That is usually cheaper than
fighting the physics.

## Batch size one is the real workload

Batching is how you get throughput numbers that look good. But a device watching a single
camera in real time cannot batch — there is one frame, it needs an answer now, and waiting
to accumulate a batch adds exactly the latency you were trying to avoid.

So the throughput figure from the model zoo, which assumes a comfortable batch, does not
apply to you. Benchmark at the batch size you will actually run.

## Deploying to things you cannot SSH into at 2am

The other half of the problem is not the model at all.

You have a fleet of devices in physical locations, on connections you do not control, and
you need to update them without sending someone in a van. Rolling deployment with
configuration management works well here — describe the desired state, converge devices
toward it, do it in waves so a bad rollout stops after the first wave rather than taking out
everything.

Two things I would insist on anywhere I did this again:

**Health checks that mean something.** "The process is running" is not health. A process
that is running and producing nonsense is worse than one that has crashed, because nothing
alerts. Health should be "recent output exists and is plausible."

**A rollback that does not require the network you just broke.** If the device can be made
unreachable by the update, the update needs to be able to undo itself locally on a timer.

## The summary I would give my earlier self

The lab measures the model. Production measures the system — including the camera, the CPU,
the enclosure, the ambient temperature, the network, and the person who has to drive out
there when it stops.

Optimise the thing you are actually shipping. It is rarely the thing with the benchmark.
