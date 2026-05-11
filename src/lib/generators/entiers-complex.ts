import type { NumberExercise } from '@/types';

const ENTIERS_COMPLEX_BANK: NumberExercise[] = [
  {
    type: 'default',
    expr: 'A = 15 + 5 × (−8)',
    ans: -25,
    steps: `<strong>Priorité à la multiplication :</strong> 5 × (−8) = −40
            <br>15 + (−40) = 15 − 40 = <strong style="color:var(--correct)">−25</strong>`,
  },
  {
    type: 'default',
    expr: 'B = (−8) ÷ 4 − 5',
    ans: -7,
    steps: `<strong>Priorité à la division :</strong> (−8) ÷ 4 = −2
            <br>−2 − 5 = <strong style="color:var(--correct)">−7</strong>`,
  },
  {
    type: 'default',
    expr: 'C = 19 − 12 ÷ (−4)',
    ans: 22,
    steps: `<strong>Priorité à la division :</strong> 12 ÷ (−4) = −3
            <br>19 − (−3) = 19 + 3 = <strong style="color:var(--correct)">22</strong>`,
  },
  {
    type: 'default',
    expr: 'D = −10 + 10 × (−4)',
    ans: -50,
    steps: `<strong>Priorité à la multiplication :</strong> 10 × (−4) = −40
            <br>−10 + (−40) = <strong style="color:var(--correct)">−50</strong>`,
  },
  {
    type: 'default',
    expr: 'E = (−9 × 4) ÷ (6 × (−2))',
    ans: 3,
    steps: `<strong>Calcul des parenthèses :</strong>
            <br>−9 × 4 = −36 &nbsp;&nbsp; 6 × (−2) = −12
            <br>(−36) ÷ (−12) = <strong style="color:var(--correct)">3</strong>
            <br><span style="color:var(--muted);font-size:0.9em">Deux négatifs → résultat positif.</span>`,
  },
  {
    type: 'default',
    expr: 'G = (15 + 5) × (−8)',
    ans: -160,
    steps: `<strong>Calcul de la parenthèse :</strong> 15 + 5 = 20
            <br>20 × (−8) = <strong style="color:var(--correct)">−160</strong>`,
  },
  {
    type: 'default',
    expr: 'H = (−8) ÷ (4 − 5)',
    ans: 8,
    steps: `<strong>Calcul de la parenthèse :</strong> 4 − 5 = −1
            <br>(−8) ÷ (−1) = <strong style="color:var(--correct)">8</strong>
            <br><span style="color:var(--muted);font-size:0.9em">Deux négatifs → résultat positif.</span>`,
  },
  {
    type: 'default',
    expr: 'I = 8 × (−2) − 9 ÷ (−3)',
    ans: -13,
    steps: `<strong>Priorité aux multiplications et divisions :</strong>
            <br>8 × (−2) = −16 &nbsp;&nbsp; 9 ÷ (−3) = −3
            <br>−16 − (−3) = −16 + 3 = <strong style="color:var(--correct)">−13</strong>`,
  },
  {
    type: 'default',
    expr: 'J = (−10 + 10) × (−4)',
    ans: 0,
    steps: `<strong>Calcul de la parenthèse :</strong> −10 + 10 = 0
            <br>0 × (−4) = <strong style="color:var(--correct)">0</strong>
            <br><span style="color:var(--muted);font-size:0.9em">Tout nombre multiplié par 0 est égal à 0.</span>`,
  },
  {
    type: 'default',
    expr: 'K = (−6)² − 5 × (−4)',
    ans: 56,
    steps: `<strong>Priorité à la puissance :</strong> (−6)² = 36
            <br><strong>Priorité à la multiplication :</strong> 5 × (−4) = −20
            <br>36 − (−20) = 36 + 20 = <strong style="color:var(--correct)">56</strong>`,
  },
  {
    type: 'default',
    expr: 'L = (−3)² + 4 × (−5)',
    ans: -11,
    steps: `<strong>Priorité à la puissance :</strong> (−3)² = 9
            <br><strong>Priorité à la multiplication :</strong> 4 × (−5) = −20
            <br>9 + (−20) = 9 − 20 = <strong style="color:var(--correct)">−11</strong>`,
  },
  {
    type: 'default',
    expr: 'M = (12 − 20) ÷ (−4)',
    ans: 2,
    steps: `<strong>Calcul de la parenthèse :</strong> 12 − 20 = −8
            <br>(−8) ÷ (−4) = <strong style="color:var(--correct)">2</strong>`,
  },
  {
    type: 'default',
    expr: 'N = 5 × (−3) + 24 ÷ (−6)',
    ans: -19,
    steps: `<strong>Priorité aux multiplications et divisions :</strong>
            <br>5 × (−3) = −15 &nbsp;&nbsp; 24 ÷ (−6) = −4
            <br>−15 + (−4) = <strong style="color:var(--correct)">−19</strong>`,
  },
  {
    type: 'default',
    expr: 'P = (−2 + 8) × (−3) − 5',
    ans: -23,
    steps: `<strong>Calcul de la parenthèse :</strong> −2 + 8 = 6
            <br><strong>Multiplication :</strong> 6 × (−3) = −18
            <br>−18 − 5 = <strong style="color:var(--correct)">−23</strong>`,
  },
  {
    type: 'default',
    expr: 'Q = −2³ + (−4) × 3',
    ans: -20,
    steps: `<strong>Priorité à la puissance :</strong> −2³ = −(2³) = −8
            <br><strong>Priorité à la multiplication :</strong> (−4) × 3 = −12
            <br>−8 + (−12) = <strong style="color:var(--correct)">−20</strong>
            <br><span style="color:var(--muted);font-size:0.9em">Rappel : −2³ = −8, mais (−2)³ = −8 aussi ici.</span>`,
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
