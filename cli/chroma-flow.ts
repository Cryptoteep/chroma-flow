#!/usr/bin/env node
/**
 * chroma-flow — CLI
 * Generate accessible color palettes from your terminal.
 *
 * Usage:
 *   chroma-flow <hex>                       generate a palette
 *   chroma-flow <hex> --format css          export as CSS variables
 *   chroma-flow <hex> --format tailwind     export as a Tailwind fragment
 *   chroma-flow <hex> --format json         export as JSON
 *   chroma-flow <hex> --format scss         export as SCSS variables
 *   chroma-flow <hex> --format svg          export as an SVG swatch sheet
 *   chroma-flow <hex> --format android-xml  export as Android colors.xml
 *   chroma-flow <hex> --format swift        export as a SwiftUI Color extension
 *   chroma-flow <hex> --format compose      export as a Jetpack Compose object
 *   chroma-flow <hex> --contrast "#ffffff"  check WCAG contrast vs a color
 *   chroma-flow <hex> --apca "#ffffff"      check APCA (WCAG 3) contrast
 *   chroma-flow <hex> --cvd                 simulate color vision deficiencies
 *   chroma-flow <hex> --theme               generate light + dark theme pair
 *   chroma-flow <hex> --name primary        name the palette in exports
 *   chroma-flow <hex> --distribution linear use a linear lightness ramp
 *   chroma-flow <hex> --hue-shift -20       shift hue across the ramp
 *
 * @license MIT
 */

import {
  generatePalette,
  generateTheme,
  themeToCSS,
  exportPalette,
  checkContrast,
  checkAPCA,
  formatLc,
  formatRatio,
  simulateAll,
  getStops,
  normalizeHex,
  generateHarmony,
  harmonyLabel,
  harmonyDescription,
  checkDeltaE,
  formatDeltaE,
  deltaE,
  mixColors,
  lighten,
  darken,
  saturate,
  desaturate,
  rotateHue,
  complement,
  invert,
  randomSeed,
  interpolatePalette,
  reversePalette,
  paletteToGradient,
  parsePalette,
  inferSeed,
  findAccessiblePair,
  paletteAccessibilityMatrix,
  accessibleStops,
  paletteNonTextMatrix,
  analyzeGamut,
  type HarmonyScheme,
  type DeltaEMethod,
  type WCAGLevel,
} from "../src/index";

interface ParsedArgs {
  seed: string | null;
  format: string;
  name: string;
  contrast: string | null;
  apca: string | null;
  theme: boolean;
  cvd: boolean;
  harmony: HarmonyScheme | null;
  deltaE: string | null;
  deltaMethod: DeltaEMethod;
  mix: string | null;
  mixAmount: number;
  random: boolean;
  rotate: number | null;
  complement: boolean;
  lighten: number | null;
  darken: number | null;
  saturate: number | null;
  desaturate: number | null;
  invert: boolean;
  interpolate: boolean;
  reverse: boolean;
  gradient: boolean;
  importString: string | null;
  inferSeedFlag: boolean;
  pairs: boolean;
  matrix: boolean;
  nontext: boolean;
  nontextBg: string | null;
  p3: boolean;
  level: WCAGLevel;
  distribution: "linear" | "perceptual";
  hueShift: number;
  chromaFalloff: number;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {
    seed: null,
    format: "text",
    name: "color",
    contrast: null,
    apca: null,
    theme: false,
    cvd: false,
    harmony: null,
    deltaE: null,
    deltaMethod: "2000",
    mix: null,
    mixAmount: 0.5,
    random: false,
    rotate: null,
    complement: false,
    lighten: null,
    darken: null,
    saturate: null,
    desaturate: null,
    invert: false,
    interpolate: false,
    reverse: false,
    gradient: false,
    importString: null,
    inferSeedFlag: false,
    pairs: false,
    matrix: false,
    nontext: false,
    nontextBg: null,
    p3: false,
    level: "AA",
    distribution: "perceptual",
    hueShift: 0,
    chromaFalloff: 0.5,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-f":
      case "--format":
        args.format = next;
        i++;
        break;
      case "-n":
      case "--name":
        args.name = next;
        i++;
        break;
      case "-c":
      case "--contrast":
        args.contrast = next;
        i++;
        break;
      case "--cvd":
        args.cvd = true;
        break;
      case "--apca":
        args.apca = next;
        i++;
        break;
      case "--theme":
        args.theme = true;
        break;
      case "--harmony":
        args.harmony = next as HarmonyScheme;
        i++;
        break;
      case "--delta-e":
        args.deltaE = next;
        i++;
        break;
      case "--delta-method":
        args.deltaMethod = (next === "76" || next === "94" || next === "2000") ? next as DeltaEMethod : "2000";
        i++;
        break;
      case "--mix":
        args.mix = next;
        i++;
        break;
      case "--mix-amount":
        args.mixAmount = Number(next) || 0.5;
        i++;
        break;
      case "--random":
        args.random = true;
        break;
      case "--rotate":
        args.rotate = Number(next) || 0;
        i++;
        break;
      case "--complement":
        args.complement = true;
        break;
      case "--lighten":
        args.lighten = Number(next) || 0.1;
        i++;
        break;
      case "--darken":
        args.darken = Number(next) || 0.1;
        i++;
        break;
      case "--saturate":
        args.saturate = Number(next) || 0.05;
        i++;
        break;
      case "--desaturate":
        args.desaturate = Number(next) || 0.05;
        i++;
        break;
      case "--invert":
        args.invert = true;
        break;
      case "--interpolate":
        args.interpolate = true;
        break;
      case "--reverse":
        args.reverse = true;
        break;
      case "--gradient":
        args.gradient = true;
        break;
      case "--import":
        args.importString = next;
        i++;
        break;
      case "--infer-seed":
        args.inferSeedFlag = true;
        break;
      case "--pairs":
        args.pairs = true;
        break;
      case "--matrix":
        args.matrix = true;
        break;
      case "--level":
        args.level = next === "AAA" ? "AAA" : "AA";
        i++;
        break;
      case "--nontext":
        args.nontext = true;
        break;
      case "--nontext-bg":
        args.nontextBg = next;
        i++;
        break;
      case "--p3":
        args.p3 = true;
        break;
      case "--distribution":
        args.distribution = next === "linear" ? "linear" : "perceptual";
        i++;
        break;
      case "--hue-shift":
        args.hueShift = Number(next) || 0;
        i++;
        break;
      case "--chroma-falloff":
        args.chromaFalloff = Number(next) || 0.5;
        i++;
        break;
      default:
        if (!arg.startsWith("-") && !args.seed) {
          args.seed = arg;
        }
        break;
    }
  }

  return args;
}

const HELP = `
chroma-flow — accessible color palette generator

USAGE
  chroma-flow <hex> [options]

OPTIONS
  -f, --format <fmt>     text | css | tailwind | json | scss | svg | android-xml | swift | compose
  -n, --name <name>      palette name used in exports (default: color)
  -c, --contrast <hex>   check WCAG 2.1 contrast against the seed color
      --apca <hex>       check APCA (WCAG 3 candidate) contrast against the seed
      --harmony <scheme> complementary | analogous | triadic | tetradic | split-complementary | monochromatic
      --delta-e <hex>    compute ∆E color difference between the seed and a color
      --delta-method     76 | 94 | 2000 (default: 2000)
      --mix <hex>        mix the seed with another color (use --mix-amount to set the ratio)
      --mix-amount <t>   0–1, mix ratio (default 0.5)
      --random           generate a random seed color (ignores the hex argument)
      --rotate <deg>     rotate the seed hue by N degrees
      --complement       return the 180° complement of the seed
      --lighten <n>      increase OKLCH lightness by n (0–1)
      --darken <n>       decrease OKLCH lightness by n (0–1)
      --saturate <n>     increase OKLCH chroma by n
      --desaturate <n>   decrease OKLCH chroma by n
      --invert           invert the seed in sRGB space
      --interpolate      print the palette with interpolated midpoints (21 steps)
      --reverse          print the palette reversed (50 ↔ 950)
      --gradient         print a CSS linear-gradient from the palette
      --import <string>  parse a palette from a CSS/Tailwind/JSON string
      --infer-seed       with --import, infer the seed that best reproduces the palette
      --pairs            find the best WCAG-conformant fg/bg pair from the palette
      --matrix           print a full accessibility matrix (per-stop black/white text)
      --level <lvl>      AA | AAA (default: AA) — threshold for --pairs and --matrix
      --nontext         audit the palette for WCAG 2.2 non-text (3:1) contrast
      --nontext-bg <hx> background for --nontext (default: #ffffff)
      --p3               emit the palette as CSS color(display-p3 ...) strings
      --cvd              simulate color vision deficiencies on the seed
      --theme            generate a coordinated light + dark theme pair (CSS)
      --distribution     linear | perceptual (default: perceptual)
      --hue-shift <deg>  shift hue across the ramp (warmer/cooler extremes)
      --chroma-falloff   0–1, vividness of mid-tones vs extremes (default 0.5)
  -h, --help             show this help

EXAMPLES
  chroma-flow #6366f1
  chroma-flow #6366f1 --format css --name primary
  chroma-flow #6366f1 --format swift --name brand
  chroma-flow --random
  chroma-flow "#10b981" --contrast "#ffffff"
  chroma-flow "#10b981" --apca "#ffffff"
  chroma-flow "#6366f1" --harmony triadic
  chroma-flow "#6366f1" --delta-e "#5b5cf0"
  chroma-flow "#6366f1" --delta-e "#5b5cf0" --delta-method 76
  chroma-flow "#6366f1" --mix "#f59e0b" --mix-amount 0.3
  chroma-flow "#6366f1" --rotate 120
  chroma-flow "#6366f1" --complement
  chroma-flow "#6366f1" --lighten 0.15
  chroma-flow "#6366f1" --interpolate
  chroma-flow "#6366f1" --gradient
  chroma-flow --import ":root { --brand-500: #6366f1; }" --infer-seed
  chroma-flow "#6366f1" --pairs --level AAA
  chroma-flow "#6366f1" --matrix
  chroma-flow "#6366f1" --nontext --nontext-bg "#ffffff"
  chroma-flow "#6366f1" --p3
  chroma-flow "#6366f1" --theme
  chroma-flow "#f59e0b" --cvd
`.trim();

function renderText(palette: ReturnType<typeof generatePalette>): string {
  return getStops()
    .map((stop) => {
      const hex = palette[stop];
      const bar = "█".repeat(Math.max(1, Math.round(stop / 50)));
      return `${String(stop).padStart(3)}  ${hex}  ${bar}`;
    })
    .join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(HELP);
    return;
  }

  if (args.importString) {
    const imported = parsePalette(args.importString);
    if (imported.stops.length === 0) {
      console.error("No palette stops recognized in the input.");
      process.exit(1);
    }
    console.log(`Imported   ${imported.format} palette "${imported.name}" — ${imported.stops.length} stops`);
    for (const stop of imported.stops) {
      console.log(`  ${String(stop).padStart(3)}  ${imported.colors[stop as 50]}`);
    }
    if (args.inferSeedFlag) {
      const inferred = inferSeed(imported);
      console.log("");
      console.log(`Inferred seed  ${inferred.seed}  (from stop ${inferred.fromStop})`);
      console.log(`Average ∆E     ${inferred.averageDeltaE.toFixed(3)}  (lower = better fit)`);
      console.log("");
      console.log("Regenerated palette:");
      console.log(renderText(inferred.palette));
    }
    return;
  }

  if (args.random) {
    const generated = randomSeed();
    console.log(`Random seed  ${generated}`);
    const palette = generatePalette(generated, {
      distribution: args.distribution,
      hueShift: args.hueShift,
      chromaFalloff: args.chromaFalloff,
    });
    console.log("");
    console.log(renderText(palette));
    return;
  }

  if (!args.seed) {
    console.error("Error: a seed hex color is required (or use --random).\n");
    console.error(HELP);
    process.exit(1);
  }

  let seed: string;
  try {
    seed = normalizeHex(args.seed);
  } catch {
    console.error(`Error: "${args.seed}" is not a valid hex color.`);
    process.exit(1);
  }

  if (args.contrast) {
    let against: string;
    try {
      against = normalizeHex(args.contrast);
    } catch {
      console.error(`Error: "${args.contrast}" is not a valid hex color.`);
      process.exit(1);
    }
    const result = checkContrast(seed, against);
    console.log(`Contrast  ${result.foreground} on ${result.background}`);
    console.log(`Ratio     ${formatRatio(result.ratio)}`);
    console.log(
      `WCAG AA   normal ${result.passesAANormal ? "PASS" : "FAIL"}   large ${result.passesAALarge ? "PASS" : "FAIL"}`
    );
    console.log(
      `WCAG AAA  normal ${result.passesAAANormal ? "PASS" : "FAIL"}   large ${result.passesAAALarge ? "PASS" : "FAIL"}`
    );
    return;
  }

  if (args.apca) {
    let against: string;
    try {
      against = normalizeHex(args.apca);
    } catch {
      console.error(`Error: "${args.apca}" is not a valid hex color.`);
      process.exit(1);
    }
    const result = checkAPCA(seed, against);
    console.log(`APCA      ${result.foreground} on ${result.background}`);
    console.log(`Lc        ${formatLc(result.Lc)}`);
    console.log(
      `Body text ${result.passesBodyText ? "PASS" : "FAIL"}   Large text ${result.passesLargeText ? "PASS" : "FAIL"}   Non-text ${result.passesNonText ? "PASS" : "FAIL"}`
    );
    console.log(`Min size  ~${result.recommendedMinSize}pt for this contrast`);
    return;
  }

  if (args.harmony) {
    const validSchemes: HarmonyScheme[] = [
      "complementary",
      "analogous",
      "triadic",
      "tetradic",
      "split-complementary",
      "monochromatic",
    ];
    if (!validSchemes.includes(args.harmony)) {
      console.error(`Error: unknown harmony "${args.harmony}".`);
      console.error(`Valid schemes: ${validSchemes.join(", ")}`);
      process.exit(1);
    }
    const harmony = generateHarmony(seed, args.harmony);
    console.log(`${harmonyLabel(harmony.scheme)} harmony from ${seed}`);
    console.log(harmonyDescription(harmony.scheme));
    console.log("");
    for (const c of harmony.colors) {
      const offset = c.offset >= 0 ? `+${c.offset}°` : `${c.offset}°`;
      console.log(`${c.role.padEnd(18)} ${c.hex}  (hue ${c.hue.toFixed(0).padStart(3)}°, ${offset})`);
    }
    return;
  }

  if (args.deltaE) {
    let against: string;
    try {
      against = normalizeHex(args.deltaE);
    } catch {
      console.error(`Error: "${args.deltaE}" is not a valid hex color.`);
      process.exit(1);
    }
    const value = deltaE(seed, against, args.deltaMethod);
    console.log(`Delta-E   ${seed} vs ${against}`);
    console.log(`Method    ∆E${args.deltaMethod}`);
    console.log(`Value     ${formatDeltaE(value)}`);
    if (args.deltaMethod === "2000") {
      const result = checkDeltaE(seed, against);
      console.log(`Band      ${result.band}`);
      console.log(`Below JND ${result.belowJND ? "yes (< 2.3)" : "no (≥ 2.3)"}`);
    }
    return;
  }

  // ── Single-color manipulation (operates on the seed) ──
  if (args.mix || args.rotate !== null || args.complement || args.lighten !== null ||
      args.darken !== null || args.saturate !== null || args.desaturate !== null || args.invert) {
    let result = seed;
    if (args.lighten !== null) result = lighten(result, args.lighten);
    if (args.darken !== null) result = darken(result, args.darken);
    if (args.saturate !== null) result = saturate(result, args.saturate);
    if (args.desaturate !== null) result = desaturate(result, args.desaturate);
    if (args.rotate !== null) result = rotateHue(result, args.rotate);
    if (args.complement) result = complement(result);
    if (args.invert) result = invert(result);
    if (args.mix) {
      let other: string;
      try { other = normalizeHex(args.mix); } catch {
        console.error(`Error: "${args.mix}" is not a valid hex color.`);
        process.exit(1);
      }
      result = mixColors(seed, other, args.mixAmount);
      console.log(`Mix        ${seed} × ${other} @ ${args.mixAmount}`);
    }
    console.log(`Result     ${result}`);
    return;
  }

  // ── Palette-level utilities ──
  if (args.interpolate || args.reverse || args.gradient) {
    const base = generatePalette(seed, {
      distribution: args.distribution,
      hueShift: args.hueShift,
      chromaFalloff: args.chromaFalloff,
    });
    if (args.gradient) {
      console.log(paletteToGradient(base));
      return;
    }
    if (args.reverse) {
      console.log(`Reversed palette from ${seed}\n`);
      console.log(renderText(reversePalette(base)));
      return;
    }
    console.log(`Interpolated palette from ${seed} (21 steps)\n`);
    const dense = interpolatePalette(base);
    for (const [label, hex] of Object.entries(dense)) {
      console.log(`${label.padStart(4)}  ${hex}`);
    }
    return;
  }

  // ── Accessible pairs & matrix ──
  if (args.pairs || args.matrix) {
    const base = generatePalette(seed, {
      distribution: args.distribution,
      hueShift: args.hueShift,
      chromaFalloff: args.chromaFalloff,
    });
    if (args.pairs) {
      const pair = findAccessiblePair(base, args.level);
      if (!pair) {
        console.log(`No pair meets WCAG ${args.level} for seed ${seed}.`);
      } else {
        console.log(`Best WCAG ${args.level} pair from seed ${seed}`);
        console.log(`  fg ${pair.foreground} on bg ${pair.background}`);
        console.log(`  ratio ${pair.ratio.toFixed(2)}:1  APCA ${formatLc(pair.apcaLc)}`);
        console.log(`  passes AA ${pair.passesAA ? "YES" : "NO"}  AAA ${pair.passesAAA ? "YES" : "NO"}`);
      }
      return;
    }
    console.log(`Accessibility matrix for seed ${seed}\n`);
    const matrix = paletteAccessibilityMatrix(base);
    const stops = accessibleStops(base, args.level);
    console.log(`Stops passing WCAG ${args.level}: ${stops.length}/${matrix.length}\n`);
    for (const row of matrix) {
      console.log(
        `  ${String(row.stop).padStart(3)}  ${row.background}  black ${row.blackRatio.toFixed(2)}  white ${row.whiteRatio.toFixed(2)}  -> ${row.recommendedText}  [${row.band}]`
      );
    }
    return;
  }

  // ── WCAG 2.2 non-text contrast ──
  if (args.nontext) {
    const bg = args.nontextBg ? normalizeHex(args.nontextBg) : "#ffffff";
    const base = generatePalette(seed, {
      distribution: args.distribution,
      hueShift: args.hueShift,
      chromaFalloff: args.chromaFalloff,
    });
    console.log(`WCAG 2.2 non-text contrast (3:1) for seed ${seed} on ${bg}\n`);
    const rows = paletteNonTextMatrix(base, bg);
    const passing = rows.filter((r) => r.passes).length;
    console.log(`${passing}/${rows.length} stops pass as a UI component color on ${bg}\n`);
    for (const row of rows) {
      console.log(
        `  ${String(row.stop).padStart(3)}  ${row.color}  ${row.ratio.toFixed(2)}  ${row.passes ? "PASS" : "FAIL"}`
      );
    }
    return;
  }

  // ── Display-P3 wide-gamut output ──
  if (args.p3) {
    const base = generatePalette(seed, {
      distribution: args.distribution,
      hueShift: args.hueShift,
      chromaFalloff: args.chromaFalloff,
    });
    console.log(`Display-P3 palette for seed ${seed}\n`);
    for (const stop of getStops()) {
      const hex = base[stop];
      const info = analyzeGamut(hex);
      console.log(`  ${String(stop).padStart(3)}  ${hex}  ${info.p3String}`);
    }
    return;
  }

  if (args.cvd) {
    const previews = simulateAll(seed);
    console.log(`Color vision deficiency simulation for ${seed}\n`);
    for (const p of previews) {
      console.log(`${p.type.padEnd(16)} ${p.hex}`);
    }
    return;
  }

  if (args.theme) {
    const theme = generateTheme(seed, {
      distribution: args.distribution,
      hueShift: args.hueShift,
      chromaFalloff: args.chromaFalloff,
    });
    console.log(themeToCSS(theme, args.name));
    return;
  }

  const palette = generatePalette(seed, {
    distribution: args.distribution,
    hueShift: args.hueShift,
    chromaFalloff: args.chromaFalloff,
  });

  if (args.format === "text") {
    console.log(renderText(palette));
    return;
  }

  console.log(exportPalette(palette, args.format as never, args.name));
}

main();
