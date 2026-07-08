/**
 * chroma-flow — semantic theme generation
 * Derives a coordinated light + dark theme from a single seed color,
 * choosing semantic roles from the generated palette ramp and
 * verifying WCAG AA on every text role.
 *
 * @license MIT
 */

import type { SemanticTheme, ThemeAudit, ThemePair, GenerateOptions } from "./types";
import { generatePalette } from "./generator";
import { checkContrast } from "./wcag";
import { apcaContrast } from "./apca";
import { suggestTextColor } from "./suggest";

/** Pick the most readable foreground (black or white) for a background. */
function fg(bg: string): string {
  return suggestTextColor(bg);
}

/**
 * Build a light semantic theme from a palette.
 * Light theme: light backgrounds, dark text, vivid primary.
 */
function buildLight(
  p: ReturnType<typeof generatePalette>
): SemanticTheme {
  const success = "#16a34a";
  const warning = "#d97706";
  const danger = "#dc2626";
  return {
    background: p[50],
    surface: "#ffffff",
    surfaceMuted: p[100],
    border: p[200],
    text: p[950],
    textMuted: p[700],
    textSubtle: p[500],
    primary: p[600],
    primaryForeground: fg(p[600]),
    accent: p[500],
    accentForeground: fg(p[500]),
    success,
    warning,
    danger,
  };
}

/**
 * Build a dark semantic theme from a palette.
 * Dark theme: dark, lower-chroma backgrounds; light text; slightly
 * desaturated primary for comfort on emissive screens.
 */
function buildDark(
  p: ReturnType<typeof generatePalette>
): SemanticTheme {
  const success = "#4ade80";
  const warning = "#fbbf24";
  const danger = "#f87171";
  return {
    background: p[950],
    surface: p[900],
    surfaceMuted: p[800],
    border: p[700],
    text: p[50],
    textMuted: p[300],
    textSubtle: p[400],
    primary: p[400],
    primaryForeground: fg(p[400]),
    accent: p[300],
    accentForeground: fg(p[300]),
    success,
    warning,
    danger,
  };
}

/**
 * Audit a semantic theme: for each text-bearing role, record the
 * WCAG ratio and APCA Lc against its background, plus AA pass.
 */
function auditTheme(theme: SemanticTheme): ThemeAudit[] {
  const pairs: { role: string; background: string; text: string }[] = [
    { role: "text/surface", background: theme.surface, text: theme.text },
    { role: "text/background", background: theme.background, text: theme.text },
    { role: "textMuted/surface", background: theme.surface, text: theme.textMuted },
    { role: "primaryFg/primary", background: theme.primary, text: theme.primaryForeground },
    { role: "accentFg/accent", background: theme.accent, text: theme.accentForeground },
  ];
  return pairs.map((pair) => {
    const result = checkContrast(pair.text, pair.background);
    return {
      role: pair.role,
      background: pair.background,
      text: pair.text,
      wcagRatio: result.ratio,
      apcaLc: apcaContrast(pair.text, pair.background),
      passesAA: result.passesAANormal,
    };
  });
}

/**
 * Generate a coordinated light + dark theme pair from a single seed.
 *
 * @example
 * ```ts
 * import { generateTheme } from "chroma-flow";
 * const theme = generateTheme("#6366f1");
 * console.log(theme.light.primary);  // "#3f37bb"
 * console.log(theme.dark.primary);   // "#8b95ff"
 * ```
 */
export function generateTheme(
  seed: string,
  options: GenerateOptions = {}
): ThemePair {
  const palette = generatePalette(seed, options);
  return {
    seed,
    light: buildLight(palette),
    dark: buildDark(palette),
    lightAudit: auditTheme(buildLight(palette)),
    darkAudit: auditTheme(buildDark(palette)),
  };
}

/**
 * Export a semantic theme as CSS custom properties grouped under
 * a root selector with a `.dark` override.
 */
export function themeToCSS(theme: ThemePair, name = "theme"): string {
  const lightVars = toVars(theme.light, name);
  const darkVars = toVars(theme.dark, name);
  return `:root {\n${lightVars}}\n\n.dark {\n${darkVars}}\n`;
}

/** Serialize a SemanticTheme to CSS custom property declarations. */
function toVars(theme: SemanticTheme, name: string): string {
  const entries = Object.entries(theme).map(
    ([key, value]) => `  --${name}-${kebab(key)}: ${value};`
  );
  return `${entries.join("\n")}\n`;
}

/** Convert camelCase to kebab-case. */
function kebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Export a semantic theme as a JSON object with `light` and `dark` keys.
 */
export function themeToJSON(theme: ThemePair): string {
  return JSON.stringify(
    { seed: theme.seed, light: theme.light, dark: theme.dark },
    null,
    2
  ) + "\n";
}
