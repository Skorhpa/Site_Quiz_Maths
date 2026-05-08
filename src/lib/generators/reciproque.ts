import type { ReciproqueDemoExercise, ReciproqueExercise, ReciproqueTableExercise } from '@/types';

const RP_TRIPLES: [number, number, number][] = [
  [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29],
  [9, 40, 41], [12, 35, 37], [6, 8, 10], [10, 24, 26], [9, 12, 15], [15, 20, 25],
];
const RP_NON_TRIPLES: [number, number, number][] = [
  [35, 77, 85], [5, 8, 10], [7, 9, 12], [10, 12, 16], [8, 11, 14], [6, 9, 11], [13, 14, 20], [4, 5, 6],
];

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

function letterSet(): [string, string, string] {
  const sets: [string, string, string][] = [
    ['A', 'B', 'C'], ['E', 'F', 'G'], ['H', 'I', 'J'], ['K', 'L', 'M'],
    ['P', 'Q', 'R'], ['S', 'T', 'U'], ['X', 'Y', 'Z'],
  ];
  return pick(sets);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function makeTable(): ReciproqueTableExercise {
  const rectPool = shuffle(RP_TRIPLES);
  const nonPool = shuffle(RP_NON_TRIPLES);
  const selected = shuffle([
    { sides: rectPool[0]!, isRect: true },
    { sides: rectPool[1]!, isRect: true },
    { sides: rectPool[2]!, isRect: true },
    { sides: nonPool[0]!, isRect: false },
    { sides: nonPool[1]!, isRect: false },
  ]);
  const corrRows = selected
    .map(({ sides, isRect }, j) => {
      const sorted = [...sides].sort((x, y) => y - x);
      const [c, a, b] = sorted as [number, number, number];
      const sq1 = c * c, sq2 = a * a + b * b;
      return `<div style="font-family:'DM Mono',monospace;font-size:12px;line-height:2;margin:4px 0;">
        <span style="font-weight:600;">Ligne ${j + 1}</span> (${sides.join(', ')}) : plus grand côté = ${c} → ${c}² = ${sq1} &nbsp;|&nbsp; ${a}² + ${b}² = ${a * a} + ${b * b} = ${sq2} → <strong style="color:${
          isRect ? 'var(--correct)' : '#f87171'
        };">${isRect ? 'Oui' : 'Non'}</strong>
      </div>`;
    })
    .join('');
  return {
    type: 'default',
    rpType: 'table',
    selected,
    steps: `<div style="margin-bottom:6px;color:var(--text);">Pour chaque ligne, on identifie le plus grand côté (l'hypoténuse supposée), on calcule son carré et la somme des carrés des deux autres, puis on compare :</div>${corrRows}`,
  };
}

function makeRect(): ReciproqueDemoExercise {
  let [a, b, c] = pick(RP_TRIPLES);
  if (Math.random() < 0.5) [a, b] = [b, a];
  const letters = letterSet();
  const [P, Q, R] = letters;
  const sq1 = c * c, sq2a = a * a, sq2b = b * b;
  const svg = `<svg width="195" height="125" viewBox="0 0 195 125" fill="none" style="display:block;margin:8px 0;">
    <polygon points="10,110 10,15 185,110" fill="rgba(167,139,250,0.07)" stroke="var(--crp)" stroke-width="1.5"/>
    <rect x="10" y="96" width="14" height="14" fill="none" stroke="var(--crp)" stroke-width="1.2"/>
    <text x="3" y="12" fill="#F0EDE8" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${Q}</text>
    <text x="0" y="122" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${P}</text>
    <text x="181" y="122" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${R}</text>
    <text x="2" y="65" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11">${a} m</text>
    <text x="90" y="122" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11">${b} m</text>
    <text x="102" y="58" fill="var(--crp)" font-family="DM Mono,monospace" font-size="11">${c} m</text>
  </svg>`;
  return {
    type: 'default',
    rpType: 'redemo',
    isRect: true,
    letters,
    P,
    Q,
    R,
    a,
    b,
    c,
    rightVertex: P,
    sq1,
    sq2a,
    sq2b,
    sum: sq2a + sq2b,
    svg,
    label: `Le triangle ${P}${Q}${R} est tel que : ${P}${Q} = ${a} m ; ${P}${R} = ${b} m ; ${Q}${R} = ${c} m.`,
  };
}

function makeNonRect(): ReciproqueDemoExercise {
  let [a, b, c] = pick(RP_NON_TRIPLES);
  if (Math.random() < 0.5) [a, b] = [b, a];
  const letters = letterSet();
  const [P, Q, R] = letters;
  const sq1 = c * c, sq2a = a * a, sq2b = b * b;
  const svg = `<svg width="195" height="125" viewBox="0 0 195 125" fill="none" style="display:block;margin:8px 0;">
    <polygon points="10,110 30,10 185,110" fill="rgba(167,139,250,0.07)" stroke="var(--crp)" stroke-width="1.5"/>
    <text x="25" y="8" fill="#F0EDE8" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${Q}</text>
    <text x="0" y="122" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${P}</text>
    <text x="181" y="122" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="13" font-weight="bold">${R}</text>
    <text x="4" y="63" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11">${a} m</text>
    <text x="90" y="122" fill="#A0A8B8" font-family="DM Mono,monospace" font-size="11">${b} m</text>
    <text x="110" y="52" fill="var(--crp)" font-family="DM Mono,monospace" font-size="11">${c} m</text>
  </svg>`;
  return {
    type: 'default',
    rpType: 'redemo',
    isRect: false,
    letters,
    P,
    Q,
    R,
    a,
    b,
    c,
    rightVertex: null,
    sq1,
    sq2a,
    sq2b,
    sum: sq2a + sq2b,
    svg,
    label: `Le triangle ${P}${Q}${R} est tel que : ${P}${Q} = ${a} m ; ${P}${R} = ${b} m ; ${Q}${R} = ${c} m.`,
  };
}

export function generateReciproqueSeries(): ReciproqueExercise[] {
  return [makeTable(), makeRect(), makeNonRect()];
}
