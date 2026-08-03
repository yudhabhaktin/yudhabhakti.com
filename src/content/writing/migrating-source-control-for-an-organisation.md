---
title: Moving an organisation between source control platforms
description: >-
  The repositories are the easy part. Everything expensive is attached to them, and most
  of it is not in git.
published: 2025-12-07
tags: ['platform', 'ci-cd', 'migration', 'engineering-management']
---

I have led a migration of an engineering organisation from one source control platform to
another — many repositories, many developers, several teams, on a deadline.

This is a generic account. No employer, no counts, no infrastructure detail. What follows is
the shape of the problem, which is the part that transfers.

## The repos migrate in an afternoon

Git is distributed. Moving repository history between forges is close to a solved problem
and the tooling is good. If someone tells you the migration is hard because of the
repositories, they have not started yet.

What is actually attached to those repositories:

- **CI pipelines**, written in a syntax that does not exist on the destination
- **Secrets and credentials**, which cannot be exported and have to be re-created
- **Access control**, which encodes years of accumulated decisions nobody wrote down
- **Webhooks and integrations** pointing at issue trackers, chat, deployment tooling
- **Pull request history and review comments**, which are institutional memory and often do
  not survive
- **Hardcoded URLs** in scripts, documentation, dependency manifests, and infrastructure
  code — this one is endless
- **Muscle memory**, in every developer, all at once

Only the first item is a technical project. The rest is coordination, and the last one is
the actual constraint.

## Pipelines are a rewrite, so be honest about it

CI configuration does not port. The concepts map roughly — jobs, steps, caching, artefacts —
but the syntax, the runner model, and the security boundaries differ enough that a
mechanical translation produces something that half-works, which is worse than something
that visibly does not.

Two things helped more than anything else.

**Treat it as an opportunity to consolidate.** Most organisations have pipeline sprawl:
dozens of configs that are 80% identical because they were copy-pasted. Migration is the one
moment when everyone expects their pipeline to change anyway. Building a small set of shared,
reusable workflow templates during the move costs slightly more up front and pays for years.

**Migrate a hard repository first, not an easy one.** The instinct is to start with something
simple to build confidence. That produces false confidence and defers every real problem to
the end, when you have no schedule left. Pick something with an ugly pipeline and real
deployment consequences. You want to discover the worst case while you still have room.

## Run both platforms for a while, deliberately

There is a strong temptation to cut over on a date and be done. Resist it in favour of an
explicit overlap period where the old platform is read-only and the new one is canonical.

Read-only matters. "Both are writable for two weeks" produces divergent history, work done
in the wrong place, and at least one person who did not get the memo pushing to the old
remote for a month. One writable source of truth at all times, with the other visible but
frozen.

## The part that decides whether it works

Not the tooling. The communication.

A migration is a change imposed on people who did not ask for it, in the middle of their
actual deliverables, that makes them temporarily worse at their own job. Every developer
loses fluency for a week. That is a real cost and pretending otherwise is how you get
resentment.

What worked:

- **Say why, more than once.** Not the executive rationale — the version that answers "what
  does this get *me*."
- **Migrate teams, not repositories.** A team whose repos are split across platforms is a
  team that is blocked. Move a team's entire world at once so they only pay the context
  switch once.
- **Have an obvious place to ask for help**, staffed by someone who will answer quickly
  during the cutover window. The cost of an unanswered question during a migration is a
  developer inventing their own workaround, which you will find six months later.
- **Write the runbook as you go.** Team five should have a much easier time than team one,
  and the only mechanism that makes that true is writing down what broke.

## The thing I would do differently

I underestimated hardcoded URLs. They are in CI configs, Dockerfiles, dependency manifests,
Terraform modules, internal documentation, bookmarks, and a shell alias someone wrote in
2019.

If I did it again, the first task — before touching anything — would be an exhaustive search
across every repository for references to the old platform's hostname, turned into a
checklist. It is unglamorous, it is mechanical, and it would have saved more time than any
other single thing.

## The general lesson

The technical migration is a small, well-understood problem sitting inside a large,
badly-understood one. The large one is that an engineering organisation is a set of habits,
and you are changing them all simultaneously.

Plan for the habits. The git part will be fine.
