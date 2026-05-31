import { useRef, useState, type KeyboardEvent } from 'react';
import type { EquationDragDropExercise, EquationExercise } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function RichEq({ eq, redParts }: { eq: string; redParts?: string[] }) {
  if (!redParts?.length) return <>{eq}</>;
  type S = { text: string; red: boolean };
  let segs: S[] = [{ text: eq, red: false }];
  for (const rp of redParts) {
    const next: S[] = [];
    for (const seg of segs) {
      if (seg.red) { next.push(seg); continue; }
      const parts = seg.text.split(rp);
      parts.forEach((p, i) => {
        if (p) next.push({ text: p, red: false });
        if (i < parts.length - 1) next.push({ text: rp, red: true });
      });
    }
    segs = next;
  }
  return (
    <>
      {segs.map((s, i) =>
        s.red
          ? <span key={i} style={{ color: '#F87171', fontWeight: 700 }}>{s.text}</span>
          : <span key={i}>{s.text}</span>
      )}
    </>
  );
}

// ── Shared state/types ────────────────────────────────────────────────────────

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
}

type AnyEqExercise = EquationExercise | EquationDragDropExercise;

interface Props {
  index: number;
  exercise: AnyEqExercise;
  answer: AnswerState;
  onChange: (value: string) => void;
  onSubmit: (correct?: boolean) => void;
}

// ── Drag-drop variant ─────────────────────────────────────────────────────────

type DragSrc = { from: 'pool'; text: string } | { from: 'slot'; idx: number; text: string };

function EquationDragDrop({
  index,
  exercise,
  answer,
  onSubmit,
}: { index: number; exercise: EquationDragDropExercise; answer: AnswerState; onSubmit: (correct?: boolean) => void }) {
  const [placed, setPlaced] = useState<(string | null)[]>(() => Array(exercise.steps.length).fill(null));
  const [pool, setPool] = useState<string[]>(() => [...exercise.shuffled]);
  const [feedback, setFeedback] = useState<{ text: string; cls: string }>({ text: '', cls: 'feedback' });
  const dragSrc = useRef<DragSrc | null>(null);
  const disabled = answer.status !== 'pending';

  const dropToSlot = (toIdx: number) => {
    if (!dragSrc.current || disabled) return;
    const src = dragSrc.current;
    dragSrc.current = null;
    if (src.from === 'pool') {
      const existing = placed[toIdx];
      setPool((p) => existing ? [...p.filter((s) => s !== src.text), existing] : p.filter((s) => s !== src.text));
      setPlaced((prev) => prev.map((v, i) => i === toIdx ? src.text : v === src.text ? null : v));
    } else {
      if (src.idx === toIdx) return;
      setPlaced((prev) => {
        const next = [...prev];
        [next[src.idx], next[toIdx]] = [next[toIdx]!, next[src.idx]!];
        return next;
      });
    }
  };

  const dropToPool = () => {
    if (!dragSrc.current || disabled) return;
    const src = dragSrc.current;
    dragSrc.current = null;
    if (src.from === 'slot') {
      setPool((p) => [...p, src.text]);
      setPlaced((prev) => prev.map((v, i) => i === src.idx ? null : v));
    }
  };

  const handleSubmit = () => {
    if (disabled || placed.some((p) => p === null)) return;
    const correct = placed.every((p, i) => p === exercise.steps[i]);
    setFeedback(correct
      ? { text: '✓ Correct ! Les étapes sont dans le bon ordre.', cls: 'feedback ok' }
      : { text: '✗ L\'ordre n\'est pas correct. Regarde la correction ci-dessous.', cls: 'feedback ko' }
    );
    onSubmit(correct);
  };

  const statusClass = answer.status === 'correct' ? 'correct-card' : answer.status === 'wrong' || answer.status === 'revealed' ? 'wrong-card' : '';

  return (
    <div className={`eqcard ${exercise.eqCategory} ${statusClass}`}>
      <div className="eqcard-top">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <span className={`qtype-tag ${exercise.eqCategory}`}>{exercise.label}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>Glisser-déposer</span>
      </div>
      <div className="equation-display">{exercise.text}</div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Remets les étapes de résolution dans le bon ordre. Aucun calcul à effectuer.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {!disabled && (
          <div style={{ flex: '0 0 auto', minWidth: 200, maxWidth: 320 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Étapes à placer :</p>
            <div
              className="drag-pool"
              onDragOver={(e) => e.preventDefault()}
              onDrop={dropToPool}
            >
              {pool.map((step) => (
                <div
                  key={step}
                  className="drag-item"
                  draggable
                  onDragStart={() => { dragSrc.current = { from: 'pool', text: step }; }}
                >
                  {step}
                </div>
              ))}
              {pool.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--muted)', padding: 4 }}>Toutes les étapes sont placées</span>
              )}
            </div>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 240 }}>
          {disabled && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Ordre correct :</p>}
          <div className="drag-slots">
            {exercise.steps.map((correctStep, i) => {
              const content = disabled ? correctStep : placed[i];
              return (
                <div
                  key={i}
                  className="drag-slot"
                  onDragOver={(e) => { if (!disabled) e.preventDefault(); }}
                  onDrop={() => { if (!disabled) dropToSlot(i); }}
                >
                  <span className="drag-slot-num">{i + 1}.</span>
                  {content != null ? (
                    <div
                      className="drag-item drag-slot-item"
                      draggable={!disabled}
                      onDragStart={!disabled ? () => { dragSrc.current = { from: 'slot', idx: i, text: content }; } : undefined}
                    >
                      {content}
                    </div>
                  ) : (
                    <span className="drag-slot-empty">Glisse une étape ici…</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!disabled && (
        <button
          className="btn-secondary"
          onClick={handleSubmit}
          disabled={placed.some((p) => p === null)}
          style={{ marginTop: 12, padding: '8px 18px', fontSize: 13 }}
        >
          Vérifier l'ordre
        </button>
      )}
      <div className={feedback.cls} style={{ marginTop: 8 }}>{feedback.text}</div>
    </div>
  );
}

// ── Regular exercise variant ──────────────────────────────────────────────────

export function EquationQuestion({ index, exercise, answer, onChange, onSubmit }: Props) {
  const [hintOpen, setHintOpen] = useState(false);

  if (exercise.eqType === 'dd') {
    return <EquationDragDrop index={index} exercise={exercise} answer={answer} onSubmit={onSubmit} />;
  }

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
            <span className="step-eq"><RichEq eq={s.eq} redParts={s.redParts} /></span>
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
