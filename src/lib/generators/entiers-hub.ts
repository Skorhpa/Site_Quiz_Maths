import type { EntiersTrouExercise, EntiersSigneExercise, NumberExercise } from '@/types';
import { generateEntierComplexSeries } from './entiers-complex';

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

function shuf<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const fr = (n: string | number, d: string | number) =>
  `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 4px;line-height:1.2;font-size:1.05em;">` +
  `<span>${n}</span>` +
  `<span style="width:100%;border-top:1.5px solid currentColor;display:block;margin:2px 0;"></span>` +
  `<span>${d}</span>` +
  `</span>`;

// ── Mode 1: Faire des calculs ────────────────────────────────────────────────

function makeAdd(): NumberExercise {
  const a = ri(-15, -1);
  const b = ri(1, 20);
  const ans = a + b;
  const steps =
    Math.abs(b) > Math.abs(a)
      ? `${b} > ${Math.abs(a)}, donc on soustrait et on garde le signe de ${b} (positif) : ${b} − ${Math.abs(a)} = <strong style="color:var(--correct)">${ans}</strong>`
      : `${Math.abs(a)} > ${b}, donc on soustrait et on garde le signe de ${a} (négatif) : −(${Math.abs(a)} − ${b}) = <strong style="color:var(--correct)">${ans}</strong>`;
  return { type: 'add', expr: `${a} + ${b}`, ans, steps };
}

function makeSub(): NumberExercise {
  const variant = ri(0, 2);
  if (variant === 0) {
    // a - b where a > 0, b > a → negative
    const b = ri(5, 18), a = ri(1, b - 1);
    const ans = a - b;
    return {
      type: 'sub', expr: `${a} − ${b}`, ans,
      steps: `${b} > ${a}, donc le résultat est négatif : −(${b} − ${a}) = <strong style="color:var(--correct)">${ans}</strong>`,
    };
  } else if (variant === 1) {
    // a - (-b) → a + b
    const a = ri(2, 12), b = ri(2, 10);
    const ans = a + b;
    return {
      type: 'sub', expr: `${a} − (−${b})`, ans,
      steps: `Deux signes − consécutifs donnent + : ${a} − (−${b}) = ${a} + ${b} = <strong style="color:var(--correct)">${ans}</strong>`,
    };
  } else {
    // -a - (-b) → b - a
    const a = ri(2, 10), b = ri(a + 1, 12);
    const ans = b - a;
    return {
      type: 'sub', expr: `−${a} − (−${b})`, ans,
      steps: `Deux signes − consécutifs donnent + : −${a} − (−${b}) = −${a} + ${b} = <strong style="color:var(--correct)">${ans}</strong>`,
    };
  }
}

function makeMul(): NumberExercise {
  const a = ri(2, 9);
  const b = ri(2, 9);
  const variant = ri(0, 2);
  if (variant === 0) {
    // (+) × (-) → negative
    return {
      type: 'mul', expr: `${a} × (−${b})`, ans: -a * b,
      steps: `Signes contraires → résultat négatif. ${a} × ${b} = ${a * b}, donc ${a} × (−${b}) = <strong style="color:var(--correct)">−${a * b}</strong>`,
    };
  } else if (variant === 1) {
    // (-) × (-) → positive
    return {
      type: 'mul', expr: `(−${a}) × (−${b})`, ans: a * b,
      steps: `Signes identiques → résultat positif. ${a} × ${b} = ${a * b}, donc (−${a}) × (−${b}) = <strong style="color:var(--correct)">+${a * b}</strong>`,
    };
  } else {
    // (-) × (+) → negative
    return {
      type: 'mul', expr: `(−${a}) × ${b}`, ans: -a * b,
      steps: `Signes contraires → résultat négatif. ${a} × ${b} = ${a * b}, donc (−${a}) × ${b} = <strong style="color:var(--correct)">−${a * b}</strong>`,
    };
  }
}

// ── Trou exercise banks ──────────────────────────────────────────────────────

const ADD_TROU_BANK: EntiersTrouExercise[] = [
  {
    type: 'add', exKind: 'trou',
    part1: '(−3) + ', part2: ' = 7',
    ans: 10, requiresParens: false,
    steps: '(−3) + □ = 7, donc □ = 7 − (−3) = 7 + 3 = <strong style="color:var(--correct)">10</strong>',
  },
  {
    type: 'add', exKind: 'trou',
    part1: '', part2: ' + (−5) = −12',
    ans: -7, requiresParens: false,
    steps: '□ + (−5) = −12, donc □ = −12 − (−5) = −12 + 5 = <strong style="color:var(--correct)">−7</strong>',
  },
  {
    type: 'add', exKind: 'trou',
    part1: '(−8) + ', part2: ' = −3',
    ans: 5, requiresParens: false,
    steps: '(−8) + □ = −3, donc □ = −3 − (−8) = −3 + 8 = <strong style="color:var(--correct)">5</strong>',
  },
  {
    type: 'add', exKind: 'trou',
    part1: '', part2: ' + (−9) = 4',
    ans: 13, requiresParens: false,
    steps: '□ + (−9) = 4, donc □ = 4 − (−9) = 4 + 9 = <strong style="color:var(--correct)">13</strong>',
  },
];

const SUB_TROU_BANK: EntiersTrouExercise[] = [
  {
    type: 'sub', exKind: 'trou',
    part1: '5 − ', part2: ' = 9',
    ans: -4, requiresParens: true,
    steps: '5 − □ = 9, donc □ = 5 − 9 = −4. On écrit <strong>(−4)</strong> car 5 − (−4) = 5 + 4 = 9.',
  },
  {
    type: 'sub', exKind: 'trou',
    part1: '−2 − ', part2: ' = 4',
    ans: -6, requiresParens: true,
    steps: '−2 − □ = 4, donc □ = −2 − 4 = −6. On écrit <strong>(−6)</strong> car −2 − (−6) = −2 + 6 = 4.',
  },
  {
    type: 'sub', exKind: 'trou',
    part1: '3 − ', part2: ' = 11',
    ans: -8, requiresParens: true,
    steps: '3 − □ = 11, donc □ = 3 − 11 = −8. On écrit <strong>(−8)</strong> car 3 − (−8) = 3 + 8 = 11.',
  },
  {
    type: 'sub', exKind: 'trou',
    part1: '−5 − ', part2: ' = 2',
    ans: -7, requiresParens: true,
    steps: '−5 − □ = 2, donc □ = −5 − 2 = −7. On écrit <strong>(−7)</strong> car −5 − (−7) = −5 + 7 = 2.',
  },
];

const MUL_TROU_BANK: EntiersTrouExercise[] = [
  {
    type: 'mul', exKind: 'trou',
    part1: '4 × ', part2: ' = −20',
    ans: -5, requiresParens: true,
    steps: '4 × □ = −20, donc □ = −20 ÷ 4 = −5. On écrit <strong>(−5)</strong> car 4 × (−5) = −20.',
  },
  {
    type: 'mul', exKind: 'trou',
    part1: '(−3) × ', part2: ' = 21',
    ans: -7, requiresParens: true,
    steps: '(−3) × □ = 21, donc □ = 21 ÷ (−3) = −7. On écrit <strong>(−7)</strong> car (−3) × (−7) = 21.',
  },
  {
    type: 'mul', exKind: 'trou',
    part1: '', part2: ' × (−3) = 18',
    ans: -6, requiresParens: false,
    steps: '□ × (−3) = 18, donc □ = 18 ÷ (−3) = <strong style="color:var(--correct)">−6</strong>.',
  },
  {
    type: 'mul', exKind: 'trou',
    part1: '6 × ', part2: ' = −24',
    ans: -4, requiresParens: true,
    steps: '6 × □ = −24, donc □ = −24 ÷ 6 = −4. On écrit <strong>(−4)</strong> car 6 × (−4) = −24.',
  },
];

export function generateCalcsSeries(): (NumberExercise | EntiersTrouExercise)[] {
  const adds: NumberExercise[] = Array.from({ length: 4 }, makeAdd);
  const subs: NumberExercise[] = Array.from({ length: 4 }, makeSub);
  const muls: NumberExercise[] = Array.from({ length: 4 }, makeMul);
  const addTrou = shuf(ADD_TROU_BANK)[0]!;
  const subTrou = shuf(SUB_TROU_BANK)[0]!;
  const mulTrou = shuf(MUL_TROU_BANK)[0]!;
  return [
    ...shuf([...adds, addTrou]),
    ...shuf([...subs, subTrou]),
    ...shuf([...muls, mulTrou]),
  ];
}

export { generateEntierComplexSeries as generateComplexSeries };

// ── Mode 4: Étude de signes ──────────────────────────────────────────────────

const SIGNE_BANK: EntiersSigneExercise[] = [
  {
    type: 'mul', exKind: 'signe',
    exprHtml: '(−3) × 4',
    isPositive: false,
    steps: `<strong>Signes opposés</strong> : (−) × (+) → résultat <span style="color:var(--wrong);font-weight:700">négatif</span>.<br>(−3) × 4 = −12`,
  },
  {
    type: 'mul', exKind: 'signe',
    exprHtml: '(−2) × (−5)',
    isPositive: true,
    steps: `<strong>Mêmes signes</strong> : (−) × (−) → résultat <span style="color:var(--correct);font-weight:700">positif</span>.<br>(−2) × (−5) = +10`,
  },
  {
    type: 'div', exKind: 'signe',
    exprHtml: fr('−6', '3'),
    isPositive: false,
    steps: `<strong>Signes opposés</strong> : (−) ÷ (+) → résultat <span style="color:var(--wrong);font-weight:700">négatif</span>.<br>(−6) ÷ 3 = −2`,
  },
  {
    type: 'mul', exKind: 'signe',
    exprHtml: '7 × (−3)',
    isPositive: false,
    steps: `<strong>Signes opposés</strong> : (+) × (−) → résultat <span style="color:var(--wrong);font-weight:700">négatif</span>.<br>7 × (−3) = −21`,
  },
  {
    type: 'mul', exKind: 'signe',
    exprHtml: '(−5) × (−2)',
    isPositive: true,
    steps: `<strong>Mêmes signes</strong> : (−) × (−) → résultat <span style="color:var(--correct);font-weight:700">positif</span>.<br>(−5) × (−2) = +10`,
  },
  {
    type: 'div', exKind: 'signe',
    exprHtml: fr('8', '−2'),
    isPositive: false,
    steps: `<strong>Signes opposés</strong> : (+) ÷ (−) → résultat <span style="color:var(--wrong);font-weight:700">négatif</span>.<br>8 ÷ (−2) = −4`,
  },
  {
    type: 'div', exKind: 'signe',
    exprHtml: fr('−12', '−4'),
    isPositive: true,
    steps: `<strong>Mêmes signes</strong> : (−) ÷ (−) → résultat <span style="color:var(--correct);font-weight:700">positif</span>.<br>(−12) ÷ (−4) = +3`,
  },
  {
    type: 'mul', exKind: 'signe',
    exprHtml: '(−4) × (−3) × (−2)',
    isPositive: false,
    steps: `<strong>Compter les facteurs négatifs</strong> : 3 facteurs négatifs → nombre <em>impair</em> → résultat <span style="color:var(--wrong);font-weight:700">négatif</span>.<br>(−4) × (−3) × (−2) = −24`,
  },
  {
    type: 'mul', exKind: 'signe',
    exprHtml: '(−2) × (−3) × 4',
    isPositive: true,
    steps: `<strong>Compter les facteurs négatifs</strong> : 2 facteurs négatifs → nombre <em>pair</em> → résultat <span style="color:var(--correct);font-weight:700">positif</span>.<br>(−2) × (−3) × 4 = +24`,
  },
  {
    type: 'div', exKind: 'signe',
    exprHtml: fr('−15', '5'),
    isPositive: false,
    steps: `<strong>Signes opposés</strong> : (−) ÷ (+) → résultat <span style="color:var(--wrong);font-weight:700">négatif</span>.<br>(−15) ÷ 5 = −3`,
  },
];

export function generateSigneSeries(): EntiersSigneExercise[] {
  return shuf(SIGNE_BANK).slice(0, 5);
}
