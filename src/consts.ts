export const SITE = {
  // Full name everywhere that search engines read — titles, meta author, structured data.
  // It contains "Yudha Bhakti" as a substring, so it stays eligible for the short query
  // while being distinctive enough to own the long one.
  title: 'Yudha Bhakti Nugraha',
  // The short form, declared as schema.org alternateName so both resolve to one entity.
  // Also what the header brand shows — the header has no room for the full name at 320px.
  shortName: 'Yudha Bhakti',
  tagline: 'Engineer in Jakarta. Cloud architecture, applied AI, and the embedded systems underneath.',
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
  { href: 'https://github.com/yudhabhaktin', label: 'GitHub' },
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

/**
 * The organisations this person is attached to, each pinned to its Wikidata entity.
 *
 * This is disambiguation machinery, not decoration. A Person node that is only a
 * name and a city is trivially merged with any similar name; a Person node wired
 * to entities the knowledge graph already holds — Q1145992, Q12487405 — is not.
 * The employers are the disambiguating facts, so they are stated in a form a
 * machine can resolve rather than only as prose on /work.
 *
 * Every Q-id below was looked up against wikidata.org. Do not add one from
 * memory: a `sameAs` pointing at the wrong entity is worse than no `sameAs`,
 * because it asserts an identity the graph can actively disprove. Wikipedia URLs
 * appear only where the English article was confirmed to exist.
 */
const ORG = {
  godrej: {
    '@type': 'Organization',
    name: 'Godrej Consumer Products',
    url: 'https://www.godrejindonesia.com',
    sameAs: ['https://www.wikidata.org/wiki/Q5576809'],
  },
  smart: {
    '@type': 'Organization',
    name: 'Sinar Mas Agribusiness and Food (PT SMART Tbk)',
    sameAs: ['https://www.wikidata.org/wiki/Q57440617'],
  },
  jasaMarga: {
    '@type': 'Organization',
    name: 'PT Jasa Marga (Persero) Tbk',
    sameAs: ['https://www.wikidata.org/wiki/Q12487405'],
  },
  telkom: {
    '@type': 'Organization',
    name: 'PT Telkom Indonesia Tbk',
    sameAs: [
      'https://en.wikipedia.org/wiki/Telkom_Indonesia',
      'https://www.wikidata.org/wiki/Q2305438',
    ],
  },
  ugm: {
    '@type': 'CollegeOrUniversity',
    name: 'Universitas Gadjah Mada',
    url: 'https://ugm.ac.id/en/',
    sameAs: [
      'https://en.wikipedia.org/wiki/Gadjah_Mada_University',
      'https://www.wikidata.org/wiki/Q1145992',
    ],
  },
} as const;

export const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE.author,
  alternateName: SITE.shortName,
  url: SITE.url,
  email: SITE.email,
  jobTitle: 'IT Application Specialist',
  worksFor: ORG.godrej,
  /**
   * Past employers. `affiliation` is the loosest of schema.org's person-to-org
   * properties ("an organization that this person is affiliated with"), which is
   * why it is the right one here — `worksFor` would falsely claim all four are
   * current. Ordered most recent first; keep it in step with /work.
   */
  affiliation: [ORG.smart, ORG.jasaMarga, ORG.telkom],
  description: SITE.description,
  /**
   * "Yudha Bhakti" alone is contested — it is also the former name of a listed
   * Indonesian bank, and there are other people with the name. This property
   * exists precisely to separate similar-named entities, so it leans on the
   * things that are unique to this one: the field, the city, the employers.
   * It deliberately does not mention the bank; naming it here would only
   * associate the two.
   */
  disambiguatingDescription:
    'Software and platform engineer based in Jakarta, Indonesia. Works on embedded systems, cloud platforms and applied AI; previously at Sinar Mas Agribusiness, Jasa Marga and Telkom Indonesia. Graduate of Universitas Gadjah Mada.',
  address: { '@type': 'PostalAddress', addressLocality: 'Jakarta', addressCountry: 'ID' },
  alumniOf: ORG.ugm,
  knowsLanguage: ['id', 'en'],
  knowsAbout: [
    'Solution Architecture',
    'Cloud Computing',
    'Cloud Migration',
    'Amazon Web Services',
    'Embedded Systems',
    'Edge Computing',
    'Applied AI',
    'Retrieval-Augmented Generation',
  ],
  sameAs: SOCIAL.filter((s) => s.href.startsWith('http')).map((s) => s.href),
} as const;

/**
 * Work of this person that a third party already credits by full name.
 *
 * This is the strongest disambiguation signal available, and it is the only one
 * that does not originate here: an independent site states the name, and the node
 * below connects that statement to `#person`. Self-description is cheap and every
 * similar-named entity has some; external corroboration is what separates them.
 *
 * The `@id` is the external URL rather than a `${SITE.url}/#…` fragment — unlike
 * the person and the website, this is not our entity to name, and using its own
 * canonical URL lets anyone else describing it merge with this node.
 *
 * Authorship confirmed 2026-08-05. Note that the RF100 page linked here renders
 * only the benchmark's own name — the "Yudha Bhakti Nugraha and Kris" credit sits
 * on the source listing in the `7-class` workspace. So the third-party
 * corroboration this node leans on is one hop away from the URL it points at,
 * which is worth knowing if the claim is ever questioned.
 */
export const CREATED_WORKS = [
  {
    '@type': 'Dataset',
    '@id': 'https://universe.roboflow.com/roboflow-100/vehicles-q0x2v',
    url: 'https://universe.roboflow.com/roboflow-100/vehicles-q0x2v',
    name: 'vehicles (RF100)',
    description:
      'Object detection dataset of vehicle classes, included in RF100 (Roboflow 100) — an Intel-sponsored benchmark for measuring object detection model generalisability across domains.',
    creator: { '@id': PERSON_ID },
    datePublished: '2023-05',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isPartOf: {
      '@type': 'DataCatalog',
      name: 'RF100 (Roboflow 100)',
      url: 'https://universe.roboflow.com/roboflow-100',
    },
    keywords: ['object detection', 'computer vision', 'vehicles', 'benchmark'],
  },
] as const;
