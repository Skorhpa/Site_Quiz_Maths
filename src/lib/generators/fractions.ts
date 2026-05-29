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

function lcm2(a: number, b: number): number {
  return (a / frGcd(a, b)) * b;
}

function lcmArr(arr: number[]): number {
  return arr.reduce(lcm2, 1);
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
    {
      text: `Un magasin a vendu les ${fH(3, 4)} de ses stocks, dont les ${fH(2, 9)} étaient des articles soldés. Quelle fraction du stock total était des articles soldés vendus ?`,
      ans: { n: 6, d: 36 },
      steps: `${fH(3, 4)} × ${fH(2, 9)} = ${fH('3×2', '4×9', 'var(--c6)')} = ${fH(6, 36, 'var(--c6)')} = ${fH(1, 6, 'var(--correct)')} (simplifié)`,
    },
    {
      text: `Dans une école, les ${fH(2, 5)} des élèves font du sport, et parmi eux les ${fH(3, 4)} jouent au football. Quelle fraction de l'école joue au football ?`,
      ans: { n: 6, d: 20 },
      steps: `${fH(2, 5)} × ${fH(3, 4)} = ${fH('2×3', '5×4', 'var(--c6)')} = ${fH(6, 20, 'var(--c6)')} = ${fH(3, 10, 'var(--correct)')} (simplifié)`,
    },
    {
      text: `Les ${fH(5, 8)} des animaux d'une ferme sont des vaches, dont les ${fH(1, 5)} sont laitières. Quelle fraction des animaux sont des vaches laitières ?`,
      ans: { n: 5, d: 40 },
      steps: `${fH(5, 8)} × ${fH(1, 5)} = ${fH('5×1', '8×5', 'var(--c6)')} = ${fH(5, 40, 'var(--c6)')} = ${fH(1, 8, 'var(--correct)')} (simplifié)`,
    },
    {
      text: `Les ${fH(4, 7)} des joueurs d'un tournoi sont des adultes, et ${fH(3, 8)} d'entre eux jouent en finale. Quelle fraction des joueurs sont des adultes en finale ?`,
      ans: { n: 12, d: 56 },
      steps: `${fH(4, 7)} × ${fH(3, 8)} = ${fH('4×3', '7×8', 'var(--c6)')} = ${fH(12, 56, 'var(--c6)')} = ${fH(3, 14, 'var(--correct)')} (simplifié)`,
    },
    {
      text: `Les ${fH(3, 5)} des livres d'une bibliothèque sont des romans, dont les ${fH(5, 6)} ont été lus au moins une fois. Quelle fraction des livres sont des romans lus ?`,
      ans: { n: 15, d: 30 },
      steps: `${fH(3, 5)} × ${fH(5, 6)} = ${fH('3×5', '5×6', 'var(--c6)')} = ${fH(15, 30, 'var(--c6)')} = ${fH(1, 2, 'var(--correct)')} (simplifié)`,
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
      step3: `24 × ${fH(3, 4)} = 18 romans empruntés`,
      ans: { n: 18, d: 1 },
    },
    {
      text: `Une épicière a 36 pommes. Elle en vend les ${fH(1, 4)} le matin. Avec ce qui reste, elle utilise les ${fH(2, 3)} pour faire des tartes. Combien de pommes utilise-t-elle pour les tartes ?`,
      step1: `36 × ${fH(1, 4)} = 9 pommes vendues`,
      step2: 'Reste = 36 − 9 = 27 pommes',
      step3: `27 × ${fH(2, 3)} = 18 pommes pour les tartes`,
      ans: { n: 18, d: 1 },
    },
    {
      text: `Un boulanger prépare 48 croissants. Il en distribue les ${fH(1, 6)} à une association. Avec ce qui reste, il en vend les ${fH(3, 4)} en boutique. Combien de croissants vend-il en boutique ?`,
      step1: `48 × ${fH(1, 6)} = 8 croissants distribués`,
      step2: 'Reste = 48 − 8 = 40 croissants',
      step3: `40 × ${fH(3, 4)} = 30 croissants vendus en boutique`,
      ans: { n: 30, d: 1 },
    },
    {
      text: `Sophie a 60 billes. Elle donne les ${fH(2, 5)} à son frère. Avec ce qui reste, elle perd les ${fH(1, 3)} au jeu. Combien de billes perd-elle ?`,
      step1: `60 × ${fH(2, 5)} = 24 billes données`,
      step2: 'Reste = 60 − 24 = 36 billes',
      step3: `36 × ${fH(1, 3)} = 12 billes perdues`,
      ans: { n: 12, d: 1 },
    },
    {
      text: `Un fermier a 80 poules. Il en vend les ${fH(3, 8)} au marché. Avec ce qui reste, les ${fH(1, 5)} pondent chaque jour. Combien de poules pondent chaque jour ?`,
      step1: `80 × ${fH(3, 8)} = 30 poules vendues`,
      step2: 'Reste = 80 − 30 = 50 poules',
      step3: `50 × ${fH(1, 5)} = 10 poules pondent chaque jour`,
      ans: { n: 10, d: 1 },
    },
    {
      text: `Une école a 120 élèves. Les ${fH(1, 4)} sont absents un lundi. Parmi les présents, les ${fH(2, 5)} participent au sport. Combien d'élèves participent au sport ?`,
      step1: `120 × ${fH(1, 4)} = 30 élèves absents`,
      step2: 'Présents = 120 − 30 = 90 élèves',
      step3: `90 × ${fH(2, 5)} = 36 élèves participent au sport`,
      ans: { n: 36, d: 1 },
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

// Pairwise coprime → LCD = d1×d2×d3
const ADD_COPRIME_TRIPLETS: [number, number, number][] = [
  [2, 3, 5],
  [2, 3, 7],
  [3, 4, 5],
];

// d1, d2, d3 each coprime with D (last element) → LCD < product
const ADD_COPRIME_QUADS: [number, number, number, number][] = [
  [2, 3, 4, 5],
  [2, 3, 4, 7],
];

// All different; last element = lcm of the others
const MULTIPLE_TRIPLETS: [number, number, number][] = [
  [2, 3, 6],
  [3, 4, 12],
  [4, 6, 12],
  [2, 5, 10],
  [3, 5, 15],
  [2, 7, 14],
];

const MULTIPLE_QUADS: [number, number, number, number][] = [
  [2, 3, 4, 12],
  [3, 4, 6, 12],
  [2, 4, 6, 12],
  [2, 3, 9, 18],
  [2, 4, 5, 20],
];

function makeAddMultipleN(count: 2 | 3 | 4): FractionExercise {
  if (count === 2) return makeAdd('multiple');
  const denoms: number[] = count === 3 ? [...pick(MULTIPLE_TRIPLETS)] : [...pick(MULTIPLE_QUADS)];
  const D = denoms[denoms.length - 1]!;  // equals lcm of the others by construction
  const ks = denoms.map((d) => D / d);
  const nums = denoms.map((d) => Math.floor(Math.random() * (d - 1)) + 1);
  const rn = nums.reduce((acc, n, i) => acc + n * ks[i]!, 0);
  const rd = D;
  const s = frSimplify(rn, rd);
  const expr = nums.map((n, i) => fH(n, denoms[i]!)).join(' + ');
  // Only fractions whose denom ≠ D need expanding (last element has k=1, skip it)
  const expandParts = denoms.slice(0, -1).map((d, i) => showExpand(nums[i]!, d, ks[i]!, 'var(--c6)'));
  const expandedFracs = nums.map((n, i) => fH(n * ks[i]!, D)).join(' + ');
  const sumStr = nums.map((n, i) => n * ks[i]!).join('+');
  const simplified = !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : '';
  const tableDesc = denoms.slice(0, -1).map((d, i) => `de ${d} (×${ks[i]})`).join(', ');
  const steps = `<div><strong>${D}</strong> est dans la table ${tableDesc}. Le dénominateur commun est <strong>${D}</strong>.</div>
    <div style="margin-top:6px;">${expandParts.join(' &nbsp;; ')}</div>
    <div style="margin-top:6px;">${expandedFracs} = ${fH(sumStr, D, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${simplified}</div>`;
  return ex({ op: 'add', label: 'Addition', expr, ans: { n: rn, d: rd }, steps });
}

function makeAddCoprimeN(count: 2 | 3 | 4): FractionExercise {
  if (count === 2) return makeAdd('coprime');
  const denoms: number[] = count === 3 ? [...pick(ADD_COPRIME_TRIPLETS)] : [...pick(ADD_COPRIME_QUADS)];
  const L = lcmArr(denoms);
  const ks = denoms.map((d) => L / d);
  const nums = denoms.map((d) => Math.floor(Math.random() * (d - 1)) + 1);
  const rn = nums.reduce((acc, n, i) => acc + n * ks[i]!, 0);
  const rd = L;
  const s = frSimplify(rn, rd);
  const expr = nums.map((n, i) => fH(n, denoms[i]!)).join(' + ');
  const expandParts = nums.map((n, i) =>
    ks[i]! === 1
      ? `${fH(n, denoms[i]!)} (déjà au dénominateur ${L})`
      : showExpand(n, denoms[i]!, ks[i]!, 'var(--c6)')
  );
  const expandedNums = nums.map((n, i) => n * ks[i]!);
  const expandedFracs = expandedNums.map((n) => fH(n, L)).join(' + ');
  const sumStr = expandedNums.join('+');
  const simplified = !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : '';
  const D = denoms[denoms.length - 1]!;
  const line1 = count === 3
    ? `Aucun de ces dénominateurs n'est dans la table d'un autre. Le dénominateur commun est ${denoms[0]}×${denoms[1]}×${denoms[2]} = <strong>${L}</strong>.`
    : `Les dénominateurs ${denoms.slice(0, -1).join(', ')} sont tous premiers avec ${D} (le plus grand). Le plus petit dénominateur commun est <strong>${L}</strong>.`;
  const steps = `<div>${line1}</div>
    <div style="margin-top:6px;">${expandParts.join(' &nbsp;; ')}</div>
    <div style="margin-top:6px;">${expandedFracs} = ${fH(sumStr, L, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${simplified}</div>`;
  return ex({ op: 'add', label: 'Addition', expr, ans: { n: rn, d: rd }, steps });
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

function makeAddNegN(count: 2 | 3 | 4): FractionExercise {
  if (count === 2) return makeAddNeg();
  const denoms: number[] = count === 3 ? [...pick(ADD_COPRIME_TRIPLETS)] : [...pick(ADD_COPRIME_QUADS)];
  const L = lcmArr(denoms);
  const ks = denoms.map((d) => L / d);
  const nums = denoms.map((d, i) => {
    const n = Math.floor(Math.random() * (d - 1)) + 1;
    return i === 0 ? -n : n;
  });
  const rn = nums.reduce((acc, n, i) => acc + n * ks[i]!, 0);
  const rd = L;
  const s = frSimplify(Math.abs(rn), rd);
  const expr = nums.map((n, i) => fH(n, denoms[i]!)).join(' + ');
  const expandParts = nums.map((n, i) =>
    ks[i]! === 1
      ? `${fH(n, denoms[i]!)} (déjà au dénominateur ${L})`
      : showExpand(n, denoms[i]!, ks[i]!, 'var(--c6)')
  );
  const expandedNums = nums.map((n, i) => n * ks[i]!);
  const expandedFracs = expandedNums.map((n) => fH(n, L)).join(' + ');
  const sumStr = expandedNums.map(String).join('+');
  const simplified = !frIsSimplified(Math.abs(rn), rd)
    ? ` = ${fH(rn < 0 ? -s.n : s.n, s.d, 'var(--correct)')} (simplifié)`
    : '';
  const D = denoms[denoms.length - 1]!;
  const line1 = count === 3
    ? `Aucun de ces dénominateurs n'est dans la table d'un autre. Le dénominateur commun est ${denoms[0]}×${denoms[1]}×${denoms[2]} = <strong>${L}</strong>.`
    : `Les dénominateurs ${denoms.slice(0, -1).join(', ')} sont tous premiers avec ${D} (le plus grand). Le plus petit dénominateur commun est <strong>${L}</strong>.`;
  const steps = `<div>${line1}</div>
    <div style="margin-top:6px;">${expandParts.join(' &nbsp;; ')}</div>
    <div style="margin-top:6px;">${expandedFracs} = ${fH(sumStr, L, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${simplified}</div>
    <div style="margin-top:4px;color:var(--muted);font-size:12px;">Rappel : ajouter un nombre négatif revient à soustraire sa valeur absolue.</div>`;
  return ex({ op: 'add', label: 'Addition', expr, ans: { n: rn, d: rd }, steps });
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

function makeSubFirstQ(count: 2 | 3 | 4): FractionExercise {
  if (count === 2) return makeSub('same');
  const d = pick([6, 7, 8, 9, 10, 11, 12]);
  const maxSub = Math.max(1, Math.floor(d / (count + 1)));
  const subs = Array.from({ length: count - 1 }, () => Math.floor(Math.random() * maxSub) + 1);
  const subSum = subs.reduce((a, b) => a + b, 0);
  const a = subSum + Math.floor(Math.random() * maxSub) + 1;
  const rn = a - subSum;
  const s = frSimplify(rn, d);
  const subFracs = subs.map((n) => fH(n, d)).join(' − ');
  const expr = `${fH(a, d)} − ${subFracs}`;
  const subNumsStr = subs.join('−');
  const simplified = !frIsSimplified(rn, d) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : '';
  const steps = `<div>Les fractions ont le même dénominateur, on soustrait les numérateurs.</div>
    <div style="margin-top:6px;">${expr} = ${fH(`${a}−${subNumsStr}`, d, 'var(--c6)')} = ${fH(rn, d, 'var(--c6)')}${simplified}</div>`;
  return ex({ op: 'sub', label: 'Soustraction', expr, ans: { n: rn, d }, steps });
}

function makeSubMultipleN(count: 2 | 3 | 4): FractionExercise {
  if (count === 2) return makeSub('multiple');
  const denoms: number[] = count === 3 ? [...pick(MULTIPLE_TRIPLETS)] : [...pick(MULTIPLE_QUADS)];
  const D = denoms[denoms.length - 1]!;
  const ks = denoms.map((d) => D / d);
  let nums: number[];
  do {
    nums = denoms.map((d) => Math.floor(Math.random() * (d - 1)) + 1);
  } while (nums.reduce((acc, n, i) => acc + n * ks[i]! * (i === 0 ? 1 : -1), 0) <= 0);
  const expandedNums = nums.map((n, i) => n * ks[i]!);
  const rn = expandedNums[0]! - expandedNums.slice(1).reduce((a, b) => a + b, 0);
  const rd = D;
  const s = frSimplify(rn, rd);
  const expr = nums.map((n, i) => fH(n, denoms[i]!)).join(' − ');
  const expandParts = denoms.slice(0, -1).map((d, i) => showExpand(nums[i]!, d, ks[i]!, 'var(--c6)'));
  const expandedFracs = expandedNums.map((n) => fH(n, D)).join(' − ');
  const sumStr = `${expandedNums[0]}−${expandedNums.slice(1).join('−')}`;
  const simplified = !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : '';
  const tableDesc = denoms.slice(0, -1).map((d, i) => `de ${d} (×${ks[i]})`).join(', ');
  const steps = `<div><strong>${D}</strong> est dans la table ${tableDesc}. Le dénominateur commun est <strong>${D}</strong>.</div>
    <div style="margin-top:6px;">${expandParts.join(' &nbsp;; ')}</div>
    <div style="margin-top:6px;">${expandedFracs} = ${fH(sumStr, D, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${simplified}</div>`;
  return ex({ op: 'sub', label: 'Soustraction', expr, ans: { n: rn, d: rd }, steps });
}

function makeSubCoprimeN(count: 2 | 3 | 4): FractionExercise {
  if (count === 2) return makeSub('coprime');
  const denoms: number[] = count === 3 ? [...pick(ADD_COPRIME_TRIPLETS)] : [...pick(ADD_COPRIME_QUADS)];
  const D = denoms[denoms.length - 1]!;
  const L = lcmArr(denoms);
  const ks = denoms.map((d) => L / d);
  let nums: number[];
  do {
    nums = denoms.map((d) => Math.floor(Math.random() * (d - 1)) + 1);
  } while (nums.reduce((acc, n, i) => acc + n * ks[i]! * (i === 0 ? 1 : -1), 0) <= 0);
  const expandedNums = nums.map((n, i) => n * ks[i]!);
  const rn = expandedNums[0]! - expandedNums.slice(1).reduce((a, b) => a + b, 0);
  const rd = L;
  const s = frSimplify(rn, rd);
  const expr = nums.map((n, i) => fH(n, denoms[i]!)).join(' − ');
  const expandParts = nums.map((n, i) =>
    ks[i]! === 1
      ? `${fH(n, denoms[i]!)} (déjà au dénominateur ${L})`
      : showExpand(n, denoms[i]!, ks[i]!, 'var(--c6)')
  );
  const expandedFracs = expandedNums.map((n) => fH(n, L)).join(' − ');
  const sumStr = `${expandedNums[0]}−${expandedNums.slice(1).join('−')}`;
  const simplified = !frIsSimplified(rn, rd) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : '';
  const line1 = count === 3
    ? `Aucun de ces dénominateurs n'est dans la table d'un autre. Le dénominateur commun est ${denoms[0]}×${denoms[1]}×${denoms[2]} = <strong>${L}</strong>.`
    : `Les dénominateurs ${denoms.slice(0, -1).join(', ')} sont tous premiers avec ${D} (le plus grand). Le plus petit dénominateur commun est <strong>${L}</strong>.`;
  const steps = `<div>${line1}</div>
    <div style="margin-top:6px;">${expandParts.join(' &nbsp;; ')}</div>
    <div style="margin-top:6px;">${expandedFracs} = ${fH(sumStr, L, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${simplified}</div>`;
  return ex({ op: 'sub', label: 'Soustraction', expr, ans: { n: rn, d: rd }, steps });
}

function makeSubNegN(count: 2 | 3 | 4): FractionExercise {
  if (count === 2) return makeSubNeg();
  const denoms: number[] = count === 3 ? [...pick(ADD_COPRIME_TRIPLETS)] : [...pick(ADD_COPRIME_QUADS)];
  const D = denoms[denoms.length - 1]!;
  const L = lcmArr(denoms);
  const ks = denoms.map((d) => L / d);
  let nums: number[];
  do {
    nums = denoms.map((d) => Math.floor(Math.random() * (d - 1)) + 1);
  } while (nums.reduce((acc, n, i) => acc + n * ks[i]! * (i === 0 ? 1 : -1), 0) >= 0);
  const expandedNums = nums.map((n, i) => n * ks[i]!);
  const rn = expandedNums[0]! - expandedNums.slice(1).reduce((a, b) => a + b, 0);
  const rd = L;
  const s = frSimplify(Math.abs(rn), rd);
  const expr = nums.map((n, i) => fH(n, denoms[i]!)).join(' − ');
  const expandParts = nums.map((n, i) =>
    ks[i]! === 1
      ? `${fH(n, denoms[i]!)} (déjà au dénominateur ${L})`
      : showExpand(n, denoms[i]!, ks[i]!, 'var(--c6)')
  );
  const expandedFracs = expandedNums.map((n) => fH(n, L)).join(' − ');
  const sumStr = `${expandedNums[0]}−${expandedNums.slice(1).join('−')}`;
  const simplified = !frIsSimplified(Math.abs(rn), rd)
    ? ` = ${fH(-s.n, s.d, 'var(--correct)')} (simplifié)`
    : '';
  const line1 = count === 3
    ? `Aucun de ces dénominateurs n'est dans la table d'un autre. Le dénominateur commun est ${denoms[0]}×${denoms[1]}×${denoms[2]} = <strong>${L}</strong>.`
    : `Les dénominateurs ${denoms.slice(0, -1).join(', ')} sont tous premiers avec ${D} (le plus grand). Le plus petit dénominateur commun est <strong>${L}</strong>.`;
  const restSum = expandedNums.slice(1).reduce((a, b) => a + b, 0);
  const steps = `<div>${line1}</div>
    <div style="margin-top:6px;">${expandParts.join(' &nbsp;; ')}</div>
    <div style="margin-top:6px;">${expandedFracs} = ${fH(sumStr, L, 'var(--c6)')} = ${fH(rn, rd, 'var(--c6)')}${simplified}</div>
    <div style="margin-top:4px;color:var(--muted);font-size:12px;">Le résultat est négatif car ${expandedNums[0]} &lt; ${restSum}.</div>`;
  return ex({ op: 'sub', label: 'Soustraction', expr, ans: { n: rn, d: rd }, steps });
}

export function makeSubAtPos(pos: 0 | 1 | 2 | 3 | 4, count: 2 | 3 | 4): FractionExercise {
  if (pos === 0) return makeSubFirstQ(count);
  if (pos === 1) return makeSubMultipleN(count);
  if (pos === 2 || pos === 3) return makeSubCoprimeN(count);
  return makeSubNegN(count);
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

export function makeAddFirstQ(count: 2 | 3 | 4): FractionExercise {
  if (count === 2) return makeAdd('same');
  const d = pick([5, 6, 7, 8, 9, 10, 11, 12]);
  const nums: number[] = Array.from({ length: count }, () => Math.floor(Math.random() * (d - 1)) + 1);
  const rn = nums.reduce((a, b) => a + b, 0);
  const s = frSimplify(rn, d);
  const fracs = nums.map((n) => fH(n, d)).join(' + ');
  const numSum = nums.join('+');
  const simplified = !frIsSimplified(rn, d) ? ` = ${fH(s.n, s.d, 'var(--correct)')} (simplifié)` : '';
  const steps = `<div>Les fractions ont le même dénominateur, on additionne les numérateurs.</div>
    <div style="margin-top:6px;">${fracs} = ${fH(numSum, d, 'var(--c6)')} = ${fH(rn, d, 'var(--c6)')}${simplified}</div>`;
  return ex({ op: 'add', label: 'Addition', expr: fracs, ans: { n: rn, d }, steps });
}

export function makeAddAtPos(pos: 0 | 1 | 2 | 3 | 4, count: 2 | 3 | 4): FractionExercise {
  if (pos === 0) return makeAddFirstQ(count);
  if (pos === 1) return makeAddMultipleN(count);
  if (pos === 2 || pos === 3) return makeAddCoprimeN(count);
  return makeAddNegN(count);
}

export function generateAddSeries(): FractionExercise[] {
  return [makeAdd('same'), makeAdd('multiple'), makeAdd('coprime'), makeAdd('coprime'), makeAddNeg()];
}

export function generateSubSeries(): FractionExercise[] {
  return [makeSub('same'), makeSub('multiple'), makeSub('coprime'), makeSub('coprime'), makeSubNeg()];
}

export function generateMulSeries(): FractionExercise[] {
  return [makeMulSimple(), makeMulSimple(), makeMulNeg(), makeMulBig()];
}

export function generateDivSeries(): FractionExercise[] {
  return [makeDiv('fracbyfrac'), makeDiv('fracbyfrac'), makeDiv('fracbyfrac'), makeDiv('fracbyint'), makeDivNeg()];
}

function makeResidualProblem1(): FractionExercise {
  const probs = [
    {
      text: `Dans une classe, les élèves ont voté pour leurs activités préférées : ${fH(1, 3)} ont choisi la natation, ${fH(1, 4)} le football et ${fH(1, 6)} le tennis. Quelle fraction des élèves n'a pas voté pour ces trois activités ?`,
      lcd: 12, k1: 4, k2: 3, k3: 2, n1: 1, d1: 3, n2: 1, d2: 4, n3: 1, d3: 6,
      sum: { n: 3, d: 4 }, ans: { n: 1, d: 4 },
      context: 'dénominateur commun de 3, 4 et 6',
    },
    {
      text: `Une classe choisit des activités parascolaires : ${fH(1, 2)} des élèves font de la lecture, ${fH(1, 5)} du sport et ${fH(1, 10)} de la musique. Quelle fraction ne participe à aucune de ces activités ?`,
      lcd: 10, k1: 5, k2: 2, k3: 1, n1: 1, d1: 2, n2: 1, d2: 5, n3: 1, d3: 10,
      sum: { n: 4, d: 5 }, ans: { n: 1, d: 5 },
      context: 'dénominateur commun de 2, 5 et 10',
    },
    {
      text: `Dans un club, ${fH(3, 8)} des membres font du dessin, ${fH(1, 4)} de la danse et ${fH(1, 8)} du théâtre. Quelle fraction des membres ne pratique aucune de ces activités ?`,
      lcd: 8, k1: 1, k2: 2, k3: 1, n1: 3, d1: 8, n2: 1, d2: 4, n3: 1, d3: 8,
      sum: { n: 3, d: 4 }, ans: { n: 1, d: 4 },
      context: 'dénominateur commun de 8, 4 et 8',
    },
    {
      text: `Lors d'un vote, ${fH(5, 12)} des élèves ont choisi le football, ${fH(1, 3)} le basket et ${fH(1, 12)} le volley. Quelle fraction des élèves n'a voté pour aucun de ces sports ?`,
      lcd: 12, k1: 1, k2: 4, k3: 1, n1: 5, d1: 12, n2: 1, d2: 3, n3: 1, d3: 12,
      sum: { n: 5, d: 6 }, ans: { n: 1, d: 6 },
      context: 'dénominateur commun de 12, 3 et 12',
    },
    {
      text: `Des élèves choisissent un sport : ${fH(1, 4)} font de la natation, ${fH(1, 3)} du vélo et ${fH(1, 6)} de la course à pied. Quelle fraction ne pratique aucun de ces sports ?`,
      lcd: 12, k1: 3, k2: 4, k3: 2, n1: 1, d1: 4, n2: 1, d2: 3, n3: 1, d3: 6,
      sum: { n: 3, d: 4 }, ans: { n: 1, d: 4 },
      context: 'dénominateur commun de 4, 3 et 6',
    },
    {
      text: `Dans un atelier d'arts plastiques, ${fH(3, 10)} des élèves font de la peinture, ${fH(2, 5)} de la sculpture et ${fH(1, 10)} de la photographie. Quelle fraction ne participe à aucune de ces activités ?`,
      lcd: 10, k1: 1, k2: 2, k3: 1, n1: 3, d1: 10, n2: 2, d2: 5, n3: 1, d3: 10,
      sum: { n: 4, d: 5 }, ans: { n: 1, d: 5 },
      context: 'dénominateur commun de 10, 5 et 10',
    },
    {
      text: `Une classe choisit des loisirs numériques : ${fH(2, 5)} jouent aux jeux vidéo, ${fH(1, 4)} font du sport et ${fH(3, 20)} regardent des séries. Quelle fraction ne fait aucune de ces activités ?`,
      lcd: 20, k1: 4, k2: 5, k3: 1, n1: 2, d1: 5, n2: 1, d2: 4, n3: 3, d3: 20,
      sum: { n: 4, d: 5 }, ans: { n: 1, d: 5 },
      context: 'dénominateur commun de 5, 4 et 20',
    },
    {
      text: `Dans une équipe, ${fH(7, 12)} jouent au football, ${fH(1, 6)} font de la natation et ${fH(1, 12)} jouent au basket. Quelle fraction ne pratique aucun de ces sports ?`,
      lcd: 12, k1: 1, k2: 2, k3: 1, n1: 7, d1: 12, n2: 1, d2: 6, n3: 1, d3: 12,
      sum: { n: 5, d: 6 }, ans: { n: 1, d: 6 },
      context: 'dénominateur commun de 12, 6 et 12',
    },
  ];
  const p = pick(probs);
  const stepsExpand = p.k1 > 1
    ? `${showExpand(p.n1, p.d1, p.k1, 'var(--c6)')} &nbsp;; ${showExpand(p.n2, p.d2, p.k2, 'var(--c6)')}${p.k3 > 1 ? ` &nbsp;; ${showExpand(p.n3, p.d3, p.k3, 'var(--c6)')}` : ` &nbsp;; ${fH(p.n3, p.d3)} (déjà au bon dénominateur)`}`
    : `${fH(p.n1, p.d1)} (déjà au bon dénominateur) &nbsp;; ${showExpand(p.n2, p.d2, p.k2, 'var(--c6)')}${p.k3 > 1 ? ` &nbsp;; ${showExpand(p.n3, p.d3, p.k3, 'var(--c6)')}` : ` &nbsp;; ${fH(p.n3, p.d3)} (déjà au bon dénominateur)`}`;
  const r1 = p.n1 * p.k1, r2 = p.n2 * p.k2, r3 = p.n3 * p.k3;
  const steps = `<div><strong>Étape 1 :</strong> trouver le ${p.context}. C'est <strong>${p.lcd}</strong>.</div>
    <div style="margin-top:6px;">${stepsExpand}</div>
    <div style="margin-top:6px;">${fH(r1, p.lcd)} + ${fH(r2, p.lcd)} + ${fH(r3, p.lcd)} = ${fH(`${r1}+${r2}+${r3}`, p.lcd, 'var(--c6)')} = ${fH(r1+r2+r3, p.lcd, 'var(--c6)')} = ${fH(p.sum.n, p.sum.d, 'var(--c6)')} (simplifié)</div>
    <div style="margin-top:8px;"><strong>Étape 2 :</strong> calculer le reste : 1 − ${fH(p.sum.n, p.sum.d)} = ${fH(p.sum.d, p.sum.d)} − ${fH(p.sum.n, p.sum.d)} = ${fH(p.ans.n, p.ans.d, 'var(--correct)')}</div>`;
  return ex({
    op: 'add',
    label: 'Problème',
    expr: `<span style="font-size:14px;line-height:1.8;">${p.text}</span>`,
    ans: p.ans,
    steps: `<div style="line-height:2;">${steps}</div>`,
  });
}

function makeResidualProblem2(): FractionExercise {
  const probs = [
    {
      text: `Julie prépare un gâteau. Elle utilise ${fH(1, 3)} de son sac de farine pour la pâte, ${fH(3, 8)} pour la crème et ${fH(1, 6)} pour les finitions. Quelle fraction du sac de farine lui reste-t-il ?`,
      lcd: 24, k1: 8, k2: 3, k3: 4, n1: 1, d1: 3, n2: 3, d2: 8, n3: 1, d3: 6,
      sum: { n: 7, d: 8 }, ans: { n: 1, d: 8 }, context: 'dénominateur commun de 3, 8 et 6',
    },
    {
      text: `Un maçon utilise ${fH(1, 4)} de son sac de ciment pour les fondations, ${fH(3, 8)} pour les murs et ${fH(1, 8)} pour les finitions. Quelle fraction du sac reste-t-il ?`,
      lcd: 8, k1: 2, k2: 1, k3: 1, n1: 1, d1: 4, n2: 3, d2: 8, n3: 1, d3: 8,
      sum: { n: 3, d: 4 }, ans: { n: 1, d: 4 }, context: 'dénominateur commun de 4, 8 et 8',
    },
    {
      text: `Marie prépare une corbeille de fruits. Elle utilise ${fH(2, 5)} du panier pour les pommes, ${fH(1, 4)} pour les poires et ${fH(1, 10)} pour les cerises. Quelle fraction du panier reste vide ?`,
      lcd: 20, k1: 4, k2: 5, k3: 2, n1: 2, d1: 5, n2: 1, d2: 4, n3: 1, d3: 10,
      sum: { n: 3, d: 4 }, ans: { n: 1, d: 4 }, context: 'dénominateur commun de 5, 4 et 10',
    },
    {
      text: `Un boulanger utilise ${fH(5, 12)} de sa farine le matin, ${fH(1, 3)} l'après-midi et ${fH(1, 12)} le soir. Quelle fraction de la farine lui reste-t-il ?`,
      lcd: 12, k1: 1, k2: 4, k3: 1, n1: 5, d1: 12, n2: 1, d2: 3, n3: 1, d3: 12,
      sum: { n: 5, d: 6 }, ans: { n: 1, d: 6 }, context: 'dénominateur commun de 12, 3 et 12',
    },
    {
      text: `Thomas consacre ${fH(3, 10)} de son temps libre à la lecture, ${fH(2, 5)} au sport et ${fH(1, 5)} à la musique. Quelle fraction de son temps libre lui reste-t-il ?`,
      lcd: 10, k1: 1, k2: 2, k3: 2, n1: 3, d1: 10, n2: 2, d2: 5, n3: 1, d3: 5,
      sum: { n: 9, d: 10 }, ans: { n: 1, d: 10 }, context: 'dénominateur commun de 10, 5 et 5',
    },
    {
      text: `Un jardinier consacre ${fH(5, 12)} de son terrain à la pelouse, ${fH(1, 4)} aux fleurs et ${fH(1, 6)} au potager. Quelle fraction du terrain n'est pas encore aménagée ?`,
      lcd: 12, k1: 1, k2: 3, k3: 2, n1: 5, d1: 12, n2: 1, d2: 4, n3: 1, d3: 6,
      sum: { n: 5, d: 6 }, ans: { n: 1, d: 6 }, context: 'dénominateur commun de 12, 4 et 6',
    },
    {
      text: `Une peintre utilise ${fH(2, 5)} de son pot pour les murs, ${fH(1, 4)} pour le plafond et ${fH(3, 20)} pour les boiseries. Quelle fraction du pot lui reste-t-il ?`,
      lcd: 20, k1: 4, k2: 5, k3: 1, n1: 2, d1: 5, n2: 1, d2: 4, n3: 3, d3: 20,
      sum: { n: 4, d: 5 }, ans: { n: 1, d: 5 }, context: 'dénominateur commun de 5, 4 et 20',
    },
    {
      text: `Une imprimante utilise ${fH(7, 24)} de son encre pour les titres, ${fH(5, 12)} pour le texte et ${fH(1, 8)} pour les images. Quelle fraction de l'encre reste-t-il ?`,
      lcd: 24, k1: 1, k2: 2, k3: 3, n1: 7, d1: 24, n2: 5, d2: 12, n3: 1, d3: 8,
      sum: { n: 5, d: 6 }, ans: { n: 1, d: 6 }, context: 'dénominateur commun de 24, 12 et 8',
    },
  ];
  const p = pick(probs);
  const r1 = p.n1 * p.k1, r2 = p.n2 * p.k2, r3 = p.n3 * p.k3;
  const expand1 = p.k1 > 1 ? showExpand(p.n1, p.d1, p.k1, 'var(--c6)') : `${fH(p.n1, p.d1)} (déjà au bon dénominateur)`;
  const expand2 = p.k2 > 1 ? showExpand(p.n2, p.d2, p.k2, 'var(--c6)') : `${fH(p.n2, p.d2)} (déjà au bon dénominateur)`;
  const expand3 = p.k3 > 1 ? showExpand(p.n3, p.d3, p.k3, 'var(--c6)') : `${fH(p.n3, p.d3)} (déjà au bon dénominateur)`;
  const steps = `<div><strong>Étape 1 :</strong> trouver le ${p.context}. C'est <strong>${p.lcd}</strong>.</div>
    <div style="margin-top:6px;">${expand1} &nbsp;; ${expand2} &nbsp;; ${expand3}</div>
    <div style="margin-top:6px;">${fH(r1, p.lcd)} + ${fH(r2, p.lcd)} + ${fH(r3, p.lcd)} = ${fH(`${r1}+${r2}+${r3}`, p.lcd, 'var(--c6)')} = ${fH(r1+r2+r3, p.lcd, 'var(--c6)')} = ${fH(p.sum.n, p.sum.d, 'var(--c6)')} (simplifié)</div>
    <div style="margin-top:8px;"><strong>Étape 2 :</strong> calculer le reste : 1 − ${fH(p.sum.n, p.sum.d)} = ${fH(p.sum.d, p.sum.d)} − ${fH(p.sum.n, p.sum.d)} = ${fH(p.ans.n, p.ans.d, 'var(--correct)')}</div>`;
  return ex({
    op: 'add',
    label: 'Problème',
    expr: `<span style="font-size:14px;line-height:1.8;">${p.text}</span>`,
    ans: p.ans,
    steps: `<div style="line-height:2;">${steps}</div>`,
  });
}

export function generateProblemsSeries(): FractionExercise[] {
  return [makeMulProblem1(), makeMulProblem2(), makeResidualProblem1(), makeResidualProblem2()];
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
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse (dénominateur commun = 6).</div>
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
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse (dénominateur commun = 4).</div>
        <div style="margin-top:6px;">${showExpand(1, 2, 2, 'var(--c6)')} &nbsp;→&nbsp; ${fH(2, 4)} + ${fH(1, 4)} = ${fH(3, 4, 'var(--c6)')}</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> diviser.</div>
        <div style="margin-top:6px;">${fH(3, 4)} ÷ ${fH(3, 4)} = ${fH(3, 4)} × ${fH(4, 3, 'var(--c6)')} = ${fH('3×4', '4×3', 'var(--c6)')} = ${fH(12, 12, 'var(--c6)')} = <strong style="color:var(--correct);">1</strong></div>`,
  },
  {
    label: "Division d'une expression",
    expr: `( ${fH(1, 2)} + ${fH(1, 3)} ) ÷ ${fH(5, 6)}`,
    ans: { n: 30, d: 30 },
    steps: `<div><strong>Étape 1 :</strong> calculer la parenthèse (dénominateur commun = 6).</div>
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
    steps: `<div><strong>Étape 1 :</strong> parenthèse du numérateur (dénominateur commun = 8).</div>
        <div style="margin-top:6px;">${showExpand(1, 4, 2, 'var(--c6)')} &nbsp;→&nbsp; ${fH(5, 8)} − ${fH(2, 8)} = ${fH(3, 8, 'var(--c6)')}</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> parenthèse du dénominateur (dénominateur commun = 8).</div>
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
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> addition (dénominateur commun = 12).</div>
        <div style="margin-top:6px;">${showExpand(3, 4, 3, 'var(--c6)')} &nbsp;; ${showExpand(1, 3, 4, 'var(--c6)')} &nbsp;→&nbsp; ${fH(9, 12)} + ${fH(4, 12)} = ${fH(13, 12, 'var(--correct)')}</div>`,
  },
  {
    label: 'Priorités opératoires',
    expr: `${fH(5, 6)} − ${fH(1, 4)} × ${fH(2, 3)}`,
    ans: { n: 24, d: 36 },
    steps: `<div><strong>Attention :</strong> la multiplication est prioritaire sur la soustraction.</div>
        <div style="margin-top:8px;"><strong>Étape 1 :</strong> multiplication.</div>
        <div style="margin-top:6px;">${fH(1, 4)} × ${fH(2, 3)} = ${fH('1×2', '4×3', 'var(--c6)')} = ${fH(2, 12, 'var(--c6)')} = ${fH(1, 6, 'var(--c6)')} (simplifié)</div>
        <div style="margin-top:8px;"><strong>Étape 2 :</strong> soustraction (dénominateur commun = 6).</div>
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
