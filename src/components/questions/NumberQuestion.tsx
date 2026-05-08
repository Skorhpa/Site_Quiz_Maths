import type { KeyboardEvent } from 'react';
import type { NumberExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface NumberQuestionProps {
  index: number;
  exercise: NumberExercise;
  answer: AnswerState;
  accent: string;
  onChange: (value: string) => void;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

export function NumberQuestion({ index, exercise, answer, accent, onChange, onSubmit }: NumberQuestionProps) {
  const disabled = answer.status !== 'pending';

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  };

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') return { text: `✗ Réponse : ${exercise.ans}`, cls: 'feedback ko' };
    if (answer.status === 'revealed') return { text: `Réponse : ${exercise.ans}`, cls: 'feedback ko' };
    return { text: '', cls: 'feedback' };
  })();

  return (
    <div className={`card ${exercise.type} ${CARD_CLASS[answer.status]}`}>
      <div className="card-num">{String(index + 1).padStart(2, '0')}</div>
      <div className="expr">{exercise.expr} =</div>
      <div className="input-row">
        <input
          type="number"
          value={answer.value}
          placeholder="?"
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          style={{ borderColor: answer.value && !disabled ? accent : undefined }}
        />
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={() => onSubmit()}
        >
          OK
        </button>
      </div>
      <div className={feedback.cls}>{feedback.text}</div>
      {exercise.hint && answer.status === 'pending' && (
        <div className="hint">💡 {exercise.hint}</div>
      )}
    </div>
  );
}
