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

/** Export a palette in the requested format. */
export function exportPalette(
  palette: Palette,
  format: "css" | "tailwind" | "json" | "scss" | "svg" | "android-xml",
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
    default:
      throw new Error(`chroma-flow: unknown export format "${format}"`);
  }
}
