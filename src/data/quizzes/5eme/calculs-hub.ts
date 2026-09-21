import type { QuizDefinition } from '@/types';

export const calculsHub5emeQuiz: QuizDefinition = {
  id: 'calculs-hub',
  available: true,
  title: 'Calculs',
  subtitle: 'Priorités opératoires · Division euclidienne · Distributivité',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Calcul',
  accent: '#6EE7C0',
  accentSecondary: '#38BDF8',
  icon: '÷',
  description: 'Priorités opératoires, division euclidienne, et distributivité : développer et factoriser une expression.',
  tags: ['5 sous-thèmes', 'Génération aléatoire'],
  renderer: 'calculs-hub-5eme',
  exercises: [],
};
