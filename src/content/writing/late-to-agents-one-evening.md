---
title: I was late to agents, and it cost me one evening
description: >-
  I wired an agent into this machine on a Saturday and now I talk to it from my phone. The
  part worth writing down is why the implementation was that small.
published: 2026-09-13
tags: ['ai', 'tooling', 'infrastructure', 'workflow', 'side-project']
draft: false
---

On Saturday I set up an agent on my own machine. It runs as a service on the Mac, it answers
over Telegram, and I have been talking to it from my phone since — including the conversation
that produced this post, which is either neat or the reason to distrust it. I will let you
decide.

First, the scope. This is not a retrospective. Nothing here has been running long enough to
have a track record and I am not going to imply one. What I can describe honestly is the part
that surprised me: how small the installation turned out to be next to how much of it already
existed.

## What the evening consisted of

The shape of it is one machine and one channel:

```
  phone ──Telegram──┐
                    v
     gateway on the Mac
        (launchd)
                    |
          ┌─────────┴─────────┐
          v                   v
       Hermes                Pi
          └─────────┬─────────┘
                    v
                rtk proxy
                    |
                    v
        checks · git · builds
                    |
                    v
      CI (dispatch-only)
```

Four pieces make that up.

The runtime is [Hermes](https://hermes-agent.nousresearch.com/docs), from Nous Research, and
it runs as a process under launchd on the Mac. That detail is the important one — Hermes is
not an editor plugin. It is a process that lives on the machine, keeps notes between
conversations, and can be given work that does not need me watching it.

The interface is a Telegram bot. That choice was about where I am during a day rather than
about software quality — I am often not at a desk — and a chat window is the one client already
open on the phone.

The third is a second coding agent, Pi, pointed at the same project I am working on. It runs
the same shell tooling as everything else, so the two do not diverge in what they can see.
<!-- TODO(yudha): why two agents? A second opinion, cost, or specific models — one sentence. -->

The fourth is rtk, which sits in front of shell commands and compacts their output before a
model reads it. The useful part of a test run, a diff or a build log is a small fraction of
the bytes, and context is the scarcest resource an agent has. I have it wired into both agents
through their own hook mechanisms.

## Why an evening was enough

The cost of adopting an agent is not the agent. It is everything the agent needs in order to
be useful without me standing behind it, and in this repository most of that was already there
for unrelated reasons.

The repository explains itself. There is a file describing the system and its layout, a status
file recording what exists against what is blocked, and a directory of decision records. None
of that was written for a machine. It was written because I am the only engineer and I forget
things.

The checks are commands. `go test -race` and the TypeScript equivalents either pass or they do
not, and a workflow gates merges on the booth agent building cleanly. An agent can act on an
exit code. It cannot act on my sense that something looks fine — which is most of what review
used to be.

Deploying is an API call rather than a set of hands. There are five workflows and every one of
them is dispatch-only, so an agent can start a deploy while still being unable to reach
production directly. That was a decision about audit trails, made weeks before any agent
existed here, and it is the reason I am comfortable letting one run a workflow at all.

Output was already small. Some of that is the proxy — most of it is habit: the logs I read
are the ones I trimmed to be readable, and the changes I make are small because small diffs
are the ones I can honestly review. None of that is a property of the agent. It is a property
of the system the agent is reading.

The generalisation I would defend is this. **An agent is only as useful as the number of your
decisions that already live in a file.** If the architecture is in your head there is nothing
to hand over, and no amount of model quality fixes a system whose only documentation is a
person.

## The harness was there on the second day

Something else was already in the repository: a directory of written procedures. How to
research a question before designing anything. How to model a domain, and what an architecture
decision record has to contain. How to diagnose a bug without guessing. How to hand work over
to whoever picks it up next — in a team of one, that is me in three weeks.

I wrote those for a coding agent that only runs inside an editor and only when I am sitting in
front of it. What I did not expect is that they needed no changes at all for an agent that
runs as a service, keeps memory across conversations and answers on a phone. Same files, same
triggers, a different harness around them. **A procedure that only works inside one tool is a
prompt. A procedure that survives a change of tool is a harness**, and the second kind is
worth far more than one evening.

## On being late

I have had a coding agent in daily use since last year, so I was not late to the tools, and I
have written elsewhere about what they change. What I did not do for all that time was treat
the agent as something I operate rather than something I invoke. In an editor it waits for me.
As a service it works while I am not there, which was always the point and took me a year to
act on.

So the honest version of "it is never too late" is narrower than it sounds. It was never too
late here because the work that makes an agent useful had already been done, accidentally, for
other reasons. Starting late inside a system that is specified, checked and dispatched is one
evening. Starting late inside a system that lives in one person's head is not an
implementation at all — it is a rewrite with a chatbot attached, and the chatbot is not the
expensive part.
<!-- TODO(yudha): what did the delay actually cost you? Name one concrete thing, e.g. a
     class of task that sat undone because it needed you at the desk. -->

## What changed, and what I do not know yet

The change is smaller than I expected and it is entirely about location. The chat window is
the least impressive component in the whole setup — and the one that moved things: a status
question, a small edit, a deploy dispatched. None of that needs me at the desk any more.

Two things I am not claiming. One day is not a track record, so I have nothing to say about
reliability. And convenience that raises the volume of unreviewed work is a cost rather than a
benefit; the rule I set for myself last year still holds — that I do not merge code I could not
defend — and a phone makes that rule easier to break rather than harder.
<!-- TODO(yudha): the concrete before-cost (hours a week, or the tasks that used to wait),
     and the first thing that broke on the night. -->

This post was assembled in a conversation with the thing it is about, on a phone, while a
build ran on a machine I was not sitting at. I have been doing this for a day. Ask me again in
a year.
