import type { GeneratorSpec, QuizDefinition, RoundingExercise } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [
  { kind: 'rounding', type: 'dix', count: 4, trapCount: 1 },
  { kind: 'rounding', type: 'cent', count: 4, trapCount: 1 },
  { kind: 'rounding', type: 'mill', count: 4, trapCount: 1 },
];

// Static fallback baked at build time so the page is never empty.
// "Nouvelle série" reruns the generator client-side for fresh values.
const STATIC_EXERCISES = runGenerator(GENERATOR) as RoundingExercise[];

export const arrondisQuiz: QuizDefinition<RoundingExercise> = {
  id: 'arrondis',
  available: true,
  title: "Arrondis d'un nombre",
  titleSub: "d'un nombre",
  subtitle: '12 questions · Dixième, centième, millième',
  category: 'Calcul',
  accent: '#F472B6',
  accentSecondary: '#c084fc',
  typePillsMarginBottom: '2rem',
  icon: '≈',
  description:
    "Arrondir des nombres décimaux au dixième, au centième ou au millième — avec des pièges sur les retenues en cascade.",
  tags: ['12 questions', 'Génération aléatoire'],
  renderer: 'rounding',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
  typePills: [
    { label: 'Au dixième', color: '#F472B6', type: 'default' },
    { label: 'Au centième', color: '#c084fc', type: 'default' },
    { label: 'Au millième', color: '#818cf8', type: 'default' },
  ],
};
