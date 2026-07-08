/**
 * chroma-flow — WCAG 2.2 non-text contrast
 * Checks contrast for UI components and graphical objects, which require a
 * 3:1 ratio against adjacent colors per WCAG 2.2 Success Criterion 1.4.11
 * (Non-text Contrast).
 *
 * Applies to: input boundaries, icons, focus indicators, chart segments,
 * and other non-text content that conveys information.
 *
 * @license MIT
 */

import type { NonTextContrastResult } from "./types";
import { contrastRatio } from "./wcag";

/** The WCAG 2.2 non-text contrast threshold (3:1). */
export const NON_TEXT_THRESHOLD = 3;

/**
 * Check whether a foreground (UI component / graphic) meets the WCAG 2.2
 * non-text 3:1 threshold against an adjacent background.
 *
 * @example
 * ```ts
 * // Does a button border meet non-text contrast on the page background?
 * const r = checkNonTextContrast("#6366f1", "#ffffff", "border");
 * console.log(r.passes, r.ratio.toFixed(2));
 * ```
 */
export function checkNonTextContrast(
  foreground: string,
  background: string,
  kind: NonTextContrastResult["kind"] = "general"
): NonTextContrastResult {
  const ratio = contrastRatio(foreground, background);
  const passes = ratio >= NON_TEXT_THRESHOLD;
  return {
    foreground,
    background,
    ratio,
    passes,
    band: passes ? "Pass" : "Fail",
    kind,
  };
}

/** Boolean check for the WCAG 2.2 non-text 3:1 threshold. */
export function passesNonText(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= NON_TEXT_THRESHOLD;
}

/**
 * Check a UI component's contrast: the component color against its background,
 * plus (optionally) the component's boundary/border against both the component
 * fill and the page background. Returns all relevant checks.
 *
 * This is a convenience for auditing a button/input/card in one call.
 *
 * @example
 * ```ts
 * uiComponentContrast({
 *   fill: "#6366f1",       // button background
 *   border: "#3f37bb",     // button border
 *   pageBackground: "#ffffff",
 * });
 * ```
 */
export function uiComponentContrast(options: {
  fill: string;
  border?: string;
  pageBackground: string;
}): NonTextContrastResult[] {
  const { fill, border, pageBackground } = options;
  const results: NonTextContrastResult[] = [
    checkNonTextContrast(fill, pageBackground, "graphic"),
  ];
  if (border) {
    // A border must contrast against both the page background (outside) and
    // the fill (inside) to be visible from both sides.
    results.push(checkNonTextContrast(border, pageBackground, "border"));
    results.push(checkNonTextContrast(border, fill, "border"));
  }
  return results;
}

/**
 * Check a focus indicator's contrast. A focus indicator must meet 3:1 against
 * the adjacent colors per WCAG 2.2 SC 1.4.13 (Focus Appearance, candidate) and
 * SC 1.4.11 (Non-text Contrast).
 *
 * @example
 * ```ts
 * focusIndicatorContrast({
 *   indicator: "#0c033d",   // focus ring color
 *   background: "#ffffff",  // page background behind the ring
 * });
 * ```
 */
export function focusIndicatorContrast(options: {
  indicator: string;
  background: string;
}): NonTextContrastResult {
  return checkNonTextContrast(options.indicator, options.background, "focus-indicator");
}

/**
 * Audit a full palette for non-text contrast against a given background.
 * Returns one row per stop, indicating whether that stop meets the 3:1
 * non-text threshold when used as a UI component color on the background.
 *
 * Useful for "which stops can I safely use for icons/borders on white?".
 */
export function paletteNonTextMatrix(
  palette: { [stop: number]: string },
  background: string
): { stop: number; color: string; ratio: number; passes: boolean }[] {
  return Object.entries(palette)
    .map(([stopStr, color]) => {
      const stop = Number(stopStr);
      const ratio = contrastRatio(color, background);
      return { stop, color, ratio, passes: ratio >= NON_TEXT_THRESHOLD };
    })
    .sort((a, b) => a.stop - b.stop);
}
