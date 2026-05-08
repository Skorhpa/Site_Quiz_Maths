import type { FractionExercise, GeneratorSpec, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'fractions-complex' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as FractionExercise[];

export const fractionsComplexQuiz: QuizDefinition<FractionExercise> = {
  id: 'fractions-complex',
  available: true,
  hidden: true, // sub-quiz: not on the topic grid, reachable via the fractions page button
  parent: 'fractions',
  title: 'Calculs complexes de fractions',
  titleSub: 'de fractions',
  subtitle: '10 calculs · Opérations enchaînées · Expressions à plusieurs termes',
  category: 'Calcul',
  accent: '#34D399',
  accentSecondary: '#6EE7C0',
  icon: '½',
  description: 'Opérations enchaînées et expressions complexes avec fractions.',
  tags: ['10 calculs', 'Génération aléatoire'],
  renderer: 'fractions',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  extraControls: [
    { label: '← Calculs de base', href: '/4eme/fractions', color: '#34D399' },
  ],
};
