import { useRef, useState, type KeyboardEvent } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type StepKind = 'quotient-digit' | 'product' | 'partial-rem' | 'final-rem';

type StepDef =
  | { type: 'calc'; text: string; answer: number; kind: StepKind; note?: string; sep?: boolean }
  | { type: 'info'; text: string };

interface DivEx {
  title: string;
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  steps: StepDef[];
}

// ── Exercises ─────────────────────────────────────────────────────────────────

const EXERCISES: DivEx[] = [
  {
    title: 'Exercice 1 — Facile',
    dividend: 95,
    divisor: 5,
    quotient: 19,
    remainder: 0,
    steps: [
      { type: 'calc', text: '9 ÷ 5 ≈ ', answer: 1, kind: 'quotient-digit', note: '1er chiffre du quotient' },
      { type: 'calc', text: '1 × 5 = ', answer: 5, kind: 'product' },
      { type: 'calc', text: '9 − 5 = ', answer: 4, kind: 'partial-rem', note: 'reste partiel', sep: true },
      { type: 'info', text: '↓ On abaisse le 5 : on forme 45' },
      { type: 'calc', text: '45 ÷ 5 = ', answer: 9, kind: 'quotient-digit', note: '2e chiffre du quotient' },
      { type: 'calc', text: '9 × 5 = ', answer: 45, kind: 'product' },
      { type: 'calc', text: '45 − 45 = ', answer: 0, kind: 'final-rem', note: 'reste de la division' },
    ],
  },
  {
    title: 'Exercice 2 — Plus difficile',
    dividend: 347,
    divisor: 12,
    quotient: 28,
    remainder: 11,
    steps: [
      { type: 'calc', text: '34 ÷ 12 ≈ ', answer: 2, kind: 'quotient-digit', note: '1er chiffre du quotient' },
      { type: 'calc', text: '2 × 12 = ', answer: 24, kind: 'product' },
      { type: 'calc', text: '34 − 24 = ', answer: 10, kind: 'partial-rem', note: 'reste partiel', sep: true },
      { type: 'info', text: '↓ On abaisse le 7 : on forme 107' },
      { type: 'calc', text: '107 ÷ 12 ≈ ', answer: 8, kind: 'quotient-digit', note: '2e chiffre du quotient' },
      { type: 'calc', text: '8 × 12 = ', answer: 96, kind: 'product' },
      { type: 'calc', text: '107 − 96 = ', answer: 11, kind: 'final-rem', note: 'reste de la division' },
    ],
  },
];

// ── DivEuclidienne5eme ────────────────────────────────────────────────────────

export function DivEuclidienne5eme({
  accent,
  onBack,
}: {
  accent: string;
  onBack: () => void;
}) {
  const [exIdx, setExIdx] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ex = EXERCISES[exIdx]!;
  const quotientStr = String(ex.quotient);

  // How many quotient-digit steps are done
  const completedQuotientDigits = ex.steps
    .slice(0, completedCount)
    .filter((s): s is Extract<StepDef, { type: 'calc' }> => s.type === 'calc' && s.kind === 'quotient-digit')
    .length;

  // Advance past any info steps that follow
  const advancePast = (from: number) => {
    let i = from;
    while (i < ex.steps.length && ex.steps[i]?.type === 'info') i++;
    if (i >= ex.steps.length) {
      setDone(true);
    }
    setCompletedCount(i);
    setInputVal('');
    setError(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const validate = () => {
    const current = ex.steps[completedCount];
    if (!current || current.type !== 'calc') return;
    if (inputVal.trim() === '') return;
    const num = parseInt(inputVal.trim(), 10);
    if (!Number.isNaN(num) && num === current.answer) {
      advancePast(completedCount + 1);
    } else {
      setError(true);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') validate();
  };

  const nextExercise = () => {
    const next = exIdx + 1;
    if (next >= EXERCISES.length) {
      setAllDone(true);
    } else {
      setExIdx(next);
      setCompletedCount(0);
      setInputVal('');
      setError(false);
      setDone(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restart = () => {
    setExIdx(0);
    setCompletedCount(0);
    setInputVal('');
    setError(false);
    setDone(false);
    setAllDone(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const accentCol = { color: accent };

  // ── All done ───────────────────────────────────────────────────────────────
  if (allDone) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button type="button" className="btn-secondary" style={{ fontSize: 13 }} onClick={onBack}>
            ← Retour
          </button>
        </div>
        <div className="end-banner" style={{ border: `1px solid ${accent}` }}>
          <h2 style={accentCol}>Bravo ! 🎉</h2>
          <p>Tu as complété les {EXERCISES.length} divisions euclidiennes !</p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={onBack}>← Retour</button>
            <button className="btn-primary" style={{ background: accent }} onClick={restart}>
              Recommencer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = !done ? ex.steps[completedCount] : undefined;
  const completedSteps = ex.steps.slice(0, completedCount);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" style={{ fontSize: 13 }} onClick={onBack}>
          ← Retour
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{ex.title}</span>
      </div>

      {/* Division posée — schéma visuel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 0,
          marginBottom: '2rem',
          padding: '1.2rem 1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}
      >
        {/* Dividende */}
        <div style={{ ...mono, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>
          {ex.dividend}
        </div>

        {/* Barre verticale */}
        <div
          style={{
            width: 2,
            background: 'var(--text)',
            margin: '0 14px',
            alignSelf: 'stretch',
            minHeight: '3.5rem',
          }}
        />

        {/* Diviseur + trait + quotient */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ ...mono, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>
            {ex.divisor}
          </div>
          <div
            style={{
              borderTop: '2px solid var(--text)',
              paddingTop: 6,
              display: 'flex',
              gap: 2,
              ...mono,
              fontSize: '1.8rem',
              fontWeight: 700,
              minWidth: `${quotientStr.length}ch`,
            }}
          >
            {quotientStr.split('').map((digit, i) => (
              <span
                key={i}
                style={{
                  color: i < completedQuotientDigits ? accent : 'var(--border)',
                  transition: 'color 0.3s',
                }}
              >
                {i < completedQuotientDigits ? digit : '?'}
              </span>
            ))}
            {done && (
              <span style={{ marginLeft: 12, color: 'var(--muted)', fontSize: '0.9rem', alignSelf: 'flex-end', paddingBottom: 4 }}>
                reste {ex.remainder}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Étapes complétées */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        {completedSteps.length === 0 && !done && (
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '12px 16px', margin: 0 }}>
            Les étapes s'affichent ici au fur et à mesure
          </p>
        )}

        {completedSteps.map((step, i) => {
          const isInfo = step.type === 'info';
          const showSep = step.type === 'calc' && step.sep;
          return (
            <div key={i}>
              <div
                style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  background: isInfo ? 'var(--surface2)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {isInfo ? (
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                    {step.text}
                  </span>
                ) : (
                  <>
                    <span style={{ color: 'var(--correct)', fontWeight: 700, fontSize: 13 }}>✓</span>
                    <span style={{ ...mono, fontSize: 15, color: 'var(--muted)' }}>
                      {step.text}
                      <strong style={{ color: 'var(--text)' }}>{step.answer}</strong>
                    </span>
                    {step.note && (
                      <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>
                        — {step.note}
                      </span>
                    )}
                  </>
                )}
              </div>
              {showSep && (
                <div style={{ height: 2, background: 'var(--border2)', margin: '0' }} />
              )}
            </div>
          );
        })}

        {/* Étape courante */}
        {currentStep && currentStep.type === 'calc' && (
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: `${accent}08` }}>
            <span style={{ ...mono, fontSize: 16, fontWeight: 600, color: accent }}>
              {currentStep.text}
            </span>
            <input
              ref={inputRef}
              type="number"
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setError(false); }}
              onKeyDown={handleKey}
              style={{
                width: 80,
                ...mono,
                fontSize: 16,
                fontWeight: 700,
                textAlign: 'center',
                padding: '6px 10px',
                borderRadius: 8,
                border: `1px solid ${error ? 'var(--wrong)' : 'var(--border2)'}`,
                background: 'var(--bg)',
                color: 'var(--text)',
              }}
            />
            <button
              className="btn-secondary"
              onClick={validate}
              style={{ padding: '7px 16px', fontSize: 13 }}
            >
              Valider
            </button>
            {currentStep.note && (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>— {currentStep.note}</span>
            )}
            {error && (
              <span style={{ color: 'var(--wrong)', fontSize: 13, fontWeight: 700 }}>✗ Essaie encore</span>
            )}
          </div>
        )}
      </div>

      {/* Résultat final */}
      {done && (
        <div className="end-banner" style={{ border: `1px solid ${accent}` }}>
          <p style={{ ...mono, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            {ex.dividend} = {ex.divisor} × {ex.quotient} + {ex.remainder}
          </p>
          <p style={{ color: 'var(--correct)', fontWeight: 700, marginBottom: 20 }}>
            ✓ Division euclidienne complétée !
          </p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={onBack}>← Retour</button>
            <button
              className="btn-primary"
              style={{ background: accent }}
              onClick={nextExercise}
            >
              {exIdx + 1 < EXERCISES.length ? 'Exercice suivant →' : 'Voir le bilan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
