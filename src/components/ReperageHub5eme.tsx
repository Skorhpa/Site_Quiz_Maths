import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Candidate {
  label: string;
  isCorrect: boolean;
  hint: string;
}

interface Step {
  expression: string;
  candidates: Candidate[];
}

interface Exercise {
  steps: Step[];
  result: number;
}

// ── Exercises ─────────────────────────────────────────────────────────────────

const EXERCISES: Exercise[] = [
  {
    // 8 + 3 × 4 − 2 = 18
    steps: [
      {
        expression: '8 + 3 × 4 − 2',
        candidates: [
          { label: '8 + 3', isCorrect: false, hint: '× est prioritaire sur +' },
          { label: '3 × 4', isCorrect: true, hint: '' },
          { label: '4 − 2', isCorrect: false, hint: '× est prioritaire sur −' },
        ],
      },
      {
        expression: '8 + 12 − 2',
        candidates: [
          { label: '8 + 12', isCorrect: true, hint: '' },
          { label: '12 − 2', isCorrect: false, hint: 'On calcule de gauche à droite' },
        ],
      },
      { expression: '20 − 2', candidates: [{ label: '20 − 2', isCorrect: true, hint: '' }] },
    ],
    result: 18,
  },
  {
    // (7 − 3) × 5 + 2 = 22
    steps: [
      {
        expression: '(7 − 3) × 5 + 2',
        candidates: [
          { label: '(7 − 3)', isCorrect: true, hint: '' },
          { label: '5 + 2', isCorrect: false, hint: "On calcule d'abord ce qui est entre parenthèses" },
        ],
      },
      {
        expression: '4 × 5 + 2',
        candidates: [
          { label: '4 × 5', isCorrect: true, hint: '' },
          { label: '5 + 2', isCorrect: false, hint: '× est prioritaire sur +' },
        ],
      },
      { expression: '20 + 2', candidates: [{ label: '20 + 2', isCorrect: true, hint: '' }] },
    ],
    result: 22,
  },
  {
    // 6 × 2 + (10 − 4) ÷ 2 = 15
    steps: [
      {
        expression: '6 × 2 + (10 − 4) ÷ 2',
        candidates: [
          { label: '6 × 2', isCorrect: false, hint: "On calcule d'abord ce qui est entre parenthèses" },
          { label: '(10 − 4)', isCorrect: true, hint: '' },
          { label: '4 ÷ 2', isCorrect: false, hint: "On calcule d'abord ce qui est entre parenthèses" },
        ],
      },
      {
        expression: '6 × 2 + 6 ÷ 2',
        candidates: [
          { label: '6 × 2', isCorrect: true, hint: '' },
          { label: '6 ÷ 2', isCorrect: false, hint: '× et ÷ ont la même priorité : on calcule de gauche à droite' },
          { label: '2 + 6', isCorrect: false, hint: '× est prioritaire sur +' },
        ],
      },
      {
        expression: '12 + 6 ÷ 2',
        candidates: [
          { label: '12 + 6', isCorrect: false, hint: '÷ est prioritaire sur +' },
          { label: '6 ÷ 2', isCorrect: true, hint: '' },
        ],
      },
      { expression: '12 + 3', candidates: [{ label: '12 + 3', isCorrect: true, hint: '' }] },
    ],
    result: 15,
  },
  {
    // [3 + (5 × 2)] − 4 = 9
    steps: [
      {
        expression: '[3 + (5 × 2)] − 4',
        candidates: [
          { label: '3 + 5', isCorrect: false, hint: "On calcule d'abord les parenthèses les plus intérieures" },
          { label: '(5 × 2)', isCorrect: true, hint: '' },
          { label: '2 − 4', isCorrect: false, hint: "On calcule d'abord les parenthèses les plus intérieures" },
        ],
      },
      {
        expression: '[3 + 10] − 4',
        candidates: [
          { label: '[3 + 10]', isCorrect: true, hint: '' },
          { label: '10 − 4', isCorrect: false, hint: "On calcule d'abord ce qui est entre crochets" },
        ],
      },
      { expression: '13 − 4', candidates: [{ label: '13 − 4', isCorrect: true, hint: '' }] },
    ],
    result: 9,
  },
  {
    // 20 ÷ (2 + 3) × 4 − 1 = 15
    steps: [
      {
        expression: '20 ÷ (2 + 3) × 4 − 1',
        candidates: [
          { label: '20 ÷ 2', isCorrect: false, hint: "On calcule d'abord ce qui est entre parenthèses" },
          { label: '(2 + 3)', isCorrect: true, hint: '' },
          { label: '3 × 4', isCorrect: false, hint: "On calcule d'abord ce qui est entre parenthèses" },
          { label: '4 − 1', isCorrect: false, hint: "On calcule d'abord ce qui est entre parenthèses" },
        ],
      },
      {
        expression: '20 ÷ 5 × 4 − 1',
        candidates: [
          { label: '20 ÷ 5', isCorrect: true, hint: '' },
          { label: '5 × 4', isCorrect: false, hint: '÷ et × ont la même priorité : on calcule de gauche à droite' },
          { label: '4 − 1', isCorrect: false, hint: '÷ est prioritaire sur −' },
        ],
      },
      {
        expression: '4 × 4 − 1',
        candidates: [
          { label: '4 × 4', isCorrect: true, hint: '' },
          { label: '4 − 1', isCorrect: false, hint: '× est prioritaire sur −' },
        ],
      },
      { expression: '16 − 1', candidates: [{ label: '16 − 1', isCorrect: true, hint: '' }] },
    ],
    result: 15,
  },
];

// ── VideoLink ─────────────────────────────────────────────────────────────────

function VideoLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 8,
        background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.25)',
        color: '#f87171', fontSize: 13, textDecoration: 'none',
        fontWeight: 600, marginTop: 6, marginRight: 8,
      }}
    >
      ▶ {label}
    </a>
  );
}

// ── Recall ────────────────────────────────────────────────────────────────────

function RecallPriorites({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel — règles des priorités opératoires
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <p style={{ marginTop: 12, marginBottom: 4 }}>
          <strong>Règle n°1 :</strong> Lorsqu'il n'y a que des additions et des soustractions, on effectue les calculs de la <strong>gauche vers la droite</strong>.
        </p>
        <p style={{ marginTop: 0, marginBottom: 4 }}>
          <strong>Règle n°2 :</strong> Lorsqu'il n'y a que des multiplications et des divisions, on effectue les calculs de la <strong>gauche vers la droite</strong>.
        </p>
        <p style={{ marginTop: 0, marginBottom: 4 }}>
          <strong>Règle n°3 :</strong> La <strong>multiplication et la division</strong> sont prioritaires devant l'addition et la soustraction.
        </p>
        <p style={{ marginTop: 0, marginBottom: 8 }}>
          <strong>Règle n°4 :</strong> On commence par effectuer les calculs <strong>entre parenthèses</strong>. S'il y a plusieurs parenthèses, on commence par les parenthèses les plus à l'intérieur.
        </p>
        <div style={{ marginBottom: 14 }}>
          <VideoLink url="https://youtu.be/idB0-F7b1Yk" label="Calcul sans parenthèse et sans priorité" />
          <VideoLink url="https://youtu.be/TJH-fiwAt5s" label="Calcul sans parenthèse et avec priorité" />
          <VideoLink url="https://youtu.be/kNOR38ZuBRc" label="Expression avec des parenthèses" />
          <VideoLink url="https://youtu.be/fCDe27qL4Ko" label="Expression avec des parenthèses doubles" />
        </div>
      </div>
    </div>
  );
}

// ── ReperageHub5eme ───────────────────────────────────────────────────────────

export function ReperageHub5eme({
  accent,
  onBack,
}: {
  accent: string;
  onBack: () => void;
}) {
  const [exIdx, setExIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [wrongHint, setWrongHint] = useState<string | null>(null);
  const [wrongLabel, setWrongLabel] = useState<string | null>(null);
  const [correctLabel, setCorrectLabel] = useState<string | null>(null);
  const [exDone, setExDone] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const exercise = EXERCISES[exIdx]!;
  const step = exercise.steps[stepIdx]!;
  const isLocked = correctLabel !== null;

  const handleClick = (c: Candidate) => {
    if (isLocked || exDone) return;
    if (c.isCorrect) {
      setWrongHint(null);
      setWrongLabel(null);
      setCorrectLabel(c.label);
      setTimeout(() => {
        setCorrectLabel(null);
        const next = stepIdx + 1;
        if (next >= exercise.steps.length) {
          setExDone(true);
        } else {
          setStepIdx(next);
          setWrongHint(null);
          setWrongLabel(null);
        }
      }, 600);
    } else {
      setWrongLabel(c.label);
      setWrongHint(c.hint);
    }
  };

  const nextExercise = () => {
    const next = exIdx + 1;
    if (next >= EXERCISES.length) {
      setAllDone(true);
    } else {
      setExIdx(next);
      setStepIdx(0);
      setExDone(false);
      setWrongHint(null);
      setWrongLabel(null);
      setCorrectLabel(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restart = () => {
    setExIdx(0);
    setStepIdx(0);
    setExDone(false);
    setAllDone(false);
    setWrongHint(null);
    setWrongLabel(null);
    setCorrectLabel(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <h2 style={{ color: accent }}>Bravo ! 🎉</h2>
          <p>Tu as terminé les {EXERCISES.length} exercices de repérage !</p>
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

  // ── Playing ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <button type="button" className="btn-secondary" style={{ fontSize: 13 }} onClick={onBack}>
          ← Retour
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>
          Exercice {exIdx + 1} / {EXERCISES.length}
        </span>
      </div>

      <RecallPriorites accent={accent} />

      {/* Expression */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 'clamp(1.3rem, 4vw, 1.9rem)',
          fontWeight: 700,
          textAlign: 'center',
          padding: '1.5rem 1rem',
          background: 'var(--surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          letterSpacing: '0.05em',
          color: exDone ? accent : 'var(--text)',
        }}
      >
        {exDone ? String(exercise.result) : step.expression}
      </div>

      {/* Exercise done */}
      {exDone ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--correct)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
            ✓ Résultat : {exercise.result}
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ background: accent, fontSize: 15 }}
            onClick={nextExercise}
          >
            {exIdx + 1 < EXERCISES.length ? 'Exercice suivant →' : 'Voir le bilan'}
          </button>
        </div>
      ) : (
        <>
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 14 }}>
            Clique sur l'opération à effectuer en premier
          </p>

          {/* Candidates */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
            {step.candidates.map((c) => {
              const isCorrectFlash = correctLabel === c.label;
              const isWrongFlash = wrongLabel === c.label;
              return (
                <button
                  key={c.label}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleClick(c)}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    padding: '14px 24px',
                    borderRadius: 10,
                    border: `2px solid ${isCorrectFlash ? 'var(--correct)' : isWrongFlash ? 'var(--wrong)' : accent}`,
                    background: isCorrectFlash
                      ? 'rgba(74,222,128,0.15)'
                      : isWrongFlash
                        ? 'rgba(248,113,113,0.12)'
                        : 'var(--surface)',
                    color: isCorrectFlash
                      ? 'var(--correct)'
                      : isWrongFlash
                        ? 'var(--wrong)'
                        : 'var(--text)',
                    cursor: isLocked ? 'default' : 'pointer',
                    transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Wrong hint */}
          {wrongHint && (
            <p style={{
              textAlign: 'center',
              color: 'var(--wrong)',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'DM Mono', monospace",
            }}>
              ✗ {wrongHint}
            </p>
          )}
        </>
      )}
    </div>
  );
}
