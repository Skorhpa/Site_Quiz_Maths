import { useState } from 'react';
import type { ProgrammeExercise } from '@/types';
import { literalCheckAnswer, literalNormalize } from '@/lib/generators/literal';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface ProgrammeQuestionProps {
  index: number;
  exercise: ProgrammeExercise;
  answer: AnswerState;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

const ACCENT = '#38BDF8'; // var(--c8)

const disp = (n: number) => (n < 0 ? `(${n})` : n === 0 ? '0' : `${n}`);

// Evaluates a literal expression by substituting `x` with a numeric value.
// Used to detect "equivalent but not reduced" answers (matches original prog behavior).
function evalExpr(expr: string, xv: number): number | null {
  try {
    const sanitized = literalNormalize(expr)
      .replace(/\^/g, '**')
      .replace(/([0-9])([a-z])/g, '$1*$2')
      .replace(/([a-z])\^2/g, '($1**2)')
      .replace(/[xyzat]/g, `(${xv})`);
    // eslint-disable-next-line no-new-func
    return Function('"use strict";return (' + sanitized + ')')();
  } catch {
    return null;
  }
}

export function ProgrammeQuestion({ index, exercise, answer, onSubmit }: ProgrammeQuestionProps) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; cls: string; warn?: boolean }>({ text: '', cls: 'feedback' });

  const disabled = answer.status !== 'pending';

  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: 'rgba(56,189,248,0.12)',
    color: ACCENT,
  };
  const inputStyle: React.CSSProperties = { borderColor: ACCENT };

  const handleSubmit = () => {
    if (disabled) return;
    const va = parseFloat(a.replace(',', '.'));
    const vb = parseFloat(b.replace(',', '.'));
    const vc = c.trim();
    if (Number.isNaN(va) || Number.isNaN(vb) || !vc) {
      setFeedback({ text: 'Remplis toutes les cases.', cls: 'feedback ko' });
      return;
    }
    const okA = Math.abs(va - exercise.ansA) < 0.01;
    const okB = Math.abs(vb - exercise.ansB) < 0.01;
    const okC = literalCheckAnswer(vc, exercise.ansC);

    // "Equivalent but not reduced" warning: c) evaluates to same value but isn't matching string
    const isEquivNotReduced =
      !okC &&
      (() => {
        const e1 = evalExpr(vc, 2);
        const e2 = evalExpr(vc, 3);
        const e3 = evalExpr(vc, -1);
        const t1 = evalExpr(exercise.ansC, 2);
        const t2 = evalExpr(exercise.ansC, 3);
        const t3 = evalExpr(exercise.ansC, -1);
        return (
          e1 !== null && t1 !== null && Math.abs(e1 - t1) < 0.01 &&
          e2 !== null && t2 !== null && Math.abs(e2 - t2) < 0.01 &&
          e3 !== null && t3 !== null && Math.abs(e3 - t3) < 0.01
        );
      })();

    if (isEquivNotReduced) {
      setFeedback({
        text: '⚠ Ton expression est correcte mais pas réduite. Réduis-la davantage.',
        cls: 'feedback ko',
        warn: true,
      });
      return;
    }

    const allOk = okA && okB && okC;
    if (allOk) {
      setFeedback({ text: '✓ Tout est correct !', cls: 'feedback ok' });
      onSubmit(true);
    } else {
      const parts: string[] = [];
      if (!okA) parts.push(`a) ${exercise.ansA}`);
      if (!okB) parts.push(`b) ${exercise.ansB}`);
      if (!okC) parts.push(`c) ${exercise.ansC}`);
      setFeedback({ text: `✗ Réponses : ${parts.join('  ·  ')}`, cls: 'feedback ko' });
      onSubmit(false);
    }
  };

  const finalFeedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Tout est correct !', cls: 'feedback ok', warn: false };
    if (answer.status === 'wrong') return feedback;
    if (answer.status === 'revealed')
      return {
        text: `Réponses : a) ${exercise.ansA}  ·  b) ${exercise.ansB}  ·  c) ${exercise.ansC}`,
        cls: 'feedback ko',
        warn: false,
      };
    return feedback;
  })();

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${ACCENT}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>Programme</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="prog-box">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {exercise.instr.map((s, j) => (
            <li
              key={j}
              style={{ color: 'var(--muted)', margin: '4px 0' }}
              dangerouslySetInnerHTML={{ __html: s }}
            />
          ))}
        </ul>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text)', margin: '12px 0 6px', fontWeight: 600 }}>
        a) Applique le programme pour x = {exercise.val1}
      </div>
      <input
        type="text"
        className="lit-inp"
        value={a}
        placeholder="Résultat numérique…"
        inputMode="numeric"
        disabled={disabled}
        onChange={(e) => setA(e.target.value)}
        style={inputStyle}
      />

      <div style={{ fontSize: 13, color: 'var(--text)', margin: '12px 0 6px', fontWeight: 600 }}>
        b) Applique le programme pour x = {disp(exercise.val2)}
      </div>
      <input
        type="text"
        className="lit-inp"
        value={b}
        placeholder="Résultat numérique…"
        inputMode="numeric"
        disabled={disabled}
        onChange={(e) => setB(e.target.value)}
        style={inputStyle}
      />

      <div style={{ fontSize: 13, color: 'var(--text)', margin: '12px 0 6px', fontWeight: 600 }}>
        c) Traduis le programme pour un nombre x et réduis l'expression
      </div>
      <input
        type="text"
        className="lit-inp"
        value={c}
        placeholder="Expression réduite…"
        disabled={disabled}
        onChange={(e) => setC(e.target.value)}
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

      <div
        className={finalFeedback.cls}
        style={{
          marginTop: 8,
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          minHeight: 18,
          color: finalFeedback.warn ? '#FCD34D' : undefined,
        }}
      >
        {finalFeedback.text}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="hint-toggle"
          onClick={() => setHintOpen((v) => !v)}
          style={{ color: ACCENT }}
        >
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>a) Pour x = {exercise.val1} :</div>
          <div dangerouslySetInnerHTML={{ __html: exercise.stepsA }} />
          <div style={{ fontWeight: 600, color: 'var(--text)', margin: '10px 0 6px' }}>b) Pour x = {disp(exercise.val2)} :</div>
          <div dangerouslySetInnerHTML={{ __html: exercise.stepsB }} />
          <div style={{ fontWeight: 600, color: 'var(--text)', margin: '10px 0 6px' }}>c) Expression algébrique :</div>
          <div dangerouslySetInnerHTML={{ __html: exercise.stepsC }} />
          {exercise.obs && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 12px',
                background: 'rgba(56,189,248,0.08)',
                borderRadius: 8,
                fontSize: 12,
              }}
              dangerouslySetInnerHTML={{ __html: exercise.obs }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
