/**
 * chroma-flow — exporters
 * Serialize a palette into the most common design-tool formats.
 *
 * @license MIT
 */

import type { Palette } from "./types";

const STOP_ORDER = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function keyToName(key: string): string {
  // e.g. "primary" -> "primary", "brand-blue" -> "brandBlue"
  return key.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/** Export a single palette as CSS custom properties. */
export function toCSS(palette: Palette, name = "color"): string {
  const lines = STOP_ORDER.map(
    (stop) => `  --${name}-${stop}: ${palette[stop as 50]};`
  );
  return `:root {\n${lines.join("\n")}\n}\n`;
}

/** Export multiple named palettes as CSS custom properties. */
export function toCSSMulti(palettes: Record<string, Palette>): string {
  return Object.entries(palettes)
    .map(([name, palette]) => toCSS(palette, keyToName(name)))
    .join("\n");
}

/** Export a single palette as a Tailwind config fragment. */
export function toTailwind(palette: Palette, name = "brand"): string {
  const entries = STOP_ORDER.map(
    (stop) => `        ${stop}: "${palette[stop as 50]}",`
  ).join("\n");
  return `module.exports = {
  theme: {
    extend: {
      colors: {
        ${name}: {
${entries}
        },
      },
    },
  },
};\n`;
}

/** Export multiple named palettes as a Tailwind config fragment. */
export function toTailwindMulti(palettes: Record<string, Palette>): string {
  const blocks = Object.entries(palettes).map(([name, palette]) => {
    const entries = STOP_ORDER.map(
      (stop) => `          ${stop}: "${palette[stop as 50]}",`
    ).join("\n");
    return `        ${keyToName(name)}: {\n${entries}\n        }`;
  });
  return `module.exports = {
  theme: {
    extend: {
      colors: {
${blocks.join(",\n")}
      },
    },
  },
};\n`;
}

/** Export a palette as a JSON object. */
export function toJSON(palette: Palette): string {
  const obj: Record<string, string> = {};
  for (const stop of STOP_ORDER) {
    obj[String(stop)] = palette[stop as 50];
  }
  return JSON.stringify(obj, null, 2) + "\n";
}

/** Export a palette as SCSS variables. */
export function toSCSS(palette: Palette, name = "color"): string {
  const lines = STOP_ORDER.map(
    (stop) => `$${name}-${stop}: ${palette[stop as 50]};`
  );
  return lines.join("\n") + "\n";
}

/** Export a palette as an Android `colors.xml` resource file. */
export function toAndroidXML(palette: Palette, name = "color"): string {
  const lines = STOP_ORDER.map(
    (stop) =>
      `  <color name="${name}_${stop}">${palette[stop as 50].replace("#", "#FF")}</color>`
  );
  return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${lines.join("\n")}\n</resources>\n`;
}

/**
 * Render a palette as an SVG swatch sheet. Handy for dropping into docs
 * or sharing a visual summary in a PR.
 */
export function toSVG(palette: Palette, name = "palette"): string {
  const swatchW = 80;
  const swatchH = 120;
  const gap = 8;
  const labelH = 36;
  const totalW = STOP_ORDER.length * (swatchW + gap) + gap;
  const totalH = swatchH + labelH + gap * 2;

  const swatches = STOP_ORDER.map((stop, i) => {
    const x = gap + i * (swatchW + gap);
    const y = gap;
    const hex = palette[stop as 50];
    return [
      `  <rect x="${x}" y="${y}" width="${swatchW}" height="${swatchH}" rx="8" fill="${hex}" />`,
      `  <text x="${x + swatchW / 2}" y="${y + swatchH + 22}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="600" fill="#111" text-anchor="middle">${stop}</text>`,
      `  <text x="${x + swatchW / 2}" y="${y + swatchH + 22 + 16}" font-family="ui-monospace, monospace" font-size="11" fill="#555" text-anchor="middle">${hex}</text>`,
    ].join("\n");
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <rect width="100%" height="100%" fill="#ffffff" rx="12" />
${swatches}
  <title>${name} palette</title>
</svg>\n`;
}

/**
 * Export a palette as a Swift `Color` extension, usable in iOS / SwiftUI.
 * Each stop becomes a static `Color` property with normalized RGB floats.
 */
export function toSwift(palette: Palette, name = "brand"): string {
  const props = STOP_ORDER.map((stop) => {
    const hex = palette[stop as 50];
    const { r, g, b } = hexToRGBInline(hex);
    return `    public static let ${name}${stop} = Color(red: ${r}, green: ${g}, blue: ${b})`;
  }).join("\n");
  return `import SwiftUI

extension Color {
${props}
}
`;
}

/**
 * Export a palette as a Jetpack Compose `Color` object (Kotlin),
 * usable in Android Compose UIs.
 */
export function toCompose(palette: Palette, name = "Brand"): string {
  const props = STOP_ORDER.map((stop) => {
    const hex = palette[stop as 50];
    const { r, g, b, a } = hexToRGBInline(hex);
    return `    val ${name}${stop} = Color(${r}f, ${g}f, ${b}f, ${a}f)`;
  }).join("\n");
  return `import androidx.compose.ui.graphics.Color

object ${name}Colors {
${props}
}
`;
}

/** Convert #aabbcc to normalized {r,g,b,a} floats in 0–1 for Swift/Compose. */
function hexToRGBInline(hex: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  const round5 = (n: number) => Math.round(n * 1e5) / 1e5;
  return {
    r: round5(((num >> 16) & 0xff) / 255),
    g: round5(((num >> 8) & 0xff) / 255),
    b: round5((num & 0xff) / 255),
    a: 1,
  };
}

/** Export a palette in the requested format. */
export function exportPalette(
  palette: Palette,
  format:
    | "css"
    | "tailwind"
    | "json"
    | "scss"
    | "svg"
    | "android-xml"
    | "swift"
    | "compose",
  name = "color"
): string {
  switch (format) {
    case "css":
      return toCSS(palette, name);
    case "tailwind":
      return toTailwind(palette, name);
    case "json":
      return toJSON(palette);
    case "scss":
      return toSCSS(palette, name);
    case "svg":
      return toSVG(palette, name);
    case "android-xml":
      return toAndroidXML(palette, name);
    case "swift":
      return toSwift(palette, name);
    case "compose":
      return toCompose(palette, name);
    default:
      throw new Error(`chroma-flow: unknown export format "${format}"`);
  }
}
