import type { QuizDefinition } from '@/types';

export const relatifsHub5emeQuiz: QuizDefinition = {
  id: 'relatifs',
  available: true,
  title: 'Nombres relatifs',
  subtitle: 'Nombres positifs, négatifs, relatifs, opposés',
  category: 'Calcul',
  accent: '#6EE7C0',
  accentSecondary: '#A78BFA',
  icon: '±',
  description: 'Reconnaître le signe d’un nombre et déterminer l’opposé d’un nombre relatif.',
  tags: ['2 sous-quiz', 'Génération aléatoire'],
  renderer: 'relatifs-hub-5eme',
  exercises: [],
};
