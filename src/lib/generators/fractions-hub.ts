import type { MDCExercise } from '@/types';
import { fH, frGcd, showExpand } from './fractions';

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

function lcm(a: number, b: number): number {
  return (a * b) / frGcd(a, b);
}

function makeMDCMultiple(): MDCExercise {
  const pairs: [number, number][] = [[3, 9], [4, 12], [5, 15], [2, 8], [3, 6], [5, 10], [2, 6], [4, 8]];
  const [d1, d2] = pick(pairs);
  const k = d2 / d1;
  const lcd = d2;
  let n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
  let n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
  // Ensure frac1 ≠ frac2 as rational numbers
  let attempts = 0;
  while (n1 * d2 === n2 * d1 && attempts++ < 20) {
    n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
  }
  const steps = `<div style="color:var(--text);">${d2} est dans la table de ${d1} (${d1}×${k} = ${d2}). On met ${fH(n1, d1)} au dénominateur ${lcd} :</div>
    <div style="margin-top:6px;">${showExpand(n1, d1, k, 'var(--c6)')}</div>
    <div style="margin-top:6px;color:var(--text);">Résultat : ${fH(n1 * k, lcd, 'var(--correct)')} &nbsp;et&nbsp; ${fH(n2, lcd, 'var(--correct)')}</div>`;
  return { type: 'default', exKind: 'mdc', kind: 'multiple', frac1: { n: n1, d: d1 }, frac2: { n: n2, d: d2 }, lcd, steps };
}

function makeMDCCoprime(): MDCExercise {
  const pairs: [number, number][] = [[3, 4], [3, 5], [4, 5], [5, 7], [3, 7], [4, 7], [5, 8], [3, 8]];
  const [d1, d2] = pick(pairs);
  const lcd = d1 * d2;
  let n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
  let n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
  let attempts = 0;
  while (n1 * d2 === n2 * d1 && attempts++ < 20) {
    n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
  }
  const steps = `<div style="color:var(--text);">${d2} n'est pas dans la table de ${d1}. On cherche le plus petit nombre dans la table des deux : c'est <strong>${lcd}</strong> (${d1}×${d2}).</div>
    <div style="margin-top:6px;">${showExpand(n1, d1, d2, 'var(--c6)')} &nbsp;et&nbsp; ${showExpand(n2, d2, d1, 'var(--c6)')}</div>
    <div style="margin-top:6px;color:var(--text);">Résultat : ${fH(n1 * d2, lcd, 'var(--correct)')} &nbsp;et&nbsp; ${fH(n2 * d1, lcd, 'var(--correct)')}</div>`;
  return { type: 'default', exKind: 'mdc', kind: 'coprime', frac1: { n: n1, d: d1 }, frac2: { n: n2, d: d2 }, lcd, steps };
}

function makeMDCCommon(): MDCExercise {
  // Denominators share a common factor but neither is a multiple of the other
  const pairs: [number, number][] = [[4, 6], [6, 9], [4, 10], [6, 10], [8, 12]];
  const [d1, d2] = pick(pairs);
  const l = lcm(d1, d2);
  const k1 = l / d1;
  const k2 = l / d2;
  let n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
  let n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
  let attempts = 0;
  while (n1 * d2 === n2 * d1 && attempts++ < 20) {
    n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
  }
  const steps = `<div style="color:var(--text);">${d1} et ${d2} ne sont pas multiples l'un de l'autre. On cherche le plus petit nombre dans la table des deux : c'est <strong>${l}</strong> (${d1}×${k1} = ${d2}×${k2} = ${l}).</div>
    <div style="margin-top:6px;">${showExpand(n1, d1, k1, 'var(--c6)')} &nbsp;et&nbsp; ${showExpand(n2, d2, k2, 'var(--c6)')}</div>
    <div style="margin-top:6px;color:var(--text);">Résultat : ${fH(n1 * k1, l, 'var(--correct)')} &nbsp;et&nbsp; ${fH(n2 * k2, l, 'var(--correct)')}</div>`;
  return { type: 'default', exKind: 'mdc', kind: 'common', frac1: { n: n1, d: d1 }, frac2: { n: n2, d: d2 }, lcd: l, steps };
}

export function generateMDCSeries(): MDCExercise[] {
  return [
    makeMDCMultiple(),
    makeMDCMultiple(),
    makeMDCCommon(),
    makeMDCCoprime(),
    makeMDCCoprime(),
  ];
}
