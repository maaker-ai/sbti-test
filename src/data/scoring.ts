import { dimensionMeta, dimensionOrder, DIM_EXPLANATIONS } from './dimensions';
import { questions, type Question } from './questions';
import { TYPE_LIBRARY, NORMAL_TYPES, type PersonalityType } from './types';

export type Level = 'L' | 'M' | 'H';

export interface RankedType extends PersonalityType {
  pattern: string;
  distance: number;
  exact: number;
  similarity: number;
}

export interface TestResult {
  rawScores: Record<string, number>;
  levels: Record<string, Level>;
  ranked: RankedType[];
  bestNormal: RankedType;
  finalType: PersonalityType;
  modeKicker: string;
  badge: string;
  sub: string;
  special: boolean;
  secondaryType: RankedType | null;
}

function sumToLevel(score: number): Level {
  if (score <= 3) return 'L';
  if (score === 4) return 'M';
  return 'H';
}

function levelNum(level: string): number {
  return { L: 1, M: 2, H: 3 }[level] ?? 2;
}

function parsePattern(pattern: string): string[] {
  return pattern.replace(/-/g, '').split('');
}

export function computeResult(answers: Record<string, number>): TestResult {
  const rawScores: Record<string, number> = {};
  const levels: Record<string, Level> = {};

  Object.keys(dimensionMeta).forEach((dim) => {
    rawScores[dim] = 0;
  });

  questions.forEach((q: Question) => {
    rawScores[q.dim] += Number(answers[q.id] || 0);
  });

  Object.entries(rawScores).forEach(([dim, score]) => {
    levels[dim] = sumToLevel(score);
  });

  const userVector = dimensionOrder.map((dim) => levelNum(levels[dim]));

  const ranked: RankedType[] = NORMAL_TYPES.map((type) => {
    const vector = parsePattern(type.pattern).map(levelNum);
    let distance = 0;
    let exact = 0;
    for (let i = 0; i < vector.length; i++) {
      const diff = Math.abs(userVector[i] - vector[i]);
      distance += diff;
      if (diff === 0) exact += 1;
    }
    const similarity = Math.max(0, Math.round((1 - distance / 30) * 100));
    return {
      ...type,
      ...TYPE_LIBRARY[type.code],
      distance,
      exact,
      similarity,
    };
  }).sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return b.similarity - a.similarity;
  });

  const bestNormal = ranked[0];
  const drunkTriggered = answers['drink_gate_q2'] === 2;

  let finalType: PersonalityType;
  let modeKicker = '你的主类型';
  let badge = `匹配度 ${bestNormal.similarity}% · 精准命中 ${bestNormal.exact}/15 维`;
  let sub = '维度命中度较高，当前结果可视为你的第一人格画像。';
  let special = false;
  let secondaryType: RankedType | null = null;

  if (drunkTriggered) {
    finalType = TYPE_LIBRARY.DRUNK;
    secondaryType = bestNormal;
    modeKicker = '隐藏人格已激活';
    badge = '匹配度 100% · 酒精异常因子已接管';
    sub = '乙醇亲和性过强，系统已直接跳过常规人格审判。';
    special = true;
  } else if (bestNormal.similarity < 60) {
    finalType = TYPE_LIBRARY.HHHH;
    modeKicker = '系统强制兜底';
    badge = `标准人格库最高匹配仅 ${bestNormal.similarity}%`;
    sub = '标准人格库对你的脑回路集体罢工了，于是系统把你强制分配给了 HHHH。';
    special = true;
  } else {
    finalType = bestNormal;
  }

  return {
    rawScores,
    levels,
    ranked,
    bestNormal,
    finalType,
    modeKicker,
    badge,
    sub,
    special,
    secondaryType,
  };
}

export function encodeResult(answers: Record<string, number>): string {
  const entries = Object.entries(answers)
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
  return btoa(entries);
}

export function decodeResult(encoded: string): Record<string, number> | null {
  try {
    const decoded = atob(encoded);
    const answers: Record<string, number> = {};
    decoded.split(',').forEach((pair) => {
      const [key, val] = pair.split(':');
      if (key && val) {
        answers[key] = Number(val);
      }
    });
    return answers;
  } catch {
    return null;
  }
}

// Compact share URL encoding: type.similarity.exact.levels.rawScores
// e.g. "DRUNK.85.10.LMH-HMM-MLH-HHH-MHL.234-342-231-312-123"
export function encodeShareUrl(result: TestResult): string {
  const levels = [];
  const scores = [];
  for (let i = 0; i < dimensionOrder.length; i += 3) {
    levels.push(dimensionOrder.slice(i, i + 3).map(d => result.levels[d]).join(''));
    scores.push(dimensionOrder.slice(i, i + 3).map(d => result.rawScores[d]).join(''));
  }
  const parts = [
    result.finalType.code,
    result.special && result.secondaryType
      ? `${result.secondaryType.similarity}.${result.secondaryType.exact}`
      : `${(result.finalType as RankedType).similarity ?? 0}.${(result.finalType as RankedType).exact ?? 0}`,
    levels.join('-'),
    scores.join('-'),
    result.special ? (result.secondaryType ? 'D' : 'H') : '',
  ].filter(Boolean);
  return parts.join('.');
}

export function decodeShareUrl(encoded: string): TestResult | null {
  try {
    const parts = encoded.split('.');
    if (parts.length < 4) return null;

    const typeCode = parts[0];
    const similarity = Number(parts[1]);
    const exact = Number(parts[2]);
    const levelGroups = parts[3].split('-');
    const scoreGroups = parts[4].split('-');
    const specialFlag = parts[5] || '';

    const levels: Record<string, Level> = {};
    const rawScores: Record<string, number> = {};
    dimensionOrder.forEach((dim, i) => {
      const groupIdx = Math.floor(i / 3);
      const inGroupIdx = i % 3;
      levels[dim] = (levelGroups[groupIdx]?.[inGroupIdx] || 'M') as Level;
      rawScores[dim] = Number(scoreGroups[groupIdx]?.[inGroupIdx] || 0);
    });

    const isSpecial = specialFlag === 'D' || specialFlag === 'H';
    const isDrunk = specialFlag === 'D';

    let finalType: PersonalityType;
    let modeKicker: string;
    let badge: string;
    let sub: string;
    let secondaryType: RankedType | null = null;

    if (isDrunk) {
      finalType = TYPE_LIBRARY.DRUNK;
      modeKicker = '隐藏人格已激活';
      badge = '匹配度 100% · 酒精异常因子已接管';
      sub = '乙醇亲和性过强，系统已直接跳过常规人格审判。';
      // Find the secondary type from NORMAL_TYPES
      const matchedType = NORMAL_TYPES.find(t => t.code === typeCode) ||
        NORMAL_TYPES.find(t => {
          const vector = parsePattern(t.pattern).map(levelNum);
          const userVector = dimensionOrder.map(d => levelNum(levels[d]));
          let dist = 0;
          for (let i = 0; i < vector.length; i++) dist += Math.abs(userVector[i] - vector[i]);
          return Math.max(0, Math.round((1 - dist / 30) * 100)) === similarity;
        });
      if (matchedType) {
        secondaryType = { ...matchedType, ...TYPE_LIBRARY[matchedType.code], distance: 0, exact, similarity };
      }
    } else if (specialFlag === 'H') {
      finalType = TYPE_LIBRARY.HHHH;
      modeKicker = '系统强制兜底';
      badge = `标准人格库最高匹配仅 ${similarity}%`;
      sub = '标准人格库对你的脑回路集体罢工了，于是系统把你强制分配给了 HHHH。';
    } else {
      finalType = TYPE_LIBRARY[typeCode] || TYPE_LIBRARY.HHHH;
      modeKicker = '你的主类型';
      badge = `匹配度 ${similarity}% · 精准命中 ${exact}/15 维`;
      sub = '维度命中度较高，当前结果可视为你的第一人格画像。';
    }

    // Build a minimal bestNormal
    const bestNormalCode = isDrunk ? (secondaryType?.code || typeCode) : typeCode;
    const libEntry = TYPE_LIBRARY[bestNormalCode] ?? { code: bestNormalCode, cn: '', intro: '', desc: '' };
    const bestNormal: RankedType = Object.assign({}, libEntry, {
      pattern: '',
      distance: 0,
      exact,
      similarity,
    });

    return {
      rawScores,
      levels,
      ranked: [bestNormal],
      bestNormal,
      finalType,
      modeKicker,
      badge,
      sub,
      special: isSpecial,
      secondaryType,
    };
  } catch {
    return null;
  }
}

export { dimensionMeta, dimensionOrder, DIM_EXPLANATIONS };
