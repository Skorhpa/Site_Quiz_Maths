import { fmtNum } from './ProportionnaliteHub';

/**
 * Data for the 5ème « Opérations sur les nombres relatifs » quiz (pure data, no React):
 *  - addition de nombres relatifs
 *  - soustraction de nombres relatifs
 *  - simplification d'écriture
 * Only abstract computations (no word problems). Numbers are integers or tenths, so every result is exact.
 */

export const MINUS = '−';

const r1 = (x: number) => Math.round(x * 10) / 10;
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ── Formatting ────────────────────────────────────────────────────────────────

const abs = (x: number) => fmtNum(Math.abs(x));
/** (+3,5) / (−8) */
export const par = (x: number) => `(${x < 0 ? MINUS : '+'}${abs(x)})`;
/** −8 / 3,5 (no explicit plus) */
export const lead = (x: number) => `${x < 0 ? MINUS : ''}${abs(x)}`;
/** +3,5 / −8 */
export const signed = (x: number) => `${x < 0 ? MINUS : '+'}${abs(x)}`;
const show = (x: number) => (x === 0 ? '0' : par(x));
/** Simplified writing of a sum of terms: −16 − 97 + 3 */
export const simple = (terms: number[]) =>
  lead(terms[0]!) + terms.slice(1).map((t) => ` ${t < 0 ? MINUS : '+'} ${abs(t)}`).join('');

// ── Random numbers ────────────────────────────────────────────────────────────

const sgn = () => (Math.random() < 0.5 ? -1 : 1);
/** Non-zero integer, random sign. */
const rint = (lo: number, hi: number) => sgn() * randInt(lo, hi);
/** Number with one decimal (never a whole number), random sign. */
function rdec(lo: number, hi: number): number {
  let v = 0;
  do { v = randInt(Math.round(lo * 10), Math.round(hi * 10)); } while (v % 10 === 0);
  return sgn() * (v / 10);
}

// ── Answer checking ───────────────────────────────────────────────────────────

export type Check =
  | { kind: 'num'; value: number }
  | { kind: 'terms'; terms: number[] }   // simplified writing, e.g. "-16 - 97"
  | { kind: 'paren'; terms: number[] }   // "(−8) + (+13)": every term in parentheses, joined by +
  | { kind: 'pick'; value: string; options: string[] };

export interface Field {
  check: Check;
  /** 'result' marks the final value of the row's first expression (used by the tests). */
  role?: 'result';
}

export type Segment = string | Field;

export interface Row {
  label: string;
  segments: Segment[];
  explain: string;
  /** Displayed expressions with their true value (used by the tests). */
  exprs: { expr: string; value: number }[];
}

const normalise = (raw: string) => raw.replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/,/g, '.');

/** "−3", "+3,5", "3" → number; null when not a (signed) number. */
export function parseSigned(raw: string): number | null {
  const s = normalise(raw);
  if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

/** "-16 - 97 + 3" → [-16, -97, 3]; null when it is not a plain sum of numbers. */
export function parseTerms(raw: string): number[] | null {
  const s = normalise(raw);
  if (!/^[+-]?\d+(\.\d+)?([+-]\d+(\.\d+)?)*$/.test(s)) return null;
  return (s.match(/[+-]?\d+(\.\d+)?/g) ?? []).map(Number);
}

/** "(−8) + (+13)" → [-8, 13]; every term must be in parentheses. */
export function parseParen(raw: string): number[] | null {
  const s = normalise(raw);
  if (!/^\([+-]?\d+(\.\d+)?\)(\+\([+-]?\d+(\.\d+)?\))*$/.test(s)) return null;
  return (s.match(/\(([+-]?\d+(?:\.\d+)?)\)/g) ?? []).map((m) => Number(m.slice(1, -1)));
}

const sameList = (a: number[] | null, b: number[]) =>
  a !== null && a.length === b.length && a.every((v, i) => Math.abs(v - b[i]!) < 1e-9);

export function evalCheck(check: Check, raw: string): boolean {
  switch (check.kind) {
    case 'num': {
      const v = parseSigned(raw);
      return v !== null && Math.abs(v - check.value) < 1e-9;
    }
    case 'terms': return sameList(parseTerms(raw), check.terms);
    case 'paren': return sameList(parseParen(raw), check.terms);
    case 'pick': return raw === check.value;
  }
}

// ── Exercise model ────────────────────────────────────────────────────────────

export type QuizId = 'addition' | 'soustraction' | 'ecriture';

interface ExerciseBase {
  icon: string;
  tag: string;
  stars: number;
  title: string;
  short: string;
  instruction: string;
  tip?: string;
}

export interface RowsExercise extends ExerciseBase {
  kind: 'rows';
  rows: Row[];
}

export interface PyramidExercise extends ExerciseBase {
  kind: 'pyramid';
  /** cells[0] is the top (1 cell) … cells[3] is the base (4 cells). */
  cells: number[][];
  hidden: boolean[][];
  explain: string;
}

export interface CountExercise extends ExerciseBase {
  kind: 'count';
  mode: 'addition' | 'soustraction';
  /** Rows for the currently chosen number of terms (the card regenerates them when the student picks another count). */
  rows: Row[];
}

export type RelExercise = RowsExercise | PyramidExercise | CountExercise;

/** Re-draws an exercise until no two of its rows show the same expression (a repeated row would look like a mistake). */
function uniqueRows(gen: () => Row[]): Row[] {
  let rows = gen();
  for (let tries = 0; tries < 60; tries++) {
    const keys = rows.map((r) => r.exprs.map((e) => e.expr).join("||"));
    if (new Set(keys).size === keys.length) return rows;
    rows = gen();
  }
  return rows;
}

const LABELS = 'ABCDEFGHJKLMNPRSTUVWXYZ'.split('');
const num = (value: number, role?: 'result'): Field => ({ check: { kind: 'num', value }, role });

function mkRow(label: string, explain: string, exprs: { expr: string; value: number }[], segments: Segment[]): Row {
  return { label, explain, exprs, segments };
}

// ── Explanations ──────────────────────────────────────────────────────────────

function explainAdd(a: number, b: number): string {
  const r = r1(a + b);
  if (r === 0) return `${par(a)} + ${par(b)} : deux nombres opposés, leur somme est toujours 0.`;
  if (a * b > 0) {
    return `${par(a)} + ${par(b)} : même signe (${a < 0 ? MINUS : '+'}) → on garde le signe et on ajoute les distances à zéro : ${abs(a)} + ${abs(b)} = ${abs(r)}. Résultat : ${show(r)}.`;
  }
  const big = Math.abs(a) > Math.abs(b) ? a : b;
  return `${par(a)} + ${par(b)} : signes contraires → on soustrait les distances à zéro : ${fmtNum(Math.max(Math.abs(a), Math.abs(b)))} − ${fmtNum(Math.min(Math.abs(a), Math.abs(b)))} = ${abs(r)}, et on garde le signe de la plus grande distance (${big < 0 ? MINUS : '+'}). Résultat : ${show(r)}.`;
}

function explainSub(a: number, b: number): string {
  const r = r1(a - b);
  return `${par(a)} − ${par(b)} = ${par(a)} + ${par(-b)} = ${show(r)} (soustraire un nombre, c'est ajouter son opposé).`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  ADDITION
// ═══════════════════════════════════════════════════════════════════════════

function sumRows(pairs: [number, number][]): Row[] {
  return pairs.map(([a, b], i) => {
    const expr = `${par(a)} + ${par(b)}`;
    const v = r1(a + b);
    return mkRow(LABELS[i]!, explainAdd(a, b), [{ expr, value: v }], [`${expr} =`, num(v, 'result')]);
  });
}

function addIntPairs(): [number, number][] {
  const opp = (): [number, number] => {
    let a = randInt(2, 30), b = randInt(2, 30);
    while (a === b) b = randInt(2, 30);
    return sgn() > 0 ? [a, -b] : [-a, b];
  };
  const last: [number, number] = Math.random() < 0.3 ? (() => { const x = randInt(2, 30); return sgn() > 0 ? [x, -x] as [number, number] : [-x, x] as [number, number]; })() : opp();
  return shuffle<[number, number]>([
    [randInt(2, 30), randInt(2, 30)],
    [-randInt(2, 30), -randInt(2, 30)],
    opp(),
    last,
  ]);
}

function decOrInt(): number {
  return Math.random() < 0.25 ? rint(1, 9) : rdec(0.5, 9.5);
}

function splitTerms(terms: number[]) {
  const pos = r1(terms.filter((t) => t > 0).reduce((s, t) => s + t, 0));
  const neg = r1(terms.filter((t) => t < 0).reduce((s, t) => s + t, 0));
  return { pos, neg, total: r1(pos + neg) };
}

function mixedTerms(n: number, lo: number, hi: number): number[] {
  while (true) {
    const t = Array.from({ length: n }, () => rint(lo, hi));
    const { total } = splitTerms(t);
    if (t.some((x) => x > 0) && t.some((x) => x < 0) && t.filter((x) => x < 0).length <= n - 1 && total !== 0) return t;
  }
}

function xyzRows(): Row[] {
  const triples: number[][] = [
    Array.from({ length: 3 }, () => rint(1, 9)),
    Array.from({ length: 3 }, () => rint(1, 9)),
    Array.from({ length: 3 }, () => rdec(0.5, 9.5)),
    Array.from({ length: 3 }, () => rdec(0.5, 9.5)),
  ];
  return triples.map(([x, y, z], i) => {
    const v = r1(x! + y! + z!);
    const expr = `${par(x!)} + ${par(y!)} + ${par(z!)}`;
    return mkRow(LABELS[i]!,
      `x + y + z = ${expr} = ${show(r1(x! + y!))} + ${par(z!)} = ${show(v)}.`,
      [{ expr, value: v }],
      [`x = ${par(x!)}   y = ${par(y!)}   z = ${par(z!)}   →   x + y + z =`, num(v, 'result')]);
  });
}

function astuceAddRows(): Row[] {
  return [4, 6].map((n, i) => {
    const pairs = n === 4 ? 1 : 2;
    const base: number[] = [];
    for (let p = 0; p < pairs; p++) {
      const x = rint(2, 20);
      base.push(x, -x);
    }
    const extra: number[] = [];
    while (extra.length < n - 2 * pairs) extra.push(rint(2, 20));
    const terms = shuffle([...base, ...extra]);
    const total = r1(terms.reduce((s, t) => s + t, 0));
    const expr = terms.map(par).join(' + ');
    return mkRow(LABELS[i]!,
      `On regroupe les nombres opposés (leur somme vaut 0) : il reste ${extra.map(par).join(' + ')} = ${show(total)}.`,
      [{ expr, value: total }],
      [`${expr} =`, num(total, 'result')]);
  });
}

// ── Pyramids ──────────────────────────────────────────────────────────────────

function solvable(hidden: boolean[][]): boolean {
  const known = hidden.map((row) => row.map((h) => !h));
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i <= r; i++) {
        const trio = [known[r]![i]!, known[r + 1]![i]!, known[r + 1]![i + 1]!];
        if (trio.filter(Boolean).length === 2) {
          if (!trio[0]) known[r]![i] = true;
          else if (!trio[1]) known[r + 1]![i] = true;
          else known[r + 1]![i + 1] = true;
          changed = true;
        }
      }
    }
  }
  return known.every((row) => row.every(Boolean));
}

export function generatePyramid(dec: boolean): PyramidExercise {
  const base = Array.from({ length: 4 }, () => (dec ? rdec(0.5, 6) : rint(1, 9)));
  const cells: number[][] = [[], [], [], base];
  for (let r = 2; r >= 0; r--) cells[r] = Array.from({ length: r + 1 }, (_, i) => r1(cells[r + 1]![i]! + cells[r + 1]![i + 1]!));

  const positions: [number, number][] = [];
  for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) positions.push([r, i]);
  let hidden: boolean[][] = cells.map((row) => row.map(() => false));
  let found = false;
  for (let attempt = 0; attempt < 500 && !found; attempt++) {
    const h = cells.map((row) => row.map(() => false));
    for (const [r, i] of shuffle(positions).slice(0, 5)) h[r]![i] = true;
    if (solvable(h)) { hidden = h; found = true; }
  }
  if (!found) hidden = cells.map((row, r) => row.map(() => r < 3)); // base fully shown: always solvable

  return {
    kind: 'pyramid', icon: '🔺', tag: 'Défi', stars: 3,
    title: 'Pyramide : chaque nombre est la somme des deux du dessous', short: 'Pyramide',
    instruction: 'Complète la pyramide, sachant que chaque nombre est la somme des deux nombres situés juste en dessous.',
    tip: 'Pour trouver un nombre du dessous, soustrais.',
    cells, hidden,
    explain: 'Chaque case est la somme des deux cases juste en dessous. Si une case du dessous manque, on la retrouve en soustrayant : parent − case connue.',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  SOUSTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function subPairsMixed(): [number, number][] {
  const ints = (): [number, number] => {
    let a = rint(1, 20), b = rint(1, 20);
    while (a === b) b = rint(1, 20);
    return [a, b];
  };
  return shuffle<[number, number]>([ints(), ints(), [rdec(0.5, 9.5), decOrInt()], [rdec(0.5, 9.5), rdec(0.5, 9.5)]]);
}

function toAddRows(): Row[] {
  return subPairsMixed().map(([a, b], i) => {
    const expr = `${par(a)} − ${par(b)}`;
    const v = r1(a - b);
    return mkRow(LABELS[i]!, explainSub(a, b), [{ expr, value: v }], [`${expr} = (`, num(a), ') + (', num(-b), ')']);
  });
}

function qcmGridRows(): Row[] {
  const b = randInt(2, 8);
  const a = randInt(b + 1, 12);
  const options = shuffle([a + b, a - b, -(a - b), -(a + b)]).map(signed);
  const combos: [number, number][] = shuffle<[number, number]>([[a, b], [a, -b], [-a, b], [-a, -b]]);
  return combos.map(([x, y], i) => {
    const expr = `${par(x)} − ${par(y)}`;
    const v = x - y;
    return mkRow(LABELS[i]!, explainSub(x, y), [{ expr, value: v }], [`${expr} =`, { check: { kind: 'pick', value: signed(v), options } }]);
  });
}

function subCalcRows(): Row[] {
  const pairs: [number, number][] = [
    (() => { let a = rint(2, 20), b = rint(2, 20); while (a === b) b = rint(2, 20); return [a, b] as [number, number]; })(),
    (() => { let a = rint(2, 20), b = rint(2, 20); while (a === b) b = rint(2, 20); return [a, b] as [number, number]; })(),
    [rdec(0.5, 9.5), decOrInt()],
  ];
  return pairs.map(([a, b], i) => {
    const expr = `${par(a)} − ${par(b)}`;
    const v = r1(a - b);
    return mkRow(LABELS[i]!, explainSub(a, b), [{ expr, value: v }],
      [`${expr} = (`, num(a), ') + (', num(-b), ') =', num(v, 'result')]);
  });
}

function mentalSubRows(): Row[] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    let a = rint(1, 20), b = rint(1, 20);
    while (a === b) b = rint(1, 20);
    pairs.push([a, b]);
  }
  for (let i = 0; i < 3; i++) pairs.push([rdec(0.5, 9.5), Math.random() < 0.3 ? rint(1, 9) : rdec(0.5, 9.5)]);
  return shuffle(pairs).map(([a, b], i) => {
    const expr = `${par(a)} − ${par(b)}`;
    const v = r1(a - b);
    return mkRow(LABELS[i]!, explainSub(a, b), [{ expr, value: v }], [`${expr} =`, num(v, 'result')]);
  });
}

interface OpTerm { op: '+' | '−'; value: number }

function exprOf(ops: OpTerm[]): string {
  return ops.map((t, i) => (i === 0 ? par(t.value) : ` ${t.op} ${par(t.value)}`)).join('');
}
const termsOf = (ops: OpTerm[]) => ops.map((t) => (t.op === '+' ? t.value : -t.value));

function chainRows(): Row[] {
  const make = (n: number): OpTerm[] => {
    while (true) {
      const ops: OpTerm[] = Array.from({ length: n }, (_, i) => ({ op: i === 0 ? '+' : pick(['+', '−'] as const), value: rint(1, 12) }));
      const subs = ops.filter((t, i) => i > 0 && t.op === '−').length;
      if (subs >= 1 && subs <= 2) return ops;
    }
  };
  return [make(3), make(4)].map((ops, i) => {
    const terms = termsOf(ops);
    const total = r1(terms.reduce((s, t) => s + t, 0));
    const segs: Segment[] = [`${exprOf(ops)}  =  ${par(ops[0]!.value)}`];
    ops.slice(1).forEach((t) => {
      if (t.op === '+') segs.push(` + ${par(t.value)}`);
      else { segs.push(' + ('); segs.push(num(-t.value)); segs.push(')'); }
    });
    return mkRow(LABELS[i]!,
      `Chaque soustraction devient une addition de l'opposé : ${terms.map(par).join(' + ')} (= ${show(total)}).`,
      [{ expr: exprOf(ops), value: total }], segs);
  });
}

function programRows(): Row[] {
  return [0, 1].map((i) => {
    const start = Math.random() < 0.5 ? rint(1, 9) : rdec(0.5, 6);
    const kinds = shuffle(['add', 'sub', 'opp'] as const);
    const x = (): number => (Math.random() < 0.4 ? rint(1, 6) : rdec(0.5, 5));
    let cur = start;
    const segs: Segment[] = [`Départ : ${lead(start)}`];
    const lines: string[] = [];
    const exprs: { expr: string; value: number }[] = [];
    for (const k of kinds) {
      const prev = cur;
      if (k === 'opp') {
        cur = -prev;
        segs.push('→ Donner l\'opposé →');
        lines.push(`opposé de ${lead(prev)} = ${lead(cur)}`);
      } else {
        const v = x();
        if (k === 'add') {
          cur = r1(prev + v);
          segs.push(`→ Ajouter ${lead(v)} →`);
          lines.push(`${lead(prev)} + ${par(v)} = ${lead(cur)}`);
          exprs.push({ expr: `${par(prev)} + ${par(v)}`, value: cur });
        } else {
          cur = r1(prev - v);
          segs.push(`→ Retirer ${lead(v)} →`);
          lines.push(`${lead(prev)} − ${par(v)} = ${lead(prev)} + ${par(-v)} = ${lead(cur)}`);
          exprs.push({ expr: `${par(prev)} − ${par(v)}`, value: cur });
        }
      }
      segs.push(num(cur));
    }
    return mkRow(`${i + 1}`, `Étape par étape : ${lines.join(' ; ')}.`, exprs, segs);
  });
}

/**
 * "Choose how many numbers" exercise: two expressions with `n` relative numbers (2 to 5).
 * Addition: (+a) + (−b) + … ; soustraction: the terms are joined by + or − (at least one −).
 */
export function generateCountRows(mode: 'addition' | 'soustraction', n: number): Row[] {
  return uniqueRows(() => countRowsRaw(mode, n));
}

function countRowsRaw(mode: 'addition' | 'soustraction', n: number): Row[] {
  return [0, 1].map((i) => {
    if (mode === 'addition') {
      let terms: number[] = [];
      do { terms = Array.from({ length: n }, () => rint(1, 15)); } while (n > 2 && (!terms.some((t) => t > 0) || !terms.some((t) => t < 0)));
      const expr = terms.map(par).join(' + ');
      const total = terms.reduce((s, t) => s + t, 0);
      let explain: string;
      if (n === 2) explain = explainAdd(terms[0]!, terms[1]!);
      else {
        const { pos, neg } = splitTerms(terms);
        const negs = terms.filter((t) => t < 0).map(par).join(' + ');
        const poss = terms.filter((t) => t > 0).map(par).join(' + ');
        explain = `On regroupe les termes de même signe : ${negs} = ${show(neg)} ; ${poss} = ${show(pos)} ; puis ${show(neg)} + ${show(pos)} = ${show(total)}.`;
      }
      return mkRow(LABELS[i]!, explain, [{ expr, value: total }], [`${expr} =`, num(total, 'result')]);
    }
    let ops: OpTerm[] = [];
    do {
      ops = Array.from({ length: n }, (_, k) => ({ op: k === 0 ? '+' : pick(['+', '−'] as const), value: rint(1, 15) }));
    } while (!ops.some((t, k) => k > 0 && t.op === '−'));
    const terms = termsOf(ops);
    const total = terms.reduce((s, t) => s + t, 0);
    const expr = exprOf(ops);
    let explain: string;
    if (n === 2) explain = explainSub(ops[0]!.value, ops[1]!.value);
    else {
      const { pos, neg } = splitTerms(terms);
      explain = `Chaque soustraction devient une addition de l'opposé : ${terms.map(par).join(' + ')}. On regroupe : négatifs = ${show(neg)}, positifs = ${show(pos)} ; ${show(neg)} + ${show(pos)} = ${show(total)}.`;
    }
    return mkRow(LABELS[i]!, explain, [{ expr, value: total }], [`${expr} =`, num(total, 'result')]);
  });
}

function abcRows(): Row[] {
  return [0, 1, 2].map((i) => {
    const a = rint(1, 12), b = rint(1, 12), c = rint(1, 12);
    const v1 = a - b + c, v2 = a + b - c;
    return mkRow(LABELS[i]!,
      `a − b + c = ${par(a)} + ${par(-b)} + ${par(c)} = ${show(v1)} ; a + b − c = ${par(a)} + ${par(b)} + ${par(-c)} = ${show(v2)}.`,
      [
        { expr: `${par(a)} − ${par(b)} + ${par(c)}`, value: v1 },
        { expr: `${par(a)} + ${par(b)} − ${par(c)}`, value: v2 },
      ],
      [`a = ${par(a)}   b = ${par(b)}   c = ${par(c)}   →   a − b + c =`, num(v1, 'result'), '   a + b − c =', num(v2)]);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  SIMPLIFICATION D'ÉCRITURE
// ═══════════════════════════════════════════════════════════════════════════

function simpleAddRows(): Row[] {
  const combos: [number, number][] = [[1, 1], [-1, -1], [1, -1], [-1, 1]];
  const picked = shuffle([...combos, pick(combos), pick(combos)]);
  return picked.map(([sa, sb], i) => {
    const a = sa * randInt(10, 99), b = sb * randInt(10, 99);
    const expr = `${par(a)} + ${par(b)}`;
    return mkRow(LABELS[i]!, `${expr} = ${simple([a, b])} (on supprime les parenthèses et le « + » d'addition inutile).`,
      [{ expr, value: a + b }], [`${expr} =`, { check: { kind: 'terms', terms: [a, b] } }]);
  });
}

function subToSimpleRows(): Row[] {
  return [0, 1, 2].map((i) => {
    let a = rint(2, 20), b = rint(2, 20);
    while (a === b) b = rint(2, 20);
    const expr = `${par(a)} − ${par(b)}`;
    return mkRow(LABELS[i]!,
      `${expr} = ${par(a)} + ${par(-b)} = ${simple([a, -b])}.`,
      [{ expr, value: a - b }],
      [`${expr}  →  addition :`, { check: { kind: 'paren', terms: [a, -b] } }, 'écriture simplifiée :', { check: { kind: 'terms', terms: [a, -b] } }]);
  });
}

function mentalSimpleRows(): Row[] {
  const out: [number, number][] = [];
  const mk = (sx: number, sy: number, bigFirst: boolean | null): [number, number] => {
    let x = randInt(5, 95), y = randInt(5, 95);
    while (x === y) y = randInt(5, 95);
    if (bigFirst === true && x < y) [x, y] = [y, x];
    if (bigFirst === false && x > y) [x, y] = [y, x];
    return [sx * x, sy * y];
  };
  out.push(mk(1, -1, false), mk(1, -1, true), mk(-1, -1, null), mk(-1, 1, false), mk(-1, 1, true), mk(1, 1, null), mk(-1, -1, null), mk(-1, 1, null));
  return shuffle(out).map(([x, y], i) => {
    const expr = simple([x, y]);
    const v = x + y;
    return mkRow(LABELS[i]!, `${expr} = ${show(x)} + ${show(y)} = ${lead(v)}.`, [{ expr, value: v }], [`${expr} =`, num(v, 'result')]);
  });
}

function parenSimplifyRows(): Row[] {
  return [5, 6].map((n, i) => {
    // Always something to simplify: at least two subtractions and at least one negative term in parentheses.
    let ops: OpTerm[] = [];
    do {
      ops = Array.from({ length: n }, (_, k) => ({ op: k === 0 ? '+' : pick(['+', '−'] as const), value: rint(1, 12) }));
    } while (ops.filter((t) => t.op === '−').length < 2 || ops.filter((t) => t.value < 0).length < 1);
    const terms = termsOf(ops);
    const total = terms.reduce((s, t) => s + t, 0);
    const expr = exprOf(ops);
    const split = splitTerms(terms);
    return mkRow(LABELS[i]!,
      `${expr} = ${simple(terms)} ; positifs : ${show(split.pos)}, négatifs : ${show(split.neg)} ; résultat : ${lead(total)}.`,
      [{ expr, value: total }],
      [`${expr}`, 'écriture simplifiée :', { check: { kind: 'terms', terms } }, 'résultat :', num(total, 'result')]);
  });
}

function leftToRightRows(): Row[] {
  return [0, 1].map((i) => {
    const terms = mixedTerms(3, 2, 30);
    const expr = simple(terms);
    const first = r1(terms[0]! + terms[1]!);
    const total = r1(first + terms[2]!);
    return mkRow(LABELS[i]!,
      `${expr} : on calcule de gauche à droite. ${simple([terms[0]!, terms[1]!])} = ${lead(first)}, puis ${simple([first, terms[2]!])} = ${lead(total)}.`,
      [{ expr, value: total }],
      [`${expr}`, 'deux premiers termes :', num(first), 'résultat :', num(total, 'result')]);
  });
}

// ═══════════════════════════════════════════════════════════════════════════

const rowsEx = (e: Omit<RowsExercise, 'kind' | 'rows'> & { rows: () => Row[] }): RowsExercise => ({ kind: 'rows', ...e, rows: uniqueRows(e.rows) });

/** The "choose the number of terms" exercise starts with 2 numbers (the student can pick 3, 4 or 5). */
const countEx = (mode: 'addition' | 'soustraction'): CountExercise => ({
  kind: 'count', mode,
  icon: '🎚️', tag: 'Entraînement', stars: 2,
  title: mode === 'addition' ? 'Choisis combien de nombres additionner' : 'Choisis combien de nombres dans la suite',
  short: 'Nombre de termes au choix',
  instruction: mode === 'addition'
    ? 'Choisis le nombre de nombres relatifs (de 2 à 5), puis calcule chaque somme.'
    : 'Choisis le nombre de nombres relatifs (de 2 à 5), puis calcule : pense à ajouter l\'opposé quand il y a une soustraction.',
  tip: mode === 'addition' ? 'Regroupe les termes de même signe.' : 'Soustraire un nombre, c\'est ajouter son opposé.',
  rows: generateCountRows(mode, 2),
});

export function buildQuiz(id: QuizId): RelExercise[] {
  if (id === 'addition') {
    return [
      rowsEx({
        icon: '➕', tag: 'Échauffement', stars: 1, title: 'Additions de nombres entiers relatifs', short: 'Additions (entiers)',
        instruction: 'Calcule mentalement chaque somme. Tu peux écrire le résultat avec ou sans le signe +.',
        rows: () => sumRows(addIntPairs()),
      }),
      countEx('addition'),
      rowsEx({
        icon: '🔀', tag: 'Entraînement', stars: 2, title: 'Somme x + y + z', short: 'x + y + z',
        instruction: 'Calcule x + y + z pour chaque colonne du tableau.',
        rows: () => xyzRows(),
      }),
      generatePyramid(Math.random() < 0.5),
      rowsEx({
        icon: '✨', tag: 'Défi', stars: 3, title: 'Calcul astucieux : les opposés', short: 'Calcul astucieux',
        instruction: 'Repère les nombres opposés pour calculer le plus simplement possible.',
        tip: 'La somme de deux nombres opposés est égale à 0.',
        rows: () => astuceAddRows(),
      }),
    ];
  }
  if (id === 'soustraction') {
    return [
      rowsEx({
        icon: '🔁', tag: 'Échauffement', stars: 1, title: 'Transformer une soustraction en addition', short: 'Soustraction → addition',
        instruction: 'Transforme chaque soustraction en addition : soustraire un nombre, c\'est ajouter son opposé.',
        rows: () => toAddRows(),
      }),
      rowsEx({
        icon: '🎯', tag: 'Échauffement', stars: 1, title: 'Choisis la bonne réponse', short: 'Bonne réponse',
        instruction: 'Pour chaque soustraction, choisis la bonne réponse parmi les quatre propositions.',
        rows: () => qcmGridRows(),
      }),
      rowsEx({
        icon: '🧮', tag: 'Entraînement', stars: 2, title: 'Transformer, puis calculer', short: 'Transformer et calculer',
        instruction: 'Transforme chaque soustraction en addition, puis calcule.',
        rows: () => subCalcRows(),
      }),
      countEx('soustraction'),
      rowsEx({
        icon: '🧠', tag: 'Entraînement', stars: 2, title: 'Calcul mental', short: 'Calcul mental',
        instruction: 'Calcule mentalement chaque différence.',
        rows: () => mentalSubRows(),
      }),
      rowsEx({
        icon: '⛓️', tag: 'Entraînement', stars: 2, title: 'Suites de soustractions et d\'additions', short: 'Suites d\'opérations',
        instruction: 'Transforme l\'expression en suite d\'additions : complète seulement les termes qui remplacent une soustraction.',
        rows: () => chainRows(),
      }),
      rowsEx({
        icon: '🦜', tag: 'Défi', stars: 3, title: 'Programme de calcul', short: 'Programme de calcul',
        instruction: 'Complète chaque étape du programme de calcul.',
        tip: 'Retirer un nombre, c\'est lui soustraire : on ajoute son opposé.',
        rows: () => programRows(),
      }),
      rowsEx({
        icon: '📋', tag: 'Défi', stars: 3, title: 'Tableau : a − b + c et a + b − c', short: 'Tableau a, b, c',
        instruction: 'Complète le tableau : pour chaque ligne, calcule a − b + c puis a + b − c.',
        rows: () => abcRows(),
      }),
    ];
  }
  return [
    rowsEx({
      icon: '✂️', tag: 'Échauffement', stars: 1, title: 'Simplifier les additions', short: 'Simplifier',
      instruction: 'Simplifie chaque addition en supprimant les parenthèses et les signes qui ne sont pas nécessaires. Écris par exemple −16 − 97.',
      rows: () => simpleAddRows(),
    }),
    rowsEx({
      icon: '🔁', tag: 'Échauffement', stars: 1, title: 'Soustraction → addition → écriture simplifiée', short: 'Soustraction à simplifier',
      instruction: 'Transforme la soustraction en addition (avec des parenthèses, par exemple (−8) + (+13)), puis donne l\'écriture simplifiée.',
      rows: () => subToSimpleRows(),
    }),
    rowsEx({
      icon: '🧠', tag: 'Entraînement', stars: 2, title: 'Calcul mental en écriture simplifiée', short: 'Calcul mental',
      instruction: 'Calcule mentalement.',
      rows: () => mentalSimpleRows(),
    }),
    rowsEx({
      icon: '📝', tag: 'Entraînement', stars: 2, title: 'Avec parenthèses → écriture simplifiée', short: 'Parenthèses → simplifié',
      instruction: 'Écris chaque expression sans parenthèses, puis calcule le résultat.',
      tip: '« + + » donne +, « + − » donne −, « − + » donne −, « − − » donne +.',
      rows: () => parenSimplifyRows(),
    }),
    rowsEx({
      icon: '➡️', tag: 'Entraînement', stars: 2, title: 'Calculer de gauche à droite', short: 'De gauche à droite',
      instruction: 'Effectue le calcul de gauche à droite : d\'abord les deux premiers termes.',
      rows: () => leftToRightRows(),
    }),
  ];
}
