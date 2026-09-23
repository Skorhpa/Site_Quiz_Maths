import type { Topic } from '@/types';
import { decimauxQuiz } from './decimaux';
import { geometrieHub6emeQuiz } from './geometrie';

export const topics: Topic[] = [
  decimauxQuiz,
  geometrieHub6emeQuiz,
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
