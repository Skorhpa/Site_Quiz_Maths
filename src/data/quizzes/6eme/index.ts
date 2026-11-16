import type { Topic } from '@/types';
import { decimauxQuiz } from './decimaux';
import { geometrieHub6emeQuiz } from './geometrie';
import { proportionnaliteHub6emeQuiz } from './proportionnalite';
import { tablesHub6emeQuiz } from './tables';

export const topics: Topic[] = [
  decimauxQuiz,
  geometrieHub6emeQuiz,
  proportionnaliteHub6emeQuiz,
  tablesHub6emeQuiz,
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
