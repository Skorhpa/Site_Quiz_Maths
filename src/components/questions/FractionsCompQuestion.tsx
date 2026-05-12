import { useState, type KeyboardEvent } from 'react';
import type { FractionsCompExercise } from '@/types';
import { factorsEqual, FRACTIONS_COMP_COLORS } from '@/lib/generators/fractions-comp';
import { fH, frEqual, frGcd, frIsSimplified, frSimplify } from '@/lib/generators/fractions';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

interface Props {
  index: number;
  exercise: FractionsCompExercise;
  answer: AnswerState;
  onSubmit: (correct?: boolean) => void;
}

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '',
  correct: 'correct-card',
  wrong: 'wrong-card',
  revealed: 'wrong-card',
};

export function FractionsCompQuestion({ index, exercise, answer, onSubmit }: Props) {
  const [signInput, setSignInput] = useState('');
  const [num, setNum] = useState('');
  const [den, setDen] = useState('');
  const [fnInput, setFnInput] = useState('');
  const [fdInput, setFdInput] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ html: string; cls: string }>({ html: '', cls: 'feedback' });

  const disabled = answer.status !== 'pending';
  const color = FRACTIONS_COMP_COLORS[exercise.subtype];

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (exercise.subtype === 'comp') {
      const v = signInput.trim();
      if (!v) return;
      const validSigns = ['<', '>', '='];
      if (!validSigns.includes(v)) {
        setFeedback({ html: '✗ Saisis uniquement < , > ou =', cls: 'feedback ko' });
        onSubmit(false);
        return;
      }
      if (v === exercise.sign) {
        setFeedback({ html: '✓ Correct !', cls: 'feedback ok' });
        onSubmit(true);
      } else {
        const label = exercise.sign === '=' ? 'Les deux fractions sont égales.' : exercise.sign === '<' ? 'La première fraction est plus petite.' : 'La première fraction est plus grande.';
        setFeedback({ html: `✗ Réponse : ${exercise.sign} &nbsp;(${label})`, cls: 'feedback ko' });
        onSubmit(false);
      }
      return;
    }
    if (exercise.subtype === 'simpl') {
      const vn = parseInt(num, 10);
      const vd = parseInt(den || '1', 10);
      if (Number.isNaN(vn)) return;
      const ans = exercise.ans!;
      if (frEqual(vn, vd, ans.n, ans.d)) {
        if (frIsSimplified(vn, vd)) {
          setFeedback({ html: '✓ Correct !', cls: 'feedback ok' });
        } else {
          const ss = frSimplify(vn, vd);
          setFeedback({ html: `✓ Correct, mais pas entièrement simplifié. Forme finale : ${fH(ss.n, ss.d, 'var(--correct)')}`, cls: 'feedback ok' });
        }
        onSubmit(true);
      } else {
        const s = frSimplify(ans.n, ans.d);
        setFeedback({
          html: `✗ Réponse : ${fH(s.n, s.d, 'var(--wrong)')} &nbsp;(PGCD = ${frGcd(exercise.n!, exercise.d!)})`,
          cls: 'feedback ko',
        });
        onSubmit(false);
      }
      return;
    }
    // prime
    const fnV = fnInput.trim();
    const fdV = fdInput.trim();
    const vn = parseInt(num, 10);
    const vd = parseInt(den || '1', 10);
    if (!fnV || !fdV || Number.isNaN(vn)) return;
    const fnOk = factorsEqual(fnV, exercise.fnStr!);
    const fdOk = factorsEqual(fdV, exercise.fdStr!);
    const finalOk = frEqual(vn, Number.isNaN(vd) ? 1 : vd, exercise.ans!.n, exercise.ans!.d);
    const s = frSimplify(exercise.ans!.n, exercise.ans!.d);
    if (fnOk && fdOk && finalOk) {
      setFeedback({ html: '✓ Tout est correct !', cls: 'feedback ok' });
      onSubmit(true);
    } else {
      const parts: string[] = [];
      if (!fnOk) parts.push(`décomposition du numérateur incorrecte (attendu : ${exercise.fnStr})`);
      if (!fdOk) parts.push(`décomposition du dénominateur incorrecte (attendu : ${exercise.fdStr})`);
      if (fnOk && fdOk && !finalOk) parts.push(`simplification finale incorrecte (attendu : ${fH(s.n, s.d)})`);
      setFeedback({ html: `✗ Erreur(s) : ${parts.join(' · ')}`, cls: 'feedback ko' });
      onSubmit(false);
    }
  };

  const finalFb = (() => {
    if (answer.status === 'revealed') {
      if (exercise.subtype === 'comp') {
        return { html: `Réponse : ${fH(exercise.a!, exercise.b!)} ${exercise.sign} ${fH(exercise.c!, exercise.d!)}`, cls: 'feedback ko' };
      }
      const s = frSimplify(exercise.ans!.n, exercise.ans!.d);
      return { html: `Réponse : ${fH(s.n, s.d, 'var(--muted)')}`, cls: 'feedback ko' };
    }
    return feedback;
  })();

  const corrDisplay = exercise.subtype === 'comp'
    ? `<div style="margin-top:6px;font-family:'DM Mono',monospace;"><strong style="color:var(--correct);">${fH(exercise.a!, exercise.b!)} ${exercise.sign} ${fH(exercise.c!, exercise.d!)}</strong></div>`
    : (() => {
        const s = frSimplify(exercise.ans!.n, exercise.ans!.d);
        return `<div style="margin-top:6px;"><strong style="color:var(--correct);">${fH(s.n, s.d)}</strong></div>`;
      })();

  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: `${color}22`,
    color,
  };

  const fracInpStyles: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    fontWeight: 700,
    padding: '4px 6px',
    borderRadius: 6,
    border: '1px solid var(--border2)',
    background: 'var(--bg)',
    color: 'var(--text)',
    textAlign: 'center',
  };

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>{exercise.label}</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      {exercise.subtype === 'comp' && (
        <>
          <div style={{ fontSize: 14, color: 'var(--text)' }}>Complète par &lt; ou &gt; ou = :</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', margin: '12px 0' }}>
            <div style={{ fontSize: '1.5rem' }} dangerouslySetInnerHTML={{ __html: fH(exercise.a!, exercise.b!) }} />
            <select
              value={signInput}
              disabled={disabled}
              onChange={(e) => setSignInput(e.target.value)}
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                textAlign: 'center',
                padding: '4px 8px',
                borderRadius: 8,
                border: '1px solid var(--border2)',
                background: 'var(--bg)',
                color: signInput ? 'var(--text)' : 'var(--muted)',
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              <option value="">?</option>
              <option value="<">&lt;</option>
              <option value=">">&gt;</option>
              <option value="=">=</option>
            </select>
            <div style={{ fontSize: '1.5rem' }} dangerouslySetInnerHTML={{ __html: fH(exercise.c!, exercise.d!) }} />
          </div>
        </>
      )}

      {exercise.subtype === 'simpl' && (
        <>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>
            Simplifie la fraction suivante (méthode au choix) :
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', margin: '8px 0' }}>
            <div style={{ fontSize: '1.6rem' }} dangerouslySetInnerHTML={{ __html: fH(exercise.n!, exercise.d!) }} />
            <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>=</span>
            <span className="frac-inp">
              <input type="text" value={num} placeholder="…" disabled={disabled} onChange={(e) => setNum(e.target.value)} onKeyDown={handleKey} />
              <div className="frac-line" />
              <input type="text" value={den} placeholder="…" disabled={disabled} onChange={(e) => setDen(e.target.value)} onKeyDown={handleKey} />
            </span>
          </div>
        </>
      )}

      {exercise.subtype === 'prime' && (
        <>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>
            Décompose le numérateur et le dénominateur en facteurs premiers, puis simplifie :
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, margin: '10px 0', lineHeight: 2.8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <span dangerouslySetInnerHTML={{ __html: fH(exercise.n!, exercise.d!) }} />
            <span>=</span>
            <span className="frac-inp">
              <input type="text" value={fnInput} placeholder="… × … × …" disabled={disabled} onChange={(e) => setFnInput(e.target.value)} onKeyDown={handleKey} style={{ ...fracInpStyles, width: 110 }} />
              <div className="frac-line" style={{ width: 110 }} />
              <input type="text" value={fdInput} placeholder="… × … × …" disabled={disabled} onChange={(e) => setFdInput(e.target.value)} onKeyDown={handleKey} style={{ ...fracInpStyles, width: 110 }} />
            </span>
            <span style={{ fontSize: '1.2rem', color: 'var(--muted)', margin: '0 8px' }}>=</span>
            <span className="frac-inp">
              <input type="text" value={num} placeholder="…" disabled={disabled} onChange={(e) => setNum(e.target.value)} onKeyDown={handleKey} />
              <div className="frac-line" />
              <input type="text" value={den} placeholder="…" disabled={disabled} onChange={(e) => setDen(e.target.value)} onKeyDown={handleKey} />
            </span>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={handleSubmit}
          style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}
        >
          OK
        </button>
      </div>

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
          <div style={{ color: 'var(--muted)' }} dangerouslySetInnerHTML={{ __html: exercise.steps }} />
          <div dangerouslySetInnerHTML={{ __html: corrDisplay }} />
        </div>
      </div>
    </div>
  );
}
