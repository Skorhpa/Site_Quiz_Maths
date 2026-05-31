import { useEffect, useMemo, useRef, useState } from 'react';
import type { Exercise, ThalesExercise, ThalesReciproqueExercise } from '@/types';
import { runGenerator } from '@/lib/runGenerator';
import { ThalesQuestion } from './ThalesQuestion';
import { ThalesReciproqueQuestion } from './ThalesReciproqueQuestion';

type HubMode = 'theoreme' | 'reciproque';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

const ACCENT = '#FB923C';
const emptyAnswer = (): AnswerState => ({ value: '', status: 'pending', resetKey: 0 });
const buildAnswers = (n: number): AnswerState[] => Array.from({ length: n }, emptyAnswer);

function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

function Frac({ n, d, color = ACCENT, fontSize = 13 }: { n: string; d: string; color?: string; fontSize?: number }) {
  return (
    <span style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
      verticalAlign: 'middle', fontFamily: "'DM Mono', monospace",
      fontSize, fontWeight: 700, color, lineHeight: 1.2, margin: '0 3px',
    }}>
      <span>{n}</span>
      <span style={{ width: '100%', borderTop: `1.5px solid ${color}`, display: 'block', margin: '2px 0' }} />
      <span>{d}</span>
    </span>
  );
}

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
        color: '#f87171', fontSize: 13, textDecoration: 'none', fontWeight: 600,
        marginTop: 6, marginRight: 8,
      }}
    >
      ▶ {label}
    </a>
  );
}

function RecallThéorème() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)}
        style={{ color: ACCENT, width: '100%', padding: '10px 16px', textAlign: 'left' }}>
        <span>{open ? '▼' : '▶'}</span> Rappel du théorème + vidéo
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, flexWrap: 'wrap', margin: '8px 0 10px' }}>
          <svg width="110" height="120" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <polygon points="70,8 10,142 130,142" fill="rgba(251,146,60,0.07)" stroke="#FB923C" strokeWidth="1.5"/>
            <line x1="34" y1="86" x2="106" y2="86" stroke="#FB923C" strokeWidth="1.4"/>
            <text x="70" y="30" fill="#F0EDE8" fontFamily="DM Mono,monospace" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">A</text>
            <text x="30" y="128" fill="#A0A8B8" fontFamily="DM Mono,monospace" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">B</text>
            <text x="110" y="128" fill="#A0A8B8" fontFamily="DM Mono,monospace" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">C</text>
            <text x="46" y="76" fill="#FB923C" fontFamily="DM Mono,monospace" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">M</text>
            <text x="94" y="76" fill="#FB923C" fontFamily="DM Mono,monospace" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">N</text>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)', marginBottom: 4 }}>
              Si M ∈ [AB], N ∈ [AC] et (MN) ∥ (BC),
            </div>
            <div style={{ color: 'var(--muted)', marginBottom: 8 }}>
              on a, d'après le théorème de Thalès :
            </div>
            <div style={{ fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Frac n="AM" d="AB" /> <span style={{ color: 'var(--muted)' }}>=</span>
              <Frac n="AN" d="AC" /> <span style={{ color: 'var(--muted)' }}>=</span>
              <Frac n="MN" d="BC" />
            </div>
          </div>
        </div>
        <div>
          <VideoLink url="https://www.youtube.com/watch?v=zP16D2Zrv1A&t=11s" label="Théorème de Thalès" />
        </div>
      </div>
    </div>
  );
}

function RecallRéciproque() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)}
        style={{ color: ACCENT, width: '100%', padding: '10px 16px', textAlign: 'left' }}>
        <span>{open ? '▼' : '▶'}</span> Rappel : réciproque et contraposée
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap', margin: '8px 0 10px' }}>
          <svg width="120" height="132" viewBox="0 0 130 148" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <polygon points="65,8 10,140 120,140" fill="rgba(251,146,60,0.07)" stroke="#FB923C" strokeWidth="1.5"/>
            <line x1="32" y1="84" x2="98" y2="84" stroke="#60A5FA" strokeWidth="1.5"/>
            <text x="65" y="28" fill="#F0EDE8" fontFamily="DM Mono,monospace" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">S</text>
            <text x="6" y="132" fill="#A0A8B8" fontFamily="DM Mono,monospace" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">A</text>
            <text x="122" y="132" fill="#A0A8B8" fontFamily="DM Mono,monospace" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">B</text>
            <text x="24" y="76" fill="#60A5FA" fontFamily="DM Mono,monospace" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">M</text>
            <text x="106" y="76" fill="#60A5FA" fontFamily="DM Mono,monospace" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">N</text>
          </svg>
          <div style={{ lineHeight: 2.2 }}>
            <div style={{ marginBottom: 4 }}>
              <strong>Réciproque :</strong> Si M ∈ [SA], N ∈ [SB] et{' '}
              <Frac n="SM" d="SA" /> = <Frac n="SN" d="SB" />, alors (MN) ∥ (AB).
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Contraposée :</strong> Si{' '}
              <Frac n="SM" d="SA" /> ≠ <Frac n="SN" d="SB" />, alors (MN) ∦ (AB).
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              On peut aussi comparer <Frac n="SM" d="SA" color="var(--muted)" fontSize={11} /> avec <Frac n="MN" d="AB" color="#60A5FA" fontSize={11} />.
            </div>
          </div>
        </div>
        <div>
          <VideoLink url="https://www.youtube.com/watch?v=OaladmqeJ40" label="Réciproque de Thalès" />
        </div>
      </div>
    </div>
  );
}

function ModeCard({ label, icon, desc, onClick }: { label: string; icon: string; desc: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
        padding: '16px 20px', cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
        transition: 'border-color 0.15s', width: '100%',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = ACCENT; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <div style={{ width: 38, minWidth: 38, fontSize: 22, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, color: ACCENT }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
    </button>
  );
}

const MAIN_MODES: { id: HubMode; label: string; icon: string; desc: string }[] = [
  { id: 'theoreme',  label: 'Le théorème de Thalès',     icon: '∥',  desc: '7 exercices · calculs de longueurs et glisser-déposer' },
  { id: 'reciproque', label: 'Réciproque et contraposée', icon: '⟺', desc: '5 exercices · démonstrations de parallélisme' },
];

function QuizView({
  mode, exercises, answers, seriesKey,
  onSubmit, onUpdate, onResetErrors, onNewSeries, onBack,
}: {
  mode: HubMode;
  exercises: Exercise[];
  answers: AnswerState[];
  seriesKey: number;
  onSubmit: (i: number, correct: boolean) => void;
  onUpdate: (i: number, value: string) => void;
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
    if (finished && endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [finished]);

  const progressStyle = {
    width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`,
    background: `linear-gradient(90deg, ${ACCENT}, #FCD34D)`,
  };

  const modeLabel = MAIN_MODES.find((m) => m.id === mode)?.label ?? mode;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} style={{ fontSize: 13 }}>
          ← Changer de mode
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{modeLabel}</span>
      </div>

      {mode === 'theoreme' && <RecallThéorème />}
      {mode === 'reciproque' && <RecallRéciproque />}

      <div className="scoreboard">
        <div className="score-item"><span className="score-num" style={{ color: ACCENT }}>{stats.correct}</span><div className="score-label">Justes</div></div>
        <div className="score-item"><span className="score-num" style={{ color: ACCENT }}>{stats.wrong}</span><div className="score-label">Faux</div></div>
        <div className="score-item"><span className="score-num" style={{ color: ACCENT }}>{stats.total - stats.answered}</span><div className="score-label">Restants</div></div>
      </div>

      <div className="progress-bar"><div className="progress-fill" style={progressStyle} /></div>

      <div className="controls">
        <button className="btn-secondary" onClick={onResetErrors} disabled={stats.wrong === 0}>Recommencer les erreurs</button>
        <button className="btn-secondary" onClick={onNewSeries}>Nouvelle série</button>
      </div>

      <div className="questions-list">
        {exercises.map((ex, i) => {
          const ans = answers[i]!;
          const key = `${seriesKey}-${ans.resetKey}-${i}`;
          if (mode === 'theoreme') {
            return (
              <ThalesQuestion
                key={key}
                index={i}
                exercise={ex as ThalesExercise}
                answer={ans}
                onChange={(value) => onUpdate(i, value)}
                onSubmit={(correct) => onSubmit(i, correct)}
              />
            );
          }
          return (
            <ThalesReciproqueQuestion
              key={key}
              index={i}
              exercise={ex as ThalesReciproqueExercise}
              answer={ans}
              onSubmit={(correct) => onSubmit(i, correct)}
            />
          );
        })}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${ACCENT}` }}>
          <h2 style={{ color: ACCENT }}>{endTitle(Math.round((stats.correct / stats.total) * 100))}</h2>
          <p>Score : {stats.correct} / {stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)</p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={onResetErrors} disabled={stats.wrong === 0}>Recommencer les erreurs</button>
            <button className="btn-primary" style={{ background: ACCENT }} onClick={onNewSeries}>Nouvelle série</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ThalesHub() {
  const [mode, setMode] = useState<HubMode | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);

  const loadExercises = (m: HubMode) => {
    const exs = m === 'theoreme'
      ? (runGenerator([{ kind: 'thales' }]) as ThalesExercise[])
      : (runGenerator([{ kind: 'thales-reciproque' }]) as ThalesReciproqueExercise[]);
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (i: number, correct: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) => prev.map((a, idx) => idx === i ? { ...a, status: correct ? 'correct' : 'wrong' } : a));
  };

  const update = (i: number, value: string) => {
    setAnswers((prev) => prev.map((a, idx) => idx === i ? { ...a, value } : a));
  };

  const resetErrors = () => {
    setAnswers((prev) => prev.map((a) => a.status === 'correct' ? a : { value: '', status: 'pending', resetKey: a.resetKey + 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setMode(null); setExercises([]); setAnswers([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (mode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {MAIN_MODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc}
            onClick={() => { setMode(m.id); loadExercises(m.id); }} />
        ))}
      </div>
    );
  }

  return (
    <QuizView
      mode={mode}
      exercises={exercises}
      answers={answers}
      seriesKey={seriesKey}
      onSubmit={submit}
      onUpdate={update}
      onResetErrors={resetErrors}
      onNewSeries={() => loadExercises(mode)}
      onBack={goBack}
    />
  );
}
