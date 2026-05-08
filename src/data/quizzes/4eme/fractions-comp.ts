import type { FractionsCompExercise, GeneratorSpec, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'fractions-comp' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as FractionsCompExercise[];

export const fractionsCompQuiz: QuizDefinition<FractionsCompExercise> = {
  id: 'fractions-comp',
  available: true,
  title: 'Fractions : comparaisons & simplification',
  titleSub: 'comparaisons & simplification',
  subtitle: '11 questions · Comparer · Simplifier',
  category: 'Calcul',
  accent: '#34D399',
  accentSecondary: '#6EE7C0',
  typePillsMarginBottom: '2rem',
  icon: '≶',
  description: 'Comparer deux fractions avec < ou >, puis simplifier des fractions par la méthode au choix ou en facteurs premiers.',
  tags: ['11 questions', '2 thèmes', 'Génération aléatoire'],
  renderer: 'fractions-comp',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  typePills: [
    { label: 'Comparaison', color: '#6EE7C0', type: 'default' },
    { label: 'Simplification', color: '#60A5FA', type: 'default' },
    { label: 'Facteurs premiers', color: '#a78bfa', type: 'default' },
  ],
};
