import type { QuizDefinition } from '@/types';

export const pythHubQuiz: QuizDefinition = {
  id: 'pyth-hub',
  available: true,
  title: 'Pythagore',
  subtitle: 'Carrés · Racines · Théorème · Réciproque',
  notice: '<span style="color:#34D399;font-weight:600;">🧮&nbsp; Calculatrice nécessaire pour les modes 3 et 4</span>',
  category: 'Géométrie',
  accent: '#60A5FA',
  accentSecondary: '#6EE7C0',
  icon: '📐',
  description: "Calculer des carrés et racines carrées, appliquer le théorème de Pythagore et sa réciproque.",
  tags: ['4 modes', 'Génération aléatoire'],
  renderer: 'pyth-hub',
  exercises: [],
};
