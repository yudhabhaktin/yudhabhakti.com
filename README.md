# yudhabhakti.com

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

Twelve posts are written and publishable, backdated across 2015–2026. They are in your voice,
written from your resume, your public repo, and your LinkedIn. **Read them before they go
live.** Several contain `<!-- TODO(yudha): ... -->` comments marking where a specific detail
or a photo would help — those are HTML comments and do not render.

**Highest priority to verify:**

| Post | What to check |
|---|---|
| `komurindo-antenna-tracker.md` | **Year and placement.** I dated it 2015 from your degree timeline. Search surfaced a 1st place in Muatan Roket at KOMURINDO/KOMBAT 2015 under *"Yudha Bakti Nugroho, ELINS UGM"* — different spelling, so I did **not** claim it. If that was you, add it. If not, leave it out. |
| `detection-thresholds-and-the-cost-of-being-wrong.md` | BATAN work. Written deliberately conceptual — no thresholds, no architecture, no capabilities. Confirm you are comfortable with even this level. |
| `building-bykami.md` | Written from the public repo. Verify the business lines and roadmap, and that you want them public. |
| `migrating-source-control-for-an-organisation.md` | De-identified by design — no employer, no counts, no identity/residency detail. Confirm nothing reads as attributable. |
| `the-year-i-stopped-shipping-code.md` | Personal reflection on becoming a lead. Check the tone is one you want colleagues reading. |

**Lower risk, still worth a read:** `kri-2017-teaching-a-robot-to-dance`,
`ugmsat-1-no-patch-window`, `modbus-mqtt-and-the-factory-floor`,
`models-that-are-fast-in-the-lab`, `what-170-hours-of-mentoring-taught-me`,
`from-nanosatellites-to-palm-oil-estates`, `hybrid-retrieval-structured-and-unstructured`.

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
  pages/                  index, writing, work, projects, about, 404, rss
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

`draft: true` hides it from the site, listings, and RSS. The URL is the filename.

---

## Deploying to Cloudflare

The site builds to static HTML and is served by Workers static assets.

```bash
pnpm wrangler login     # one time, OAuth — do not use the token in `env`
pnpm deploy             # builds, then deploys
```

### Connecting yudhabhakti.com

Once deployed, in the Cloudflare dashboard: **Workers & Pages → yudhabhakti-com → Domains →
Add existing domain**. Cloudflare creates the DNS record and issues the certificate itself,
provided the domain's nameservers already point at Cloudflare.

Add both `yudhabhakti.com` and `www.yudhabhakti.com` if you want the `www` form to resolve.

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
- JSON-LD: `Person` sitewide, `BlogPosting` on posts
- `sitemap-index.xml`, `robots.txt`, RSS at `/rss.xml`
- Semantic landmarks, skip link, `prefers-reduced-motion`, light/dark with no FOUC

Still worth doing:

**Add a social preview image.** Drop a 1200×630 PNG at `public/og.png` and pass
`image="/og.png"` to `BaseLayout` (or set it as the default in `BaseLayout.astro`). Without
one, links shared to LinkedIn and Slack render as a plain text card. This matters more than
it sounds for a site you are putting on job applications.

**Submit to Google Search Console** after the domain is live, and paste in the sitemap URL.

---

## Notes on the build

- Pinned to Astro 5. Astro 7 is out; the content collection APIs used here
  (`glob` loader, `render()`) changed across that boundary, so upgrading needs a migration
  pass rather than a version bump.
- `pnpm-workspace.yaml` allowlists build scripts for `esbuild`, `sharp`, and `workerd` —
  pnpm 11 blocks postinstall scripts by default.
- Shiki renders code blocks in both themes; `global.css` activates the dark set for the
  system preference and for an explicitly pinned dark theme.
