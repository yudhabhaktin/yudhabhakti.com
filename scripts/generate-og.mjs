/**
 * Generates public/og.png — the 1200x630 social preview card.
 *
 *   node scripts/generate-og.mjs
 *
 * Rasterised with sharp (already present as an Astro dependency) so the build
 * needs no extra tooling and the page stays free of external requests.
 * Edit the constants below and re-run to change the card.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/og.png');

const NAME = 'Yudha Bhakti';
const DOMAIN = 'yudhabhakti.com';
const LINES = [
  'I build systems that reach into',
  'the physical world.',
];
const FOOTER = 'Embedded &#183; Edge &#183; Cloud &#183; Applied AI';
const LOCATION = 'Jakarta, Indonesia';

// Matches the site palette in src/styles/global.css (light theme).
const PAPER = '#fdfcfa';
const INK = '#2b2724';
const MUTED = '#6b635c';
const FAINT = '#9c938b';
const ACCENT = '#a34a12';
const RULE = '#e6e1da';

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>

  <!-- accent hairline down the left edge -->
  <rect x="0" y="0" width="6" height="630" fill="${ACCENT}"/>

  <!-- eyebrow: dot + domain -->
  <circle cx="98" cy="103" r="7" fill="${ACCENT}"/>
  <text x="120" y="112" font-family="${MONO}" font-size="26" fill="${MUTED}"
        letter-spacing="0.5">${DOMAIN}</text>

  <!-- name -->
  <text x="92" y="248" font-family="${SANS}" font-size="86" font-weight="700"
        fill="${INK}" letter-spacing="-2.5">${NAME}</text>

  <!-- statement -->
  <text x="92" y="342" font-family="${SANS}" font-size="42" fill="${MUTED}"
        letter-spacing="-0.6">${LINES[0]}</text>
  <text x="92" y="400" font-family="${SANS}" font-size="42" fill="${MUTED}"
        letter-spacing="-0.6">${LINES[1]}</text>

  <!-- rule -->
  <rect x="92" y="492" width="1016" height="1" fill="${RULE}"/>

  <!-- footer row -->
  <text x="92" y="546" font-family="${MONO}" font-size="24" fill="${FAINT}">${FOOTER}</text>
  <text x="1108" y="546" font-family="${MONO}" font-size="24" fill="${FAINT}"
        text-anchor="end">${LOCATION}</text>
</svg>`;

// Rasterise at 2x then downsample, so text edges are supersampled rather than
// rendered straight to the target size.
await mkdir(dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg), { density: 144 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT);

const { size } = await (await import('node:fs/promises')).stat(OUT);
console.log(`wrote ${OUT} (${(size / 1024).toFixed(1)} KB)`);
