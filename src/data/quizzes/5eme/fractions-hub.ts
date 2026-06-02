import type { QuizDefinition } from '@/types';

export const fractionsHub5emeQuiz: QuizDefinition = {
  id: 'fractions-hub',
  available: true,
  title: 'Fractions',
  subtitle: 'Dénominateur commun · Calculs · Comparaisons · Rangement · Simplification',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Calcul',
  accent: '#34D399',
  accentSecondary: '#60A5FA',
  icon: '½',
  description: 'Mise au même dénominateur, additions et soustractions, comparaisons et simplification de fractions.',
  tags: ['6 modes', 'Génération aléatoire'],
  renderer: 'fractions-hub-5eme',
  exercises: [],
};
