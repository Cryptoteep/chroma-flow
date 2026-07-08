/**
 * chroma-flow — color manipulation primitives
 * Lightweight OKLCH-based operations on individual colors: mixing, lightening,
 * darkening, saturation control, hue rotation, complement, and random seeds.
 *
 * All operations work in the perceptually-uniform OKLCH space so the results
 * feel predictable to the human eye.
 *
 * @license MIT
 */

import type { RandomSeedOptions } from "./types";
import { hexToOKLCH, normalizeHue, okLCHToHex } from "./oklch";
import { hexToRGB, rgbToHex } from "./srgb";

/**
 * Mix two hex colors by a factor `t` (0 = fully `a`, 1 = fully `b`) in OKLCH.
 * Hue interpolation follows the shortest angular path.
 *
 * @example
 * ```ts
 * mixColors("#6366f1", "#f59e0b", 0.5); // a perceptual midpoint
 * ```
 */
export function mixColors(a: string, b: string, t = 0.5): string {
  const ca = hexToOKLCH(a);
  const cb = hexToOKLCH(b);
  const l = ca.l + (cb.l - ca.l) * t;
  const c = ca.c + (cb.c - ca.c) * t;
  // Shortest-path hue interpolation.
  let dh = cb.h - ca.h;
  if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const h = normalizeHue(ca.h + dh * t);
  return okLCHToHex(l, c, h);
}

/** Increase lightness by `amount` (0–1). */
export function lighten(hex: string, amount = 0.1): string {
  const { l, c, h } = hexToOKLCH(hex);
  return okLCHToHex(Math.min(1, l + amount), c, h);
}

/** Decrease lightness by `amount` (0–1). */
export function darken(hex: string, amount = 0.1): string {
  const { l, c, h } = hexToOKLCH(hex);
  return okLCHToHex(Math.max(0, l - amount), c, h);
}

/** Increase chroma by `amount` (0–0.4). */
export function saturate(hex: string, amount = 0.05): string {
  const { l, c, h } = hexToOKLCH(hex);
  return okLCHToHex(l, Math.min(0.4, c + amount), h);
}

/** Decrease chroma by `amount` (0–0.4). */
export function desaturate(hex: string, amount = 0.05): string {
  const { l, c, h } = hexToOKLCH(hex);
  return okLCHToHex(l, Math.max(0, c - amount), h);
}

/** Rotate the hue by `degrees` (−360..360). */
export function rotateHue(hex: string, degrees: number): string {
  const { l, c, h } = hexToOKLCH(hex);
  return okLCHToHex(l, c, normalizeHue(h + degrees));
}

/** Return the complement (180° hue rotation) of a color. */
export function complement(hex: string): string {
  return rotateHue(hex, 180);
}

/** Invert a color in sRGB space (channel-wise 255 − channel). */
export function invert(hex: string): string {
  const { r, g, b } = hexToRGB(hex);
  return rgbToHex({ r: 255 - r, g: 255 - g, b: 255 - b });
}

/**
 * Generate a random seed hex color in OKLCH, constrained to a pleasant
 * lightness/chroma range so the result is usually usable as a palette seed.
 *
 * @example
 * ```ts
 * randomSeed();                          // any vivid mid-tone
 * randomSeed({ hueRange: [140, 200] });  // a random teal/cyan
 * ```
 */
export function randomSeed(options: RandomSeedOptions = {}): string {
  const {
    minLightness = 0.45,
    maxLightness = 0.7,
    minChroma = 0.12,
    maxChroma = 0.28,
    hueRange = [0, 360],
  } = options;
  const rand = (min: number, max: number) => min + Math.random() * (max - min);
  const l = rand(minLightness, maxLightness);
  const c = rand(minChroma, maxChroma);
  const h = normalizeHue(rand(hueRange[0], hueRange[1]));
  return okLCHToHex(l, c, h);
}
