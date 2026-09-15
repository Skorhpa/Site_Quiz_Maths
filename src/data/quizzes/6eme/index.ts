import type { Topic } from '@/types';
import { decimauxQuiz } from './decimaux';

export const topics: Topic[] = [
  decimauxQuiz,
];

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
