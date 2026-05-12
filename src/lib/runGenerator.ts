import type {
  Exercise,
  GeneratorSpec,
  IntegerOp,
  IntegerSeriesSpec,
  NumberExercise,
  RoundingExercise,
  RoundingSeriesSpec,
  RoundingType,
} from '@/types';
import { generateLiteralSeries, generateLiteralComplexSeries } from './generators/literal';
import { generateProduitSeries } from './generators/produit';
import { generateArithSeries } from './generators/arith';
import { generateProgrammeSeries } from './generators/programme';
import { generatePythagoreSeries } from './generators/pythagore';
import { generateThalesSeries } from './generators/thales';
import { generateFractionsSeries, generateFractionsComplexSeries } from './generators/fractions';
import { generateFractionsCompSeries } from './generators/fractions-comp';
import { generateEquationsSeries } from './generators/equations';
import { generateReciproqueSeries } from './generators/reciproque';
import { generatePuissancesSeries } from './generators/puissances';
import { generatePropSeries } from './generators/prop';
import { generateEntierComplexSeries } from './generators/entiers-complex';

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const randNZ = (a: number, b: number) => {
  let v = 0;
  while (v === 0) v = randInt(a, b);
  return v;
};

function makeIntegerExercise(spec: IntegerSeriesSpec): NumberExercise {
  const a = randNZ(spec.range[0], spec.range[1]);
  const b = randNZ(spec.range[0], spec.range[1]);
  const absA = Math.abs(a);
  const absB = Math.abs(b);
  const ok = (n: number) => `<strong style="color:var(--correct)">${n}</strong>`;

  if (spec.op === 'add') {
    const ans = a + b;
    if (b < 0) {
      // Rewrite a + (−|b|) as a − |b| to avoid double-sign display
      const expr = `${a} - ${absB}`;
      let steps: string;
      if (a < 0) {
        steps = `Les deux termes sont négatifs : −(${absA} + ${absB}) = ${ok(ans)}`;
      } else if (a > absB) {
        steps = `${a} > ${absB}, résultat positif : ${a} − ${absB} = ${ok(ans)}`;
      } else if (absB > a) {
        steps = `${absB} > ${a}, résultat négatif : −(${absB} − ${a}) = ${ok(ans)}`;
      } else {
        steps = `${a} = ${absB}, les termes s'annulent → ${ok(0)}`;
      }
      return { expr, ans, type: 'add', steps };
    }
    // b > 0
    const expr = `${a} + ${b}`;
    let steps: string;
    if (a >= 0) {
      steps = `${a} + ${b} = ${ok(ans)}`;
    } else if (b > absA) {
      steps = `${b} > ${absA}, résultat positif : ${b} − ${absA} = ${ok(ans)}`;
    } else if (absA > b) {
      steps = `${absA} > ${b}, résultat négatif : −(${absA} − ${b}) = ${ok(ans)}`;
    } else {
      steps = `${b} = ${absA}, les termes s'annulent → ${ok(0)}`;
    }
    return { expr, ans, type: 'add', steps };
  }

  if (spec.op === 'sub') {
    const ans = a - b;
    const expr = `${a} - ${b > 0 ? b : `(${b})`}`;
    let steps: string;
    if (b < 0) {
      steps = `Deux signes − consécutifs donnent + : ${a} − (${b}) = ${a} + ${absB} = ${ok(ans)}`;
    } else if (a > 0 && a > b) {
      steps = `${a} > ${b}, résultat positif : ${a} − ${b} = ${ok(ans)}`;
    } else if (a >= 0) {
      steps = `${b} > ${a}, résultat négatif : −(${b} − ${a}) = ${ok(ans)}`;
    } else {
      steps = `${a} − ${b} : les deux termes rendent le résultat négatif → ${ok(ans)}`;
    }
    return { expr, ans, type: 'sub', steps };
  }

  // mul
  const ea = a < 0 ? `(${a})` : `${a}`;
  const eb = b < 0 ? `(${b})` : `${b}`;
  const ans = a * b;
  let steps: string;
  if (a < 0 && b < 0) {
    steps = `Signes identiques (− et −) → résultat positif. ${absA} × ${absB} = ${ok(ans)}`;
  } else if (a > 0 && b > 0) {
    steps = `${absA} × ${absB} = ${ok(ans)}`;
  } else {
    steps = `Signes contraires → résultat négatif. ${absA} × ${absB} = ${absA * absB}, donc ${ea} × ${eb} = ${ok(ans)}`;
  }
  return { expr: `${ea} × ${eb}`, ans, type: 'mul', steps };
}

const ROUNDING_POS_NAMES = [
  'dixièmes',
  'centièmes',
  'millièmes',
  'dix-millièmes',
  'cent-millièmes',
] as const;

const ROUNDING_DECIMALS: Record<RoundingType, number> = { dix: 1, cent: 2, mill: 3 };
const ROUNDING_LABELS: Record<RoundingType, string> = {
  dix: 'au dixième',
  cent: 'au centième',
  mill: 'au millième',
};
const ROUNDING_COLORS: Record<RoundingType, string> = {
  dix: '#F472B6',
  cent: '#c084fc',
  mill: '#818cf8',
};

const formatNum = (x: number) => x.toFixed(5).replace('.', ',');
const formatAns = (x: number, decimals: number) => x.toFixed(decimals).replace('.', ',');
const roundTo = (x: number, decimals: number) => {
  const f = Math.pow(10, decimals);
  return Math.round(x * f) / f;
};

function roundingExplain(num: number, type: RoundingType, isTrap: boolean): string {
  const dec = num.toFixed(5).split('.')[1]!;
  const lookIdx = type === 'dix' ? 0 : type === 'cent' ? 1 : 2;
  const checkIdx = lookIdx + 1;
  const roundDigit = parseInt(dec[checkIdx]!, 10);
  const keepDigit = parseInt(dec[lookIdx]!, 10);

  if (isTrap) {
    let out = `Le chiffre des ${ROUNDING_POS_NAMES[checkIdx]} est <strong>${roundDigit}</strong> ≥ 5, donc on arrondit à la valeur supérieure.`;
    if (keepDigit === 9) {
      out += ` Attention : le chiffre des ${ROUNDING_POS_NAMES[lookIdx]} est <strong>9</strong>, la retenue se propage vers la gauche.`;
    }
    return out;
  }
  return `Le chiffre des ${ROUNDING_POS_NAMES[checkIdx]} est <strong>${roundDigit}</strong> ${
    roundDigit < 5 ? '< 5' : '≥ 5'
  }, donc on ${roundDigit < 5 ? 'garde' : 'arrondit à la valeur supérieure'}.`;
}

function makeRoundingNum(type: RoundingType, isTrap: boolean): number {
  const intPart = Math.floor(Math.random() * 8) + 1;

  if (!isTrap) {
    let attempts = 0;
    let num = 0;
    while (attempts++ < 50) {
      const d1 = Math.floor(Math.random() * 10);
      const d2 = Math.floor(Math.random() * 10);
      const d3 = Math.floor(Math.random() * 10);
      const d4 = Math.floor(Math.random() * 10);
      const d5 = Math.floor(Math.random() * 10);
      num = intPart + d1 * 0.1 + d2 * 0.01 + d3 * 0.001 + d4 * 0.0001 + d5 * 0.00001;
      // Avoid accidental cascade: digit at look-pos should not be 9 with next ≥ 5.
      if (type === 'dix' && d1 === 9 && d2 >= 5) continue;
      if (type === 'cent' && d2 === 9 && d3 >= 5) continue;
      if (type === 'mill' && d3 === 9 && d4 >= 5) continue;
      return num;
    }
    return num;
  }

  if (type === 'dix') {
    const d2 = 5 + Math.floor(Math.random() * 4);
    const d3 = Math.floor(Math.random() * 9);
    const d4 = Math.floor(Math.random() * 9);
    return intPart + 0.9 + d2 * 0.01 + d3 * 0.001 + d4 * 0.0001;
  }
  if (type === 'cent') {
    const d1 = Math.floor(Math.random() * 8) + 1;
    const d3 = 5 + Math.floor(Math.random() * 4);
    const d4 = Math.floor(Math.random() * 9);
    const d5 = Math.floor(Math.random() * 9);
    return intPart + d1 * 0.1 + 0.09 + d3 * 0.001 + d4 * 0.0001 + d5 * 0.00001;
  }
  // mill
  const d1 = Math.floor(Math.random() * 8) + 1;
  const d2 = Math.floor(Math.random() * 8) + 1;
  const d4 = 5 + Math.floor(Math.random() * 4);
  const d5 = Math.floor(Math.random() * 9);
  return intPart + d1 * 0.1 + d2 * 0.01 + 0.009 + d4 * 0.0001 + d5 * 0.00001;
}

function makeRoundingExercise(type: RoundingType, isTrap: boolean): RoundingExercise {
  const decimals = ROUNDING_DECIMALS[type];
  const num = makeRoundingNum(type, isTrap);
  const ans = roundTo(num, decimals);
  return {
    type: 'default',
    num,
    numStr: formatNum(num),
    decimals,
    posType: type,
    posLabel: ROUNDING_LABELS[type],
    ans: parseFloat(ans.toFixed(decimals)),
    ansStr: formatAns(ans, decimals),
    isTrap,
    explain: roundingExplain(num, type, isTrap),
    color: ROUNDING_COLORS[type],
  };
}

function expandRoundingSpec(spec: RoundingSeriesSpec): RoundingExercise[] {
  const trapPositions = new Set<number>();
  while (trapPositions.size < Math.min(spec.trapCount, spec.count)) {
    trapPositions.add(Math.floor(Math.random() * spec.count));
  }
  const list: RoundingExercise[] = [];
  for (let i = 0; i < spec.count; i++) {
    list.push(makeRoundingExercise(spec.type, trapPositions.has(i)));
  }
  return list;
}

export function randomIntegerExercise(): NumberExercise {
  const ops: IntegerOp[] = ['add', 'sub', 'mul'];
  const op = ops[Math.floor(Math.random() * 3)] as IntegerOp;
  return makeIntegerExercise({ kind: 'integer', op, count: 1, range: [-15, 15] });
}

export function runGenerator(specs: GeneratorSpec[]): Exercise[] {
  const list: Exercise[] = [];
  for (const spec of specs) {
    if (spec.kind === 'integer') {
      for (let i = 0; i < spec.count; i++) {
        list.push(makeIntegerExercise(spec));
      }
    } else if (spec.kind === 'rounding') {
      list.push(...expandRoundingSpec(spec));
    } else if (spec.kind === 'literal') {
      list.push(...generateLiteralSeries());
    } else if (spec.kind === 'literal-complex') {
      list.push(...generateLiteralComplexSeries());
    } else if (spec.kind === 'produit') {
      list.push(...generateProduitSeries());
    } else if (spec.kind === 'arith') {
      list.push(...generateArithSeries());
    } else if (spec.kind === 'programme') {
      list.push(...generateProgrammeSeries());
    } else if (spec.kind === 'pythagore') {
      list.push(...generatePythagoreSeries());
    } else if (spec.kind === 'thales') {
      list.push(...generateThalesSeries());
    } else if (spec.kind === 'fractions') {
      list.push(...generateFractionsSeries());
    } else if (spec.kind === 'fractions-complex') {
      list.push(...generateFractionsComplexSeries());
    } else if (spec.kind === 'fractions-comp') {
      list.push(...generateFractionsCompSeries());
    } else if (spec.kind === 'equations') {
      list.push(...generateEquationsSeries());
    } else if (spec.kind === 'reciproque') {
      list.push(...generateReciproqueSeries());
    } else if (spec.kind === 'puissances') {
      list.push(...generatePuissancesSeries());
    } else if (spec.kind === 'prop') {
      list.push(...generatePropSeries());
    } else if (spec.kind === 'entiers-complex') {
      list.push(...generateEntierComplexSeries());
    }
  }
  return list;
}
