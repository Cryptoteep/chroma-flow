# Changelog

All notable changes to **chroma-flow** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Live web playground (in-repo, GitHub Pages)
- Figma plugin

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
