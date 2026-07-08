/**
 * chroma-flow — WCAG 2.1 contrast utilities
 * Computes contrast ratios and conformance levels for accessibility.
 *
 * @license MIT
 */

import type { ContrastResult, WCAGLevel } from "./types";
import { hexToRGB, relativeLuminance } from "./srgb";

/**
 * Compute the WCAG 2.1 contrast ratio between two hex colors.
 * Returns a value in the range 1–21.
 */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(hexToRGB(foreground));
  const l2 = relativeLuminance(hexToRGB(background));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Run a full WCAG 2.1 conformance check between two colors.
 * Normal text thresholds: AA ≥ 4.5, AAA ≥ 7.
 * Large text thresholds (≥ 18pt or 14pt bold): AA ≥ 3, AAA ≥ 4.5.
 */
export function checkContrast(
  foreground: string,
  background: string
): ContrastResult {
  const ratio = contrastRatio(foreground, background);
  return {
    foreground,
    background,
    ratio,
    passesAALarge: ratio >= 3,
    passesAANormal: ratio >= 4.5,
    passesAAALarge: ratio >= 4.5,
    passesAAANormal: ratio >= 7,
  };
}

/** Return true when the pair satisfies the requested level for normal text. */
export function passes(
  foreground: string,
  background: string,
  level: WCAGLevel
): boolean {
  const ratio = contrastRatio(foreground, background);
  return level === "AA" ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Format a contrast ratio for display, e.g. 4.53 → "4.53:1".
 */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
