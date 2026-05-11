import type { GeneratorSpec, NumberExercise, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'entiers-complex' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as NumberExercise[];

export const entiersComplexQuiz: QuizDefinition<NumberExercise> = {
  id: 'entiers-complex',
  available: true,
  hidden: true,
  parent: 'entiers',
  title: 'Calculs complexes',
  titleSub: 'complexes',
  subtitle: 'Priorité des opérations · Parenthèses · Puissances',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Calcul',
  accent: '#6EE7C0',
  accentSecondary: '#A78BFA',
  icon: '(±)',
  description: 'Calculs mêlant additions, soustractions, multiplications, divisions et parenthèses avec des entiers relatifs.',
  tags: ['10 questions', 'Génération aléatoire'],
  renderer: 'number',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  typePills: [
    { label: 'Priorité des opérations', color: '#6EE7C0', type: 'default' },
  ],
};
