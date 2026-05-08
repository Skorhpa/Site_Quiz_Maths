import { useState, type KeyboardEvent } from 'react';
import type { RoundingExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface RoundingQuestionProps {
  index: number;
  exercise: RoundingExercise;
  answer: AnswerState;
  onChange: (value: string) => void;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

export function RoundingQuestion({ index, exercise, answer, onChange, onSubmit }: RoundingQuestionProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  };

  const feedback = (() => {
    if (answer.status === 'correct') return { text: `✓ Correct ! ≈ ${exercise.ansStr}`, cls: 'feedback ok' };
    if (answer.status === 'wrong') return { text: `✗ Réponse : ≈ ${exercise.ansStr}`, cls: 'feedback ko' };
    if (answer.status === 'revealed') return { text: `Réponse : ≈ ${exercise.ansStr}`, cls: 'feedback ko' };
    return { text: '', cls: 'feedback' };
  })();

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext">
          Donne l'arrondi <strong style={{ color: exercise.color }}>{exercise.posLabel}</strong> de :
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '1.5rem',
              color: 'var(--text)',
              marginLeft: 8,
            }}
          >
            {exercise.numStr}
          </span>
          {exercise.isTrap && (
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 99,
                background: 'rgba(244,114,182,0.15)',
                color: 'var(--c5, #F472B6)',
                marginLeft: 8,
              }}
            >
              ⚡ piège
            </span>
          )}
        </div>
      </div>

      <div className="rounding-input-row">
        <span className="rounding-approx">≈</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="?"
          value={answer.value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          style={{ borderColor: !disabled && answer.value ? exercise.color : undefined }}
        />
        <button className="btn-secondary rounding-ok" disabled={disabled} onClick={() => onSubmit()}>
          OK
        </button>
      </div>

      <div className="rounding-hint-wrap">
        <button
          type="button"
          className="hint-toggle"
          onClick={() => setHintOpen((v) => !v)}
        >
          <span>{hintOpen ? '▼' : '▶'}</span> Voir l'explication
        </button>
        <div
          className={`steps-box${hintOpen ? ' open' : ''}`}
          style={{ fontSize: 13, lineHeight: 1.9, padding: '12px 14px' }}
        >
          <div dangerouslySetInnerHTML={{ __html: exercise.explain }} />
          <div className="rounding-hint-result">
            {exercise.numStr} ≈ <strong>{exercise.ansStr}</strong> (arrondi {exercise.posLabel})
          </div>
        </div>
      </div>

      <div className={feedback.cls}>{feedback.text}</div>
    </div>
  );
}
