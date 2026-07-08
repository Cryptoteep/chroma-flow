# Changelog

All notable changes to **chroma-flow** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Live web playground (in-repo, GitHub Pages)
- Figma plugin

## [0.9.0] - 2025-03-05

### Added
- 🌈 **Wide-gamut (Display-P3) support** (`toP3String`, `parseP3String`,
  `isInSRGBGamut`, `p3IsInSRGBGamut`, `clampToSRGB`, `analyzeGamut`,
  `paletteGamutAudit`) — convert between sRGB hex and the CSS
  `color(display-p3 r g b)` notation, detect out-of-sRGB-gamut colors, clamp
  wide-gamut colors back to sRGB, and audit a palette for gamut loss.
- 🖥️ CLI flag `--p3` to emit the palette as CSS `color(display-p3 ...)` strings.
- `VERSION` bumped to `0.9.0`.

### Changed
- `GamutInfo` type exported from root.
- New `src/gamut.ts` module.

## [0.8.0] - 2025-02-26

### Added
- 🎨 **WCAG 2.2 non-text contrast** (`checkNonTextContrast`, `passesNonText`,
  `uiComponentContrast`, `focusIndicatorContrast`, `paletteNonTextMatrix`,
  `NON_TEXT_THRESHOLD`) — checks the 3:1 contrast threshold for UI components
  and graphical objects per WCAG 2.2 SC 1.4.11 (Non-text Contrast). Includes
  helpers for button/input boundaries, focus indicators, and per-stop palette
  audits against a background.
- 🖥️ CLI flags `--nontext` and `--nontext-bg <hex>`.
- `VERSION` bumped to `0.8.0`.

### Changed
- `NonTextContrastResult` type exported from root.
- New `src/nontext.ts` module.

## [0.7.0] - 2025-02-19

### Added
- ♿ **Accessible pair finder** (`findAccessiblePair`, `suggestAccessibleText`,
  `paletteAccessibilityMatrix`, `accessibleStops`) — discover WCAG-conformant
  foreground/background pairs from a palette, audit every stop's text
  accessibility, and list the stops that pass a given level.
- 🖥️ CLI flags `--pairs`, `--matrix`, and `--level AA|AAA`.
- `VERSION` bumped to `0.7.0`.

### Changed
- `AccessiblePair`, `PaletteAccessibilityRow` types exported from root.
- New `src/accessible.ts` module.

## [0.6.0] - 2025-02-12

### Added
- 📥 **Palette import & seed inference** (`parseCSSPalette`,
  `parseTailwindPalette`, `parseJSONPalette`, `parsePalette`, `inferSeed`,
  `importAndInfer`) — the reverse of the export pipeline. Parse an existing
  palette from a CSS-variables block, a Tailwind config fragment, or JSON,
  then infer the seed color that would reproduce it most closely (lowest
  average ∆E2000 across shared stops).
- 🖥️ CLI flags `--import <string>` and `--infer-seed`.
- `VERSION` bumped to `0.6.0`.

### Changed
- `InferredSeed`, `ImportedPalette` types exported from root.
- New `src/palette-import.ts` module.

## [0.5.0] - 2025-02-05

### Added
- 📐 **∆E76 and ∆E94** — `deltaE76`, `deltaE94`, and a `deltaE(a, b, method)`
  dispatcher join the existing ∆E2000. ∆E76 is the simple Euclidean Lab
  distance (fast, overestimates saturated colors); ∆E94 adds chroma/hue
  weighting; ∆E2000 remains the most accurate. `nearestColor` now accepts a
  method argument.
- 🖥️ CLI flag `--delta-method 76|94|2000` (default 2000) for `--delta-e`.
- `DeltaEMethod` type exported from root.
- `VERSION` bumped to `0.5.0`.

## [0.4.0] - 2025-01-29

### Added
- 🎛️ **Color manipulation primitives** (`mixColors`, `lighten`, `darken`,
  `saturate`, `desaturate`, `rotateHue`, `complement`, `invert`, `randomSeed`) —
  OKLCH-based operations on individual colors for predictable, perceptual edits.
- 🧰 **Palette utilities** (`interpolatePalette`, `sortPalette`, `reversePalette`,
  `paletteToGradient`) — insert midpoints between stops, sort by lightness/chroma,
  reverse a ramp, or emit a CSS gradient string.
- 🖥️ CLI flags `--mix`, `--mix-amount`, `--random`, `--rotate`, `--complement`,
  `--lighten`, `--darken`, `--saturate`, `--desaturate`, `--invert`,
  `--interpolate`, `--reverse`, `--gradient`.
- `VERSION` bumped to `0.4.0`.

### Changed
- `RandomSeedOptions`, `SortOrder` types exported from root.
- New `src/manipulate.ts` and `src/palette-utils.ts` modules.

## [0.3.0] - 2025-01-22

### Added
- 🎨 **Color harmonies** (`generateHarmony`, `generateAllHarmonies`, `harmonyLabel`,
  `harmonyDescription`) — derive classic harmony schemes (complementary, analogous,
  triadic, tetradic, split-complementary, monochromatic) from a single seed in OKLCH
  hue space.
- 📐 **Delta-E ∆E2000** (`deltaE2000`, `checkDeltaE`, `formatDeltaE`, `nearestColor`) —
  the CIEDE2000 perceptual color-difference metric with a human-readable band and a
  JND (just-noticeable difference) flag, plus a nearest-color finder.
- 🖥️ CLI flags `--harmony <scheme>` and `--delta-e <hex>`.
- `VERSION` bumped to `0.3.0`.

### Changed
- `HarmonyScheme`, `HarmonyColor`, `Harmony`, `DeltaEResult` types exported from root.
- New `src/harmony.ts` and `src/deltaE.ts` modules.

## [0.2.0] - 2025-01-15

### Added
- 📏 **APCA contrast** (`apcaContrast`, `checkAPCA`, `formatLc`, `suggestTextColorAPCA`) —
  the WCAG 3 candidate perceptual contrast algorithm. Returns a signed Lc value
  (positive = dark text on light bg, negative = light on dark) and conformance
  helpers for body / large / non-text thresholds.
- 🌗 **Semantic theme generation** (`generateTheme`, `themeToCSS`, `themeToJSON`) —
  derives a coordinated light + dark theme pair from one seed, choosing semantic
  roles (background, surface, text, primary, accent, success, warning, danger)
  from the ramp and auditing WCAG + APCA on every text role.
- 🍎 **Swift / SwiftUI exporter** (`toSwift`) — palette as a `Color` extension.
- 🤖 **Jetpack Compose exporter** (`toCompose`) — palette as a Kotlin `Color` object.
- 🖥️ CLI flags `--apca` and `--theme`; new `--format swift` and `--format compose`.
- `VERSION` bumped to `0.2.0`.

### Changed
- `ExportFormat` now includes `"swift"` and `"compose"`.
- `exportPalette` accepts the two new formats.

## [0.1.0] - 2025-01-01

### Added
- 🎨 Initial public release.
- OKLCH-based palette generation (`generatePalette`) with `perceptual` and
  `linear` lightness distributions, chroma falloff, and hue shift.
- WCAG 2.1 contrast checking (`checkContrast`, `contrastRatio`, `passes`) for
  AA / AAA normal and large text.
- Color vision deficiency simulation (`simulateCVD`, `simulateAll`) for
  protanopia, deuteranopia, tritanopia, and achromatopsia using Machado et al.
  (2009) matrices.
- Smart text-color suggestion (`suggestTextColor`) and palette auditing
  (`auditPalette`, `bestStopForContrast`).
- Multi-format exporters: CSS variables, Tailwind config, JSON, SCSS, SVG
  swatch sheets, and Android `colors.xml`.
- Zero-dependency CLI (`chroma-flow`) with `--format`, `--contrast`, `--cvd`,
  `--distribution`, `--hue-shift`, and `--chroma-falloff` options.
- Runnable example (`examples/basic.ts`).
- Full documentation: README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.

### Notes
- The library is **zero-dependency** and ships as tree-shakeable ESM.
- OKLCH is chosen over HSL for perceptually uniform lightness ramps.
