import type { QuizDefinition } from '@/types';

export const symetrieCentraleHub5emeQuiz: QuizDefinition = {
  id: 'symetrie-centrale',
  available: true,
  title: 'Symétrie centrale',
  subtitle: '2 sous-quiz · Construction sur quadrillage · Construction sans quadrillage',
  category: 'Géométrie',
  accent: '#60A5FA',
  accentSecondary: '#A78BFA',
  icon: '↻',
  description: 'Construire le symétrique d\'un point, d\'un segment et d\'un polygone par rapport à un centre.',
  tags: ['2 sous-quiz', 'Génération aléatoire'],
  renderer: 'symetrie-centrale-hub-5eme',
  exercises: [],
};
