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

/** Supported classic color-harmony schemes. */
export type HarmonyScheme =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split-complementary"
  | "monochromatic";

/** A single color in a harmony set, with its angular offset from the seed. */
export interface HarmonyColor {
  /** Role label, e.g. "base", "complement", "analog-1". */
  role: string;
  /** Hue angle (degrees) of this color. */
  hue: number;
  /** Angular offset (degrees) from the seed hue. */
  offset: number;
  /** Hex color. */
  hex: string;
}

/** Result of generating a color harmony from a seed. */
export interface Harmony {
  /** The seed color the harmony was derived from. */
  seed: string;
  /** The scheme that was generated. */
  scheme: HarmonyScheme;
  /** The colors in the harmony (seed first). */
  colors: HarmonyColor[];
}

/** Result of a Delta-E ∆E2000 color-difference computation. */
export interface DeltaEResult {
  /** First color (hex). */
  a: string;
  /** Second color (hex). */
  b: string;
  /** The ∆E2000 difference (0 = identical, ~100+ = very different). */
  deltaE: number;
  /** Human-readable perceptual difference band. */
  band: "indistinguishable" | "barely noticeable" | "noticeable" | "clearly different" | "very different";
  /** Whether the difference is below the JND (just-noticeable difference, ~2.3). */
  belowJND: boolean;
}

/** Options for generating a random seed color. */
export interface RandomSeedOptions {
  /** Minimum OKLCH lightness (0–1). Default 0.45. */
  minLightness?: number;
  /** Maximum OKLCH lightness (0–1). Default 0.7. */
  maxLightness?: number;
  /** Minimum OKLCH chroma. Default 0.12. */
  minChroma?: number;
  /** Maximum OKLCH chroma. Default 0.28. */
  maxChroma?: number;
  /** Optional hue range [min, max] in degrees. Default full [0, 360). */
  hueRange?: [number, number];
}

/** Sort order for palettes. */
export type SortOrder = "lightness-asc" | "lightness-desc" | "chroma-asc" | "chroma-desc";

/** Result of inferring a seed color from an imported palette. */
export interface InferredSeed {
  /** The hex color from the source palette closest to a generated 500 stop. */
  seed: string;
  /** The palette stop (50–950) the seed was inferred from. */
  fromStop: number;
  /**
   * The ∆E2000 between the inferred seed's generated palette and the source
   * palette, averaged across all matching stops. Lower = better fit.
   */
  averageDeltaE: number;
  /** The full palette regenerated from the inferred seed. */
  palette: Palette;
}

/** Result of importing a palette from a string source (CSS / Tailwind). */
export interface ImportedPalette {
  /** The format the input was parsed as. */
  format: "css" | "tailwind" | "json";
  /** The recognized palette name (e.g. "primary"), or "color" if none found. */
  name: string;
  /** The parsed palette, keyed by stop. Missing stops are omitted. */
  colors: Partial<Palette>;
  /** The stops that were successfully parsed. */
  stops: number[];
}

/** A WCAG-conformant foreground/background pair. */
export interface AccessiblePair {
  /** Foreground hex. */
  foreground: string;
  /** Background hex. */
  background: string;
  /** WCAG 2.1 contrast ratio (1–21). */
  ratio: number;
  /** APCA Lc value (signed). */
  apcaLc: number;
  /** Whether it passes WCAG AA for normal text. */
  passesAA: boolean;
  /** Whether it passes WCAG AAA for normal text. */
  passesAAA: boolean;
}

/** One row in a palette accessibility matrix. */
export interface PaletteAccessibilityRow {
  /** The palette stop this row describes. */
  stop: PaletteStop;
  /** The background hex. */
  background: string;
  /** Best black-text ratio against this background. */
  blackRatio: number;
  /** Best white-text ratio against this background. */
  whiteRatio: number;
  /** The recommended text color ("#000000" or "#ffffff"). */
  recommendedText: string;
  /** The ratio of the recommended pair. */
  recommendedRatio: number;
  /** WCAG conformance band for the recommended pair. */
  band: "AAA" | "AA" | "AA Large" | "Fail";
}

/** Result of a WCAG 2.2 non-text contrast check (UI components & graphics). */
export interface NonTextContrastResult {
  /** Foreground color (the UI component / graphic color). */
  foreground: string;
  /** Background color (the adjacent color). */
  background: string;
  /** WCAG 2.1 contrast ratio (1–21). */
  ratio: number;
  /** Whether it passes the WCAG 2.2 non-text 3:1 threshold. */
  passes: boolean;
  /** Conformance band. */
  band: "Pass" | "Fail";
  /**
   * The kind of non-text element this is most relevant to — purely
   * informational, set by the caller.
   */
  kind?: "border" | "icon" | "focus-indicator" | "graphic" | "general";
}

/** Result of a wide-gamut (Display-P3) analysis of a color. */
export interface GamutInfo {
  /** The original hex color (clamped to sRGB). */
  hex: string;
  /** The CSS `color(display-p3 r g b)` string (r/g/b in 0–1). */
  p3String: string;
  /** The linear-RGB values in the P3 space (0–1 each). */
  p3: [number, number, number];
  /** Whether the color is inside the sRGB gamut (no clamping needed). */
  inSRGB: boolean;
  /** Whether the color is inside the Display-P3 gamut. */
  inP3: boolean;
  /**
   * The ∆E2000 between the original (unclamped) P3 color and its sRGB-clamped
   * version. 0 when the color is already in sRGB. Higher = more gamut loss.
   */
  gamutLoss: number;
}


