---
title: Starting over on purpose
description: >-
  Six months into a digital talent programme after four years of engineering. It looked
  like a step backwards on paper. Notes on mobile, web, and the corporate part I had been
  quietly avoiding.
published: 2022-12-17
tags: ['career', 'mobile', 'flutter', 'enterprise']
---

In June I joined the Digital Talent Program at Sinar Mas Agribusiness and Food. It is a
rotational programme — you move across functions rather than sitting in one team, in my case
across plantation, logistics, manufacturing, and corporate.

On paper this reads as a step backwards. I had spent four years as a founding engineer on an
industrial IoT product and then owning the delivery of an AI programme at the roadside. A
"talent programme" is the sort of thing you do at twenty-two.

Six months in, here is why I did it, and what has actually been different.

## The reason: I was deep in a narrowing groove

I was good at a specific thing — software against physical systems, at the edge, in real
time — and getting better at it every year. That is supposed to be the goal.

What worried me was the shape of the groove. Everything I knew was organised around latency,
determinism, and hardware I could reach. Genuinely useful, and a set of instincts that stop
transferring at some point. I could feel myself starting to answer new problems with the
tools that had worked on the old ones.

Agribusiness attracted me because the physical constraints I like are all still there —
estates, mills, refineries, trucks, a supply chain made of actual things — but the software
problem is completely different. It is not latency. It is **reach**. Getting a working system
into the hands of people in places with no reliable connectivity, no IT support, and no
particular reason to want new software.

I did not know how to do that. That was the point.

## Mobile: offline is the premise, not a feature

My first serious mobile work. Cross-platform in Flutter, building applications used on
estates — stock counting, road condition reporting — that then have to land in SAP.

The thing I got wrong immediately was treating offline as an edge case. On an estate, offline
is the normal operating condition and connectivity is the exception. The app has to be fully
functional with no network for an entire working day, and sync is a background reconciliation
problem rather than a save button.

Which turns a technical question into a business one faster than I expected. Two people count
the same stock in the same location while both are offline. Their devices sync four hours
apart. Whose number is correct?

There is no engineering answer to that. It is a policy, it belongs to the business, and
nobody had ever had to write it down before — because in the paper process the conflict was
resolved by two people standing in a warehouse having a conversation. My conflict resolution
strategy was going to encode *somebody's* rule whether or not I went and asked. So I went and
asked, and that turned out to be the single most useful hour of the project.

Other things I had not thought about:

**The device is not your device.** It is an inexpensive Android phone, two or three years
old, with a cracked screen, in high humidity, at eight per cent battery, held by someone
wearing gloves in bright sunlight. Every one of those is a design constraint. Touch targets
have to be large. Contrast has to survive direct sun. Anything that spins the radio looking
for a network it will not find is stealing battery from someone whose shift is not over.

**Data entry is the product.** Not the dashboard the data feeds. If entering a record takes
noticeably longer than the paper form it replaced, adoption is over — and it will not be
reported as "adoption failed," it will be reported as "the app is slow." I have watched a
genuinely well-built screen lose to a clipboard because it had one extra confirmation step.

**Enterprise integration is where the honest complexity is.** Getting a clean record from a
phone is not the hard part. Getting it into a system of record that has its own master data,
its own validation, its own idea of what a valid transaction looks like, and no interest in
your app's data model — that is the hard part. You do not get to redesign the ERP. You
translate into it, and you absorb the difference.

## Web: the users have alternatives

Coming from C++ on embedded devices, my expectation was that web development would be easy
and unsatisfying. Wrong on both counts, though not for the reasons I anticipated.

The technical adjustment was smaller than I expected. The mental adjustment was not.

Embedded software has a captive audience. The firmware on a gateway is the only firmware on
that gateway. Nobody evaluates it; it either works or there is an incident.

An internal web application has competitors, and the strongest one is Excel. People will use
your tool for a fortnight and quietly go back to the spreadsheet they trust, and you will find
out from a usage report a month later, if you thought to build a usage report. **Software
nobody uses is indistinguishable from software that does not exist**, and that is a much
harsher standard than "does it work."

It also changed what I think good looks like. On embedded, elegance is efficiency. On the
web, most of the quality is in things I used to file under "not engineering": whether the
error message tells you what to do, whether the page remembers what you had selected, whether
the slow operation admits that it is slow.

## Corporate: the part I had been avoiding

This is the rotation I would have skipped, and it is the one that has changed how I work.

I arrived with the standard engineer's model of a large company: it is slow, the process is
overhead, and if people would get out of the way the work would go faster. Six months of
sitting in those functions has made that view look mostly like ignorance.

**The constraints are usually load-bearing.** Every approval step I found annoying existed
because something went wrong once, and often the incident is on record if you ask. Some of
them have outlived their reason and should go. But the default assumption that a process is
stupid because you cannot immediately see its purpose is a very expensive assumption, and I
had been making it for years.

**Two stakeholders can want opposite things and both be right.** The estate manager wants
fewer fields on the form because his people are outdoors with one hand free. Finance wants
more fields because they cannot close the month on a record missing a cost centre. Neither is
being obstructive. There is no clever design that dissolves this — someone has to make a
trade, and it is much better if that someone understands both sides than if it defaults to
whoever shouts.

**Adoption is an engineering requirement.** This is the sentence I would go back and tell my
2019 self. A technically correct system that nobody adopted is a failed system, full stop.
The failure looks like a code quality problem from the inside — it is not — and no amount of
architecture recovers it. Time spent with the people who will use the thing is not overhead
on the build; it *is* the build.

**Nobody outside your function cares about your work, and that is normal.** A plant manager
does not want to hear about the integration layer. They want to know whether the number on
the screen is right and what to do when it is not. Being able to describe your work in terms
of somebody else's job is a skill, I did not have it, and I am still not good at it.

## Six months in

The rotation's real value is not the individual skills. Mobile and web I could have picked up
anywhere.

It is that I have now seen the same company from four seats — the estate, the warehouse, the
plant, head office — and every one of them has a coherent, internally consistent story about
what the problem is, and the four stories do not match. That is not dysfunction, it is what
an organisation looks like from inside any one part of it.

Having sat in four of them, I have stopped believing whichever version I heard most recently.
That seems like a small thing. Six months ago I would have called it politics and gone back
to my editor.

**The thing I would tell someone weighing a sideways move:** depth compounds, but only in
something that still matters in ten years, and you often cannot tell from inside the groove
whether you are in one of those. Breadth is not the opposite of depth. It is how you work out
which depth was worth having.
