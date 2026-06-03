import type { Topic } from '@/types';
import { scientifiqueQuiz } from './scientifique';
import { proportionnaliteQuiz } from './proportionnalite';
import { entiersQuiz } from './entiers';
import { entiersComplexQuiz } from './entiers-complex';
import { arrondisQuiz } from './arrondis';
import { litteralQuiz } from './litteral';
import { litteralComplexQuiz } from './litteral-complex';
import { produitQuiz } from './produit';
import { arithHubQuiz } from './arith-hub';
import { progQuiz } from './prog';
import { pythHubQuiz } from './pyth-hub';
import { thalesHubQuiz } from './thales-hub';
import { fractionsHubQuiz } from './fractions-hub';
import { fractionsComplexQuiz } from './fractions-complex';
import { eqQuiz } from './eq';
import { probabilitesQuiz } from './probabilites';


// Order matches the original Site.html homepage card sequence.
export const topics: Topic[] = [
  entiersQuiz,
  entiersComplexQuiz,
  pythHubQuiz,
  eqQuiz,
  thalesHubQuiz,
  arrondisQuiz,
  fractionsHubQuiz,
  fractionsComplexQuiz,
  litteralQuiz,
  litteralComplexQuiz,
  progQuiz,
  produitQuiz,
  arithHubQuiz,
  scientifiqueQuiz,
  proportionnaliteQuiz,
  probabilitesQuiz,
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
