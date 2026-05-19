import type { ThalesReciproqueExercise } from '@/types';

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

function gcd(a: number, b: number): number {
  while (b !== 0) { const t = b; b = a % b; a = t; }
  return a;
}
function simplify(n: number, d: number): [number, number] {
  const g = gcd(n, d);
  return [n / g, d / g];
}

interface LetterSet { apex: string; ptL: string; ptR: string; ptM: string; ptN: string }

const LETTER_SETS: LetterSet[] = [
  { apex: 'S', ptL: 'A', ptR: 'B', ptM: 'M', ptN: 'N' },
  { apex: 'E', ptL: 'F', ptR: 'G', ptM: 'P', ptN: 'Q' },
  { apex: 'O', ptL: 'U', ptR: 'V', ptM: 'H', ptN: 'K' },
  { apex: 'T', ptL: 'I', ptR: 'J', ptM: 'L', ptN: 'R' },
  { apex: 'C', ptL: 'D', ptR: 'E', ptM: 'F', ptN: 'G' },
  { apex: 'Z', ptL: 'X', ptR: 'Y', ptM: 'W', ptN: 'V' },
];

// Common ratios as [p, q] in lowest terms (p < q)
const RATIOS: [number, number][] = [
  [1, 2], [2, 3], [3, 4], [1, 3], [2, 5], [3, 5], [1, 4], [3, 7],
];

function pickRatio(): [number, number] {
  return RATIOS[ri(0, RATIOS.length - 1)]!;
}

function pickDifferentRatio(exclude: [number, number]): [number, number] {
  let r: [number, number];
  do { r = pickRatio(); } while (r[0] === exclude[0] && r[1] === exclude[1]);
  return r;
}

function makeFig(
  apex: string, ptL: string, ptR: string, ptM: string, ptN: string,
  r1: number, r2: number,
): string {
  const sx = 75, sy = 14, ax = 18, ay = 140, bx = 132;
  const mx = +(sx + r1 * (ax - sx)).toFixed(1);
  const my = +(sy + r1 * (ay - sy)).toFixed(1);
  const nx = +(sx + r2 * (bx - sx)).toFixed(1);
  const ny = +(sy + r2 * (ay - sy)).toFixed(1);
  const isParallel = Math.abs(r1 - r2) < 0.001;
  const stroke = isParallel ? '#60A5FA' : '#FB923C';
  const dash = isParallel ? '' : ' stroke-dasharray="5,3"';
  return `<svg viewBox="0 0 150 162" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:140px">` +
    `<polygon points="${sx},${sy} ${ax},${ay} ${bx},${ay}" fill="rgba(251,146,60,0.07)" stroke="#FB923C" stroke-width="1.5"/>` +
    `<line x1="${mx}" y1="${my}" x2="${nx}" y2="${ny}" stroke="${stroke}" stroke-width="1.6"${dash}/>` +
    `<text x="${sx}" y="${sy - 4}" text-anchor="middle" font-size="13" fill="#F0EDE8" font-weight="bold" font-family="DM Mono,monospace">${apex}</text>` +
    `<text x="${ax - 10}" y="${ay + 15}" font-size="13" fill="#A0A8B8" font-weight="bold" font-family="DM Mono,monospace">${ptL}</text>` +
    `<text x="${bx + 2}" y="${ay + 15}" font-size="13" fill="#A0A8B8" font-weight="bold" font-family="DM Mono,monospace">${ptR}</text>` +
    `<text x="${mx - 13}" y="${my - 2}" font-size="12" fill="${stroke}" font-weight="bold" font-family="DM Mono,monospace">${ptM}</text>` +
    `<text x="${nx + 5}" y="${ny - 2}" font-size="12" fill="${stroke}" font-weight="bold" font-family="DM Mono,monospace">${ptN}</text>` +
    `</svg>`;
}

function makeEx(
  letters: LetterSet,
  isParallel: boolean,
  variant: 'direct' | 'complement',
): ThalesReciproqueExercise {
  const { apex, ptL, ptR, ptM, ptN } = letters;

  const ratio1 = pickRatio();
  const ratio2: [number, number] = isParallel ? [ratio1[0], ratio1[1]] : pickDifferentRatio(ratio1);

  // Scale up to get integer cm values; ensure distinct values for the two legs
  const k1 = ri(2, 5);
  let k2 = ri(2, 5);
  if (isParallel) {
    // same ratio, different scale so numbers look different
    while (k2 === k1) k2 = ri(2, 5);
  }

  const sM = ratio1[0] * k1;
  const sA = ratio1[1] * k1;
  const sN = ratio2[0] * k2;
  const sB = ratio2[1] * k2;

  const [r1n, r1d] = simplify(sM, sA);
  const [r2n, r2d] = simplify(sN, sB);

  let dataLabel: string;
  if (variant === 'direct') {
    dataLabel = `${apex}${ptM} = ${sM} cm · ${apex}${ptL} = ${sA} cm · ${apex}${ptN} = ${sN} cm · ${apex}${ptR} = ${sB} cm`;
  } else {
    const ma = sA - sM;
    const nb = sB - sN;
    dataLabel = `${apex}${ptM} = ${sM} cm · ${ptM}${ptL} = ${ma} cm · ${apex}${ptN} = ${sN} cm · ${ptN}${ptR} = ${nb} cm`;
  }

  const fig = makeFig(apex, ptL, ptR, ptM, ptN, r1n / r1d, r2n / r2d);

  return {
    type: 'default',
    rtType: 'reciproque',
    apex, ptL, ptR, ptM, ptN,
    variant,
    sM, sA, sN, sB,
    r1n, r1d, r2n, r2d,
    isParallel,
    dataLabel,
    fig,
  };
}

export function generateThalesReciproqueSeries(): ThalesReciproqueExercise[] {
  // Shuffle letter sets, pick 4
  const sets = [...LETTER_SETS].sort(() => Math.random() - 0.5).slice(0, 4);
  const exs: ThalesReciproqueExercise[] = [
    makeEx(sets[0]!, true, 'direct'),
    makeEx(sets[1]!, true, 'complement'),
    makeEx(sets[2]!, false, 'direct'),
    makeEx(sets[3]!, false, 'complement'),
  ];
  // Shuffle order so parallel/non-parallel exercises are mixed
  return exs.sort(() => Math.random() - 0.5);
}
