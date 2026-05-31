import type { EquationDragDropExercise, EquationExercise } from '@/types';

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const rnz = (a: number, b: number) => {
  let v = 0;
  while (v === 0) v = ri(a, b);
  return v;
};
const coefX = (a: number) => (a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`);
const signed = (n: number) => (n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`);

const ex = (data: Omit<EquationExercise, 'type'>): EquationExercise => ({ type: 'default', ...data });

function makeT1(): EquationExercise {
  const a = rnz(-15, 15);
  const x = ri(-12, 12);
  const b = x + a;
  const expr = a >= 0 ? `x + ${a} = ${b}` : `x - ${Math.abs(a)} = ${b}`;
  const op = a >= 0 ? `Soustrait ${a} des deux membres` : `Ajoute ${Math.abs(a)} des deux membres`;
  const lhsOp = a >= 0 ? `x + ${a} - ${a}` : `x - ${Math.abs(a)} + ${Math.abs(a)}`;
  const rhsOp = a >= 0 ? `${b} - ${a}` : `${b} + ${Math.abs(a)}`;
  return ex({
    eqType: 't1',
    label: 'x + a = b',
    expr,
    ans: x,
    steps: [
      { label: 'Équation de départ', eq: expr },
      { label: op, eq: `${lhsOp} = ${rhsOp}`, redParts: [a >= 0 ? `- ${a}` : `+ ${Math.abs(a)}`] },
      { label: 'Simplifie le membre gauche', eq: `x = ${rhsOp}` },
      { label: 'Calcule', eq: `x = ${x}` },
      { label: '✓ Vérification : remplace x', eq: `${x} ${a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`} = ${b}  ✓` },
    ],
  });
}

function makeT2(): EquationExercise {
  let a = 0, x = 0, d = 0;
  do {
    a = rnz(-10, 10);
    x = rnz(-10, 10);
    d = a * x;
  } while (a === 1); // avoid trivial x = d
  const expr = `${coefX(a)} = ${d}`;
  return ex({
    eqType: 't2',
    label: 'ax = d',
    expr,
    ans: x,
    steps: [
      { label: 'Équation de départ', eq: expr },
      { label: `Divise les deux membres par ${a}`, eq: `${coefX(a)} ÷ ${a} = ${d} ÷ ${a}`, redParts: [`÷ ${a}`] },
      { label: 'Simplifie le membre gauche', eq: `x = ${d} ÷ ${a}` },
      { label: 'Calcule', eq: `x = ${x}` },
      { label: '✓ Vérification : remplace x', eq: `${a} × ${x} = ${d}  ✓` },
    ],
  });
}

function makeT3(): EquationExercise {
  const a = rnz(-8, 8);
  const x = rnz(-10, 10);
  const c = rnz(-15, 15);
  const d = a * x + c;
  const expr = c >= 0 ? `${coefX(a)} + ${c} = ${d}` : `${coefX(a)} - ${Math.abs(c)} = ${d}`;
  const rhs1 = d - c;
  const op1 = c >= 0 ? `Soustrait ${c} des deux membres` : `Ajoute ${Math.abs(c)} des deux membres`;
  const lhs1Op = c >= 0 ? `${coefX(a)} + ${c} - ${c}` : `${coefX(a)} - ${Math.abs(c)} + ${Math.abs(c)}`;
  const rhs1Op = c >= 0 ? `${d} - ${c}` : `${d} + ${Math.abs(c)}`;
  return ex({
    eqType: 't3',
    label: 'ax + c = d',
    expr,
    ans: x,
    steps: [
      { label: 'Équation de départ', eq: expr },
      { label: op1, eq: `${lhs1Op} = ${rhs1Op}`, redParts: [c >= 0 ? `- ${c}` : `+ ${Math.abs(c)}`] },
      { label: 'Simplifie le membre gauche', eq: `${coefX(a)} = ${rhs1}` },
      { label: `Divise les deux membres par ${a}`, eq: `${coefX(a)} ÷ ${a} = ${rhs1} ÷ ${a}`, redParts: [`÷ ${a}`] },
      { label: 'Simplifie le membre gauche', eq: `x = ${rhs1} ÷ ${a}` },
      { label: 'Calcule', eq: `x = ${x}` },
      { label: '✓ Vérification : remplace x', eq: `${a} × ${x} + ${c} = ${a * x + c} = ${d}  ✓` },
    ],
  });
}

function makeT4(): EquationExercise {
  let a = 0, d = 0, x = 0, c = 0, b = 0;
  do {
    a = rnz(-8, 8);
    d = rnz(-8, 8);
    x = rnz(-10, 10);
    c = rnz(-15, 15);
    b = (a - d) * x + c;
  } while (a === d || !Number.isInteger(b));
  const side = (cf: number, cs: number) => `${coefX(cf)} ${cs >= 0 ? `+ ${cs}` : `- ${Math.abs(cs)}`}`;
  const expr = `${side(a, c)} = ${side(d, b)}`;
  const lhsAfterX = a - d;
  const rhsAfterC = b - c;
  const op1 = d >= 0 ? `Soustrait ${coefX(d)} des deux membres` : `Ajoute ${coefX(Math.abs(d))} des deux membres`;
  const lhsS1 = `${side(a, c)} ${d >= 0 ? `- ${coefX(d)}` : `+ ${coefX(Math.abs(d))}`}`;
  const rhsS1 = `${side(d, b)} ${d >= 0 ? `- ${coefX(d)}` : `+ ${coefX(Math.abs(d))}`}`;
  const op2 = c >= 0 ? `Soustrait ${c} des deux membres` : `Ajoute ${Math.abs(c)} des deux membres`;
  const lhsS2 = `${coefX(lhsAfterX)} ${c >= 0 ? `+ ${c} - ${c}` : `- ${Math.abs(c)} + ${Math.abs(c)}`}`;
  const rhsS2 = c >= 0 ? `${b} - ${c}` : `${b} + ${Math.abs(c)}`;
  return ex({
    eqType: 't4',
    label: 'ax+c = dx+b',
    expr,
    ans: x,
    steps: [
      { label: 'Équation de départ', eq: expr },
      { label: op1, eq: `${lhsS1} = ${rhsS1}`, redParts: [d >= 0 ? `- ${coefX(d)}` : `+ ${coefX(Math.abs(d))}`] },
      { label: 'Simplifie les deux membres', eq: `${coefX(lhsAfterX)} ${signed(c)} = ${b}` },
      { label: op2, eq: `${lhsS2} = ${rhsS2}`, redParts: [c >= 0 ? `- ${c}` : `+ ${Math.abs(c)}`] },
      { label: 'Simplifie', eq: `${coefX(lhsAfterX)} = ${rhsAfterC}` },
      { label: `Divise les deux membres par ${lhsAfterX}`, eq: `${coefX(lhsAfterX)} ÷ ${lhsAfterX} = ${rhsAfterC} ÷ ${lhsAfterX}`, redParts: [`÷ ${lhsAfterX}`] },
      { label: 'Calcule', eq: `x = ${x}` },
      { label: '✓ Vérification : remplace x', eq: `${a}×${x} + ${c} = ${a * x + c}   et   ${d}×${x} + ${b} = ${d * x + b}  ✓` },
    ],
  });
}

// ── Drag-drop configs ─────────────────────────────────────────────────────────

const shuf = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

function makeDd(eqCategory: 't1' | 't2' | 't3' | 't4', label: string, text: string, steps: string[]): EquationDragDropExercise {
  return { type: 'default', eqType: 'dd', eqCategory, label, text, steps, shuffled: shuf([...steps]) };
}

const T1_DD: { text: string; steps: string[] }[] = [
  {
    text: 'x + 5 = 12',
    steps: [
      'Équation de départ : x + 5 = 12',
      'Soustrait 5 des deux membres : x + 5 − 5 = 12 − 5',
      'Simplifie le membre gauche : x = 12 − 5',
      'Calcule : x = 7',
      'Vérification (remplace x par 7) : 7 + 5 = 12 ✓',
    ],
  },
  {
    text: 'x − 3 = 9',
    steps: [
      'Équation de départ : x − 3 = 9',
      'Ajoute 3 aux deux membres : x − 3 + 3 = 9 + 3',
      'Simplifie le membre gauche : x = 9 + 3',
      'Calcule : x = 12',
      'Vérification (remplace x par 12) : 12 − 3 = 9 ✓',
    ],
  },
  {
    text: 'x + 8 = 3',
    steps: [
      'Équation de départ : x + 8 = 3',
      'Soustrait 8 des deux membres : x + 8 − 8 = 3 − 8',
      'Simplifie le membre gauche : x = 3 − 8',
      'Calcule : x = −5',
      'Vérification (remplace x par −5) : −5 + 8 = 3 ✓',
    ],
  },
];

const T2_DD: { text: string; steps: string[] }[] = [
  {
    text: '3x = 21',
    steps: [
      'Équation de départ : 3x = 21',
      'Divise les deux membres par 3 : 3x ÷ 3 = 21 ÷ 3',
      'Simplifie le membre gauche : x = 21 ÷ 3',
      'Calcule : x = 7',
      'Vérification (remplace x par 7) : 3 × 7 = 21 ✓',
    ],
  },
  {
    text: '−4x = −20',
    steps: [
      'Équation de départ : −4x = −20',
      'Divise les deux membres par −4 : −4x ÷ (−4) = −20 ÷ (−4)',
      'Simplifie le membre gauche : x = −20 ÷ (−4)',
      'Calcule : x = 5',
      'Vérification (remplace x par 5) : −4 × 5 = −20 ✓',
    ],
  },
  {
    text: '2x = −14',
    steps: [
      'Équation de départ : 2x = −14',
      'Divise les deux membres par 2 : 2x ÷ 2 = −14 ÷ 2',
      'Simplifie le membre gauche : x = −14 ÷ 2',
      'Calcule : x = −7',
      'Vérification (remplace x par −7) : 2 × (−7) = −14 ✓',
    ],
  },
];

const T3_DD: { text: string; steps: string[] }[] = [
  {
    text: '2x + 3 = 11',
    steps: [
      'Équation de départ : 2x + 3 = 11',
      'Soustrait 3 des deux membres : 2x + 3 − 3 = 11 − 3',
      'Simplifie le membre gauche : 2x = 11 − 3',
      'Calcule : 2x = 8',
      'Divise les deux membres par 2 : 2x ÷ 2 = 8 ÷ 2',
      'Simplifie le membre gauche : x = 8 ÷ 2',
      'Calcule : x = 4',
      'Vérification (remplace x par 4) : 2 × 4 + 3 = 8 + 3 = 11 ✓',
    ],
  },
  {
    text: '3x − 6 = 9',
    steps: [
      'Équation de départ : 3x − 6 = 9',
      'Ajoute 6 aux deux membres : 3x − 6 + 6 = 9 + 6',
      'Simplifie le membre gauche : 3x = 9 + 6',
      'Calcule : 3x = 15',
      'Divise les deux membres par 3 : 3x ÷ 3 = 15 ÷ 3',
      'Simplifie le membre gauche : x = 15 ÷ 3',
      'Calcule : x = 5',
      'Vérification (remplace x par 5) : 3 × 5 − 6 = 15 − 6 = 9 ✓',
    ],
  },
  {
    text: '−2x + 10 = 4',
    steps: [
      'Équation de départ : −2x + 10 = 4',
      'Soustrait 10 des deux membres : −2x + 10 − 10 = 4 − 10',
      'Simplifie le membre gauche : −2x = 4 − 10',
      'Calcule : −2x = −6',
      'Divise les deux membres par −2 : −2x ÷ (−2) = −6 ÷ (−2)',
      'Simplifie le membre gauche : x = −6 ÷ (−2)',
      'Calcule : x = 3',
      'Vérification (remplace x par 3) : −2 × 3 + 10 = −6 + 10 = 4 ✓',
    ],
  },
];

const T4_DD: { text: string; steps: string[] }[] = [
  {
    text: '3x + 2 = x + 8',
    steps: [
      'Équation de départ : 3x + 2 = x + 8',
      'Soustrait x des deux membres : 3x + 2 − x = x + 8 − x',
      'Simplifie les deux membres : 2x + 2 = 8',
      'Soustrait 2 des deux membres : 2x + 2 − 2 = 8 − 2',
      'Simplifie le membre gauche : 2x = 6',
      'Divise les deux membres par 2 : 2x ÷ 2 = 6 ÷ 2',
      'Calcule : x = 3',
      'Vérification (remplace x par 3) : 3×3 + 2 = 11  et  1×3 + 8 = 11 ✓',
    ],
  },
  {
    text: '4x − 1 = 2x + 9',
    steps: [
      'Équation de départ : 4x − 1 = 2x + 9',
      'Soustrait 2x des deux membres : 4x − 1 − 2x = 2x + 9 − 2x',
      'Simplifie les deux membres : 2x − 1 = 9',
      'Ajoute 1 aux deux membres : 2x − 1 + 1 = 9 + 1',
      'Simplifie le membre gauche : 2x = 10',
      'Divise les deux membres par 2 : 2x ÷ 2 = 10 ÷ 2',
      'Calcule : x = 5',
      'Vérification (remplace x par 5) : 4×5 − 1 = 19  et  2×5 + 9 = 19 ✓',
    ],
  },
  {
    text: '5x + 3 = 3x + 11',
    steps: [
      'Équation de départ : 5x + 3 = 3x + 11',
      'Soustrait 3x des deux membres : 5x + 3 − 3x = 3x + 11 − 3x',
      'Simplifie les deux membres : 2x + 3 = 11',
      'Soustrait 3 des deux membres : 2x + 3 − 3 = 11 − 3',
      'Simplifie le membre gauche : 2x = 8',
      'Divise les deux membres par 2 : 2x ÷ 2 = 8 ÷ 2',
      'Calcule : x = 4',
      'Vérification (remplace x par 4) : 5×4 + 3 = 23  et  3×4 + 11 = 23 ✓',
    ],
  },
];

function makeDDFromPool(pool: { text: string; steps: string[] }[], cat: 't1' | 't2' | 't3' | 't4', label: string): EquationDragDropExercise {
  const cfg = pool[ri(0, pool.length - 1)]!;
  return makeDd(cat, label, cfg.text, cfg.steps);
}

export function generateEquationsSeries(): (EquationExercise | EquationDragDropExercise)[] {
  const qs: (EquationExercise | EquationDragDropExercise)[] = [];
  qs.push(makeDDFromPool(T1_DD, 't1', 'x + a = b'));
  for (let i = 0; i < 3; i++) qs.push(makeT1());
  qs.push(makeDDFromPool(T2_DD, 't2', 'ax = d'));
  for (let i = 0; i < 3; i++) qs.push(makeT2());
  qs.push(makeDDFromPool(T3_DD, 't3', 'ax + c = d'));
  for (let i = 0; i < 3; i++) qs.push(makeT3());
  qs.push(makeDDFromPool(T4_DD, 't4', 'ax + c = dx + b'));
  for (let i = 0; i < 3; i++) qs.push(makeT4());
  return qs;
}
