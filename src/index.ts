/**
 * chroma-flow — public API
 *
 * An open-source, zero-dependency TypeScript library for generating
 * accessible (WCAG + color-blind-safe) color systems from a single seed.
 *
 * @license MIT
 */

export type {
  RGB,
  OKLCH,
  OKLab,
  PaletteStop,
  Palette,
  GenerateOptions,
  WCAGLevel,
  ContrastResult,
  CVDType,
  CVDPreview,
  ExportFormat,
  APHAResult,
  SemanticTheme,
  ThemeAudit,
  ThemePair,
  HarmonyScheme,
  HarmonyColor,
  Harmony,
  DeltaEResult,
  RandomSeedOptions,
  SortOrder,
  InferredSeed,
  ImportedPalette,
} from "./types";

export {
  clamp,
  decodeSRGB,
  encodeSRGB,
  hexToRGB,
  rgbToHex,
  normalizeHex,
  relativeLuminance,
} from "./srgb";

export {
  linearRGBToOKLab,
  okLabToLinearRGB,
  okLabToOKLCH,
  okLCHToOKLab,
  rgbToOKLCH,
  hexToOKLCH,
  okLCHToHex,
  normalizeHue,
} from "./oklch";

export {
  contrastRatio,
  checkContrast,
  passes,
  formatRatio,
} from "./wcag";

export {
  simulateCVD,
  simulateAll,
  distinguishability,
} from "./colorblind";

export {
  generatePalette,
  generatePalettes,
  getStops,
} from "./generator";

export {
  suggestTextColor,
  bestStopForContrast,
  auditPalette,
} from "./suggest";

export {
  toCSS,
  toCSSMulti,
  toTailwind,
  toTailwindMulti,
  toJSON,
  toSCSS,
  toSVG,
  toAndroidXML,
  toSwift,
  toCompose,
  exportPalette,
} from "./exporters";

export {
  apcaContrast,
  checkAPCA,
  formatLc,
  suggestTextColorAPCA,
} from "./apca";

export {
  generateTheme,
  themeToCSS,
  themeToJSON,
} from "./theme";

export {
  generateHarmony,
  generateAllHarmonies,
  harmonyLabel,
  harmonyDescription,
} from "./harmony";

export {
  deltaE2000,
  deltaE94,
  deltaE76,
  deltaE,
  checkDeltaE,
  formatDeltaE,
  nearestColor,
  type DeltaEMethod,
} from "./deltaE";

export {
  mixColors,
  lighten,
  darken,
  saturate,
  desaturate,
  rotateHue,
  complement,
  invert,
  randomSeed,
} from "./manipulate";

export {
  interpolatePalette,
  sortPalette,
  reversePalette,
  paletteToGradient,
} from "./palette-utils";

export {
  parseCSSPalette,
  parseTailwindPalette,
  parseJSONPalette,
  parsePalette,
  inferSeed,
  importAndInfer,
} from "./palette-import";

/** Library version. */
export const VERSION = "0.6.0";
