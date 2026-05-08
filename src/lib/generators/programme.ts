import type { ProgrammeExercise } from '@/types';

const randNZ = (a: number, b: number) => {
  let v = 0;
  while (v === 0) v = Math.floor(Math.random() * (b - a + 1)) + a;
  return v;
};
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

const disp = (n: number) => (n < 0 ? `(${n})` : n === 0 ? '0' : `${n}`);
const mul = (a: number, b: number) => {
  if (a < 0 && b < 0) return `(${a}) × (${b})`;
  if (a < 0) return `(${a}) × ${b}`;
  if (b < 0) return `${a} × (${b})`;
  return `${a} × ${b}`;
};

type Factory = () => ProgrammeExercise;

const ex = (
  base: Omit<ProgrammeExercise, 'type'>,
): ProgrammeExercise => ({ type: 'default', ...base });

const BANK: Factory[] = [
  // 1. x − sub → ×(−k) → + k*x → constant k*sub
  () => {
    const k = randNZ(2, 5);
    const sub = randNZ(2, 10);
    const result = k * sub;
    const val1 = pick([2, 3, 4, 5, 6] as const);
    const val2 = pick([-3, -2, -1] as const);
    const run = (x: number) => {
      const s1 = x - sub;
      const s2 = -k * s1;
      const s3 = s2 + k * x;
      return { s1, s2, s3 };
    };
    const r1 = run(val1);
    const r2 = run(val2);
    return ex({
      instr: [
        'Choisir un nombre',
        `Soustraire <strong>${sub}</strong> au nombre`,
        `Multiplier le résultat par <strong>−${k}</strong>`,
        `Ajouter <strong>${k} fois</strong> le nombre de départ`,
      ],
      val1,
      val2,
      ansA: r1.s3,
      ansB: r2.s3,
      ansC: `${result}`,
      stepsA: `<div class="prog-step">${disp(val1)} − ${sub} = <strong>${r1.s1}</strong></div>
        <div class="prog-step">${mul(-k, r1.s1)} = <strong>${r1.s2}</strong></div>
        <div class="prog-step">${r1.s2} + ${k} × ${disp(val1)} = ${r1.s2} + ${k * val1} = <strong style="color:var(--correct);">${r1.s3}</strong></div>`,
      stepsB: `<div class="prog-step">${disp(val2)} − ${sub} = <strong>${r2.s1}</strong></div>
        <div class="prog-step">${mul(-k, r2.s1)} = <strong>${r2.s2}</strong></div>
        <div class="prog-step">${r2.s2} + ${k} × ${disp(val2)} = ${r2.s2} + ${k * val2} = <strong style="color:var(--correct);">${r2.s3}</strong></div>`,
      stepsC: `<div class="prog-step">Étape 1 : x − ${sub}</div>
        <div class="prog-step">Étape 2 : −${k}(x − ${sub}) = −${k}x + ${k * sub}</div>
        <div class="prog-step">Étape 3 : −${k}x + ${k * sub} + ${k}x = <strong style="color:var(--correct);">${result}</strong></div>
        <div style="margin-top:6px;color:var(--muted);">Quel que soit x, le résultat est toujours <strong style="color:var(--correct);">${result}</strong>.</div>`,
      obs: `On obtient <strong>${result}</strong> dans les deux cas — le résultat ne dépend pas du nombre choisi.`,
      isConstant: true,
    });
  },

  // 2. x → ×k+c → ×x → −x = kx²+(c−1)x
  () => {
    const k = randNZ(2, 4);
    const c = randNZ(1, 8);
    const val1 = pick([3, 4, 5, 6] as const);
    const val2 = pick([-2, -1, 1, 2] as const);
    const run = (x: number) => {
      const s1 = k * x + c;
      const s2 = s1 * x;
      const s3 = s2 - x;
      return { s1, s2, s3 };
    };
    const r1 = run(val1);
    const r2 = run(val2);
    const cm = c - 1;
    const cmStr = cm === 0 ? '' : cm > 0 ? `+ ${cm}x` : `− ${Math.abs(cm)}x`;
    const ansExpr = `${k}x² ${cmStr}`;
    return ex({
      instr: [
        'Choisir un nombre',
        `Ajouter <strong>${c}</strong> à <strong>${k} fois</strong> le nombre`,
        'Multiplier le résultat par le nombre choisi',
        'Soustraire le nombre de départ',
      ],
      val1,
      val2,
      ansA: r1.s3,
      ansB: r2.s3,
      ansC: ansExpr,
      stepsA: `<div class="prog-step">${k} × ${disp(val1)} + ${c} = ${k * val1} + ${c} = <strong>${r1.s1}</strong></div>
        <div class="prog-step">${r1.s1} × ${disp(val1)} = <strong>${r1.s2}</strong></div>
        <div class="prog-step">${r1.s2} − ${disp(val1)} = <strong style="color:var(--correct);">${r1.s3}</strong></div>`,
      stepsB: `<div class="prog-step">${k} × ${disp(val2)} + ${c} = ${k * val2} + ${c} = <strong>${r2.s1}</strong></div>
        <div class="prog-step">${r2.s1} × ${disp(val2)} = <strong>${r2.s2}</strong></div>
        <div class="prog-step">${r2.s2} − ${disp(val2)} = <strong style="color:var(--correct);">${r2.s3}</strong></div>`,
      stepsC: `<div class="prog-step">Étape 1 : ${k}x + ${c}</div>
        <div class="prog-step">Étape 2 : x(${k}x + ${c}) = ${k}x² + ${c}x</div>
        <div class="prog-step">Étape 3 : ${k}x² + ${c}x − x = ${k}x² + (${c} − 1)x = <strong style="color:var(--correct);">${ansExpr}</strong></div>`,
      obs: '',
      isConstant: false,
    });
  },

  // 3. (base − x) ×factor + add*x = factor*base + (add − factor)x
  () => {
    const base = randNZ(5, 12);
    const factor = randNZ(2, 5);
    const add = randNZ(1, 4);
    const netCoef = add - factor;
    const val1 = pick([2, 3, 4] as const);
    const val2 = pick([-2, -1, 0, 1] as const);
    const run = (x: number) => {
      const s1 = base - x;
      const s2 = factor * s1;
      const s3 = s2 + add * x;
      return { s1, s2, s3 };
    };
    const r1 = run(val1);
    const r2 = run(val2);
    const constPart = factor * base;
    const netStr =
      netCoef === 0
        ? `${constPart}`
        : netCoef > 0
          ? `${constPart} + ${netCoef}x`
          : `${constPart} − ${Math.abs(netCoef)}x`;
    const isConst = netCoef === 0;
    return ex({
      instr: [
        'Choisir un nombre',
        `Le soustraire à <strong>${base}</strong>`,
        `Multiplier le résultat par <strong>${factor}</strong>`,
        `Ajouter <strong>${add} fois</strong> le nombre de départ`,
      ],
      val1,
      val2,
      ansA: r1.s3,
      ansB: r2.s3,
      ansC: netStr,
      stepsA: `<div class="prog-step">${base} − ${disp(val1)} = <strong>${r1.s1}</strong></div>
        <div class="prog-step">${r1.s1} × ${factor} = <strong>${r1.s2}</strong></div>
        <div class="prog-step">${r1.s2} + ${add} × ${disp(val1)} = ${r1.s2} + ${add * val1} = <strong style="color:var(--correct);">${r1.s3}</strong></div>`,
      stepsB: `<div class="prog-step">${base} − ${disp(val2)} = <strong>${r2.s1}</strong></div>
        <div class="prog-step">${r2.s1} × ${factor} = <strong>${r2.s2}</strong></div>
        <div class="prog-step">${r2.s2} + ${add} × ${disp(val2)} = ${r2.s2} + ${add * val2} = <strong style="color:var(--correct);">${r2.s3}</strong></div>`,
      stepsC: `<div class="prog-step">Étape 1 : ${base} − x</div>
        <div class="prog-step">Étape 2 : ${factor}(${base} − x) = ${constPart} − ${factor}x</div>
        <div class="prog-step">Étape 3 : ${constPart} − ${factor}x + ${add}x = ${constPart} + (${add} − ${factor})x = <strong style="color:var(--correct);">${netStr}</strong></div>`,
      obs: isConst ? `Quel que soit x, le résultat est toujours <strong style="color:var(--correct);">${constPart}</strong>.` : '',
      isConstant: isConst,
    });
  },

  // 4. x → ×k → +c → ×x = kx²+cx
  () => {
    const k = randNZ(2, 5);
    const c = randNZ(2, 8);
    const val1 = pick([3, 4, 5] as const);
    const val2 = pick([-2, -1, 1] as const);
    const run = (x: number) => ({ s1: k * x, s2: k * x + c, s3: x * (k * x + c) });
    const r1 = run(val1);
    const r2 = run(val2);
    const ansExpr = `${k}x² + ${c}x`;
    return ex({
      instr: [
        'Choisir un nombre',
        `Multiplier le nombre par <strong>${k}</strong>`,
        `Ajouter <strong>${c}</strong> au résultat`,
        'Multiplier par le nombre de départ',
      ],
      val1,
      val2,
      ansA: r1.s3,
      ansB: r2.s3,
      ansC: ansExpr,
      stepsA: `<div class="prog-step">${disp(val1)} × ${k} = <strong>${r1.s1}</strong></div>
        <div class="prog-step">${r1.s1} + ${c} = <strong>${r1.s2}</strong></div>
        <div class="prog-step">${r1.s2} × ${disp(val1)} = <strong style="color:var(--correct);">${r1.s3}</strong></div>`,
      stepsB: `<div class="prog-step">${disp(val2)} × ${k} = <strong>${r2.s1}</strong></div>
        <div class="prog-step">${r2.s1} + ${c} = <strong>${r2.s2}</strong></div>
        <div class="prog-step">${r2.s2} × ${disp(val2)} = <strong style="color:var(--correct);">${r2.s3}</strong></div>`,
      stepsC: `<div class="prog-step">Étape 1 : ${k}x</div>
        <div class="prog-step">Étape 2 : ${k}x + ${c}</div>
        <div class="prog-step">Étape 3 : x(${k}x + ${c}) = <strong style="color:var(--correct);">${ansExpr}</strong></div>`,
      obs: '',
      isConstant: false,
    });
  },

  // 5. x → +a → ×x → +b → −x = x²+(a−1)x+b
  () => {
    const a = randNZ(1, 6);
    const b = randNZ(1, 8);
    const val1 = pick([2, 3, 4] as const);
    const val2 = pick([-2, -1, 0] as const);
    const run = (x: number) => ({ s1: x + a, s2: (x + a) * x, s3: (x + a) * x + b - x });
    const r1 = run(val1);
    const r2 = run(val2);
    const cm = a - 1;
    const cmStr = cm === 0 ? '' : cm > 0 ? `+ ${cm}x` : `− ${Math.abs(cm)}x`;
    const ansExpr = `x² ${cmStr} + ${b}`;
    return ex({
      instr: [
        'Choisir un nombre',
        `Ajouter <strong>${a}</strong> au nombre`,
        'Multiplier le résultat par le nombre de départ',
        `Ajouter <strong>${b}</strong>`,
        'Soustraire le nombre de départ',
      ],
      val1,
      val2,
      ansA: r1.s3,
      ansB: r2.s3,
      ansC: ansExpr,
      stepsA: `<div class="prog-step">${disp(val1)} + ${a} = <strong>${r1.s1}</strong></div>
        <div class="prog-step">${r1.s1} × ${disp(val1)} = <strong>${r1.s2}</strong></div>
        <div class="prog-step">${r1.s2} + ${b} − ${disp(val1)} = <strong style="color:var(--correct);">${r1.s3}</strong></div>`,
      stepsB: `<div class="prog-step">${disp(val2)} + ${a} = <strong>${r2.s1}</strong></div>
        <div class="prog-step">${r2.s1} × ${disp(val2)} = <strong>${r2.s2}</strong></div>
        <div class="prog-step">${r2.s2} + ${b} − ${disp(val2)} = <strong style="color:var(--correct);">${r2.s3}</strong></div>`,
      stepsC: `<div class="prog-step">Étape 1 : x + ${a}</div>
        <div class="prog-step">Étape 2 : x(x + ${a}) = x² + ${a}x</div>
        <div class="prog-step">Étape 3 : x² + ${a}x + ${b}</div>
        <div class="prog-step">Étape 4 : x² + ${a}x + ${b} − x = x² + (${a} − 1)x + ${b} = <strong style="color:var(--correct);">${ansExpr}</strong></div>`,
      obs: '',
      isConstant: false,
    });
  },

  // 6. x → kx+c → ×(−1) → +kx = always −c
  () => {
    const k = randNZ(2, 5);
    const c = randNZ(3, 9);
    const result = -c;
    const val1 = pick([1, 2, 3, 4] as const);
    const val2 = pick([-2, -1, 0] as const);
    const run = (x: number) => {
      const s1 = k * x + c;
      const s2 = -s1;
      const s3 = s2 + k * x;
      return { s1, s2, s3 };
    };
    const r1 = run(val1);
    const r2 = run(val2);
    return ex({
      instr: [
        'Choisir un nombre',
        `Multiplier le nombre par <strong>${k}</strong> et ajouter <strong>${c}</strong>`,
        "Prendre l'opposé du résultat",
        `Ajouter <strong>${k} fois</strong> le nombre de départ`,
      ],
      val1,
      val2,
      ansA: r1.s3,
      ansB: r2.s3,
      ansC: `${result}`,
      stepsA: `<div class="prog-step">${k} × ${disp(val1)} + ${c} = ${k * val1} + ${c} = <strong>${r1.s1}</strong></div>
        <div class="prog-step">Opposé de ${r1.s1} : <strong>${r1.s2}</strong></div>
        <div class="prog-step">${r1.s2} + ${k} × ${disp(val1)} = ${r1.s2} + ${k * val1} = <strong style="color:var(--correct);">${r1.s3}</strong></div>`,
      stepsB: `<div class="prog-step">${k} × ${disp(val2)} + ${c} = ${k * val2} + ${c} = <strong>${r2.s1}</strong></div>
        <div class="prog-step">Opposé de ${r2.s1} : <strong>${r2.s2}</strong></div>
        <div class="prog-step">${r2.s2} + ${k} × ${disp(val2)} = ${r2.s2} + ${k * val2} = <strong style="color:var(--correct);">${r2.s3}</strong></div>`,
      stepsC: `<div class="prog-step">Étape 1 : ${k}x + ${c}</div>
        <div class="prog-step">Étape 2 : −(${k}x + ${c}) = −${k}x − ${c}</div>
        <div class="prog-step">Étape 3 : −${k}x − ${c} + ${k}x = <strong style="color:var(--correct);">${result}</strong></div>
        <div style="margin-top:6px;color:var(--muted);">Quel que soit x, le résultat est toujours <strong style="color:var(--correct);">${result}</strong>.</div>`,
      obs: `On obtient toujours <strong>${result}</strong> — le résultat est constant.`,
      isConstant: true,
    });
  },
];

export function generateProgrammeSeries(): ProgrammeExercise[] {
  // Build, separate by isConstant, shuffle each pool, pick 2 non-const + 1 const.
  const built = BANK.map((f) => f());
  const constants = built.filter((q) => q.isConstant);
  const nonConsts = built.filter((q) => !q.isConstant);
  const shuf = <T>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const sc = shuf(constants);
  const sn = shuf(nonConsts);
  return [sn[0]!, sn[1]!, sc[0]!];
}
