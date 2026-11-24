import { fmtNum } from './ProportionnaliteHub';

/**
 * Data for the 5ème « Symétrie centrale · Propriétés » sub-quiz (pure data, no React).
 * A convex polygon and its image through the symmetry of centre O are generated with real geometry; the
 * measures shown (cm, degrees) are the geometry rounded to 0.5 cm / 5°, so the labels on the figure and on
 * its image are always identical, as the symmetry preserves them.
 *
 * Angles are written `∠ABC` in strings; the UI renders them with a hat above the three letters.
 */

export interface Pt { x: number; y: number }

export const FIG_W = 560;
export const FIG_H = 300;
const SCALE = 30; // px per cm

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const randFloat = (a: number, b: number) => a + Math.random() * (b - a);

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export interface PropFigure {
  names: string[];
  O: Pt;
  orig: Pt[];
  img: Pt[];
  /** sides[i] joins vertex i to vertex i+1 (cm, multiples of 0.5). */
  sides: number[];
  /** angles[i] is the interior angle at vertex i (degrees, multiples of 5). */
  angles: number[];
  areaCm: number;
}

const roundTo = (v: number, step: number) => Math.round(v / step) * step;
const mirrorOf = (O: Pt) => (p: Pt): Pt => ({ x: 2 * O.x - p.x, y: 2 * O.y - p.y });

export function generateFigure(n: number): PropFigure {
  const O: Pt = { x: FIG_W / 2, y: FIG_H / 2 };
  const names = 'ABCDE'.slice(0, n).split('');
  const mirror = mirrorOf(O);
  for (let attempt = 0; attempt < 200; attempt++) {
    const d = randFloat(125, 150);
    const c: Pt = { x: O.x - d, y: O.y + randFloat(-30, 30) };
    const R = randFloat(72, 86);
    const start = randFloat(0, 2 * Math.PI);
    const step = (2 * Math.PI) / n;
    const orig: Pt[] = names.map((_, i) => {
      const ang = start + i * step + randFloat(-0.42, 0.42) * step;
      const rad = R * randFloat(0.72, 1);
      return { x: c.x + rad * Math.cos(ang), y: c.y + rad * Math.sin(ang) };
    });

    // Convexity: all cross products share the same sign.
    let sign = 0;
    let convex = true;
    for (let i = 0; i < n && convex; i++) {
      const a = orig[i]!, b = orig[(i + 1) % n]!, e = orig[(i + 2) % n]!;
      const cross = (b.x - a.x) * (e.y - b.y) - (b.y - a.y) * (e.x - b.x);
      const s = Math.sign(cross);
      if (s === 0 || (sign !== 0 && s !== sign)) convex = false;
      sign = sign || s;
    }
    if (!convex) continue;

    const sidesPx = orig.map((p, i) => dist(p, orig[(i + 1) % n]!));
    if (sidesPx.some((s) => s < 1.6 * SCALE)) continue;

    const angles = orig.map((p, i) => {
      const prev = orig[(i + n - 1) % n]!, next = orig[(i + 1) % n]!;
      const v1 = { x: prev.x - p.x, y: prev.y - p.y }, v2 = { x: next.x - p.x, y: next.y - p.y };
      const cos = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y));
      return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
    });
    if (angles.some((a) => a < 55 || a > 150)) continue;
    if (angles.filter((a) => roundTo(a, 5) !== 90).length < 2) continue;

    let area2 = 0;
    for (let i = 0; i < n; i++) {
      const a = orig[i]!, b = orig[(i + 1) % n]!;
      area2 += a.x * b.y - b.x * a.y;
    }
    const areaCm = Math.round(Math.abs(area2) / 2 / (SCALE * SCALE));
    if (areaCm < 3) continue;

    return {
      names,
      O,
      orig,
      img: orig.map(mirror),
      sides: sidesPx.map((s) => Math.max(1.5, roundTo(s / SCALE, 0.5))),
      angles: angles.map((a) => roundTo(a, 5)),
      areaCm,
    };
  }
  // Fallback: regular polygon (always valid).
  const c: Pt = { x: O.x - 135, y: O.y };
  const orig = names.map((_, i) => ({ x: c.x + 75 * Math.cos((2 * Math.PI * i) / n), y: c.y + 75 * Math.sin((2 * Math.PI * i) / n) }));
  const side = roundTo((2 * 75 * Math.sin(Math.PI / n)) / SCALE, 0.5);
  const interior = roundTo(180 - 360 / n, 5);
  return {
    names, O, orig, img: orig.map(mirror),
    sides: names.map(() => side), angles: names.map(() => interior), areaCm: 14,
  };
}

// ── Names / formatting helpers ────────────────────────────────────────────────

const prime = (s: string) => s.split('').map((ch) => `${ch}'`).join('');

export function sideName(f: PropFigure, i: number, image: boolean): string {
  const a = f.names[i]!, b = f.names[(i + 1) % f.names.length]!;
  return image ? prime(a + b) : a + b;
}

/** `∠ABC` (rendered with a hat by the UI). */
export function angleName(f: PropFigure, i: number, image: boolean): string {
  const n = f.names.length;
  const s = f.names[(i + n - 1) % n]! + f.names[i]! + f.names[(i + 1) % n]!;
  return `∠${image ? prime(s) : s}`;
}

export function polygonName(f: PropFigure, image: boolean): string {
  const s = f.names.join('');
  return image ? prime(s) : s;
}

export const fmtCm = (v: number) => `${fmtNum(v)} cm`;
export const fmtDeg = (v: number) => `${v}°`;

// ── Exercises ─────────────────────────────────────────────────────────────────

/** What the figure shows: values on the original, "?" on the image where something is asked. */
export interface AskedSet {
  sides: number[];
  angles: number[];
  area: boolean;
}

// Exercise 1: put the steps of a proof in order (Je sais que / Or / Donc), once for a length and once for an angle.

export interface DndSlot {
  id: string;
  expected: string;
}

export interface DndBlock {
  id: 'length' | 'angle';
  title: string;
  slots: DndSlot[];
}

export interface DndChip {
  id: string;
  label: string;
}

export interface DndExercise {
  fig: PropFigure;
  asked: AskedSet;
  blocks: DndBlock[];
  chips: DndChip[];
}

export function generateDndExercise(): DndExercise {
  const fig = generateFigure(randInt(4, 5));
  const n = fig.names.length;
  const angle = pickAngleIndex(fig);
  const side = pickSideAwayFrom(angle, n);

  const lengthSteps = [
    `Je sais que [${sideName(fig, side, false)}] et [${sideName(fig, side, true)}] sont symétriques par rapport à O.`,
    'Or la symétrie centrale conserve les longueurs.',
    `Donc ${sideName(fig, side, true)} = ${sideName(fig, side, false)} = ${fmtCm(fig.sides[side]!)}.`,
  ];
  const angleSteps = [
    `Je sais que les angles ${angleName(fig, angle, false)} et ${angleName(fig, angle, true)} sont symétriques par rapport à O.`,
    'Or la symétrie centrale conserve la mesure des angles.',
    `Donc ${angleName(fig, angle, true)} = ${angleName(fig, angle, false)} = ${fmtDeg(fig.angles[angle]!)}.`,
  ];

  const blocks: DndBlock[] = [
    { id: 'length', title: `Calculer la longueur ${sideName(fig, side, true)}`, slots: lengthSteps.map((s, i) => ({ id: `l${i}`, expected: s })) },
    { id: 'angle', title: `Trouver la mesure de l'angle ${angleName(fig, angle, true)}`, slots: angleSteps.map((s, i) => ({ id: `a${i}`, expected: s })) },
  ];

  // Two distractors: a wrong property, and a wrong value (the supplementary angle — a classic mistake).
  const distractors = [
    'Or la symétrie centrale conserve les aires.',
    `Donc ${angleName(fig, angle, true)} = ${fmtDeg(180 - fig.angles[angle]!)}.`,
  ];
  const chips: DndChip[] = shuffle([...lengthSteps, ...angleSteps, ...distractors]).map((label, i) => ({ id: `c${i}`, label }));
  return { fig, asked: { sides: [side], angles: [angle], area: false }, blocks, chips };
}

// Exercise 2: fill-in-the-blanks sentences.

export type FillKind = 'side' | 'angle' | 'area';

export interface FillLine {
  kind: FillKind;
  premise: string;
  unit: string;
  expected: number;
  /** The words before the property drop-down. */
  because: string;
  options: string[];
  expectedOption: string;
  justification: string;
}

export interface FillExercise {
  fig: PropFigure;
  asked: AskedSet;
  lines: FillLine[];
}

const PROPERTY_OPTIONS = ['les longueurs', 'la mesure des angles', 'les aires', 'les alignements'];

export function generateFillExercise(): FillExercise {
  const fig = generateFigure(randInt(4, 5));
  const n = fig.names.length;
  const angle = pickAngleIndex(fig);
  const side = pickSideAwayFrom(angle, n);
  const lines: FillLine[] = [
    {
      kind: 'side',
      premise: `${sideName(fig, side, false)} = ${fmtCm(fig.sides[side]!)} donc ${sideName(fig, side, true)} =`,
      unit: 'cm', expected: fig.sides[side]!,
      because: 'car la symétrie centrale conserve', options: shuffle(PROPERTY_OPTIONS), expectedOption: 'les longueurs',
      justification: `${sideName(fig, side, true)} = ${fmtCm(fig.sides[side]!)} car la symétrie centrale conserve les longueurs.`,
    },
    {
      kind: 'angle',
      premise: `${angleName(fig, angle, false)} = ${fmtDeg(fig.angles[angle]!)} donc ${angleName(fig, angle, true)} =`,
      unit: '°', expected: fig.angles[angle]!,
      because: 'car la symétrie centrale conserve', options: shuffle(PROPERTY_OPTIONS), expectedOption: 'la mesure des angles',
      justification: `${angleName(fig, angle, true)} = ${fmtDeg(fig.angles[angle]!)} car la symétrie centrale conserve la mesure des angles.`,
    },
    {
      kind: 'area',
      premise: `Aire(${polygonName(fig, false)}) = ${fmtNum(fig.areaCm)} cm² donc Aire(${polygonName(fig, true)}) =`,
      unit: 'cm²', expected: fig.areaCm,
      because: 'car la symétrie centrale conserve', options: shuffle(PROPERTY_OPTIONS), expectedOption: 'les aires',
      justification: `Aire(${polygonName(fig, true)}) = ${fmtNum(fig.areaCm)} cm² car la symétrie centrale conserve les aires.`,
    },
  ];
  return { fig, asked: { sides: [side], angles: [angle], area: true }, lines };
}

/** An angle that is not a right angle (so the supplementary-angle mistake is a different value). */
function pickAngleIndex(fig: PropFigure): number {
  const candidates = fig.angles.map((a, i) => (a !== 90 ? i : -1)).filter((i) => i >= 0);
  return candidates.length > 0 ? candidates[randInt(0, candidates.length - 1)]! : 0;
}

/** A side that does not touch vertex `angle`, so the two labels never crowd each other on the figure. */
function pickSideAwayFrom(angle: number, n: number): number {
  const candidates = Array.from({ length: n }, (_, i) => i).filter((i) => i !== angle && (i + 1) % n !== angle);
  return candidates[randInt(0, candidates.length - 1)]!;
}
