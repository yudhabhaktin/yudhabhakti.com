import { SITE, PERSON, PERSON_ID, CREATED_WORKS } from '../consts';

/**
 * JSON-LD builders.
 *
 * Every page emits ONE `@graph` rather than a standalone node, and the nodes in
 * it reference each other by `@id`. Search engines merge nodes that share an
 * `@id` across pages, so 27 pages describing the same site and the same person
 * reinforce two entities instead of introducing 54 similar-looking ones.
 *
 * Three stable ids anchor the graph:
 *   #person   the author — defined in consts.ts, referenced everywhere
 *   #website  the site itself
 *   <url>#webpage  the individual page
 */

export const WEBSITE_ID = `${SITE.url}/#website`;

/** Loose node type — modelling all of schema.org buys nothing here. */
type Node = Record<string, unknown>;

export interface Breadcrumb {
  name: string;
  /** Absolute URL. Omitted on the final crumb, which is the current page. */
  item?: string;
}

export interface SchemaInput {
  /** Absolute canonical URL of the page. */
  canonical: string;
  /** Page name, without the site-name suffix. */
  name: string;
  description: string;
  /** Absolute URL of the social preview image. */
  image?: string;
  breadcrumbs?: Breadcrumb[];
  /** Present on blog posts. */
  article?: { published: Date; updated?: Date; tags?: string[] };
  /** Present on listing pages — drives CollectionPage + ItemList. */
  collection?: { name: string; url: string }[];
  /** Marks this URL as *the* page representing the person entity. */
  profile?: boolean;
  /**
   * Emit the externally-credited work in `CREATED_WORKS`, each pointing back at
   * `#person` as its creator. Opt-in rather than global: the claim belongs on the
   * pages that also state it in prose, and repeating it on 27 pages that do not
   * mention it is the kind of markup-without-content mismatch that gets a whole
   * graph discounted.
   */
  works?: boolean;
}

const website: Node = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE.url,
  name: SITE.title,
  alternateName: SITE.shortName,
  description: SITE.description,
  inLanguage: SITE.locale,
  publisher: { '@id': PERSON_ID },
  // No site search exists, so no SearchAction is declared — claiming one that
  // does not resolve is worse than claiming none.
};

const breadcrumbList = (crumbs: Breadcrumb[]): Node => ({
  '@type': 'BreadcrumbList',
  '@id': `${crumbs.at(-1)?.item ?? SITE.url}#breadcrumb`,
  itemListElement: crumbs.map((crumb, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: crumb.name,
    ...(crumb.item ? { item: crumb.item } : {}),
  })),
});

/**
 * Builds the full graph for a page. Returns the object ready to be
 * `JSON.stringify`-ed into a single ld+json script tag.
 */
export function buildSchema(input: SchemaInput) {
  const { canonical, name, description, image, breadcrumbs, article, collection, profile, works } =
    input;

  const pageId = `${canonical}#webpage`;

  // The page node's @type narrows by what the page actually is. ProfilePage is
  // the strongest of these: it nominates one URL as representing the entity.
  const pageType = profile
    ? 'ProfilePage'
    : article
      ? 'WebPage'
      : collection
        ? 'CollectionPage'
        : 'WebPage';

  const page: Node = {
    '@type': pageType,
    '@id': pageId,
    url: canonical,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: SITE.locale,
    ...(image ? { primaryImageOfPage: image } : {}),
    ...(breadcrumbs?.length ? { breadcrumb: { '@id': `${canonical}#breadcrumb` } } : {}),
    // On /about the person is the subject; elsewhere they are merely the author.
    ...(profile ? { mainEntity: { '@id': PERSON_ID } } : { about: { '@id': PERSON_ID } }),
    ...(collection
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: collection.length,
            itemListElement: collection.map((entry, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: entry.name,
              url: entry.url,
            })),
          },
        }
      : {}),
  };

  const graph: Node[] = [website, { ...PERSON }, page];

  if (article) {
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${canonical}#article`,
      headline: name,
      description,
      datePublished: article.published.toISOString(),
      dateModified: (article.updated ?? article.published).toISOString(),
      author: { '@id': PERSON_ID },
      publisher: { '@id': PERSON_ID },
      isPartOf: { '@id': WEBSITE_ID },
      mainEntityOfPage: { '@id': pageId },
      inLanguage: SITE.locale,
      ...(article.tags?.length ? { keywords: article.tags.join(', ') } : {}),
      ...(image ? { image } : {}),
    });
  }

  if (works) graph.push(...CREATED_WORKS.map((work) => ({ ...work })));

  if (breadcrumbs?.length) graph.push(breadcrumbList(breadcrumbs));

  return { '@context': 'https://schema.org', '@graph': graph };
}
