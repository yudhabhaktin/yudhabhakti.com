/**
 * Generates public/apple-touch-icon.png — the 180x180 home-screen icon.
 *
 *   node scripts/generate-icons.mjs
 *
 * favicon.svg cannot serve this role: iOS ignores SVG touch icons, and it
 * composites transparent ones onto black, which would invert the mark. So this
 * bakes in the light paper background and the same circle at the same
 * proportions (r = 9/32 of the canvas, per public/favicon.svg).
 *
 * Uses sharp, already present for scripts/generate-og.mjs.
 */
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/apple-touch-icon.png');

const SIZE = 180;
const PAPER = '#fdfbf7'; // --paper-light in src/styles/global.css
const ACCENT = '#a34a12'; // --accent-light, and the favicon fill

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${PAPER}"/>
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${(SIZE * 9) / 32}" fill="${ACCENT}"/>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);
console.log(`wrote ${OUT}`);
