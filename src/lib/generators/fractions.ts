import type { FractionExercise } from '@/types';

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

export function frGcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
export function frSimplify(n: number, d: number): { n: number; d: number } {
  if (d === 0) return { n, d };
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = frGcd(Math.abs(n), d);
  return { n: n / g, d: d / g };
}
export function frEqual(n1: number, d1: number, n2: number, d2: number): boolean {
  return n1 * d2 === n2 * d1;
}
export function frIsSimplified(n: number, d: number): boolean {
  return frGcd(Math.abs(n), d) === 1;
}

function primeFactors(n: number): number[] {
  const f: number[] = [];
  let x = n;
  for (let i = 2; i <= x; i++) while (x % i === 0) {
    f.push(i);
    x /= i;
  }
  return f;
}
function frFactorStr(n: number, strikeNums: number[] = []): string {
  const fs = primeFactors(n);
  return fs
    .map((p) => {
      const idx = strikeNums.indexOf(p);
      if (idx !== -1) {
        strikeNums.splice(idx, 1);
        return `<span style="text-decoration:line-through;opacity:.45;">${p}</span>`;
      }
      return `<span>${p}</span>`;
    })
    .join('<span style="color:var(--muted);">×</span>');
}

export const fH = (n: number | string, d: number | string, col = 'var(--text)') =>
  `<span class="frac" style="color:${col}"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;

export function fractionPrimeFactors(n: number): number[] {
  return primeFactors(n);
}

export function showExpand(n: number, d: number, k: number, col = 'var(--muted)'): string {
  return `${fH(n, d)} = ${fH(`${n}×${k}`, `${d}×${k}`, col)} = ${fH(n * k, d * k, col)}`;
}

const ex = (data: Omit<FractionExercise, 'type'>): FractionExercise => ({ type: 'default', ...data });

function makeAdd(subtype: 'same' | 'multiple' | 'coprime'): FractionExercise {
  if (subtype === 'same') {
    const d = pick([5, 7, 9, 11, 13]);
    const a = Math.floor(Math.random() * d) + 1;
    const b = Math.floor(Math.random() * (d - 1)) + 1;
    const rn = a + b;
    const steps = `<div>Les fractions ont le même dénominateur, on additionne juste les numérateurs.</div>
      <div style="margin-top:6px;">${fH(a, d)} + ${fH(b, d)} = ${fH(`${a}+${b}`, d, 'var(--c6)')} = ${fH(rn, d, 'var(--c6)')}</div>`;
    return ex({ op: 'add', label: 'Addition', expr: `${fH(a, d)} + ${fH(b, d)}`, ans: { n: rn, d }, steps });
  }
  if (subtype === 'multiple') {
    const pairs: [number, number][] = [[3, 9], [4, 12], [5, 15], [2, 8], [3, 6], [5, 10], [2, 6], [4, 8]];
    const [d1, d2] = pick(pairs);
    const k = d2 / d1;
    const a = Math.floor(Math.random() * (d1 - 1)) + 1;
    const b = Math.floor(Math.random() * (d2 - 1)) + 1;
    const an = a * k + b;
    const ad = d2;
    const s = frSimplify(an, ad);
    const steps = `<div>On regarde si un dénominateur est dans la table de l'autre : <strong>${d2}</strong> est dans la table de <strong>${d1}</strong> (${d1}×${k}=${d2}).</div>
      <div style="margin-top:6px;">On met ${fH(a, d1)} au dénominateur ${d2} : ${showExpand(a, d1, k, 'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(a * k, d2)} + ${fH(b, d2)} = ${fH(`${a * k}+${b}`, d2, 'var(--c6)')} = ${fH(an, ad, 'var(--c6)')}${
        !frIsSimplified(an, ad) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : ''
      }</div>`;
    return ex({ op: 'add', label: 'Addition', expr: `${fH(a, d1)} + ${fH(b, d2)}`, ans: { n: an, d: ad }, steps });
  }
  const pairs: [number, number][] = [[3, 4], [3, 5], [4, 5], [5, 7], [3, 7], [4, 7], [5, 8], [3, 8]];
  const [d1, d2] = pick(pairs);
  const lcd = d1 * d2;
  const a = Math.floor(Math.random() * (d1 - 1)) + 1;
  const b = Math.floor(Math.random() * (d2 - 1)) + 1;
  const an = a * d2 + b * d1;
  const ad = lcd;
  const s = frSimplify(an, ad);
  const steps = `<div><strong>${d2}</strong> n'est pas dans la table de <strong>${d1}</strong>. On cherche le plus petit nombre qui est dans la table des deux : c'est <strong>${lcd}</strong> (${d1}×${d2}).</div>
    <div style="margin-top:6px;">${showExpand(a, d1, d2, 'var(--c6)')} &nbsp;et&nbsp; ${showExpand(b, d2, d1, 'var(--c6)')}</div>
    <div style="margin-top:6px;">${fH(a * d2, lcd)} + ${fH(b * d1, lcd)} = ${fH(`${a * d2}+${b * d1}`, lcd, 'var(--c6)')} = ${fH(an, ad, 'var(--c6)')}${
      !frIsSimplified(an, ad) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : ''
    }</div>`;
  return ex({ op: 'add', label: 'Addition', expr: `${fH(a, d1)} + ${fH(b, d2)}`, ans: { n: an, d: ad }, steps });
}

function makeSub(subtype: 'same' | 'multiple' | 'coprime'): FractionExercise {
  if (subtype === 'same') {
    const d = pick([6, 7, 8, 9, 11]);
    let a = 0, b = 0;
    do {
      a = Math.floor(Math.random() * d) + 1;
      b = Math.floor(Math.random() * (a - 1)) + 1;
    } while (a <= b);
    const rn = a - b;
    const steps = `<div>Les fractions ont le même dénominateur, on soustrait juste les numérateurs.</div>
      <div style="margin-top:6px;">${fH(a, d)} − ${fH(b, d)} = ${fH(`${a}−${b}`, d, 'var(--c6)')} = ${fH(rn, d, 'var(--c6)')}</div>`;
    return ex({ op: 'sub', label: 'Soustraction', expr: `${fH(a, d)} − ${fH(b, d)}`, ans: { n: rn, d }, steps });
  }
  if (subtype === 'multiple') {
    const pairs: [number, number][] = [[2, 6], [3, 9], [4, 12], [2, 8], [5, 10], [3, 6], [4, 8], [5, 15]];
    const [d1, d2] = pick(pairs);
    const k = d2 / d1;
    let a = 0, b = 0;
    do {
      a = Math.floor(Math.random() * (d1 - 1)) + 1;
      b = Math.floor(Math.random() * (d2 - 1)) + 1;
    } while (a * k <= b);
    const rn = a * k - b;
    const rd = d2;
    const s = frSimplify(rn, rd);
    const steps = `<div>On regarde si un dénominateur est dans la table de l'autre : <strong>${d2}</strong> est dans la table de <strong>${d1}</strong> (${d1}×${k}=${d2}).</div>
      <div style="margin-top:6px;">On met ${fH(a, d1)} au dénominateur ${d2} : ${showExpand(a, d1, k, 'var(--c6)')}</div>
      <div style="margin-top:6px;">${fH(a * k, d2)} − ${fH(b, d2)} = ${fH(`${a * k}−${b}`, d2, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${
        !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : ''
      }</div>`;
    return ex({ op: 'sub', label: 'Soustraction', expr: `${fH(a, d1)} − ${fH(b, d2)}`, ans: { n: rn, d: rd }, steps });
  }
  const pairs: [number, number][] = [[3, 4], [3, 5], [4, 5], [5, 7], [3, 7], [4, 7], [5, 8], [3, 8], [5, 6], [7, 8]];
  const [d1, d2] = pick(pairs);
  const lcd = d1 * d2;
  let a = 0, b = 0;
  do {
    a = Math.floor(Math.random() * (d1 - 1)) + 1;
    b = Math.floor(Math.random() * (d2 - 1)) + 1;
  } while (a * d2 <= b * d1);
  const rn = a * d2 - b * d1;
  const rd = lcd;
  const s = frSimplify(rn, rd);
  const steps = `<div><strong>${d2}</strong> n'est pas dans la table de <strong>${d1}</strong>. On cherche le plus petit nombre dans la table des deux : c'est <strong>${lcd}</strong> (${d1}×${d2}).</div>
    <div style="margin-top:6px;">${showExpand(a, d1, d2, 'var(--c6)')} &nbsp;et&nbsp; ${showExpand(b, d2, d1, 'var(--c6)')}</div>
    <div style="margin-top:6px;">${fH(a * d2, lcd)} − ${fH(b * d1, lcd)} = ${fH(`${a * d2}−${b * d1}`, lcd, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${
      !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : ''
    }</div>`;
  return ex({ op: 'sub', label: 'Soustraction', expr: `${fH(a, d1)} − ${fH(b, d2)}`, ans: { n: rn, d: rd }, steps });
}

function makeMulSimple(): FractionExercise {
  const pairs: [number, number][] = [[2, 3], [1, 4], [3, 5], [2, 7], [4, 5], [3, 7], [5, 8], [2, 9], [3, 8], [4, 9]];
  const [a, b] = pick(pairs);
  const [c, d] = pick(pairs);
  const rn = a * c, rd = b * d;
  const s = frSimplify(rn, rd);
  const steps = `<div>On multiplie numérateur par numérateur, dénominateur par dénominateur.</div>
    <div style="margin-top:6px;">${fH(a, b)} × ${fH(c, d)} = ${fH(`${a}×${c}`, `${b}×${d}`, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${
      !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : ''
    }</div>`;
  return ex({ op: 'mul', label: 'Multiplication', expr: `${fH(a, b)} × ${fH(c, d)}`, ans: { n: rn, d: rd }, steps });
}

function makeMulBig(): FractionExercise {
  const cases = [
    { a: 14, b: 15, c: 25, d: 21, rn: 10, rd: 9 },
    { a: 16, b: 9, c: 3, d: 8, rn: 2, rd: 3 },
    { a: 15, b: 14, c: 7, d: 10, rn: 3, rd: 4 },
    { a: 22, b: 15, c: 5, d: 11, rn: 2, rd: 3 },
    { a: 12, b: 35, c: 7, d: 8, rn: 3, rd: 10 },
  ];
  const c = pick(cases);
  const allNum = primeFactors(c.a * c.c);
  const allDen = primeFactors(c.b * c.d);
  const cNum = [...allNum];
  const cDen = [...allDen];
  const strike: number[] = [];
  for (let i = cNum.length - 1; i >= 0; i--) {
    const idx = cDen.indexOf(cNum[i]!);
    if (idx !== -1) {
      strike.push(cNum[i]!);
      cNum.splice(i, 1);
      cDen.splice(idx, 1);
    }
  }
  const stN1: number[] = [], stN2: number[] = [];
  for (const s of [...strike]) {
    if (primeFactors(c.a).includes(s) && !stN1.includes(s)) stN1.push(s);
    else stN2.push(s);
  }
  const stD1: number[] = [], stD2: number[] = [];
  for (const s of [...strike]) {
    if (primeFactors(c.b).includes(s) && !stD1.includes(s)) stD1.push(s);
    else stD2.push(s);
  }
  const numLine = `${fH(c.a, c.b)} × ${fH(c.c, c.d)}`;
  const factLine = `${fH(
    `<span style="font-size:12px">${frFactorStr(c.a, [...stN1])} × ${frFactorStr(c.c, [...stN2])}</span>`,
    `<span style="font-size:12px">${frFactorStr(c.b, [...stD1])} × ${frFactorStr(c.d, [...stD2])}</span>`,
    'var(--c6)',
  )}`;
  const resultLine = `${fH(c.rn, c.rd, 'var(--correct)')}`;
  const steps = `<div>On décompose tous les nombres en facteurs premiers, puis on barre les facteurs communs au numérateur et au dénominateur.</div>
    <div style="margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <div>${numLine}</div>
      <span style="color:var(--muted);">=</span>
      <div>${factLine}</div>
      <span style="color:var(--muted);">=</span>
      <div>${resultLine}</div>
    </div>`;
  return ex({
    op: 'mul',
    label: 'Multiplication',
    expr: `<span style="font-size:12px;color:var(--muted);display:block;margin-bottom:8px;">Décompose en facteurs premiers.</span>${fH(c.a, c.b)} × ${fH(c.c, c.d)}`,
    ans: { n: c.a * c.c, d: c.b * c.d },
    steps,
  });
}

function makeMulProblem1(): FractionExercise {
  const probs = [
    {
      text: `Deux tiers des élèves d'une classe font du sport, dont les ${fH(3, 4)} font de la natation. Quelle fraction de la classe fait de la natation ?`,
      ans: { n: 6, d: 12 },
      steps: `${fH(3, 4)} × ${fH(2, 3)} = ${fH('3×2', '4×3', 'var(--c6)')} = ${fH(6, 12, 'var(--c6)')} = ${fH(1, 2, 'var(--correct)')} (simplifié)`,
    },
    {
      text: `Un sac contient des billes. Les ${fH(4, 5)} sont rouges, dont les ${fH(1, 2)} ont des pois. Quelle fraction des billes sont rouges avec des pois ?`,
      ans: { n: 4, d: 10 },
      steps: `${fH(4, 5)} × ${fH(1, 2)} = ${fH('4×1', '5×2', 'var(--c6)')} = ${fH(4, 10, 'var(--c6)')} = ${fH(2, 5, 'var(--correct)')} (simplifié)`,
    },
    {
      text: `Dans un verger, les ${fH(3, 5)} des arbres sont des pommiers, dont les ${fH(2, 3)} sont centenaires. Quelle fraction des arbres sont des pommiers centenaires ?`,
      ans: { n: 6, d: 15 },
      steps: `${fH(3, 5)} × ${fH(2, 3)} = ${fH('3×2', '5×3', 'var(--c6)')} = ${fH(6, 15, 'var(--c6)')} = ${fH(2, 5, 'var(--correct)')} (simplifié)`,
    },
  ];
  const p = pick(probs);
  return ex({
    op: 'mul',
    label: 'Multiplication',
    expr: `<span style="font-size:14px;line-height:1.8;">${p.text}</span>`,
    ans: p.ans,
    steps: `<div>${p.steps}</div>`,
  });
}

function makeMulProblem2(): FractionExercise {
  const probs = [
    {
      text: `Lucas a 24 cartes. Il donne les ${fH(1, 3)} à sa sœur. Avec ce qui reste, il utilise les ${fH(3, 4)} pour jouer. Combien de cartes utilise-t-il pour jouer ?`,
      step1: `24 × ${fH(1, 3)} = 8 cartes données`,
      step2: 'Reste = 24 − 8 = 16 cartes',
      step3: `16 × ${fH(3, 4)} = 12 cartes utilisées`,
      ans: { n: 12, d: 1 },
    },
    {
      text: `Une cantine a 40 portions de gâteau. Le midi, elle en sert les ${fH(3, 5)}. Le soir, elle sert les ${fH(2, 3)} de ce qui reste. Combien de portions sert-elle le soir ?`,
      step1: `40 × ${fH(3, 5)} = 24 portions servies le midi`,
      step2: 'Reste = 40 − 24 = 16 portions',
      step3: `16 × ${fH(2, 3)} ≈ 10,67 → on arrondit : <strong>10 portions</strong> (ou exactement ${fH(32, 3)})`,
      ans: { n: 32, d: 3 },
    },
    {
      text: `Une bibliothèque a 60 livres. Les ${fH(2, 5)} sont des romans. Des romans, les ${fH(3, 4)} sont empruntés. Combien de romans sont empruntés ?`,
      step1: `60 × ${fH(2, 5)} = 24 romans`,
      step2: '(ici pas de reste, on applique directement)',
      step3: '24 × ' + fH(3, 4) + ' = 18 romans empruntés',
      ans: { n: 18, d: 1 },
    },
  ];
  const p = pick(probs);
  const isInt = p.ans.d === 1;
  return ex({
    op: 'mul',
    label: 'Multiplication',
    isInteger: isInt,
    expr: `<span style="font-size:14px;line-height:1.8;">${p.text}</span>`,
    ans: p.ans,
    steps: `<div style="line-height:2.2;"><div>${p.step1}</div><div>${p.step2}</div><div>${p.step3}</div></div>`,
  });
}

function makeDiv(subtype: 'fracbyfrac' | 'fracbyint'): FractionExercise {
  if (subtype === 'fracbyfrac') {
    const pairs: [number, number][] = [[3, 4], [2, 5], [5, 8], [4, 7], [7, 9], [3, 8], [5, 6], [2, 7]];
    const [a, b] = pick(pairs);
    const [c, d] = pick(pairs);
    const rn = a * d, rd = b * c;
    const s = frSimplify(rn, rd);
    const steps = `<div>Diviser par une fraction revient à multiplier par son inverse.</div>
      <div style="margin-top:6px;">${fH(a, b)} ÷ ${fH(c, d)} = ${fH(a, b)} × ${fH(d, c, 'var(--c6)')} = ${fH(`${a}×${d}`, `${b}×${c}`, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${
        !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : ''
      }</div>`;
    return ex({ op: 'div', label: 'Division', expr: `${fH(a, b)} ÷ ${fH(c, d)}`, ans: { n: rn, d: rd }, steps });
  }
  const pairs: [number, number][] = [[2, 5], [3, 7], [4, 9], [5, 8], [3, 4], [2, 7], [5, 6]];
  const [a, b] = pick(pairs);
  const k = pick([2, 3, 4, 5]);
  const rn = a, rd = b * k;
  const s = frSimplify(rn, rd);
  const steps = `<div>Diviser par ${k} revient à multiplier par ${fH(1, k, 'var(--c6)')}.</div>
    <div style="margin-top:6px;">${fH(a, b)} ÷ ${k} = ${fH(a, b)} × ${fH(1, k, 'var(--c6)')} = ${fH(`${a}×1`, `${b}×${k}`, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${
      !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : ''
    }</div>`;
  return ex({ op: 'div', label: 'Division', expr: `${fH(a, b)} ÷ ${k}`, ans: { n: rn, d: rd }, steps });
}

function makeAddNeg(): FractionExercise {
  const pairs: [number, number][] = [[3, 4], [3, 5], [4, 5], [5, 7], [3, 7], [4, 7], [5, 8], [3, 8]];
  const [d1, d2] = pick(pairs);
  const lcd = d1 * d2;
  const a = -(Math.floor(Math.random() * (d1 - 1)) + 1);
  const b = Math.floor(Math.random() * (d2 - 1)) + 1;
  const an = a * d2 + b * d1;
  const ad = lcd;
  const s = frSimplify(an, ad);
  const steps = `<div><strong>${d2}</strong> n'est pas dans la table de <strong>${d1}</strong>. On cherche le plus petit nombre dans la table des deux : c'est <strong>${lcd}</strong>.</div>
    <div style="margin-top:6px;">${showExpand(a, d1, d2, 'var(--c6)')} &nbsp;et&nbsp; ${showExpand(b, d2, d1, 'var(--c6)')}</div>
    <div style="margin-top:6px;">${fH(a * d2, lcd)} + ${fH(b * d1, lcd)} = ${fH(`${a * d2}+${b * d1}`, lcd, 'var(--c6)')} = ${fH(an, ad, 'var(--c6)')}${
      !frIsSimplified(an, ad) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : ''
    }</div>
    <div style="margin-top:4px;color:var(--muted);font-size:12px;">Rappel : ajouter un nombre négatif revient à soustraire sa valeur absolue.</div>`;
  return ex({ op: 'add', label: 'Addition', expr: `${fH(a, d1)} + ${fH(b, d2)}`, ans: { n: an, d: ad }, steps });
}

function makeSubNeg(): FractionExercise {
  const pairs: [number, number][] = [[3, 4], [3, 5], [4, 5], [5, 7], [3, 7], [4, 7], [5, 8]];
  const [d1, d2] = pick(pairs);
  const lcd = d1 * d2;
  const a = Math.floor(Math.random() * (d1 - 2)) + 1;
  const b = Math.floor(Math.random() * (d2 - 2)) + 2;
  let rn = a * d2 - b * d1;
  const rd = lcd;
  if (rn >= 0) rn = a * d2 - (b + 1) * d1;
  if (rn >= 0) return makeSub('coprime');
  const s = frSimplify(Math.abs(rn), rd);
  const steps = `<div><strong>${d2}</strong> n'est pas dans la table de <strong>${d1}</strong>. On cherche le plus petit nombre dans la table des deux : c'est <strong>${lcd}</strong>.</div>
    <div style="margin-top:6px;">${showExpand(a, d1, d2, 'var(--c6)')} &nbsp;et&nbsp; ${showExpand(b, d2, d1, 'var(--c6)')}</div>
    <div style="margin-top:6px;">${fH(a * d2, lcd)} − ${fH(b * d1, lcd)} = ${fH(`${a * d2}−${b * d1}`, lcd, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${
      !frIsSimplified(Math.abs(rn), rd) ? ` = ${fH(-s.n, s.d, 'var(--correct)')} (simplifié)` : ''
    }</div>
    <div style="margin-top:4px;color:var(--muted);font-size:12px;">Le résultat est négatif car ${a * d2} &lt; ${b * d1}.</div>`;
  return ex({ op: 'sub', label: 'Soustraction', expr: `${fH(a, d1)} − ${fH(b, d2)}`, ans: { n: rn, d: rd }, steps });
}

function makeMulNeg(): FractionExercise {
  const pairs: [number, number][] = [[2, 3], [1, 4], [3, 5], [2, 7], [4, 5], [3, 7], [5, 8], [2, 9]];
  const [a, b] = pick(pairs);
  const [c, d] = pick(pairs);
  const na = -a;
  const rn = na * c, rd = b * d;
  const s = frSimplify(Math.abs(rn), rd);
  const steps = `<div>On multiplie numérateur par numérateur, dénominateur par dénominateur.</div>
    <div style="margin-top:6px;">Un négatif × un positif = un négatif.</div>
    <div style="margin-top:6px;">${fH(na, b)} × ${fH(c, d)} = ${fH(`${na}×${c}`, `${b}×${d}`, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${
      !frIsSimplified(Math.abs(rn), rd) ? ` = ${fH(-s.n, s.d, 'var(--correct)')} (simplifié)` : ''
    }</div>`;
  return ex({ op: 'mul', label: 'Multiplication', expr: `${fH(na, b)} × ${fH(c, d)}`, ans: { n: rn, d: rd }, steps });
}

function makeDivNeg(): FractionExercise {
  const cases = [
    { a: -9, b: 4, c: 3, d: 8 },
    { a: -10, b: 3, c: 5, d: 9 },
    { a: -8, b: 5, c: 4, d: 15 },
  ];
  const c = pick(cases);
  const rn = c.a * c.d, rd = c.b * c.c;
  const s = frSimplify(Math.abs(rn), rd);
  const sn = rn < 0 ? -s.n : s.n;
  const steps = `<div>Diviser par une fraction revient à multiplier par son inverse.</div>
    <div style="margin-top:6px;">Un négatif ÷ un positif = un négatif.</div>
    <div style="margin-top:6px;">${fH(c.a, c.b)} ÷ ${fH(c.c, c.d)} = ${fH(c.a, c.b)} × ${fH(c.d, c.c, 'var(--c6)')} = ${fH(`${c.a}×${c.d}`, `${c.b}×${c.c}`, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')} = ${fH(sn, s.d, 'var(--correct)')} (simplifié)</div>
    <div style="margin-top:6px;color:var(--muted);">Comme le dénominateur vaut 1, ${fH(sn, 1, 'var(--muted)')} = <strong style="color:var(--correct);">${sn}</strong></div>`;
  return ex({ op: 'div', label: 'Division', expr: `${fH(c.a, c.b)} ÷ ${fH(c.c, c.d)}`, ans: { n: rn, d: rd }, steps });
}

export function generateFractionsSeries(): FractionExercise[] {
  return [
    makeAdd('same'),
    makeAdd('multiple'),
    makeAdd('coprime'),
    makeAdd('coprime'),
    makeAddNeg(),
    makeSub('same'),
    makeSub('multiple'),
    makeSub('coprime'),
    makeSub('coprime'),
    makeSubNeg(),
    makeMulSimple(),
    makeMulSimple(),
    makeMulNeg(),
    makeMulBig(),
    makeMulProblem1(),
    makeMulProblem2(),
    makeDiv('fracbyfrac'),
    makeDiv('fracbyfrac'),
    makeDiv('fracbyfrac'),
    makeDiv('fracbyint'),
    makeDivNeg(),
  ];
}

export const FRACTIONS_OP_COLORS: Record<FractionExercise['op'], string> = {
  add: '#6EE7C0',
  sub: '#60A5FA',
  mul: '#F9A8D4',
  div: '#FCD34D',
};

// ── FRACTIONS COMPLEXES — hand-curated 12-question bank, shuffled + 10 picked.
// Source: Site.html:3360-3534 (FC_QUESTIONS_BANK). All cards use the c6 accent
// (single colour, no per-op tinting), so we mark them all `op: 'mul'` purely
// for left-border purposes — the renderer is told "single accent" via subtype.
// Actually: original sets `borderLeft: 3px solid var(--c6)` regardless of op.
// We tag op: 'mul' so the FractionQuestion renderer's left-border picks the
// closest-to-c6 colour from FRACTIONS_OP_COLORS — but that's #F9A8D4 (pink).
// To force c6, we extend the renderer (FractionQuestion) to honour an optional
// override on the exercise. Cleanest path: introduce an `accentOverride` field
// on FractionExercise — but that ripples. Simpler: piggy-back off `op: 'add'`
// (#6EE7C0, mint green) which is closest to c6 (#34D399). That's a port-only
// approximation and will still look "wrong" vs Site.html.
//
// → For full fidelity, the FractionQuestion renderer is taught to use a
//   per-quiz accent when the quiz id is `fractions-complex`. Done in the
//   data file by setting `accent: '#34D399'` and the renderer reads it via
//   the parent quiz prop. Here we just emit the bank.
const FC_BANK: { label: string; expr: string; ans: { n: number; d: number }; steps: string }[] = [
  {
    label: 'Addition de 3 fractions',
    expr: `${fH(1, 2)} + ${fH(1, 3)} + ${fH(1, 4)}`,
    ans: { n: 13, d: 12 },
    steps: `<div>On cherche le dénominateur commun à 2, 3 et 4 : c'est <strong>12</strong>.</div>
        <div style="margin-top:8px;">${showExpand(1, 2, 6, 'var(--c6)')} &nbsp;; ${showExpand(1, 3, 4, 'var(--c6)')} &nbsp;; ${showExpand(1, 4, 3, 'var(--c6)')}</div>
        <div style="margin-top:8px;">${fH(6, 12)} + ${fH(4, 12)} + ${fH(3, 12)} = ${fH('6+4+3', 12, 'var(--c6)')} = ${fH(13, 12, 'var(--correct)')}</div>`,
  },
  {
    label: 'Addition de 3 fractions',
    expr: `${fH(1, 2)} + ${fH(1, 4)} + ${fH(1, 8)}`,
    ans: { n: 7, d: 8 },
    steps: `<div>8 est dans la table de 2 et de 4 — dénominateur commun : <strong>8</strong>.</div>
        <div style="margin-top:8px;">${showExpand(1, 2, 4, 'var(--c6)')} &nbsp;; ${showExpand(1, 4, 2, 'var(--c6)')} &nbsp;; ${fH(1, 8)} déjà au bon dénominateur</div>
        <div style="margin-top:8px;">${fH(4, 8)} + ${fH(2, 8)} + ${fH(1, 8)} = ${fH('4+2+1', 8, 'var(--c6)')} = ${fH(7, 8, 'var(--correct)')}</div>`,
  },
  {
    label: 'Addition de 3 fractions',
    expr: `${fH(2, 3)} + ${fH(1, 5)} + ${fH(1, 6)}`,
    ans: { n: 31, d: 30 },
    steps: `<div>Dénominateur commun à 3, 5, 6 : <strong>30</strong> (3×10 = 5×6 = 30).</div>
        <div style="margin-top:8px;">${showExpand(2, 3, 10, 'var(--c6)')} &nbsp;; ${showExpand(1, 5, 6, 'var(--c6)')} &nbsp;; ${showExpand(1, 6, 5, 'var(--c6)')}</div>
        <div style="margin-top:8px;">${fH(20, 30)} + ${fH(6, 30)} + ${fH(5, 30)} = ${fH('20+6+5', 30, 'var(--c6)')} = ${fH(31, 30, 'var(--correct)')}</div>`,
  },
  {
    label: 'Opération mixte',
    expr: `( ${fH(3, 4)} + ${fH(1, 2)} ) × ${fH(8, 5)}`,
    ans: { n: 40, d: 20 },
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse.</div>
        <div style="margin-top:6px;">${showExpand(1, 2, 2, 'var(--c6)')} &nbsp;→&nbsp; ${fH(3, 4)} + ${fH(2, 4)} = ${fH(5, 4, 'var(--c6)')}</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> multiplier.</div>
        <div style="margin-top:6px;">${fH(5, 4)} × ${fH(8, 5)} = ${fH('5×8', '4×5', 'var(--c6)')} = ${fH(40, 20, 'var(--c6)')} = ${fH(2, 1, 'var(--correct)')} &nbsp;→ soit <strong style="color:var(--correct);">2</strong></div>`,
  },
  {
    label: 'Opération mixte',
    expr: `( ${fH(5, 6)} − ${fH(1, 3)} ) × ${fH(12, 7)}`,
    ans: { n: 36, d: 42 },
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse (LCD = 6).</div>
        <div style="margin-top:6px;">${showExpand(1, 3, 2, 'var(--c6)')} &nbsp;→&nbsp; ${fH(5, 6)} − ${fH(2, 6)} = ${fH(3, 6, 'var(--c6)')} = ${fH(1, 2, 'var(--c6)')} (simplifié)</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> multiplier.</div>
        <div style="margin-top:6px;">${fH(1, 2)} × ${fH(12, 7)} = ${fH('1×12', '2×7', 'var(--c6)')} = ${fH(12, 14, 'var(--c6)')} = ${fH(6, 7, 'var(--correct)')} (simplifié)</div>`,
  },
  {
    label: 'Opération mixte',
    expr: `${fH(3, 4)} × ( ${fH(2, 3)} + ${fH(1, 6)} )`,
    ans: { n: 15, d: 24 },
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse (6 est dans la table de 3).</div>
        <div style="margin-top:6px;">${showExpand(2, 3, 2, 'var(--c6)')} &nbsp;→&nbsp; ${fH(4, 6)} + ${fH(1, 6)} = ${fH(5, 6, 'var(--c6)')}</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> multiplier.</div>
        <div style="margin-top:6px;">${fH(3, 4)} × ${fH(5, 6)} = ${fH('3×5', '4×6', 'var(--c6)')} = ${fH(15, 24, 'var(--c6)')} = ${fH(5, 8, 'var(--correct)')} (simplifié)</div>`,
  },
  {
    label: "Division d'une expression",
    expr: `${fH(3, 4)} ÷ ( ${fH(1, 2)} + ${fH(1, 4)} )`,
    ans: { n: 12, d: 12 },
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse (LCD = 4).</div>
        <div style="margin-top:6px;">${showExpand(1, 2, 2, 'var(--c6)')} &nbsp;→&nbsp; ${fH(2, 4)} + ${fH(1, 4)} = ${fH(3, 4, 'var(--c6)')}</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> diviser.</div>
        <div style="margin-top:6px;">${fH(3, 4)} ÷ ${fH(3, 4)} = ${fH(3, 4)} × ${fH(4, 3, 'var(--c6)')} = ${fH('3×4', '4×3', 'var(--c6)')} = ${fH(12, 12, 'var(--c6)')} = <strong style="color:var(--correct);">1</strong></div>`,
  },
  {
    label: "Division d'une expression",
    expr: `( ${fH(1, 2)} + ${fH(1, 3)} ) ÷ ${fH(5, 6)}`,
    ans: { n: 30, d: 30 },
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse (LCD = 6).</div>
        <div style="margin-top:6px;">${showExpand(1, 2, 3, 'var(--c6)')} &nbsp;; ${showExpand(1, 3, 2, 'var(--c6)')} &nbsp;→&nbsp; ${fH(3, 6)} + ${fH(2, 6)} = ${fH(5, 6, 'var(--c6)')}</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> diviser.</div>
        <div style="margin-top:6px;">${fH(5, 6)} ÷ ${fH(5, 6)} = ${fH(5, 6)} × ${fH(6, 5, 'var(--c6)')} = ${fH('5×6', '6×5', 'var(--c6)')} = ${fH(30, 30, 'var(--c6)')} = <strong style="color:var(--correct);">1</strong></div>`,
  },
  {
    label: "Division d'une expression",
    expr: `${fH(2, 3)} ÷ ( ${fH(3, 4)} − ${fH(1, 4)} )`,
    ans: { n: 8, d: 6 },
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse (même dénominateur).</div>
        <div style="margin-top:6px;">${fH(3, 4)} − ${fH(1, 4)} = ${fH('3−1', 4, 'var(--c6)')} = ${fH(2, 4, 'var(--c6)')} = ${fH(1, 2, 'var(--c6)')} (simplifié)</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> diviser.</div>
        <div style="margin-top:6px;">${fH(2, 3)} ÷ ${fH(1, 2)} = ${fH(2, 3)} × ${fH(2, 1, 'var(--c6)')} = ${fH('2×2', '3×1', 'var(--c6)')} = ${fH(4, 3, 'var(--correct)')}</div>`,
  },
  {
    label: 'Expression complexe',
    expr: `( ${fH(5, 8)} − ${fH(1, 4)} ) ÷ ( ${fH(1, 2)} + ${fH(1, 8)} )`,
    ans: { n: 24, d: 40 },
    steps: `<div><strong>Étape 1 :</strong> parenthèse du numérateur (LCD = 8).</div>
        <div style="margin-top:6px;">${showExpand(1, 4, 2, 'var(--c6)')} &nbsp;→&nbsp; ${fH(5, 8)} − ${fH(2, 8)} = ${fH(3, 8, 'var(--c6)')}</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> parenthèse du dénominateur (LCD = 8).</div>
        <div style="margin-top:6px;">${showExpand(1, 2, 4, 'var(--c6)')} &nbsp;→&nbsp; ${fH(4, 8)} + ${fH(1, 8)} = ${fH(5, 8, 'var(--c6)')}</div>
        <div style="margin-top:8px;"><strong>Étape 3 :</strong> diviser.</div>
        <div style="margin-top:6px;">${fH(3, 8)} ÷ ${fH(5, 8)} = ${fH(3, 8)} × ${fH(8, 5, 'var(--c6)')} = ${fH('3×8', '8×5', 'var(--c6)')} = ${fH(24, 40, 'var(--c6)')} = ${fH(3, 5, 'var(--correct)')} (simplifié)</div>`,
  },
  {
    label: 'Priorités opératoires',
    expr: `${fH(3, 4)} + ${fH(1, 2)} × ${fH(2, 3)}`,
    ans: { n: 13, d: 12 },
    steps: `<div><strong>Attention :</strong> la multiplication est prioritaire sur l'addition.</div>
        <div style="margin-top:8px;"><strong>Étape 1 :</strong> multiplication.</div>
        <div style="margin-top:6px;">${fH(1, 2)} × ${fH(2, 3)} = ${fH('1×2', '2×3', 'var(--c6)')} = ${fH(2, 6, 'var(--c6)')} = ${fH(1, 3, 'var(--c6)')} (simplifié)</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> addition (LCD = 12).</div>
        <div style="margin-top:6px;">${showExpand(3, 4, 3, 'var(--c6)')} &nbsp;; ${showExpand(1, 3, 4, 'var(--c6)')} &nbsp;→&nbsp; ${fH(9, 12)} + ${fH(4, 12)} = ${fH(13, 12, 'var(--correct)')}</div>`,
  },
  {
    label: 'Priorités opératoires',
    expr: `${fH(5, 6)} − ${fH(1, 4)} × ${fH(2, 3)}`,
    ans: { n: 24, d: 36 },
    steps: `<div><strong>Attention :</strong> la multiplication est prioritaire sur la soustraction.</div>
        <div style="margin-top:8px;"><strong>Étape 1 :</strong> multiplication.</div>
        <div style="margin-top:6px;">${fH(1, 4)} × ${fH(2, 3)} = ${fH('1×2', '4×3', 'var(--c6)')} = ${fH(2, 12, 'var(--c6)')} = ${fH(1, 6, 'var(--c6)')} (simplifié)</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> soustraction (LCD = 6, déjà commun).</div>
        <div style="margin-top:6px;">${fH(5, 6)} − ${fH(1, 6)} = ${fH('5−1', 6, 'var(--c6)')} = ${fH(4, 6, 'var(--c6)')} = ${fH(2, 3, 'var(--correct)')} (simplifié)</div>`,
  },
];

export function generateFractionsComplexSeries(): FractionExercise[] {
  // Shuffle and pick 10 (matches fcGenerate at Site.html:3536-3540).
  const pool = [...FC_BANK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  // Tag with op:'fc-complex' so the renderer can pick the c6 accent (var(--c6))
  // for the left-border instead of the regular per-op palette. We use 'add'
  // (#6EE7C0, closest to c6) — but the accentOverride approach is wired up
  // through the data layer: see fractions-complex.ts.
  return pool.slice(0, 10).map((q) => ({
    type: 'default',
    op: 'add',
    label: q.label,
    expr: q.expr,
    ans: q.ans,
    steps: q.steps,
    accentOverride: '#34D399', // var(--c6) — single accent for all fractions-complex cards
  }));
}
