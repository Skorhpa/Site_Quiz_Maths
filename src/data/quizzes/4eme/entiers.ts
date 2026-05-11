import type { GeneratorSpec, NumberExercise, QuizDefinition } from '@/types';

const STATIC_EXERCISES: NumberExercise[] = [
  // ── Additions ─────────────────────────────────────────────────────────────
  {
    expr: '-3 + 7', ans: 4, type: 'add',
    steps: `7 > 3, donc on soustrait et on garde le signe de 7 (positif) : 7 − 3 = <strong style="color:var(--correct)">4</strong>`,
  },
  {
    expr: '-8 + 3', ans: -5, type: 'add',
    steps: `8 > 3, donc on soustrait et on garde le signe de −8 (négatif) : −(8 − 3) = <strong style="color:var(--correct)">−5</strong>`,
  },
  {
    expr: '-7 + 10', ans: 3, type: 'add',
    steps: `10 > 7, donc on soustrait et on garde le signe de 10 (positif) : 10 − 7 = <strong style="color:var(--correct)">3</strong>`,
  },
  {
    expr: '-15 + 8', ans: -7, type: 'add',
    steps: `15 > 8, donc on soustrait et on garde le signe de −15 (négatif) : −(15 − 8) = <strong style="color:var(--correct)">−7</strong>`,
  },
  {
    expr: '-12 + 5', ans: -7, type: 'add',
    steps: `12 > 5, donc on soustrait et on garde le signe de −12 (négatif) : −(12 − 5) = <strong style="color:var(--correct)">−7</strong>`,
  },
  // ── Soustractions ─────────────────────────────────────────────────────────
  {
    expr: '5 - 9', ans: -4, type: 'sub',
    steps: `9 > 5, donc le résultat est négatif : −(9 − 5) = <strong style="color:var(--correct)">−4</strong>`,
  },
  {
    expr: '6 - 11', ans: -5, type: 'sub',
    steps: `11 > 6, donc le résultat est négatif : −(11 − 6) = <strong style="color:var(--correct)">−5</strong>`,
  },
  {
    expr: '2 - 14', ans: -12, type: 'sub',
    steps: `14 > 2, donc le résultat est négatif : −(14 − 2) = <strong style="color:var(--correct)">−12</strong>`,
  },
  {
    expr: '9 - 20', ans: -11, type: 'sub',
    steps: `20 > 9, donc le résultat est négatif : −(20 − 9) = <strong style="color:var(--correct)">−11</strong>`,
  },
  {
    expr: '3 - 8', ans: -5, type: 'sub',
    steps: `8 > 3, donc le résultat est négatif : −(8 − 3) = <strong style="color:var(--correct)">−5</strong>`,
  },
  // ── Multiplications ───────────────────────────────────────────────────────
  {
    expr: '4 × (-5)', ans: -20, type: 'mul',
    steps: `Signes contraires → résultat négatif. 4 × 5 = 20, donc 4 × (−5) = <strong style="color:var(--correct)">−20</strong>`,
  },
  {
    expr: '-4 × 5', ans: -20, type: 'mul',
    steps: `Signes contraires → résultat négatif. 4 × 5 = 20, donc (−4) × 5 = <strong style="color:var(--correct)">−20</strong>`,
  },
  {
    expr: '-4 × (-5)', ans: 20, type: 'mul',
    steps: `Signes identiques → résultat positif. 4 × 5 = 20, donc (−4) × (−5) = <strong style="color:var(--correct)">+20</strong>`,
  },
  {
    expr: '6 × (-3)', ans: -18, type: 'mul',
    steps: `Signes contraires → résultat négatif. 6 × 3 = 18, donc 6 × (−3) = <strong style="color:var(--correct)">−18</strong>`,
  },
  {
    expr: '-6 × (-3)', ans: 18, type: 'mul',
    steps: `Signes identiques → résultat positif. 6 × 3 = 18, donc (−6) × (−3) = <strong style="color:var(--correct)">+18</strong>`,
  },
];

const GENERATOR: GeneratorSpec[] = [
  { kind: 'integer', op: 'add', count: 5, range: [-20, 20] },
  { kind: 'integer', op: 'sub', count: 5, range: [-20, 20] },
  { kind: 'integer', op: 'mul', count: 5, range: [-12, 12] },
];

export const entiersQuiz: QuizDefinition<NumberExercise> = {
  id: 'entiers',
  available: true,
  title: 'Entiers relatifs',
  titleSub: 'relatifs',
  subtitle: '15 calculs · 5 additions, 5 soustractions, 5 multiplications',
  category: 'Calcul',
  accent: '#6EE7C0',
  accentSecondary: '#A78BFA',
  icon: '±',
  description: 'Additions, soustractions et multiplications avec des nombres positifs et négatifs.',
  tags: ['15 questions', 'Génération aléatoire'],
  renderer: 'number',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  typePills: [
    { label: 'Addition', color: '#4CAF84', type: 'add' },
    { label: 'Soustraction', color: '#D07548', type: 'sub' },
    { label: 'Multiplication', color: '#4A7CC9', type: 'mul' },
  ],
  extraControls: [
    { label: 'Calculs complexes →', href: '/4eme/entiers-complex', color: '#6EE7C0' },
  ],
};
