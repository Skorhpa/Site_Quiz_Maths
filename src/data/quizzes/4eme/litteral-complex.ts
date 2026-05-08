import type { GeneratorSpec, LiteralExercise, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'literal-complex' }];

const STATIC_EXERCISES = runGenerator(GENERATOR) as LiteralExercise[];

export const litteralComplexQuiz: QuizDefinition<LiteralExercise> = {
  id: 'litteral-complex',
  available: true,
  hidden: true, // sub-quiz: not on the topic grid, reachable via the litteral page button
  parent: 'litteral',
  title: 'Calculs complexes littéraux',
  titleSub: 'littéraux',
  subtitle: '10 calculs · Réduction avec parenthèses multiples · Développement et réduction enchaînés',
  category: 'Algèbre',
  accent: '#E879F9',
  accentSecondary: '#a855f7',
  icon: 'ax',
  description: 'Calculs littéraux avancés : parenthèses multiples et développements à enchaîner.',
  tags: ['10 calculs', 'Génération aléatoire'],
  renderer: 'literal',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  extraControls: [
    { label: '← Calculs de base', href: '/4eme/litteral', color: '#E879F9' },
  ],
};
