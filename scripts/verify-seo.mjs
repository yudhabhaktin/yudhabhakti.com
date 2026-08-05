/**
 * Validates the built site's SEO surface. Run after `pnpm build`:
 *
 *   pnpm verify
 *
 * Exits non-zero on any failure, so CI blocks the deploy. Uses only Node
 * builtins — no dependency, nothing to keep up to date.
 *
 * The check that matters most is the trailing-slash agreement between the
 * sitemap, the canonical tags and the internal links. Those three drifted apart
 * once already: the sitemap advertised `/about/` while every canonical tag and
 * link pointed at `/about`, so Cloudflare 307-redirected the site's own
 * canonical URLs. Nothing failed loudly — the build was green and every page
 * rendered. Only crawlers saw it.
 */
import { existsSync, globSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const files = globSync('**/*.html', { cwd: DIST }).sort();
const fail = [];
const warn = [];

const titles = new Map();
const descs = new Map();
const canons = new Map();

const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]));

for (const f of files) {
  const html = readFileSync(join(DIST, f), 'utf8');
  const at = (msg) => `${f}: ${msg}`;

  /** Asserts a tag appears exactly once, and returns its captured value. */
  const one = (re, name) => {
    const matches = [...html.matchAll(re)];
    if (matches.length === 0) fail.push(at(`missing ${name}`));
    else if (matches.length > 1) fail.push(at(`duplicate ${name} (${matches.length})`));
    return matches[0]?.[1];
  };

  const title = one(/<title>([^<]*)<\/title>/g, '<title>');
  const desc = one(/<meta name="description" content="([^"]*)"/g, 'meta description');
  const canonical = one(/<link rel="canonical" href="([^"]*)"/g, 'canonical');
  const robots = one(/<meta name="robots" content="([^"]*)"/g, 'robots');
  one(/<meta property="og:title" content="([^"]*)"/g, 'og:title');
  one(/<meta property="og:image" content="([^"]*)"/g, 'og:image');
  one(/<meta name="twitter:card" content="([^"]*)"/g, 'twitter:card');
  one(/<meta charset="([^"]*)"/g, 'charset');
  one(/<meta name="viewport" content="([^"]*)"/g, 'viewport');

  const h1Count = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1Count !== 1) fail.push(at(`${h1Count} <h1> elements (want 1)`));

  // Heading levels may descend freely but must not skip on the way down.
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      fail.push(at(`heading jumps h${levels[i - 1]} -> h${levels[i]}`));
    }
  }

  if (!/<html[^>]+lang="/.test(html)) fail.push(at('missing <html lang>'));

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ld) {
    fail.push(at('missing JSON-LD'));
  } else {
    try {
      const json = JSON.parse(ld[1]);
      if (!json['@context']) fail.push(at('JSON-LD missing @context'));
      if (!Array.isArray(json['@graph'])) fail.push(at('JSON-LD missing @graph'));
      for (const node of json['@graph'] ?? []) {
        if (!node['@type']) fail.push(at('JSON-LD node without @type'));
      }
    } catch (e) {
      fail.push(at(`JSON-LD invalid: ${e.message}`));
    }
  }

  // The site currently ships no <img> at all. These fire only if one is added.
  for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(tag[0])) fail.push(at('img without alt'));
    if (!/\bwidth=/.test(tag[0]) || !/\bheight=/.test(tag[0])) {
      warn.push(at('img without width/height (CLS risk)'));
    }
    if (!/\bloading=/.test(tag[0])) warn.push(at('img without loading attribute'));
  }

  const noindex = /noindex/.test(robots ?? '');

  if (canonical) {
    // Indexable pages belong in the sitemap; noindex pages must stay out of it.
    if (!noindex && !sitemapUrls.has(canonical)) {
      fail.push(at(`canonical not in sitemap: ${canonical}`));
    }
    if (noindex && sitemapUrls.has(canonical)) {
      fail.push(at(`noindex page is in sitemap: ${canonical}`));
    }

    // The canonical must point at the page's own URL.
    // dist/about/index.html -> /about ; dist/404.html -> /404
    const filePath =
      '/' +
      relative(DIST, join(DIST, f))
        .split(sep)
        .join('/')
        .replace(/index\.html$/, '')
        .replace(/\.html$/, '');
    const expected = filePath.replace(/(?<=.)\/$/, '') || '/';
    const actual = new URL(canonical).pathname.replace(/(?<=.)\/$/, '') || '/';
    if (actual !== expected) fail.push(at(`canonical ${actual} != page path ${expected}`));
  }

  if (!noindex) {
    if (title) titles.set(title, [...(titles.get(title) ?? []), f]);
    if (desc) descs.set(desc, [...(descs.get(desc) ?? []), f]);
    if (canonical) canons.set(canonical, [...(canons.get(canonical) ?? []), f]);
  }

  for (const link of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const path = link[1];
    if (/\.(css|js|svg|png|xml|json|txt|ico)$/.test(path)) continue;
    const target = path === '/' ? 'index.html' : `${path.replace(/^\//, '')}/index.html`;
    if (!existsSync(join(DIST, target))) fail.push(at(`broken internal link ${path}`));
    if (path !== '/' && path.endsWith('/')) {
      fail.push(at(`internal link has trailing slash: ${path}`));
    }
  }
}

for (const [value, pages] of titles) {
  if (pages.length > 1) fail.push(`duplicate <title> "${value}": ${pages.join(', ')}`);
}
for (const [, pages] of descs) {
  if (pages.length > 1) fail.push(`duplicate meta description: ${pages.join(', ')}`);
}
for (const [value, pages] of canons) {
  if (pages.length > 1) fail.push(`duplicate canonical ${value}: ${pages.join(', ')}`);
}

// Every advertised URL must resolve to a page that was actually built.
for (const url of sitemapUrls) {
  const path = new URL(url).pathname.replace(/(?<=.)\/$/, '') || '/';
  const target = path === '/' ? 'index.html' : `${path.replace(/^\//, '')}/index.html`;
  if (!existsSync(join(DIST, target))) fail.push(`sitemap URL has no page: ${url}`);
}

console.log(`checked ${files.length} pages against ${sitemapUrls.size} sitemap URLs`);
if (warn.length) {
  console.log(`\nwarnings (${warn.length})`);
  for (const w of new Set(warn)) console.log(`  ~ ${w}`);
}
if (fail.length) {
  console.log(`\nfailures (${fail.length})`);
  for (const f of fail) console.log(`  x ${f}`);
  process.exit(1);
}
console.log('ok');
