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
  exportPalette,
} from "./exporters";

/** Library version. */
export const VERSION = "0.1.0";
