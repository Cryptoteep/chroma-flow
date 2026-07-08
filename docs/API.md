# API reference

This is the complete public API of `chroma-flow`. All functions are
tree-shakeable ESM exports and have zero runtime dependencies.

## Table of contents

- [Palette generation](#palette-generation)
- [Color space conversions](#color-space-conversions)
- [WCAG contrast](#wcag-contrast)
- [APCA contrast](#apca-contrast)
- [Color vision deficiency](#color-vision-deficiency)
- [Text color suggestion](#text-color-suggestion)
- [Semantic themes](#semantic-themes)
- [Color harmonies](#color-harmonies)
- [Delta-E ∆E2000](#delta-e-e2000)
- [Color manipulation](#color-manipulation)
- [Palette utilities](#palette-utilities)
- [Palette import & seed inference](#palette-import--seed-inference)
- [Accessible pairs](#accessible-pairs)
- [WCAG 2.2 non-text contrast](#wcag-22-non-text-contrast)
- [Wide-gamut (Display-P3)](#wide-gamut-display-p3)
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

## APCA contrast

APCA (Accessible Perceptual Contrast Algorithm) is the WCAG 3 candidate
contrast method. It is more perceptually accurate than the WCAG 2.1 ratio —
especially for dark backgrounds, where WCAG 2.1 overestimates readability.

### `apcaContrast(text, background)`

Returns a signed Lc value (roughly −107 to +106):

- **Positive** = dark text on a light background.
- **Negative** = light text on a dark background.
- Magnitude = perceived contrast strength.

```ts
apcaContrast("#000000", "#ffffff"); //  +106
apcaContrast("#ffffff", "#000000"); //  -107
```

### `checkAPCA(text, background)`

Full APCA check with conformance helpers:

```ts
{
  Lc: -87.6,
  magnitude: 87.6,
  recommendedMinSize: 12,
  passesBodyText: true,   // |Lc| ≥ 75
  passesLargeText: true,  // |Lc| ≥ 60
  passesNonText: true,    // |Lc| ≥ 45
}
```

### `formatLc(lc)`

Formats an Lc value: `-87.6 → "Lc -87.6"`.

### `suggestTextColorAPCA(background)`

Returns `"#000000"` or `"#ffffff"` based on APCA magnitude.

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

## Semantic themes

Generate a coordinated light + dark theme from a single seed. The dark variant
isn't an inverted ramp — it's recomposed with lower-chroma surfaces, lighter
text roles, and a desaturated primary for comfort on emissive screens.

### `generateTheme(seed, options?)`

Returns a `ThemePair` with `light`, `dark`, `lightAudit`, and `darkAudit`.

```ts
const theme = generateTheme("#6366f1");
theme.light.primary;  // "#3f37bb"
theme.dark.primary;   // "#8b95ff"
theme.darkAudit;      // [{ role, background, text, wcagRatio, apcaLc, passesAA }, ...]
```

Each `SemanticTheme` contains: `background`, `surface`, `surfaceMuted`,
`border`, `text`, `textMuted`, `textSubtle`, `primary`, `primaryForeground`,
`accent`, `accentForeground`, `success`, `warning`, `danger`.

### `themeToCSS(theme, name?)`

Emits `:root { ... }` plus a `.dark { ... }` override block.

### `themeToJSON(theme)`

Emits `{ seed, light, dark }` JSON.

---

## Color harmonies

Derive classic color-harmony schemes from a single seed in OKLCH hue space,
keeping the seed's lightness and chroma for a cohesive set.

### `generateHarmony(seed, scheme)`

Returns a `Harmony` with `seed`, `scheme`, and `colors` (each with `role`,
`hue`, `offset`, `hex`).

```ts
const triad = generateHarmony("#6366f1", "triadic");
triad.colors; // [{ role: "base", hex: "#6366f1" }, ...]
```

Supported schemes: `"complementary"`, `"analogous"`, `"triadic"`, `"tetradic"`,
`"split-complementary"`, `"monochromatic"`.

### `generateAllHarmonies(seed)`

Returns all six schemes in one call as a `Record<HarmonyScheme, Harmony>`.

### `harmonyLabel(scheme)` / `harmonyDescription(scheme)`

Human-readable label and one-line description for a scheme.

---

## Delta-E (∆E76 / ∆E94 / ∆E2000)

chroma-flow ships three CIE color-difference metrics, from simplest to most
perceptually accurate:

- **∆E76** — straight Euclidean distance in CIE Lab. Fast, but overestimates
  differences in saturated colors.
- **∆E94** — adds chroma/hue weighting (graphic-arts factors). A good middle ground.
- **∆E2000** (CIEDE2000) — the most perceptually accurate. Recommended default.

### `deltaE2000(a, b)` / `deltaE94(a, b)` / `deltaE76(a, b)`

Each returns the ∆E for its method (0 = identical, ~2.3 = JND for ∆E2000).

```ts
deltaE76("#6366f1", "#5b5cf0");   //  ~6.71  (overestimates)
deltaE94("#6366f1", "#5b5cf0");   //  ~3.26
deltaE2000("#6366f1", "#5b5cf0"); //  ~3.17  (most accurate)
```

### `deltaE(a, b, method = "2000")`

Dispatcher that selects the method. `method` ∈ `"76" | "94" | "2000"`.

```ts
deltaE("#6366f1", "#5b5cf0");            // ∆E2000 (default)
deltaE("#6366f1", "#5b5cf0", "76");      // ∆E76
```

### `checkDeltaE(a, b)`

Full ∆E2000 check with a human-readable band and a JND flag:

```ts
{
  deltaE: 3.17,
  band: "noticeable",     // indistinguishable | barely noticeable | noticeable | clearly different | very different
  belowJND: false,        // true when deltaE < 2.3
}
```

### `formatDeltaE(deltaE)`

Formats for display: `3.17 → "∆E 3.17"`.

### `nearestColor(target, candidates, method = "2000")`

Find the closest color in a list using the requested ∆E method. Returns
`{ hex, deltaE }`.

```ts
nearestColor("#6366f1", ["#ef4444", "#3f37bb", "#10b981"]);           // ∆E2000
nearestColor("#6366f1", ["#ef4444", "#3f37bb", "#10b981"], "76");    // ∆E76
// { hex: "#3f37bb", deltaE: 16.05 }
```

---

## Color manipulation

OKLCH-based operations on individual colors. All return a hex string.

### `mixColors(a, b, t = 0.5)`

Blend two colors by factor `t` (0 = fully `a`, 1 = fully `b`), interpolating in
OKLCH with shortest-path hue.

```ts
mixColors("#6366f1", "#f59e0b", 0.5); // "#e95ea0"
```

### Lightness & chroma

- `lighten(hex, amount = 0.1)` — increase OKLCH lightness.
- `darken(hex, amount = 0.1)` — decrease OKLCH lightness.
- `saturate(hex, amount = 0.05)` — increase OKLCH chroma.
- `desaturate(hex, amount = 0.05)` — decrease OKLCH chroma.

### `rotateHue(hex, degrees)` / `complement(hex)` / `invert(hex)`

- `rotateHue("#6366f1", 120)` → `#d93a00`
- `complement` is shorthand for `rotateHue(hex, 180)`.
- `invert` is channel-wise sRGB inversion (255 − channel).

### `randomSeed(options?)`

Generate a random seed hex in OKLCH, constrained to a pleasant lightness/chroma
range so the result is usually usable as a palette seed.

```ts
randomSeed();                          // any vivid mid-tone
randomSeed({ hueRange: [140, 200] });  // a random teal/cyan
```

`RandomSeedOptions`: `minLightness`, `maxLightness`, `minChroma`, `maxChroma`,
`hueRange: [min, max]`.

---

## Palette utilities

Higher-level operations on full palettes.

### `interpolatePalette(palette)`

Insert a midpoint between each standard stop. Returns a `Record<string, string>`
with 21 entries (11 stops + 10 midpoints), keyed by the interpolated numeric
label (e.g. `"50"`, `"75"`, `"100"`, `"125"`, …).

### `sortPalette(palette, order)`

Reorder stops by OKLCH lightness or chroma, ascending or descending. `order` ∈
`"lightness-asc" | "lightness-desc" | "chroma-asc" | "chroma-desc"`. Returns a
new `Palette` relabeled 50–950 in the new order.

### `reversePalette(palette)`

Reverse the ramp so stop 50 holds what was 950, and vice versa. Returns a new
`Palette`.

### `paletteToGradient(palette, direction = "to right")`

Emit a CSS `linear-gradient(...)` string from the palette stops — handy for
previews.

---

## Palette import & seed inference

The reverse of the export pipeline: parse an existing palette back into a
chroma-flow seed, so you can reverse-engineer a design system and continue
tweaking it with the generator.

### `parseCSSPalette(css)`

Recognize `--name-NNN: #hex;` declarations and map the trailing number to a
palette stop. The palette name is the variable prefix before the stop number.

```ts
parseCSSPalette(`:root { --brand-500: #6366f1; --brand-600: #3f37bb; }`);
// { format: "css", name: "brand", colors: { 500: "#6366f1", 600: "#3f37bb" }, stops: [500, 600] }
```

### `parseTailwindPalette(config)`

Recognize `NNN: "#hex"` entries inside a named color object in a Tailwind
config fragment.

### `parseJSONPalette(json)`

Parse a `{ "500": "#hex", … }` JSON object.

### `parsePalette(input)`

Auto-detect the format and parse. Falls back to a raw hex scan (assigning
hexes to stops in order) if no structured format is recognized.

### `inferSeed(imported)`

Find the seed color that best reproduces an imported palette. For each stop in
the source, it treats that stop's hex as a candidate seed, generates a full
palette, and measures the average ∆E2000 across shared stops. The candidate
with the lowest average ∆E wins.

```ts
const { seed, fromStop, averageDeltaE, palette } = inferSeed(imported);
// { seed: "#6366f1", fromStop: 500, averageDeltaE: 0.187, palette: {…} }
```

### `importAndInfer(input)`

Convenience: parse a string and return both the imported palette and the
inferred seed in one call.

---

## Accessible pairs

Discover WCAG-conformant foreground/background pairs from a palette and audit
every stop's text accessibility.

### `findAccessiblePair(palette, level = "AA", options?)`

Search all stop-vs-stop combinations plus black/white text against each stop,
and return the pair with the highest contrast ratio that meets the requested
level. Returns `null` if no pair qualifies.

```ts
const pair = findAccessiblePair(palette, "AAA");
// { foreground: "#ffffff", background: "#0c033d", ratio: 19.16, apcaLc: -107, passesAA: true, passesAAA: true }
```

`options.includeBlackWhite` (default `true`) controls whether black/white text
candidates are considered.

### `suggestAccessibleText(palette, backgroundStop, level = "AA")`

Suggest the most accessible text color from the palette for a given background
stop, preferring palette colors over black/white when they meet the level with
a higher ratio.

### `paletteAccessibilityMatrix(palette)`

Audit every stop: report the black/white text ratios, the recommended text
color, the recommended pair's ratio, and a WCAG band
(`"AAA" | "AA" | "AA Large" | "Fail"`).

```ts
paletteAccessibilityMatrix(palette);
// [{ stop: 50, background: "#e8f5ff", blackRatio: 18.94, whiteRatio: 1.11,
//   recommendedText: "#000000", recommendedRatio: 18.94, band: "AAA" }, ...]
```

### `accessibleStops(palette, level = "AA")`

List the stop numbers that pass the requested WCAG level as a background (with
either black or white text), in ascending order.

---

## WCAG 2.2 non-text contrast

Checks the 3:1 contrast threshold for UI components and graphical objects per
WCAG 2.2 SC 1.4.11 (Non-text Contrast). Applies to input boundaries, icons,
focus indicators, chart segments, and other non-text content.

### `NON_TEXT_THRESHOLD`

The WCAG 2.2 non-text contrast threshold: `3`.

### `checkNonTextContrast(foreground, background, kind = "general")`

Check whether a foreground (UI component / graphic) meets the 3:1 threshold
against an adjacent background. `kind` is informational
(`"border" | "icon" | "focus-indicator" | "graphic" | "general"`).

```ts
checkNonTextContrast("#6366f1", "#ffffff", "border");
// { foreground: "#6366f1", background: "#ffffff", ratio: 4.47, passes: true, band: "Pass", kind: "border" }
```

### `passesNonText(foreground, background)`

Boolean check for the 3:1 threshold.

### `uiComponentContrast({ fill, border?, pageBackground })`

Audit a UI component in one call: the fill against the page background, plus
(if a border is given) the border against both the page background (outside)
and the fill (inside). Returns an array of `NonTextContrastResult`.

### `focusIndicatorContrast({ indicator, background })`

Check a focus indicator's 3:1 contrast against its background (SC 1.4.13 /
1.4.11).

### `paletteNonTextMatrix(palette, background)`

Audit every stop: report whether it meets 3:1 as a UI component color on the
given background. Returns `{ stop, color, ratio, passes }[]` sorted by stop.

---

## Wide-gamut (Display-P3)

Convert between sRGB hex and the CSS `color(display-p3 r g b)` notation,
detect out-of-sRGB-gamut colors, and clamp wide-gamut colors back to sRGB.
Display-P3 is the gamut used by modern Apple displays and wide-gamut monitors.

### `toP3String(hex)`

Convert an sRGB hex color to a CSS `color(display-p3 r g b)` string (0–1).

```ts
toP3String("#10b981"); // "color(display-p3 0.090178 0.461936 0.251553)"
```

### `parseP3String(input)`

Parse a CSS `color(display-p3 r g b)` string back to an sRGB hex. Values
outside the sRGB gamut are clamped.

### `isInSRGBGamut(hex)` / `p3IsInSRGBGamut(p3String)`

Check whether a color falls inside the sRGB gamut. For hex, always true (hex
is inherently sRGB). For a `color(display-p3 ...)` string, returns false if
any channel is outside [0, 1] after conversion to sRGB.

### `clampToSRGB(p3String)`

Clamp a `color(display-p3 ...)` string to the sRGB gamut, returning a hex.

### `analyzeGamut(hex)`

Full wide-gamut analysis: the P3 representation, gamut membership, and ∆E2000
gamut loss. Returns a `GamutInfo` object.

### `paletteGamutAudit(oklchColors, srgbColors)`

Compare theoretical OKLCH colors to their sRGB-clamped palette counterparts and
report the ∆E2000 gamut loss per stop.

---

## Exporters

### `exportPalette(palette, format, name?)`

Single entry point. `format` ∈ `"css" | "tailwind" | "json" | "scss" | "svg" | "android-xml" | "swift" | "compose"`.

### Individual exporters

- `toCSS(palette, name?)` — CSS custom properties.
- `toCSSMulti(palettes)` — multiple named palettes as CSS.
- `toTailwind(palette, name)` — Tailwind config fragment.
- `toTailwindMulti(palettes)` — multiple palettes as Tailwind config.
- `toJSON(palette)` — JSON object.
- `toSCSS(palette, name?)` — SCSS variables.
- `toSVG(palette, name?)` — SVG swatch sheet.
- `toAndroidXML(palette, name?)` — Android `colors.xml`.
- `toSwift(palette, name?)` — SwiftUI `Color` extension.
- `toCompose(palette, name?)` — Jetpack Compose `Color` object.

---

## Types

All types are exported from the package root: `RGB`, `OKLCH`, `OKLab`,
`PaletteStop`, `Palette`, `GenerateOptions`, `WCAGLevel`, `ContrastResult`,
`CVDType`, `CVDPreview`, `ExportFormat`, `APHAResult`, `SemanticTheme`,
`ThemeAudit`, `ThemePair`, `HarmonyScheme`, `HarmonyColor`, `Harmony`,
`DeltaEResult`, `DeltaEMethod`, `RandomSeedOptions`, `SortOrder`,
`InferredSeed`, `ImportedPalette`, `AccessiblePair`, `PaletteAccessibilityRow`,
`NonTextContrastResult`, `GamutInfo`.
