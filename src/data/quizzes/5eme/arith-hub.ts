import type { QuizDefinition } from '@/types';

export const arithHub5emeQuiz: QuizDefinition = {
  id: 'arith-hub',
  available: true,
  title: 'Arithmétique',
  subtitle: 'Diviseurs · Multiples',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Calcul',
  accent: '#FB7185',
  accentSecondary: '#f9a8d4',
  icon: '🔢',
  description: 'Diviseurs, multiples et critères de divisibilité.',
  tags: ['2 modes', 'Génération aléatoire'],
  renderer: 'arith-hub-5eme',
  exercises: [],
};
