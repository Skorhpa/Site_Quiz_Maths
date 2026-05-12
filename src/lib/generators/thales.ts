import type { ThalesCalcExercise, ThalesCompleterConfig, ThalesCompleterExercise, ThalesExercise } from '@/types';

const isWhole = (x: number) => Math.abs(x - Math.round(x)) < 0.001;
const fmt = (x: number) => (isWhole(x) ? Math.round(x) : Math.round(x * 10) / 10);

export function thalesIsWhole(x: number): boolean {
  return isWhole(x);
}
export function thalesFormatAns(x: number, unit: string): string {
  if (isWhole(x)) return `${Math.round(x)} ${unit}`;
  const r1 = Math.round(x * 10) / 10;
  if (Math.abs(r1 - x) < 0.005) return `${r1} ${unit} (arrondi au dixième)`;
  return `${Math.round(x * 100) / 100} ${unit} (arrondi au centième)`;
}

interface Shape { Ax: number; Ay: number; Bx: number; By: number; Cx: number; Cy: number }
interface Letters { apex: string; bl: string; br: string; ml: string; mr: string }

const SHAPES: Shape[] = [
  { Ax: 110, Ay: 12, Bx: 16, By: 172, Cx: 204, Cy: 172 },
  { Ax: 55, Ay: 14, Bx: 10, By: 172, Cx: 200, Cy: 172 },
  { Ax: 160, Ay: 14, Bx: 20, By: 172, Cx: 210, Cy: 172 },
  { Ax: 110, Ay: 30, Bx: 8, By: 175, Cx: 212, Cy: 175 },
  { Ax: 110, Ay: 8, Bx: 55, By: 175, Cx: 165, Cy: 175 },
  { Ax: 70, Ay: 18, Bx: 12, By: 172, Cx: 195, Cy: 172 },
  { Ax: 150, Ay: 18, Bx: 25, By: 172, Cx: 208, Cy: 172 },
  { Ax: 110, Ay: 40, Bx: 5, By: 172, Cx: 215, Cy: 172 },
  // Varied orientations
  { Ax: 8, Ay: 90, Bx: 182, By: 18, Cx: 195, Cy: 185 },   // apex far left
  { Ax: 232, Ay: 90, Bx: 45, By: 18, Cx: 58, Cy: 185 },   // apex far right
  { Ax: 120, Ay: 182, Bx: 15, By: 12, Cx: 225, Cy: 12 },  // inverted (apex bottom)
  { Ax: 28, Ay: 78, Bx: 158, By: 12, Cx: 218, Cy: 188 },  // strongly oblique ↗
  { Ax: 212, Ay: 78, Bx: 22, By: 12, Cx: 82, Cy: 188 },   // strongly oblique ↖
  { Ax: 120, Ay: 8, Bx: 8, By: 195, Cx: 232, Cy: 195 },   // very tall, very wide
];

const LETTER_SETS: Letters[] = [
  { apex: 'A', bl: 'B', br: 'C', ml: 'M', mr: 'N' },
  { apex: 'S', bl: 'T', br: 'U', ml: 'E', mr: 'F' },
  { apex: 'P', bl: 'Q', br: 'R', ml: 'J', mr: 'K' },
  { apex: 'A', bl: 'D', br: 'E', ml: 'B', mr: 'C' },
  { apex: 'O', bl: 'A', br: 'B', ml: 'P', mr: 'Q' },
  { apex: 'G', bl: 'H', br: 'I', ml: 'D', mr: 'E' },
  { apex: 'R', bl: 'S', br: 'T', ml: 'M', mr: 'N' },
  { apex: 'X', bl: 'Y', br: 'Z', ml: 'U', mr: 'V' },
];

function thalesSVG(ratio: number, shape: Shape, letters: Letters): string {
  const W = 240, H = 205;
  const { Ax, Ay, Bx, By, Cx, Cy } = shape;
  const Mx = Ax + ratio * (Bx - Ax);
  const My = Ay + ratio * (By - Ay);
  const Nx = Ax + ratio * (Cx - Ax);
  const Ny = Ay + ratio * (Cy - Ay);
  const col = '#FB923C', mu = '#A0A8B8', hilight = '#F0EDE8';
  const { apex, bl, br, ml, mr } = letters;
  const cx = (Ax + Bx + Cx) / 3, cy = (Ay + By + Cy) / 3;
  function inset(px: number, py: number, tx: number, ty: number, dist: number) {
    const dx = tx - px, dy = ty - py;
    const len = Math.sqrt(dx * dx + dy * dy);
    return { x: px + (dx / len) * dist, y: py + (dy / len) * dist };
  }
  const apexP = inset(Ax, Ay, cx, cy, 18);
  const blP = inset(Bx, By, cx, cy, 18);
  const brP = inset(Cx, Cy, cx, cy, 18);
  const mcx = (Ax + Mx + Nx) / 3, mcy = (Ay + My + Ny) / 3;
  const mlP = inset(Mx, My, mcx, mcy, 16);
  const mrP = inset(Nx, Ny, mcx, mcy, 16);
  const fs = 13;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;max-width:100%">
    <polygon points="${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}" fill="rgba(251,146,60,0.05)" stroke="${col}" stroke-width="1.5"/>
    <polygon points="${Ax},${Ay} ${Mx},${My} ${Nx},${Ny}" fill="rgba(251,146,60,0.10)" stroke="${col}" stroke-width="1.2"/>
    <line x1="${Mx}" y1="${My}" x2="${Nx}" y2="${Ny}" stroke="${col}" stroke-width="1.4"/>
    <text x="${apexP.x.toFixed(1)}" y="${apexP.y.toFixed(1)}" fill="${hilight}" font-family="DM Mono,monospace" font-size="${fs}" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${apex}</text>
    <text x="${blP.x.toFixed(1)}" y="${blP.y.toFixed(1)}" fill="${mu}" font-family="DM Mono,monospace" font-size="${fs}" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${bl}</text>
    <text x="${brP.x.toFixed(1)}" y="${brP.y.toFixed(1)}" fill="${mu}" font-family="DM Mono,monospace" font-size="${fs}" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${br}</text>
    <text x="${mlP.x.toFixed(1)}" y="${mlP.y.toFixed(1)}" fill="${col}" font-family="DM Mono,monospace" font-size="${fs}" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${ml}</text>
    <text x="${mrP.x.toFixed(1)}" y="${mrP.y.toFixed(1)}" fill="${col}" font-family="DM Mono,monospace" font-size="${fs}" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${mr}</text>
  </svg>`;
}

interface CalcConfig {
  ratio: number;
  PM: number | null;
  MB: number | null;
  PB: number | null;
  PN: number | null;
  PC: number | null;
  MN: number | null;
  BC: number | null;
  unknown: 'mn' | 'bc' | 'pb' | 'pm' | 'pc';
  useMB?: boolean;
}

const CALC_CONFIGS: CalcConfig[] = [
  { ratio: 1 / 3, PM: 3, MB: null, PB: 9, PN: null, PC: null, MN: null, BC: 12, unknown: 'mn' },
  { ratio: 2 / 5, PM: 4, MB: null, PB: 10, PN: null, PC: null, MN: null, BC: 15, unknown: 'mn' },
  { ratio: 1 / 3, PM: 3, MB: 6, PB: null, PN: null, PC: null, MN: null, BC: 9, unknown: 'mn', useMB: true },
  { ratio: 2 / 5, PM: 4, MB: 6, PB: null, PN: null, PC: null, MN: null, BC: 15, unknown: 'mn', useMB: true },
  { ratio: 1 / 2, PM: 5, MB: null, PB: 10, PN: null, PC: null, MN: 6, BC: null, unknown: 'bc' },
  { ratio: 1 / 3, PM: 3, MB: null, PB: 9, PN: null, PC: null, MN: 4, BC: null, unknown: 'bc' },
  { ratio: 1 / 3, PM: 3, MB: 6, PB: null, PN: null, PC: null, MN: 4, BC: null, unknown: 'bc', useMB: true },
  { ratio: 1 / 3, PM: 3, MB: null, PB: null, PN: null, PC: null, MN: 4, BC: 12, unknown: 'pb' },
  { ratio: 2 / 6, PM: 2, MB: null, PB: null, PN: null, PC: null, MN: 3, BC: 9, unknown: 'pb' },
  { ratio: 1 / 2, PM: null, MB: null, PB: 10, PN: null, PC: null, MN: 4, BC: 8, unknown: 'pm' },
  { ratio: 1 / 3, PM: null, MB: null, PB: 9, PN: null, PC: null, MN: 3, BC: 9, unknown: 'pm' },
  { ratio: 1 / 2, PM: null, MB: null, PB: null, PN: 3, PC: null, MN: 5, BC: 10, unknown: 'pc' },
  { ratio: 2 / 5, PM: null, MB: null, PB: null, PN: 4, PC: null, MN: 4, BC: 10, unknown: 'pc' },
];

function genCalc(cfg: CalcConfig, shape: Shape, letters: Letters): ThalesCalcExercise {
  const { apex, bl, br, ml, mr } = letters;
  const nPM = apex + ml, nPB = apex + bl, nPN = apex + mr, nPC = apex + br, nMN = ml + mr, nBC = bl + br, nMB = ml + bl;

  let { PM, MB, PB, PN, PC, MN, BC } = cfg;
  const uk = cfg.unknown;
  let ans = 0;

  if (cfg.useMB && PM != null && MB != null) PB = PM + MB;
  if (uk === 'mn') { ans = PM! / PB! * BC!; MN = ans; }
  else if (uk === 'bc') { ans = MN! * PB! / PM!; BC = ans; }
  else if (uk === 'pb') { ans = PM! * BC! / MN!; PB = ans; }
  else if (uk === 'pm') { ans = PB! * MN! / BC!; PM = ans; }
  else if (uk === 'pc') { ans = PN! * BC! / MN!; PC = ans; }

  const cl = (x: number | null) => (x != null ? Math.round(x * 1000) / 1000 : null);
  PM = cl(PM); MB = cl(MB); PB = cl(PB); PN = cl(PN); PC = cl(PC); MN = cl(MN); BC = cl(BC); ans = Math.round(ans * 1000) / 1000;

  const fig = thalesSVG(cfg.ratio, shape, letters);

  const textParts: string[] = [`(${nMN}) ∥ (${nBC})`];
  if (cfg.useMB) {
    if (PM != null) textParts.push(`${nPM} = ${fmt(PM)} cm`);
    if (MB != null) textParts.push(`${nMB} = ${fmt(MB)} cm`);
  } else if (uk !== 'pm' && PM != null) textParts.push(`${nPM} = ${fmt(PM)} cm`);
  if (!cfg.useMB && uk !== 'pb' && PB != null) textParts.push(`${nPB} = ${fmt(PB)} cm`);
  if (PN != null) textParts.push(`${nPN} = ${fmt(PN)} cm`);
  if (uk !== 'pc' && PC != null) textParts.push(`${nPC} = ${fmt(PC)} cm`);
  if (uk !== 'mn' && MN != null) textParts.push(`${nMN} = ${fmt(MN)} cm`);
  if (uk !== 'bc' && BC != null) textParts.push(`${nBC} = ${fmt(BC)} cm`);

  const askLabel = ({ mn: nMN, bc: nBC, pb: nPB, pm: nPM, pc: nPC } as Record<string, string>)[uk]!;

  let steps: { eq: string }[] = [];
  if (uk === 'mn') {
    steps = [
      { eq: `${nPM}/${nPB} = ${nMN}/${nBC}` },
      { eq: `${fmt(PM!)}/${fmt(PB!)} = ${nMN}/${fmt(BC!)}` },
      { eq: `${nMN} = ${fmt(PM!)} × ${fmt(BC!)} ÷ ${fmt(PB!)}` },
      { eq: `${nMN} = ${thalesFormatAns(ans, 'cm')}` },
    ];
  } else if (uk === 'bc') {
    steps = [
      { eq: `${nPM}/${nPB} = ${nMN}/${nBC}` },
      { eq: `${fmt(PM!)}/${fmt(PB!)} = ${fmt(MN!)}/${nBC}` },
      { eq: `${nBC} = ${fmt(MN!)} × ${fmt(PB!)} ÷ ${fmt(PM!)}` },
      { eq: `${nBC} = ${thalesFormatAns(ans, 'cm')}` },
    ];
  } else if (uk === 'pb') {
    steps = [
      { eq: `${nPM}/${nPB} = ${nMN}/${nBC}` },
      { eq: `${fmt(PM!)}/${nPB} = ${fmt(MN!)}/${fmt(BC!)}` },
      { eq: `${nPB} = ${fmt(PM!)} × ${fmt(BC!)} ÷ ${fmt(MN!)}` },
      { eq: `${nPB} = ${thalesFormatAns(ans, 'cm')}` },
    ];
  } else if (uk === 'pm') {
    steps = [
      { eq: `${nPM}/${nPB} = ${nMN}/${nBC}` },
      { eq: `${nPM}/${fmt(PB!)} = ${fmt(MN!)}/${fmt(BC!)}` },
      { eq: `${nPM} = ${fmt(PB!)} × ${fmt(MN!)} ÷ ${fmt(BC!)}` },
      { eq: `${nPM} = ${thalesFormatAns(ans, 'cm')}` },
    ];
  } else if (uk === 'pc') {
    steps = [
      { eq: `${nPN}/${nPC} = ${nMN}/${nBC}` },
      { eq: `${fmt(PN!)}/${nPC} = ${fmt(MN!)}/${fmt(BC!)}` },
      { eq: `${nPC} = ${fmt(PN!)} × ${fmt(BC!)} ÷ ${fmt(MN!)}` },
      { eq: `${nPC} = ${thalesFormatAns(ans, 'cm')}` },
    ];
  }

  const isDecimal = !isWhole(ans);
  const decHint = isDecimal
    ? `<div style="font-size:11px;color:var(--muted);margin-top:4px;font-family:'DM Mono',monospace;">Arrondir au ${
        Math.abs(Math.round(ans * 10) / 10 - ans) < 0.005 ? 'dixième' : 'centième'
      }</div>`
    : '';

  return {
    type: 'default',
    thType: 'calc',
    fig,
    textParts,
    steps,
    ans,
    askLabel,
    unit: 'cm',
    isDecimal,
    decHint,
  };
}

const COMPLETER_CONFIGS: ThalesCompleterConfig[] = [
  {
    letters: { apex: 'T', bl: 'B', br: 'R', ml: 'A', mr: 'S' },
    ratio: 2.4 / 3.2,
    known: { TS: 3, TR: 4, TA: 2.4, BR: 6 },
    find: ['TB', 'AS'],
    answers: { TB: 3.2, AS: 4.5 },
    bigTri: 'TBR',
    ptOnLeft: { pt: 'A', seg: '[TB]' },
    ptOnRight: { pt: 'S', seg: '[TR]' },
    parallelSeg: 'AS',
    parallelTo: 'BR',
    ratioExpr: 'TA/TB = TS/TR = AS/BR',
    numericRatio: '2,4/TB = 3/4 = AS/6',
    calc1: { unknown: 'TB', ratioUsed: 'TA/TB = TS/TR', s1: '2,4/TB = 3/4', s2: 'TB = 2,4 × 4 ÷ 3', s3: 'TB = 9,6 ÷ 3', result: 'TB = 3,2 cm' },
    calc2: { unknown: 'AS', ratioUsed: 'AS/BR = TS/TR', s1: 'AS/6 = 3/4', s2: 'AS = 3 × 6 ÷ 4', s3: 'AS = 18 ÷ 4', result: 'AS = 4,5 cm' },
  },
  {
    letters: { apex: 'O', bl: 'P', br: 'Q', ml: 'E', mr: 'F' },
    ratio: 3 / 9,
    known: { OE: 3, OP: 9, OQ: 18, PQ: 12 },
    find: ['OF', 'EF'],
    answers: { OF: 6, EF: 4 },
    bigTri: 'OPQ',
    ptOnLeft: { pt: 'E', seg: '[OP]' },
    ptOnRight: { pt: 'F', seg: '[OQ]' },
    parallelSeg: 'EF',
    parallelTo: 'PQ',
    ratioExpr: 'OE/OP = OF/OQ = EF/PQ',
    numericRatio: '3/9 = OF/18 = EF/12',
    calc1: { unknown: 'OF', ratioUsed: 'OE/OP = OF/OQ', s1: '3/9 = OF/18', s2: 'OF = 3 × 18 ÷ 9', s3: 'OF = 54 ÷ 9', result: 'OF = 6 cm' },
    calc2: { unknown: 'EF', ratioUsed: 'EF/PQ = OE/OP', s1: 'EF/12 = 3/9', s2: 'EF = 3 × 12 ÷ 9', s3: 'EF = 36 ÷ 9', result: 'EF = 4 cm' },
  },
  {
    letters: { apex: 'S', bl: 'D', br: 'E', ml: 'J', mr: 'K' },
    ratio: 4 / 10,
    known: { SJ: 4, SD: 10, SE: 12.5, DE: 15 },
    find: ['SK', 'JK'],
    answers: { SK: 5, JK: 6 },
    bigTri: 'SDE',
    ptOnLeft: { pt: 'J', seg: '[SD]' },
    ptOnRight: { pt: 'K', seg: '[SE]' },
    parallelSeg: 'JK',
    parallelTo: 'DE',
    ratioExpr: 'SJ/SD = SK/SE = JK/DE',
    numericRatio: '4/10 = SK/12,5 = JK/15',
    calc1: { unknown: 'SK', ratioUsed: 'SJ/SD = SK/SE', s1: '4/10 = SK/12,5', s2: 'SK = 4 × 12,5 ÷ 10', s3: 'SK = 50 ÷ 10', result: 'SK = 5 cm' },
    calc2: { unknown: 'JK', ratioUsed: 'JK/DE = SJ/SD', s1: 'JK/15 = 4/10', s2: 'JK = 4 × 15 ÷ 10', s3: 'JK = 60 ÷ 10', result: 'JK = 6 cm' },
  },
  {
    letters: { apex: 'R', bl: 'G', br: 'H', ml: 'M', mr: 'N' },
    ratio: 5 / 15,
    known: { RM: 5, RG: 15, RH: 18, GH: 12 },
    find: ['RN', 'MN'],
    answers: { RN: 6, MN: 4 },
    bigTri: 'RGH',
    ptOnLeft: { pt: 'M', seg: '[RG]' },
    ptOnRight: { pt: 'N', seg: '[RH]' },
    parallelSeg: 'MN',
    parallelTo: 'GH',
    ratioExpr: 'RM/RG = RN/RH = MN/GH',
    numericRatio: '5/15 = RN/18 = MN/12',
    calc1: { unknown: 'RN', ratioUsed: 'RM/RG = RN/RH', s1: '5/15 = RN/18', s2: 'RN = 5 × 18 ÷ 15', s3: 'RN = 90 ÷ 15', result: 'RN = 6 cm' },
    calc2: { unknown: 'MN', ratioUsed: 'MN/GH = RM/RG', s1: 'MN/12 = 5/15', s2: 'MN = 5 × 12 ÷ 15', s3: 'MN = 60 ÷ 15', result: 'MN = 4 cm' },
  },
];

function genCompleter(cfg: ThalesCompleterConfig, shape: Shape): ThalesCompleterExercise {
  return {
    type: 'default',
    thType: 'completer',
    fig: thalesSVG(cfg.ratio, shape, cfg.letters),
    cfg,
  };
}

const shuf = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

export function generateThalesSeries(): ThalesExercise[] {
  const configs = shuf(CALC_CONFIGS);
  const shapes = shuf(SHAPES);
  const letterSets = shuf(LETTER_SETS);
  const calcQs = configs.slice(0, 4).map((c, i) => genCalc(c, shapes[i % shapes.length]!, letterSets[i % letterSets.length]!));
  const cPool = shuf(COMPLETER_CONFIGS);
  const completerQs = [
    genCompleter(cPool[0]!, shapes[4 % shapes.length]!),
    genCompleter(cPool[1]!, shapes[5 % shapes.length]!),
  ];
  return [...calcQs, ...completerQs];
}
