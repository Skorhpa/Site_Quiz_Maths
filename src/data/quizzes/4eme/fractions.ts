import type { FractionExercise, GeneratorSpec, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'fractions' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as FractionExercise[];

export const fractionsQuiz: QuizDefinition<FractionExercise> = {
  id: 'fractions',
  available: true,
  title: 'Fractions : calculs',
  titleSub: 'calculs',
  subtitle: '21 questions · Additions · Soustractions · Multiplications · Divisions',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Calcul',
  accent: '#34D399',
  accentSecondary: '#6EE7C0',
  typePillsMarginBottom: '2rem',
  icon: '½',
  description:
    'Additions, soustractions, multiplications et divisions de fractions — avec problèmes contextuels et simplification.',
  tags: ['21 questions', '4 opérations'],
  renderer: 'fractions',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  typePills: [
    { label: 'Addition', color: '#6EE7C0', type: 'default' },
    { label: 'Soustraction', color: '#60A5FA', type: 'default' },
    { label: 'Multiplication', color: '#F9A8D4', type: 'default' },
    { label: 'Division', color: '#FCD34D', type: 'default' },
  ],
  extraControls: [
    { label: 'Calculs complexes →', href: '/4eme/fractions-complex', color: '#34D399' },
  ],
};
