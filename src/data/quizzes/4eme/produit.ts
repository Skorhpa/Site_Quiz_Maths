import type { GeneratorSpec, ProduitExercise, QuizDefinition } from '@/types';
import { runGenerator } from '@/lib/runGenerator';

const GENERATOR: GeneratorSpec[] = [{ kind: 'produit' }];

const STATIC_EXERCISES = runGenerator(GENERATOR) as ProduitExercise[];

export const produitQuiz: QuizDefinition<ProduitExercise> = {
  id: 'produit',
  available: true,
  title: 'Produire une expression littérale',
  cardTitle: 'Produire une expression',
  titleSub: 'expression littérale',
  subtitle: '10 exercices · Aires · Volumes · Périmètres · Entiers consécutifs',
  category: 'Algèbre',
  accent: '#4ADE80',
  accentSecondary: '#6EE7C0',
  icon: '📐',
  description: 'Traduire une situation géométrique ou numérique en expression littérale, puis la simplifier.',
  tags: ['10 exercices', 'Génération aléatoire'],
  renderer: 'produit',
  exercises: STATIC_EXERCISES,
  generator: GENERATOR,
};
