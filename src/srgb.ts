/**
 * chroma-flow — sRGB utilities
 * Conversions between hex strings, 8-bit RGB, and linear RGB.
 *
 * All math is dependency-free and uses the standard sRGB transfer function.
 *
 * @license MIT
 */

import type { RGB } from "./types";

/** Clamp a number into the [min, max] range. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/** Decode an sRGB channel (0–1) to a linear-light value. */
export function decodeSRGB(channel: number): number {
  if (channel <= 0.04045) return channel / 12.92;
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** Encode a linear-light value to an sRGB channel (0–1). */
export function encodeSRGB(linear: number): number {
  if (linear <= 0.0031308) return linear * 12.92;
  return 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
}

/** Convert an 8-bit RGB triple to normalized 0–1 linear RGB. */
export function rgbToLinear({ r, g, b }: RGB): [number, number, number] {
  return [decodeSRGB(r / 255), decodeSRGB(g / 255), decodeSRGB(b / 255)];
}

/** Convert a linear RGB triple (0–1) to 8-bit RGB. */
export function linearToRGB(
  lr: number,
  lg: number,
  lb: number
): RGB {
  return {
    r: Math.round(clamp(encodeSRGB(lr)) * 255),
    g: Math.round(clamp(encodeSRGB(lg)) * 255),
    b: Math.round(clamp(encodeSRGB(lb)) * 255),
  };
}

/** Parse a hex string (#RGB, #RRGGBB, #RRGGBBAA, with or without #) into RGB. */
export function hexToRGB(hex: string): RGB {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 && h.length !== 8) {
    throw new Error(`chroma-flow: invalid hex color "${hex}"`);
  }
  const num = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(num)) {
    throw new Error(`chroma-flow: invalid hex color "${hex}"`);
  }
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

/** Convert an RGB triple to a 6-digit hex string (e.g. "#1a2b3c"). */
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) =>
    Math.round(clamp(n, 0, 255))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Convert a hex string directly to a 6-digit normalized hex. */
export function normalizeHex(hex: string): string {
  return rgbToHex(hexToRGB(hex));
}

/** Relative luminance per WCAG 2.1, using linear sRGB channels. */
export function relativeLuminance({ r, g, b }: RGB): number {
  const [lr, lg, lb] = rgbToLinear({ r, g, b });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}
