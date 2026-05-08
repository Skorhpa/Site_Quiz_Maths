import type { GeneratorSpec, LiteralExercise, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'literal' }];

// Static fallback baked at build time. "Nouvelle série" reruns client-side.
const STATIC_EXERCISES = runGenerator(GENERATOR) as LiteralExercise[];

export const litteralQuiz: QuizDefinition<LiteralExercise> = {
  id: 'litteral',
  available: true,
  title: 'Calcul littéral',
  titleSub: 'littéral',
  subtitle: '25 questions · Réduire · Développer · Factoriser · Parenthèses · Substituer',
  category: 'Algèbre',
  accent: '#E879F9',
  accentSecondary: '#a855f7',
  typePillsMarginBottom: '2rem',
  icon: 'ax',
  description:
    'Réduire, développer et factoriser des expressions littérales — avec la distributivité simple et la réduction avec parenthèses.',
  tags: ['25 questions', '5 thèmes', 'Génération aléatoire'],
  renderer: 'literal',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  typePills: [
    { label: 'Réduire', color: '#e879f9', type: 'default' },
    { label: 'Développer', color: '#a78bfa', type: 'default' },
    { label: 'Factoriser', color: '#f0abfc', type: 'default' },
    { label: 'Réduire (parenthèses)', color: '#7dd3fc', type: 'default' },
    { label: 'Substituer', color: '#fbbf24', type: 'default' },
  ],
  extraControls: [
    { label: 'Calculs complexes →', href: '/4eme/litteral-complex', color: '#E879F9' },
  ],
};
