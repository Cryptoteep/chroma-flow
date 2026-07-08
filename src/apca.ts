/**
 * chroma-flow — APCA (Accessible Perceptual Contrast Algorithm)
 * The WCAG 3 candidate contrast method, which is more perceptually
 * accurate than the WCAG 2.1 ratio — especially for dark backgrounds.
 *
 * Implements the APCA-W3 formula based on the published Myndex reference
 * (https://www.myndex.com/APCA/). This is an implementation of the public
 * W3 candidate specification, not the proprietary SAPC engine.
 *
 * Key differences from WCAG 2.1:
 *   - Operates on display luminance with a 0.3 power (perceptual) curve.
 *   - Returns a signed Lc value: positive = dark text on light bg,
 *     negative = light text on dark bg. Magnitude ~0–106.
 *   - Better predicts readability for dark themes where WCAG 2.1 overestimates.
 *
 * @license MIT
 */

import type { APHAResult } from "./types";
import { hexToRGB } from "./srgb";

/** Decode an sRGB channel (0–1, gamma-encoded) to linear sRGB. */
function decode(channel: number): number {
  if (channel <= 0.04045) return channel / 12.92;
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** Soft-clamp very dark luminance values to avoid extreme noise. */
function softClamp(y: number): number {
  if (y <= 0) return 0.022;
  if (y >= 0.022) return y;
  // Exponential ease toward 0.022 for values in (0, 0.022).
  return y + (0.022 - y) * (1 - Math.exp(-100 * (0.022 - y)));
}

/** Compute display luminance Y from an 8-bit RGB triple. */
function luminance(r: number, g: number, b: number): number {
  const R = decode(r / 255);
  const G = decode(g / 255);
  const B = decode(b / 255);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Compute the APCA Lc value between a text color and a background color.
 *
 * @param text Foreground (text) hex color.
 * @param background Background hex color.
 * @returns Signed Lc value. Positive = dark text on light bg,
 *          negative = light text on dark bg.
 */
export function apcaContrast(text: string, background: string): number {
  const t = hexToRGB(text);
  const b = hexToRGB(background);

  const yText = softClamp(luminance(t.r, t.g, t.b));
  const yBg = softClamp(luminance(b.r, b.g, b.b));

  // Perceptual lightness (0.3 power per APCA).
  const nShine = 0.3;
  const lText = Math.pow(yText, nShine);
  const lBg = Math.pow(yBg, nShine);

  // SAPC core: background drives perceived lightness of text.
  const sapc = lBg - lText;

  // Scale and clamp near zero to avoid noise.
  const scale = 1.614;
  if (Math.abs(sapc) < 0.0001) return 0;

  let lc = sapc * scale * 100;

  // Offset for very low contrasts to keep the curve monotonic.
  if (Math.abs(lc) < 5) {
    lc = lc - lc * 0.2; // gentle dampening in the noise floor
  }

  // Clamp to the published APCA range.
  if (lc > 106) lc = 106;
  if (lc < -107) lc = -107;

  return lc;
}

/**
 * Full APCA perceptual contrast check with conformance helpers.
 *
 * APCA Lc thresholds (per the W3 candidate):
 *   - Lc ≥ 75  : best for body text (≈ WCAG AAA)
 *   - Lc ≥ 60  : acceptable for large text / headers
 *   - Lc ≥ 45  : minimum for non-text (icons, separators)
 */
export function checkAPCA(text: string, background: string): APHAResult {
  const Lc = apcaContrast(text, background);
  const magnitude = Math.abs(Lc);

  // Approximate recommended minimum body text size from APCA lookup.
  let recommendedMinSize: number;
  if (magnitude >= 90) recommendedMinSize = 12;
  else if (magnitude >= 75) recommendedMinSize = 14;
  else if (magnitude >= 60) recommendedMinSize = 18;
  else if (magnitude >= 45) recommendedMinSize = 24;
  else if (magnitude >= 30) recommendedMinSize = 32;
  else recommendedMinSize = 48;

  return {
    foreground: text,
    background,
    Lc,
    magnitude,
    recommendedMinSize,
    passesBodyText: magnitude >= 75,
    passesLargeText: magnitude >= 60,
    passesNonText: magnitude >= 45,
  };
}

/** Format an APCA Lc value for display, e.g. -78.3 → "Lc -78.3". */
export function formatLc(lc: number): string {
  const sign = lc > 0 ? "+" : lc < 0 ? "" : " ";
  return `Lc ${sign}${lc.toFixed(1)}`;
}

/**
 * Recommend a text color (black or white) for a background using APCA.
 * Returns the color with the higher absolute Lc magnitude.
 */
export function suggestTextColorAPCA(background: string): string {
  const dark = apcaContrast("#000000", background);
  const light = apcaContrast("#ffffff", background);
  return Math.abs(light) >= Math.abs(dark) ? "#ffffff" : "#000000";
}
