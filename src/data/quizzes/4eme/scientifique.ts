import type { LiteralExercise, QuizDefinition } from '@/types';

const C1 = '#60A5FA'; // Déc. → Sci.
const C2 = '#A78BFA'; // Non-standard → Sci.
const C3 = '#FB923C'; // Compléter l'exposant

function sci(
  label: string,
  expr: string,
  ans: string,
  steps: string,
  color: string,
): LiteralExercise {
  return { type: 'default', subtype: 'scientific', label, expr, ans, steps, isNum: false, color };
}

export const scientifiqueQuiz: QuizDefinition<LiteralExercise> = {
  id: 'scientifique',
  available: true,
  title: 'Écriture scientifique',
  category: 'Calcul',
  accent: '#6EE7C0',
  accentSecondary: '#38BDF8',
  icon: '10ⁿ',
  description: 'Écrire un nombre sous la forme a × 10ⁿ avec 1 ≤ a < 10.',
  tags: ['6 questions'],
  renderer: 'literal',
  subtitle: 'Réponse attendue sous la forme a × 10^n (utilise * ou × pour la multiplication)',
  typePills: [
    { label: 'Déc. → Sci.', color: C1, type: 'default' },
    { label: 'Non-standard → Sci.', color: C2, type: 'default' },
    { label: 'Compléter', color: C3, type: 'default' },
  ],
  exercises: [
    // ── Type 1 : décimal → notation scientifique (exposant positif) ────────
    sci(
      'Déc. → Sci.',
      '345 000 000 =',
      '3,45 × 10^8',
      `<div>345 000 000 = 3,45 × 100 000 000 = <strong style="color:var(--correct);">3,45 × 10<sup>8</sup></strong></div>`,
      C1,
    ),
    // ── Type 1 : décimal → notation scientifique (exposant négatif) ────────
    sci(
      'Déc. → Sci.',
      '0,000 62 =',
      '6,2 × 10^-4',
      `<div>0,000 62 = 6,2 × 0,0001 = <strong style="color:var(--correct);">6,2 × 10<sup>−4</sup></strong></div>`,
      C1,
    ),
    // ── Type 2 : non-standard → notation scientifique (a > 10) ────────────
    sci(
      'Non-standard → Sci.',
      '456 × 10<sup>3</sup> =',
      '4,56 × 10^5',
      `<div>456 × 10<sup>3</sup> = 4,56 × 10<sup>2</sup> × 10<sup>3</sup> = <strong style="color:var(--correct);">4,56 × 10<sup>5</sup></strong></div>`,
      C2,
    ),
    // ── Type 2 : non-standard → notation scientifique (a < 1) ─────────────
    sci(
      'Non-standard → Sci.',
      '0,072 × 10<sup>6</sup> =',
      '7,2 × 10^4',
      `<div>0,072 × 10<sup>6</sup> = 7,2 × 10<sup>−2</sup> × 10<sup>6</sup> = <strong style="color:var(--correct);">7,2 × 10<sup>4</sup></strong></div>`,
      C2,
    ),
    // ── Type 3 : compléter l'exposant (positif) ───────────────────────────
    sci(
      'Compléter l\'exposant',
      '1,45 × 10<sup>☐</sup> = 14 500',
      '1,45 × 10^4',
      `<div>14 500 = 1,45 × 10 000 = <strong style="color:var(--correct);">1,45 × 10<sup>4</sup></strong></div>`,
      C3,
    ),
    // ── Type 3 : compléter l'exposant (négatif) ───────────────────────────
    sci(
      'Compléter l\'exposant',
      '8,3 × 10<sup>☐</sup> = 0,0083',
      '8,3 × 10^-3',
      `<div>0,0083 = 8,3 × 0,001 = <strong style="color:var(--correct);">8,3 × 10<sup>−3</sup></strong></div>`,
      C3,
    ),
  ],
};
