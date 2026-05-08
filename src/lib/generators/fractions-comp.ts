import type { FractionsCompExercise } from '@/types';
import { fH, fractionPrimeFactors as primeFactors, frGcd, showExpand } from './fractions';

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const randNZ = (a: number, b: number) => {
  let v = 0;
  while (v === 0) v = Math.floor(Math.random() * (b - a + 1)) + a;
  return v;
};

const ex = (data: Omit<FractionsCompExercise, 'type'>): FractionsCompExercise => ({ type: 'default', ...data });

export const FRACTIONS_COMP_COLORS: Record<FractionsCompExercise['subtype'], string> = {
  comp: '#6EE7C0',
  simpl: '#60A5FA',
  prime: '#a78bfa',
};

export function normFactors(s: string): number[] {
  return s
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/x/g, '*')
    .split(/[×*]/)
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 1)
    .sort((a, b) => a - b);
}
export function factorsEqual(userStr: string, refStr: string): boolean {
  const u = normFactors(userStr);
  const r = normFactors(refStr);
  return u.length === r.length && u.every((v, i) => v === r[i]);
}

function makeComp(subtype: 'same_denom' | 'same_num' | 'multiple' | 'coprime'): FractionsCompExercise {
  if (subtype === 'same_denom') {
    const b = pick([5, 7, 8, 9, 11]);
    const d = b;
    const a = randNZ(1, b - 1);
    let c = randNZ(1, b - 1);
    while (c === a) c = randNZ(1, b - 1);
    const sign = a < c ? '<' : '>';
    const steps = `<div style="color:var(--text);">Les deux fractions ont le <strong>même dénominateur (${b})</strong>. On compare directement les numérateurs.</div>
      <div style="margin-top:6px;color:var(--text);">${a} ${sign} ${c} &nbsp;→&nbsp; <strong style="color:var(--correct);">${fH(a, b)} ${sign} ${fH(c, d)}</strong></div>`;
    return ex({ subtype: 'comp', label: 'Comparaison', a, b, c, d, sign, steps });
  }
  if (subtype === 'same_num') {
    const a = pick([2, 3, 4, 5, 6]);
    const c = a;
    const b = randNZ(3, 10);
    let d = randNZ(3, 10);
    while (d === b) d = randNZ(3, 10);
    const sign = b > d ? '<' : '>';
    const steps = `<div style="color:var(--text);">Les deux fractions ont le <strong>même numérateur (${a})</strong>. Plus le dénominateur est grand, plus la fraction est petite.</div>
      <div style="margin-top:6px;color:var(--text);">${b} ${b > d ? '>' : '<'} ${d} &nbsp;→&nbsp; <strong style="color:var(--correct);">${fH(a, b)} ${sign} ${fH(c, d)}</strong></div>`;
    return ex({ subtype: 'comp', label: 'Comparaison', a, b, c, d, sign, steps });
  }
  if (subtype === 'multiple') {
    const pairs: [number, number][] = [[4, 8], [3, 9], [5, 10], [2, 6], [3, 6], [4, 12], [5, 15]];
    const [d1, d2] = pick(pairs);
    const b = d2, d = d1;
    const k = d2 / d1;
    const a = randNZ(1, b - 1);
    const c = randNZ(1, d - 1);
    const cK = c * k;
    const sign = a < cK ? '<' : a > cK ? '>' : '=';
    const steps = `<div style="color:var(--text);">${d2} est dans la table de ${d1} (${d1}×${k}=${d2}). On met ${fH(c, d)} au dénominateur ${b} : ${showExpand(c, d, k, 'var(--c6)')} = ${fH(cK, b)}</div>
      <div style="margin-top:6px;color:var(--text);">On compare ${fH(a, b)} et ${fH(cK, b)} : ${a} ${sign} ${cK} &nbsp;→&nbsp; <strong style="color:var(--correct);">${fH(a, b)} ${sign} ${fH(c, d)}</strong></div>`;
    return ex({ subtype: 'comp', label: 'Comparaison', a, b, c, d, sign, steps });
  }
  const pairs: [number, number][] = [[3, 4], [3, 5], [4, 5], [5, 7], [3, 7], [4, 7], [5, 8], [3, 8], [5, 6], [7, 8]];
  const [d1, d2] = pick(pairs);
  const b = d1, d = d2;
  const a = randNZ(1, b - 1);
  const c = randNZ(1, d - 1);
  const lcd = b * d;
  const aK = a * d, cK = c * b;
  const sign = aK < cK ? '<' : aK > cK ? '>' : '=';
  const steps = `<div style="color:var(--text);">${d2} n'est pas dans la table de ${d1}. Dénominateur commun : <strong>${lcd}</strong> (${d1}×${d2}).</div>
    <div style="margin-top:6px;color:var(--text);">${showExpand(a, b, d, 'var(--c6)')} &nbsp;et&nbsp; ${showExpand(c, d, b, 'var(--c6)')}</div>
    <div style="margin-top:6px;color:var(--text);">On compare ${fH(aK, lcd)} et ${fH(cK, lcd)} : ${aK} ${sign} ${cK} &nbsp;→&nbsp; <strong style="color:var(--correct);">${fH(a, b)} ${sign} ${fH(c, d)}</strong></div>`;
  return ex({ subtype: 'comp', label: 'Comparaison', a, b, c, d, sign, steps });
}

function makeSimplify(): FractionsCompExercise {
  const fracs = [
    { n: 6, d: 9 }, { n: 4, d: 6 }, { n: 8, d: 12 }, { n: 10, d: 15 }, { n: 9, d: 12 },
    { n: 6, d: 14 }, { n: 15, d: 20 }, { n: 12, d: 18 }, { n: 10, d: 25 }, { n: 8, d: 20 },
    { n: 6, d: 10 }, { n: 4, d: 10 }, { n: 9, d: 15 }, { n: 6, d: 8 }, { n: 15, d: 25 },
  ];
  const f = pick(fracs);
  const { n, d } = f;
  const g = frGcd(n, d);
  const sn = n / g, sd = d / g;
  const steps = `<div style="color:var(--text);">Le plus grand nombre divisant à la fois ${n} et ${d} est <strong>${g}</strong>.</div>
    <div style="margin-top:6px;color:var(--text);">${fH(n, d)} = ${fH(`${n}÷${g}`, `${d}÷${g}`, 'var(--c6)')} = <strong style="color:var(--correct);">${fH(sn, sd)}</strong></div>`;
  return ex({ subtype: 'simpl', label: 'Simplification', n, d: d, ans: { n: sn, d: sd }, steps });
}

function makePrimeFac(): FractionsCompExercise {
  const fracs = [
    { n: 12, d: 18 }, { n: 24, d: 36 }, { n: 30, d: 42 }, { n: 20, d: 28 }, { n: 15, d: 35 },
    { n: 18, d: 30 }, { n: 24, d: 40 }, { n: 36, d: 48 }, { n: 14, d: 21 }, { n: 12, d: 30 },
  ];
  const f = pick(fracs);
  return primeFacExercise(f.n, f.d, false);
}

function makePrimeFacLarge(): FractionsCompExercise {
  const fracs = [
    { n: 60, d: 90 }, { n: 72, d: 120 }, { n: 48, d: 60 }, { n: 36, d: 60 },
    { n: 84, d: 140 }, { n: 90, d: 126 }, { n: 60, d: 84 }, { n: 120, d: 180 },
  ];
  const f = pick(fracs);
  return primeFacExercise(f.n, f.d, true);
}

function primeFacExercise(n: number, d: number, large: boolean): FractionsCompExercise {
  const fn = primeFactors(n);
  const fd = primeFactors(d);
  const g = frGcd(n, d);
  const sn = n / g, sd = d / g;
  const factStr = (arr: number[]) => arr.join(' × ');

  const fnC = [...fn], fdC = [...fd];
  for (let i = fnC.length - 1; i >= 0; i--) {
    const idx = fdC.indexOf(fnC[i]!);
    if (idx !== -1) {
      fnC.splice(i, 1);
      fdC.splice(idx, 1);
    }
  }
  const fnLeft = fnC.length ? fnC.join('×') : '1';
  const fdLeft = fdC.length ? fdC.join('×') : '1';

  // The Large variant uses tighter struck-opacity (.35 vs .4) AND font-weight:600
  // on every factor — even the non-struck ones. (Site.html:5295-5307 vs 5239-5249)
  const struckOpacity = large ? '.35' : '.4';
  const weight = large ? ';font-weight:600' : '';

  const usedForStrike = [...fd];
  const strikeN = fn.map((p) => {
    const idx = usedForStrike.indexOf(p);
    if (idx !== -1) {
      usedForStrike.splice(idx, 1);
      return `<span style="text-decoration:line-through;opacity:${struckOpacity};font-size:14px${weight};">${p}</span>`;
    }
    return `<span style="font-size:14px${weight};">${p}</span>`;
  });
  const usedNcopy = [...fn];
  const strikeD = fd.map((p) => {
    const idx = usedNcopy.indexOf(p);
    if (idx !== -1) {
      usedNcopy.splice(idx, 1);
      return `<span style="text-decoration:line-through;opacity:${struckOpacity};font-size:14px${weight};">${p}</span>`;
    }
    return `<span style="font-size:14px${weight};">${p}</span>`;
  });
  const sep = '<span style="color:var(--muted);font-size:13px;margin:0 2px;">×</span>';
  const crossedNum = strikeN.join(sep);
  const crossedDen = strikeD.join(sep);

  const steps = `<div style="color:var(--text);">On décompose en facteurs premiers :</div>
    <div style="margin-top:8px;font-family:'DM Mono',monospace;color:var(--text);">${fH(n, d)} = ${fH(`<span style="font-size:13px">${factStr(fn)}</span>`, `<span style="font-size:13px">${factStr(fd)}</span>`, 'var(--c6)')}</div>
    <div style="margin-top:10px;color:var(--text);">On barre les facteurs communs :</div>
    <div style="margin-top:6px;font-family:'DM Mono',monospace;">${fH(crossedNum, crossedDen, 'var(--c6)')} = <strong style="color:var(--correct);">${fH(sn, sd)}</strong></div>`;

  return ex({
    subtype: 'prime',
    label: 'Facteurs premiers',
    n,
    d,
    fnStr: factStr(fn),
    fdStr: factStr(fd),
    ans: { n: sn, d: sd },
    ansNStr: fnLeft,
    ansDStr: fdLeft,
    steps,
  });
}

export function generateFractionsCompSeries(): FractionsCompExercise[] {
  return [
    makeComp('same_denom'),
    makeComp('same_num'),
    makeComp('multiple'),
    makeComp('coprime'),
    makeComp('coprime'),
    makeSimplify(),
    makeSimplify(),
    makeSimplify(),
    makePrimeFac(),
    makePrimeFac(),
    makePrimeFacLarge(),
  ];
}
