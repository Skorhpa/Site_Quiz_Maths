import type { QuizDefinition } from '@/types';

export const thalesHubQuiz: QuizDefinition = {
  id: 'thales-hub',
  available: true,
  title: 'Thalès',
  subtitle: 'Théorème · Réciproque',
  notice: '<span style="color:#34D399;font-weight:600;">🧮&nbsp; Calculatrice nécessaire</span>',
  category: 'Géométrie',
  accent: '#FB923C',
  accentSecondary: '#FCD34D',
  icon: '∥',
  description: 'Trouver une longueur inconnue avec le théorème de Thalès et démontrer des parallélismes.',
  tags: ['2 modes', 'Génération aléatoire'],
  renderer: 'thales-hub',
  exercises: [],
};
