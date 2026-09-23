import type { Topic } from '@/types';
import { fractionsHub5emeQuiz } from './fractions-hub';
import { calculsHub5emeQuiz } from './calculs-hub';
import { arithHub5emeQuiz } from './arith-hub';
import { tablesHub5emeQuiz } from './tables';
import { relatifsHub5emeQuiz } from './relatifs';

export const topics: Topic[] = [
  fractionsHub5emeQuiz,
  calculsHub5emeQuiz,
  arithHub5emeQuiz,
  tablesHub5emeQuiz,
  relatifsHub5emeQuiz,
];
