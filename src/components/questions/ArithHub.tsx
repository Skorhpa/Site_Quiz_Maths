import { useEffect, useMemo, useRef, useState } from 'react';
import type { ArithExercise } from '@/types';
import {
  generateArithDiviseursSeries,
  generateArithMultiplesSeries,
  generateArithPrimesSeries,
  generateArithProblemesSeries,
} from '@/lib/generators/arith';
import { ArithQuestion } from './ArithQuestion';

type HubMode = 'diviseurs' | 'multiples' | 'primes' | 'problemes';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

const emptyAnswer = (): AnswerState => ({ value: '', status: 'pending', resetKey: 0 });
const buildAnswers = (n: number): AnswerState[] => Array.from({ length: n }, emptyAnswer);

function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

// ── ModeCard ─────────────────────────────────────────────────────────────────

function ModeCard({
  label,
  icon,
  desc,
  accent,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: string;
  desc: string;
  accent: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '16px 20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        color: disabled ? 'var(--muted)' : 'var(--text)',
        transition: 'border-color 0.15s',
        width: '100%',
        opacity: disabled ? 0.55 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLElement).style.borderColor = accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
      }}
    >
      <span
        style={{
          fontSize: 26,
          minWidth: 36,
          textAlign: 'center',
          color: disabled ? 'var(--muted)' : accent,
        }}
      >
        {icon}
      </span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
    </button>
  );
}

// ── MAIN_MODES ────────────────────────────────────────────────────────────────

const MAIN_MODES: { id: HubMode; label: string; icon: string; desc: string }[] = [
  {
    id: 'diviseurs',
    label: 'Diviseurs',
    icon: '÷',
    desc: '5 exercices · trouver les diviseurs et critères de divisibilité',
  },
  {
    id: 'multiples',
    label: 'Multiples',
    icon: '×',
    desc: '5 exercices · lister les multiples et trouver le plus grand',
  },
  {
    id: 'primes',
    label: 'Nombres premiers',
    icon: 'ℙ',
    desc: '5 exercices · reconnaître, lister et décomposer',
  },
  {
    id: 'problemes',
    label: 'Problèmes',
    icon: '🧩',
    desc: '2 exercices · problèmes de répartition (PGCD)',
  },
];

function getModeLabel(m: HubMode): string {
  if (m === 'diviseurs') return 'Diviseurs';
  if (m === 'multiples') return 'Multiples';
  if (m === 'primes') return 'Nombres premiers';
  return 'Problèmes';
}

// ── MainModeSelector ──────────────────────────────────────────────────────────

function MainModeSelector({
  onSelect,
  accent,
}: {
  onSelect: (m: HubMode) => void;
  accent: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
      {MAIN_MODES.map((m) => (
        <ModeCard
          key={m.id}
          label={m.label}
          icon={m.icon}
          desc={m.desc}
          accent={accent}
          onClick={() => onSelect(m.id)}
        />
      ))}
    </div>
  );
}

// ── QuizView ──────────────────────────────────────────────────────────────────

function QuizView({
  modeLabel,
  exercises,
  answers,
  accent,
  accentSecondary,
  seriesKey,
  onSubmit,
  onResetErrors,
  onNewSeries,
  onBack,
}: {
  modeLabel: string;
  exercises: ArithExercise[];
  answers: AnswerState[];
  accent: string;
  accentSecondary?: string;
  seriesKey: number;
  onSubmit: (i: number, correct: boolean) => void;
  onResetErrors: () => void;
  onNewSeries: () => void;
  onBack: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let answered = 0;
    for (const a of answers) {
      if (a.status === 'correct') {
        correct++;
        answered++;
      } else if (a.status === 'wrong' || a.status === 'revealed') {
        wrong++;
        answered++;
      }
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
    background: accentSecondary
      ? `linear-gradient(90deg, ${accent}, ${accentSecondary})`
      : accent,
  };

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
        <button className="btn-secondary" onClick={onNewSeries}>
          Nouvelle série
        </button>
      </div>

      <div className="questions-list">
        {exercises.map((ex, i) => {
          const ans = answers[i]!;
          return (
            <ArithQuestion
              key={`${seriesKey}-${ans.resetKey}-${i}`}
              index={i}
              exercise={ex}
              answer={ans}
              onSubmit={(correct) => onSubmit(i, correct ?? false)}
            />
          );
        })}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>
            {endTitle(Math.round((stats.correct / stats.total) * 100))}
          </h2>
          <p>
            Score : {stats.correct} / {stats.total} (
            {Math.round((stats.correct / stats.total) * 100)}%)
          </p>
          <div className="btn-group">
            <button
              className="btn-secondary"
              onClick={onResetErrors}
              disabled={stats.wrong === 0}
            >
              Recommencer les erreurs
            </button>
            <button
              className="btn-primary"
              style={{ background: accent }}
              onClick={onNewSeries}
            >
              Nouvelle série
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ArithHub (main export) ────────────────────────────────────────────────────

export function ArithHub({
  accent,
  accentSecondary,
}: {
  accent: string;
  accentSecondary?: string;
}) {
  const [mode, setMode] = useState<HubMode | null>(null);
  const [exercises, setExercises] = useState<ArithExercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);

  const loadExercises = (m: HubMode) => {
    let exs: ArithExercise[] = [];
    if (m === 'diviseurs') exs = generateArithDiviseursSeries();
    else if (m === 'multiples') exs = generateArithMultiplesSeries();
    else if (m === 'primes') exs = generateArithPrimesSeries();
    else if (m === 'problemes') exs = generateArithProblemesSeries();
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectMode = (m: HubMode) => {
    setMode(m);
    loadExercises(m);
  };

  const submit = (i: number, correct: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) =>
      prev.map((a, idx) =>
        idx === i ? { ...a, status: correct ? 'correct' : 'wrong' } : a,
      ),
    );
  };

  const resetErrors = () => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.status === 'correct' ? a : { value: '', status: 'pending', resetKey: a.resetKey + 1 },
      ),
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newSeries = () => {
    if (mode !== null) loadExercises(mode);
  };

  const goBack = () => {
    setMode(null);
    setExercises([]);
    setAnswers([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (mode === null) {
    return <MainModeSelector onSelect={selectMode} accent={accent} />;
  }

  return (
    <QuizView
      modeLabel={getModeLabel(mode)}
      exercises={exercises}
      answers={answers}
      accent={accent}
      accentSecondary={accentSecondary}
      seriesKey={seriesKey}
      onSubmit={submit}
      onResetErrors={resetErrors}
      onNewSeries={newSeries}
      onBack={goBack}
    />
  );
}
