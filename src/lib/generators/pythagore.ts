import type {
  PythagoreCompleterConfig,
  PythagoreCompleterExercise,
  PythagoreExercise,
  PythagoreRegularExercise,
} from '@/types';

const round1 = (x: number) => Math.round(x * 10) / 10;
const round2 = (x: number) => Math.round(x * 100) / 100;
const isWhole = (x: number) => Math.abs(x - Math.round(x)) < 0.001;

export function pythFormatAns(x: number, unit: string): string {
  if (isWhole(x)) return `${Math.round(x)} ${unit}`;
  const r1 = round1(x);
  if (Math.abs(r1 - x) < 0.005) return `${r1} ${unit}`;
  return `${round2(x)} ${unit}`;
}
export function pythIsWhole(x: number): boolean {
  return isWhole(x);
}

const makeSVG = (lines: string) =>
  `<svg width="170" height="140" viewBox="0 0 170 140" fill="none" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`;

function figureABC(a: number, b: number, c: number, missing: 'a' | 'b' | 'c'): string {
  const cx = 20, cy = 110, ax = 20, ay = 20, bx = 150, by = 110, col = '#60A5FA', mu = '#7A7F94';
  const lc = (s: string) => (s === missing ? '#F0EDE8' : mu);
  const lv = (s: string, v: number) => (s === missing ? '?' : `${v}`);
  return makeSVG(`<polygon points="${ax},${ay} ${cx},${cy} ${bx},${by}" fill="rgba(96,165,250,0.06)" stroke="${col}" stroke-width="1.5"/>
    <rect x="${cx}" y="${cy - 14}" width="14" height="14" fill="none" stroke="${col}" stroke-width="1.2"/>
    <text x="${(ax + cx) / 2 - 18}" y="${(ay + cy) / 2 + 4}" fill="${lc('a')}" font-family="DM Mono,monospace" font-size="13">${lv('a', a)} cm</text>
    <text x="${(cx + bx) / 2 - 8}" y="${cy + 18}" fill="${lc('b')}" font-family="DM Mono,monospace" font-size="13">${lv('b', b)} cm</text>
    <text x="${(ax + bx) / 2 + 4}" y="${(ay + by) / 2 - 4}" fill="${lc('c')}" font-family="DM Mono,monospace" font-size="13">${lv('c', c)} cm</text>
    <text x="${ax - 6}" y="${ay - 8}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="11">A</text>
    <text x="${cx - 16}" y="${cy + 4}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="11">C</text>
    <text x="${bx + 4}" y="${by + 4}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="11">B</text>`);
}

function figureABC2(a: number, b: number, c: number, missing: 'a' | 'b' | 'c'): string {
  const cx = 150, cy = 110, ax = 150, ay = 20, bx = 30, by = 110, col = '#60A5FA', mu = '#7A7F94';
  const lc = (s: string) => (s === missing ? '#F0EDE8' : mu);
  const lv = (s: string, v: number) => (s === missing ? '?' : `${v}`);
  return makeSVG(`<polygon points="${ax},${ay} ${cx},${cy} ${bx},${by}" fill="rgba(96,165,250,0.06)" stroke="${col}" stroke-width="1.5"/>
    <rect x="${cx - 14}" y="${cy - 14}" width="14" height="14" fill="none" stroke="${col}" stroke-width="1.2"/>
    <text x="${(ax + cx) / 2 + 6}" y="${(ay + cy) / 2 + 4}" fill="${lc('a')}" font-family="DM Mono,monospace" font-size="13">${lv('a', a)} cm</text>
    <text x="${(cx + bx) / 2 - 8}" y="${cy + 18}" fill="${lc('b')}" font-family="DM Mono,monospace" font-size="13">${lv('b', b)} cm</text>
    <text x="${(ax + bx) / 2 - 30}" y="${(ay + by) / 2 - 4}" fill="${lc('c')}" font-family="DM Mono,monospace" font-size="13">${lv('c', c)} cm</text>
    <text x="${ax + 4}" y="${ay - 8}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="11">A</text>
    <text x="${cx + 4}" y="${cy + 4}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="11">C</text>
    <text x="${bx - 16}" y="${by + 4}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="11">B</text>`);
}

function correctFigABC(a: number, b: number, c: number, missing: 'a' | 'b' | 'c'): string {
  const cx = 20, cy = 110, ax = 20, ay = 20, bx = 150, by = 110, col = '#60A5FA', mu = '#7A7F94';
  const lc = (s: string) => (s === missing ? '#F0EDE8' : mu);
  // Bold the answer value on the missing side (matches Site.html:1403 `<strong>${round1(v)}</strong>`).
  const lv = (s: string, v: number) =>
    s === missing
      ? `<tspan font-weight="bold">${Math.round(v * 10) / 10}</tspan>`
      : `${v}`;
  return `<svg width="170" height="140" viewBox="0 0 170 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${ax},${ay} ${cx},${cy} ${bx},${by}" fill="rgba(96,165,250,0.07)" stroke="${col}" stroke-width="1.5"/>
    <rect x="${cx}" y="${cy - 14}" width="14" height="14" fill="none" stroke="${col}" stroke-width="1.2"/>
    <text x="${ax - 6}" y="${ay - 8}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="12">A</text>
    <text x="${cx - 16}" y="${cy + 4}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="12">C</text>
    <text x="${bx + 4}" y="${by + 4}" fill="#A78BFA" font-family="DM Mono,monospace" font-size="12">B</text>
    <text x="${(ax + cx) / 2 - 22}" y="${(ay + cy) / 2 + 4}" fill="${lc('a')}" font-family="DM Mono,monospace" font-size="12">${lv('a', a)} cm</text>
    <text x="${(cx + bx) / 2 - 8}" y="${cy + 18}" fill="${lc('b')}" font-family="DM Mono,monospace" font-size="12">${lv('b', b)} cm</text>
    <text x="${(ax + bx) / 2 + 4}" y="${(ay + by) / 2 - 4}" fill="${lc('c')}" font-family="DM Mono,monospace" font-size="12">${lv('c', c)} cm</text>
  </svg>`;
}

const DEC_HYP: [number, number][] = [
  [3, 5], [4, 7], [5, 8], [6, 9], [7, 10], [4, 6], [5, 7], [6, 11], [8, 11], [9, 13],
  [3, 7], [4, 9], [5, 9], [6, 7], [7, 9], [2, 5], [3, 8], [4, 11], [5, 11], [10, 13],
];
const DEC_LEG: [number, number][] = [
  [5, 3], [7, 4], [8, 5], [10, 6], [11, 7], [13, 8], [10, 7], [13, 9], [11, 6], [14, 9],
  [7, 3], [9, 5], [12, 7], [15, 8], [11, 8], [13, 7], [10, 3], [14, 11], [12, 5], [15, 11],
];

const PYTH_TRIPLES: [number, number, number][] = [
  [3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15],
  [10, 24, 26], [20, 21, 29], [9, 40, 41], [12, 16, 20], [15, 20, 25],
];

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const reg = (data: Omit<PythagoreRegularExercise, 'type' | 'pythType'>): PythagoreRegularExercise => ({
  type: 'default',
  pythType: 'regular',
  ...data,
});

function makeHypDecimal(wf: boolean): PythagoreRegularExercise {
  const [a, b] = pick(DEC_HYP);
  const sqSum = a * a + b * b;
  const c = Math.sqrt(sqSum);
  const cDisp = round1(c);
  const fig = wf ? (Math.random() < 0.5 ? figureABC(a, b, c, 'c') : figureABC2(a, b, c, 'c')) : null;
  const corrFig = !wf ? correctFigABC(a, b, cDisp, 'c') : null;
  return reg({
    text: `Dans le triangle ABC rectangle en C, AC = <strong>${a} cm</strong> et BC = <strong>${b} cm</strong>. Calcule AB (arrondi au dixième).`,
    figure: fig,
    corrFig,
    given: `AC = ${a} cm\nBC = ${b} cm\nAB = ?`,
    askLabel: 'AB',
    ans: cDisp,
    unit: 'cm',
    steps: [
      { eq: 'AB² = AC² + BC²' },
      { eq: `AB² = ${a}² + ${b}²` },
      { eq: `AB² = ${a * a} + ${b * b}` },
      { eq: `AB² = ${sqSum}` },
      { eq: `AB = √${sqSum} ≈ ${cDisp} cm` },
    ],
    decimal: true,
  });
}

function makeLegDecimal(wf: boolean): PythagoreRegularExercise {
  const [hyp, leg1] = pick(DEC_LEG);
  const sqDiff = hyp * hyp - leg1 * leg1;
  const leg2 = Math.sqrt(sqDiff);
  const leg2Disp = round1(leg2);
  const fA = Math.random() < 0.5;
  const missing: 'a' | 'b' = fA ? 'a' : 'b';
  const fig = wf
    ? Math.random() < 0.5
      ? figureABC(leg1, leg2Disp, hyp, missing)
      : figureABC2(leg1, leg2Disp, hyp, missing)
    : null;
  const corrFig = !wf ? correctFigABC(leg1, leg2Disp, hyp, missing) : null;
  if (fA) {
    return reg({
      text: `Dans le triangle ABC rectangle en C, AB = <strong>${hyp} cm</strong> et BC = <strong>${leg1} cm</strong>. Calcule AC (arrondi au dixième).`,
      figure: fig,
      corrFig,
      given: `AB = ${hyp} cm\nBC = ${leg1} cm\nAC = ?`,
      askLabel: 'AC',
      ans: leg2Disp,
      unit: 'cm',
      steps: [
        { eq: 'AB² = AC² + BC²' },
        { eq: `${hyp}² = AC² + ${leg1}²` },
        { eq: `AC² = ${hyp}² − ${leg1}²` },
        { eq: `AC² = ${hyp * hyp} − ${leg1 * leg1}` },
        { eq: `AC² = ${sqDiff}` },
        { eq: `AC = √${sqDiff} ≈ ${leg2Disp} cm` },
      ],
      decimal: true,
    });
  }
  return reg({
    text: `Dans le triangle ABC rectangle en C, AB = <strong>${hyp} cm</strong> et AC = <strong>${leg1} cm</strong>. Calcule BC (arrondi au dixième).`,
    figure: fig,
    corrFig,
    given: `AB = ${hyp} cm\nAC = ${leg1} cm\nBC = ?`,
    askLabel: 'BC',
    ans: leg2Disp,
    unit: 'cm',
    steps: [
      { eq: 'AB² = AC² + BC²' },
      { eq: `${hyp}² = ${leg1}² + BC²` },
      { eq: `BC² = ${hyp}² − ${leg1}²` },
      { eq: `BC² = ${hyp * hyp} − ${leg1 * leg1}` },
      { eq: `BC² = ${sqDiff}` },
      { eq: `BC = √${sqDiff} ≈ ${leg2Disp} cm` },
    ],
    decimal: true,
  });
}

function makeHyp(wf: boolean): PythagoreRegularExercise {
  const [a, b, c] = pick(PYTH_TRIPLES);
  const fig = wf ? (Math.random() < 0.5 ? figureABC(a, b, c, 'c') : figureABC2(a, b, c, 'c')) : null;
  const corrFig = !wf ? correctFigABC(a, b, c, 'c') : null;
  return reg({
    text: `Dans le triangle ABC rectangle en C, AC = <strong>${a} cm</strong> et BC = <strong>${b} cm</strong>. Calcule AB.`,
    figure: fig,
    corrFig,
    given: `AC = ${a} cm\nBC = ${b} cm\nAB = ?`,
    askLabel: 'AB',
    ans: c,
    unit: 'cm',
    steps: [
      { eq: 'AB² = AC² + BC²' },
      { eq: `AB² = ${a}² + ${b}²` },
      { eq: `AB² = ${a * a} + ${b * b}` },
      { eq: `AB² = ${a * a + b * b}` },
      { eq: `AB = √${a * a + b * b} = ${c} cm` },
    ],
    decimal: false,
  });
}

function makeLeg(wf: boolean): PythagoreRegularExercise {
  const [a, b, c] = pick(PYTH_TRIPLES);
  const fA = Math.random() < 0.5;
  const missing: 'a' | 'b' = fA ? 'a' : 'b';
  const fig = wf
    ? Math.random() < 0.5
      ? figureABC(a, b, c, missing)
      : figureABC2(a, b, c, missing)
    : null;
  const corrFig = !wf ? correctFigABC(a, b, c, missing) : null;
  if (fA) {
    return reg({
      text: `Dans le triangle ABC rectangle en C, AB = <strong>${c} cm</strong> et BC = <strong>${b} cm</strong>. Calcule AC.`,
      figure: fig,
      corrFig,
      given: `AB = ${c} cm\nBC = ${b} cm\nAC = ?`,
      askLabel: 'AC',
      ans: a,
      unit: 'cm',
      steps: [
        { eq: 'AB² = AC² + BC²' },
        { eq: `${c}² = AC² + ${b}²` },
        { eq: `AC² = ${c}² − ${b}²` },
        { eq: `AC² = ${c * c} − ${b * b}` },
        { eq: `AC² = ${c * c - b * b}` },
        { eq: `AC = √${c * c - b * b} = ${a} cm` },
      ],
      decimal: false,
    });
  }
  return reg({
    text: `Dans le triangle ABC rectangle en C, AB = <strong>${c} cm</strong> et AC = <strong>${a} cm</strong>. Calcule BC.`,
    figure: fig,
    corrFig,
    given: `AB = ${c} cm\nAC = ${a} cm\nBC = ?`,
    askLabel: 'BC',
    ans: b,
    unit: 'cm',
    steps: [
      { eq: 'AB² = AC² + BC²' },
      { eq: `${c}² = ${a}² + BC²` },
      { eq: `BC² = ${c}² − ${a}²` },
      { eq: `BC² = ${c * c} − ${a * a}` },
      { eq: `BC² = ${c * c - a * a}` },
      { eq: `BC = √${c * c - a * a} = ${b} cm` },
    ],
    decimal: false,
  });
}

const COMPLETER_CONFIGS: PythagoreCompleterConfig[] = [
  { tri: 'EFG', rightAt: 'F', hyp: 'EG', leg1: 'EF', leg2: 'FG', v1: 3, v2: 4, ans: 5, sq1: 9, sq2: 16, sqSum: 25, decimal: false, find: 'hyp' },
  { tri: 'PQR', rightAt: 'Q', hyp: 'PR', leg1: 'PQ', leg2: 'QR', v1: 5, v2: 12, ans: 13, sq1: 25, sq2: 144, sqSum: 169, decimal: false, find: 'hyp' },
  { tri: 'LMN', rightAt: 'M', hyp: 'LN', leg1: 'LM', leg2: 'MN', v1: 8, v2: 15, ans: 17, sq1: 64, sq2: 225, sqSum: 289, decimal: false, find: 'hyp' },
  { tri: 'STU', rightAt: 'T', hyp: 'SU', leg1: 'ST', leg2: 'TU', givenHyp: 10, givenLeg: 6, unknownLeg: 'TU', sq1: 100, sq2: 36, sqDiff: 64, ans: 8, decimal: false, find: 'leg' },
  { tri: 'HIJ', rightAt: 'I', hyp: 'HJ', leg1: 'HI', leg2: 'IJ', givenHyp: 13, givenLeg: 12, unknownLeg: 'HI', sq1: 169, sq2: 144, sqDiff: 25, ans: 5, decimal: false, find: 'leg' },
  { tri: 'ORS', rightAt: 'R', hyp: 'OS', leg1: 'OR', leg2: 'RS', v1: 4, v2: 7, ans: round1(Math.sqrt(65)), sq1: 16, sq2: 49, sqSum: 65, decimal: true, find: 'hyp' },
  { tri: 'VWX', rightAt: 'W', hyp: 'VX', leg1: 'VW', leg2: 'WX', v1: 5, v2: 8, ans: round1(Math.sqrt(89)), sq1: 25, sq2: 64, sqSum: 89, decimal: true, find: 'hyp' },
];

function completerSVG(cfg: PythagoreCompleterConfig, variant: 0 | 1): string {
  const col = '#60A5FA', mu = '#A0A8B8', hi = '#F0EDE8';
  const tri = cfg.tri;
  if (variant === 0) {
    const [ax, ay, cx, cy, bx, by] = [30, 20, 30, 120, 155, 120];
    return `<svg width="190" height="145" viewBox="0 0 190 145" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="${ax},${ay} ${cx},${cy} ${bx},${by}" fill="rgba(96,165,250,0.07)" stroke="${col}" stroke-width="1.5"/>
      <rect x="${cx}" y="${cy - 14}" width="14" height="14" fill="none" stroke="${col}" stroke-width="1.2"/>
      <text x="${ax - 16}" y="${ay + 4}" fill="${hi}" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${tri[0]}</text>
      <text x="${cx - 16}" y="${cy + 5}" fill="${mu}" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${tri[1]}</text>
      <text x="${bx + 5}" y="${by + 5}" fill="${mu}" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${tri[2]}</text>
    </svg>`;
  }
  const [ax, ay, cx, cy, bx, by] = [155, 20, 155, 120, 25, 120];
  return `<svg width="190" height="145" viewBox="0 0 190 145" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${ax},${ay} ${cx},${cy} ${bx},${by}" fill="rgba(96,165,250,0.07)" stroke="${col}" stroke-width="1.5"/>
    <rect x="${cx - 14}" y="${cy - 14}" width="14" height="14" fill="none" stroke="${col}" stroke-width="1.2"/>
    <text x="${ax + 5}" y="${ay + 4}" fill="${hi}" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${tri[0]}</text>
    <text x="${cx + 5}" y="${cy + 5}" fill="${mu}" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${tri[1]}</text>
    <text x="${bx - 16}" y="${by + 5}" fill="${mu}" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${tri[2]}</text>
  </svg>`;
}

function makeCompleter(): PythagoreCompleterExercise {
  const cfg = pick(COMPLETER_CONFIGS);
  const variant: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
  return {
    type: 'default',
    pythType: 'completer',
    cfg,
    fig: completerSVG(cfg, variant),
    variant,
    ans: cfg.ans,
  };
}

export function generatePythagoreSeries(): PythagoreExercise[] {
  return [
    makeHyp(true),
    makeHypDecimal(true),
    makeLeg(true),
    makeLegDecimal(false),
    makeHypDecimal(false),
    makeLeg(false),
    makeCompleter(),
  ];
}
