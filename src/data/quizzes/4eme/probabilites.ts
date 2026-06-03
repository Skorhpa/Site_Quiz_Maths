import type { QuizDefinition } from '@/types';
import { PROBA_DEFAULT, probaVocabCard } from '@/lib/generators/proba';

export const probabilitesQuiz: QuizDefinition = {
  id: 'probabilites',
  available: true,
  title: 'Probabilités',
  notice: '<span style="color:var(--muted);font-size:13px;">💡 La réponse attendue est une fraction. Si tu simplifies, c\'est encore mieux !</span>',
  category: 'Calcul',
  accent: '#F472B6',
  accentSecondary: '#a78bfa',
  icon: '🎲',
  description: 'Calculer des probabilités simples : dé, tirage au sort, roue de loterie.',
  tags: ['Probabilités'],
  renderer: 'proba',
  exercises: [probaVocabCard, ...PROBA_DEFAULT],
  generator: [{ kind: 'proba', count: 5 }],
};
