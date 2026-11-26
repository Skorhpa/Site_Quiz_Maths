/**
 * Angles (6ème, chapitre 6) — pure data: geometry helpers and the random generators of the three
 * sub-quizzes (reconnaître, mesurer, construire). Angles are in degrees, measured counter-clockwise
 * (maths convention); SVG points are computed with y pointing down.
 */

export interface P { x: number; y: number }
export type Nature = 'aigu' | 'droit' | 'obtus' | 'plat';
export const NATURES: Nature[] = ['aigu', 'droit', 'obtus', 'plat'];

export const natureOf = (m: number): Nature => (m < 90 ? 'aigu' : m === 90 ? 'droit' : m < 180 ? 'obtus' : 'plat');

export const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const rad = (d: number) => (d * Math.PI) / 180;
export const norm360 = (d: number) => ((d % 360) + 360) % 360;

/** Point at distance `len` from `o` in direction `deg`. */
export const dirPt = (o: P, deg: number, len: number): P => ({ x: o.x + len * Math.cos(rad(deg)), y: o.y - len * Math.sin(rad(deg)) });
/** Direction (0–360°) of the half-line [op). */
export const dirOf = (o: P, p: P): number => norm360((Math.atan2(o.y - p.y, p.x - o.x) * 180) / Math.PI);
/** Geometric angle (0–180°) between two directions. */
export function angleBetween(d1: number, d2: number): number {
  const d = norm360(d2 - d1);
  return d > 180 ? 360 - d : d;
}
export const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);

/** Reads a measure typed by a student: "49", "49°", " 49 ° ". Returns null if it is not a whole number. */
export function parseDeg(v: string): number | null {
  const s = v.replace(/°/g, '').replace(/\s+/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

const LETTERS = 'ABCDEFGHIJKLMNPRSTUVZ'.split('');
/** n distinct capital letters. */
export const letters = (n: number) => shuffle(LETTERS).slice(0, n);

// ── Polygons (convex, every angle readable) ───────────────────────────────────

export interface LabeledPt { label: string; p: P }

/** Interior angle at vertex i of a polygon. */
export function interiorAngle(pts: P[], i: number): number {
  const n = pts.length;
  const v = pts[i]!, a = pts[(i + n - 1) % n]!, b = pts[(i + 1) % n]!;
  return angleBetween(dirOf(v, a), dirOf(v, b));
}

/** Random convex polygon in a w×h box whose angles are all between 35° and 145°. */
export function randomPolygon(n: 3 | 4, w: number, h: number): P[] {
  for (let attempt = 0; attempt < 400; attempt++) {
    const start = Math.random() * 360;
    const angles = Array.from({ length: n }, (_, i) => start + (360 / n) * i + (Math.random() - 0.5) * (200 / n));
    const pts = angles.map((a) => ({
      x: w / 2 + (w / 2 - 40) * Math.cos(rad(a)),
      y: h / 2 - (h / 2 - 34) * Math.sin(rad(a)),
    }));
    const ok = pts.every((_, i) => {
      const m = interiorAngle(pts, i);
      return m > 35 && m < 145;
    });
    const sides = pts.every((p, i) => dist(p, pts[(i + 1) % n]!) > 90);
    if (ok && sides) return pts;
  }
  return n === 3
    ? [{ x: 60, y: h - 40 }, { x: w - 50, y: h - 60 }, { x: w / 2, y: 40 }]
    : [{ x: 60, y: h - 40 }, { x: w - 60, y: h - 50 }, { x: w - 90, y: 50 }, { x: 80, y: 60 }];
}

// ── Reconnaître ──────────────────────────────────────────────────────────────

/** Name an angle of a polygon: its name, its vertex, its sides. */
export interface NameEx { kind: 'name'; pts: LabeledPt[]; vertex: number }
export function genName(): NameEx {
  const n = pick([3, 4] as const);
  const pts = randomPolygon(n, 380, 250);
  const ls = letters(n);
  return { kind: 'name', pts: pts.map((p, i) => ({ label: ls[i]!, p })), vertex: randInt(0, n - 1) };
}

/** All the names of one angle (a vertex, two points on one side, one point on the other). */
export interface AllNamesEx {
  kind: 'allnames';
  V: LabeledPt; X1: LabeledPt; X2: LabeledPt; Y: LabeledPt;
  options: { name: string; ok: boolean }[];
}
export function genAllNames(): AllNamesEx {
  const [v, x1, x2, y] = letters(4) as [string, string, string, string];
  const base = randInt(0, 359);
  const open = randInt(40, 80);
  const turn = Math.random() < 0.5 ? 1 : -1;
  const O: P = { x: 0, y: 0 };
  const dX = base, dY = base + turn * open;
  const raw = { V: O, X1: dirPt(O, dX, 120), X2: dirPt(O, dX, 250), Y: dirPt(O, dY, 210) };
  // fit into a 380×250 box
  const all = Object.values(raw);
  const minX = Math.min(...all.map((p) => p.x)), maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y)), maxY = Math.max(...all.map((p) => p.y));
  const s = Math.min(320 / (maxX - minX || 1), 200 / (maxY - minY || 1), 1);
  const fit = (p: P): P => ({ x: 30 + (p.x - minX) * s + (320 - (maxX - minX) * s) / 2, y: 25 + (p.y - minY) * s + (200 - (maxY - minY) * s) / 2 });
  const ok = [`${x1}${v}${y}`, `${y}${v}${x1}`, `${x2}${v}${y}`, `${y}${v}${x2}`];
  const wrong = [`${v}${x1}${y}`, `${x1}${y}${v}`, `${x1}${v}${x2}`, `${y}${x2}${v}`];
  return {
    kind: 'allnames',
    V: { label: v, p: fit(raw.V) }, X1: { label: x1, p: fit(raw.X1) }, X2: { label: x2, p: fit(raw.X2) }, Y: { label: y, p: fit(raw.Y) },
    options: shuffle([...ok.map((name) => ({ name, ok: true })), ...shuffle(wrong).slice(0, 3).map((name) => ({ name, ok: false }))]),
  };
}

export const ARC_COLORS = [
  { name: 'bleu', hex: '#60A5FA' },
  { name: 'orange', hex: '#FB923C' },
  { name: 'vert', hex: '#34D399' },
  { name: 'rose', hex: '#F472B6' },
] as const;

/** Quadrilateral whose four angles are coloured; find the colour of named angles. */
export interface ColorEx { kind: 'color'; pts: LabeledPt[]; colorOf: number[]; asked: { vertex: number; reversed: boolean }[] }
export function genColor(): ColorEx {
  const pts = randomPolygon(4, 380, 250);
  const ls = letters(4);
  const asked = shuffle([0, 1, 2, 3]).slice(0, 3).map((vertex) => ({ vertex, reversed: Math.random() < 0.5 }));
  return { kind: 'color', pts: pts.map((p, i) => ({ label: ls[i]!, p })), colorOf: shuffle([0, 1, 2, 3]), asked };
}

/** Nature of an angle from its measure. */
export interface NatureMeasureEx { kind: 'natureMeasure'; measures: number[] }
export function genNatureMeasure(): NatureMeasureEx {
  const near = pick([randInt(84, 89), randInt(91, 96)]);
  const measures = shuffle([90, 180, near, randInt(1, 60), randInt(100, 179), pick([randInt(20, 80), randInt(110, 170)])]);
  return { kind: 'natureMeasure', measures };
}

/** Nature of drawn angles. */
export interface DrawnAngle { dir: number; m: number }
export interface NatureFigureEx { kind: 'natureFigure'; angles: DrawnAngle[] }
export function genNatureFigure(): NatureFigureEx {
  const ms = shuffle([randInt(25, 70), 90, randInt(110, 160), 180]);
  return { kind: 'natureFigure', angles: ms.map((m) => ({ dir: m === 180 ? pick([0, 10, 350, 20]) : randInt(0, 359), m })) };
}

// ── Mesurer ──────────────────────────────────────────────────────────────────

/** Match drawn angles with measures, without instruments. */
export interface EstimateEx { kind: 'estimate'; angles: (DrawnAngle & { label: string })[]; choices: number[] }
export function genEstimate(): EstimateEx {
  const pool = [10, 20, 30, 45, 60, 90, 120, 135, 150, 170];
  let chosen: number[] = [];
  for (let attempt = 0; attempt < 200; attempt++) {
    chosen = shuffle(pool).slice(0, 4).sort((a, b) => a - b);
    if (chosen.every((m, i) => i === 0 || m - chosen[i - 1]! >= 25)) break;
  }
  const ls = letters(4);
  return {
    kind: 'estimate',
    angles: shuffle(chosen).map((m, i) => ({ label: ls[i]!, m, dir: randInt(0, 359) })),
    choices: chosen,
  };
}

/** A protractor laid on an angle: the angle's first side lies on a « 0 » of the protractor. */
export interface ProtReading {
  /** rotation of the protractor (degrees). */
  rot: number;
  /** true: first side on the right « 0 » (inner scale) — false: on the left « 0 » (outer scale). */
  right: boolean;
  m: number;
}
/** Direction of the first side and of the second side of a reading. */
export function sidesOf(r: ProtReading): [number, number] {
  return r.right ? [r.rot, r.rot + r.m] : [r.rot + 180, r.rot + 180 - r.m];
}

export interface CoarseReadEx { kind: 'coarseRead'; items: ProtReading[] }
export function genCoarseRead(): CoarseReadEx {
  const ms = shuffle([10, 20, 30, 40, 50, 60, 70, 80, 100, 110, 120, 130, 140, 150, 160, 170]).slice(0, 3);
  return { kind: 'coarseRead', items: ms.map((m, i) => ({ m, right: Math.random() < 0.5, rot: i === 2 ? pick([-35, -25, 25, 35]) : 0 })) };
}

export interface FineReadEx { kind: 'fineRead'; items: (ProtReading & { names: [string, string, string] })[] }
export function genFineRead(): FineReadEx {
  const rights = shuffle([true, false]);
  return {
    kind: 'fineRead',
    items: rights.map((right) => {
      let m = randInt(12, 168);
      while (m % 10 === 0 || Math.abs(m - 90) < 4) m = randInt(12, 168);
      return { m, right, rot: 0, names: letters(3) as [string, string, string] };
    }),
  };
}

/** Two half-lines [KJ) and [KL) on a protractor laid on the line (xy): natures and measures. */
export interface DoubleReadEx {
  kind: 'doubleRead';
  /** direction of [KL) and of [KJ) (local protractor angles, 0 = towards y). */
  l: number; j: number;
  names: { K: string; J: string; L: string };
  asked: { a: 'x' | 'y' | 'L'; b: 'J' | 'L'; m: number }[];
}
export function genDoubleRead(): DoubleReadEx {
  let l = randInt(28, 80);
  let j = randInt(l + 40, 158);
  // no measure close to 90° (it would be a right angle, without its square mark)
  while ([l, j, 180 - l, 180 - j, j - l].some((m) => Math.abs(m - 90) < 4)) {
    l = randInt(28, 80);
    j = randInt(l + 40, 158);
  }
  const [K, J, L] = letters(3) as [string, string, string];
  const pool: DoubleReadEx['asked'] = [
    { a: 'x', b: 'J', m: 180 - j },
    { a: 'x', b: 'L', m: 180 - l },
    { a: 'y', b: 'J', m: j },
    { a: 'y', b: 'L', m: l },
  ];
  const asked = [...shuffle(pool).slice(0, 2), { a: 'L' as const, b: 'J' as const, m: j - l }];
  return { kind: 'doubleRead', l, j, names: { K, J, L }, asked };
}

/** Measure an angle with the movable protractor. */
export interface ToolMeasureEx { kind: 'toolMeasure'; dir: number; m: number; name: 'xOy' | 'yOx' }
export function genToolMeasure(): ToolMeasureEx {
  let m = randInt(18, 162);
  while (Math.abs(m - 90) < 6) m = randInt(18, 162);
  return { kind: 'toolMeasure', dir: randInt(0, 359), m, name: pick(['xOy', 'yOx'] as const) };
}

// ── Construire ───────────────────────────────────────────────────────────────

export interface CoarseBuildEx { kind: 'coarseBuild'; reading: ProtReading }
export function genCoarseBuild(): CoarseBuildEx {
  const m = pick([20, 30, 40, 50, 60, 70, 80, 100, 110, 120, 130, 140, 150, 160]);
  return { kind: 'coarseBuild', reading: { m, right: Math.random() < 0.5, rot: pick([0, 0, -20, 20]) } };
}

export interface FineBuildEx { kind: 'fineBuild'; reading: ProtReading; names: [string, string, string] }
export function genFineBuild(): FineBuildEx {
  let m = randInt(15, 165);
  while (m % 10 === 0) m = randInt(15, 165);
  return { kind: 'fineBuild', reading: { m, right: Math.random() < 0.5, rot: 0 }, names: letters(3) as [string, string, string] };
}

export interface FreeBuildEx { kind: 'freeBuild'; dir: number; m: number }
export function genFreeBuild(): FreeBuildEx {
  let m = randInt(20, 160);
  while (Math.abs(m - 90) < 5) m = randInt(20, 160);
  return { kind: 'freeBuild', dir: pick([randInt(-30, 30), randInt(150, 210)]), m };
}

/** Build the third vertex of a triangle: angle at B and length BC given. */
export interface TriangleBuildEx { kind: 'triangleBuild'; names: { A: string; B: string; C: string }; ab: number; m: number; bc: number }
export function genTriangleBuild(): TriangleBuildEx {
  const [A, B, C] = letters(3) as [string, string, string];
  return { kind: 'triangleBuild', names: { A, B, C }, ab: randInt(6, 8), m: pick([randInt(30, 80), randInt(100, 125)]), bc: randInt(8, 13) / 2 };
}

export type ReconnaitreEx = NameEx | AllNamesEx | ColorEx | NatureMeasureEx | NatureFigureEx;
export type MesurerEx = EstimateEx | CoarseReadEx | FineReadEx | DoubleReadEx | ToolMeasureEx;
export type ConstruireEx = CoarseBuildEx | FineBuildEx | FreeBuildEx | TriangleBuildEx;
export type AngleEx = ReconnaitreEx | MesurerEx | ConstruireEx;
export type AnglesMode = 'reconnaitre' | 'mesurer' | 'construire';

export function buildAngles(mode: AnglesMode): AngleEx[] {
  if (mode === 'reconnaitre') return [genName(), genAllNames(), genColor(), genNatureMeasure(), genNatureFigure()];
  if (mode === 'mesurer') return [genEstimate(), genCoarseRead(), genFineRead(), genDoubleRead(), genToolMeasure()];
  return [genCoarseBuild(), genFineBuild(), genFreeBuild(), genTriangleBuild()];
}
