import type { QuizDefinition } from '@/types';

// Same quiz as the 5ème one: it reuses the `tables-hub-5eme` renderer (nothing in it is level-specific).
export const tablesHub6emeQuiz: QuizDefinition = {
  id: 'tables',
  available: true,
  title: 'Tables de multiplication',
  subtitle: 'Tables de 1 à 10',
  category: 'Calcul',
  accent: '#F472B6',
  accentSecondary: '#c084fc',
  icon: '×',
  description: 'Entraîne-toi sur les tables de multiplication de 1 à 10.',
  tags: ['2 modes', 'Génération aléatoire'],
  renderer: 'tables-hub-5eme',
  exercises: [],
};
