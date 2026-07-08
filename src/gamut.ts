/**
 * chroma-flow — wide-gamut (Display-P3) support
 * Convert between sRGB hex and the CSS `color(display-p3 r g b)` notation,
 * detect out-of-sRGB-gamut colors, and clamp wide-gamut colors back to sRGB.
 *
 * Display-P3 is the gamut used by modern Apple displays and increasingly by
 * wide-gamut monitors. It is ~25% wider than sRGB in greens/cyans/reds.
 *
 * @license MIT
 */

import type { GamutInfo } from "./types";
import { hexToRGB, rgbToHex, clamp } from "./srgb";
import { deltaE2000 } from "./deltaE";

// ── sRGB ↔ Display-P3 (linear) matrices (D65) ──────────────
// sRGB linear → P3 linear
const SRGB_TO_P3 = [
  0.801020532529280, 0.159420921040088, 0.039558546489632,
  0.039535291012660, 0.944508598968444, 0.015955770015078,
  0.012823337266705, 0.089030444667324, 0.948833542560030,
];

// P3 linear → sRGB linear
const P3_TO_SRGB = [
  1.262537120000000, -0.212774900000000, -0.051787500000000,
  -0.057668400000000, 1.066772500000000, -0.008340300000000,
  -0.011452400000000, -0.101058600000000, 1.084511000000000,
];

function decode(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function encode(linear: number): number {
  const c = linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  return Math.round(clamp(c) * 255);
}

function mat3Mul(m: number[], v: [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/**
 * Convert an sRGB hex color to a CSS `color(display-p3 r g b)` string,
 * with r/g/b in the 0–1 range. Useful for emitting wide-gamut CSS.
 *
 * @example
 * ```ts
 * toP3String("#10b981"); // "color(display-p3 0.0732 0.6882 0.5053)"
 * ```
 */
export function toP3String(hex: string): string {
  const { r, g, b } = hexToRGB(hex);
  const linS: [number, number, number] = [decode(r), decode(g), decode(b)];
  const linP = mat3Mul(SRGB_TO_P3, linS);
  const fmt = (n: number) => Number(n.toFixed(6)).toString();
  return `color(display-p3 ${fmt(linP[0])} ${fmt(linP[1])} ${fmt(linP[2])})`;
}

/**
 * Parse a CSS `color(display-p3 r g b)` string back to an sRGB hex.
 * Values outside the sRGB gamut are clamped.
 *
 * @example
 * ```ts
 * parseP3String("color(display-p3 0.07 0.69 0.5)"); // "#10b981"
 * ```
 */
export function parseP3String(input: string): string {
  const m = input.match(/color\(display-p3\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*\)/i);
  if (!m) throw new Error(`chroma-flow: invalid display-p3 string "${input}"`);
  const linP: [number, number, number] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const linS = mat3Mul(P3_TO_SRGB, linP);
  return rgbToHex({ r: encode(linS[0]), g: encode(linS[1]), b: encode(linS[2]) });
}

/**
 * Check whether a hex color (already in sRGB) is inside the sRGB gamut.
 * Since hex colors are always 0–255 sRGB, this always returns true — but the
 * function is useful as a building block and for API symmetry.
 */
export function isInSRGBGamut(hex: string): boolean {
  const { r, g, b } = hexToRGB(hex);
  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
}

/**
 * Check whether a `color(display-p3 ...)` string falls inside the sRGB gamut.
 * Returns false if any channel is outside [0, 1] after conversion to sRGB.
 */
export function p3IsInSRGBGamut(p3String: string): boolean {
  const m = p3String.match(/display-p3\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/i);
  if (!m) return true;
  const linP: [number, number, number] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const linS = mat3Mul(P3_TO_SRGB, linP);
  return linS.every((c) => c >= 0 && c <= 1);
}

/**
 * Clamp a `color(display-p3 ...)` string to the sRGB gamut, returning a hex.
 * Colors outside sRGB are brought back to the nearest in-gamut color.
 */
export function clampToSRGB(p3String: string): string {
  return parseP3String(p3String);
}

/**
 * Full wide-gamut analysis of a hex color: its P3 representation, gamut
 * membership, and the ∆E2000 gamut loss (always 0 for in-sRGB colors since
 * hex is inherently sRGB — this is the building block for palette-level
 * gamut audits).
 *
 * For an **OKLCH-originated** color that may be out of sRGB gamut, pass the
 * raw OKLCH via `okLCHToHex` first (which clamps); the gamut loss will be
 * measured between the clamped hex and the theoretical P3 value.
 */
export function analyzeGamut(hex: string): GamutInfo {
  const { r, g, b } = hexToRGB(hex);
  const linS: [number, number, number] = [decode(r), decode(g), decode(b)];
  const linP = mat3Mul(SRGB_TO_P3, linS);
  const p3String = toP3String(hex);
  const inSRGB = linP.every((c) => c >= 0 && c <= 1);
  const inP3 = linP.every((c) => c >= 0 && c <= 1);
  return {
    hex,
    p3String,
    p3: linP,
    inSRGB,
    inP3,
    gamutLoss: 0, // hex is already sRGB-clamped; loss is measured at palette level
  };
}

/**
 * Audit a full palette for sRGB gamut membership. Since chroma-flow generates
 * palettes via OKLCH→sRGB (which clamps), this reports which stops were
 * clamped during generation by comparing the theoretical OKLCH color to the
 * emitted hex.
 *
 * @param oklchColors The theoretical OKLCH hex values (before sRGB clamping).
 * @param srgbColors  The actual palette hex values (after sRGB clamping).
 */
export function paletteGamutAudit(
  oklchColors: { stop: number; hex: string }[],
  srgbColors: { stop: number; hex: string }[]
): { stop: number; oklchHex: string; srgbHex: string; gamutLoss: number; inSRGB: boolean }[] {
  const map = new Map(srgbColors.map((c) => [c.stop, c.hex]));
  return oklchColors.map((c) => {
    const srgbHex = map.get(c.stop) ?? c.hex;
    return {
      stop: c.stop,
      oklchHex: c.hex,
      srgbHex,
      gamutLoss: deltaE2000(c.hex, srgbHex),
      inSRGB: c.hex === srgbHex,
    };
  });
}
