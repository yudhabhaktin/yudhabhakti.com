# yudhabhakti.com

Personal site and blog — **[yudhabhakti.com](https://yudhabhakti.com)**.

Astro 5, static output, no client-side framework. Served from Cloudflare Workers static
assets, deployed automatically from `main`.

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # -> dist/
pnpm preview    # serve the built output
```

The only JavaScript shipped to the browser is a ~20-line theme toggle.

---

## Structure

```
src/
  consts.ts                 site metadata, nav, social links, structured data — edit here first
  content.config.ts         blog schema
  content/writing/*.md      posts
  layouts/BaseLayout.astro  <head>, SEO, header, footer, theme toggle
  pages/                    index, writing, work, projects, about, 404
  styles/global.css         the whole design system
  plugins/                  reading-time remark plugin
scripts/
  generate-og.mjs           builds public/og.png with sharp
  check-cf-token.mjs        diagnoses a Cloudflare API token before it goes into CI
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

## Design

Light and dark are defined together with `light-dark()`, guarded by `@supports` with a
`prefers-color-scheme` fallback. An inline, non-deferred script in `<head>` applies a pinned
theme before first paint, so there is no flash.

The theme toggle is two-state rather than three: it follows the system by default, and one
press pins the opposite of whatever the system currently says. Pressing again returns to
following the system. There is no separate "auto" position to hunt for.

CSS is organised in cascade layers (`reset, base, layout, components, utilities`) and uses
logical properties throughout.

---

## SEO

- Static pre-rendered HTML — crawlers get full content with no JS execution
- Unique `<title>` and meta description per page, one `<h1>` per page
- Canonical URLs, Open Graph, Twitter cards, `og:image` on every page
- JSON-LD: one `Person` node referenced by `@id` from every page, `BlogPosting` +
  `BreadcrumbList` on posts, `ProfilePage` on `/about`
- `sitemap-index.xml` with `lastmod` on every post, `robots.txt`
- Semantic landmarks, skip link, `prefers-reduced-motion`, no layout shift

### One entity, not twenty-six

`PERSON` in `src/consts.ts` carries the `@id` `https://yudhabhakti.com/#person`. Every page
embeds that node, and posts reference it as `author` and `publisher` by `@id` rather than
repeating a name string. Search engines merge nodes sharing an `@id`, so every page
reinforces one identity instead of presenting several similar-looking ones.

`/about` declares itself a `ProfilePage` with that person as `mainEntity`, nominating a
single canonical URL as *the* page representing the entity.

`sameAs` is derived from `SOCIAL`, so adding a profile in one place is enough.

### Name handling

Titles, `meta[name=author]`, and `Person.name` all use the full name; `Person.alternateName`
carries the short form. The full name contains the short one, so pages stay eligible for both
queries while `alternateName` tells search engines the two strings are one person.

`SITE.title` and `SITE.shortName` control this. Keep them consistent with each other.

### Search-engine verification

`VERIFICATION` in `src/consts.ts` holds the tokens — paste only the token, not the whole tag.
An empty string emits nothing.

```ts
export const VERIFICATION = {
  google: '',  // Search Console → Add property → URL prefix → HTML tag
  bing: '',    // Bing Webmaster Tools → HTML Meta Tag
} as const;
```

The DNS method is better where available: a *Domain* property in Search Console covers the
apex, `www`, and both schemes at once, and does not depend on a meta tag surviving a
redesign.

---

## Deploying

```bash
pnpm wrangler login     # one time, scoped OAuth
pnpm deploy             # builds, then deploys
```

`wrangler.jsonc` publishes to the apex and `www` as custom domain routes with `workers_dev`
off, so there is a single origin matching the canonical URLs the pages emit.
`custom_domain: true` makes Cloudflare create the DNS record and issue the certificate on
deploy — the zone must already be active, or the deploy fails.

### Continuous deployment

`.github/workflows/deploy.yml` builds on every push and pull request, and deploys only on
pushes to `main`. Two repository secrets are required under
**Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sidebar |

Safety properties of the workflow:

- Pull requests build but never deploy — guarded by `if:`, and by GitHub withholding secrets
  from fork PRs
- `permissions: contents: read` — it cannot write to the repository
- `concurrency` with `cancel-in-progress` — a newer push supersedes an in-flight deploy
- No untrusted event data (PR titles, commit messages, branch names) reaches any `run:` step,
  so there is no script-injection path

### Two failure modes worth documenting

**`Authentication error [code: 10000]` with a token that verifies fine.** The token must come
from the *Edit Cloudflare Workers* template. An R2 token, a DNS token, or a custom token
without `Workers Scripts:Edit` will pass `/user/tokens/verify` — it is a real, active token —
and then fail the deploy. The error does not mention permissions, so it reads like a bad
secret. `scripts/check-cf-token.mjs` distinguishes the two causes, and the identical-looking
third one where the token is scoped to a different account:

```bash
CLOUDFLARE_API_TOKEN=xxxx CLOUDFLARE_ACCOUNT_ID=yyyy node scripts/check-cf-token.mjs
```

It never prints the token.

**A newly delegated domain looks down locally but is fine everywhere else.** Local resolvers
and consumer routers cache the `NXDOMAIN` from before the nameserver change. Confirm by
bypassing DNS:

```bash
curl -sI --resolve yudhabhakti.com:443:$(dig +short yudhabhakti.com @1.1.1.1 | head -1) \
  https://yudhabhakti.com/
```

A 200 there means the site is up and only the resolver is stale. On macOS:
`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`.

### robots.txt

Cloudflare prepends a managed Content Signals block that disallows `GPTBot` and
`meta-externalagent`. `public/robots.txt` is still served underneath it, `Sitemap:` line
included. That toggle lives in the zone settings, not in this repo.

---

## Notes on the build

- Pinned to Astro 5. Astro 7 is out; the content collection APIs used here (`glob` loader,
  `render()`) changed across that boundary, so upgrading needs a migration pass rather than a
  version bump.
- `pnpm-workspace.yaml` allowlists build scripts for `esbuild`, `sharp`, and `workerd` —
  pnpm 11 blocks postinstall scripts by default.
- Shiki renders code blocks in both themes; `global.css` activates the dark set for the
  system preference and for an explicitly pinned dark theme.
- Sitemap `lastmod` is read from post frontmatter at config time, because integrations are
  configured before content collections are available. Pages with no known modification date
  are left without one — a wrong `lastmod` is worse than none.
