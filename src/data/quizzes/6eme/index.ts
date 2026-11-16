import type { Topic } from '@/types';
import { decimauxQuiz } from './decimaux';
import { geometrieHub6emeQuiz } from './geometrie';
import { proportionnaliteHub6emeQuiz } from './proportionnalite';

export const topics: Topic[] = [
  decimauxQuiz,
  geometrieHub6emeQuiz,
  proportionnaliteHub6emeQuiz,
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
