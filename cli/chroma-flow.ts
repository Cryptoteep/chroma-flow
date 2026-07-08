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
  type HarmonyScheme,
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
      --delta-e <hex>    compute ∆E2000 color difference between the seed and a color
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
  chroma-flow "#10b981" --contrast "#ffffff"
  chroma-flow "#10b981" --apca "#ffffff"
  chroma-flow "#6366f1" --harmony triadic
  chroma-flow "#6366f1" --delta-e "#5b5cf0"
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

  if (!args.seed) {
    console.error("Error: a seed hex color is required.\n");
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
    const result = checkDeltaE(seed, against);
    console.log(`Delta-E   ${result.a} vs ${result.b}`);
    console.log(`∆E2000    ${formatDeltaE(result.deltaE)}`);
    console.log(`Band      ${result.band}`);
    console.log(`Below JND ${result.belowJND ? "yes (< 2.3)" : "no (≥ 2.3)"}`);
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
