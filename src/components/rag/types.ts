/**
 * Scene primitives for the pipeline walkthrough.
 *
 * A scene is a pure function of the stage box: it returns a flat list of shapes,
 * each with the moment it appears (`at`, `dur` in ms). Nothing here touches the
 * DOM, so a scene can be rendered by React, diffed, or drawn to a canvas.
 *
 * Colours are site tokens rather than hex, which is what makes the diagram follow
 * the site's light/dark theme without a second set of values.
 */
export type Hue = 'blue' | 'teal' | 'amber' | 'green' | 'violet' | 'red';

export type Fill =
  | Hue
  | `${Hue}-soft`
  | `${Hue}-line`
  | 'ink'
  | 'muted'
  | 'faint'
  | 'rule'
  | 'accent'
  | 'accent-soft'
  | 'accent-line'
  | 'ink-soft'
  | 'panel'
  | 'paper';

export type Anim = 'fade' | 'pop' | 'rise' | 'draw' | 'growx' | 'growy' | 'none';

/** Bounded random, so scenes look scattered but render identically every time. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Clamp helper for layout maths. */
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface Timed {
  /** ms after the step starts */
  at?: number;
  /** ms */
  dur?: number;
  anim?: Anim;
}

export interface BoxEl extends Timed {
  t: 'box';
  x: number; y: number; w: number; h: number;
  r?: number;
  fill?: Fill;
  stroke?: Fill;
  sw?: number;
  dash?: boolean;
  /** staggered children: each rect appears `stagger` ms after the previous */
  repeat?: number;
  gap?: number;
}

export interface TextEl extends Timed {
  t: 'text';
  x: number; y: number; s: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  mono?: boolean;
  strong?: boolean;
  fill?: Fill;
}

export interface LineEl extends Timed {
  t: 'line';
  x1: number; y1: number; x2: number; y2: number;
  stroke?: Fill;
  sw?: number;
  dash?: boolean;
  arrow?: boolean;
}

export interface PathEl extends Timed {
  t: 'path';
  d: string;
  stroke?: Fill;
  sw?: number;
  dash?: boolean;
  arrow?: boolean;
}

export interface CircleEl extends Timed {
  t: 'circle';
  cx: number; cy: number; r: number;
  fill?: Fill;
  stroke?: Fill;
  sw?: number;
}

export interface BarsEl extends Timed {
  t: 'bars';
  x: number; y: number; w: number; h: number; n: number;
  fill?: Fill;
  stagger?: number;
}

export interface CountEl extends Timed {
  t: 'count';
  x: number; y: number;
  from: number; to: number;
  size?: number;
  fill?: Fill;
  anchor?: 'start' | 'middle' | 'end';
  /** small label rendered under the number */
  label?: string;
}

export type El = BoxEl | TextEl | LineEl | PathEl | CircleEl | BarsEl | CountEl;

export interface Stage {
  /** drawing space in CSS pixels, measured from the real stage box */
  W: number;
  H: number;
  pad: number;
  /** true when the stage is narrow or portrait: scenes stack instead of forming rows */
  tall: boolean;
  /** reduce motion: scenes are rendered in their finished state */
  still: boolean;
}

export interface Phase {
  label: string;
  cap: string;
  /** ms into the step */
  at: number;
}

export interface Scene {
  id: string;
  title: string;
  sum: string;
  /** length of the step in ms */
  dur: number;
  phases: Phase[];
  els(st: Stage): El[];
}

/* ---------------------------------------------------------------- helpers */

export function fit(s: string, w: number, size: number): string {
  const max = Math.max(3, Math.floor(w / (size * 0.55)));
  return s.length > max ? `${s.slice(0, max - 1)}\u2026` : s;
}

/** Vertical stack of `n` boxes inside a box of `h`, `gap` between them. */
export function stack(top: number, h: number, n: number, gap: number) {
  const row = (h - (n - 1) * gap) / n;
  return { row, y: (i: number) => top + i * (row + gap) };
}

/** `n` columns inside a box of `w`, `gap` between them. */
export function cols(left: number, w: number, n: number, gap: number) {
  const col = (w - (n - 1) * gap) / n;
  return { col, x: (i: number) => left + i * (col + gap) };
}

/**
 * Breaks text into lines that fit `w`, using the same rough advance width the
 * `fit` helper assumes. Cheap, but it keeps a sentence inside the stage at any
 * width, which is the difference between a sentence and a cropped one.
 */
export function wrap(text: string, w: number, size: number): string[] {
  const max = Math.max(8, Math.floor(w / (size * 0.55)));
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (test.length > max && cur) {
      lines.push(cur);
      cur = word;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function elapsed(phases: Phase[], ms: number): number {
  let i = 0;
  for (let k = 0; k < phases.length; k++) if (ms >= phases[k].at) i = k;
  return i;
}
