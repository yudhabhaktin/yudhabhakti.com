// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

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
      return [`/writing/${f.replace(/\.md$/, '')}/`, new Date(date).toISOString()];
    })
);

// The listings change whenever a post does, so they inherit the newest post's date.
const newest = [...postDates.values()].sort().at(-1);
for (const path of ['/', '/writing/']) postDates.set(path, newest);

export default defineConfig({
  site: 'https://yudhabhakti.com',
  integrations: [
    sitemap({
      serialize(item) {
        const lastmod = postDates.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
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
