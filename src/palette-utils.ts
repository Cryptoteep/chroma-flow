/**
 * chroma-flow — palette utilities
 * Higher-level operations on full palettes: interpolation (insert midpoints
 * between stops), sorting, and reversing.
 *
 * @license MIT
 */

import type { Palette, PaletteStop, SortOrder } from "./types";
import { getStops } from "./generator";
import { hexToOKLCH } from "./oklch";
import { mixColors } from "./manipulate";

const STOPS = getStops();

/**
 * Generate a palette with interpolated midpoints inserted between each
 * standard stop. The result includes the original stops plus the new
 * half-steps, useful for smooth gradients or finer-grained design tokens.
 *
 * The returned object is keyed by the interpolated numeric label as a string
 * (e.g. "50", "75", "100", "150", …) so callers can iterate predictably.
 *
 * @example
 * ```ts
 * const dense = interpolatePalette(palette);
 * // { "50": "#...", "75": "#...", "100": "#...", "125": "#...", ... }
 * ```
 */
export function interpolatePalette(palette: Palette): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < STOPS.length; i++) {
    const stop = STOPS[i];
    out[String(stop)] = palette[stop];
    if (i < STOPS.length - 1) {
      const next = STOPS[i + 1];
      const midLabel = Math.round((stop + next) / 2);
      out[String(midLabel)] = mixColors(palette[stop], palette[next], 0.5);
    }
  }
  return out;
}

/**
 * Sort the palette stops by OKLCH lightness or chroma, ascending or descending.
 * Returns a new object with stops relabeled 50–950 in the new order.
 */
export function sortPalette(palette: Palette, order: SortOrder = "lightness-asc"): Palette {
  const entries = STOPS.map((stop) => {
    const { l, c } = hexToOKLCH(palette[stop]);
    return { stop, l, c };
  });
  entries.sort((a, b) => {
    switch (order) {
      case "lightness-asc":
        return a.l - b.l;
      case "lightness-desc":
        return b.l - a.l;
      case "chroma-asc":
        return a.c - b.c;
      case "chroma-desc":
        return b.c - a.c;
      default:
        return 0;
    }
  });
  const out = {} as Palette;
  const sortedStops: PaletteStop[] = [...STOPS];
  entries.forEach((entry, i) => {
    out[sortedStops[i]] = palette[entry.stop];
  });
  return out;
}

/**
 * Reverse the palette so stop 50 holds what was 950, 100 holds 900, etc.
 * Useful for inverting a ramp while keeping the stop labels.
 */
export function reversePalette(palette: Palette): Palette {
  const reversed = [...STOPS].reverse();
  const out = {} as Palette;
  STOPS.forEach((stop, i) => {
    out[stop] = palette[reversed[i] as PaletteStop];
  });
  return out;
}

/**
 * Build a smooth CSS gradient string from a palette, useful for previews.
 */
export function paletteToGradient(palette: Palette, direction = "to right"): string {
  const stops = STOPS.map((s) => palette[s]).join(", ");
  return `linear-gradient(${direction}, ${stops})`;
}
