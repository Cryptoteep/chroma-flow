/**
 * chroma-flow — Delta-E ∆E2000 color difference
 * The CIEDE2000 formula, the most perceptually accurate color-difference
 * metric. Computes the perceived distance between two colors in Lab space
 * with compensation for lightness, chroma, and hue interactions.
 *
 * Based on the CIEDE2000 reference implementation (Sharma, Wu, Dalal, 2005).
 *
 * @license MIT
 */

import type { DeltaEResult } from "./types";
import { hexToRGB } from "./srgb";

// ── sRGB → CIE Lab (D65) ────────────────────────────────────

function srgbToXYZ({ r, g, b }: { r: number; g: number; b: number }) {
  const decode = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const R = decode(r);
  const G = decode(g);
  const B = decode(b);
  // sRGB → XYZ (D65), then scale by 100.
  return {
    x: (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) * 100,
    y: (0.2126729 * R + 0.7151522 * G + 0.0721750 * B) * 100,
    z: (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) * 100,
  };
}

const D65 = { x: 95.047, y: 100.0, z: 108.883 };

function xyzToLab({ x, y, z }: { x: number; y: number; z: number }) {
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (903.3 * t + 16) / 116);
  const fx = f(x / D65.x);
  const fy = f(y / D65.y);
  const fz = f(z / D65.z);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function hexToLab(hex: string) {
  return xyzToLab(srgbToXYZ(hexToRGB(hex)));
}

/** Degrees → radians. */
const rad = (d: number) => (d * Math.PI) / 180;
/** Radians → degrees. */
const deg = (r: number) => (r * 180) / Math.PI;

/**
 * Compute the CIEDE2000 (∆E2000) color difference between two hex colors.
 *
 * Returns 0 for identical colors. Typical reference points:
 *   - < 1.0   : not perceptible to most viewers
 *   - ~2.3    : just-noticeable difference (JND)
 *   - ~5      : clearly noticeable
 *   - > 10    : very different
 *
 * @license MIT (based on Sharma et al. 2005 reference)
 */
export function deltaE2000(a: string, b: string): number {
  const lab1 = hexToLab(a);
  const lab2 = hexToLab(b);
  const { l: L1, a: a1, b: b1 } = lab1;
  const { l: L2, a: a2, b: b2 } = lab2;

  // Step 1: calculate C', h'
  const kL = 1;
  const kC = 1;
  const kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;

  const Cbar7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7))));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = b1 === 0 && a1p === 0 ? 0 : deg(Math.atan2(b1, a1p)) + (deg(Math.atan2(b1, a1p)) < 0 ? 360 : 0);
  const h2p = b2 === 0 && a2p === 0 ? 0 : deg(Math.atan2(b2, a2p)) + (deg(Math.atan2(b2, a2p)) < 0 ? 360 : 0);

  // Step 2: calculate ∆L', ∆C', ∆H'
  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else {
    const diff = h2p - h1p;
    if (Math.abs(diff) <= 180) dhp = diff;
    else if (diff > 180) dhp = diff - 360;
    else dhp = diff + 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2));

  // Step 3: calculate the CIEDE2000 ∆E00
  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hBar: number;
  if (C1p * C2p === 0) {
    hBar = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hBar = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hBar = (h1p + h2p + 360) / 2;
  } else {
    hBar = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(rad(hBar - 30)) +
    0.24 * Math.cos(rad(2 * hBar)) +
    0.32 * Math.cos(rad(3 * hBar + 6)) -
    0.20 * Math.cos(rad(4 * hBar - 63));

  const dTheta = 30 * Math.exp(-Math.pow((hBar - 275) / 25, 2));
  const Cbarp7 = Math.pow(Cbarp, 7);
  const RC = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
  const SC = 1 + 0.045 * Cbarp;
  const SH = 1 + 0.015 * Cbarp * T;
  const RT = -Math.sin(rad(2 * dTheta)) * RC;

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
      Math.pow(dCp / (kC * SC), 2) +
      Math.pow(dHp / (kH * SH), 2) +
      RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}

/**
 * Compute the CIE76 (∆E76) color difference — the original, simplest metric.
 * This is the straight Euclidean distance between the two colors in CIE Lab
 * space: √((ΔL)² + (Δa)² + (Δb)²).
 *
 * It is less perceptually accurate than ∆E94 or ∆E2000 (it overestimates
 * differences in saturated colors), but is fast and still widely used as a
 * baseline.
 *
 * @license MIT
 */
export function deltaE76(a: string, b: string): number {
  const lab1 = hexToLab(a);
  const lab2 = hexToLab(b);
  const dL = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Compute the CIE94 (∆E94) color difference — an improvement over ∆E76 that
 * weights lightness, chroma, and hue differences to better match perception.
 * Uses the graphic-arts parametric weighting factors (kL=1, kC=1, kH=1,
 * K1=0.045, K2=0.015).
 *
 * @license MIT
 */
export function deltaE94(a: string, b: string): number {
  const lab1 = hexToLab(a);
  const lab2 = hexToLab(b);
  const { l: L1, a: a1, b: b1 } = lab1;
  const { l: L2, a: a2, b: b2 } = lab2;

  const dL = L1 - L2;
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const dC = C1 - C2;
  const da = a1 - a2;
  const db = b1 - b2;
  // ΔH² = Δa² + Δb² − ΔC²  (clamped to ≥ 0)
  const dH2 = Math.max(0, da * da + db * db - dC * dC);

  const SL = 1;
  const SC = 1 + 0.045 * C1;
  const SH = 1 + 0.015 * C1;

  return Math.sqrt(
    Math.pow(dL / SL, 2) + Math.pow(dC / SC, 2) + dH2 / (SH * SH)
  );
}

/** All supported ∆E methods. */
export type DeltaEMethod = "76" | "94" | "2000";

/**
 * Compute the ∆E color difference using the requested method
 * ("76" | "94" | "2000"). Defaults to "2000" (most perceptually accurate).
 */
export function deltaE(a: string, b: string, method: DeltaEMethod = "2000"): number {
  switch (method) {
    case "76":
      return deltaE76(a, b);
    case "94":
      return deltaE94(a, b);
    case "2000":
    default:
      return deltaE2000(a, b);
  }
}

/** Classify a ∆E value into a human-readable perceptual band. */
function bandFor(deltaE: number): DeltaEResult["band"] {
  if (deltaE < 1) return "indistinguishable";
  if (deltaE < 2.3) return "barely noticeable";
  if (deltaE < 5) return "noticeable";
  if (deltaE < 10) return "clearly different";
  return "very different";
}

/**
 * Full ∆E2000 difference check with a human-readable band and JND flag.
 */
export function checkDeltaE(a: string, b: string): DeltaEResult {
  const deltaE = deltaE2000(a, b);
  return {
    a,
    b,
    deltaE,
    band: bandFor(deltaE),
    belowJND: deltaE < 2.3,
  };
}

/** Format a ∆E value for display: `3.45 → "∆E 3.45"`. */
export function formatDeltaE(deltaE: number): string {
  return `∆E ${deltaE.toFixed(2)}`;
}

/**
 * Find the closest color in a list to a target, using the requested ∆E method
 * (default ∆E2000). Returns the hex of the nearest match and the ∆E.
 */
export function nearestColor(
  target: string,
  candidates: string[],
  method: DeltaEMethod = "2000"
): { hex: string; deltaE: number } {
  let best = { hex: candidates[0] ?? "#000000", deltaE: Infinity };
  for (const c of candidates) {
    const d = deltaE(target, c, method);
    if (d < best.deltaE) best = { hex: c, deltaE: d };
  }
  return best;
}
