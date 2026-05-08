import type { LevelDefinition } from '@/types';

export const LEVELS: LevelDefinition[] = [
  { id: '6eme', label: 'Sixième', shortLabel: '6ᵉ', description: 'Première année du collège', available: false },
  { id: '5eme', label: 'Cinquième', shortLabel: '5ᵉ', description: 'Deuxième année du collège', available: false },
  {
    id: '4eme',
    label: 'Quatrième',
    shortLabel: '4ᵉ',
    description: 'Pythagore, Thalès, équations, calcul littéral, fractions',
    available: true,
    topicsModule: () => import('./quizzes/4eme/index'),
  },
  { id: '3eme', label: 'Troisième', shortLabel: '3ᵉ', description: 'Année du Brevet', available: false },
  { id: '2nde', label: 'Seconde', shortLabel: '2ⁿᵈᵉ', description: 'Première année du lycée', available: false },
  { id: '1ere', label: 'Première', shortLabel: '1ʳᵉ', description: 'Deuxième année du lycée', available: false },
  { id: 'terminale', label: 'Terminale', shortLabel: 'Tᵉ', description: 'Année du Baccalauréat', available: false },
];

export function getLevel(id: string): LevelDefinition | undefined {
  return LEVELS.find((l) => l.id === id);
}
