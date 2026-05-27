import type { QuizDefinition } from '@/types';

export const arithHubQuiz: QuizDefinition = {
  id: 'arith-hub',
  available: true,
  title: 'Arithmétique',
  subtitle: 'Diviseurs · Multiples · Nombres premiers · Problèmes',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Algèbre',
  accent: '#FB7185',
  accentSecondary: '#f9a8d4',
  icon: '🔢',
  description:
    'Diviseurs, multiples, nombres premiers, décomposition en facteurs premiers et problèmes de répartition.',
  tags: ['4 modes', 'Génération aléatoire'],
  renderer: 'arith-hub',
  exercises: [],
};
