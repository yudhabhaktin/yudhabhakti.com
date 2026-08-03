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
