import { useState, type KeyboardEvent } from 'react';
import type { EquationExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface Props {
  index: number;
  exercise: EquationExercise;
  answer: AnswerState;
  onChange: (value: string) => void;
  onSubmit: (correct?: boolean) => void;
}

export function EquationQuestion({ index, exercise, answer, onChange, onSubmit }: Props) {
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  const handleSubmit = () => {
    if (disabled) return;
    const v = parseFloat(answer.value);
    if (Number.isNaN(v)) return;
    onSubmit(Math.abs(v - exercise.ans) < 0.001);
  };
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const statusClass = answer.status === 'correct' ? 'correct-card' : answer.status === 'wrong' || answer.status === 'revealed' ? 'wrong-card' : '';

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') return { text: `✗ La solution est x = ${exercise.ans}`, cls: 'feedback ko' };
    if (answer.status === 'revealed') return { text: `Solution : x = ${exercise.ans}`, cls: 'feedback ko' };
    return { text: '', cls: 'feedback' };
  })();

  return (
    <div className={`eqcard ${exercise.eqType} ${statusClass}`}>
      <div className="eqcard-top">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <span className={`qtype-tag ${exercise.eqType}`}>{exercise.label}</span>
      </div>
      <div className="equation-display">{exercise.expr}</div>
      <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
        <span>{hintOpen ? '▼' : '▶'}</span> Voir les étapes de résolution
      </button>
      <div className={`steps-box${hintOpen ? ' open' : ''}`}>
        {exercise.steps.map((s, j) => (
          <div key={j}>
            <span style={{ color: 'var(--muted)', minWidth: 160, display: 'inline-block' }}>{s.label} :</span>{' '}
            <span className="step-eq">{s.eq}</span>
          </div>
        ))}
      </div>
      <div className="eq-answer-row">
        <span className="eq-answer-label">x =</span>
        <input
          type="number"
          step="1"
          value={answer.value}
          placeholder="?"
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="btn-secondary" disabled={disabled} onClick={handleSubmit}>
          OK
        </button>
      </div>
      <div className={feedback.cls}>{feedback.text}</div>
    </div>
  );
}
