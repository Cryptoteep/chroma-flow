# API reference

This is the complete public API of `chroma-flow`. All functions are
tree-shakeable ESM exports and have zero runtime dependencies.

## Table of contents

- [Palette generation](#palette-generation)
- [Color space conversions](#color-space-conversions)
- [WCAG contrast](#wcag-contrast)
- [Color vision deficiency](#color-vision-deficiency)
- [Text color suggestion](#text-color-suggestion)
- [Exporters](#exporters)
- [Types](#types)

---

## Palette generation

### `generatePalette(seed, options?)`

Generate a full 50–950 palette from a seed hex color.

```ts
const palette = generatePalette("#6366f1");
// { 50: "#e8f5ff", 100: "#deecff", ..., 950: "#0c033d" }
```

**Options**

| Option          | Type                       | Default        |
| --------------- | -------------------------- | -------------- |
| `distribution`  | `"linear" \| "perceptual"` | `"perceptual"` |
| `chromaFalloff` | `number` (0–1)             | `0.5`          |
| `hueShift`      | `number` (degrees)         | `0`            |
| `maxChroma`     | `number`                   | `0.32`         |

### `generatePalettes(seeds, options?)`

Generate multiple named palettes at once.

```ts
const system = generatePalettes({
  primary: "#6366f1",
  success: "#10b981",
  warning: "#f59e0b",
});
```

### `getStops()`

Returns the ordered array of palette stops: `[50, 100, 200, ..., 950]`.

---

## Color space conversions

### `hexToOKLCH(hex)` / `okLCHToHex(l, c, h)`

Convert between hex strings and the OKLCH color space.

### `rgbToOKLCH(rgb)` / `hexToRGB(hex)` / `rgbToHex(rgb)`

Lower-level conversion helpers.

### `normalizeHex(hex)`

Normalize any hex form (`#abc`, `#aabbcc`) to a 7-character `#aabbcc` string.

### `relativeLuminance(rgb)`

WCAG 2.1 relative luminance of an RGB color (0–1).

---

## WCAG contrast

### `contrastRatio(foreground, background)`

Returns the WCAG contrast ratio (1–21).

### `checkContrast(foreground, background)`

Full conformance check:

```ts
{
  ratio: 8.48,
  passesAANormal: true,
  passesAALarge: true,
  passesAAANormal: true,
  passesAAALarge: true,
}
```

### `passes(foreground, background, level)`

Boolean check for `"AA"` or `"AAA"` (normal text).

### `formatRatio(ratio)`

Formats a ratio for display: `4.53 → "4.53:1"`.

---

## Color vision deficiency

### `simulateCVD(hex, type)`

Simulate one CVD type. `type` ∈ `"protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia"`.

### `simulateAll(hex)`

Simulate all four CVDs, returning `[{ type, hex, original }, ...]`.

### `distinguishability(a, b)`

Score (0–1) how distinguishable two colors remain under each CVD.

---

## Text color suggestion

### `suggestTextColor(background)`

Returns `"#000000"` or `"#ffffff"`, whichever is more readable.

### `bestStopForContrast(palette, text, level?)`

Find the palette stop with the highest passing contrast ratio.

### `auditPalette(palette)`

Per-stop accessibility audit (best text color, AA pass for black/white).

---

## Exporters

### `exportPalette(palette, format, name?)`

Single entry point. `format` ∈ `"css" | "tailwind" | "json" | "scss" | "svg" | "android-xml"`.

### Individual exporters

- `toCSS(palette, name?)` — CSS custom properties.
- `toCSSMulti(palettes)` — multiple named palettes as CSS.
- `toTailwind(palette, name)` — Tailwind config fragment.
- `toTailwindMulti(palettes)` — multiple palettes as Tailwind config.
- `toJSON(palette)` — JSON object.
- `toSCSS(palette, name?)` — SCSS variables.
- `toSVG(palette, name?)` — SVG swatch sheet.
- `toAndroidXML(palette, name?)` — Android `colors.xml`.

---

## Types

All types are exported from the package root: `RGB`, `OKLCH`, `OKLab`,
`PaletteStop`, `Palette`, `GenerateOptions`, `WCAGLevel`, `ContrastResult`,
`CVDType`, `CVDPreview`, `ExportFormat`.
