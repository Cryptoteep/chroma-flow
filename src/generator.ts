/**
 * chroma-flow — palette generator
 * Produces a full 50–950 color scale from a single seed color.
 *
 * The algorithm:
 *   1. Convert the seed to OKLCH.
 *   2. Build a lightness ramp across the 11 stops.
 *   3. Modulate chroma with a falloff curve so the light/dark extremes
 *      stay natural and in-gamut.
 *   4. Optionally apply a hue shift across the ramp.
 *   5. Convert each stop back to sRGB hex.
 *
 * @license MIT
 */

import type { GenerateOptions, Palette, PaletteStop } from "./types";
import { hexToOKLCH, normalizeHue, okLCHToHex } from "./oklch";

const STOPS: PaletteStop[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * Map a palette stop (50–950) to a target lightness in OKLCH.
 * `perceptual` distribution eases the curve so mid-tones get more room,
 * which feels balanced to the human eye.
 */
function lightnessForStop(
  stop: PaletteStop,
  distribution: "linear" | "perceptual"
): number {
  // t goes 0 (stop 50, lightest) → 1 (stop 950, darkest).
  const t = (STOPS.indexOf(stop) / (STOPS.length - 1));
  const lightest = 0.985;
  const darkest = 0.18;

  if (distribution === "linear") {
    return lightest + (darkest - lightest) * t;
  }

  // Perceptual: ease-in-out so the middle of the ramp is wider.
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  return lightest + (darkest - lightest) * eased;
}

/**
 * Modulate chroma across the ramp. The seed's chroma is kept near the
 * 500 stop and tapers off toward the extremes for a natural look.
 */
function chromaForStop(
  stop: PaletteStop,
  seedChroma: number,
  falloff: number,
  maxChroma: number
): number {
  const t = STOPS.indexOf(stop) / (STOPS.length - 1);
  // Distance from the center of the ramp (0 at 500, 1 at the extremes).
  const distFromCenter = Math.abs(t - 0.5) * 2;
  // Bell curve scaled by falloff.
  const factor = 1 - falloff * Math.pow(distFromCenter, 1.8);
  return Math.min(maxChroma, seedChroma * Math.max(0.12, factor));
}

/**
 * Generate a full color palette from a seed hex color.
 *
 * @example
 * ```ts
 * import { generatePalette } from "chroma-flow";
 * const palette = generatePalette("#6366f1");
 * console.log(palette[500]); // "#5b5cf0"
 * ```
 */
export function generatePalette(
  seed: string,
  options: GenerateOptions = {}
): Palette {
  const {
    distribution = "perceptual",
    chromaFalloff = 0.5,
    hueShift = 0,
    maxChroma = 0.32,
  } = options;

  const seedOKLCH = hexToOKLCH(seed);
  const palette = {} as Palette;

  for (const stop of STOPS) {
    const t = STOPS.indexOf(stop) / (STOPS.length - 1);
    const l = lightnessForStop(stop, distribution);
    const c = chromaForStop(stop, seedOKLCH.c, chromaFalloff, maxChroma);
    // Hue shifts linearly across the ramp. Positive hueShift warms shadows.
    const h = normalizeHue(seedOKLCH.h + hueShift * (t - 0.5));
    palette[stop] = okLCHToHex(l, c, h);
  }

  return palette;
}

/**
 * Generate multiple palettes from a list of seed colors.
 * Useful for building a full design system in one call.
 */
export function generatePalettes(
  seeds: Record<string, string>,
  options?: GenerateOptions
): Record<string, Palette> {
  const result: Record<string, Palette> = {};
  for (const [name, seed] of Object.entries(seeds)) {
    result[name] = generatePalette(seed, options);
  }
  return result;
}

/** Return the ordered list of stops a palette contains. */
export function getStops(): PaletteStop[] {
  return [...STOPS];
}
