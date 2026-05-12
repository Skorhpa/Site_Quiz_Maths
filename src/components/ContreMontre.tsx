import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import type { NumberExercise } from '@/types';
import { randomIntegerExercise } from '@/lib/runGenerator';

type Phase = 'intro' | 'setup' | 'playing' | 'done';

interface HistoryItem {
  exercise: NumberExercise;
  userAns: string;
  correct: boolean;
}

const ACCENT = '#6EE7C0';
const ACCENT_FG = '#0F1117';

const monoInput = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'DM Mono', monospace",
  borderRadius: 10,
  border: '1px solid var(--border2)',
  background: 'var(--bg)',
  color: 'var(--text)',
  textAlign: 'center',
  ...extra,
});

export default function ContreMontre() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [timeInput, setTimeInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState<NumberExercise | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [openHint, setOpenHint] = useState<number | null>(null);
  const [setupError, setSetupError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setIsRunning(false);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    if (phase === 'playing') inputRef.current?.focus();
  }, [current, phase]);

  const startGame = () => {
    const secs = parseInt(timeInput, 10);
    if (isNaN(secs) || secs < 30 || secs > 60) {
      setSetupError('Choisis un nombre entre 30 et 60.');
      return;
    }
    setSetupError('');
    setTimeLeft(secs);
    setTotalTime(secs);
    setScore(0);
    setHistory([]);
    setCurrent(randomIntegerExercise());
    setInputVal('');
    setPhase('playing');
    setIsRunning(true);
  };

  const submit = () => {
    if (!current || !isRunning) return;
    const num = parseFloat(inputVal.replace(',', '.'));
    if (isNaN(num)) return;
    const correct = num === current.ans;
    setHistory((prev) => [...prev, { exercise: current, userAns: inputVal, correct }]);
    if (correct) setScore((s) => s + 1);
    setCurrent(randomIntegerExercise());
    setInputVal('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  const restart = () => {
    setPhase('intro');
    setTimeInput('');
    setSetupError('');
    setHistory([]);
    setScore(0);
    setOpenHint(null);
  };

  // ── Intro ────────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="chrono-shell">
        <div className="chrono-card">
          <div style={{ fontSize: 52, marginBottom: '1.5rem' }}>🏁</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', fontWeight: 400, marginBottom: '1rem', color: 'var(--text)' }}>
            Contre la montre
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.9, marginBottom: '2.5rem' }}>
            Fais le plus de calculs dans le temps imparti !<br />
            Additions, soustractions et multiplications d'entiers relatifs.
          </p>
          <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG }} onClick={() => setPhase('setup')}>
            Je choisis le temps
          </button>
        </div>
      </div>
    );
  }

  // ── Setup ────────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="chrono-shell">
        <div className="chrono-card">
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', fontWeight: 400, marginBottom: '0.4rem', color: 'var(--text)' }}>
            Combien de secondes ?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.8rem' }}>entre 30 et 60 secondes</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '1rem' }}>
            <input
              type="number"
              min={30}
              max={60}
              placeholder="..."
              value={timeInput}
              onChange={(e) => { setTimeInput(e.target.value); setSetupError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') startGame(); }}
              autoFocus
              style={monoInput({ width: 90, fontSize: 22, fontWeight: 700, padding: '8px 12px' })}
            />
            <span style={{ fontSize: 15, color: 'var(--muted)' }}>secondes</span>
          </div>
          {setupError && (
            <p style={{ color: 'var(--wrong)', fontSize: 13, fontFamily: "'DM Mono', monospace", marginBottom: '1rem' }}>
              {setupError}
            </p>
          )}
          <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG }} onClick={startGame}>
            Lancer !
          </button>
        </div>
      </div>
    );
  }

  // ── Playing ──────────────────────────────────────────────────────────────────
  if (phase === 'playing' && current) {
    const pct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
    const timerColor = pct < 25 ? '#F87171' : pct < 50 ? '#FB923C' : ACCENT;

    return (
      <div className="chrono-shell">
        <div className="chrono-timer-bar">
          <div className="chrono-timer-fill" style={{ width: `${pct}%`, background: timerColor }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: timerColor, fontWeight: 700 }}>
            ⏱ {timeLeft}s
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>
            Score : <strong style={{ color: ACCENT }}>{score}</strong> / {history.length}
          </span>
        </div>
        <div className="chrono-card" style={{ padding: '3rem 2rem' }}>
          <div className="chrono-expr">{current.expr} =</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="number"
              placeholder="?"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              style={monoInput({ width: 110, fontSize: 22, fontWeight: 700, padding: '10px 14px' })}
            />
            <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG, fontSize: 15 }} onClick={submit}>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  const total = history.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const endMsg = pct === 100 ? 'Parfait ! 🎉' : pct >= 70 ? 'Très bien !' : pct >= 50 ? 'Pas mal !' : 'Continue !';

  return (
    <div className="chrono-shell">
      <div className="chrono-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: ACCENT, marginBottom: '0.5rem' }}>
          {endMsg}
        </div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: 'var(--text)', marginBottom: '0.3rem' }}>
          Score : <strong>{score} / {total}</strong> ({pct}%)
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>
          {total} calcul{total !== 1 ? 's' : ''} traité{total !== 1 ? 's' : ''} en {totalTime} secondes
        </p>
        <button className="btn-secondary" onClick={restart}>Recommencer</button>
      </div>

      {history.length > 0 && (
        <div className="chrono-recap">
          {history.map((item, i) => (
            <div
              key={i}
              className="chrono-recap-row"
              style={{ border: `1px solid ${item.correct ? 'var(--correct)' : 'var(--wrong)'}` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)', minWidth: 28 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, flex: 1 }}>
                  {item.exercise.expr} = <strong>{item.userAns}</strong>
                </span>
                {item.correct ? (
                  <span style={{ color: 'var(--correct)', fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700 }}>
                    ✓ Correct
                  </span>
                ) : (
                  <span style={{ color: 'var(--wrong)', fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700 }}>
                    ✗ Réponse : {item.exercise.ans}
                  </span>
                )}
              </div>
              {item.exercise.steps && !item.correct && (
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    className="hint-toggle"
                    onClick={() => setOpenHint(openHint === i ? null : i)}
                  >
                    <span>{openHint === i ? '▼' : '▶'}</span> Voir la correction
                  </button>
                  <div className={`steps-box${openHint === i ? ' open' : ''}`} style={{ marginTop: 4, fontSize: 12 }}>
                    <div dangerouslySetInnerHTML={{ __html: item.exercise.steps }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
