import type { QuizDefinition } from '@/types';

export const calculsHub5emeQuiz: QuizDefinition = {
  id: 'calculs-hub',
  available: true,
  title: 'Calculs',
  subtitle: 'Priorités opératoires · Sans parenthèses',
  notice: '<span style="color:#F87171;font-weight:600;">⚠&nbsp; À faire sans calculatrice</span>',
  category: 'Calcul',
  accent: '#6EE7C0',
  accentSecondary: '#38BDF8',
  icon: '÷',
  description: 'Identifier et appliquer les priorités opératoires dans des expressions numériques sans parenthèses.',
  tags: ['6 questions', 'Priorités opératoires'],
  renderer: 'calculs-hub-5eme',
  exercises: [],
};
