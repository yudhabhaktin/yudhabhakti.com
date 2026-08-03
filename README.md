# yudhabhakti.com

**Live at https://yudhabhakti.com** — deployed automatically from `main`.

Personal site and blog. Astro 5, static output, no client-side framework. Deploys to
Cloudflare Workers static assets.

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # -> dist/
pnpm preview    # serve the built output
```

---

## ⚠️ Before you deploy — read this

### 1. There are credentials in this directory

A file named `env` sits in the project root containing a GitHub PAT, two Cloudflare API
tokens, R2 access keys, and Tencent + Alibaba Cloud keys. If you have also added a `.env`,
the same applies to it.

Both are in `.gitignore` and **neither is tracked by git** — verified. But they should not
live in a web project directory at all:

- **Move it** somewhere outside this repo (`~/.config/` or a password manager).
- **Rotate the tokens.** They have been sitting in plaintext in a directory that is now a git
  repository. Rotating is cheap; assuming they are fine is not.
- Never `git add -f env`, and never remove it from `.gitignore`.

For deploying, authenticate with `wrangler login` instead of exporting a token — it stores
a scoped OAuth credential rather than a long-lived key.

### 2. The blog posts are drafts

Twenty-one posts are written and publishable, backdated across 2015–2026 and aligned to the
timeline on `/work`. They are in your voice, written from your resume, your public repo, and
your LinkedIn. **Read them before they go live.** Several contain `<!-- TODO(yudha): ... -->` comments marking where a specific
detail or a photo would help — those are HTML comments and do not render.

**Highest priority to verify:**

| Post | What to check |
|---|---|
| `komurindo-antenna-tracker.md` | **Year and placement.** I dated it 2015 from your degree timeline. Search surfaced a 1st place in Muatan Roket at KOMURINDO/KOMBAT 2015 under *"Yudha Bakti Nugroho, ELINS UGM"* — different spelling, so I did **not** claim it. If that was you, add it. If not, leave it out. |
| `detection-thresholds-and-the-cost-of-being-wrong.md` | BATAN work. Written deliberately conceptual — no thresholds, no architecture, no capabilities. Confirm you are comfortable with even this level. |
| `building-bykami.md` | Written from the public repo. Verify the business lines and roadmap, and that you want them public. |
| `migrating-source-control-for-an-organisation.md` | De-identified by design — no employer, no counts, no identity/residency detail. Confirm nothing reads as attributable. |
| `the-year-i-stopped-shipping-code.md` | Personal reflection on becoming a lead. Check the tone is one you want colleagues reading. |
| `empathy-is-not-niceness.md` | **Contains an anecdote about managing an underperforming engineer.** Anonymous, but a former colleague could plausibly recognise themselves. Decide whether you want that public, and soften or cut it if not. |
| `monorepo-to-multirepo.md` | Describes team structure and vendor access boundaries. No employer named and no counts, but read it as someone who knows where you worked. |
| `when-the-camera-and-the-lidar-disagree.md` | **The toll work, written technically.** Deliberately does not name the employer, the road network, or any accuracy or deployment figure — same convention as `models-that-are-fast-in-the-lab`. Confirm you are comfortable with the level of detail on fusion logic and rollout. |
| `starting-over-on-purpose.md` | Names Sinar Mas and the talent programme, and is candid about what you did not know at the time. Check the tone reads as self-aware rather than self-critical. |
| `why-i-joined-a-startup-inside-a-telco.md` | Names Telkom and Evomo, and characterises what a corporate-incubated venture costs you in speed. Fair and non-specific, but read it as a former colleague would. |

**Lower risk, still worth a read:** `kri-2017-teaching-a-robot-to-dance`,
`ugmsat-1-no-patch-window`, `modbus-mqtt-and-the-factory-floor`,
`lora-is-not-wifi-with-better-range`, `models-that-are-fast-in-the-lab`,
`what-170-hours-of-mentoring-taught-me`, `from-nanosatellites-to-palm-oil-estates`,
`hybrid-retrieval-structured-and-unstructured`, `system-design-documents-people-read`,
`six-months-of-claude-code`, `what-agents-change-about-software-work`.

---

## What is deliberately *not* on this site

This site carries **no internal figures**: no revenue, contract values, headcounts, user
counts, transaction volumes, or repository counts. That follows the rule you already set for
yourself in `linkedin-profile-update.md` ("no internal numbers").

Also deliberately absent:

- Security architecture detail (identity provider config, runner topology, data residency
  setup) — that is reconnaissance material regardless of NDA.
- Named-employer technical writeups of the toll infrastructure work.
- Anything about your current employer beyond scope.

Those numbers belong in your CV, which goes to a named recipient. Keep the split.

---

## Structure

```
src/
  consts.ts               name, nav, social links — edit here first
  content.config.ts       blog schema
  content/writing/*.md    posts
  layouts/BaseLayout.astro  <head>, SEO, header, footer, theme toggle
  pages/                  index, writing, work, projects, about, 404
  styles/global.css       the whole design system
  plugins/                reading-time remark plugin
```

### Adding a post

Create `src/content/writing/my-post.md`:

```markdown
---
title: The title
description: One or two sentences. This is the meta description and the listing blurb.
published: 2026-08-15
tags: ['go', 'architecture']
draft: false
---

Body in markdown.
```

`draft: true` hides it from the site and from listings. The URL is the filename.

---

## Deploying to Cloudflare

The site builds to static HTML and is served by Workers static assets.

```bash
pnpm wrangler login     # one time, OAuth — do not use the token in `env`
pnpm deploy             # builds, then deploys
```

### One-time account setup — done, kept for reference

A brand-new Cloudflare account cannot deploy a Worker until two things exist. Both are
dashboard-only — the API refuses them. Both are now in place: the workers.dev subdomain is
`yudha-bhakti-n`, and the `yudhabhakti.com` zone is active.

**1. A workers.dev subdomain.** Without it wrangler has nowhere to publish and fails in CI
with `You need to register a workers.dev subdomain`, because it cannot prompt
non-interactively. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers/workers-and-pages)
once; loading the page creates it.

**2. The domain as a Cloudflare zone**, if you want a custom domain. Buying the domain is not
enough — its nameservers have to point at Cloudflare.

### Moving yudhabhakti.com to Cloudflare

The domain is registered with **Rumahweb Indonesia** and was on `nsid1–4.rumahweb.*`.

1. Cloudflare dashboard → **Add a domain** → `yudhabhakti.com` → Free plan.
2. The scan finds no records on a new domain. Add a placeholder A record for `@`
   (e.g. `192.0.2.1`) so the zone is not empty; the Worker route supersedes it.
3. Copy the two assigned `*.ns.cloudflare.com` nameservers.
4. Rumahweb client area → the domain → nameservers → switch to custom and replace all four
   `nsid*` entries with Cloudflare's two.
5. Cloudflare → **Check nameservers**. Activation is usually minutes to a few hours.

`clientTransferProhibited` does not block this — it blocks transfers, not NS changes.

### Switching to the custom domain

Once the zone is active, replace workers.dev publishing with a route in `wrangler.jsonc`:

```jsonc
"workers_dev": false,
"routes": [
  { "pattern": "yudhabhakti.com", "custom_domain": true },
  { "pattern": "www.yudhabhakti.com", "custom_domain": true }
]
```

`custom_domain: true` makes Cloudflare create the DNS record and issue the certificate on
deploy. Do not add this before the zone is active — the deploy will fail.

This is already applied in `wrangler.jsonc`.

### If the site looks down from your machine but not elsewhere

A domain that has just been delegated is often cached as non-existent by your local resolver
or router for a while. The symptom is `Couldn't connect to server` locally while the site is
fine from everywhere else. Confirm by bypassing DNS:

```bash
curl -sI --resolve yudhabhakti.com:443:172.67.164.173 https://yudhabhakti.com/
```

If that returns 200, the site is up and only your resolver is stale. On macOS:
`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`.

### A note on robots.txt

Cloudflare prepends a managed Content Signals block that disallows `GPTBot` and
`meta-externalagent`. `public/robots.txt` is still served underneath it, `Sitemap:` included.
If you would rather AI crawlers were allowed, that toggle is in the zone settings, not in
this repo.

### Continuous deployment via GitHub Actions

`.github/workflows/deploy.yml` builds on every push and pull request, and deploys to
Cloudflare only on pushes to `main`.

**GitHub Actions does not read `.env`.** That file is local-only and gitignored. CI secrets
must be added to the repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Where to find it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sidebar, or the subdomain of your R2 endpoint URL |

Create a **fresh, scoped** token for CI rather than reusing an existing one. If it is ever
exposed in a log, you want to revoke it without breaking anything else.

**The token must come from the "Edit Cloudflare Workers" template.** An R2 token, a DNS
token, or a custom token without `Workers Scripts:Edit` will pass `/user/tokens/verify` — it
is a real, active token — and then fail the deploy with `Authentication error [code: 10000]`.
That error does not say "wrong permissions," so it is easy to misread as a bad secret.

Check a token before setting it:

```bash
CLOUDFLARE_API_TOKEN=xxxx CLOUDFLARE_ACCOUNT_ID=yyyy node scripts/check-cf-token.mjs
```

It reports whether the token is valid, which accounts it can see, and whether it can actually
reach Workers on the target account — distinguishing "missing permission" from "scoped to a
different account," which produce the identical error from wrangler. It never prints the
token.

Then:

```bash
git remote add origin git@github.com:bhaktiyudha/yudhabhakti.com.git
git push -u origin main
```

Safety properties of the workflow, so you know what it will and will not do:

- Pull requests **build but never deploy** — guarded by `if:` and by GitHub withholding
  secrets from fork PRs.
- `permissions: contents: read` — the workflow cannot write to your repository.
- `concurrency` with `cancel-in-progress` — a newer push supersedes an in-flight deploy
  rather than racing it.
- No untrusted event data (PR titles, commit messages, branch names) reaches any `run:`
  step, so there is no script-injection path.

---

## SEO

Already handled:

- Static pre-rendered HTML — crawlers get full content with no JS execution
- Unique `<title>` and meta description per page, one `<h1>` per page
- Canonical URLs, Open Graph, Twitter cards
- JSON-LD: one `Person` node referenced by `@id` from every page, `BlogPosting` +
  `BreadcrumbList` on posts, `ProfilePage` on `/about`
- `sitemap-index.xml` with `lastmod` on every post, `robots.txt`
- Social preview image at `public/og.png`, default for every page
- Semantic landmarks, skip link, `prefers-reduced-motion`, light/dark with no FOUC

### Ranking for your own name

The goal is that searching **Yudha Bhakti** returns this site. The site uses the full name,
**Yudha Bhakti Nugraha**, everywhere a machine reads it:

| Place | Value |
|---|---|
| `<title>` (every page) | ends with `Yudha Bhakti Nugraha` |
| Homepage `<h1>` | contains the full name |
| `<meta name="author">` | full name |
| JSON-LD `Person.name` | full name |
| JSON-LD `Person.alternateName` | `Yudha Bhakti` |
| Header brand | `yudha bhakti` — short, because the header overflows at 320px otherwise |

The reasoning: the full name **contains** the short one, so pages stay fully eligible for the
`Yudha Bhakti` query while being distinctive enough to rank first for the full one almost
immediately. `alternateName` is what tells Google the two strings are one entity rather than
two people.

`SITE.title` and `SITE.shortName` in `src/consts.ts` control this. Do not diverge them.

**One entity, not twenty-six.** `PERSON` in `src/consts.ts` carries `@id`
`https://yudhabhakti.com/#person`. Every page embeds that same node, and posts reference it
as `author` and `publisher` by `@id` rather than repeating a name string. Search engines
merge nodes sharing an `@id`, so all 26 pages reinforce one identity. `/about` additionally
declares itself a `ProfilePage` with that person as `mainEntity`, which is how you nominate a
single URL as *the* page representing the entity.

Add profiles to `SOCIAL` and they flow into `sameAs` automatically — no second list to keep
in sync.

### Verifying with search engines

`VERIFICATION` in `src/consts.ts` holds the tokens. Paste only the token, not the whole tag;
an empty string emits nothing.

```ts
export const VERIFICATION = {
  google: 'abc123…',  // Search Console → Add property → URL prefix → HTML tag
  bing: '',           // Bing Webmaster Tools → HTML Meta Tag
} as const;
```

**Prefer the DNS method in Search Console** if you are willing to add a TXT record in
Cloudflare. Choosing the *Domain* property type instead of *URL prefix* verifies the apex,
`www`, and both schemes at once, and it does not depend on a meta tag surviving a redesign.

### What is left, and it is most of the effect

A four-day-old domain with no inbound links ranks slowly no matter how good the markup is.
In rough order of impact:

1. **Put `yudhabhakti.com` in the LinkedIn "Website" field and the GitHub profile website
   field.** Both are empty right now. These are the highest-authority links you can give
   yourself for free and the strongest signal available to a new personal domain.
2. **Google Search Console** — verify, submit `https://yudhabhakti.com/sitemap-index.xml`,
   then URL Inspection → Request Indexing on the homepage. Repeat in Bing Webmaster Tools;
   two minutes, and it feeds DuckDuckGo.
3. **A GitHub profile README** at `bhaktiyudha/bhaktiyudha` linking here.
4. **Name consistency.** Your GitHub display name is already `Yudha Bhakti Nugraha` — match
   it on LinkedIn so all three `sameAs` targets agree.

Expect **two to eight weeks** for the full name, longer for `Yudha Bhakti` alone since other
people share it. The exact match between the domain and the query does a lot of work, but not
instantly.

---

## Notes on the build

- Pinned to Astro 5. Astro 7 is out; the content collection APIs used here
  (`glob` loader, `render()`) changed across that boundary, so upgrading needs a migration
  pass rather than a version bump.
- `pnpm-workspace.yaml` allowlists build scripts for `esbuild`, `sharp`, and `workerd` —
  pnpm 11 blocks postinstall scripts by default.
- Shiki renders code blocks in both themes; `global.css` activates the dark set for the
  system preference and for an explicitly pinned dark theme.
