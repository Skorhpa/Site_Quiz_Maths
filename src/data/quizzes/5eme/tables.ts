import type { QuizDefinition } from '@/types';

export const tablesHub5emeQuiz: QuizDefinition = {
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
