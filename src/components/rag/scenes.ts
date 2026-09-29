import type { Scene } from './types';
import { SCENES_A } from './scenes-a';
import { SCENES_B } from './scenes-b';
import { SCENES_C } from './scenes-c';

/**
 * The walkthrough, in order. Each scene owns its copy as well as its shapes, so a
 * step is one file to edit rather than a diff across three.
 */
export const SCENES: Scene[] = [...SCENES_A, ...SCENES_B, ...SCENES_C];
export const TOTAL_STEPS = SCENES.length;
