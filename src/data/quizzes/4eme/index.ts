import type { Topic } from '@/types';
import { entiersQuiz } from './entiers';
import { arrondisQuiz } from './arrondis';
import { litteralQuiz } from './litteral';
import { litteralComplexQuiz } from './litteral-complex';
import { produitQuiz } from './produit';
import { arithQuiz } from './arith';
import { progQuiz } from './prog';
import { pythQuiz } from './pyth';
import { thalesQuiz } from './thales';
import { fractionsQuiz } from './fractions';
import { fractionsComplexQuiz } from './fractions-complex';
import { fractionsCompQuiz } from './fractions-comp';
import { eqQuiz } from './eq';
import { recipQuiz } from './recip';


// Order matches the original Site.html homepage card sequence.
export const topics: Topic[] = [
  entiersQuiz,
  pythQuiz,
  eqQuiz,
  thalesQuiz,
  arrondisQuiz,
  fractionsQuiz,
  fractionsComplexQuiz,
  fractionsCompQuiz,
  litteralQuiz,
  litteralComplexQuiz,
  progQuiz,
  produitQuiz,
  arithQuiz,
  recipQuiz,
  {
    id: 'test',
    title: 'Test',
    category: 'Calcul',
    accent: '#6EE7C0',
    icon: '🧪',
    description: 'Catégorie de test.',
    tags: ['Bientôt'],
    available: false,
  },
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
