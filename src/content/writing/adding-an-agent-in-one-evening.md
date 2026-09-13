---
title: Adding an agent in one evening — the groundwork was already there
description: >-
  I wired an agent into this machine on a Saturday and now I talk to it from my phone. The
  implementation was small because of work I had already done for other reasons, and that is
  the part worth copying.
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

<figure class="setup-diagram">
  <svg viewBox="0 0 420 512" role="img" aria-labelledby="setup-title setup-desc" style="display:block;width:100%;max-width:26rem;height:auto;margin-inline:auto">
    <title id="setup-title">The setup, end to end</title>
    <desc id="setup-desc">A phone reaches a gateway running under launchd on the Mac. The gateway drives two agents, Hermes and Pi. Their shell commands pass through an rtk proxy before they reach checks, git and builds on the machine, and the CI workflows are dispatched rather than triggered by hand.</desc>
    <style>.setup-diagram .dg-box,.setup-diagram .dg-agent{fill:var(--surface);stroke:var(--rule);stroke-width:1}.setup-diagram .dg-edge{fill:none;stroke:var(--faint);stroke-width:1.25}.setup-diagram .dg-boundary{fill:none;stroke:var(--rule);stroke-width:1;stroke-dasharray:3 4}.setup-diagram .dg-title{fill:var(--ink);font-family:var(--font-sans);font-size:16px;font-weight:600;text-anchor:middle}.setup-diagram .dg-sub{fill:var(--muted);font-family:var(--font-sans);font-size:13px;text-anchor:middle}.setup-diagram .dg-note{fill:var(--muted);font-family:var(--font-sans);font-size:12.5px}.setup-diagram .dg-cap{fill:var(--paper)}</style>
    <rect class="dg-boundary" x="30" y="72" width="360" height="424" rx="10"/>
    <rect class="dg-cap" x="52" y="64" width="56" height="16"/>
    <text class="dg-note" x="80" y="76" text-anchor="middle">the Mac</text>
    <rect class="dg-box" x="90" y="14" width="240" height="44" rx="8"/>
    <text class="dg-title" x="210" y="34">phone</text>
    <text class="dg-sub" x="210" y="50">Telegram</text>
    <path class="dg-edge" d="M210 58 L210 86"/>
    <path class="dg-edge" d="M206 82 L210 88 L214 82"/>
    <rect class="dg-box" x="90" y="88" width="240" height="44" rx="8"/>
    <text class="dg-title" x="210" y="108">gateway on the Mac</text>
    <text class="dg-sub" x="210" y="124">launchd, restarts on boot</text>
    <path class="dg-edge" d="M210 132 L210 160"/>
    <path class="dg-edge" d="M120 160 L300 160"/>
    <path class="dg-edge" d="M120 160 L120 178"/>
    <path class="dg-edge" d="M116 174 L120 180 L124 174"/>
    <path class="dg-edge" d="M300 160 L300 178"/>
    <path class="dg-edge" d="M296 174 L300 180 L304 174"/>
    <rect class="dg-agent" x="55" y="180" width="130" height="52" rx="8"/>
    <text class="dg-title" x="120" y="201">Hermes</text>
    <text class="dg-sub" x="120" y="217">a service</text>
    <text class="dg-sub" x="120" y="229">keeps memory</text>
    <rect class="dg-agent" x="235" y="180" width="130" height="52" rx="8"/>
    <text class="dg-title" x="300" y="201">Pi</text>
    <text class="dg-sub" x="300" y="217">a coding agent</text>
    <text class="dg-sub" x="300" y="229">same tools</text>
    <path class="dg-edge" d="M120 232 L120 260"/>
    <path class="dg-edge" d="M300 232 L300 260"/>
    <path class="dg-edge" d="M120 260 L300 260"/>
    <path class="dg-edge" d="M210 260 L210 278"/>
    <path class="dg-edge" d="M206 274 L210 280 L214 274"/>
    <rect class="dg-box" x="90" y="280" width="240" height="44" rx="8"/>
    <text class="dg-title" x="210" y="300">rtk proxy</text>
    <text class="dg-sub" x="210" y="316">rewrites commands, trims output</text>
    <path class="dg-edge" d="M210 324 L210 352"/>
    <path class="dg-edge" d="M206 348 L210 354 L214 348"/>
    <rect class="dg-box" x="90" y="354" width="240" height="44" rx="8"/>
    <text class="dg-title" x="210" y="374">checks · git · builds</text>
    <text class="dg-sub" x="210" y="390">exit codes, not opinions</text>
    <path class="dg-edge" d="M210 398 L210 426"/>
    <path class="dg-edge" d="M206 422 L210 428 L214 422"/>
    <rect class="dg-box" x="90" y="428" width="240" height="44" rx="8"/>
    <text class="dg-title" x="210" y="448">CI</text>
    <text class="dg-sub" x="210" y="464">dispatch-only</text>
  </svg>
  <figcaption>The whole setup is one machine and one channel. Everything inside the dashed line runs on the Mac; the phone is the only client.</figcaption>
</figure>

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

## Why it is worth starting now

There are two ways to hold an agent. The first is a thing I invoke: I open an editor, ask for
something, and close the window. The second is a thing I operate: it has a home, a schedule
and a way to reach me when I am not at a desk. I used the first shape for a year, which taught
me a great deal about the tools and nothing about the second. The second is the one that
changed how a day works, and moving between them needed no new model and no bigger machine.

That distinction is also the practical answer to where to start. When a system is specified,
checked and dispatched, adding an agent is one evening, because the harness already exists.
When a system lives in one person's head, no agent saves you the work of writing it down —
that work was always the work. **The groundwork is not a prerequisite you do for the agent. It
is the thing you wanted anyway**, and an agent is what makes the payoff visible enough to
finish it.
<!-- TODO(yudha): one class of task that used to wait for a desk and now does not. -->

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
