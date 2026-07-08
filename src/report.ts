/**
 * chroma-flow — unified full accessibility report
 * A single call that combines text contrast (WCAG 2.1), non-text contrast
 * (WCAG 2.2 SC 1.4.11), and gamut loss into one report — the one-stop API
 * for a complete palette accessibility audit.
 *
 * @license MIT
 */

import type {
  AccessibilityReportRow,
  FullAccessibilityReport,
  Palette,
  PaletteStop,
  WCAGLevel,
} from "./types";
import { getStops } from "./generator";
import { checkContrast, contrastRatio } from "./wcag";
import { NON_TEXT_THRESHOLD } from "./nontext";
import { analyzeGamut } from "./gamut";

const STOPS = getStops();

/**
 * Generate a unified full accessibility report for a palette, combining
 * text contrast, non-text (UI component) contrast, and gamut loss into
 * a single per-stop table plus summary scores.
 *
 * @example
 * ```ts
 * import { generatePalette, fullAccessibilityReport } from "chroma-flow";
 * const palette = generatePalette("#6366f1");
 * const report = fullAccessibilityReport(palette, "#ffffff", "AAA");
 * console.log(report.overallScore);  // 0–1
 * console.log(report.textPassing);   // stops passing AAA text
 * ```
 */
export function fullAccessibilityReport(
  palette: Palette,
  background: string,
  level: WCAGLevel = "AA",
  options: { seed?: string } = {}
): FullAccessibilityReport {
  const { seed = "" } = options;
  const textThreshold = level === "AA" ? 4.5 : 7;

  const rows: AccessibilityReportRow[] = STOPS.map((stop: PaletteStop) => {
    const bg = palette[stop];
    const black = checkContrast("#000000", bg);
    const white = checkContrast("#ffffff", bg);
    const recommendedText = white.ratio >= black.ratio ? "#ffffff" : "#000000";
    const textRatio = Math.max(black.ratio, white.ratio);

    let textBand: AccessibilityReportRow["textBand"];
    if (textRatio >= 7) textBand = "AAA";
    else if (textRatio >= 4.5) textBand = "AA";
    else if (textRatio >= 3) textBand = "AA Large";
    else textBand = "Fail";

    const nonTextRatio = contrastRatio(bg, background);
    const nonTextPasses = nonTextRatio >= NON_TEXT_THRESHOLD;

    const gamutInfo = analyzeGamut(bg);

    return {
      stop,
      background: bg,
      textRatio,
      textBand,
      recommendedText,
      nonTextRatio,
      nonTextPasses,
      gamutLoss: gamutInfo.gamutLoss,
    };
  });

  const textPassing = rows.filter((r) => r.textRatio >= textThreshold).length;
  const nonTextPassing = rows.filter((r) => r.nonTextPasses).length;
  const inGamut = rows.filter((r) => r.gamutLoss === 0).length;
  const total = rows.length;
  const overallScore =
    (textPassing / total + nonTextPassing / total + inGamut / total) / 3;

  return {
    seed,
    background,
    level,
    rows,
    textPassing,
    nonTextPassing,
    inGamut,
    total,
    overallScore,
  };
}

/**
 * A compact text summary of a full accessibility report, suitable for
 * CLI output or quick inspection.
 */
export function summarizeReport(report: FullAccessibilityReport): string {
  const pct = (n: number) => `${Math.round((n / report.total) * 100)}%`;
  return [
    `Palette accessibility report${report.seed ? ` for seed ${report.seed}` : ""}`,
    `  Background: ${report.background}  Level: WCAG ${report.level}`,
    `  Text contrast:     ${report.textPassing}/${report.total} (${pct(report.textPassing)}) pass`,
    `  Non-text (3:1):    ${report.nonTextPassing}/${report.total} (${pct(report.nonTextPassing)}) pass`,
    `  In sRGB gamut:     ${report.inGamut}/${report.total} (${pct(report.inGamut)})`,
    `  Overall score:     ${(report.overallScore * 100).toFixed(0)}%`,
  ].join("\n");
}
