import type { FractionExercise, FractionsCompExercise, MDCExercise } from '@/types';
import { fH, showExpand, makeAddAtPos, makeSubAtPos, generateProblemsSeries } from './fractions';
import { generateMDCSeries } from './fractions-hub';
import { generateCompSeries, generateSimplSeries } from './fractions-comp';

// ── 5ème-specific exercise types ───────────────────────────────────────────

export interface Equiv3Exercise {
  exKind: 'equiv3';
  frac: { n: number; d: number };
  multiples: [number, number, number];
  steps: string;
}

export interface CompleteEquivExercise {
  exKind: 'complete-equiv';
  frac: { n: number; d: number };
  targetKnown: number;
  unknownIsNum: boolean;
  answer: number;
  steps: string;
}

export interface RangementExercise {
  exKind: 'rangement';
  labels: string[];
  fracs: { n: number; d: number }[];
  lcd: number;
  convertedNums: number[];
  ascending: boolean;
  orderedIndices: number[];
  steps: string;
}

export type Frac5emeExercise =
  | MDCExercise
  | FractionExercise
  | FractionsCompExercise
  | Equiv3Exercise
  | CompleteEquivExercise
  | RangementExercise;

// ── Helpers ────────────────────────────────────────────────────────────────

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

// ── Equiv3 ─────────────────────────────────────────────────────────────────

const SIMPLE_FRACS = [
  { n: 1, d: 2 }, { n: 1, d: 3 }, { n: 2, d: 3 },
  { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 1, d: 5 },
  { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 1, d: 6 }, { n: 5, d: 6 },
];

export function makeEquiv3(): Equiv3Exercise {
  const frac = pick(SIMPLE_FRACS);
  const pool = [2, 3, 4, 5, 6, 7, 8, 10].sort(() => Math.random() - 0.5);
  const [k1, k2, k3] = pool as [number, number, number, ...number[]];
  const multiples: [number, number, number] = [k1!, k2!, k3!];
  const steps = `<div>Pour obtenir une fraction égale, on multiplie numérateur <strong>et</strong> dénominateur par le même nombre.</div>
    <div style="margin-top:8px;">${showExpand(frac.n, frac.d, k1!, 'var(--c6)')} &nbsp;;&nbsp; ${showExpand(frac.n, frac.d, k2!, 'var(--c6)')} &nbsp;;&nbsp; ${showExpand(frac.n, frac.d, k3!, 'var(--c6)')}</div>`;
  return { exKind: 'equiv3', frac, multiples, steps };
}

// ── CompleteEquiv ──────────────────────────────────────────────────────────

const COMPLETE_CASES: { frac: { n: number; d: number }; mult: number; unknownIsNum: boolean }[] = [
  { frac: { n: 3, d: 4 }, mult: 4, unknownIsNum: true },
  { frac: { n: 2, d: 5 }, mult: 5, unknownIsNum: true },
  { frac: { n: 1, d: 3 }, mult: 6, unknownIsNum: true },
  { frac: { n: 5, d: 6 }, mult: 4, unknownIsNum: true },
  { frac: { n: 1, d: 2 }, mult: 7, unknownIsNum: true },
  { frac: { n: 3, d: 7 }, mult: 3, unknownIsNum: true },
  { frac: { n: 3, d: 5 }, mult: 3, unknownIsNum: false },
  { frac: { n: 1, d: 4 }, mult: 6, unknownIsNum: false },
  { frac: { n: 2, d: 3 }, mult: 5, unknownIsNum: false },
  { frac: { n: 3, d: 4 }, mult: 3, unknownIsNum: false },
];

export function makeCompleteEquiv(): CompleteEquivExercise {
  const c = pick(COMPLETE_CASES);
  const { frac, mult, unknownIsNum } = c;
  const answer = unknownIsNum ? frac.n * mult : frac.d * mult;
  const targetKnown = unknownIsNum ? frac.d * mult : frac.n * mult;
  const steps = unknownIsNum
    ? `<div>Le dénominateur ${frac.d} est multiplié par <strong>${mult}</strong> pour donner ${targetKnown}. On fait pareil au numérateur.</div>
       <div style="margin-top:6px;">${showExpand(frac.n, frac.d, mult, 'var(--c6)')} &nbsp;→&nbsp; la réponse est <strong style="color:var(--correct);">${answer}</strong></div>`
    : `<div>Le numérateur ${frac.n} est multiplié par <strong>${mult}</strong> pour donner ${targetKnown}. On fait pareil au dénominateur.</div>
       <div style="margin-top:6px;">${showExpand(frac.n, frac.d, mult, 'var(--c6)')} &nbsp;→&nbsp; la réponse est <strong style="color:var(--correct);">${answer}</strong></div>`;
  return { exKind: 'complete-equiv', frac, targetKnown, unknownIsNum, answer, steps };
}

// ── Rangement ──────────────────────────────────────────────────────────────

const RANGEMENT_CASES: { fracs: { n: number; d: number }[]; labels: string[]; lcd: number }[] = [
  { fracs: [{ n:1,d:2 },{ n:2,d:3 },{ n:5,d:6 },{ n:5,d:12 }], labels:['A','B','C','D'], lcd:12 },
  { fracs: [{ n:1,d:3 },{ n:1,d:4 },{ n:5,d:12 },{ n:7,d:24 }], labels:['A','B','C','D'], lcd:24 },
  { fracs: [{ n:2,d:3 },{ n:3,d:4 },{ n:5,d:6 },{ n:7,d:12 }], labels:['A','B','C','D'], lcd:12 },
  { fracs: [{ n:3,d:4 },{ n:5,d:8 },{ n:7,d:16 },{ n:11,d:16 }], labels:['A','B','C','D'], lcd:16 },
  { fracs: [{ n:1,d:2 },{ n:3,d:8 },{ n:5,d:16 },{ n:3,d:4 }], labels:['A','B','C','D'], lcd:16 },
];

export function makeRangement(): RangementExercise {
  const c = pick(RANGEMENT_CASES);
  const ascending = Math.random() < 0.5;
  const convertedNums = c.fracs.map((f) => f.n * (c.lcd / f.d));
  const sortedAsc = convertedNums.map((_, i) => i).sort((a, b) => convertedNums[a]! - convertedNums[b]!);
  const orderedIndices = ascending ? sortedAsc : [...sortedAsc].reverse();
  const sym = ascending ? '<' : '>';
  const stepsA = c.fracs
    .map((f, i) => {
      const k = c.lcd / f.d;
      return `${c.labels[i]} = ${k > 1 ? showExpand(f.n, f.d, k, 'var(--c6)') : fH(f.n, c.lcd, 'var(--c6)')}`;
    })
    .join(' &nbsp;;&nbsp; ');
  const stepsB = orderedIndices.map((i) => fH(convertedNums[i]!, c.lcd, 'var(--correct)')).join(` ${sym} `);
  const stepsC = orderedIndices.map((i) => fH(c.fracs[i]!.n, c.fracs[i]!.d, 'var(--correct)')).join(` ${sym} `);
  const steps = `<div><strong>a.</strong> ${stepsA}</div>
    <div style="margin-top:8px;"><strong>b.</strong> Ordre ${ascending ? 'croissant' : 'décroissant'} : ${stepsB}</div>
    <div style="margin-top:8px;"><strong>c.</strong> Donc : ${stepsC}</div>`;
  return { exKind: 'rangement', labels: c.labels, fracs: c.fracs, lcd: c.lcd, convertedNums, ascending, orderedIndices, steps };
}

// ── Calculs complexes 5ème (banque de 6, pick 4) ──────────────────────────

const COMPLEX_5EME_BANK: (Omit<FractionExercise, 'type'>)[] = [
  {
    op: 'add', label: 'Calcul',
    expr: `${fH(7,12)} + ${fH(5,36)}`,
    ans: { n:26, d:36 },
    steps: `<div>36 est dans la table de 12 (12×3 = 36). On met ${fH(7,12)} au dénominateur 36 : ${showExpand(7,12,3,'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(21,36)} + ${fH(5,36)} = ${fH('21+5',36,'var(--c6)')} = ${fH(26,36,'var(--c6)')} = ${fH(13,18,'var(--correct)')} (simplifié)</div>`,
  },
  {
    op: 'sub', label: 'Calcul', isInteger: true,
    expr: `5 − ${fH(7,3)} − ${fH(2,3)}`,
    ans: { n:2, d:1 },
    steps: `<div>On convertit 5 en fraction de dénominateur 3 : 5 = ${fH('5×3',3,'var(--c6)')} = ${fH(15,3,'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(15,3)} − ${fH(7,3)} − ${fH(2,3)} = ${fH('15−7−2',3,'var(--c6)')} = ${fH(6,3,'var(--c6)')} = <strong style="color:var(--correct);">2</strong></div>`,
  },
  {
    op: 'add', label: 'Calcul',
    expr: `1 − ${fH(3,8)} + ${fH(1,4)}`,
    ans: { n:7, d:8 },
    steps: `<div>8 est dans la table de 4 (4×2 = 8). ${showExpand(1,4,2,'var(--c6)')}</div>
      <div style="margin-top:6px;">1 = ${fH(8,8,'var(--c6)')} &nbsp;→&nbsp; ${fH(8,8)} − ${fH(3,8)} + ${fH(2,8)} = ${fH('8−3+2',8,'var(--c6)')} = ${fH(7,8,'var(--correct)')}</div>`,
  },
  {
    op: 'add', label: 'Calcul',
    expr: `${fH(3,4)} + ${fH(5,8)} + ${fH(1,2)}`,
    ans: { n:15, d:8 },
    steps: `<div>8 est dans la table de 4 (×2) et de 2 (×4). Dénominateur commun : <strong>8</strong>.</div>
      <div style="margin-top:6px;">${showExpand(3,4,2,'var(--c6)')} &nbsp;;&nbsp; ${fH(5,8)} (déjà au bon dénominateur) &nbsp;;&nbsp; ${showExpand(1,2,4,'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(6,8)} + ${fH(5,8)} + ${fH(4,8)} = ${fH('6+5+4',8,'var(--c6)')} = ${fH(15,8,'var(--correct)')}</div>`,
  },
  {
    op: 'add', label: 'Calcul',
    expr: `${fH(7,6)} + ${fH(7,12)} − ${fH(1,4)}`,
    ans: { n:18, d:12 },
    steps: `<div>12 est dans la table de 6 (×2) et de 4 (×3). Dénominateur commun : <strong>12</strong>.</div>
      <div style="margin-top:6px;">${showExpand(7,6,2,'var(--c6)')} &nbsp;;&nbsp; ${fH(7,12)} (déjà au bon dénominateur) &nbsp;;&nbsp; ${showExpand(1,4,3,'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(14,12)} + ${fH(7,12)} − ${fH(3,12)} = ${fH('14+7−3',12,'var(--c6)')} = ${fH(18,12,'var(--c6)')} = ${fH(3,2,'var(--correct)')} (simplifié)</div>`,
  },
  {
    op: 'sub', label: 'Calcul',
    expr: `3 − ${fH(5,4)} − ${fH(3,8)}`,
    ans: { n:11, d:8 },
    steps: `<div>8 est dans la table de 4 (×2). Dénominateur commun : <strong>8</strong>.</div>
      <div style="margin-top:6px;">3 = ${fH('3×8',8,'var(--c6)')} = ${fH(24,8,'var(--c6)')} &nbsp;;&nbsp; ${showExpand(5,4,2,'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(24,8)} − ${fH(10,8)} − ${fH(3,8)} = ${fH('24−10−3',8,'var(--c6)')} = ${fH(11,8,'var(--correct)')}</div>`,
  },
];

export function generate5emeComplexSeries(): FractionExercise[] {
  return [...COMPLEX_5EME_BANK]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((q) => ({ type: 'default' as const, ...q }));
}

// ── Series generators ──────────────────────────────────────────────────────

export function generate5emeMDCSeries(): (MDCExercise | Equiv3Exercise | CompleteEquivExercise)[] {
  const mdc = generateMDCSeries();
  return [mdc[0]!, mdc[1]!, makeEquiv3(), makeCompleteEquiv()];
}

export function generate5emeAddSeries(): FractionExercise[] {
  return [
    makeAddAtPos(0, 2),
    makeAddAtPos(0, 2),
    makeAddAtPos(1, 2),
    makeAddAtPos(1, 2),
    makeAddAtPos(5, 2),
  ];
}

export function generate5emeSubSeries(): FractionExercise[] {
  return [
    makeSubAtPos(0, 2),
    makeSubAtPos(0, 2),
    makeSubAtPos(1, 2),
    makeSubAtPos(1, 2),
    makeSubAtPos(5, 2),
  ];
}

export function generate5emeCompSeries(): (FractionsCompExercise | RangementExercise)[] {
  const s1 = generateCompSeries();
  const s2 = generateCompSeries();
  return [s1[0]!, s1[1]!, s1[2]!, s2[2]!, makeRangement()];
}

export { generateSimplSeries as generate5emeSimplSeries };

export function generate5emeProblemsSeries(): FractionExercise[] {
  return generateProblemsSeries().slice(2);
}

export { makeAddAtPos, makeSubAtPos };
