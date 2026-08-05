---
title: 'bykami on AWS: the migration I have not done'
description: >-
  bykami runs on one box on purpose. Here is the AWS architecture I keep sketching for it,
  why I have not built it, and the specific conditions that would change my mind.
published: 2026-08-05
tags: ['aws', 'cloud', 'architecture', 'infrastructure', 'side-project']
---

[bykami](/writing/building-bykami) runs on a single box. One Go binary, a SQLite file beside
it, an Alibaba ECS instance, a Cloudflare Tunnel in front so the origin has no public inbound
at all. I argued for every one of those choices against a more impressive alternative.

People read that and assume I do not know the alternative. It is closer to the opposite.

At Sinar Mas I led an on-premise to AWS migration: a target environment built to landing zone
principles, with account and network segmentation, a gateway-fronted ingress tier,
application and database servers on EC2 in private subnets, and no public SSH anywhere —
administrative access went through SSM Session Manager. Before that, at Evomo, I designed the
multi-cloud architecture on AWS and GCP for an industrial OEE platform, with availability
commitments to manufacturers whose production lines depended on it.

So I know what the managed version buys, and I know what it costs in money and in operational
surface, because I have paid both.

So this is the AWS design I keep sketching for bykami and have not built. Writing it down is
mostly for me. **An architecture you cannot state the trigger condition for is a preference,
not a decision.**

## The lift-and-shift, and why it is the wrong answer

The mechanical translation takes about five minutes:

| bykami today | The obvious AWS shape |
| --- | --- |
| Alibaba ECS box | EC2, or ECS Fargate if I containerise properly |
| SQLite file | RDS for PostgreSQL, or Aurora Serverless v2 |
| Cloudflare Tunnel | ALB in a public subnet, origin in a private one |
| SSH for admin | Systems Manager Session Manager |
| Photos on local disk | S3, fronted by CloudFront |
| Terraform + Ansible | Terraform, mostly unchanged |
| GitHub Actions | GitHub Actions with OIDC into an IAM role |

One row on that table I would keep without argument, because I have built it before: the
origin belongs in a private subnet and administrative access belongs in Session Manager, not
in an SSH key someone eventually copies to a laptop. The Cloudflare Tunnel is the
solo-project-shaped version of the same instinct — no public inbound, nothing to port-scan,
no key to lose.

The rest of it looks like progress and is not, and the reason is worth being precise about:
every row on the right solves a failure mode, and I have only actually got one of them.

Aurora Serverless v2 gives me a database that survives an Availability Zone. My most likely
outage is the printer being out of paper. Fargate gives me horizontal scale for a workload
whose peak concurrency is a photo booth, three staff phones, and a booking page for one town.
An ALB gives me a health-check-driven replacement for an instance that has never once failed
in a way a health check would have caught.

That is the whole trap in the exercise. The lift-and-shift is not wrong because AWS is
expensive. It is wrong because it buys availability against failures I do not have while
leaving the failure I *do* have completely untouched.

## The failure I actually have

The disk dies and the SQLite file is gone.

That is it. That is the real single point of failure in the current design, and it is
worth noticing that **not one row in that migration table fixes it by itself** — a managed
database moves the file somewhere I cannot lose it by accident, but only because someone
else is running the backup I should already be running.

So the smallest honest AWS story for bykami is not RDS. It is S3, and about forty lines of
Terraform: continuous SQLite replication off the box — litestream does exactly this, streaming
the WAL to object storage — plus lifecycle rules and versioning on the bucket. Object storage
in another provider's region, holding a file I can restore onto a fresh box that Terraform
rebuilds in minutes.

That is a real recovery story with a real RTO, and it costs roughly nothing.

And the part I keep putting off is the part that matters: I have not restored from it. A
backup nobody has restored is a belief. I know this, I have said it to other engineers in
review, and I have still not scheduled the afternoon. Writing that sentence in public is,
I hope, the forcing function.

## Where AWS would genuinely earn it

The long-term shape of bykami is a franchise — outlets running `booth by KAMI` rather than
photobooth software sold to other operators. That changes the problem in a way scale numbers
alone never would.

**One outlet is a deployment. Five outlets is a fleet, and a fleet is a different system.**

At that point the questions stop being hypothetical. Where does outlet data live, and is it
isolated per tenant or shared with a discriminator column — a decision that is cheap now and
expensive after the second outlet. How does an outlet get a build without me driving there.
Who is paged when a booth is down on a Saturday night in a town I am not in.

The design I would reach for then, and the reason for each piece:

- **ECS Fargate behind an ALB**, in `ap-southeast-3` (Jakarta) — the region matters here for
  latency and for being able to answer a data-residency question from a franchise partner
  without hedging.
- **Aurora Serverless v2**, not because of load but because a shared multi-tenant database
  is a thing I want someone else to be backing up, patching, and failing over. Cross-outlet
  reporting is the query pattern SQLite-per-outlet makes genuinely painful.
- **S3 plus CloudFront for the photos.** This is the strongest case on the list and it is
  true *today*, not at five outlets. Photos are large, immutable, written once, read a few
  times in the following week, and then almost never. That access curve is precisely what
  storage classes and lifecycle policies were built for, and it is the workload where the
  single box's disk becomes the constraint first.
- **Secrets Manager and IAM roles**, replacing the environment file that currently works fine
  because there is exactly one person who can read it.
- **CloudWatch and EventBridge** for the operational layer that does not exist yet, because
  right now the alerting system is a business owner sending me a WhatsApp message.

Notice that only one item on that list is about handling more traffic.

## The booth does not change

The kiosk agent captures, prints, takes payment, and handles photo consent on-device, and it
does all of that assuming the API is unreachable. Transactions queue locally and reconcile
when the link returns.

None of that gets easier on AWS. IoT Core and Greengrass would be worth evaluating at a real
fleet size — device identity, OTA updates, and fleet state are genuine problems once there
are outlets I cannot drive to. At one outlet, Greengrass is a fleet-management platform for a
fleet of one, and Ansible over the tunnel is not the bottleneck.

**The cloud you choose does not relax an edge constraint.** The network in a retail unit in a
regional town is what it is. Every offline-first decision in that agent would survive the
migration unchanged, which is the clearest evidence I have that they were requirements rather
than workarounds.

## The honest Well-Architected scorecard

Since the framework is the lens, I may as well point it at my own thing and report what it
says.

**Operational excellence** — weak. Infrastructure is in Terraform and configuration in
Ansible, which is better than most side projects manage. There are no runbooks, no alerting,
and a bus factor of one.

**Security** — better than it looks. No public inbound on the origin, no origin IP in DNS,
nothing to port-scan. Secrets are out of the repo. Consent for photographs is handled
on-device before capture rather than as a checkbox on a server. The gap is that access control
is "I have the only key", which is a control that does not survive a second person.

**Reliability** — single instance, single AZ, single writer, and a backup I have not tested.
Accepted deliberately, and the untested restore is the part I do not get to call a trade-off.

**Performance efficiency** — overprovisioned by an amusing margin. SQLite in WAL mode against
single-digit concurrency is not close to a limit.

**Cost optimisation** — strong, and it is the constraint the rest of the design was built
around rather than an afterthought.

**Sustainability** — one small ARM instance running at low utilisation is hard to beat with
anything that has "managed" in the name.

Three pillars score well and two score badly, and the interesting thing is that they are the
same decision seen from different angles. Cost, performance efficiency, and sustainability are
all good *because* reliability and operational excellence are bad. The pillars are not
independent, and treating them as a checklist to maximise independently is how you end up
with an architecture that reviews well and cannot be justified.

## The trigger conditions

The point of writing this down is to commit to what would change my answer, before I am in
the middle of it and inclined to rationalise:

1. **A second outlet.** Tenant isolation stops being hypothetical and becomes a schema
   decision that gets more expensive every week it is deferred.
2. **Photo storage growth.** A working photo booth generates gigabytes. This is the trigger I
   expect to hit first, and it does not require the franchise to happen at all — S3 and
   CloudFront are worth doing on their own, ahead of everything else on the list.
3. **Anyone other than me on call.** "I have the only key" and "I know which log to read" are
   architecture, and they stop working the moment there are two of us.
4. **A compliance question I cannot answer.** A partner asking where customer photographs are
   stored and under what retention deserves a better answer than a shrug and a directory path.

Until one of those lands, the box stays.

The migration I have not done is still a design. Having it written down — with the services
named, the reasons stated, and the triggers agreed with myself in advance — is most of the
value of doing it. The rest of the value arrives on the day one of those four things happens,
and I do not have to think from scratch under pressure.

Ask me again when there are two outlets.
