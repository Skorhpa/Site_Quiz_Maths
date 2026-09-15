import { useState, type KeyboardEvent } from 'react';
import type { DecimalFracExercise } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface Props {
  index: number;
  exercise: DecimalFracExercise;
  answer: AnswerState;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

const fH = (n: number | string, d: number | string, col = 'var(--text)') =>
  `<span class="frac" style="color:${col}"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;

const boxStyle: React.CSSProperties = {
  width: 52,
  fontFamily: "'DM Mono', monospace",
  fontSize: 16,
  fontWeight: 700,
  padding: '8px 6px',
  borderRadius: 8,
  border: '1px solid var(--border2)',
  background: 'var(--bg)',
  color: 'var(--text)',
  textAlign: 'center',
};

export function DecimalFracQuestion({ index, exercise, answer, onSubmit }: Props) {
  const [intVal, setIntVal] = useState('');
  const [termVals, setTermVals] = useState<{ n: string; d: string }[]>(
    exercise.terms.map(() => ({ n: '', d: '' }))
  );
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ html: string; cls: string }>({ html: '', cls: 'feedback' });

  const disabled = answer.status !== 'pending';

  const setTermVal = (i: number, field: 'n' | 'd', v: string) =>
    setTermVals((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: v } : t)));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const ansDisplayHtml = () => {
    const parts: string[] = [];
    if (exercise.hasInteger) parts.push(`${exercise.integerAns}`);
    for (const t of exercise.terms) parts.push(fH(t.n, t.d, 'var(--correct)'));
    return parts.join(' + ');
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (exercise.hasInteger && intVal.trim() === '') return;
    if (termVals.some((t) => t.n.trim() === '' || t.d.trim() === '')) return;

    let ok = true;
    if (exercise.hasInteger) {
      const vi = parseInt(intVal, 10);
      if (Number.isNaN(vi) || vi !== exercise.integerAns) ok = false;
    }
    exercise.terms.forEach((t, i) => {
      const vn = parseInt(termVals[i]!.n, 10);
      const vd = parseInt(termVals[i]!.d, 10);
      if (Number.isNaN(vn) || Number.isNaN(vd) || vn !== t.n || vd !== t.d) ok = false;
    });

    if (ok) {
      setFeedback({ html: '✓ Correct !', cls: 'feedback ok' });
    } else {
      setFeedback({ html: `✗ Réponse : ${ansDisplayHtml()}`, cls: 'feedback ko' });
    }
    onSubmit(ok);
  };

  const finalFb = answer.status === 'revealed'
    ? { html: `Réponse : ${ansDisplayHtml()}`, cls: 'feedback ko' }
    : feedback;

  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: `${exercise.color}22`,
    color: exercise.color,
  };

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${exercise.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{exercise.label}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '1.3rem',
          fontWeight: 600,
          color: 'var(--text)',
          padding: '12px 16px',
          background: 'var(--surface2)',
          borderRadius: 'var(--radius)',
          marginBottom: 12,
        }}
      >
        {exercise.expr} =
      </div>

      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {exercise.hasInteger && (
          <input
            type="text"
            value={intVal}
            placeholder="?"
            disabled={disabled}
            onChange={(e) => setIntVal(e.target.value)}
            onKeyDown={handleKey}
            style={boxStyle}
          />
        )}
        {exercise.terms.map((_, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(exercise.hasInteger || i > 0) && (
              <span style={{ color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>+</span>
            )}
            <span className="frac-inp">
              <input
                type="text"
                value={termVals[i]!.n}
                placeholder="…"
                disabled={disabled}
                onChange={(e) => setTermVal(i, 'n', e.target.value)}
                onKeyDown={handleKey}
              />
              <div className="frac-line" />
              <input
                type="text"
                value={termVals[i]!.d}
                placeholder="…"
                disabled={disabled}
                onChange={(e) => setTermVal(i, 'd', e.target.value)}
                onKeyDown={handleKey}
              />
            </span>
          </span>
        ))}
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={handleSubmit}
          style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}
        >
          OK
        </button>
      </span>

      <div
        className={finalFb.cls}
        style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 13, minHeight: 18 }}
        dangerouslySetInnerHTML={{ __html: finalFb.html }}
      />

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.1 }}>
          <div dangerouslySetInnerHTML={{ __html: exercise.steps }} />
        </div>
      </div>
    </div>
  );
}
