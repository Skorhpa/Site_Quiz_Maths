import type { QuizDefinition } from '@/types';

export const fractionsHubQuiz: QuizDefinition = {
  id: 'fractions-hub',
  available: true,
  title: 'Fractions',
  subtitle: 'Dénominateur commun · Calculs · Comparaisons · Simplification',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Calcul',
  accent: '#34D399',
  accentSecondary: '#60A5FA',
  icon: '½',
  description: 'Mise au même dénominateur, calculs (+, −, ×, ÷), comparaisons et simplification de fractions.',
  tags: ['5 modes', 'Génération aléatoire'],
  renderer: 'fractions-hub',
  exercises: [],
};
