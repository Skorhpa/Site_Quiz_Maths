import type { QuizDefinition } from '@/types';

export const decimauxQuiz: QuizDefinition = {
  id: 'decimaux',
  available: true,
  title: 'Nombres décimaux',
  subtitle: '3 sous-quiz · Fractions décimales ↔ nombres décimaux · Écriture décimale',
  category: 'Calcul',
  accent: '#34D399',
  accentSecondary: '#60A5FA',
  icon: '0,1',
  description:
    "Passer de l'écriture fractionnaire à l'écriture décimale d'un nombre, et inversement, et connaître l'écriture décimale.",
  tags: ['3 sous-quiz', 'Génération aléatoire'],
  renderer: 'decimaux-hub',
  exercises: [],
};
