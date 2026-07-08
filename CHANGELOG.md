# Changelog

All notable changes to **chroma-flow** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- APCA (WCAG 3 candidate) contrast support
- Live web playground (in-repo)
- Figma plugin
- Light + dark theme generation from one seed

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
