import type { QuizDefinition } from '@/types';

export const geometrieHub6emeQuiz: QuizDefinition = {
  id: 'geometrie',
  available: true,
  title: 'Géométrie',
  subtitle: 'Vocabulaire, appartenance, programmes de construction',
  category: 'Géométrie',
  accent: '#60A5FA',
  accentSecondary: '#A78BFA',
  icon: '↔',
  description: 'Droites, segments, demi-droites, appartenance d’un point, et programmes de construction.',
  tags: ['2 sous-quiz', 'Génération aléatoire'],
  renderer: 'geometrie-hub-6eme',
  exercises: [],
};
