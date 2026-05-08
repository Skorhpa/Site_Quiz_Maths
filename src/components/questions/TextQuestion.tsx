import { useState, type KeyboardEvent } from 'react';
import type { LiteralExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface TextQuestionProps {
  index: number;
  exercise: LiteralExercise;
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

function placeholderFor(subtype: LiteralExercise['subtype']): string {
  if (subtype === 'substitute') return 'Donne la valeur numérique…';
  if (subtype === 'factor') return "Écris l'expression factorisée…";
  return "Écris l'expression réduite…";
}

export function TextQuestion({ index, exercise, answer, onChange, onSubmit }: TextQuestionProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';
  const isSub = exercise.subtype === 'substitute';
  const isComplex = exercise.subtype === 'complex';

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  };

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') return { text: `✗ Réponse : ${exercise.ans}`, cls: 'feedback ko' };
    if (answer.status === 'revealed') return { text: `Réponse : ${exercise.ans}`, cls: 'feedback ko' };
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

  const exprStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: isSub ? '1.1rem' : isComplex ? '1.15rem' : '1.3rem',
    fontWeight: 600,
    color: 'var(--text)',
    padding: '12px 16px',
    background: 'var(--surface2)',
    borderRadius: 'var(--radius)',
    marginBottom: 12,
    lineHeight: isSub ? 1.7 : undefined,
  };

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${exercise.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{exercise.label}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div
        style={exprStyle}
        dangerouslySetInnerHTML={{ __html: isSub ? exercise.expr : `${exercise.expr} =` }}
      />

      <input
        type="text"
        className="lit-inp"
        value={answer.value}
        placeholder={placeholderFor(exercise.subtype)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={() => onSubmit()}
          style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}
        >
          OK
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
          style={isComplex ? { color: exercise.color } : undefined}
        >
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}>
          <div dangerouslySetInnerHTML={{ __html: exercise.steps }} />
          {!isComplex && (
            <div style={{ marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
              <span style={{ color: 'var(--muted)' }}>Valeur = </span>
              <strong style={{ color: 'var(--correct)' }}>{exercise.ans}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
