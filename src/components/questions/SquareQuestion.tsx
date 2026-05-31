import { useState, type KeyboardEvent } from 'react';
import type { SquareExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface Props {
  index: number;
  exercise: SquareExercise;
  answer: AnswerState;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

export function SquareQuestion({ index, exercise, answer, onSubmit }: Props) {
  const [input, setInput] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  const handleSubmit = () => {
    if (disabled) return;
    const v = parseFloat(input.trim().replace(',', '.'));
    if (Number.isNaN(v)) return;
    const tol = exercise.sqType === 'sqrt_approx' ? 0.05 : 0;
    onSubmit(Math.abs(v - exercise.ans) <= tol);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') {
      const r = exercise.sqType === 'sqrt_approx' ? exercise.ans.toFixed(1) : String(exercise.ans);
      return { text: `✗ Réponse : ${r}`, cls: 'feedback ko' };
    }
    if (answer.status === 'revealed') {
      const r = exercise.sqType === 'sqrt_approx' ? exercise.ans.toFixed(1) : String(exercise.ans);
      return { text: `Réponse : ${r}`, cls: 'feedback ko' };
    }
    return { text: '', cls: 'feedback' };
  })();

  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: `${exercise.color}22`,
    color: exercise.color,
  };

  const questionText = (() => {
    if (exercise.sqType === 'square') return `Calcule ${exercise.n}²`;
    if (exercise.sqType === 'square_neg_outer') return `Calcule -${exercise.n}²`;
    if (exercise.sqType === 'square_neg_paren') return `Calcule (-${exercise.n})²`;
    if (exercise.sqType === 'sqrt') return `Calcule √${exercise.n}`;
    return `Calcule √${exercise.n} (arrondi au dixième)`;
  })();

  const placeholder = (() => {
    if (exercise.sqType === 'square') return `${exercise.n}² = …`;
    if (exercise.sqType === 'square_neg_outer') return `-${exercise.n}² = …`;
    if (exercise.sqType === 'square_neg_paren') return `(-${exercise.n})² = …`;
    if (exercise.sqType === 'sqrt') return `√${exercise.n} = …`;
    return `√${exercise.n} ≈ …`;
  })();

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${exercise.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{exercise.label}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div style={{ fontSize: 15, fontFamily: "'DM Mono', monospace", fontWeight: 700, marginBottom: 12 }}>
        {questionText}
      </div>
      <input
        type="text"
        className="lit-inp"
        value={input}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        style={{ borderColor: exercise.color }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={handleSubmit}
          style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}
        >
          Vérifier
        </button>
      </div>
      <div className={feedback.cls} style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 13, minHeight: 18 }}>
        {feedback.text}
      </div>
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          className="hint-toggle"
          onClick={() => setHintOpen((v) => !v)}
          style={{ color: exercise.color }}
        >
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div
          className={`steps-box${hintOpen ? ' open' : ''}`}
          style={{ fontSize: 13, lineHeight: 2.1 }}
          dangerouslySetInnerHTML={{ __html: exercise.steps }}
        />
      </div>
    </div>
  );
}
