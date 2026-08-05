---
title: Building bykami — a Go monolith, one small box, and a photo booth in Banyuwangi
description: >-
  Notes on building a multi-vertical local platform for a town in East Java, and why
  almost every architectural decision came out boring on purpose.
published: 2026-08-01
tags: ['go', 'architecture', 'side-project', 'infrastructure']
---

I have been building [bykami](https://github.com/yudhabhaktin/bykami), a platform for a small
multi-vertical business in Banyuwangi, East Java. Three lines so far: a self-service photo
studio, on-location photo and video, and a food and beverage spot. Different services, one
brand, one identity, one loyalty scheme.

It is the first thing in years where I own every decision end to end, which has been
clarifying. When there is no architecture review to hide behind, you find out what you
actually believe.

Mostly I believe in boring.

## The shape of it

```
/api      Go monolith — identity, loyalty, booking
/agent    booth binary — capture, print, payment, consent
/apps/kiosk  the touchscreen the customer actually uses
/infra    Terraform + Ansible
/sites    marketing pages
/design   architecture notes and requirements
```

A Go monolith with SQLite behind it, deployed to a single Alibaba ECS box, exposed through
a Cloudflare Tunnel. Terraform for the infrastructure, Ansible for configuration, GitHub
Actions for CI. A pnpm workspace holds the TypeScript side.

Every one of those choices has a more impressive alternative. I picked against all of them,
and I want to explain why, because "we chose the boring option" is usually asserted rather
than argued.

## Why a monolith

The obvious counter is services — identity, loyalty, and booking as three deployables.

I have decomposed monoliths professionally and I would do it again when the team is big
enough that deployment coupling is the actual bottleneck. Here the team is me. Splitting
this into services would buy independent deployability I do not need, and cost me
distributed transactions across three domains that genuinely need to agree with each other:
a booking, the loyalty points it earns, and the identity both hang off.

One process. One transaction boundary. When there is a second engineer and a reason, the
seams are already drawn — the packages do not import across domains.

## Why SQLite

This is the one people push back on hardest, so let me be specific about the constraint.

The load is a photo booth, a handful of staff devices, and a booking page for one town. Peak
concurrency is single digits. SQLite with WAL mode handles that with a margin I find almost
funny.

What I get in exchange is the part that actually matters for a side project: the database is
a file. Backup is copying a file. Restore is copying it back. There is no managed instance
to pay for, no connection pool to tune, no separate thing that can be down while the app is
up. The whole system is one binary and one file on one box.

The failure mode I am accepting is that vertical scaling has a ceiling and there is exactly
one writer. If bykami outgrows that, Postgres is a migration I know how to do, and I would
rather do it with revenue than pre-emptively.

## Why Cloudflare Tunnel

The origin has no public inbound at all. No open ports, no origin IP in DNS, nothing to
port-scan. The tunnel dials out to Cloudflare and traffic comes back down that connection.

For a solo project this removes an entire category of work I would otherwise have to do
badly: origin firewall rules, TLS certificate rotation on the box, keeping a public SSH
surface locked down. It is the rare case where the more secure option is also the lazier
one.

## The booth is where it gets interesting

The kiosk agent is the part I would not have designed the same way five years ago, and it
is the part that reuses the most from my embedded work.

A photo booth is an edge device with a printer attached. That sentence carries more weight
than it looks. Printers jam. Payment terminals time out mid-transaction. The internet in a
retail unit in a regional town is not the internet in a data centre. And unlike a web app,
there is no user who will patiently refresh — there is a person standing in front of a
screen with friends, having paid, expecting a photo.

So the agent assumes it is alone. It captures and prints without needing the API to be
reachable. Transactions queue locally and reconcile when the connection comes back. The
consent flow — people are having their photographs taken and printed — happens on-device
before anything is captured, not as a checkbox on a server somewhere.

This is the toll gate lesson, transplanted. You cannot SSH into a toll gate at 2am because
there are cars. You cannot debug a photo booth on a Saturday night because there are
customers.

## What is actually hard

Not the technology. The technology is a solved problem and I chose the most solved version
of it available.

What is hard is that this is a real business with real customers, and the software is maybe
a fifth of whether it works. Catalogue accuracy, whether the printer has paper, whether
staff understand the loyalty rules well enough to explain them — none of that is in the
repo, and all of it determines the outcome.

The long-term idea is a franchise: outlets running `booth by KAMI`, rather than selling
photobooth software to other operators. That is a different product with different
constraints, and I am trying not to design for it yet. Phase one is live. Phase two is the
API monolith above. Anything past that is speculation with a git history.

## The honest summary

I built the least interesting thing that could work, on purpose, because the interesting
part is not the architecture — it is whether someone in Banyuwangi gets their photo.

Ask me again when there are five outlets.
