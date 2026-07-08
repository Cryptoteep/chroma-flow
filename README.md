<div align="center">

# 🎨 chroma-flow

**Accessible color systems, from a single seed.**

A zero-dependency TypeScript library & CLI that generates perceptually-uniform,
WCAG-compliant, color-blind-safe color palettes using the modern **OKLCH** color space.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Good First Issues](https://img.shields.io/github/issues/Cryptoteep/chroma-flow/good%20first%20issue?label=good%20first%20issue&color=7057ff)](https://github.com/Cryptoteep/chroma-flow/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

</div>

---

## 🌱 Mission

> **Make accessible design free and effortless for everyone.**

Color accessibility shouldn't be a premium feature locked behind paid design
tools. 1 in 12 men and 1 in 200 women live with some form of color vision
deficiency, yet most generated palettes are never checked against it.
`chroma-flow` ships WCAG 2.1 contrast checking and color-blind simulation in a
tiny, dependency-free package so that *every* developer can build inclusive
interfaces — no SaaS, no signup, no tracking.

This is a non-commercial, community-driven project. It will never be paywalled,
ad-supported, or acquired.

## ✨ Features

- 🧪 **OKLCH-based generation** — perceptually uniform ramps that look balanced to the human eye.
- ♿ **WCAG 2.1 contrast checking** — AA / AAA conformance for normal and large text.
- 📏 **APCA contrast (WCAG 3 candidate)** — signed perceptual Lc values, more accurate than WCAG 2.1 for dark themes.
- 🌗 **Light + dark theme generation** — a coordinated semantic theme pair (background, surface, text, primary, accent, success/warning/danger) from one seed, with a per-role WCAG + APCA audit.
- 🎨 **Color harmonies** — complementary, analogous, triadic, tetradic, split-complementary, and monochromatic schemes derived from a seed.
- 📐 **Delta-E ∆E76 / ∆E94 / ∆E2000** — three CIE color-difference metrics (from fast Euclidean to perceptually-accurate CIEDE2000) with a human-readable band and a nearest-color finder.
- 🎛️ **Color manipulation** — mix, lighten, darken, saturate, rotate hue, complement, invert, and random-seed generation in OKLCH.
- 🧰 **Palette utilities** — interpolate midpoints, sort by lightness/chroma, reverse, or emit a CSS gradient.
- 👁️ **Color-blind simulation** — protanopia, deuteranopia, tritanopia, achromatopsia.
- 🎯 **Smart text-color suggestion** — auto-pick black or white text for any background.
- 📤 **Eight export formats** — CSS variables, Tailwind config, JSON, SCSS, SVG swatch sheets, Android `colors.xml`, SwiftUI `Color`, Jetpack Compose `Color`.
- 🖥️ **CLI + library** — use it in code or from the terminal.
- 🪶 **Zero runtime dependencies** — auditable in an afternoon, ships tiny.
- 🌲 **Tree-shakeable ESM** — import only what you use.

## 📦 Installation

```bash
npm install chroma-flow
# or
bun add chroma-flow
# or
pnpm add chroma-flow
```

Use the CLI globally:

```bash
npm install -g chroma-flow
chroma-flow "#6366f1" --format css
```

…or run it once with `bunx` / `npx`:

```bash
bunx chroma-flow "#6366f1"
```

## 🚀 Quick start

### Library

```ts
import {
  generatePalette,
  checkContrast,
  suggestTextColor,
  simulateAll,
  exportPalette,
} from "chroma-flow";

// 1. Generate a full 50–950 palette from one seed.
const palette = generatePalette("#6366f1");
console.log(palette[500]); // "#6265f0"

// 2. Export it to CSS variables.
const css = exportPalette(palette, "css", "primary");

// 3. Pick the most readable text color for a background.
const text = suggestTextColor(palette[600]); // "#ffffff"

// 4. Check WCAG conformance.
const result = checkContrast(text, palette[600]);
console.log(result.ratio);           // 8.48
console.log(result.passesAAANormal); // true

// 5. Preview the seed under color vision deficiencies.
simulateAll(palette[500]).forEach((p) =>
  console.log(p.type, p.hex)
);

// 6. (v0.2) Check APCA perceptual contrast (WCAG 3 candidate).
import { checkAPCA } from "chroma-flow";
const apca = checkAPCA("#ffffff", palette[600]);
console.log(apca.Lc);               // -87.6  (negative = light text on dark)
console.log(apca.passesBodyText);   // true   (|Lc| ≥ 75)

// 7. (v0.2) Generate a coordinated light + dark theme.
import { generateTheme, themeToCSS } from "chroma-flow";
const theme = generateTheme("#6366f1");
console.log(theme.light.primary);   // "#3f37bb"
console.log(theme.dark.primary);    // "#8b95ff"
const themeCss = themeToCSS(theme, "brand"); // :root {…} .dark {…}

// 8. (v0.3) Generate a color harmony.
import { generateHarmony } from "chroma-flow";
const triad = generateHarmony("#6366f1", "triadic");
triad.colors.forEach((c) => console.log(c.role, c.hex)); // base, triad-1, triad-2

// 9. (v0.3) Measure the perceptual difference between two colors.
import { checkDeltaE, nearestColor, deltaE76 } from "chroma-flow";
const d = checkDeltaE("#6366f1", "#5b5cf0"); // { deltaE: 3.17, band: "noticeable", belowJND: false }
const nearest = nearestColor("#6366f1", ["#ef4444", "#3f37bb", "#10b981"]);
deltaE76("#6366f1", "#5b5cf0"); // ~6.71 (v0.5 — the simpler ∆E76 metric)

// 10. (v0.4) Manipulate colors in OKLCH.
import { mixColors, lighten, rotateHue, randomSeed } from "chroma-flow";
mixColors("#6366f1", "#f59e0b", 0.5); // "#e95ea0"
lighten("#6366f1", 0.15);              // "#8d97ff"
rotateHue("#6366f1", 120);             // "#d93a00"
randomSeed();                          // e.g. "#a952ba"

// 11. (v0.4) Work with full palettes.
import { interpolatePalette, reversePalette, paletteToGradient } from "chroma-flow";
const dense = interpolatePalette(palette);   // 21 steps (11 + 10 mids)
const inverted = reversePalette(palette);    // 50 ↔ 950
const gradient = paletteToGradient(palette); // "linear-gradient(to right, …)"
```

### CLI

```bash
# Generate a palette
chroma-flow "#6366f1"

#  50  #e8f5ff  █
# 100  #deecff  ██
# 200  #cad9ff  ████
# ...

# Export as CSS variables
chroma-flow "#6366f1" --format css --name primary

# Export as SwiftUI / Jetpack Compose (v0.2)
chroma-flow "#6366f1" --format swift --name brand
chroma-flow "#6366f1" --format compose --name Brand

# Check WCAG 2.1 contrast against a foreground color
chroma-flow "#f59e0b" --contrast "#000000"

# Check APCA perceptual contrast (v0.2)
chroma-flow "#10b981" --apca "#ffffff"

# Generate a coordinated light + dark theme pair (v0.2)
chroma-flow "#6366f1" --theme --name brand

# Generate a color harmony (v0.3)
chroma-flow "#6366f1" --harmony triadic

# Measure the perceptual difference between two colors (v0.3)
chroma-flow "#6366f1" --delta-e "#5b5cf0"
# …using the simpler ∆E76 metric (v0.5)
chroma-flow "#6366f1" --delta-e "#5b5cf0" --delta-method 76

# Mix, rotate, complement, lighten (v0.4)
chroma-flow "#6366f1" --mix "#f59e0b" --mix-amount 0.3
chroma-flow "#6366f1" --rotate 120
chroma-flow "#6366f1" --complement
chroma-flow "#6366f1" --lighten 0.15
chroma-flow --random

# Palette utilities (v0.4)
chroma-flow "#6366f1" --interpolate
chroma-flow "#6366f1" --reverse
chroma-flow "#6366f1" --gradient

# Simulate color vision deficiencies
chroma-flow "#6366f1" --cvd

# Tweak the ramp
chroma-flow "#6366f1" --distribution linear --hue-shift -20 --chroma-falloff 0.7
```

## 🧠 How it works

`chroma-flow` converts your seed color into the **OKLCH** color space (a
cylindrical form of OKLab), then walks a lightness ramp across 11 stops while
modulating chroma with a falloff curve and an optional hue shift. The result is
a smooth, natural-feeling scale where every stop stays inside the sRGB gamut.

OKLCH is chosen over HSL because HSL lightness is **not** perceptually uniform —
a "50% lightness" yellow is far brighter to the eye than a "50% lightness" blue.
OKLCH fixes this, so ramps actually look balanced.

```
seed hex
   │
   ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│ sRGB →   │ ─► │ lightness    │ ─► │ chroma       │
│ OKLCH    │    │ ramp (11)    │    │ falloff      │
└──────────┘    └──────────────┘    └──────┬───────┘
                                            │
                            ┌───────────────┴───────────────┐
                            ▼                               ▼
                    WCAG contrast checks          CVD simulation
                    (AA / AAA)                    (4 conditions)
                            │                               │
                            └───────────────┬───────────────┘
                                            ▼
                            CSS / Tailwind / JSON / SCSS / SVG / XML
```

## 📚 API

### `generatePalette(seed, options?)`
Returns a `Record<50|100|…|950, string>` palette.

| Option           | Type                         | Default        | Description                                  |
| ---------------- | ---------------------------- | -------------- | -------------------------------------------- |
| `distribution`   | `"linear" \| "perceptual"`   | `"perceptual"` | Lightness distribution across the ramp.      |
| `chromaFalloff`  | `number` (0–1)               | `0.5`          | Vividness of mid-tones vs. extremes.         |
| `hueShift`       | `number` (degrees)           | `0`            | Hue drift across the ramp.                   |
| `maxChroma`      | `number`                     | `0.32`         | Clamp to avoid out-of-gamut colors.          |

### `checkContrast(foreground, background)`
Returns `{ ratio, passesAANormal, passesAALarge, passesAAANormal, passesAAALarge }`.

### `simulateAll(hex)`
Returns an array of `{ type, hex, original }` for all four CVD types.

### `suggestTextColor(background)`
Returns `"#000000"` or `"#ffffff"`, whichever has higher contrast.

### `exportPalette(palette, format, name?)`
Exports to `"css" | "tailwind" | "json" | "scss" | "svg" | "android-xml"`.

See the [full API reference](docs/API.md) for the complete list.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

- 🐛 Found a bug? [Open an issue](https://github.com/Cryptoteep/chroma-flow/issues/new?template=bug_report.md).
- 💡 Have an idea? [Suggest a feature](https://github.com/Cryptoteep/chroma-flow/issues/new?template=feature_request.md).
- 🔧 Want to code? Grab a [`good first issue`](https://github.com/Cryptoteep/chroma-flow/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and read [CONTRIBUTING.md](CONTRIBUTING.md).

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## 🗺️ Roadmap

- [x] ~~APCA contrast support (WCAG 3 candidate)~~ — shipped in v0.2.0
- [x] ~~Theme generation (light + dark from one seed)~~ — shipped in v0.2.0
- [x] ~~Swift + Jetpack Compose exporters~~ — shipped in v0.2.0
- [x] ~~Color harmonies (complementary / triadic / analogous …)~~ — shipped in v0.3.0
- [x] ~~Delta-E ∆E2000 color difference helper~~ — shipped in v0.3.0
- [x] ~~Color manipulation & palette utilities~~ — shipped in v0.4.0
- [x] ~~∆E76 and ∆E94 metrics~~ — shipped in v0.5.0
- [ ] Live web playground (in-repo, deployed to GitHub Pages)
- [ ] ESM + CJS dual build
- [ ] Figma plugin

## 📄 License

MIT © [Cryptoteep](https://github.com/Cryptoteep). See [LICENSE](LICENSE).

## 💛 Acknowledgements

- [Björn Ottosson](https://bottosson.github.io/posts/oklab/) for the OKLab / OKLCH color space.
- [Machado et al. (2009)](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html) for the color vision deficiency simulation matrices.
- The W3C for the [WCAG 2.1 contrast specification](https://www.w3.org/TR/WCAG21/).

<div align="center">

**⭐ If chroma-flow helps you build something more accessible, please star the repo — it helps others find it.**

</div>
