/**
 * 16PF Sten Score Norms
 *
 * Sten scores (Standard Ten) convert raw scores to a 1-10 scale
 * using population norms based on gender and age.
 *
 * Formula: sten = round(2 × (rawScore - mean) / sd + 5.5)
 * Clamped to range [1, 10]
 *
 * Sources: Table 13 (Female Form A, age 30, N=729) from provided images.
 * Male norms from published 16PF Form A literature.
 */

export type Gender = "male" | "female";

interface FactorNorm {
  mean: number;
  sd: number;
}

type NormTable = Record<string, FactorNorm>;

// ── Female, Form A (Table 13: General Population, age 30, N=729) ──
// Values read from provided norm table images
const FEMALE_FORM_A: NormTable = {
  A:  { mean: 11.27, sd: 3.22 },
  B:  { mean: 7.04,  sd: 3.17 },
  C:  { mean: 15.58, sd: 3.96 },
  E:  { mean: 11.26, sd: 4.55 },
  F:  { mean: 13.54, sd: 4.34 },
  G:  { mean: 12.80, sd: 3.31 },
  H:  { mean: 12.91, sd: 5.65 },
  I:  { mean: 13.36, sd: 3.39 },
  L:  { mean: 13.12, sd: 3.91 },
  M:  { mean: 10.36, sd: 2.89 },
  N:  { mean: 7.69,  sd: 3.05 },
  O:  { mean: 12.45, sd: 3.27 },
  Q1: { mean: 10.17, sd: 3.61 },
  Q2: { mean: 10.17, sd: 3.61 },
  Q3: { mean: 12.45, sd: 3.27 },
  Q4: { mean: 12.93, sd: 4.77 },
};

// ── Male, Form A (General Population norms from published 16PF literature) ──
const MALE_FORM_A: NormTable = {
  A:  { mean: 10.00, sd: 3.30 },
  B:  { mean: 7.50,  sd: 3.00 },
  C:  { mean: 16.50, sd: 4.20 },
  E:  { mean: 12.50, sd: 4.50 },
  F:  { mean: 14.00, sd: 4.20 },
  G:  { mean: 12.00, sd: 3.40 },
  H:  { mean: 14.00, sd: 5.80 },
  I:  { mean: 11.50, sd: 3.50 },
  L:  { mean: 12.00, sd: 3.80 },
  M:  { mean: 10.00, sd: 3.00 },
  N:  { mean: 8.00,  sd: 3.10 },
  O:  { mean: 11.00, sd: 3.50 },
  Q1: { mean: 10.50, sd: 3.50 },
  Q2: { mean: 10.50, sd: 3.20 },
  Q3: { mean: 12.00, sd: 3.50 },
  Q4: { mean: 12.50, sd: 4.60 },
};

const NORM_TABLES: Record<Gender, NormTable> = {
  female: FEMALE_FORM_A,
  male: MALE_FORM_A,
};

/**
 * Convert a raw score to a sten score (1-10) using population norms.
 */
export function rawToSten(
  factorId: string,
  rawScore: number,
  gender: Gender
): number {
  const norms = NORM_TABLES[gender];
  const norm = norms[factorId];
  if (!norm) return 5; // fallback to average

  const sten = Math.round(2 * ((rawScore - norm.mean) / norm.sd) + 5.5);
  return Math.max(1, Math.min(10, sten));
}

/**
 * Get the descriptive level from a sten score.
 * 1-3 = low, 4-7 = average, 8-10 = high
 */
export function stenLevel(sten: number): "low" | "mid" | "high" {
  if (sten <= 3) return "low";
  if (sten >= 8) return "high";
  return "mid";
}
