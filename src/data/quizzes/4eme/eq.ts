import type { EquationExercise, GeneratorSpec, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'equations' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as EquationExercise[];

export const eqQuiz: QuizDefinition<EquationExercise> = {
  id: 'eq',
  available: true,
  title: "Résolution d'équations",
  titleSub: "d'équations",
  subtitle: "20 questions · 4 types d'équations",
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Algèbre',
  accent: '#A78BFA',
  accentSecondary: '#60A5FA',
  icon: '𝑥',
  description: 'Quatre types d’équations du premier degré, avec étapes de résolution détaillées.',
  tags: ['20 questions', '4 types', 'Étapes détaillées'],
  renderer: 'equation',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  typePills: [
    { label: 'x + a = b', color: '#6EE7C0', type: 'default' },
    { label: 'ax = d', color: '#60A5FA', type: 'default' },
    { label: 'ax + c = d', color: '#F9A8D4', type: 'default' },
    { label: 'ax + c = dx + b', color: '#FCD34D', type: 'default' },
  ],
};
