import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { FractionExercise, FractionsCompExercise, MDCExercise } from '@/types';
import { generateMDCSeries } from '@/lib/generators/fractions-hub';
import {
  generateAddSeries,
  generateSubSeries,
  generateMulSeries,
  generateDivSeries,
  generateFractionsComplexSeries,
  generateProblemsSeries,
  makeAddAtPos,
  makeSubAtPos,
  makeMulAtPos,
  fH,
  frEqual,
} from '@/lib/generators/fractions';
import { generateCompSeries, generateSimplSeries } from '@/lib/generators/fractions-comp';
import { FractionQuestion } from './FractionQuestion';
import { FractionsCompQuestion } from './FractionsCompQuestion';

type HubMode = 'mdc' | 'calculs' | 'comp' | 'simpl' | 'problemes';
type CalcSubMode = 'add' | 'sub' | 'mul' | 'div' | 'complex';
export type FracHubExercise = MDCExercise | FractionExercise | FractionsCompExercise;

export interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

export const emptyAnswer = (): AnswerState => ({ value: '', status: 'pending', resetKey: 0 });
export const buildAnswers = (n: number): AnswerState[] => Array.from({ length: n }, emptyAnswer);

export function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

export const CARD_CLASS: Record<AnswerState['status'], string> = {
  pending: '', correct: 'correct-card', wrong: 'wrong-card', revealed: 'wrong-card',
};

// ── MDCQuestion ──────────────────────────────────────────────────────────────

export function MDCQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: MDCExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (correct: boolean) => void;
}) {
  const [num1, setNum1] = useState('');
  const [den1, setDen1] = useState('');
  const [num2, setNum2] = useState('');
  const [den2, setDen2] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState({ html: '', cls: 'feedback' });
  const disabled = answer.status !== 'pending';

  const handleSubmit = () => {
    if (disabled) return;
    const vn1 = parseInt(num1, 10);
    const vd1 = parseInt(den1, 10);
    const vn2 = parseInt(num2, 10);
    const vd2 = parseInt(den2, 10);
    if (Number.isNaN(vn1) || Number.isNaN(vd1) || Number.isNaN(vn2) || Number.isNaN(vd2)) return;
    if (vd1 <= 0 || vd2 <= 0) {
      setFeedback({ html: '✗ Le dénominateur doit être positif.', cls: 'feedback ko' });
      onSubmit(false);
      return;
    }
    if (vd1 !== vd2) {
      setFeedback({ html: '✗ Les deux dénominateurs doivent être identiques.', cls: 'feedback ko' });
      onSubmit(false);
      return;
    }
    const ok1 = frEqual(vn1, vd1, exercise.frac1.n, exercise.frac1.d);
    const ok2 = frEqual(vn2, vd2, exercise.frac2.n, exercise.frac2.d);
    if (ok1 && ok2) {
      const simpleHint = exercise.kind === 'multiple' && vd1 !== exercise.lcd
        ? ` Il y avait une façon plus simple de faire, regarde la correction.`
        : '';
      setFeedback({ html: `✓ Correct !${simpleHint}`, cls: 'feedback ok' });
      onSubmit(true);
    } else {
      const msgs: string[] = [];
      if (!ok1) msgs.push('1ère fraction incorrecte');
      if (!ok2) msgs.push('2ème fraction incorrecte');
      setFeedback({ html: `✗ Erreur : ${msgs.join(', ')}.`, cls: 'feedback ko' });
      onSubmit(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const finalFb = answer.status === 'revealed'
    ? { html: `Dénominateur commun : <strong>${exercise.lcd}</strong>. Voir la correction ci-dessous.`, cls: 'feedback ko' }
    : feedback;

  const inpStyle: React.CSSProperties = {
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
  const tagStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 99,
    background: `${accent}22`,
    color: accent,
  };

  return (
    <div className={`qcard ${CARD_CLASS[answer.status]}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={tagStyle}>Dénominateur commun</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 10 }}>
        Mets ces deux fractions au même dénominateur :
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: '1.4rem' }} dangerouslySetInnerHTML={{ __html: fH(exercise.frac1.n, exercise.frac1.d) }} />
          <span style={{ color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>=</span>
          <span className="frac-inp">
            <input type="text" value={num1} placeholder="…" disabled={disabled} onChange={(e) => setNum1(e.target.value)} onKeyDown={handleKey} style={{ ...inpStyle, width: 50 }} />
            <div className="frac-line" style={{ width: 50 }} />
            <input type="text" value={den1} placeholder="…" disabled={disabled} onChange={(e) => setDen1(e.target.value)} onKeyDown={handleKey} style={{ ...inpStyle, width: 50 }} />
          </span>
        </div>
        <span style={{ color: 'var(--muted)', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>et</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: '1.4rem' }} dangerouslySetInnerHTML={{ __html: fH(exercise.frac2.n, exercise.frac2.d) }} />
          <span style={{ color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>=</span>
          <span className="frac-inp">
            <input type="text" value={num2} placeholder="…" disabled={disabled} onChange={(e) => setNum2(e.target.value)} onKeyDown={handleKey} style={{ ...inpStyle, width: 50 }} />
            <div className="frac-line" style={{ width: 50 }} />
            <input type="text" value={den2} placeholder="…" disabled={disabled} onChange={(e) => setDen2(e.target.value)} onKeyDown={handleKey} style={{ ...inpStyle, width: 50 }} />
          </span>
        </div>
      </div>
      <button className="btn-secondary" disabled={disabled} onClick={handleSubmit} style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}>
        OK
      </button>
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
          <div dangerouslySetInnerHTML={{ __html: exercise.steps }} />
        </div>
      </div>
    </div>
  );
}

// ── QuizView ─────────────────────────────────────────────────────────────────

export function QuizView({
  modeLabel, exercises, answers, accent, accentSecondary, seriesKey,
  switcher, onSubmit, onResetErrors, onNewSeries, onBack,
}: {
  modeLabel: string;
  exercises: FracHubExercise[];
  answers: AnswerState[];
  accent: string;
  accentSecondary?: string;
  seriesKey: number;
  switcher?: { counts: (2 | 3 | 4)[]; buttons: readonly (2 | 3 | 4)[]; maxIndex?: number; onChange: (i: number, n: 2 | 3 | 4) => void };
  onSubmit: (i: number, correct: boolean) => void;
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
        <button className="btn-secondary" onClick={onNewSeries}>Nouvelle série</button>
      </div>

      <div className="questions-list">
        {exercises.map((ex, i) => {
          const ans = answers[i]!;
          const key = `${seriesKey}-${ans.resetKey}-${i}`;
          const locked = ans.status !== 'pending';
          if ((ex as MDCExercise).exKind === 'mdc') {
            return (
              <MDCQuestion
                key={key}
                index={i}
                exercise={ex as MDCExercise}
                answer={ans}
                accent={accent}
                onSubmit={(correct) => onSubmit(i, correct)}
              />
            );
          }
          if ((ex as FractionsCompExercise).subtype) {
            return (
              <FractionsCompQuestion
                key={key}
                index={i}
                exercise={ex as FractionsCompExercise}
                answer={ans}
                onSubmit={(correct) => onSubmit(i, correct ?? false)}
              />
            );
          }
          return (
            <div key={key}>
              {switcher && (switcher.maxIndex === undefined || i < switcher.maxIndex) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Nombre de fractions :</span>
                  {switcher.buttons.map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={locked}
                      onClick={() => switcher.onChange(i, n)}
                      style={{
                        padding: '4px 14px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                        border: `1px solid ${(switcher.counts[i] ?? 2) === n ? accent : 'var(--border)'}`,
                        background: (switcher.counts[i] ?? 2) === n ? `${accent}22` : 'var(--surface)',
                        color: (switcher.counts[i] ?? 2) === n ? accent : 'var(--muted)',
                        cursor: locked ? 'not-allowed' : 'pointer',
                        opacity: locked ? 0.6 : 1,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
              <FractionQuestion
                index={i}
                exercise={ex as FractionExercise}
                answer={ans}
                onSubmit={(correct) => onSubmit(i, correct ?? false)}
              />
            </div>
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

// ── Mode selectors ────────────────────────────────────────────────────────────

export function ModeCard({ label, icon, desc, accent, onClick, disabled = false }: {
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
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px', cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left', color: disabled ? 'var(--muted)' : 'var(--text)',
        transition: 'border-color 0.15s', width: '100%', opacity: disabled ? 0.55 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.borderColor = accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <div style={{ width: 38, minWidth: 38, fontSize: 22, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, color: disabled ? 'var(--muted)' : accent }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
    </button>
  );
}

const MAIN_MODES: { id: HubMode; label: string; icon: string; desc: string }[] = [
  {
    id: 'mdc',
    label: 'Mise au même dénominateur',
    icon: '=',
    desc: '5 exercices · identifier et appliquer le dénominateur commun',
  },
  {
    id: 'calculs',
    label: 'Calculs',
    icon: '÷',
    desc: '5 modes · additions, soustractions, multiplications et divisions',
  },
  {
    id: 'comp',
    label: 'Comparaisons',
    icon: '<',
    desc: '5 exercices · comparer deux fractions avec dénominateurs différents',
  },
  {
    id: 'simpl',
    label: 'Simplification',
    icon: '↓',
    desc: '6 exercices · simplification par PGCD et décomposition en facteurs premiers',
  },
  {
    id: 'problemes',
    label: 'Problèmes',
    icon: '📚',
    desc: '4 exercices · problèmes en contexte',
  },
];

const CALCULS_SUBMODES: { id: CalcSubMode; label: string; icon: string; desc: string }[] = [
  { id: 'add', label: 'Addition', icon: '+', desc: '6 exercices · multiples, premiers entre eux, entier + fraction' },
  { id: 'sub', label: 'Soustraction', icon: '−', desc: '6 exercices · multiples, premiers entre eux, entier − fraction' },
  { id: 'mul', label: 'Multiplication', icon: '×', desc: '4 exercices · simplification, facteurs premiers' },
  { id: 'div', label: 'Division', icon: '÷', desc: '5 exercices · diviser par une fraction ou un entier' },
  { id: 'complex', label: 'Calculs complexes', icon: '()', desc: '10 exercices · opérations mixtes, priorités opératoires' },
];

function MainModeSelector({ onSelect, accent }: { onSelect: (m: HubMode) => void; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
      {MAIN_MODES.map((m) => (
        <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => onSelect(m.id)} />
      ))}
    </div>
  );
}

function CalcSubModeSelector({ onSelect, onBack, accent }: {
  onSelect: (csm: CalcSubMode) => void;
  onBack: () => void;
  accent: string;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} style={{ fontSize: 13 }}>← Retour</button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>Calculs</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {CALCULS_SUBMODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => onSelect(m.id)} />
        ))}
      </div>
    </div>
  );
}

// ── FractionsHub (main export) ────────────────────────────────────────────────

export function FractionsHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode | null>(null);
  const [calcSubMode, setCalcSubMode] = useState<CalcSubMode | null>(null);
  const [exercises, setExercises] = useState<FracHubExercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);
  const [exCounts, setExCounts] = useState<(2 | 3 | 4)[]>([]);

  const loadExercises = (m: HubMode, csm: CalcSubMode | null) => {
    let exs: FracHubExercise[] = [];
    if (m === 'mdc') exs = generateMDCSeries();
    else if (m === 'comp') exs = generateCompSeries();
    else if (m === 'simpl') exs = generateSimplSeries();
    else if (m === 'problemes') exs = generateProblemsSeries();
    else if (m === 'calculs' && csm !== null) {
      if (csm === 'add') exs = generateAddSeries();
      else if (csm === 'sub') exs = generateSubSeries();
      else if (csm === 'mul') exs = generateMulSeries();
      else if (csm === 'div') exs = generateDivSeries();
      else if (csm === 'complex') exs = generateFractionsComplexSeries();
    }
    if (csm === 'add' || csm === 'sub') setExCounts(new Array(5).fill(2) as (2 | 3 | 4)[]);
    if (csm === 'mul') setExCounts(new Array(4).fill(2) as (2 | 3 | 4)[]);
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeExCount = (i: number, count: 2 | 3 | 4) => {
    if (answers[i]?.status !== 'pending') return;
    if (i < 0 || i > 5) return;
    setExCounts((prev) => {
      const next = [...prev] as (2 | 3 | 4)[];
      next[i] = count;
      return next;
    });
    const newEx = calcSubMode === 'sub'
      ? makeSubAtPos(i as 0 | 1 | 2 | 3 | 4 | 5, count)
      : calcSubMode === 'mul'
        ? makeMulAtPos(i as 0 | 1 | 2 | 3, count as 2 | 3)
        : makeAddAtPos(i as 0 | 1 | 2 | 3 | 4 | 5, count);
    setExercises((prev) => prev.map((e, idx) => (idx === i ? newEx : e)));
    setAnswers((prev) =>
      prev.map((a, idx) =>
        idx === i ? { value: '', status: 'pending', resetKey: (a.resetKey ?? 0) + 1 } : a
      )
    );
  };

  const selectMode = (m: HubMode) => {
    setMode(m);
    if (m !== 'calculs') {
      loadExercises(m, null);
    }
  };

  const selectCalcSubMode = (csm: CalcSubMode) => {
    setCalcSubMode(csm);
    loadExercises('calculs', csm);
  };

  const submit = (i: number, correct: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, status: correct ? 'correct' : 'wrong' } : a))
    );
  };

  const resetErrors = () => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.status === 'correct' ? a : { value: '', status: 'pending', resetKey: a.resetKey + 1 }
      )
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newSeries = () => {
    if (mode !== null) loadExercises(mode, calcSubMode);
  };

  const goBack = () => {
    if (mode === 'calculs' && calcSubMode !== null) {
      setCalcSubMode(null);
      setExercises([]);
      setAnswers([]);
    } else {
      setMode(null);
      setCalcSubMode(null);
      setExercises([]);
      setAnswers([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getModeLabel = (): string => {
    if (mode === 'mdc') return 'Mise au même dénominateur';
    if (mode === 'comp') return 'Comparaisons';
    if (mode === 'simpl') return 'Simplification';
    if (mode === 'problemes') return 'Problèmes';
    if (mode === 'calculs') {
      if (calcSubMode === 'add') return 'Addition';
      if (calcSubMode === 'sub') return 'Soustraction';
      if (calcSubMode === 'mul') return 'Multiplication';
      if (calcSubMode === 'div') return 'Division';
      if (calcSubMode === 'complex') return 'Calculs complexes';
    }
    return '';
  };

  if (mode === null) {
    return <MainModeSelector onSelect={selectMode} accent={accent} />;
  }

  if (mode === 'calculs' && calcSubMode === null) {
    return <CalcSubModeSelector onSelect={selectCalcSubMode} onBack={() => setMode(null)} accent={accent} />;
  }

  return (
    <QuizView
      modeLabel={getModeLabel()}
      exercises={exercises}
      answers={answers}
      accent={accent}
      accentSecondary={accentSecondary}
      seriesKey={seriesKey}
      switcher={
        calcSubMode === 'add' || calcSubMode === 'sub'
          ? { counts: exCounts, buttons: [2, 3, 4] as const, maxIndex: 5, onChange: changeExCount }
          : calcSubMode === 'mul'
            ? { counts: exCounts, buttons: [2, 3] as const, onChange: changeExCount }
            : undefined
      }
      onSubmit={submit}
      onResetErrors={resetErrors}
      onNewSeries={newSeries}
      onBack={goBack}
    />
  );
}
