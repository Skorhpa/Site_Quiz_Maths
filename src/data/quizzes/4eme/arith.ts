import type { ArithExercise, GeneratorSpec, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'arith' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as ArithExercise[];

export const arithQuiz: QuizDefinition<ArithExercise> = {
  id: 'arith',
  available: true,
  title: 'Arithmétique',
  titleSub: 'métique',
  subtitle: '11 questions · Diviseurs · Multiples · Nombres premiers',
  category: 'Algèbre',
  accent: '#FB7185',
  accentSecondary: '#f9a8d4',
  typePillsMarginBottom: '2rem',
  icon: '🔢',
  description:
    'Diviseurs, multiples, critères de divisibilité, nombres premiers et décomposition en facteurs premiers.',
  tags: ['11 questions', 'Génération aléatoire'],
  renderer: 'arith',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  typePills: [
    { label: 'Diviseurs', color: '#fb7185', type: 'default' },
    { label: 'Multiples', color: '#f9a8d4', type: 'default' },
    { label: 'Nombres premiers', color: '#fda4af', type: 'default' },
  ],
};
