/**
 * chroma-flow — OKLCH color space
 * Conversions between sRGB and the OKLCH perceptual color space.
 *
 * Based on Björn Ottosson's "A perceptual color space for image processing"
 * (2020). OKLCH is a cylindrical form of OKLab where:
 *   L = perceived lightness (0–1)
 *   C = chroma (colorfulness)
 *   H = hue angle (0–360°)
 *
 * @license MIT
 */

import type { OKLab, OKLCH, RGB } from "./types";
import { decodeSRGB, encodeSRGB, rgbToHex } from "./srgb";

/** Convert linear RGB (0–1) to OKLab. */
export function linearRGBToOKLab(
  r: number,
  g: number,
  b: number
): OKLab {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/** Convert OKLab to linear RGB (0–1). */
export function okLabToLinearRGB({ l, a, b }: OKLab): [number, number, number] {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const li = l_ * l_ * l_;
  const mi = m_ * m_ * m_;
  const si = s_ * s_ * s_;

  return [
    4.0767416621 * li - 3.3077115913 * mi + 0.2309699292 * si,
    -1.2684380046 * li + 2.6097574011 * mi - 0.3413193965 * si,
    -0.0041960863 * li - 0.7034186147 * mi + 1.707614701 * si,
  ];
}

/** Convert OKLab to OKLCH. */
export function okLabToOKLCH({ l, a, b }: OKLab): OKLCH {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l, c, h };
}

/** Convert OKLCH to OKLab. */
export function okLCHToOKLab({ l, c, h }: OKLCH): OKLab {
  const rad = (h * Math.PI) / 180;
  return { l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

/** Convert an 8-bit RGB triple to OKLCH. */
export function rgbToOKLCH({ r, g, b }: RGB): OKLCH {
  const lab = linearRGBToOKLab(
    decodeSRGB(r / 255),
    decodeSRGB(g / 255),
    decodeSRGB(b / 255)
  );
  return okLabToOKLCH(lab);
}

/** Convert a hex string to OKLCH. */
export function hexToOKLCH(hex: string): OKLCH {
  // Inline parse to avoid an import cycle with srgb.hexToRGB while keeping
  // the public API ergonomic.
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(h.slice(0, 6), 16);
  return rgbToOKLCH({
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  });
}

/**
 * Convert an OKLCH color to an 8-bit RGB hex string.
 * Out-of-gamut values are clamped to the sRGB gamut.
 */
export function okLCHToHex(l: number, c: number, h: number): string {
  const [lr, lg, lb] = okLabToLinearRGB(okLCHToOKLab({ l, c, h }));
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  return rgbToHex({
    r: Math.round(encodeSRGB(clamp01(lr)) * 255),
    g: Math.round(encodeSRGB(clamp01(lg)) * 255),
    b: Math.round(encodeSRGB(clamp01(lb)) * 255),
  });
}

/** Normalize a hue into the [0, 360) range. */
export function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}
