import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../consts';

export async function GET(context: APIContext) {
  const posts = (await getCollection('writing', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf()
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    // Defaults to true, which would append a slash and send every feed reader
    // through the edge redirect. Keep feed links in the site's canonical form.
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      categories: post.data.tags,
      // Slashless, matching the canonical tag and the sitemap entry.
      link: `/writing/${post.id}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
