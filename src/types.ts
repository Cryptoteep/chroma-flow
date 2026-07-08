/**
 * chroma-flow — types
 * Public type definitions for the chroma-flow accessible color system.
 *
 * @license MIT
 */

/** A color in the sRGB color space, channels in 0–255. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** A color in the OKLCH perceptual color space. */
export interface OKLCH {
  /** Perceived lightness, 0–1 (0 = black, 1 = white). */
  l: number;
  /** Chroma (colorfulness), typically 0–0.4. */
  c: number;
  /** Hue angle in degrees, 0–360. */
  h: number;
}

/** A color in the OKLab perceptual color space. */
export interface OKLab {
  l: number;
  a: number;
  b: number;
}

/** The standard Tailwind-style palette stops. */
export type PaletteStop =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

/** A full generated palette keyed by stop. */
export type Palette = Record<PaletteStop, string>;

/** Options for palette generation. */
export interface GenerateOptions {
  /**
   * Strategy for distributing lightness across stops.
   * - "linear"  — evenly spaced lightness.
   * - "perceptual" — eased distribution that feels balanced to the eye (default).
   */
  distribution?: "linear" | "perceptual";
  /**
   * Chroma falloff at the light/dark extremes. 0–1.
   * Higher = more vivid mid-tones, duller extremes. Default 0.5.
   */
  chromaFalloff?: number;
  /**
   * Optional hue shift (degrees) applied across the ramp, useful for
   * creating warmer shadows / cooler highlights. Default 0.
   */
  hueShift?: number;
  /**
   * Clamp chroma to this maximum to avoid out-of-gamut issues on
   * ultra-wide-gamut seeds. Default 0.32.
   */
  maxChroma?: number;
}

/** WCAG 2.1 conformance level. */
export type WCAGLevel = "AA" | "AAA";

/** Result of a contrast check. */
export interface ContrastResult {
  /** Foreground color (hex). */
  foreground: string;
  /** Background color (hex). */
  background: string;
  /** Contrast ratio (1–21). */
  ratio: number;
  /** Whether it passes WCAG AA for normal text. */
  passesAANormal: boolean;
  /** Whether it passes WCAG AA for large text. */
  passesAALarge: boolean;
  /** Whether it passes WCAG AAA for normal text. */
  passesAAANormal: boolean;
  /** Whether it passes WCAG AAA for large text. */
  passesAAALarge: boolean;
}

/** Supported color vision deficiency types for simulation. */
export type CVDType =
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

/** Supported export formats. */
export type ExportFormat =
  | "css"
  | "tailwind"
  | "json"
  | "scss"
  | "svg"
  | "android-xml";

/** A single color sample rendered in a given CVD simulation. */
export interface CVDPreview {
  type: CVDType;
  /** The simulated color as a hex string. */
  hex: string;
  /** Original color as a hex string. */
  original: string;
}
