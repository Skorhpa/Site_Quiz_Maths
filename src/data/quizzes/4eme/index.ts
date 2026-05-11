import type { Topic } from '@/types';
import { scientifiqueQuiz } from './scientifique';
import { proportionnaliteQuiz } from './proportionnalite';
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
  scientifiqueQuiz,
  proportionnaliteQuiz,
  // ── À venir ────────────────────────────────────────────────────────────
  {
    id: 'recip-thales',
    title: 'Réciproque du théorème de Thalès',
    category: 'Géométrie',
    accent: '#FB923C',
    icon: '⟺',
    description: 'Appliquer la réciproque du théorème de Thalès pour démontrer des propriétés.',
    tags: ['À venir'],
    available: false,
  },
  {
    id: 'probabilites',
    title: 'Probabilités',
    category: 'Calcul',
    accent: '#F472B6',
    icon: '🎲',
    description: 'Calculer des probabilités simples et utiliser des arbres de probabilités.',
    tags: ['À venir'],
    available: false,
  },
  {
    id: 'trigonometrie',
    title: 'Trigonométrie',
    category: 'Géométrie',
    accent: '#38BDF8',
    icon: 'sin',
    description: 'Utiliser sinus, cosinus et tangente dans un triangle rectangle.',
    tags: ['À venir'],
    available: false,
  },
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
