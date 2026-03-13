import { FACTORS, SCORING_MAP, Factor } from "./questions";

export interface FactorScore {
  factor: Factor;
  rawScore: number;
  maxScore: number;
  percentage: number;   // 0–100
  level: "low" | "mid" | "high";
  interpretation: string;
}

export function computeScores(answers: (number | null)[]): FactorScore[] {
  // Accumulate raw scores per factor
  const totals: Record<string, { sum: number; max: number }> = {};
  FACTORS.forEach((f) => {
    totals[f.id] = { sum: 0, max: 0 };
  });

  Object.entries(SCORING_MAP).forEach(([qidStr, { factor, reverse }]) => {
    const qid = parseInt(qidStr, 10);
    const ans = answers[qid - 1]; // answers array is 0-indexed
    if (ans === null) return;

    totals[factor].max += 2;

    // a=0 → score 2, b=1 → score 1, c=2 → score 0 (or reversed)
    let score = 2 - ans; // default: a=2, b=1, c=0
    if (reverse) score = ans; // reversed: a=0, b=1, c=2

    totals[factor].sum += score;
  });

  return FACTORS.map((factor): FactorScore => {
    const { sum, max } = totals[factor.id];
    const pct = max > 0 ? Math.round((sum / max) * 100) : 50;
    const level: "low" | "mid" | "high" = pct < 35 ? "low" : pct > 65 ? "high" : "mid";

    const interpretations: Record<string, Record<"low" | "mid" | "high", string>> = {
      A: {
        low: "You tend to be more reserved and prefer your own company. You may be more comfortable with tasks than with people.",
        mid: "You balance sociability with independence comfortably.",
        high: "You are warm, caring, and genuinely enjoy being around others. You form close bonds easily.",
      },
      B: {
        low: "You tend toward concrete, practical thinking and prefer hands-on problem solving.",
        mid: "You show a balance of practical and abstract thinking.",
        high: "You are analytically sharp and enjoy abstract reasoning and complex problems.",
      },
      C: {
        low: "You may be emotionally reactive, finding it hard to cope with stress and frustration.",
        mid: "You generally handle emotions and stress reasonably well.",
        high: "You are emotionally mature and stable, handling stress with calm and composure.",
      },
      E: {
        low: "You tend to be cooperative and deferential, preferring to follow rather than lead.",
        mid: "You balance assertiveness with cooperation depending on context.",
        high: "You are assertive and dominant, naturally taking charge in situations.",
      },
      F: {
        low: "You tend to be serious, reserved, and thoughtful rather than spontaneous.",
        mid: "You are moderately expressive and can be both serious and playful.",
        high: "You are enthusiastic, lively, and spontaneous — energizing those around you.",
      },
      G: {
        low: "You tend to be flexible with rules and may bend them when convenient.",
        mid: "You follow rules as a guide but allow for context and exceptions.",
        high: "You are conscientious, disciplined, and take duties and moral standards seriously.",
      },
      H: {
        low: "You tend to be socially timid or shy, preferring smaller or familiar settings.",
        mid: "You are moderately comfortable in social situations.",
        high: "You are socially bold, confident, and comfortable in challenging social situations.",
      },
      I: {
        low: "You are practical, tough-minded, and self-reliant.",
        mid: "You balance practicality with sensitivity.",
        high: "You are sensitive, empathetic, and emotionally perceptive.",
      },
      L: {
        low: "You are trusting and easy-going, readily accepting others' motives at face value.",
        mid: "You have a balanced level of trust and skepticism.",
        high: "You are vigilant and questioning, cautious about others' intentions.",
      },
      M: {
        low: "You are practical and conventional, focused on what's real and concrete.",
        mid: "You balance imagination with practicality.",
        high: "You are imaginative and idealistic, sometimes lost in thoughts and ideas.",
      },
      N: {
        low: "You are forthright and open, sharing your thoughts and feelings freely.",
        mid: "You share selectively depending on context.",
        high: "You are private and guarded, preferring not to reveal much about yourself.",
      },
      O: {
        low: "You are confident and self-assured, rarely troubled by self-doubt.",
        mid: "You experience moderate levels of self-doubt and worry.",
        high: "You tend toward worry, self-criticism, and feelings of apprehension.",
      },
      Q1: {
        low: "You respect tradition and prefer proven, established approaches.",
        mid: "You balance innovation and tradition comfortably.",
        high: "You are open to change, receptive to new ideas and experimental approaches.",
      },
      Q2: {
        low: "You prefer working with others and enjoy group activities.",
        mid: "You are comfortable both working alone and with others.",
        high: "You are self-reliant and prefer making decisions and working independently.",
      },
      Q3: {
        low: "You are flexible and relaxed about standards, less driven by perfectionism.",
        mid: "You maintain moderate standards without being overly controlling.",
        high: "You are precise, organized, and set high standards for yourself.",
      },
      Q4: {
        low: "You are relaxed and patient, rarely feeling driven or pressured.",
        mid: "You experience moderate levels of tension.",
        high: "You tend to feel driven, impatient, or frustrated — often under inner pressure.",
      },
    };

    return {
      factor,
      rawScore: sum,
      maxScore: max,
      percentage: pct,
      level,
      interpretation: interpretations[factor.id]?.[level] ?? "",
    };
  });
}
