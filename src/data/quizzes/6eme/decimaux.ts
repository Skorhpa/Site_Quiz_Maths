import type { QuizDefinition } from '@/types';

export const decimauxQuiz: QuizDefinition = {
  id: 'decimaux',
  available: true,
  title: 'Nombres décimaux',
  subtitle: '3 sous-quiz · Écriture · Repérage · Comparer et intercaler',
  category: 'Calcul',
  accent: '#34D399',
  accentSecondary: '#60A5FA',
  icon: '0,1',
  description:
    "Écriture décimale, repérage sur une demi-droite graduée, comparaison et intercalation de nombres décimaux.",
  tags: ['3 sous-quiz', 'Génération aléatoire'],
  renderer: 'decimaux-parent-hub-6eme',
  exercises: [],
};
