import type { MDCExercise } from '@/types';
import { fH, showExpand } from './fractions';

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

function makeMDCMultiple(): MDCExercise {
  const pairs: [number, number][] = [[3, 9], [4, 12], [5, 15], [2, 8], [3, 6], [5, 10], [2, 6], [4, 8]];
  const [d1, d2] = pick(pairs);
  const k = d2 / d1;
  const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
  const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
  const lcd = d2;
  const steps = `<div style="color:var(--text);">${d2} est dans la table de ${d1} (${d1}×${k} = ${d2}). On met ${fH(n1, d1)} au dénominateur ${lcd} :</div>
    <div style="margin-top:6px;">${showExpand(n1, d1, k, 'var(--c6)')}</div>
    <div style="margin-top:6px;color:var(--text);">Résultat : ${fH(n1 * k, lcd, 'var(--correct)')} &nbsp;et&nbsp; ${fH(n2, lcd, 'var(--correct)')}</div>`;
  return { type: 'default', exKind: 'mdc', frac1: { n: n1, d: d1 }, frac2: { n: n2, d: d2 }, lcd, steps };
}

function makeMDCCoprime(): MDCExercise {
  const pairs: [number, number][] = [[3, 4], [3, 5], [4, 5], [5, 7], [3, 7], [4, 7], [5, 8], [3, 8]];
  const [d1, d2] = pick(pairs);
  const lcd = d1 * d2;
  const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
  const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
  const steps = `<div style="color:var(--text);">${d2} n'est pas dans la table de ${d1}. Le dénominateur commun est ${d1}×${d2} = <strong>${lcd}</strong>.</div>
    <div style="margin-top:6px;">${showExpand(n1, d1, d2, 'var(--c6)')} &nbsp;et&nbsp; ${showExpand(n2, d2, d1, 'var(--c6)')}</div>
    <div style="margin-top:6px;color:var(--text);">Résultat : ${fH(n1 * d2, lcd, 'var(--correct)')} &nbsp;et&nbsp; ${fH(n2 * d1, lcd, 'var(--correct)')}</div>`;
  return { type: 'default', exKind: 'mdc', frac1: { n: n1, d: d1 }, frac2: { n: n2, d: d2 }, lcd, steps };
}

export function generateMDCSeries(): MDCExercise[] {
  return [
    makeMDCMultiple(),
    makeMDCMultiple(),
    makeMDCMultiple(),
    makeMDCCoprime(),
    makeMDCCoprime(),
  ];
}
