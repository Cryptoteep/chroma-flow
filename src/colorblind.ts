/**
 * chroma-flow — color vision deficiency (CVD) simulation
 * Approximates how a color appears to viewers with common CVDs.
 *
 * Uses the Machado et al. (2009) simulation matrices applied in sRGB space.
 * These are approximations intended for design previewing, not clinical use.
 *
 * @license MIT
 */

import type { CVDPreview, CVDType } from "./types";
import { clamp, hexToRGB, rgbToHex } from "./srgb";

/**
 * 3x3 simulation matrices (Machado et al. 2009, severity = 1.0)
 * applied directly to normalized sRGB channels.
 */
const CVD_MATRICES: Record<CVDType, number[]> = {
  protanopia: [
    0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882,
    -0.048116, 1.051998,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182,
    0.04294, 0.968881,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733,
    0.691367, 0.3039,
  ],
  // Achromatopsia: luminance (Rec. 601) projected into all channels.
  achromatopsia: [
    0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114,
  ],
};

function transform(matrix: number[], rgb: {
  r: number;
  g: number;
  b: number;
}) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  return {
    r: clamp(matrix[0] * r + matrix[1] * g + matrix[2] * b, 0, 1) * 255,
    g: clamp(matrix[3] * r + matrix[4] * g + matrix[5] * b, 0, 1) * 255,
    b: clamp(matrix[6] * r + matrix[7] * g + matrix[8] * b, 0, 1) * 255,
  };
}

/** Simulate how a hex color appears under a specific CVD. */
export function simulateCVD(hex: string, type: CVDType): string {
  const rgb = hexToRGB(hex);
  const out = transform(CVD_MATRICES[type], rgb);
  return rgbToHex({ r: out.r, g: out.g, b: out.b });
}

/** Simulate a hex color across all supported CVDs at once. */
export function simulateAll(hex: string): CVDPreview[] {
  const types: CVDType[] = [
    "protanopia",
    "deuteranopia",
    "tritanopia",
    "achromatopsia",
  ];
  return types.map((type) => ({
    type,
    original: hex,
    hex: simulateCVD(hex, type),
  }));
}

/**
 * Score how distinguishable two colors remain under each CVD.
 * Returns 0 (identical) to 1 (fully distinguishable) per type.
 */
export function distinguishability(a: string, b: string): {
  type: CVDType;
  score: number;
}[] {
  return simulateAll(a).map((previewA) => {
    const previewBHex = simulateCVD(b, previewA.type);
    const ra = hexToRGB(previewA.hex);
    const rb = hexToRGB(previewBHex);
    const dist =
      Math.sqrt(
        (ra.r - rb.r) ** 2 + (ra.g - rb.g) ** 2 + (ra.b - rb.b) ** 2
      ) / 441.673; // max possible distance
    return { type: previewA.type, score: dist };
  });
}
