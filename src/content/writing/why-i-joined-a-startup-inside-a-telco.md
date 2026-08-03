---
title: Why I joined a startup inside a telco
description: >-
  In 2019 everyone I graduated with was going to a consumer startup. I went to an
  industrial IoT venture incubated inside a state-owned telecommunications company,
  and I still think it was the right call.
published: 2019-05-18
tags: ['career', 'iot', 'industrial', 'startups']
---

2019 was a strange year to be graduating in Indonesia. The startup boom was at full volume —
ride-hailing, e-commerce, fintech, travel. A handful of unicorns, a great deal of capital,
and a genuine sense that the interesting work in this country had relocated to a few offices
in South Jakarta.

The default path was obvious to everyone. Consumer tech, Jakarta, a stack you could learn
from a bootcamp, and a compensation trajectory that made every other option look like a
mistake.

I went to Evomo instead — an industrial IoT venture built inside Telkom's Digital Amoeba
programme. Machines on factory floors, not phones in pockets.

Here is the reasoning, written down while it is still honest and not yet retrospective
justification.

## The boom was about distribution, not technology

This is the part I think my cohort had backwards, and I only half understood at the time.

What the successful Indonesian startups solved was distribution in a country that is hard to
distribute anything across. Thousands of islands, weak logistics, low card penetration, an
enormous informal economy. That is a real and difficult problem, and the people who solved it
deserve everything they got.

But it is not primarily a *technology* problem. The engineering is mostly good execution on
well-understood patterns — services, queues, mobile clients, payments — done at scale and
under time pressure. Excellent training. Not the thing I wanted to spend my twenties getting
good at.

My degree was Computer Science *and* Electronics. Everything I had enjoyed up to that point —
a nanosatellite, a rocket payload, a detection instrument — had involved software that had to
survive contact with something physical. Taking a job where the hardest constraint was
concurrency felt like walking away from the half of my training I actually liked.

## Indonesian manufacturing was running blind

The thing that decided it was a number I could not stop thinking about: manufacturing is
around a fifth of Indonesia's economy, and almost none of it had any instrumentation worth
the name.

Not "needs better dashboards." I mean a plant manager genuinely did not know how much of the
day their machines had actually been running, because the way you found out was a supervisor
with a clipboard writing down what they saw when they walked past.

There is a well-established metric for this — OEE, overall equipment effectiveness — and the
theory has been settled since the 1960s. The gap was never conceptual. It was that connecting
a thirty-year-old machine to anything at all is a miserable, unglamorous problem that nobody
in a hot funding market wants to work on.

That struck me as an argument *for* working on it, not against.

## What a corporate-incubated startup actually is

I want to be accurate about this, because "startup inside a corporate" gets described in
brochures by people who have not done it.

**What you actually get:** a door that opens. This is the underrated part and it is enormous.
An industrial IoT product cannot be validated over Zoom — you have to stand in the plant, on
the floor, next to the machine, with the person who runs it. A two-person startup with no
track record does not get past the security post. Arriving with Telkom behind you does. In my
first months I was already doing demos and proofs of concept in real factories, which is an
amount of customer contact I do not think I would have had anywhere else at that stage.

You also get runway that is not measured in months, which matters because industrial sales
cycles are measured in quarters and no amount of enthusiasm compresses them.

**What you actually pay:** everything moves through processes designed for a company of a
hundred thousand people. Procurement. Approvals. A hardware purchase that a real startup
would put on a founder's card. And you spend real energy justifying your existence to people
whose instruments do not measure what you are doing yet.

The trade is that the corporate absorbs commercial risk and charges you in speed. Whether
that is a good deal depends entirely on whether your bottleneck is capital or velocity. For
industrial hardware, where you cannot iterate your way past a customer who takes six months
to sign, it was a good deal.

## Founding engineer is a scope, not a title

The concrete reason, under all the strategy: I wanted to be responsible for more of a system
than I would have been anywhere else.

Building a product from zero meant firmware on the gateway, the integration layer talking
Modbus and MQTT to equipment that had never been asked anything, the cloud architecture
behind it, and then getting on a plane to go install it. At a larger company that is four
teams and I would have been a junior member of one of them.

You learn a specific thing from owning a whole vertical slice badly that you cannot learn
from owning a thin horizontal one well: where the seams are, and that most real failures live
in them rather than in the components.

## Would I say this to someone graduating now

Not "avoid the hot sector." That is contrarianism dressed as advice, and the people who
joined Gojek in 2016 did extremely well by ignoring exactly this kind of reasoning.

What I would actually say: **pick the shape of the problem, not the stage of the company.**
Ask what the hardest constraint is in the work — is it scale, distribution, latency,
physics, regulation, trust? — and choose one whose answer you find interesting enough to
still be interested in five years later, because that is roughly how long it takes to get
good at anything.

Mine was physical systems that answer back. It still is. Everything since has been a
variation on it.
