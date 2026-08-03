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

### 1. There is a credentials file in this directory

A file named `env` sits in the project root containing a GitHub PAT, two Cloudflare API
tokens, R2 access keys, and Tencent + Alibaba Cloud keys.

It is in `.gitignore` and is **not** tracked by git. But it should not live in a web project
directory at all:

- **Move it** somewhere outside this repo (`~/.config/` or a password manager).
- **Rotate the tokens.** They have been sitting in plaintext in a directory that is now a git
  repository. Rotating is cheap; assuming they are fine is not.
- Never `git add -f env`, and never remove it from `.gitignore`.

For deploying, authenticate with `wrangler login` instead of exporting a token — it stores
a scoped OAuth credential rather than a long-lived key.

### 2. Confirm your job title

`src/pages/work.astro` lists your current role as **IT Application Specialist** at Godrej
Consumer Products. That came from your own notes, which said "likely" — it is not confirmed.

Check it against your offer letter and fix it before this goes live. Your CV, LinkedIn, and
employment forms are consistent right now; a public site that disagrees with them is exactly
the kind of thing that surfaces awkwardly in a background check.

### 3. The blog posts are drafts

Three posts are written and publishable, but you should read them first — they are in your
voice and I wrote them from your resume and public repo.

| Post | What to check |
|---|---|
| `from-nanosatellites-to-palm-oil-estates.md` | The personal details are inferred from your CV. Make them yours. |
| `building-bykami.md` | Written from the public repo. Verify the business lines and roadmap are accurate and that you are comfortable publishing them. |
| `hybrid-retrieval-structured-and-unstructured.md` | Deliberately de-identified. Confirm nothing reads as employer-specific. |

Each contains `<!-- TODO(yudha): ... -->` comments marking spots where a specific detail or
a photo would help. These are HTML comments — they do not render.

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

### Continuous deployment (optional)

Push this repo to GitHub, then connect it under **Workers & Pages → Create → Import a
repository**. Build command `pnpm build`, output directory `dist`.

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
