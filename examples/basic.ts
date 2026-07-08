/**
 * chroma-flow — basic example
 * Run with: `npx tsx examples/basic.ts`
 *
 * @license MIT
 */

import {
  generatePalette,
  exportPalette,
  checkContrast,
  suggestTextColor,
  simulateAll,
} from "../src/index";

const seed = "#6366f1";

// 1. Generate a full 50–950 palette.
const palette = generatePalette(seed);
console.log("Palette generated from", seed);
for (const [stop, hex] of Object.entries(palette)) {
  console.log(`  ${stop.padStart(3)}  ${hex}`);
}

// 2. Export it.
console.log("\n--- CSS export ---");
console.log(exportPalette(palette, "css", "primary"));

// 3. Check contrast.
const fg = suggestTextColor(palette[600]);
const contrast = checkContrast(fg, palette[600]);
console.log("--- Contrast ---");
console.log(
  `${fg} on ${palette[600]} → ${contrast.ratio.toFixed(2)}:1  (AA normal: ${contrast.passesAANormal ? "PASS" : "FAIL"})`
);

// 4. Color-blind preview of the 500 stop.
console.log("\n--- CVD simulation of", palette[500], "---");
for (const preview of simulateAll(palette[500])) {
  console.log(`  ${preview.type.padEnd(16)} ${preview.hex}`);
}
