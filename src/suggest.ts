/**
 * chroma-flow — text color suggestion
 * Picks the most accessible foreground (black or white) for a background,
 * and recommends a palette stop that meets a target WCAG level.
 *
 * @license MIT
 */

import type { Palette, PaletteStop, WCAGLevel } from "./types";
import { checkContrast } from "./wcag";

/**
 * Choose black or white text for the given background, whichever has the
 * higher contrast ratio. Returns the hex of the chosen text color.
 */
export function suggestTextColor(background: string): string {
  const black = checkContrast("#000000", background);
  const white = checkContrast("#ffffff", background);
  return white.ratio >= black.ratio ? "#ffffff" : "#000000";
}

/**
 * Find the palette stop whose contrast against `text` meets the requested
 * WCAG level with the highest ratio. Returns null if none qualify.
 */
export function bestStopForContrast(
  palette: Palette,
  text: string,
  level: WCAGLevel = "AA"
): { stop: PaletteStop; ratio: number } | null {
  const stops = Object.keys(palette)
    .map((s) => Number(s) as PaletteStop)
    .sort((a, b) => a - b);

  let best: { stop: PaletteStop; ratio: number } | null = null;
  for (const stop of stops) {
    const result = checkContrast(text, palette[stop]);
    const passes =
      level === "AA" ? result.passesAANormal : result.passesAAANormal;
    if (passes && (!best || result.ratio > best.ratio)) {
      best = { stop, ratio: result.ratio };
    }
  }
  return best;
}

/**
 * Verify a complete palette for accessible text usage.
 * For each stop, reports whether black and white text pass WCAG AA.
 */
export function auditPalette(palette: Palette) {
  return (Object.keys(palette) as unknown as PaletteStop[]).map((stop) => {
    const bg = palette[stop];
    const black = checkContrast("#000000", bg);
    const white = checkContrast("#ffffff", bg);
    return {
      stop,
      background: bg,
      bestText: white.ratio >= black.ratio ? "#ffffff" : "#000000",
      blackRatio: black.ratio,
      whiteRatio: white.ratio,
      passesAABlack: black.passesAANormal,
      passesAAWhite: white.passesAANormal,
    };
  });
}
