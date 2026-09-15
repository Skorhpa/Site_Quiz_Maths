import type { DecimalFracExercise, DecimalFracTerm, LiteralExercise } from '@/types';

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
// A numerator ending in 0 makes the last decimal digit 0 (e.g. 47,60 instead of 47,6) — avoid it for cleaner prompts.
const randNumerator = (denom: number) => {
  let n = 0;
  while (n === 0 || n % 10 === 0) n = randInt(1, denom - 1);
  return n;
};

const frac = (n: number | string, d: number | string) =>
  `<span class="frac"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;

const COLOR_SOMME = '#34D399';
const COLOR_MIXTE = '#60A5FA';
const COLOR_IMPROPRE = '#FCD34D';

function mk(label: string, color: string, expr: string, ansStr: string, steps: string): LiteralExercise {
  return { type: 'default', subtype: 'decimal', label, color, expr, ans: ansStr, steps, isNum: true };
}

function mkDF(
  label: string,
  color: string,
  expr: string,
  hasInteger: boolean,
  integerAns: number,
  terms: DecimalFracTerm[],
  steps: string
): DecimalFracExercise {
  return { type: 'default', label, color, expr, hasInteger, integerAns, terms, steps };
}

const COLOR_TRIPLE = '#E879F9';

// ── Famille A — somme de fractions décimales (exercice 1 : 17 + 6/10 = 17,6 · 6 + 7/10 + 8/100 + 9/1000 = 6,789) ──
function makeSomme(): LiteralExercise {
  const pattern = pick(['dix', 'cent', 'dix-cent', 'dix-cent-mill'] as const);
  const integer = randInt(2, 89);
  const dDix = randInt(1, 9);
  const dCent = randInt(1, 9);
  const dMill = randInt(1, 9);

  let terms: string[];
  let digits: string;
  if (pattern === 'dix') {
    terms = [frac(dDix, 10)];
    digits = `${dDix}`;
  } else if (pattern === 'cent') {
    terms = [frac(dCent, 100)];
    digits = `0${dCent}`;
  } else if (pattern === 'dix-cent') {
    terms = [frac(dDix, 10), frac(dCent, 100)];
    digits = `${dDix}${dCent}`;
  } else {
    terms = [frac(dDix, 10), frac(dCent, 100), frac(dMill, 1000)];
    digits = `${dDix}${dCent}${dMill}`;
  }

  const expr = `${integer} + ${terms.join(' + ')}`;
  const ansStr = `${integer},${digits}`;
  const steps = `<div style="color:var(--text);">${integer} + ${terms.join(' + ')} = ${integer} + 0,${digits} = <strong style="color:var(--correct);">${ansStr}</strong></div>`;
  return mk('Somme de fractions décimales', COLOR_SOMME, expr, ansStr, steps);
}

// ── Famille B — fraction décimale (± entier) (exercice 3 : 72 + 71/100 = 72,71 · 2/100 = 0,02) ──
function makeMixte(): LiteralExercise {
  const k = pick([1, 2, 3] as const);
  const denom = Math.pow(10, k);
  const hasInt = Math.random() < 0.8;
  const integer = hasInt ? randInt(1, 90) : 0;
  const numerator = randNumerator(denom);
  const digits = `${numerator}`.padStart(k, '0');

  const expr = hasInt ? `${integer} + ${frac(numerator, denom)}` : frac(numerator, denom);
  const ansStr = `${integer},${digits}`;
  const steps = hasInt
    ? `<div style="color:var(--text);">${frac(numerator, denom)} = 0,${digits} (${k} chiffre${k > 1 ? 's' : ''} après la virgule, dénominateur ${denom}) → ${integer} + 0,${digits} = <strong style="color:var(--correct);">${ansStr}</strong></div>`
    : `<div style="color:var(--text);">${frac(numerator, denom)} : le dénominateur ${denom} impose ${k} chiffre${k > 1 ? 's' : ''} après la virgule → <strong style="color:var(--correct);">${ansStr}</strong></div>`;
  return mk('Fraction décimale', COLOR_MIXTE, expr, ansStr, steps);
}

// ── Famille C — fraction impropre → écriture décimale (exercice 5 : 65/10 = 6,5 · 1328/100 = 13,28) ──
function makeImpropre(): LiteralExercise {
  const k = pick([1, 2, 3] as const);
  const denom = Math.pow(10, k);
  const integer = Math.random() < 0.3 ? 0 : randInt(1, 90);
  const fracPart = randNumerator(denom);
  const numerator = integer * denom + fracPart;
  const digits = `${fracPart}`.padStart(k, '0');

  const expr = frac(numerator, denom);
  const ansStr = `${integer},${digits}`;
  const steps = `<div style="color:var(--text);">Le dénominateur ${denom} impose ${k} chiffre${k > 1 ? 's' : ''} après la virgule : on compte ${k} chiffre${k > 1 ? 's' : ''} depuis la droite de ${numerator} → <strong style="color:var(--correct);">${ansStr}</strong></div>`;
  return mk('Fraction → nombre décimal', COLOR_IMPROPRE, expr, ansStr, steps);
}

export function generateDecimauxSeries(): LiteralExercise[] {
  return [
    makeSomme(), makeSomme(), makeSomme(), makeSomme(), makeSomme(), makeSomme(),
    makeMixte(), makeMixte(), makeMixte(), makeMixte(), makeMixte(), makeMixte(),
    makeImpropre(), makeImpropre(), makeImpropre(), makeImpropre(), makeImpropre(), makeImpropre(),
  ];
}

// ════════════════════════════════════════════════════════════════════════
// Sens inverse : écriture décimale → fractions décimales
// ════════════════════════════════════════════════════════════════════════

// ── Famille A' — décompose en somme de fractions décimales (exercice 2 : 3,79 = 3 + 7/10 + 9/100) ──
function makeSommeInverse(): DecimalFracExercise {
  const pattern = pick(['dix', 'cent', 'dix-cent', 'dix-cent-mill'] as const);
  const integer = randInt(2, 89);
  const dDix = randInt(1, 9);
  const dCent = randInt(1, 9);
  const dMill = randInt(1, 9);

  let digits: string;
  let terms: DecimalFracTerm[];
  if (pattern === 'dix') {
    digits = `${dDix}`;
    terms = [{ n: dDix, d: 10 }];
  } else if (pattern === 'cent') {
    digits = `0${dCent}`;
    terms = [{ n: dCent, d: 100 }];
  } else if (pattern === 'dix-cent') {
    digits = `${dDix}${dCent}`;
    terms = [{ n: dDix, d: 10 }, { n: dCent, d: 100 }];
  } else {
    digits = `${dDix}${dCent}${dMill}`;
    terms = [{ n: dDix, d: 10 }, { n: dCent, d: 100 }, { n: dMill, d: 1000 }];
  }

  const expr = `${integer},${digits}`;
  const fracHtml = terms.map((t) => frac(t.n, t.d)).join(' + ');
  const steps = `<div style="color:var(--text);">${expr} = ${integer} + 0,${digits} = <strong style="color:var(--correct);">${integer} + ${fracHtml}</strong></div>`;
  return mkDF('Décomposition en fractions décimales', COLOR_SOMME, expr, true, integer, terms, steps);
}

// ── Famille B' — partie entière + une fraction décimale (exercice 4 : 31,76 = 31 + 76/100 · 0,087 = 0 + 87/1000) ──
function makeMixteInverse(): DecimalFracExercise {
  const k = pick([1, 2, 3] as const);
  const denom = Math.pow(10, k);
  const integer = Math.random() < 0.2 ? 0 : randInt(1, 90);
  const numerator = randNumerator(denom);
  const digits = `${numerator}`.padStart(k, '0');

  const expr = `${integer},${digits}`;
  const steps = `<div style="color:var(--text);">${expr} : partie entière <strong>${integer}</strong>, puis ${k} chiffre${k > 1 ? 's' : ''} après la virgule → <strong style="color:var(--correct);">${integer} + ${frac(numerator, denom)}</strong></div>`;
  return mkDF('Partie entière + fraction décimale', COLOR_MIXTE, expr, true, integer, [{ n: numerator, d: denom }], steps);
}

// ── Famille C' — écriture fractionnaire directe (exercice 6 : 0,3 = 3/10 · 1,02 = 102/100) ──
function makeImpropreInverse(): DecimalFracExercise {
  const k = pick([1, 2, 3] as const);
  const denom = Math.pow(10, k);
  const integer = Math.random() < 0.3 ? 0 : randInt(1, 90);
  const fracPart = randNumerator(denom);
  const numerator = integer * denom + fracPart;
  const digits = `${fracPart}`.padStart(k, '0');

  const expr = `${integer},${digits}`;
  const steps = `<div style="color:var(--text);">${expr} : on compte ${k} chiffre${k > 1 ? 's' : ''} après la virgule → dénominateur <strong>${denom}</strong>, on enlève la virgule → <strong style="color:var(--correct);">${frac(numerator, denom)}</strong></div>`;
  return mkDF('Écriture fractionnaire', COLOR_IMPROPRE, expr, false, 0, [{ n: numerator, d: denom }], steps);
}

// ── Bonus — trois écritures équivalentes (exercice 7 : 24,73 = 2473/100 = 24 + 73/100 = 24 + 7/10 + 3/100) ──
function makeTripleDecomposition(): DecimalFracExercise {
  const pattern = pick(['dix-cent', 'dix-cent-mill'] as const);
  const integer = randInt(2, 89);
  const dDix = randInt(1, 9);
  const dCent = randInt(1, 9);
  const dMill = randInt(1, 9);

  let digits: string;
  let terms: DecimalFracTerm[];
  let k: number;
  if (pattern === 'dix-cent') {
    digits = `${dDix}${dCent}`;
    terms = [{ n: dDix, d: 10 }, { n: dCent, d: 100 }];
    k = 2;
  } else {
    digits = `${dDix}${dCent}${dMill}`;
    terms = [{ n: dDix, d: 10 }, { n: dCent, d: 100 }, { n: dMill, d: 1000 }];
    k = 3;
  }
  const denom = Math.pow(10, k);
  const midNumerator = parseInt(digits, 10);
  const bigNumerator = integer * denom + midNumerator;
  const fracHtml = terms.map((t) => frac(t.n, t.d)).join(' + ');

  const expr = `${integer},${digits}`;
  const steps = `<div style="color:var(--text);">Trois écritures équivalentes de ${expr} :</div>
    <div style="margin-top:6px;color:var(--text);">${frac(bigNumerator, denom)} &nbsp;=&nbsp; ${integer} + ${frac(midNumerator, denom)} &nbsp;=&nbsp; <strong style="color:var(--correct);">${integer} + ${fracHtml}</strong></div>`;
  return mkDF('Trois écritures équivalentes', COLOR_TRIPLE, expr, true, integer, terms, steps);
}

export function generateDecimauxInverseSeries(): DecimalFracExercise[] {
  return [
    makeSommeInverse(), makeSommeInverse(), makeSommeInverse(), makeSommeInverse(), makeSommeInverse(), makeSommeInverse(),
    makeMixteInverse(), makeMixteInverse(), makeMixteInverse(), makeMixteInverse(), makeMixteInverse(), makeMixteInverse(),
    makeImpropreInverse(), makeImpropreInverse(), makeImpropreInverse(), makeImpropreInverse(), makeImpropreInverse(),
    makeTripleDecomposition(),
  ];
}

// ════════════════════════════════════════════════════════════════════════
// Sous-quiz 3 : connaître l'écriture décimale
// ════════════════════════════════════════════════════════════════════════

const COLOR_CLEAN = '#F472B6';
const COLOR_DIGIT = '#A78BFA';

// ── Simplifie l'écriture décimale (exercice 1 : 30,50 → 30,5 · 007 → 7 · 5,0 → 5) ──
// Toujours au moins un zéro inutile à supprimer (leading et/ou trailing).
function makeCleanWriting(): LiteralExercise {
  let leadingZeros = pick([0, 0, 1, 1, 2] as const);
  let extraZeros = pick([0, 0, 1, 1, 2] as const);
  if (leadingZeros === 0 && extraZeros === 0) {
    if (Math.random() < 0.5) leadingZeros = pick([1, 2] as const);
    else extraZeros = pick([1, 2] as const);
  }

  const baseInt = leadingZeros === 2 ? randInt(1, 9) : leadingZeros === 1 ? randInt(1, 90) : randInt(1, 900);
  const displayInt = '0'.repeat(leadingZeros) + baseInt;

  const sigLen = pick([0, 1, 2, 3] as const);
  let sig = '';
  for (let i = 0; i < sigLen; i++) {
    sig += i === sigLen - 1 ? `${randInt(1, 9)}` : `${randInt(0, 9)}`;
  }

  const displayDec = sig + '0'.repeat(extraZeros);
  const displayStr = displayDec.length > 0 ? `${displayInt},${displayDec}` : displayInt;
  const cleanStr = sig.length > 0 ? `${baseInt},${sig}` : `${baseInt}`;

  const removedLeading = leadingZeros > 0;
  const removedTrailing = extraZeros > 0;
  const steps = `<div style="color:var(--text);">${displayStr} : ${
    [
      removedLeading ? 'les zéros inutiles devant la partie entière' : '',
      removedTrailing ? 'les zéros inutiles à la fin de la partie décimale' : '',
    ].filter(Boolean).join(' et ')
  } ne changent pas la valeur du nombre → <strong style="color:var(--correct);">${cleanStr}</strong></div>`;

  return {
    type: 'default',
    subtype: 'decimal-clean',
    label: 'Écriture simplifiée',
    color: COLOR_CLEAN,
    expr: displayStr,
    ans: cleanStr,
    steps,
    isNum: false,
  };
}

// ── Chiffre d'une position (exercices 4/5 : dans 84,735, le chiffre des dixièmes est 7…) ──
function makeDigitSetFor(): LiteralExercise[] {
  const integer = randInt(10, 899);
  const decDigits = `${randInt(0, 9)}${randInt(0, 9)}${randInt(0, 9)}`;
  const intDigits = `${integer}`.padStart(3, '0');
  const numStr = `${integer},${decDigits}`;

  const PLACES: { posName: string; digit: string }[] = [
    { posName: 'dixièmes', digit: decDigits[0]! },
    { posName: 'centièmes', digit: decDigits[1]! },
    { posName: 'millièmes', digit: decDigits[2]! },
    { posName: 'unités', digit: intDigits[2]! },
    { posName: 'dizaines', digit: intDigits[1]! },
    { posName: 'centaines', digit: intDigits[0]! },
  ];

  return PLACES.map(({ posName, digit }) => ({
    type: 'default',
    subtype: 'substitute',
    label: 'Chiffre d’une position',
    color: COLOR_DIGIT,
    expr: `Quel est le chiffre des ${posName} dans <strong>${numStr}</strong> ?`,
    ans: digit,
    steps: `<div style="color:var(--text);">Dans ${numStr} : le chiffre des ${posName} est <strong style="color:var(--correct);">${digit}</strong>.</div>`,
    isNum: true,
  }));
}

export function generateEcritureSeries(): LiteralExercise[] {
  return [
    makeCleanWriting(), makeCleanWriting(), makeCleanWriting(),
    ...makeDigitSetFor(),
    ...makeDigitSetFor(),
  ];
}
