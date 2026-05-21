import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { EntiersTrouExercise, EntiersSigneExercise, NumberExercise } from '@/types';
import { generateCalcsSeries, generateComplexSeries, generateSigneSeries } from '@/lib/generators/entiers-hub';
import { NumberQuestion } from './NumberQuestion';

type HubMode = 'select' | 'calculs' | 'complex' | 'signes';
type HubExercise = NumberExercise | EntiersTrouExercise | EntiersSigneExercise;

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
  wrongParens?: boolean;
}

const emptyAnswer = (): AnswerState => ({ value: '', status: 'pending', resetKey: 0 });
const buildAnswers = (n: number) => Array.from({ length: n }, emptyAnswer);

function endTitle(pct: number) {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

// ── EntiersTrouQuestion ──────────────────────────────────────────────────────

const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '', correct: 'correct-card', wrong: 'wrong-card', revealed: 'wrong-card',
};

function EntiersTrouQuestion({
  index, exercise, answer, accent, onChange, onSubmit,
}: {
  index: number;
  exercise: EntiersTrouExercise;
  answer: AnswerState;
  accent: string;
  onChange: (v: string) => void;
  onSubmit: (correct: boolean, wrongParens?: boolean) => void;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  const handleSubmit = () => {
    if (disabled || answer.value.trim() === '') return;
    const raw = answer.value.trim();
    const numStr = raw.replace(/[()]/g, '').replace('−', '-').replace(',', '.');
    const num = parseFloat(numStr);
    if (isNaN(num)) { onSubmit(false); return; }
    if (num !== exercise.ans) { onSubmit(false); return; }
    if (exercise.requiresParens && exercise.ans < 0) {
      const hasParen = raw.startsWith('(') && raw.endsWith(')');
      if (!hasParen) { onSubmit(false, true); return; }
    }
    onSubmit(true);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const typeColor: Record<string, string> = {
    add: '#4CAF84', sub: '#D07548', mul: '#4A7CC9',
  };
  const borderColor = typeColor[exercise.type] ?? '#6EE7C0';

  const feedback = (() => {
    if (answer.status === 'correct') return { text: '✓ Correct !', cls: 'feedback ok' };
    if (answer.status === 'wrong') {
      if (answer.wrongParens) {
        return {
          text: `✗ La valeur est bonne (${exercise.ans}) mais les parenthèses sont obligatoires : (${exercise.ans}) car c'est un nombre négatif dans une expression.`,
          cls: 'feedback ko',
        };
      }
      return { text: `✗ Réponse : ${exercise.ans < 0 && exercise.requiresParens ? `(${exercise.ans})` : exercise.ans}`, cls: 'feedback ko' };
    }
    if (answer.status === 'revealed') {
      return { text: `Réponse : ${exercise.ans < 0 && exercise.requiresParens ? `(${exercise.ans})` : exercise.ans}`, cls: 'feedback ko' };
    }
    return { text: '', cls: 'feedback' };
  })();

  return (
    <div className={`card ${exercise.type} ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `4px solid ${borderColor}` }}>
      <div className="card-num">{String(index + 1).padStart(2, '0')}</div>
      <div className="expr" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', fontFamily: "'DM Mono', monospace", fontSize: 16 }}>
        {exercise.part1 && <span>{exercise.part1}</span>}
        <input
          type="text"
          placeholder={exercise.requiresParens && exercise.ans < 0 ? '(−?)' : '?'}
          value={answer.value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          style={{
            width: 72,
            fontFamily: "'DM Mono', monospace",
            fontSize: 15,
            padding: '4px 6px',
            borderRadius: 6,
            border: `1px solid ${answer.value && !disabled ? accent : 'var(--border2)'}`,
            background: 'var(--bg)',
            color: 'var(--text)',
            textAlign: 'center',
          }}
        />
        <span>{exercise.part2} =</span>
      </div>
      <div className="input-row" style={{ marginTop: 6 }}>
        <button className="btn-secondary" disabled={disabled} onClick={handleSubmit}>OK</button>
      </div>
      {exercise.requiresParens && answer.status === 'pending' && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
          Si la réponse est négative, utilise les parenthèses : (−5)
        </div>
      )}
      <div className={feedback.cls} style={{ fontSize: 13, marginTop: 4 }}>{feedback.text}</div>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          <div dangerouslySetInnerHTML={{ __html: exercise.steps }} />
        </div>
      </div>
    </div>
  );
}

// ── EntiersSigneQuestion ─────────────────────────────────────────────────────

function EntiersSigneQuestion({
  index, exercise, answer, accent, onSubmit,
}: {
  index: number;
  exercise: EntiersSigneExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (correct: boolean) => void;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';
  const name = `signe-${index}`;

  const handlePick = (isPos: boolean) => {
    if (disabled) return;
    onSubmit(isPos === exercise.isPositive);
  };

  const feedback = (() => {
    if (answer.status === 'correct') return { text: `✓ Correct ! Ce résultat est ${exercise.isPositive ? 'positif' : 'négatif'}.`, cls: 'feedback ok' };
    if (answer.status === 'wrong') return { text: `✗ Ce résultat est ${exercise.isPositive ? 'positif' : 'négatif'}.`, cls: 'feedback ko' };
    if (answer.status === 'revealed') return { text: `Réponse : ${exercise.isPositive ? 'positif' : 'négatif'}.`, cls: 'feedback ko' };
    return { text: '', cls: 'feedback' };
  })();

  return (
    <div className={`card default ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `4px solid ${accent}` }}>
      <div className="card-num">{String(index + 1).padStart(2, '0')}</div>
      <div className="expr" style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: `${exercise.exprHtml} =` }} />
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        {[true, false].map((isPos) => (
          <label
            key={String(isPos)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, cursor: disabled ? 'default' : 'pointer',
              fontSize: 14, color: 'var(--text)', userSelect: 'none',
            }}
          >
            <input
              type="radio"
              name={name}
              disabled={disabled}
              onChange={() => handlePick(isPos)}
              style={{ accentColor: accent }}
            />
            <span style={{ fontWeight: 600 }}>{isPos ? 'Positif' : 'Négatif'}</span>
          </label>
        ))}
      </div>
      <div className={feedback.cls} style={{ fontSize: 13 }}>{feedback.text}</div>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          <div dangerouslySetInnerHTML={{ __html: exercise.steps }} />
        </div>
      </div>
    </div>
  );
}

// ── SigneReminder ────────────────────────────────────────────────────────────

function SigneReminder({ accent }: { accent: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${accent}40`, borderRadius: 12, padding: '14px 18px', marginBottom: '1.5rem' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ fontWeight: 700, color: accent, fontSize: 14 }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel — Signe d'un produit ou d'un quotient
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2.2, paddingTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 8 }}>
          <div><span style={{ color: 'var(--correct)', fontWeight: 700 }}>+</span> × <span style={{ color: 'var(--correct)', fontWeight: 700 }}>+</span> = <span style={{ color: 'var(--correct)', fontWeight: 700 }}>+</span></div>
          <div><span style={{ color: 'var(--wrong)', fontWeight: 700 }}>−</span> × <span style={{ color: 'var(--wrong)', fontWeight: 700 }}>−</span> = <span style={{ color: 'var(--correct)', fontWeight: 700 }}>+</span></div>
          <div><span style={{ color: 'var(--correct)', fontWeight: 700 }}>+</span> × <span style={{ color: 'var(--wrong)', fontWeight: 700 }}>−</span> = <span style={{ color: 'var(--wrong)', fontWeight: 700 }}>−</span></div>
          <div><span style={{ color: 'var(--wrong)', fontWeight: 700 }}>−</span> × <span style={{ color: 'var(--correct)', fontWeight: 700 }}>+</span> = <span style={{ color: 'var(--wrong)', fontWeight: 700 }}>−</span></div>
        </div>
        <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12 }}>La même règle s'applique aux divisions (÷).</div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <strong>Plusieurs facteurs :</strong> compter le nombre de facteurs négatifs.
          <br />Nombre <strong>pair</strong> de (−) → résultat <span style={{ color: 'var(--correct)', fontWeight: 700 }}>positif</span>.
          <br />Nombre <strong>impair</strong> de (−) → résultat <span style={{ color: 'var(--wrong)', fontWeight: 700 }}>négatif</span>.
        </div>
      </div>
    </div>
  );
}

// ── QuizView (shared score/controls/grid) ────────────────────────────────────

function QuizView({
  mode, exercises, answers, accent, accentSecondary, seriesKey,
  onUpdateAnswer, onSubmit, onResetErrors, onNewSeries, onBack,
}: {
  mode: HubMode;
  exercises: HubExercise[];
  answers: AnswerState[];
  accent: string;
  accentSecondary?: string;
  seriesKey: number;
  onUpdateAnswer: (i: number, patch: Partial<AnswerState>) => void;
  onSubmit: (i: number, correct?: boolean, wrongParens?: boolean) => void;
  onResetErrors: () => void;
  onNewSeries: () => void;
  onBack: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    let correct = 0, wrong = 0, answered = 0;
    for (const a of answers) {
      if (a.status === 'correct') { correct++; answered++; }
      else if (a.status === 'wrong' || a.status === 'revealed') { wrong++; answered++; }
    }
    return { correct, wrong, answered, total: exercises.length };
  }, [answers, exercises.length]);

  const finished = stats.answered === stats.total && stats.total > 0;

  useEffect(() => {
    if (finished && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [finished]);

  const accentStyle = { color: accent };
  const progressStyle = {
    width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`,
    background: accentSecondary ? `linear-gradient(90deg, ${accent}, ${accentSecondary})` : accent,
  };

  const modeLabel = mode === 'calculs' ? 'Faire des calculs'
    : mode === 'complex' ? 'Calculs plus durs'
    : 'Étude de signes';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} style={{ fontSize: 13 }}>
          ← Changer de mode
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{modeLabel}</span>
      </div>

      <div className="scoreboard">
        <div className="score-item">
          <span className="score-num" style={accentStyle}>{stats.correct}</span>
          <div className="score-label">Justes</div>
        </div>
        <div className="score-item">
          <span className="score-num" style={accentStyle}>{stats.wrong}</span>
          <div className="score-label">Faux</div>
        </div>
        <div className="score-item">
          <span className="score-num" style={accentStyle}>{stats.total - stats.answered}</span>
          <div className="score-label">Restants</div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={progressStyle} />
      </div>

      <div className="controls">
        <button className="btn-secondary" onClick={onResetErrors} disabled={stats.wrong === 0}>
          Recommencer les erreurs
        </button>
        <button className="btn-secondary" onClick={onNewSeries}>Nouvelle série</button>
      </div>

      {mode === 'signes' && <SigneReminder accent={accent} />}

      <div className={mode === 'calculs' || mode === 'complex' ? 'er-grid' : 'questions-list'}>
        {exercises.map((ex, i) => {
          const ans = answers[i]!;
          const key = `${seriesKey}-${ans.resetKey}-${i}`;
          if ((ex as EntiersTrouExercise).exKind === 'trou') {
            return (
              <EntiersTrouQuestion
                key={key}
                index={i}
                exercise={ex as EntiersTrouExercise}
                answer={ans}
                accent={accent}
                onChange={(v) => onUpdateAnswer(i, { value: v })}
                onSubmit={(correct, wrongParens) => onSubmit(i, correct, wrongParens)}
              />
            );
          }
          if ((ex as EntiersSigneExercise).exKind === 'signe') {
            return (
              <EntiersSigneQuestion
                key={key}
                index={i}
                exercise={ex as EntiersSigneExercise}
                answer={ans}
                accent={accent}
                onSubmit={(correct) => onSubmit(i, correct)}
              />
            );
          }
          return (
            <NumberQuestion
              key={key}
              index={i}
              exercise={ex as NumberExercise}
              answer={ans}
              accent={accent}
              onChange={(v) => onUpdateAnswer(i, { value: v })}
              onSubmit={(correct) => onSubmit(i, correct)}
            />
          );
        })}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>
            {endTitle(Math.round((stats.correct / stats.total) * 100))}
          </h2>
          <p>Score : {stats.correct} / {stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)</p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={onResetErrors} disabled={stats.wrong === 0}>
              Recommencer les erreurs
            </button>
            <button className="btn-primary" style={{ background: accent }} onClick={onNewSeries}>
              Nouvelle série
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ModeSelector ─────────────────────────────────────────────────────────────

const MODES: { id: HubMode; label: string; icon: string; desc: string; href?: string }[] = [
  {
    id: 'calculs',
    label: 'Faire des calculs',
    icon: '±',
    desc: '15 exercices · additions, soustractions, multiplications + calculs à trous',
  },
  {
    id: 'complex',
    label: 'Calculs plus durs',
    icon: '(±)',
    desc: '10 exercices · priorités des opérations, parenthèses, puissances',
  },
  {
    id: 'select',
    label: 'Top chrono',
    icon: '⏱',
    desc: 'Réponds le plus vite possible !',
    href: '/4eme/entiers-chrono',
  },
  {
    id: 'signes',
    label: 'Étude de signes',
    icon: '×',
    desc: '5 exercices · signe d'un produit ou d'un quotient de nombres relatifs',
  },
];

function ModeSelector({ onSelect, accent }: { onSelect: (m: HubMode) => void; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
      {MODES.map((m) => {
        if (m.href) {
          return (
            <a
              key={m.id}
              href={m.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'var(--surface)', border: `1px solid var(--border)`,
                borderRadius: 14, padding: '16px 20px', textDecoration: 'none', color: 'var(--text)',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <span style={{ fontSize: 28, minWidth: 36, textAlign: 'center', color: accent }}>{m.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.desc}</div>
              </div>
            </a>
          );
        }
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id as HubMode)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'var(--surface)', border: `1px solid var(--border)`,
              borderRadius: 14, padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
              color: 'var(--text)', transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
          >
            <span style={{ fontSize: 28, minWidth: 36, textAlign: 'center', color: accent }}>{m.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── EntiersHub (main export) ─────────────────────────────────────────────────

export function EntiersHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode>('select');
  const [exercises, setExercises] = useState<HubExercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);

  const loadMode = (m: HubMode) => {
    const exs: HubExercise[] =
      m === 'calculs' ? generateCalcsSeries() :
      m === 'complex' ? generateComplexSeries() :
      m === 'signes' ? generateSigneSeries() : [];
    setMode(m);
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateAnswer = (i: number, patch: Partial<AnswerState>) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };

  const submit = (i: number, correct?: boolean, wrongParens?: boolean) => {
    if (correct === undefined || answers[i]?.status !== 'pending') return;
    updateAnswer(i, { status: correct ? 'correct' : 'wrong', wrongParens: wrongParens ?? false });
  };

  const resetErrors = () => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.status === 'correct' ? a : { value: '', status: 'pending', resetKey: a.resetKey + 1 }
      )
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newSeries = () => loadMode(mode);

  if (mode === 'select') {
    return <ModeSelector onSelect={loadMode} accent={accent} />;
  }

  return (
    <QuizView
      mode={mode}
      exercises={exercises}
      answers={answers}
      accent={accent}
      accentSecondary={accentSecondary}
      seriesKey={seriesKey}
      onUpdateAnswer={updateAnswer}
      onSubmit={submit}
      onResetErrors={resetErrors}
      onNewSeries={newSeries}
      onBack={() => setMode('select')}
    />
  );
}
