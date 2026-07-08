/**
 * chroma-flow — palette import & seed inference
 * Parse an existing color palette from a CSS-variables block, a Tailwind config
 * fragment, or JSON, then infer the seed color that would reproduce it most
 * closely with chroma-flow's generator.
 *
 * This is the reverse of the export pipeline: it lets you reverse-engineer a
 * design system's palette back into a single seed.
 *
 * @license MIT
 */

import type { ImportedPalette, InferredSeed, Palette, PaletteStop } from "./types";
import { generatePalette, getStops } from "./generator";
import { deltaE2000 } from "./deltaE";
import { normalizeHex } from "./srgb";

const STOPS = getStops();
const STOP_SET = new Set<number>(STOPS);

/** Extract all `#rrggbb` / `#rgb` hex tokens from a string. */
function extractHexes(input: string): string[] {
  const matches = input.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g);
  return matches ? matches.map((h) => normalizeHex(h)) : [];
}

/**
 * Parse a CSS custom-properties block into a palette.
 *
 * Recognizes declarations like `--primary-500: #6366f1;` and maps the trailing
 * numeric token to a palette stop. The palette name is taken from the variable
 * prefix before the stop number (e.g. `primary` from `--primary-500`).
 *
 * @example
 * ```ts
 * parseCSSPalette(`:root { --brand-500: #6366f1; --brand-600: #3f37bb; }`);
 * // { format: "css", name: "brand", colors: { 500: "#6366f1", 600: "#3f37bb" }, stops: [500, 600] }
 * ```
 */
export function parseCSSPalette(css: string): ImportedPalette {
  const colors: Partial<Palette> = {};
  let name = "color";
  const lines = css.split(/[;{}]/);
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(/--([a-zA-Z][\w-]*)\s*:\s*(#[0-9a-fA-F]{3,8})/);
    if (!m) continue;
    const [, varName, hex] = m;
    // Look for a trailing 2–3 digit number in the variable name.
    const stopMatch = varName.match(/(\d{2,3})$/);
    if (!stopMatch) continue;
    const stop = Number(stopMatch[1]);
    if (!STOP_SET.has(stop)) continue;
    colors[stop as PaletteStop] = normalizeHex(hex);
    const prefix = varName.slice(0, varName.length - stopMatch[1].length).replace(/-$/, "");
    if (prefix) name = prefix;
  }
  return {
    format: "css",
    name,
    colors,
    stops: Object.keys(colors).map((s) => Number(s)).sort((a, b) => a - b),
  };
}

/**
 * Parse a Tailwind config fragment (JS/TS) into a palette.
 *
 * Recognizes `50: "#hex"` / `500: '#hex'` style entries inside a named color
 * object. The palette name is taken from the object key wrapping the stops
 * (e.g. `primary` from `primary: { 500: "#..." }`).
 *
 * @example
 * ```ts
 * parseTailwindPalette(`primary: { 500: "#6366f1", 600: "#3f37bb" }`);
 * ```
 */
export function parseTailwindPalette(config: string): ImportedPalette {
  const colors: Partial<Palette> = {};
  let name = "color";
  // Match a wrapping object key like `name:` followed by a stop entry.
  const objMatch = config.match(/([a-zA-Z][\w-]*)\s*:\s*\{([^}]*)\}/);
  if (objMatch) {
    name = objMatch[1];
    const body = objMatch[2];
    const stopRegex = /(\d{2,3})\s*:\s*['"]?(#[0-9a-fA-F]{3,8})['"]?/g;
    let m: RegExpExecArray | null;
    while ((m = stopRegex.exec(body)) !== null) {
      const stop = Number(m[1]);
      if (STOP_SET.has(stop)) colors[stop as PaletteStop] = normalizeHex(m[2]);
    }
  } else {
    // Fallback: scan for any `NNN: "#hex"` pairs without a wrapping object.
    const stopRegex = /(\d{2,3})\s*:\s*['"]?(#[0-9a-fA-F]{3,8})['"]?/g;
    let m: RegExpExecArray | null;
    while ((m = stopRegex.exec(config)) !== null) {
      const stop = Number(m[1]);
      if (STOP_SET.has(stop)) colors[stop as PaletteStop] = normalizeHex(m[2]);
    }
  }
  return {
    format: "tailwind",
    name,
    colors,
    stops: Object.keys(colors).map((s) => Number(s)).sort((a, b) => a - b),
  };
}

/**
 * Parse a JSON object of `{ "50": "#hex", "500": "#hex", … }` into a palette.
 */
export function parseJSONPalette(json: string): ImportedPalette {
  const colors: Partial<Palette> = {};
  let name = "color";
  try {
    const obj = JSON.parse(json) as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      const stop = Number(key);
      if (STOP_SET.has(stop) && typeof value === "string" && /^#?[0-9a-fA-F]{6}$/.test(value)) {
        colors[stop as PaletteStop] = normalizeHex(value);
      }
    }
  } catch {
    // Not valid JSON — return empty.
  }
  return {
    format: "json",
    name,
    colors,
    stops: Object.keys(colors).map((s) => Number(s)).sort((a, b) => a - b),
  };
}

/**
 * Auto-detect the format and parse. Falls back to a raw hex scan if no
 * structured format is recognized.
 */
export function parsePalette(input: string): ImportedPalette {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const json = parseJSONPalette(trimmed);
    if (json.stops.length > 0) return json;
  }
  if (/--[\w-]+\s*:\s*#/.test(trimmed)) {
    return parseCSSPalette(trimmed);
  }
  if (/\d{2,3}\s*:\s*['"]?#/.test(trimmed)) {
    return parseTailwindPalette(trimmed);
  }
  // Last resort: raw hexes, assign to stops in order.
  const hexes = extractHexes(trimmed);
  const colors: Partial<Palette> = {};
  hexes.slice(0, STOPS.length).forEach((hex, i) => {
    colors[STOPS[i] as PaletteStop] = hex;
  });
  return {
    format: "json",
    name: "color",
    colors,
    stops: Object.keys(colors).map((s) => Number(s)).sort((a, b) => a - b),
  };
}

/**
 * Infer the seed color that would best reproduce an imported palette.
 *
 * Strategy: for each stop in the source palette, treat that stop's hex as a
 * candidate seed, generate a full palette from it, and measure the average
 * ∆E2000 between the generated palette and the source palette on the stops
 * they share. The candidate with the lowest average ∆E wins.
 *
 * @example
 * ```ts
 * const { seed, averageDeltaE } = inferSeed(parseCSSPalette(cssString));
 * ```
 */
export function inferSeed(imported: ImportedPalette): InferredSeed {
  const sourceStops = imported.stops;
  if (sourceStops.length === 0) {
    return { seed: "#6366f1", fromStop: 500, averageDeltaE: 0, palette: generatePalette("#6366f1") };
  }

  let best: InferredSeed | null = null;

  for (const stop of sourceStops) {
    const candidate = imported.colors[stop as PaletteStop]!;
    const generated = generatePalette(candidate);
    let sum = 0;
    let count = 0;
    for (const s of sourceStops) {
      const src = imported.colors[s as PaletteStop]!;
      const gen = generated[s as PaletteStop];
      sum += deltaE2000(src, gen);
      count += 1;
    }
    const averageDeltaE = count > 0 ? sum / count : 0;
    if (!best || averageDeltaE < best.averageDeltaE) {
      best = { seed: candidate, fromStop: stop, averageDeltaE, palette: generated };
    }
  }

  return best as unknown as InferredSeed;
}

/**
 * Convenience: parse a string and return both the imported palette and the
 * inferred seed in one call.
 */
export function importAndInfer(input: string): {
  imported: ImportedPalette;
  inferred: InferredSeed;
} {
  const imported = parsePalette(input);
  const inferred = inferSeed(imported);
  return { imported, inferred };
}
