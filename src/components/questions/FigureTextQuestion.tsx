import { useState, type KeyboardEvent } from 'react';
import type { ProduitExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface FigureTextQuestionProps {
  index: number;
  exercise: ProduitExercise;
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

export function FigureTextQuestion({ index, exercise, answer, onChange, onSubmit }: FigureTextQuestionProps) {
  const [hintOpen, setHintOpen] = useState(false);
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

  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: `rgba(74,222,128,0.12)`,
    color: exercise.color,
  };

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${exercise.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{exercise.label}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div
        style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)', marginBottom: 8 }}
        dangerouslySetInnerHTML={{ __html: exercise.question }}
      />
      <div dangerouslySetInnerHTML={{ __html: exercise.svg }} />
      <div
        style={{
          fontSize: 12,
          color: 'var(--muted)',
          marginBottom: 6,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        💡 Indice : {exercise.hintLine}
      </div>

      <input
        type="text"
        className="lit-inp"
        value={answer.value}
        placeholder="Écris l'expression en fonction de x (ou n)…"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        style={{ borderColor: exercise.color }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={() => onSubmit()}
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
