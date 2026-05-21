import type { QuizDefinition } from '@/types';

export const entiersQuiz: QuizDefinition = {
  id: 'entiers',
  available: true,
  title: 'Entiers relatifs',
  titleSub: 'relatifs',
  subtitle: 'Calculs · Chronométré · Étude de signes',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Calcul',
  accent: '#6EE7C0',
  accentSecondary: '#A78BFA',
  icon: '±',
  description: 'Additions, soustractions et multiplications avec des nombres positifs et négatifs.',
  tags: ['4 modes', 'Génération aléatoire'],
  renderer: 'entiers-hub',
  exercises: [],
};
