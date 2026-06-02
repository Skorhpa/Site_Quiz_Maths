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

export interface MulEntierExercise {
  exKind: 'mul-entier';
  wordProblem: string | null;
  expr: string;
  ans: { n: number; d: number };
  isInteger: boolean;
  stepsMethod1: string;
  stepsMethod2: string;
}

export type Frac5emeExercise =
  | MDCExercise
  | FractionExercise
  | FractionsCompExercise
  | Equiv3Exercise
  | CompleteEquivExercise
  | RangementExercise
  | MulEntierExercise;

// ── Helpers ────────────────────────────────────────────────────────────────

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

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

// ── Rangement — dénominateurs tous distincts ───────────────────────────────

const RANGEMENT_CASES: { fracs: { n: number; d: number }[]; labels: string[]; lcd: number }[] = [
  { fracs: [{ n:1,d:2 },{ n:2,d:3 },{ n:5,d:6 },{ n:5,d:12 }],  labels:['A','B','C','D'], lcd:12 },
  { fracs: [{ n:1,d:3 },{ n:1,d:4 },{ n:5,d:12 },{ n:7,d:24 }], labels:['A','B','C','D'], lcd:24 },
  { fracs: [{ n:2,d:3 },{ n:3,d:4 },{ n:5,d:6 },{ n:7,d:12 }],  labels:['A','B','C','D'], lcd:12 },
  { fracs: [{ n:1,d:3 },{ n:2,d:5 },{ n:7,d:15 },{ n:9,d:10 }], labels:['A','B','C','D'], lcd:30 },
  { fracs: [{ n:1,d:2 },{ n:3,d:8 },{ n:5,d:16 },{ n:3,d:4 }],  labels:['A','B','C','D'], lcd:16 },
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
  const steps = `<div><strong>Dénominateur commun :</strong> ${c.lcd}</div>
    <div style="margin-top:8px;"><strong>a.</strong> ${stepsA}</div>
    <div style="margin-top:8px;"><strong>b.</strong> Ordre ${ascending ? 'croissant' : 'décroissant'} : ${stepsB}</div>
    <div style="margin-top:8px;"><strong>c.</strong> Donc : ${stepsC}</div>`;
  return { exKind: 'rangement', labels: c.labels, fracs: c.fracs, lcd: c.lcd, convertedNums, ascending, orderedIndices, steps };
}

// ── Multiplication entier × fraction ──────────────────────────────────────

const MULENTIER_FRAC_BANK: MulEntierExercise[] = [
  {
    exKind: 'mul-entier', wordProblem: null, isInteger: false,
    expr: `${fH(3,14)} × 21`,
    ans: { n:9, d:2 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">${fH(3,14)} × 21 = ${fH('3×21',14,'var(--c6)')} = ${fH(63,14,'var(--c6)')} = ${fH(9,2,'var(--correct)')} (simplifié par 7)</div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(14, 21) = 7 &nbsp;→&nbsp; 21÷7 = 3, 14÷7 = 2</div>
      <div style="margin-top:6px;">${fH(3,14)} × 21 = ${fH(3,2,'var(--c6)')} × 3 = ${fH('3×3',2,'var(--c6)')} = ${fH(9,2,'var(--correct)')}</div>`,
  },
  {
    exKind: 'mul-entier', wordProblem: null, isInteger: false,
    expr: `18 × ${fH(5,27)}`,
    ans: { n:10, d:3 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">18 × ${fH(5,27)} = ${fH('18×5',27,'var(--c6)')} = ${fH(90,27,'var(--c6)')} = ${fH(10,3,'var(--correct)')} (simplifié par 9)</div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(27, 18) = 9 &nbsp;→&nbsp; 18÷9 = 2, 27÷9 = 3</div>
      <div style="margin-top:6px;">18 × ${fH(5,27)} = 2 × ${fH(5,3,'var(--c6)')} = ${fH('2×5',3,'var(--c6)')} = ${fH(10,3,'var(--correct)')}</div>`,
  },
  {
    exKind: 'mul-entier', wordProblem: null, isInteger: false,
    expr: `${fH(4,15)} × 25`,
    ans: { n:20, d:3 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">${fH(4,15)} × 25 = ${fH('4×25',15,'var(--c6)')} = ${fH(100,15,'var(--c6)')} = ${fH(20,3,'var(--correct)')} (simplifié par 5)</div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(15, 25) = 5 &nbsp;→&nbsp; 25÷5 = 5, 15÷5 = 3</div>
      <div style="margin-top:6px;">${fH(4,15)} × 25 = ${fH(4,3,'var(--c6)')} × 5 = ${fH('4×5',3,'var(--c6)')} = ${fH(20,3,'var(--correct)')}</div>`,
  },
  {
    exKind: 'mul-entier', wordProblem: null, isInteger: false,
    expr: `14 × ${fH(3,28)}`,
    ans: { n:3, d:2 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">14 × ${fH(3,28)} = ${fH('14×3',28,'var(--c6)')} = ${fH(42,28,'var(--c6)')} = ${fH(3,2,'var(--correct)')} (simplifié par 14)</div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(28, 14) = 14 &nbsp;→&nbsp; 14÷14 = 1, 28÷14 = 2</div>
      <div style="margin-top:6px;">14 × ${fH(3,28)} = 1 × ${fH(3,2,'var(--c6)')} = ${fH(3,2,'var(--correct)')}</div>`,
  },
];

const MULENTIER_INT_BANK: MulEntierExercise[] = [
  {
    exKind: 'mul-entier', wordProblem: null, isInteger: true,
    expr: `${fH(3,4)} × 24`,
    ans: { n:18, d:1 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">${fH(3,4)} × 24 = ${fH('3×24',4,'var(--c6)')} = ${fH(72,4,'var(--c6)')} = <strong style="color:var(--correct);">18</strong></div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(4, 24) = 4 &nbsp;→&nbsp; 24÷4 = 6</div>
      <div style="margin-top:6px;">${fH(3,4)} × 24 = 3 × 6 = <strong style="color:var(--correct);">18</strong></div>`,
  },
  {
    exKind: 'mul-entier', wordProblem: null, isInteger: true,
    expr: `35 × ${fH(2,7)}`,
    ans: { n:10, d:1 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">35 × ${fH(2,7)} = ${fH('35×2',7,'var(--c6)')} = ${fH(70,7,'var(--c6)')} = <strong style="color:var(--correct);">10</strong></div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(7, 35) = 7 &nbsp;→&nbsp; 35÷7 = 5</div>
      <div style="margin-top:6px;">35 × ${fH(2,7)} = 5 × 2 = <strong style="color:var(--correct);">10</strong></div>`,
  },
  {
    exKind: 'mul-entier', wordProblem: null, isInteger: true,
    expr: `${fH(5,6)} × 42`,
    ans: { n:35, d:1 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">${fH(5,6)} × 42 = ${fH('5×42',6,'var(--c6)')} = ${fH(210,6,'var(--c6)')} = <strong style="color:var(--correct);">35</strong></div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(6, 42) = 6 &nbsp;→&nbsp; 42÷6 = 7</div>
      <div style="margin-top:6px;">${fH(5,6)} × 42 = 5 × 7 = <strong style="color:var(--correct);">35</strong></div>`,
  },
  {
    exKind: 'mul-entier', wordProblem: null, isInteger: true,
    expr: `22 × ${fH(3,11)}`,
    ans: { n:6, d:1 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">22 × ${fH(3,11)} = ${fH('22×3',11,'var(--c6)')} = ${fH(66,11,'var(--c6)')} = <strong style="color:var(--correct);">6</strong></div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(11, 22) = 11 &nbsp;→&nbsp; 22÷11 = 2</div>
      <div style="margin-top:6px;">22 × ${fH(3,11)} = 2 × 3 = <strong style="color:var(--correct);">6</strong></div>`,
  },
];

const MULENTIER_WORD_BANK: MulEntierExercise[] = [
  {
    exKind: 'mul-entier', isInteger: true,
    wordProblem: 'Calcule les trois quarts de 32.',
    expr: `${fH(3,4)} × 32`,
    ans: { n:24, d:1 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">${fH(3,4)} × 32 = ${fH('3×32',4,'var(--c6)')} = ${fH(96,4,'var(--c6)')} = <strong style="color:var(--correct);">24</strong></div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(4, 32) = 4 &nbsp;→&nbsp; 32÷4 = 8</div>
      <div style="margin-top:6px;">${fH(3,4)} × 32 = 3 × 8 = <strong style="color:var(--correct);">24</strong></div>`,
  },
  {
    exKind: 'mul-entier', isInteger: true,
    wordProblem: 'Calcule les deux tiers de 27.',
    expr: `${fH(2,3)} × 27`,
    ans: { n:18, d:1 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">${fH(2,3)} × 27 = ${fH('2×27',3,'var(--c6)')} = ${fH(54,3,'var(--c6)')} = <strong style="color:var(--correct);">18</strong></div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(3, 27) = 3 &nbsp;→&nbsp; 27÷3 = 9</div>
      <div style="margin-top:6px;">${fH(2,3)} × 27 = 2 × 9 = <strong style="color:var(--correct);">18</strong></div>`,
  },
  {
    exKind: 'mul-entier', isInteger: true,
    wordProblem: 'Calcule la moitié de 38.',
    expr: `${fH(1,2)} × 38`,
    ans: { n:19, d:1 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on divise par 2 :</div>
      <div style="margin-top:6px;">${fH(1,2)} × 38 = ${fH('1×38',2,'var(--c6)')} = ${fH(38,2,'var(--c6)')} = <strong style="color:var(--correct);">19</strong></div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(2, 38) = 2 &nbsp;→&nbsp; 38÷2 = 19</div>
      <div style="margin-top:6px;">${fH(1,2)} × 38 = 1 × 19 = <strong style="color:var(--correct);">19</strong></div>`,
  },
  {
    exKind: 'mul-entier', isInteger: true,
    wordProblem: 'Calcule les trois cinquièmes de 45.',
    expr: `${fH(3,5)} × 45`,
    ans: { n:27, d:1 },
    stepsMethod1: `<div><strong>Méthode 1</strong> — on multiplie d'abord :</div>
      <div style="margin-top:6px;">${fH(3,5)} × 45 = ${fH('3×45',5,'var(--c6)')} = ${fH(135,5,'var(--c6)')} = <strong style="color:var(--correct);">27</strong></div>`,
    stepsMethod2: `<div><strong>Méthode 2</strong> — on simplifie avant de calculer :</div>
      <div style="margin-top:6px;">PGCD(5, 45) = 5 &nbsp;→&nbsp; 45÷5 = 9</div>
      <div style="margin-top:6px;">${fH(3,5)} × 45 = 3 × 9 = <strong style="color:var(--correct);">27</strong></div>`,
  },
];

export function generate5emeMulEntierSeries(): MulEntierExercise[] {
  return [
    ...pickN(MULENTIER_FRAC_BANK, 2),
    ...pickN(MULENTIER_INT_BANK, 2),
    ...pickN(MULENTIER_WORD_BANK, 2),
  ].sort(() => Math.random() - 0.5);
}

// ── Calculs complexes 5ème — ≥3 fractions, certains avec parenthèses ──────

const COMPLEX_5EME_BANK: (Omit<FractionExercise, 'type'>)[] = [
  {
    op: 'add', label: 'Calcul',
    expr: `${fH(7,12)} + ${fH(5,36)} + ${fH(1,9)}`,
    ans: { n:30, d:36 },
    steps: `<div>36 est dans la table de 12 (×3) et de 9 (×4). Dénominateur commun : <strong>36</strong>.</div>
      <div style="margin-top:6px;">${showExpand(7,12,3,'var(--c6)')} &nbsp;;&nbsp; ${fH(5,36)} (déjà au bon dénominateur) &nbsp;;&nbsp; ${showExpand(1,9,4,'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(21,36)} + ${fH(5,36)} + ${fH(4,36)} = ${fH('21+5+4',36,'var(--c6)')} = ${fH(30,36,'var(--c6)')} = ${fH(5,6,'var(--correct)')} (simplifié)</div>`,
  },
  {
    op: 'sub', label: 'Calcul', isInteger: true,
    expr: `(5 − ${fH(7,3)}) − ${fH(2,3)}`,
    ans: { n:2, d:1 },
    steps: `<div><strong>Étape 1 :</strong> calcul de la parenthèse. On convertit 5 en dénominateur 3 : 5 = ${fH(15,3,'var(--c6)')}.</div>
      <div style="margin-top:6px;">5 − ${fH(7,3)} = ${fH(15,3)} − ${fH(7,3)} = ${fH('15−7',3,'var(--c6)')} = ${fH(8,3,'var(--c6)')}</div>
      <div style="margin-top:8px;"><strong>Étape 2 :</strong> ${fH(8,3)} − ${fH(2,3)} = ${fH('8−2',3,'var(--c6)')} = ${fH(6,3,'var(--c6)')} = <strong style="color:var(--correct);">2</strong></div>`,
  },
  {
    op: 'add', label: 'Calcul',
    expr: `1 − (${fH(3,8)} + ${fH(1,4)})`,
    ans: { n:3, d:8 },
    steps: `<div><strong>Étape 1 :</strong> calcul de la parenthèse. 8 est dans la table de 4 (×2) : ${showExpand(1,4,2,'var(--c6)')}.</div>
      <div style="margin-top:6px;">${fH(3,8)} + ${fH(2,8)} = ${fH('3+2',8,'var(--c6)')} = ${fH(5,8,'var(--c6)')}</div>
      <div style="margin-top:8px;"><strong>Étape 2 :</strong> 1 − ${fH(5,8)} = ${fH(8,8)} − ${fH(5,8)} = ${fH('8−5',8,'var(--c6)')} = ${fH(3,8,'var(--correct)')}</div>`,
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
    expr: `(${fH(7,6)} + ${fH(7,4)}) − ${fH(7,12)}`,
    ans: { n:28, d:12 },
    steps: `<div><strong>Étape 1 :</strong> calcul de la parenthèse. Dénominateur commun de 6 et 4 : <strong>12</strong>.</div>
      <div style="margin-top:6px;">${showExpand(7,6,2,'var(--c6)')} &nbsp;;&nbsp; ${showExpand(7,4,3,'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(14,12)} + ${fH(21,12)} = ${fH('14+21',12,'var(--c6)')} = ${fH(35,12,'var(--c6)')}</div>
      <div style="margin-top:8px;"><strong>Étape 2 :</strong> ${fH(35,12)} − ${fH(7,12)} = ${fH('35−7',12,'var(--c6)')} = ${fH(28,12,'var(--c6)')} = ${fH(7,3,'var(--correct)')} (simplifié)</div>`,
  },
  {
    op: 'sub', label: 'Calcul',
    expr: `3 − ${fH(5,4)} − ${fH(3,8)}`,
    ans: { n:11, d:8 },
    steps: `<div>8 est dans la table de 4 (×2). Dénominateur commun : <strong>8</strong>.</div>
      <div style="margin-top:6px;">3 = ${fH('3×8',8,'var(--c6)')} = ${fH(24,8,'var(--c6)')} &nbsp;;&nbsp; ${showExpand(5,4,2,'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(24,8)} − ${fH(10,8)} − ${fH(3,8)} = ${fH('24−10−3',8,'var(--c6)')} = ${fH(11,8,'var(--correct)')}</div>`,
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
    op: 'add', label: 'Calcul',
    expr: `(${fH(3,10)} + ${fH(1,30)}) − (${fH(1,5)} − ${fH(1,15)})`,
    ans: { n:1, d:5 },
    steps: `<div><strong>Étape 1 :</strong> première parenthèse. Dénominateur commun de 10 et 30 : <strong>30</strong>.</div>
      <div style="margin-top:6px;">${showExpand(3,10,3,'var(--c6)')} &nbsp;→&nbsp; ${fH(9,30)} + ${fH(1,30)} = ${fH(10,30,'var(--c6)')} = ${fH(1,3,'var(--c6)')}</div>
      <div style="margin-top:8px;"><strong>Étape 2 :</strong> deuxième parenthèse. Dénominateur commun de 5 et 15 : <strong>15</strong>.</div>
      <div style="margin-top:6px;">${showExpand(1,5,3,'var(--c6)')} &nbsp;→&nbsp; ${fH(3,15)} − ${fH(1,15)} = ${fH(2,15,'var(--c6)')}</div>
      <div style="margin-top:8px;"><strong>Étape 3 :</strong> ${fH(1,3)} − ${fH(2,15)} = ${fH(5,15)} − ${fH(2,15)} = ${fH('5−2',15,'var(--c6)')} = ${fH(3,15,'var(--c6)')} = ${fH(1,5,'var(--correct)')}</div>`,
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
    makeAddAtPos(0, 2), makeAddAtPos(0, 2),
    makeAddAtPos(1, 2), makeAddAtPos(1, 2),
    makeAddAtPos(5, 2),
  ];
}

export function generate5emeSubSeries(): FractionExercise[] {
  return [
    makeSubAtPos(0, 2), makeSubAtPos(0, 2),
    makeSubAtPos(1, 2), makeSubAtPos(1, 2),
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
