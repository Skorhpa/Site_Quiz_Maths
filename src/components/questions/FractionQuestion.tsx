import { useState, type KeyboardEvent } from 'react';
import type { FractionExercise } from '@/types';
import { frEqual, frIsSimplified, frSimplify, FRACTIONS_OP_COLORS } from '@/lib/generators/fractions';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface Props {
  index: number;
  exercise: FractionExercise;
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

export function FractionQuestion({ index, exercise, answer, onSubmit }: Props) {
  const [num, setNum] = useState('');
  const [den, setDen] = useState('');
  const [intVal, setIntVal] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ html: string; cls: string }>({ html: '', cls: 'feedback' });

  const disabled = answer.status !== 'pending';
  const color = exercise.accentOverride ?? FRACTIONS_OP_COLORS[exercise.op];

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (exercise.isInteger) {
      const v = parseInt(intVal, 10);
      if (Number.isNaN(v)) return;
      const s = frSimplify(exercise.ans.n, exercise.ans.d);
      const ok = v === s.n;
      if (ok) setFeedback({ html: '✓ Correct !', cls: 'feedback ok' });
      else setFeedback({ html: `✗ Réponse : ${s.n}`, cls: 'feedback ko' });
      onSubmit(ok);
      return;
    }
    const vn = parseInt(num, 10);
    const vd = parseInt(den || '1', 10);
    if (Number.isNaN(vn)) return;
    const effD = Number.isNaN(vd) || vd === 0 ? 1 : vd;
    const { n: an, d: ad } = exercise.ans;
    if (frEqual(vn, effD, an, ad)) {
      if (frIsSimplified(vn, effD) || effD === 1) {
        setFeedback({ html: '✓ Correct !', cls: 'feedback ok' });
      } else {
        const s = frSimplify(vn, effD);
        const disp = s.d === 1 ? `${s.n}` : fH(s.n, s.d, 'var(--correct)');
        setFeedback({ html: `✓ Correct, mais pense à simplifier : ${disp}`, cls: 'feedback ok' });
      }
      onSubmit(true);
    } else {
      const s = frSimplify(an, ad);
      const disp = s.d === 1 ? `${s.n}` : fH(s.n, s.d, 'var(--wrong)');
      setFeedback({ html: `✗ Réponse : ${disp}`, cls: 'feedback ko' });
      onSubmit(false);
    }
  };

  const finalFb = (() => {
    if (answer.status === 'revealed') {
      const s = frSimplify(exercise.ans.n, exercise.ans.d);
      const disp = exercise.isInteger ? `${s.n}` : fH(s.n, s.d, 'var(--muted)');
      return { html: `Réponse : ${disp}`, cls: 'feedback ko' };
    }
    return feedback;
  })();

  // Build the "ans display" inside the steps box
  const s = frSimplify(exercise.ans.n, exercise.ans.d);
  const ansDisplayHtml = exercise.isInteger
    ? `<div style="color:var(--correct);font-weight:700;margin-top:6px;">= ${s.n}</div>`
    : s.d === 1
      ? `<div style="margin-top:6px;">${fH(exercise.ans.n, exercise.ans.d, 'var(--muted)')} = ${fH(s.n, s.d, 'var(--c6)')} = <strong style="color:var(--correct);">${s.n}</strong> <span style="color:var(--muted);font-size:12px;">(dénominateur 1 → entier)</span></div>`
      : frIsSimplified(exercise.ans.n, exercise.ans.d)
        ? `<div style="color:var(--correct);font-weight:700;margin-top:6px;">= ${fH(exercise.ans.n, exercise.ans.d, 'var(--correct)')}</div>`
        : `<div style="margin-top:6px;">${fH(exercise.ans.n, exercise.ans.d, 'var(--muted)')} = ${fH(s.n, s.d, 'var(--correct)')} <span style="color:var(--muted);font-size:12px;">(forme simplifiée)</span></div>`;

  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: `${color}22`,
    color,
  };

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{exercise.label}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div
        style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text)', marginBottom: 4 }}
        dangerouslySetInnerHTML={{ __html: `${exercise.expr} =` }}
      />

      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--muted)', fontSize: 14 }}>= </span>
        {exercise.isInteger ? (
          <input
            type="text"
            value={intVal}
            placeholder="?"
            disabled={disabled}
            onChange={(e) => setIntVal(e.target.value)}
            onKeyDown={handleKey}
            style={{
              width: 80,
              fontFamily: "'DM Mono', monospace",
              fontSize: 16,
              fontWeight: 700,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid var(--border2)',
              background: 'var(--bg)',
              color: 'var(--text)',
              textAlign: 'center',
            }}
          />
        ) : (
          <span className="frac-inp">
            <input
              type="text"
              value={num}
              placeholder="…"
              disabled={disabled}
              onChange={(e) => setNum(e.target.value)}
              onKeyDown={handleKey}
            />
            <div className="frac-line" />
            <input
              type="text"
              value={den}
              placeholder="…"
              disabled={disabled}
              onChange={(e) => setDen(e.target.value)}
              onKeyDown={handleKey}
            />
          </span>
        )}
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
          <div
            style={{ color: 'var(--muted)' }}
            dangerouslySetInnerHTML={{ __html: exercise.steps }}
          />
          <div dangerouslySetInnerHTML={{ __html: ansDisplayHtml }} />
        </div>
      </div>
    </div>
  );
}
