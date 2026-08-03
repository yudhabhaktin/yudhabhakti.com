---
title: What 170 hours of mentoring taught me about my own debugging
description: >-
  I mentored on Samsung Innovation Campus for most of a year. The hardest habit to
  break was reaching for the keyboard.
published: 2023-11-05
tags: ['mentoring', 'teaching', 'career']
---

Between March and October 2023 I mentored on Batch 4 of Samsung Innovation Campus, a program
run by Skilvul with Samsung Electronics Indonesia. It came to 170 teaching hours across the
program, working with people who were early in their software careers or entering the field.

I signed up thinking of it as giving something back. What I did not expect was how much it
would change the way I work.

## The keyboard problem

Here is the failure mode, and I fell into it constantly for the first month.

A student is stuck. You look at their screen. Within about four seconds you can see the
problem — a typo, a wrong variable, a misunderstanding of how the loop terminates. The
efficient move is obvious: point at it, or take the keyboard, fix it, explain after.

That resolves the bug in fifteen seconds and teaches nothing. Worse, it teaches something
actively harmful: that being stuck is resolved by a more experienced person arriving.

The thing that actually helps is slower and much less comfortable. Ask what they expected to
happen. Ask what happened instead. Ask how they could find out where those diverge. Sit
through the silence while they think, which feels much longer to the mentor than to the
student.

I was bad at this. I am still not great at it. But learning to sit in that gap changed how I
run code review and how I handle production incidents, because it turns out the same
instinct — *I can see it, let me just fix it* — is exactly what stops a team from getting
better at seeing it themselves.

## Teaching exposes what you do not actually understand

The second thing that happened is that I discovered the edges of my own knowledge, publicly
and repeatedly.

You can use a tool competently for years on the strength of pattern matching. Then someone
asks "but why does it work that way?" and you find out whether you have a model or a habit.
I had habits. Several of them, in areas I would have told you I knew well.

There is no faster way to find the holes than to have a room of people who have not yet
learned which questions are supposed to be obvious. Beginners ask the foundational questions
that experienced people have politely agreed to stop asking.

## What I would tell someone considering it

**The time cost is real.** 170 hours is not a weekend. It is most of a year of evenings and
weekends, and I would not pretend otherwise.

**It makes you better at the job you already have.** Every skill that mentoring develops —
explaining a design decision, asking questions instead of asserting answers, judging what
someone is ready to hear — is the same skill set that separates a senior engineer from a
technical lead. I got more out of it professionally than any course I have taken.

**Being a few years ahead is enough.** The most useful mentors for early-career people are
often not the most senior person available. They are the person who remembers being stuck on
this, recently enough to reconstruct why it was confusing. Expertise creates distance.

<!-- TODO(yudha): a specific student story here would make this post much stronger —
     someone who was stuck on something and got through it. Keep it anonymous, but the
     concrete beats the general every time. -->

## The bit I still think about

Somewhere in the middle of the program I noticed I had stopped answering questions directly
and started asking what the student had already tried. Not as a technique — it had become
the actual first thing I wanted to know.

That is the change I would keep. Most of the time, the person in front of you has more of
the answer than they think, and the useful contribution is not the answer. It is the
question that makes the next step visible.

I am fairly sure that is also the entire job description of a technical lead.
