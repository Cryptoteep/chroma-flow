/**
 * chroma-flow — accessible pair finder
 * Helpers for discovering WCAG-conformant foreground/background pairs from a
 * palette, and for auditing a full palette's text accessibility at a glance.
 *
 * @license MIT
 */

import type {
  AccessiblePair,
  Palette,
  PaletteAccessibilityRow,
  PaletteStop,
  WCAGLevel,
} from "./types";
import { getStops } from "./generator";
import { checkContrast } from "./wcag";
import { apcaContrast } from "./apca";
import { suggestTextColor } from "./suggest";

const STOPS = getStops();

/**
 * Find the best accessible foreground/background pair from a palette that
 * meets the requested WCAG level.
 *
 * Searches all stop-vs-stop combinations plus black/white text against each
 * stop, and returns the pair with the highest contrast ratio that still
 * passes the level. Returns `null` if no pair qualifies.
 *
 * @example
 * ```ts
 * const pair = findAccessiblePair(palette, "AAA");
 * if (pair) console.log(pair.foreground, "on", pair.background, pair.ratio);
 * ```
 */
export function findAccessiblePair(
  palette: Palette,
  level: WCAGLevel = "AA",
  options: { includeBlackWhite?: boolean } = {}
): AccessiblePair | null {
  const { includeBlackWhite = true } = options;
  const threshold = level === "AA" ? 4.5 : 7;
  let best: AccessiblePair | null = null;

  const candidates: { fg: string; bg: string }[] = [];

  // Stop-vs-stop combinations (skip identical stops).
  for (const a of STOPS) {
    for (const b of STOPS) {
      if (a === b) continue;
      candidates.push({ fg: palette[a], bg: palette[b] });
    }
  }

  // Black/white text against each stop.
  if (includeBlackWhite) {
    for (const s of STOPS) {
      candidates.push({ fg: "#000000", bg: palette[s] });
      candidates.push({ fg: "#ffffff", bg: palette[s] });
    }
  }

  for (const { fg, bg } of candidates) {
    const result = checkContrast(fg, bg);
    if (result.ratio >= threshold) {
      if (!best || result.ratio > best.ratio) {
        best = {
          foreground: fg,
          background: bg,
          ratio: result.ratio,
          apcaLc: apcaContrast(fg, bg),
          passesAA: result.passesAANormal,
          passesAAA: result.passesAAANormal,
        };
      }
    }
  }

  return best;
}

/**
 * Suggest the most accessible text color from the palette for a given
 * background stop, preferring palette colors over black/white when they
 * meet the requested level with a higher ratio.
 *
 * Returns the hex of the suggested text color, or black/white fallback.
 */
export function suggestAccessibleText(
  palette: Palette,
  backgroundStop: PaletteStop,
  level: WCAGLevel = "AA"
): string {
  const threshold = level === "AA" ? 4.5 : 7;
  const bg = palette[backgroundStop];
  let best: { hex: string; ratio: number } | null = null;

  for (const s of STOPS) {
    if (s === backgroundStop) continue;
    const fg = palette[s];
    const result = checkContrast(fg, bg);
    if (result.ratio >= threshold && (!best || result.ratio > best.ratio)) {
      best = { hex: fg, ratio: result.ratio };
    }
  }

  // Fallback to black/white.
  const bw = suggestTextColor(bg);
  const bwResult = checkContrast(bw, bg);
  if (bwResult.ratio >= threshold) {
    if (!best || bwResult.ratio > best.ratio) {
      best = { hex: bw, ratio: bwResult.ratio };
    }
  }

  return best ? best.hex : bw;
}

/**
 * Build a full accessibility matrix for a palette: for each stop, report the
 * black/white text ratios, the recommended text color, and a WCAG band.
 *
 * Useful for a quick "is every stop usable as a background?" audit.
 */
export function paletteAccessibilityMatrix(palette: Palette): PaletteAccessibilityRow[] {
  return STOPS.map((stop) => {
    const bg = palette[stop];
    const black = checkContrast("#000000", bg);
    const white = checkContrast("#ffffff", bg);
    const recommendedText = white.ratio >= black.ratio ? "#ffffff" : "#000000";
    const recommendedRatio = Math.max(black.ratio, white.ratio);
    let band: PaletteAccessibilityRow["band"];
    if (recommendedRatio >= 7) band = "AAA";
    else if (recommendedRatio >= 4.5) band = "AA";
    else if (recommendedRatio >= 3) band = "AA Large";
    else band = "Fail";
    return {
      stop,
      background: bg,
      blackRatio: black.ratio,
      whiteRatio: white.ratio,
      recommendedText,
      recommendedRatio,
      band,
    };
  });
}

/**
 * List all stops that pass the requested WCAG level as a background (with
 * either black or white text). Returns the stop numbers in ascending order.
 */
export function accessibleStops(
  palette: Palette,
  level: WCAGLevel = "AA"
): PaletteStop[] {
  const matrix = paletteAccessibilityMatrix(palette);
  const threshold = level === "AA" ? 4.5 : 7;
  return matrix
    .filter((row) => row.recommendedRatio >= threshold)
    .map((row) => row.stop);
}
