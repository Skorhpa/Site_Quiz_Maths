import type { NumberExercise } from '@/types';

const COL = `style="font-family:'DM Mono',monospace;line-height:2.3;margin-top:6px;"`;

function col(lines: string[]): string {
  return `On souligne l'opération par laquelle on commence :<br><div ${COL}>${lines.map((l) => `<div>${l}</div>`).join('')}</div>`;
}

const ENTIERS_COMPLEX_BANK: NumberExercise[] = [
  {
    type: 'default',
    expr: '15 + 5 × (−8)',
    ans: -25,
    steps: col([
      '15 + <u>5 × (−8)</u>',
      '= 15 + (−40)',
      '= <strong style="color:var(--correct)">−25</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(−8) ÷ 4 − 5',
    ans: -7,
    steps: col([
      '<u>(−8) ÷ 4</u> − 5',
      '= −2 − 5',
      '= <strong style="color:var(--correct)">−7</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '19 − 12 ÷ (−4)',
    ans: 22,
    steps: col([
      '19 − <u>12 ÷ (−4)</u>',
      '= 19 − (−3)',
      '= 19 + 3',
      '= <strong style="color:var(--correct)">22</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '−10 + 10 × (−4)',
    ans: -50,
    steps: col([
      '−10 + <u>10 × (−4)</u>',
      '= −10 + (−40)',
      '= <strong style="color:var(--correct)">−50</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(−9 × 4) ÷ (6 × (−2))',
    ans: 3,
    steps: col([
      '<u>(−9 × 4)</u> ÷ <u>(6 × (−2))</u>',
      '= (−36) ÷ (−12)',
      '= <strong style="color:var(--correct)">3</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(15 + 5) × (−8)',
    ans: -160,
    steps: col([
      '<u>(15 + 5)</u> × (−8)',
      '= 20 × (−8)',
      '= <strong style="color:var(--correct)">−160</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(−8) ÷ (4 − 5)',
    ans: 8,
    steps: col([
      '(−8) ÷ <u>(4 − 5)</u>',
      '= (−8) ÷ (−1)',
      '= <strong style="color:var(--correct)">8</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '8 × (−2) − 9 ÷ (−3)',
    ans: -13,
    steps: col([
      '<u>8 × (−2)</u> − <u>9 ÷ (−3)</u>',
      '= −16 − (−3)',
      '= −16 + 3',
      '= <strong style="color:var(--correct)">−13</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(−10 + 10) × (−4)',
    ans: 0,
    steps: col([
      '<u>(−10 + 10)</u> × (−4)',
      '= 0 × (−4)',
      '= <strong style="color:var(--correct)">0</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(−6)² − 5 × (−4)',
    ans: 56,
    steps: col([
      '<u>(−6)²</u> − <u>5 × (−4)</u>',
      '= 36 − (−20)',
      '= 36 + 20',
      '= <strong style="color:var(--correct)">56</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(−3)² + 4 × (−5)',
    ans: -11,
    steps: col([
      '<u>(−3)²</u> + <u>4 × (−5)</u>',
      '= 9 + (−20)',
      '= 9 − 20',
      '= <strong style="color:var(--correct)">−11</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(12 − 20) ÷ (−4)',
    ans: 2,
    steps: col([
      '<u>(12 − 20)</u> ÷ (−4)',
      '= (−8) ÷ (−4)',
      '= <strong style="color:var(--correct)">2</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '5 × (−3) + 24 ÷ (−6)',
    ans: -19,
    steps: col([
      '<u>5 × (−3)</u> + <u>24 ÷ (−6)</u>',
      '= −15 + (−4)',
      '= <strong style="color:var(--correct)">−19</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '(−2 + 8) × (−3) − 5',
    ans: -23,
    steps: col([
      '<u>(−2 + 8)</u> × (−3) − 5',
      '= <u>6 × (−3)</u> − 5',
      '= −18 − 5',
      '= <strong style="color:var(--correct)">−23</strong>',
    ]),
  },
  {
    type: 'default',
    expr: '−2³ + (−4) × 3',
    ans: -20,
    steps: col([
      '<u>−2³</u> + <u>(−4) × 3</u>',
      '= −8 + (−12)',
      '= <strong style="color:var(--correct)">−20</strong>',
    ]),
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function generateEntierComplexSeries(): NumberExercise[] {
  return shuffle(ENTIERS_COMPLEX_BANK).slice(0, 10);
}
