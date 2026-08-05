// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

/**
 * The site addresses every page without a trailing slash — canonical tags,
 * internal links, JSON-LD `@id`s and the sitemap all agree on that one form.
 * Cloudflare enforces it at the edge (`html_handling: "drop-trailing-slash"`
 * in wrangler.jsonc). Root is the exception: it stays "/".
 */
/** @param {string} pathname */
const canonicalPath = (pathname) => pathname.replace(/(?<=.)\/$/, '');

// <lastmod> dates for the sitemap. Read straight from the frontmatter because
// integrations are configured before content collections are available.
const POSTS = './src/content/writing';
const postDates = new Map(
  readdirSync(POSTS)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(`${POSTS}/${f}`, 'utf8');
      const date =
        /^updated:\s*(\S+)/m.exec(src)?.[1] ?? /^published:\s*(\S+)/m.exec(src)?.[1];
      // The collection schema requires `published`, so this only fires on a
      // malformed file. Failing loudly beats emitting "Invalid Date" as lastmod.
      if (!date) throw new Error(`No published/updated date in frontmatter: ${f}`);
      return /** @type {[string, string]} */ ([
        `/writing/${f.replace(/\.md$/, '')}`,
        new Date(date).toISOString(),
      ]);
    })
);

// The listings change whenever a post does, so they inherit the newest post's date.
const newest = [...postDates.values()].sort().at(-1);
if (newest) for (const path of ['/', '/writing']) postDates.set(path, newest);

export default defineConfig({
  site: 'https://yudhabhakti.com',
  trailingSlash: 'never',
  // Prefetch on hover: links are fetched just before the click lands, so
  // navigation feels instant without preloading 23 posts on the listing page.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      serialize(item) {
        // Normalise here rather than trusting the integration to follow
        // `trailingSlash`, so a sitemap URL can never disagree with the
        // canonical tag on the page it points at.
        const url = new URL(item.url);
        url.pathname = canonicalPath(url.pathname);
        const lastmod = postDates.get(url.pathname);
        return { ...item, url: url.href, ...(lastmod ? { lastmod } : {}) };
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
