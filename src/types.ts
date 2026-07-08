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
  | "android-xml"
  | "swift"
  | "compose";

/** A single color sample rendered in a given CVD simulation. */
export interface CVDPreview {
  type: CVDType;
  /** The simulated color as a hex string. */
  hex: string;
  /** Original color as a hex string. */
  original: string;
}

/** Result of an APCA (WCAG 3 candidate) perceptual contrast check. */
export interface APHAResult {
  /** Foreground color (hex). */
  foreground: string;
  /** Background color (hex). */
  background: string;
  /**
   * The APCA Lc value. Positive = dark text on a light background,
   * negative = light text on a dark background. Magnitude ~0–106.
   */
  Lc: number;
  /** Absolute perceptual contrast (always non-negative). */
  magnitude: number;
  /**
   * Recommended minimum font size (pt) for this contrast level,
   * based on APCA lookup tables (approximate).
   */
  recommendedMinSize: number;
  /** Whether the contrast is suitable for body text (Lc ≥ 75). */
  passesBodyText: boolean;
  /** Whether the contrast is suitable for large text (Lc ≥ 60). */
  passesLargeText: boolean;
  /** Whether the contrast is suitable for non-text (Lc ≥ 45). */
  passesNonText: boolean;
}

/**
 * A semantic color theme — coordinated roles for a complete UI.
 * Both `light` and `dark` variants share the same seed but are
 * recomposed for comfort and contrast.
 */
export interface SemanticTheme {
  /** Page background. */
  background: string;
  /** Elevated surface (cards, modals). */
  surface: string;
  /** Muted surface (subtle backgrounds, code blocks). */
  surfaceMuted: string;
  /** Default border color. */
  border: string;
  /** Primary text color. */
  text: string;
  /** Secondary/muted text. */
  textMuted: string;
  /** Tertiary text (placeholders, hints). */
  textSubtle: string;
  /** Brand/primary action color. */
  primary: string;
  /** Foreground color readable on `primary`. */
  primaryForeground: string;
  /** Accent / secondary action. */
  accent: string;
  /** Foreground on `accent`. */
  accentForeground: string;
  /** Success state. */
  success: string;
  /** Warning state. */
  warning: string;
  /** Destructive state. */
  danger: string;
}

/** A coordinated light + dark theme pair derived from one seed. */
export interface ThemePair {
  /** The seed color the pair was generated from. */
  seed: string;
  /** Light variant (light background, dark text). */
  light: SemanticTheme;
  /** Dark variant (dark background, light text). */
  dark: SemanticTheme;
  /** Per-role contrast audit for the light theme. */
  lightAudit: ThemeAudit[];
  /** Per-role contrast audit for the dark theme. */
  darkAudit: ThemeAudit[];
}

/** Contrast audit entry for a semantic theme role. */
export interface ThemeAudit {
  role: string;
  background: string;
  text: string;
  wcagRatio: number;
  apcaLc: number;
  passesAA: boolean;
}
