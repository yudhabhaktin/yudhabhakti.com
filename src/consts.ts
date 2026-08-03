export const SITE = {
  title: 'Yudha Bhakti',
  tagline: 'Engineer in Jakarta. Embedded systems, cloud platforms, applied AI.',
  description:
    'Yudha Bhakti is an engineer in Jakarta, Indonesia. He builds systems that reach into the physical world — satellites, toll gates, factory floors — and the cloud platforms behind them.',
  url: 'https://yudhabhakti.com',
  author: 'Yudha Bhakti',
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
