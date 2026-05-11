import type { GeneratorSpec, ProgrammeExercise, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'programme' }];
const STATIC_EXERCISES = runGenerator(GENERATOR) as ProgrammeExercise[];

export const progQuiz: QuizDefinition<ProgrammeExercise> = {
  id: 'prog',
  available: true,
  title: 'Programmes de calcul',
  titleSub: 'de calcul',
  subtitle: '3 exercices · Exécuter · Traduire · Simplifier',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Algèbre',
  accent: '#38BDF8',
  accentSecondary: '#818cf8',
  icon: '⚙',
  description: "Exécuter et traduire algébriquement des programmes de calcul, puis simplifier l'expression obtenue.",
  tags: ['3 exercices', 'Génération aléatoire'],
  renderer: 'programme',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
};
