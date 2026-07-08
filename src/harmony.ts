/**
 * chroma-flow — color harmonies
 * Generate classic color-harmony schemes (complementary, analogous, triadic,
 * tetradic, split-complementary, monochromatic) from a single seed color.
 *
 * Harmonies operate in hue space using the seed's OKLCH hue, keeping the
 * seed's lightness and chroma for a cohesive set.
 *
 * @license MIT
 */

import type { Harmony, HarmonyColor, HarmonyScheme } from "./types";
import { hexToOKLCH, normalizeHue, okLCHToHex } from "./oklch";

/** Angular offsets (degrees) for each supported scheme, relative to the seed. */
const SCHEME_OFFSETS: Record<HarmonyScheme, { role: string; offset: number }[]> = {
  complementary: [{ role: "base", offset: 0 }, { role: "complement", offset: 180 }],
  analogous: [
    { role: "base", offset: 0 },
    { role: "analog-1", offset: -30 },
    { role: "analog-2", offset: 30 },
  ],
  triadic: [
    { role: "base", offset: 0 },
    { role: "triad-1", offset: 120 },
    { role: "triad-2", offset: 240 },
  ],
  tetradic: [
    { role: "base", offset: 0 },
    { role: "tetrad-1", offset: 90 },
    { role: "tetrad-2", offset: 180 },
    { role: "tetrad-3", offset: 270 },
  ],
  "split-complementary": [
    { role: "base", offset: 0 },
    { role: "split-1", offset: 150 },
    { role: "split-2", offset: 210 },
  ],
  monochromatic: [
    { role: "base", offset: 0 },
    // Same hue, stepped chroma for a tonal set.
    { role: "mono-1", offset: 0 },
    { role: "mono-2", offset: 0 },
    { role: "mono-3", offset: 0 },
  ],
};

/**
 * Generate a color harmony from a seed color.
 *
 * @example
 * ```ts
 * import { generateHarmony } from "chroma-flow";
 * const triad = generateHarmony("#6366f1", "triadic");
 * triad.colors.forEach((c) => console.log(c.role, c.hex));
 * ```
 */
export function generateHarmony(
  seed: string,
  scheme: HarmonyScheme
): Harmony {
  const seedOKLCH = hexToOKLCH(seed);
  const offsets = SCHEME_OFFSETS[scheme];
  const colors: HarmonyColor[] = offsets.map((o, i) => {
    const hue = normalizeHue(seedOKLCH.h + o.offset);
    let l = seedOKLCH.l;
    let c = seedOKLCH.c;
    // For monochromatic, vary chroma across the set while keeping hue fixed.
    if (scheme === "monochromatic") {
      c = Math.max(0.02, seedOKLCH.c * (1 - i * 0.22));
    }
    return {
      role: o.role,
      hue,
      offset: o.offset,
      hex: okLCHToHex(l, c, hue),
    };
  });
  return { seed, scheme, colors };
}

/**
 * Generate all six harmony schemes from a seed in one call.
 * Useful for building a "harmony explorer" UI.
 */
export function generateAllHarmonies(seed: string): Record<HarmonyScheme, Harmony> {
  const schemes: HarmonyScheme[] = [
    "complementary",
    "analogous",
    "triadic",
    "tetradic",
    "split-complementary",
    "monochromatic",
  ];
  const out = {} as Record<HarmonyScheme, Harmony>;
  for (const s of schemes) {
    out[s] = generateHarmony(seed, s);
  }
  return out;
}

/** Human-readable label for a scheme. */
export function harmonyLabel(scheme: HarmonyScheme): string {
  const labels: Record<HarmonyScheme, string> = {
    complementary: "Complementary",
    analogous: "Analogous",
    triadic: "Triadic",
    tetradic: "Tetradic",
    "split-complementary": "Split-complementary",
    monochromatic: "Monochromatic",
  };
  return labels[scheme];
}

/** Short description of how each scheme is constructed. */
export function harmonyDescription(scheme: HarmonyScheme): string {
  const descriptions: Record<HarmonyScheme, string> = {
    complementary: "Two colors directly opposite on the color wheel (180°).",
    analogous: "Three neighboring colors (±30°) for a calm, cohesive feel.",
    triadic: "Three evenly-spaced colors (120° apart) for a vibrant, balanced look.",
    tetradic: "Four colors at 90° intervals — a rich, square scheme.",
    "split-complementary": "The base plus the two colors adjacent to its complement.",
    monochromatic: "A tonal set at the same hue with stepped chroma.",
  };
  return descriptions[scheme];
}
