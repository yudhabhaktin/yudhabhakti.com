# yudhabhakti.com

Astro site, deployed to Cloudflare Pages as `yudhabhakti-com`. Repo is
`yudhabhaktin/yudhabhakti.com` — **not** the bykami repo.

## Writing posts

Posts live in `src/content/writing/*.md`, one file per post, kebab-case filename
(it becomes the URL slug). Frontmatter is schema-validated in
`src/content.config.ts` — a build fails on a bad shape, so match it exactly:

```yaml
---
title: string                      # required
description: >-                    # required; folded block for anything long
  One or two sentences.
published: 2026-08-01              # required, a date
updated: 2026-09-01                # optional
tags: ['go', 'architecture']       # optional, defaults to []
draft: false                       # optional, defaults to false
---
```

Set `draft: true` for anything not ready to be public.

## Voice

**Read two or three existing posts in full before drafting anything.** They are
the voice sample, and they outrank every general writing rule — including the
`humanizer` skill's own, which says so explicitly.

The profile below was measured across all 22 posts (21,008 words), so it is
description, not aspiration:

| Marker | The corpus | Meaning |
|---|---|---|
| Contractions | **1** vs 218 expanded forms | Write "do not", "it is", "I am". Effectively never contract. |
| Spelling | 56 British, 0 American | `-ise` / `-isation`. Organisation, prioritise, recognised. |
| Em dashes | **173** (~1 per 120 words) | Core to the rhythm. **Do not strip them.** Generic anti-AI advice says remove em dashes; here that would damage the voice. |
| Bullets | 35 lines in 21k words | Prose, not lists. If a draft is list-shaped, it is wrong. |
| Sentences | mean 17.8 words; 22% are <=8, 14% are >=30 | Deliberate variance. Short declaratives against long ones. Uniform mid-length sentences read as generated. |
| H2 headings | ~5 per post | Sections, yes. Fragmented one-line headers, no. |
| AI vocabulary | leverage x1, robust x2, nothing else | No delve, seamless, game-changing, "in today's", "it is important to note". |

Beyond the countables:

- First person, past tense, about work actually done. Named clients, named
  systems, real dates: "Over January and February this year I worked on the
  embedded side of a radiation portal monitor — the Merah Putih system — built
  for BATAN."
- Jargon gets defined in plain words the moment it appears: "A portal monitor is
  the thing a vehicle drives through that decides whether it is carrying
  something it should not be."
- Being wrong is stated plainly, without hedging or self-flagellation: "advice I
  received often and understood badly."
- Scope is declared when it is limited: "I am going to keep this conceptual
  rather than specific."
- No conclusion that restates the post. No "in conclusion". No call to action.

If a draft could have been written by someone who had not done the work, it is
wrong — the specifics are the point. When in doubt, run the `humanizer` skill,
but give it these posts as the sample so its em dash rule does not fire.

## Commands

```bash
pnpm dev        # local preview
pnpm build      # what CI runs
pnpm verify     # SEO checks against dist/ — run after build
```

## Deploying

Push to `main`. `.github/workflows/deploy.yml` builds and ships to Cloudflare on
every push to main, and also runs on pull requests. Do **not** run
`pnpm deploy` (`wrangler deploy`) from this machine for a normal change — that
bypasses CI. Open a PR or push to main and let the workflow do it.

Check the current branch before committing: work has been happening on feature
branches (e.g. `aws-positioning`), not directly on main.
