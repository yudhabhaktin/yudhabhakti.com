export const SITE = {
  // Full name everywhere that search engines read — titles, meta author, structured data.
  // It contains "Yudha Bhakti" as a substring, so it stays eligible for the short query
  // while being distinctive enough to own the long one.
  title: 'Yudha Bhakti Nugraha',
  // The short form, declared as schema.org alternateName so both resolve to one entity.
  // Also what the header brand shows — the header has no room for the full name at 320px.
  shortName: 'Yudha Bhakti',
  tagline: 'Engineer in Jakarta. Embedded systems, cloud platforms, applied AI.',
  description:
    'Yudha Bhakti Nugraha is an engineer in Jakarta, Indonesia. He builds systems that reach into the physical world — satellites, toll gates, factory floors — and the cloud platforms behind them.',
  url: 'https://yudhabhakti.com',
  author: 'Yudha Bhakti Nugraha',
  email: 'yudha.bhakti.n@gmail.com',
  locale: 'en',
} as const;

/**
 * Browser-UI colour, matched to `--paper-light` / `--paper-dark` in global.css
 * (converted from the OKLCH tokens defined there). Change both together.
 */
export const THEME_COLOR = {
  light: '#fdfbf7',
  dark: '#0d1116',
} as const;

export const NAV = [
  { href: '/writing', label: 'writing' },
  { href: '/work', label: 'work' },
  { href: '/projects', label: 'projects' },
  { href: '/about', label: 'about' },
] as const;

export const SOCIAL = [
  { href: 'https://github.com/bhaktiyudha', label: 'GitHub' },
  { href: 'https://linkedin.com/in/yudhabhakti', label: 'LinkedIn' },
  { href: `mailto:${SITE.email}`, label: 'Email' },
] as const;

/**
 * Search-engine ownership verification. Paste only the token — the `content="…"`
 * value from the HTML-tag method, not the whole tag. Empty means nothing is emitted.
 */
export const VERIFICATION = {
  google: '', // Search Console → Add property → HTML tag
  bing: '', // Bing Webmaster Tools → HTML Meta Tag
} as const;

/**
 * One canonical description of the person, referenced by `@id` from every other
 * schema on the site. Search engines merge nodes that share an `@id`, so the
 * author of a post and the subject of /about resolve to a single entity rather
 * than to three similar-looking people.
 */
export const PERSON_ID = `${SITE.url}/#person`;

export const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE.author,
  alternateName: SITE.shortName,
  url: SITE.url,
  email: SITE.email,
  jobTitle: 'Technical Lead',
  description: SITE.description,
  address: { '@type': 'PostalAddress', addressLocality: 'Jakarta', addressCountry: 'ID' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universitas Gadjah Mada' },
  knowsLanguage: ['id', 'en'],
  knowsAbout: [
    'Solution Architecture',
    'Cloud Computing',
    'Embedded Systems',
    'Edge Computing',
    'Applied AI',
    'Retrieval-Augmented Generation',
  ],
  sameAs: SOCIAL.filter((s) => s.href.startsWith('http')).map((s) => s.href),
} as const;
