import type { EquationExercise } from '@/types';

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
      { label: op, eq: `${lhsOp} = ${rhsOp}` },
      { label: 'Simplifie le membre gauche', eq: `x = ${rhsOp}` },
      { label: 'Calcule', eq: `x = ${x}` },
      { label: '✓ Vérification : remplace x', eq: `${x} ${a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`} = ${b}  ✓` },
    ],
  });
}

function makeT2(): EquationExercise {
  const a = rnz(-10, 10);
  const x = rnz(-10, 10);
  const d = a * x;
  const expr = `${coefX(a)} = ${d}`;
  return ex({
    eqType: 't2',
    label: 'ax = d',
    expr,
    ans: x,
    steps: [
      { label: 'Équation de départ', eq: expr },
      { label: `Divise les deux membres par ${a}`, eq: `${coefX(a)} ÷ ${a} = ${d} ÷ ${a}` },
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
      { label: op1, eq: `${lhs1Op} = ${rhs1Op}` },
      { label: 'Simplifie le membre gauche', eq: `${coefX(a)} = ${rhs1}` },
      { label: `Divise les deux membres par ${a}`, eq: `${coefX(a)} ÷ ${a} = ${rhs1} ÷ ${a}` },
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
      { label: op1, eq: `${lhsS1} = ${rhsS1}` },
      { label: 'Simplifie les deux membres', eq: `${coefX(lhsAfterX)} ${signed(c)} = ${b}` },
      { label: op2, eq: `${lhsS2} = ${rhsS2}` },
      { label: 'Simplifie', eq: `${coefX(lhsAfterX)} = ${rhsAfterC}` },
      { label: `Divise les deux membres par ${lhsAfterX}`, eq: `${coefX(lhsAfterX)} ÷ ${lhsAfterX} = ${rhsAfterC} ÷ ${lhsAfterX}` },
      { label: 'Calcule', eq: `x = ${x}` },
      { label: '✓ Vérification : remplace x', eq: `${a}×${x} + ${c} = ${a * x + c}   et   ${d}×${x} + ${b} = ${d * x + b}  ✓` },
    ],
  });
}

export function generateEquationsSeries(): EquationExercise[] {
  const qs: EquationExercise[] = [];
  for (let i = 0; i < 5; i++) qs.push(makeT1());
  for (let i = 0; i < 5; i++) qs.push(makeT2());
  for (let i = 0; i < 5; i++) qs.push(makeT3());
  for (let i = 0; i < 5; i++) qs.push(makeT4());
  return qs;
}
