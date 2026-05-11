import { useState, type KeyboardEvent } from 'react';
import type { PuissancesExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface PuissancesQuestionProps {
  index: number;
  exercise: PuissancesExercise;
  answer: AnswerState;
  onSubmit: (correct: boolean) => void;
}

function expToUnicode(n: number): string {
  const map: Record<string, string> = {
    '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³',
    '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  return String(n).split('').map((c) => map[c] ?? c).join('');
}

function formatMantissa(n: number): string {
  return String(n).replace('.', ',');
}

const LABEL: Record<PuissancesExercise['subtype'], string> = {
  power: 'Puissance',
  scientific: 'Écriture scientifique',
  exponent: "Compléter l'exposant",
};

const CARD_STATUS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

export function PuissancesQuestion({ index, exercise, answer, onSubmit }: PuissancesQuestionProps) {
  const [value, setValue] = useState('');
  const [mantissa, setMantissa] = useState('');
  const [exp, setExp] = useState('');
  const [hintOpen, setHintOpen] = useState(false);

  const disabled = answer.status !== 'pending';

  const checkCorrect = (): boolean => {
    if (exercise.subtype === 'scientific') {
      const m = parseFloat(mantissa.trim().replace(',', '.'));
      const e = parseInt(exp.trim(), 10);
      if (isNaN(m) || isNaN(e)) return false;
      return Math.abs(m - (exercise.ansMantissa ?? 0)) < 0.001 && e === exercise.ans;
    }
    if (value.trim() === '') return false;
    const n = parseFloat(value.trim().replace(',', '.'));
    return !isNaN(n) && n === exercise.ans;
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (exercise.subtype === 'scientific') {
      if (mantissa.trim() === '' && exp.trim() === '') return;
    } else {
      if (value.trim() === '') return;
    }
    onSubmit(checkCorrect());
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const ansDisplay =
    exercise.subtype === 'scientific'
      ? `${formatMantissa(exercise.ansMantissa ?? 0)} × 10${expToUnicode(exercise.ans)}`
      : String(exercise.ans);

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') return { text: `✗ Réponse : ${ansDisplay}`, cls: 'feedback ko' };
    if (answer.status === 'revealed') return { text: `Réponse : ${ansDisplay}`, cls: 'feedback ko' };
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

  const questionStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '1.3rem',
    fontWeight: 600,
    color: 'var(--text)',
    padding: '12px 16px',
    background: 'var(--surface2)',
    borderRadius: 'var(--radius)',
    marginBottom: 12,
  };

  const smallInputStyle: React.CSSProperties = {
    width: 90,
    flexShrink: 0,
    marginTop: 0,
  };

  const expInputStyle: React.CSSProperties = {
    width: 70,
    flexShrink: 0,
    marginTop: 0,
  };

  return (
    <div className={`qcard ${CARD_STATUS[answer.status]}`} style={{ borderLeft: `3px solid ${exercise.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{LABEL[exercise.subtype]}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div style={questionStyle} dangerouslySetInnerHTML={{ __html: exercise.question }} />

      {exercise.subtype === 'scientific' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="lit-inp"
            style={smallInputStyle}
            value={mantissa}
            placeholder="a"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            onChange={(e) => setMantissa(e.target.value)}
            onKeyDown={handleKey}
          />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.05rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            × 10
          </span>
          <input
            type="text"
            className="lit-inp"
            style={expInputStyle}
            value={exp}
            placeholder="n"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            onChange={(e) => setExp(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>
      ) : (
        <input
          type="text"
          className="lit-inp"
          value={value}
          placeholder={exercise.subtype === 'exponent' ? 'Exposant…' : 'Résultat…'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
        />
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={handleSubmit}
          style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}
        >
          OK
        </button>
      </div>

      <div
        className={feedback.cls}
        style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 13, minHeight: 18 }}
      >
        {feedback.text}
      </div>

      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          className="hint-toggle"
          onClick={() => setHintOpen((v) => !v)}
        >
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div
          className={`steps-box${hintOpen ? ' open' : ''}`}
          style={{ fontSize: 13, lineHeight: 2.1 }}
        >
          <div dangerouslySetInnerHTML={{ __html: exercise.steps }} />
          <div style={{ marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
            <span style={{ color: 'var(--muted)' }}>Réponse = </span>
            <strong style={{ color: 'var(--correct)' }}>{ansDisplay}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
