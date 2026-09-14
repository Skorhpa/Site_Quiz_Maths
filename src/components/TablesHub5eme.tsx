import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TableEx {
  a: number;
  b: number;
  ans: number;
}

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong';
  resetKey: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const emptyAnswer = (): AnswerState => ({ value: '', status: 'pending', resetKey: 0 });
const buildAnswers = (n: number): AnswerState[] => Array.from({ length: n }, emptyAnswer);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function makeRandom(): TableEx[] {
  const seen = new Set<string>();
  const exs: TableEx[] = [];
  while (exs.length < 10) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const key = `${a}x${b}`;
    if (!seen.has(key)) {
      seen.add(key);
      exs.push({ a, b, ans: a * b });
    }
  }
  return exs;
}

function makeTable(n: number): TableEx[] {
  return shuffle(
    Array.from({ length: 10 }, (_, i) => ({ a: n, b: i + 1, ans: n * (i + 1) })),
  );
}

function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

// ── ModeCard ──────────────────────────────────────────────────────────────────

function ModeCard({
  label,
  icon,
  desc,
  accent,
  onClick,
}: {
  label: string;
  icon: string;
  desc: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '16px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        color: 'var(--text)',
        transition: 'border-color 0.15s',
        width: '100%',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <span style={{ fontSize: 26, minWidth: 36, textAlign: 'center', color: accent }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
    </button>
  );
}

// ── TableQuestion ─────────────────────────────────────────────────────────────

function TableQuestion({
  index,
  exercise,
  answer,
  accent,
  onSubmit,
}: {
  index: number;
  exercise: TableEx;
  answer: AnswerState;
  accent: string;
  onSubmit: (correct: boolean) => void;
}) {
  const [val, setVal] = useState('');

  useEffect(() => {
    setVal('');
  }, [answer.resetKey]);

  const disabled = answer.status !== 'pending';

  const handleSubmit = () => {
    if (disabled || val.trim() === '') return;
    const n = parseInt(val.trim(), 10);
    onSubmit(!Number.isNaN(n) && n === exercise.ans);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const cardClass = `qcard${answer.status === 'correct' ? ' correct-card' : answer.status === 'wrong' ? ' wrong-card' : ''}`;

  return (
    <div className={cardClass} style={{ borderLeft: `3px solid ${accent}` }}>
      <div className="answer-row">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.25rem', fontWeight: 700 }}>
          {exercise.a} × {exercise.b} =
        </span>
        <input
          type="number"
          value={val}
          disabled={disabled}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKey}
          style={{ fontSize: '1.1rem', fontWeight: 700 }}
        />
        <button className="btn-secondary" disabled={disabled} onClick={handleSubmit}>
          Vérifier
        </button>
      </div>
      {answer.status !== 'pending' && (
        <div className={`feedback ${answer.status === 'correct' ? 'ok' : 'ko'}`}>
          {answer.status === 'correct'
            ? '✓ Correct !'
            : `✗  ${exercise.a} × ${exercise.b} = ${exercise.ans}`}
        </div>
      )}
    </div>
  );
}

// ── TablesHub5eme ─────────────────────────────────────────────────────────────

export function TablesHub5eme({
  accent,
  accentSecondary,
}: {
  accent: string;
  accentSecondary?: string;
}) {
  const [mode, setMode] = useState<'random' | 'table' | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [exercises, setExercises] = useState<TableEx[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const load = (exs: TableEx[]) => {
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startRandom = () => {
    setMode('random');
    setSelectedTable(null);
    load(makeRandom());
  };

  const startTable = () => {
    setMode('table');
    setSelectedTable(null);
    setExercises([]);
    setAnswers([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectTable = (n: number) => {
    setSelectedTable(n);
    load(makeTable(n));
  };

  const newSeries = () => {
    if (mode === 'random') load(makeRandom());
    else if (mode === 'table' && selectedTable !== null) load(makeTable(selectedTable));
  };

  const resetErrors = () => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.status === 'correct' ? a : { value: '', status: 'pending', resetKey: a.resetKey + 1 },
      ),
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (i: number, correct: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, status: correct ? 'correct' : 'wrong' } : a)),
    );
  };

  const stats = {
    correct: answers.filter((a) => a.status === 'correct').length,
    wrong: answers.filter((a) => a.status === 'wrong').length,
    answered: answers.filter((a) => a.status !== 'pending').length,
    total: exercises.length,
  };

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

  // ── Mode selector ──────────────────────────────────────────────────────────
  if (mode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        <ModeCard
          label="Calculs aléatoires"
          icon="🎲"
          desc="10 calculs piochés au hasard dans les tables de 1 à 10"
          accent={accent}
          onClick={startRandom}
        />
        <ModeCard
          label="Je choisis ma table"
          icon="📋"
          desc="Sélectionner une table et faire les 10 multiplications"
          accent={accent}
          onClick={startTable}
        />
      </div>
    );
  }

  // ── Table selector ─────────────────────────────────────────────────────────
  if (mode === 'table' && selectedTable === null) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: 13 }}
            onClick={() => setMode(null)}
          >
            ← Retour
          </button>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Choisis ta table</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => selectTable(n)}
              style={{
                padding: '18px 0',
                fontFamily: "'DM Mono', monospace",
                fontSize: '1.5rem',
                fontWeight: 700,
                borderRadius: 12,
                border: '2px solid var(--border)',
                background: 'var(--surface)',
                color: accent,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = accent;
                (e.currentTarget as HTMLElement).style.background = `${accent}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Quiz view ──────────────────────────────────────────────────────────────
  const modeLabel = mode === 'random' ? 'Calculs aléatoires' : `Table de ${selectedTable}`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ fontSize: 13 }}
          onClick={() => {
            if (mode === 'random') setMode(null);
            else setSelectedTable(null);
          }}
        >
          {mode === 'random' ? '← Retour' : '← Changer de table'}
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
        <button className="btn-secondary" onClick={resetErrors} disabled={stats.wrong === 0}>
          Recommencer les erreurs
        </button>
        <button className="btn-secondary" onClick={newSeries}>
          Nouvelle série
        </button>
      </div>

      <div className="questions-list">
        {exercises.map((ex, i) => (
          <TableQuestion
            key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
            index={i}
            exercise={ex}
            answer={answers[i]!}
            accent={accent}
            onSubmit={(correct) => submit(i, correct)}
          />
        ))}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>
            {endTitle(Math.round((stats.correct / stats.total) * 100))}
          </h2>
          <p>
            Score : {stats.correct} / {stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)
          </p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={resetErrors} disabled={stats.wrong === 0}>
              Recommencer les erreurs
            </button>
            <button className="btn-primary" style={{ background: accent }} onClick={newSeries}>
              Nouvelle série
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
