import type { ArithExercise, ArithSubtype } from '@/types';

const COLORS: Record<ArithSubtype, string> = {
  divisors: '#fb7185',
  criteria: '#fb7185',
  multiples: '#f9a8d4',
  spotnonprime: '#fda4af',
  decompo: '#fda4af',
  pgcd: '#fda4af',
};

const PRIMES_UNDER_13 = [2, 3, 5, 7, 11, 13];

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

export function divisors(n: number): number[] {
  const d: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i);
  return d;
}

export function primeFactors(n: number): number[] {
  const f: number[] = [];
  let x = n;
  for (let i = 2; i <= x; i++) while (x % i === 0) {
    f.push(i);
    x /= i;
  }
  return f;
}

export function factStr(arr: number[]): string {
  return arr.join(' × ');
}

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

export function normList(s: string): number[] {
  return s
    .replace(/\s/g, '')
    .split(/[;,]/)
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0)
    .sort((a, b) => a - b);
}

const randFrom = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const shuffleArr = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

function makeDivisors(): ArithExercise {
  const pool = [12, 18, 24, 30, 36, 20, 28, 40, 42, 48, 60, 72];
  const n = randFrom(pool);
  const divs = divisors(n);
  const half = divs.slice(0, Math.ceil(divs.length / 2));
  const steps = `<div style="color:var(--text);">On teste tous les entiers de 1 à ${n} :</div>
    <div style="margin-top:6px;font-family:'DM Mono',monospace;line-height:2;">${divs
      .map(
        (d) =>
          `<span style="background:rgba(251,113,133,0.12);padding:2px 8px;border-radius:6px;margin:2px;">${d}</span>`,
      )
      .join(' ')}</div>
    <div style="margin-top:6px;color:var(--muted);font-size:12px;">Méthode : on cherche des paires — ${half
      .map((d) => `${d}×${n / d}`)
      .join(', ')}</div>`;
  return {
    type: 'default',
    subtype: 'divisors',
    label: 'Diviseurs',
    color: COLORS.divisors,
    question: `Donne <strong>tous</strong> les diviseurs de <strong>${n}</strong>.`,
    n,
    divs,
    placeholder: 'Ex : 1 ; 2 ; 3 ; … (séparés par des points-virgules)',
    steps,
  };
}

function makeDivCriteria(): ArithExercise {
  const pool = [126, 135, 240, 315, 420, 630, 450, 720, 105, 210, 360, 1260];
  const n = randFrom(pool);
  const by2 = n % 2 === 0;
  const digits = String(n).split('');
  const digitSum = digits.reduce((s, d) => s + parseInt(d, 10), 0);
  const by3 = digitSum % 3 === 0;
  const by5 = n % 5 === 0;
  const by9 = digitSum % 9 === 0;
  const by10 = n % 10 === 0;
  const lastDigit = n % 10;
  const digitSumCalc = digits.join(' + ');
  const steps = `<div style="font-family:'DM Mono',monospace;font-size:13px;line-height:2.5;">
    <div><strong>÷ 2 :</strong> le dernier chiffre est <strong>${lastDigit}</strong> ${
      lastDigit % 2 === 0 ? '(pair) ✓' : '(impair) ✗'
    } → ${by2 ? '<strong style="color:var(--correct);">OUI</strong>' : '<strong style="color:#f87171;">NON</strong>'}</div>
    <div><strong>÷ 3 :</strong> somme des chiffres = ${digitSumCalc} = <strong>${digitSum}</strong> ${
      by3 ? `divisible par 3 (${digitSum}÷3=${digitSum / 3}) ✓` : 'non divisible par 3 ✗'
    } → ${by3 ? '<strong style="color:var(--correct);">OUI</strong>' : '<strong style="color:#f87171;">NON</strong>'}</div>
    <div><strong>÷ 5 :</strong> le dernier chiffre est <strong>${lastDigit}</strong> ${
      lastDigit === 0 || lastDigit === 5 ? '(0 ou 5) ✓' : '(ni 0 ni 5) ✗'
    } → ${by5 ? '<strong style="color:var(--correct);">OUI</strong>' : '<strong style="color:#f87171;">NON</strong>'}</div>
    <div><strong>÷ 9 :</strong> somme des chiffres = ${digitSumCalc} = <strong>${digitSum}</strong> ${
      by9
        ? `divisible par 9 (${digitSum}÷9=${digitSum / 9}) ✓`
        : `non divisible par 9 (${digitSum}÷9=${(digitSum / 9).toFixed(1)}…) ✗`
    } → ${by9 ? '<strong style="color:var(--correct);">OUI</strong>' : '<strong style="color:#f87171;">NON</strong>'}</div>
    <div><strong>÷ 10 :</strong> le dernier chiffre est <strong>${lastDigit}</strong> ${
      lastDigit === 0 ? '(zéro) ✓' : '(non nul) ✗'
    } → ${by10 ? '<strong style="color:var(--correct);">OUI</strong>' : '<strong style="color:#f87171;">NON</strong>'}</div>
  </div>`;
  return {
    type: 'default',
    subtype: 'criteria',
    label: 'Divisibilité',
    color: COLORS.criteria,
    n,
    by2,
    by3,
    by5,
    by9,
    by10,
    steps,
  };
}

function makeMultiples(): ArithExercise {
  const k = [4, 5, 6, 7, 8, 9][Math.floor(Math.random() * 6)]!;
  const low = Math.floor(Math.random() * 20) + 5;
  const high = low + Math.floor(Math.random() * 25) + 15;
  const mults: number[] = [];
  for (let i = low; i <= high; i++) if (i % k === 0) mults.push(i);
  const firstMult = mults[0]!;
  const firstK = firstMult / k;
  const steps = `<div style="color:var(--text);">On regarde dans la table de ${k} pour trouver les multiples compris entre ${low} et ${high}.</div>
    <div style="margin-top:6px;color:var(--muted);">Premier multiple supérieur ou égal à ${low} : ${k} × ${firstK} = <strong>${firstMult}</strong></div>
    <div style="margin-top:4px;color:var(--muted);">On continue : ${mults.map((m) => `${k}×${m / k}=${m}`).join(', ')}</div>
    <div style="margin-top:6px;font-family:'DM Mono',monospace;line-height:2;">${mults
      .map(
        (m) =>
          `<span style="background:rgba(249,168,212,0.15);padding:2px 8px;border-radius:6px;margin:2px;">${m}</span>`,
      )
      .join(' ')}</div>`;
  return {
    type: 'default',
    subtype: 'multiples',
    label: 'Multiples',
    color: COLORS.multiples,
    question: `Donne tous les multiples de <strong>${k}</strong> compris entre <strong>${low}</strong> et <strong>${high}</strong>.`,
    k,
    low,
    high,
    mults,
    placeholder: `Ex : ${mults[0]} ; … (séparés par des points-virgules)`,
    steps,
  };
}

function makeSpotNonPrime(): ArithExercise {
  const primePool = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
  const compPool = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 21, 22, 25, 26, 27, 28];
  const howMany = Math.random() < 0.5 ? 1 : 2;
  const nonPrimes = shuffleArr(compPool).slice(0, howMany);
  const primes = shuffleArr(primePool).slice(0, 5 - howMany);
  const list = shuffleArr([...primes, ...nonPrimes]);
  const detailLines = list
    .map((x) => {
      const ip = isPrime(x);
      let why: string;
      if (ip) {
        why = `${x} est premier`;
      } else {
        const factor = divisors(x).filter((d) => d > 1 && d < x)[0] ?? 1;
        why = `${x} = ${factor} × ${x / factor} → non premier`;
      }
      return `<div style="font-family:'DM Mono',monospace;">${x} : <span style="color:${
        ip ? 'var(--correct)' : '#f87171'
      };">${why}</span></div>`;
    })
    .join('');
  const steps = `<div style="color:var(--text);margin-bottom:6px;"><strong>Rappel :</strong> un nombre premier est un entier supérieur ou égal à 2 qui n'a que deux diviseurs : 1 et lui-même.</div>${detailLines}`;
  return {
    type: 'default',
    subtype: 'spotnonprime',
    label: 'Nombres premiers',
    color: COLORS.spotnonprime,
    question: `Dans la liste suivante, quels nombres ne sont <strong>pas</strong> premiers ? <span style="font-family:'DM Mono',monospace;font-size:1.1rem;">${list.join(' &nbsp;·&nbsp; ')}</span>`,
    list,
    nonPrimes: nonPrimes.slice().sort((a, b) => a - b),
    placeholder: 'Écris les nombres non premiers séparés par ; (ex : 4 ; 9)',
    steps,
  };
}

function makeDecompo(nFactors: number): ArithExercise {
  function makeNum() {
    const factors: number[] = [];
    for (let i = 0; i < nFactors; i++) factors.push(randFrom(PRIMES_UNDER_13));
    factors.sort((a, b) => a - b);
    return { n: factors.reduce((a, b) => a * b, 1), factors };
  }
  const nums = [makeNum(), makeNum(), makeNum()];
  while (nums[1]!.n === nums[0]!.n) nums[1] = makeNum();
  while (nums[2]!.n === nums[0]!.n || nums[2]!.n === nums[1]!.n) nums[2] = makeNum();
  const corrLines = nums
    .map(
      ({ n, factors }) =>
        `<div style="font-family:'DM Mono',monospace;">${n} = <strong style="color:var(--correct);">${factStr(factors)}</strong></div>`,
    )
    .join('');
  const steps = `<div style="color:var(--muted);margin-bottom:8px;">Méthode : on divise successivement par les plus petits nombres premiers.</div>${corrLines}`;
  const label =
    nFactors === 2
      ? 'Décomposition (2 facteurs)'
      : nFactors === 3
        ? 'Décomposition (3 facteurs)'
        : 'Décomposition (4 facteurs)';
  return {
    type: 'default',
    subtype: 'decompo',
    label,
    color: COLORS.decompo,
    question: 'Décompose chacun de ces nombres en produit de nombres premiers :',
    nums,
    nFactors,
    steps,
  };
}

const PGCD_CONTEXTS = [
  {
    obj1: 'roses',
    obj2: 'tulipes',
    template: (N: number, M: number) =>
      `Un fleuriste dispose de <strong>${N} roses</strong> et <strong>${M} tulipes</strong>. Il veut réaliser des bouquets tous identiques en utilisant toutes les fleurs. Quelles sont les compositions possibles ?`,
    unit: 'bouquet',
    unitP: 'bouquets',
  },
  {
    obj1: 'oranges',
    obj2: 'pommes',
    template: (N: number, M: number) =>
      `Une épicière veut former des paniers identiques avec <strong>${N} oranges</strong> et <strong>${M} pommes</strong>, sans rien laisser. Quelles sont les compositions possibles ?`,
    unit: 'panier',
    unitP: 'paniers',
  },
  {
    obj1: 'filles',
    obj2: 'garçons',
    template: (N: number, M: number) =>
      `Un professeur veut former des groupes identiques avec <strong>${N} filles</strong> et <strong>${M} garçons</strong>. Quelles sont toutes les répartitions possibles ?`,
    unit: 'groupe',
    unitP: 'groupes',
  },
  {
    obj1: 'crayons',
    obj2: 'stylos',
    template: (N: number, M: number) =>
      `Une directrice veut distribuer <strong>${N} crayons</strong> et <strong>${M} stylos</strong> dans des trousses identiques, sans rien garder. Quelles sont les compositions possibles ?`,
    unit: 'trousse',
    unitP: 'trousses',
  },
  {
    obj1: 'garçons',
    obj2: 'filles',
    template: (N: number, M: number) =>
      `Un animateur veut répartir <strong>${N} garçons</strong> et <strong>${M} filles</strong> en équipes mixtes identiques. Quelles sont les répartitions possibles ?`,
    unit: 'équipe',
    unitP: 'équipes',
  },
  {
    obj1: 'billes rouges',
    obj2: 'billes bleues',
    template: (N: number, M: number) =>
      `Léo veut partager <strong>${N} billes rouges</strong> et <strong>${M} billes bleues</strong> en sachets identiques, sans reste. Quelles sont les compositions possibles ?`,
    unit: 'sachet',
    unitP: 'sachets',
  },
  {
    obj1: 'chocolats au lait',
    obj2: 'chocolats noirs',
    template: (N: number, M: number) =>
      `Une chocolatière veut préparer des boîtes identiques avec <strong>${N} chocolats au lait</strong> et <strong>${M} chocolats noirs</strong>, sans reste. Quelles sont les compositions possibles ?`,
    unit: 'boîte',
    unitP: 'boîtes',
  },
  {
    obj1: 'autocollants ronds',
    obj2: 'autocollants étoile',
    template: (N: number, M: number) =>
      `Marie veut distribuer <strong>${N} autocollants ronds</strong> et <strong>${M} autocollants étoile</strong> dans des enveloppes identiques, sans en garder. Quelles sont les compositions possibles ?`,
    unit: 'enveloppe',
    unitP: 'enveloppes',
  },
  {
    obj1: 'biscuits sucrés',
    obj2: 'biscuits salés',
    template: (N: number, M: number) =>
      `Un pâtissier veut remplir des assiettes identiques avec <strong>${N} biscuits sucrés</strong> et <strong>${M} biscuits salés</strong>, sans laisser de reste. Quelles compositions peut-il faire ?`,
    unit: 'assiette',
    unitP: 'assiettes',
  },
  {
    obj1: 'cartes de sport',
    obj2: 'cartes de jeu',
    template: (N: number, M: number) =>
      `Pierre veut ranger <strong>${N} cartes de sport</strong> et <strong>${M} cartes de jeu</strong> dans des classeurs identiques, sans en laisser. Quelles répartitions sont possibles ?`,
    unit: 'classeur',
    unitP: 'classeurs',
  },
  {
    obj1: 'bonbons acidulés',
    obj2: 'bonbons au chocolat',
    template: (N: number, M: number) =>
      `Un confiseur répartit <strong>${N} bonbons acidulés</strong> et <strong>${M} bonbons au chocolat</strong> dans des sachets identiques, sans reste. Quelles sont les compositions possibles ?`,
    unit: 'sachet',
    unitP: 'sachets',
  },
  {
    obj1: 'photos de paysage',
    obj2: 'photos de portrait',
    template: (N: number, M: number) =>
      `Un photographe veut créer des albums identiques avec <strong>${N} photos de paysage</strong> et <strong>${M} photos de portrait</strong>, sans laisser de photo. Quelles sont les compositions possibles ?`,
    unit: 'album',
    unitP: 'albums',
  },
  {
    obj1: 'plantes vertes',
    obj2: 'plantes fleuries',
    template: (N: number, M: number) =>
      `Un jardinier veut garnir des jardinières identiques avec <strong>${N} plantes vertes</strong> et <strong>${M} plantes fleuries</strong>, en utilisant toutes les plantes. Quelles sont les compositions possibles ?`,
    unit: 'jardinière',
    unitP: 'jardinières',
  },
  {
    obj1: 'livres de fiction',
    obj2: 'livres documentaires',
    template: (N: number, M: number) =>
      `Une bibliothécaire veut constituer des lots identiques avec <strong>${N} livres de fiction</strong> et <strong>${M} livres documentaires</strong>, sans reste. Quelles répartitions sont possibles ?`,
    unit: 'lot',
    unitP: 'lots',
  },
];

function makePgcdProblem(ctxIndex: number): ArithExercise {
  const pgcds = [6, 7, 8, 9, 10, 11, 12, 14, 15];
  const g = randFrom(pgcds);
  const a1 = [2, 3, 4, 5, 6, 7, 8][Math.floor(Math.random() * 7)]!;
  let a2 = randFrom([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  while (a2 === a1) a2 = randFrom([3, 4, 5, 6, 7, 8, 9, 10]);
  const N = g * a1;
  const M = g * a2;
  const fnN = factStr(primeFactors(N));
  const fnM = factStr(primeFactors(M));
  const ctxRaw = PGCD_CONTEXTS[ctxIndex % PGCD_CONTEXTS.length]!;
  const gDivs = divisors(g);
  const gFactors = primeFactors(g);

  const steps = `<div style="color:var(--text);margin-bottom:6px;"><strong>Étape 1 : Décomposer en facteurs premiers</strong></div>
    <div style="font-family:'DM Mono',monospace;line-height:2;">${N} = ${fnN}<br>${M} = ${fnM}</div>
    <div style="margin-top:8px;color:var(--text);"><strong>Étape 2 : Trouver le plus grand nombre qui divise à la fois ${N} et ${M}</strong></div>
    <div style="color:var(--muted);margin-top:4px;">On repère les facteurs communs aux deux décompositions : <strong>${gFactors.join(' × ')}</strong>${
      gFactors.length > 1
        ? ` = <strong style="color:var(--correct);">${g}</strong>`
        : ` = <strong style="color:var(--correct);">${g}</strong>`
    }</div>
    <div style="color:var(--muted);margin-top:4px;">Le plus grand nombre divisant à la fois ${N} et ${M} est donc <strong style="color:var(--correct);">${g}</strong>.</div>
    <div style="margin-top:8px;color:var(--text);"><strong>Étape 3 : Toutes les compositions possibles</strong></div>
    <div style="color:var(--muted);margin-top:4px;">Le nombre de ${ctxRaw.unitP} doit être un diviseur de ${g}. Diviseurs de ${g} : {${gDivs.join(', ')}}</div>
    <div style="margin-top:6px;font-family:'DM Mono',monospace;font-size:13px;line-height:2.4;">${gDivs
      .map(
        (d) =>
          `<div style="padding:4px 0;border-bottom:1px solid var(--border);"><strong>${d} ${ctxRaw.unit}${
            d > 1 ? 's' : ''
          }</strong> : on répartit ${N} ${ctxRaw.obj1} en ${d} → ${N} ÷ ${d} = <strong>${
            N / d
          }</strong> ${ctxRaw.obj1} par ${ctxRaw.unit} &nbsp;|&nbsp; ${M} ${ctxRaw.obj2} en ${d} → ${M} ÷ ${d} = <strong>${
            M / d
          }</strong> ${ctxRaw.obj2} par ${ctxRaw.unit}</div>`,
      )
      .join('')}</div>`;

  return {
    type: 'default',
    subtype: 'pgcd',
    label: 'Problème',
    color: COLORS.pgcd,
    question: ctxRaw.template(N, M),
    N,
    M,
    g,
    gDivs,
    fnN,
    fnM,
    ctx: { obj1: ctxRaw.obj1, obj2: ctxRaw.obj2, context: ctxRaw.template(N, M), unit: ctxRaw.unit, unitP: ctxRaw.unitP },
    unitLabel: ctxRaw.unit,
    unitLabelP: ctxRaw.unitP,
    steps,
  };
}

export function generateArithSeries(): ArithExercise[] {
  return [
    makeDivisors(),
    makeDivisors(),
    makeDivCriteria(),
    makeMultiples(),
    makeMultiples(),
    makeSpotNonPrime(),
    makeDecompo(2),
    makeDecompo(3),
    makeDecompo(4),
    makePgcdProblem(Math.floor(Math.random() * 3)),
    makePgcdProblem(Math.floor(Math.random() * 3) + 3),
  ];
}

function makeListPrimes(): ArithExercise {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19];
  const pills = primes
    .map((p) => `<span style="background:rgba(253,164,175,0.15);padding:2px 8px;border-radius:6px;margin:2px;font-family:'DM Mono',monospace;">${p}</span>`)
    .join(' ');
  const steps = `<div style="margin-bottom:8px;"><strong>Définition :</strong> un nombre premier est un entier ≥ 2 qui n'a exactement que deux diviseurs : 1 et lui-même. <strong>1 n'est pas premier</strong> (un seul diviseur).</div>
    <div>Les nombres premiers inférieurs à 20 :</div>
    <div style="margin-top:6px;">${pills}</div>
    <div style="margin-top:8px;color:var(--muted);font-size:12px;">Vérification : 4=2×2, 6=2×3, 8=2×4, 9=3×3, 10=2×5, 12=2×6, 14=2×7, 15=3×5, 16=2×8, 18=2×9 → composés. 2 3 5 7 11 13 17 19 → premiers.</div>`;
  return {
    type: 'default',
    subtype: 'primeslist',
    label: 'Nombres premiers',
    color: COLORS.spotnonprime,
    question: 'Écris tous les nombres premiers inférieurs à 20 (séparés par des points-virgules) :',
    placeholder: 'Ex : 2 ; 3 ; 5 ; …',
    steps,
  };
}

function makeLargestMult(): ArithExercise {
  const ks = [6, 7, 8, 9, 11, 12, 13, 14, 17];
  const k = randFrom(ks);
  let high = Math.floor(Math.random() * 80) + 50;
  while (high % k === 0) high++;
  const lm = Math.floor((high - 1) / k) * k;
  const q = Math.floor(high / k);
  const steps = `<div>On cherche le plus grand multiple de <strong>${k}</strong> strictement inférieur à <strong>${high}</strong>.</div>
    <div style="margin-top:6px;">On divise : ${high} ÷ ${k} = ${(high / k).toFixed(2)}… → partie entière = ${q}</div>
    <div style="margin-top:4px;">Mais ${q} × ${k} = ${q * k}${q * k === high ? ` = ${high} n'est pas strictement inférieur, on prend ${q - 1}` : ` < ${high} ✓`}</div>
    <div style="margin-top:6px;"><strong>${k} × ${lm / k} = <span style="color:var(--correct);">${lm}</span></strong></div>`;
  return {
    type: 'default',
    subtype: 'largestmult',
    label: 'Multiples',
    color: COLORS.multiples,
    question: `Donne le plus grand multiple de <strong>${k}</strong> strictement inférieur à <strong>${high}</strong>.`,
    k,
    high,
    largestMult: lm,
    placeholder: `Ex : ${lm}`,
    steps,
  };
}

function makeSpotNonPrimeLarge(): ArithExercise {
  const primePool = [17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const compPool: { n: number; why: string }[] = [
    { n: 15, why: '3 × 5' }, { n: 21, why: '3 × 7' }, { n: 22, why: '2 × 11' },
    { n: 25, why: '5²' }, { n: 27, why: '3³' }, { n: 33, why: '3 × 11' },
    { n: 35, why: '5 × 7' }, { n: 39, why: '3 × 13' }, { n: 45, why: '9 × 5' },
    { n: 49, why: '7²' }, { n: 51, why: '3 × 17' }, { n: 55, why: '5 × 11' },
    { n: 57, why: '3 × 19' }, { n: 63, why: '9 × 7' }, { n: 65, why: '5 × 13' },
    { n: 77, why: '7 × 11' }, { n: 85, why: '5 × 17' }, { n: 91, why: '7 × 13' },
  ];
  const howMany = Math.random() < 0.4 ? 1 : 2;
  const nonPrimesInfo = shuffleArr([...compPool]).slice(0, howMany);
  const nonPrimes = nonPrimesInfo.map((x) => x.n);
  const primes = shuffleArr([...primePool]).slice(0, 5 - howMany);
  const list = shuffleArr([...primes, ...nonPrimes]);
  const listDisplay = list
    .map((n) => `<span style="display:inline-block;font-family:'DM Mono',monospace;font-size:1.15rem;font-weight:700;padding:4px 12px;background:var(--surface2);border-radius:8px;margin:3px;">${n}</span>`)
    .join(' ');
  const detailLines = list
    .map((x) => {
      const np = nonPrimesInfo.find((c) => c.n === x);
      return np
        ? `<div style="font-family:'DM Mono',monospace;">${x} = ${np.why} → <span style="color:#f87171;">non premier</span></div>`
        : `<div style="font-family:'DM Mono',monospace;">${x} → <span style="color:var(--correct);">premier</span></div>`;
    })
    .join('');
  const steps = `<div style="color:var(--text);margin-bottom:6px;"><strong>Rappel :</strong> un nombre premier est un entier ≥ 2 qui n'a que deux diviseurs : 1 et lui-même.</div>${detailLines}`;
  return {
    type: 'default',
    subtype: 'spotnonprime',
    label: 'Nombres premiers',
    color: COLORS.spotnonprime,
    question: `Dans la liste suivante, quels nombres ne sont <strong>pas</strong> premiers ?<div style="margin-top:10px;padding:10px 14px;background:var(--surface2);border-radius:10px;line-height:2.4;">${listDisplay}</div>`,
    list,
    nonPrimes: nonPrimes.slice().sort((a, b) => a - b),
    placeholder: `Écris les non-premiers séparés par ; (ex : ${nonPrimes.length > 0 ? nonPrimes[0] : 25})`,
    steps,
  };
}

function decompoTreeHTML(n: number, factors: number[]): string {
  const lines: string[] = [];
  let rem = n;
  for (const p of factors) {
    lines.push(`<div style="font-family:'DM Mono',monospace;">${rem} ÷ <span style="color:var(--car);">${p}</span> = <strong>${rem / p}</strong></div>`);
    rem = rem / p;
  }
  lines.push(`<div style="font-family:'DM Mono',monospace;">${rem} est premier.</div>`);
  lines.push(`<div style="margin-top:4px;font-family:'DM Mono',monospace;"><strong>${n} = <span style="color:var(--correct);">${factors.join(' × ')}</span></strong></div>`);
  return lines.join('');
}

function makeDecompoDetailed(nFactors: number): ArithExercise {
  function makeNum() {
    const factors: number[] = [];
    for (let i = 0; i < nFactors; i++) factors.push(randFrom(PRIMES_UNDER_13));
    factors.sort((a, b) => a - b);
    return { n: factors.reduce((a, b) => a * b, 1), factors };
  }
  const nums = [makeNum(), makeNum(), makeNum()];
  while (nums[1]!.n === nums[0]!.n) nums[1] = makeNum();
  while (nums[2]!.n === nums[0]!.n || nums[2]!.n === nums[1]!.n) nums[2] = makeNum();
  const corrBlocks = nums
    .map(({ n, factors }) => `<div style="margin-bottom:10px;">${decompoTreeHTML(n, factors)}</div>`)
    .join('');
  const steps = `<div style="color:var(--muted);margin-bottom:8px;">Méthode : on divise successivement par le plus petit nombre premier possible.</div>${corrBlocks}`;
  const label =
    nFactors === 2 ? 'Décomposition (2 facteurs)'
    : nFactors === 3 ? 'Décomposition (3 facteurs)'
    : 'Décomposition (4 facteurs)';
  return {
    type: 'default',
    subtype: 'decompo',
    label,
    color: COLORS.decompo,
    question: 'Décompose chacun de ces nombres en produit de nombres premiers :',
    nums,
    nFactors,
    steps,
  };
}

/** 5 exercises: 3 divisors + 2 divisibility criteria */
export function generateArithDiviseursSeries(): ArithExercise[] {
  return [
    makeDivisors(),
    makeDivisors(),
    makeDivisors(),
    makeDivCriteria(),
    makeDivCriteria(),
  ];
}

/** 5 exercises: 2 regular multiples + 1 regular + 2 largest-multiple */
export function generateArithMultiplesSeries(): ArithExercise[] {
  return [
    makeMultiples(),
    makeMultiples(),
    makeMultiples(),
    makeLargestMult(),
    makeLargestMult(),
  ];
}

/** 5 exercises: list primes + spot-non-prime (15–100) + detailed decompo ×3 */
export function generateArithPrimesSeries(): ArithExercise[] {
  return [
    makeListPrimes(),
    makeSpotNonPrimeLarge(),
    makeDecompoDetailed(2),
    makeDecompoDetailed(3),
    makeDecompoDetailed(4),
  ];
}

/** 2 exercises: 2 PGCD problems with distinct contexts */
export function generateArithProblemesSeries(): ArithExercise[] {
  const offset = Math.floor(Math.random() * PGCD_CONTEXTS.length);
  return [
    makePgcdProblem(offset),
    makePgcdProblem((offset + Math.floor(PGCD_CONTEXTS.length / 2)) % PGCD_CONTEXTS.length),
  ];
}
