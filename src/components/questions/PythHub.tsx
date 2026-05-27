import { useEffect, useMemo, useRef, useState } from 'react';
import type { Exercise, PythagoreExercise, ReciproqueExercise, SquareExercise } from '@/types';
import { runGenerator } from '@/lib/runGenerator';
import { generateSquareSeries, generateSqrtSeries } from '@/lib/generators/square';
import { SquareQuestion } from './SquareQuestion';
import { PythagoreQuestion } from './PythagoreQuestion';
import { ReciproqueQuestion } from './ReciproqueQuestion';

type HubMode = 'carre' | 'racine' | 'theoreme' | 'reciproque';

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

const ACCENT = '#60A5FA';

// ── Video link button ─────────────────────────────────────────────────────

function VideoLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 8,
        background: 'rgba(255,0,0,0.08)',
        border: '1px solid rgba(255,0,0,0.25)',
        color: '#f87171',
        fontSize: 13,
        textDecoration: 'none',
        fontWeight: 600,
        marginTop: 6,
        marginRight: 8,
      }}
    >
      ▶ {label}
    </a>
  );
}

// ── Recall panels per mode ────────────────────────────────────────────────

function RecallCarré() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: ACCENT, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel : le carré d'un nombre
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 2 }}>
        <div><strong>Définition :</strong> le carré d'un nombre n est le résultat de n × n, noté <strong>n²</strong>.</div>
        <div style={{ fontFamily: "'DM Mono', monospace", marginTop: 6 }}>
          Exemples : 3² = 3 × 3 = 9 &nbsp;|&nbsp; 7² = 7 × 7 = 49 &nbsp;|&nbsp; 12² = 12 × 12 = 144
        </div>
        <div style={{ marginTop: 6, color: 'var(--muted)' }}>On dit aussi que 9 est le carré de 3, ou que 3 est la racine carrée de 9.</div>
      </div>
    </div>
  );
}

function RecallRacine() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: ACCENT, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel + vidéo : la racine carrée
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 2 }}>
        <div><strong>Définition :</strong> √n est le nombre positif dont le carré vaut n.</div>
        <div style={{ fontFamily: "'DM Mono', monospace", marginTop: 6 }}>
          √9 = 3 car 3² = 9 &nbsp;|&nbsp; √25 = 5 car 5² = 25 &nbsp;|&nbsp; √144 = 12 car 12² = 144
        </div>
        <div style={{ marginTop: 10 }}>
          <VideoLink url="https://www.youtube.com/watch?v=2g67qQnGgrE" label="Revoir la méthode (YouTube)" />
        </div>
      </div>
    </div>
  );
}

function RecallThéorème() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: ACCENT, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel du théorème + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Dans un triangle ABC rectangle en C</p>
            <p style={{ color: 'var(--muted)', marginBottom: 8 }}>d'hypoténuse [AB], d'après le théorème de Pythagore :</p>
            <div className="formula" style={{ fontSize: '1.3rem' }}>AB² = AC² + BC²</div>
          </div>
          <svg width="120" height="100" viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <polygon points="10,90 10,10 110,90" fill="rgba(96,165,250,0.07)" stroke="#60A5FA" strokeWidth="1.5"/>
            <rect x="10" y="76" width="14" height="14" fill="none" stroke="#60A5FA" strokeWidth="1.2"/>
            <text x="1" y="8" fill="#A78BFA" fontFamily="DM Mono,monospace" fontSize="12">A</text>
            <text x="0" y="103" fill="#A78BFA" fontFamily="DM Mono,monospace" fontSize="12">C</text>
            <text x="114" y="103" fill="#A78BFA" fontFamily="DM Mono,monospace" fontSize="12">B</text>
          </svg>
        </div>
        <div>
          <VideoLink url="https://www.youtube.com/watch?v=M9sceJ8gzNc" label="Vidéo 1" />
          <VideoLink url="https://www.youtube.com/watch?v=M9sceJ8gzNc&feature=youtu.be" label="Vidéo 2" />
        </div>
      </div>
    </div>
  );
}

function RecallRéciproque() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: '#A78BFA', width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel : réciproque et contraposée + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Réciproque :</strong> Si AB² = AC² + BC², alors le triangle ABC est rectangle en C.
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Contraposée :</strong> Si AB² ≠ AC² + BC², alors le triangle ABC n'est pas rectangle.
        </div>
        <div>
          <VideoLink url="https://youtu.be/puXyHcU5Awg" label="Vidéo 1" />
          <VideoLink url="https://youtu.be/8vexpFayTbI" label="Vidéo 2" />
        </div>
      </div>
    </div>
  );
}

// ── ModeCard ──────────────────────────────────────────────────────────────

function ModeCard({ label, icon, desc, accent, onClick }: { label: string; icon: string; desc: string; accent: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
        padding: '16px 20px', cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
        transition: 'border-color 0.15s', width: '100%',
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

const MAIN_MODES: { id: HubMode; label: string; icon: string; desc: string; accent: string }[] = [
  { id: 'carre',    label: 'Calculer un carré',          icon: 'n²',  desc: '5 exercices · chiffres et nombres à deux chiffres',         accent: ACCENT },
  { id: 'racine',   label: 'Calculer une racine carrée',  icon: '√',   desc: '5 exercices · 4 carrés parfaits + 1 arrondi au dixième',    accent: ACCENT },
  { id: 'theoreme', label: 'Le théorème',                 icon: '📐',  desc: '8 exercices · figures, calculs, glisser-déposer',           accent: ACCENT },
  { id: 'reciproque', label: 'La réciproque et la contraposée', icon: '△', desc: '4 exercices · démonstrations et tableau', accent: '#A78BFA' },
];

function getModeLabel(m: HubMode): string {
  const found = MAIN_MODES.find((x) => x.id === m);
  return found?.label ?? m;
}

// ── QuizView (generic) ────────────────────────────────────────────────────

function QuizView({
  mode,
  exercises,
  answers,
  seriesKey,
  onSubmit,
  onUpdate,
  onResetErrors,
  onNewSeries,
  onBack,
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
  const accent = mode === 'reciproque' ? '#A78BFA' : ACCENT;
  const accentSecondary = mode === 'reciproque' ? '#c4b5fd' : '#6EE7C0';

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
    background: `linear-gradient(90deg, ${accent}, ${accentSecondary})`,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} style={{ fontSize: 13 }}>
          ← Changer de mode
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{getModeLabel(mode)}</span>
      </div>

      {mode === 'carre' && <RecallCarré />}
      {mode === 'racine' && <RecallRacine />}
      {mode === 'theoreme' && <RecallThéorème />}
      {mode === 'reciproque' && <RecallRéciproque />}

      <div className="scoreboard">
        <div className="score-item"><span className="score-num" style={{ color: accent }}>{stats.correct}</span><div className="score-label">Justes</div></div>
        <div className="score-item"><span className="score-num" style={{ color: accent }}>{stats.wrong}</span><div className="score-label">Faux</div></div>
        <div className="score-item"><span className="score-num" style={{ color: accent }}>{stats.total - stats.answered}</span><div className="score-label">Restants</div></div>
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
          if (mode === 'carre' || mode === 'racine') {
            return (
              <SquareQuestion
                key={key}
                index={i}
                exercise={ex as SquareExercise}
                answer={ans}
                onSubmit={(correct) => onSubmit(i, correct ?? false)}
              />
            );
          }
          if (mode === 'theoreme') {
            return (
              <PythagoreQuestion
                key={key}
                index={i}
                exercise={ex as PythagoreExercise}
                answer={ans}
                onChange={(value) => onUpdate(i, value)}
                onSubmit={(correct) => onSubmit(i, correct ?? false)}
              />
            );
          }
          return (
            <ReciproqueQuestion
              key={key}
              index={i}
              exercise={ex as ReciproqueExercise}
              answer={ans}
              onSubmit={(correct) => onSubmit(i, correct ?? false)}
            />
          );
        })}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>{endTitle(Math.round((stats.correct / stats.total) * 100))}</h2>
          <p>Score : {stats.correct} / {stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)</p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={onResetErrors} disabled={stats.wrong === 0}>Recommencer les erreurs</button>
            <button className="btn-primary" style={{ background: accent }} onClick={onNewSeries}>Nouvelle série</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PythHub (main export) ─────────────────────────────────────────────────

export function PythHub() {
  const [mode, setMode] = useState<HubMode | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);

  const loadExercises = (m: HubMode) => {
    let exs: Exercise[] = [];
    if (m === 'carre') exs = generateSquareSeries();
    else if (m === 'racine') exs = generateSqrtSeries();
    else if (m === 'theoreme') exs = runGenerator([{ kind: 'pythagore' }]) as PythagoreExercise[];
    else exs = runGenerator([{ kind: 'reciproque' }]) as ReciproqueExercise[];
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectMode = (m: HubMode) => { setMode(m); loadExercises(m); };

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

  const newSeries = () => { if (mode !== null) loadExercises(mode); };

  const goBack = () => { setMode(null); setExercises([]); setAnswers([]); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (mode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {MAIN_MODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={m.accent} onClick={() => selectMode(m.id)} />
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
      onNewSeries={newSeries}
      onBack={goBack}
    />
  );
}
