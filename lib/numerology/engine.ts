/**
 * Deterministic numerology engine — no AI, no randomness.
 * Given a phone number string, derive Vedic-style numerology attributes.
 */

export type Planet =
  | 'Sun'
  | 'Moon'
  | 'Jupiter'
  | 'Rahu'
  | 'Mercury'
  | 'Venus'
  | 'Ketu'
  | 'Saturn'
  | 'Mars'
  | 'None';

export interface NumerologyResult {
  /** Sum of all digits. */
  total: number;
  /** Single-digit reduction of total (bhagyank). 0 if no digits. */
  root: number;
  /** Ruling planet mapped from the root. */
  planet: Planet;
  /** Count of each digit 0-9 present in the number. */
  digitCounts: Record<string, number>;
  /** Digits 0-9 that never appear (Loshu grid gaps). */
  missingDigits: number[];
  /** Simple 0-100 auspiciousness heuristic. */
  luckScore: number;
  /** Short human-readable reading. */
  summary: string;
}

const PLANET_BY_ROOT: Record<number, Planet> = {
  1: 'Sun',
  2: 'Moon',
  3: 'Jupiter',
  4: 'Rahu',
  5: 'Mercury',
  6: 'Venus',
  7: 'Ketu',
  8: 'Saturn',
  9: 'Mars',
};

const PLANET_TRAIT: Record<Planet, string> = {
  Sun: 'authority, confidence and leadership',
  Moon: 'intuition, calm and emotional balance',
  Jupiter: 'wisdom, growth and good fortune',
  Rahu: 'ambition, sudden change and unconventional gains',
  Mercury: 'communication, intellect and business acumen',
  Venus: 'luxury, charm and relationships',
  Ketu: 'spirituality, detachment and insight',
  Saturn: 'discipline, patience and long-term reward',
  Mars: 'energy, courage and drive',
  None: 'a neutral influence',
};

/** Reduce a non-negative integer to a single digit (digital root). */
function reduceToSingle(n: number): number {
  let value = Math.abs(n);
  while (value > 9) {
    value = String(value)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return value;
}

export function analyze(input: string): NumerologyResult {
  const digits = (input ?? '').replace(/\D/g, '').split('').map(Number);

  const total = digits.reduce((sum, d) => sum + d, 0);
  const root = digits.length ? reduceToSingle(total) : 0;
  const planet = PLANET_BY_ROOT[root] ?? 'None';

  const digitCounts: Record<string, number> = {};
  for (let d = 0; d <= 9; d += 1) digitCounts[String(d)] = 0;
  digits.forEach((d) => {
    digitCounts[String(d)] += 1;
  });

  const missingDigits: number[] = [];
  for (let d = 0; d <= 9; d += 1) {
    if (digitCounts[String(d)] === 0) missingDigits.push(d);
  }

  const luckScore = computeLuckScore(input, root, digitCounts, missingDigits);
  const summary = buildSummary(planet, root, luckScore, digits.length);

  return { total, root, planet, digitCounts, missingDigits, luckScore, summary };
}

/** Roots considered more auspicious in common practice. */
const FAVORABLE_ROOTS = new Set([1, 3, 5, 6, 9]);

function computeLuckScore(
  input: string,
  root: number,
  digitCounts: Record<string, number>,
  missingDigits: number[],
): number {
  let score = 50;

  // Ruling-planet influence.
  if (FAVORABLE_ROOTS.has(root)) score += 12;
  else if (root === 0) score -= 10;
  else score -= 4;

  // Completeness: more distinct digits present => richer grid.
  const present = 10 - missingDigits.length;
  score += (present - 5) * 2;

  // Repeating digits signal a "fancy" number.
  const maxRepeat = Math.max(0, ...Object.values(digitCounts));
  if (maxRepeat >= 4) score += 15;
  else if (maxRepeat === 3) score += 10;
  else if (maxRepeat === 2) score += 5;

  const compact = (input ?? '').replace(/\D/g, '');

  // Auspicious sequences.
  if (compact.includes('786')) score += 10;
  if (/(\d)\1{2,}/.test(compact)) score += 5; // triple+ run of same digit
  if (/(012|123|234|345|456|567|678|789)/.test(compact)) score += 5; // ascending run

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildSummary(
  planet: Planet,
  root: number,
  luckScore: number,
  digitLength: number,
): string {
  if (digitLength === 0) {
    return 'Enter a number to see its numerology reading.';
  }
  const band =
    luckScore >= 80 ? 'highly auspicious' :
    luckScore >= 60 ? 'favorable' :
    luckScore >= 40 ? 'balanced' :
    'challenging';

  return `Bhagyank ${root} is ruled by ${planet}, bringing ${PLANET_TRAIT[planet]}. Overall this number reads as ${band} (luck score ${luckScore}/100).`;
}
