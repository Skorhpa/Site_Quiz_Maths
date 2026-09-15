import { useEffect, useMemo, useRef, useState } from 'react';
import type { DecimalFracExercise, LiteralExercise } from '@/types';
import { generateDecimauxSeries, generateDecimauxInverseSeries, generateEcritureSeries } from '@/lib/generators/decimaux';
import { literalCheckAnswer } from '@/lib/generators/literal';
import { TextQuestion } from './TextQuestion';
import { DecimalFracQuestion } from './DecimalFracQuestion';
import { ModeCard } from './FractionsHub';

type HubMode = 'vers-decimal' | 'vers-fraction' | 'ecriture';

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

function checkLiteralAnswer(ex: LiteralExercise, value: string): boolean {
  if (value.trim() === '') return false;
  if (ex.isNum) {
    const studentNum = parseFloat(value.trim().replace(',', '.'));
    const expectedNum = parseFloat(ex.ans.replace(',', '.'));
    return !Number.isNaN(studentNum) && Math.abs(studentNum - expectedNum) < 0.001;
  }
  return literalCheckAnswer(value, ex.ans);
}

const MODES: { id: HubMode; label: string; icon: string; desc: string }[] = [
  {
    id: 'vers-decimal',
    label: 'De fractions décimales à nombres décimaux',
    icon: '0,1',
    desc: '18 questions · sommes de fractions décimales, fractions décimales, écriture décimale',
  },
  {
    id: 'vers-fraction',
    label: 'De nombre décimal à fraction décimale',
    icon: 'n/d',
    desc: '18 questions · décomposition, partie entière + fraction, écriture fractionnaire',
  },
  {
    id: 'ecriture',
    label: "Connaître l'écriture décimale",
    icon: '0…9',
    desc: '15 questions · zéros inutiles, chiffre des dixièmes, centièmes, unités, dizaines, centaines',
  },
];

export function DecimauxHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode | null>(null);
  const [exercises, setExercises] = useState<(LiteralExercise | DecimalFracExercise)[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const loadExercises = (m: HubMode) => {
    const exs =
      m === 'vers-decimal' ? generateDecimauxSeries()
      : m === 'vers-fraction' ? generateDecimauxInverseSeries()
      : generateEcritureSeries();
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectMode = (m: HubMode) => {
    setMode(m);
    loadExercises(m);
  };

  const goBack = () => {
    setMode(null);
    setExercises([]);
    setAnswers([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateAnswer = (i: number, patch: Partial<AnswerState>) =>
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const submit = (i: number, correctOverride?: boolean) => {
    const ans = answers[i];
    if (!ans || ans.status !== 'pending') return;
    if (correctOverride !== undefined) {
      updateAnswer(i, { status: correctOverride ? 'correct' : 'wrong' });
      return;
    }
    // Only the TextQuestion-based modes ('vers-decimal', 'ecriture') submit without a precomputed result.
    if (mode === 'vers-fraction' || ans.value.trim() === '') return;
    const ok = checkLiteralAnswer(exercises[i] as LiteralExercise, ans.value);
    updateAnswer(i, { status: ok ? 'correct' : 'wrong' });
  };

  const resetErrors = () => {
    setAnswers((prev) =>
      prev.map((a) => (a.status === 'correct' ? a : { value: '', status: 'pending', resetKey: a.resetKey + 1 }))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newSeries = () => {
    if (mode !== null) loadExercises(mode);
  };

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

  if (mode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {MODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => selectMode(m.id)} />
        ))}
      </div>
    );
  }

  const accentStyle = { color: accent };
  const progressStyle = {
    width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`,
    background: accentSecondary ? `linear-gradient(90deg, ${accent}, ${accentSecondary})` : accent,
  };
  const modeLabel = MODES.find((m) => m.id === mode)?.label ?? '';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={goBack} style={{ fontSize: 13 }}>
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
        <button className="btn-secondary" onClick={resetErrors} disabled={stats.wrong === 0}>
          Recommencer les erreurs
        </button>
        <button className="btn-secondary" onClick={newSeries}>Nouvelle série</button>
      </div>

      <div className="questions-list">
        {mode !== 'vers-fraction'
          ? (exercises as LiteralExercise[]).map((ex, i) => (
              <TextQuestion
                key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
                index={i}
                exercise={ex}
                answer={answers[i]!}
                onChange={(value) => updateAnswer(i, { value })}
                onSubmit={(correct) => submit(i, correct)}
              />
            ))
          : (exercises as DecimalFracExercise[]).map((ex, i) => (
              <DecimalFracQuestion
                key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
                index={i}
                exercise={ex}
                answer={answers[i]!}
                onSubmit={(correct) => submit(i, correct)}
              />
            ))}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>{endTitle(Math.round((stats.correct / stats.total) * 100))}</h2>
          <p>Score : {stats.correct} / {stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)</p>
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
