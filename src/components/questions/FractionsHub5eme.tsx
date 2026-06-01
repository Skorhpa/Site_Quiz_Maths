import { useState } from 'react';
import type { FractionExercise, FractionsCompExercise, MDCExercise } from '@/types';
import { generateMDCSeries } from '@/lib/generators/fractions-hub';
import {
  generateAddSeries,
  generateSubSeries,
  generateProblemsSeries,
  makeAddAtPos,
  makeSubAtPos,
} from '@/lib/generators/fractions';
import { generateCompSeries, generateSimplSeries } from '@/lib/generators/fractions-comp';
import {
  type FracHubExercise,
  type AnswerState,
  emptyAnswer,
  buildAnswers,
  endTitle as _endTitle,
  CARD_CLASS as _CARD_CLASS,
  MDCQuestion,
  QuizView,
  ModeCard,
} from './FractionsHub';

// suppress unused-import warnings for re-exported symbols used only by QuizView
void _endTitle;
void _CARD_CLASS;

type HubMode = 'mdc' | 'calculs' | 'comp' | 'simpl' | 'problemes';
type CalcSubMode = 'add' | 'sub';

const MAIN_MODES: { id: HubMode; label: string; icon: string; desc: string }[] = [
  { id: 'mdc',      label: 'Mise au même dénominateur', icon: '=',  desc: '2 exercices · identifier et appliquer le dénominateur commun' },
  { id: 'calculs',  label: 'Calculs',                   icon: '÷',  desc: '2 modes · additions et soustractions de fractions' },
  { id: 'comp',     label: 'Comparaisons',              icon: '<',  desc: '2 exercices · comparer deux fractions avec dénominateurs différents' },
  { id: 'simpl',    label: 'Simplification',            icon: '↓',  desc: '6 exercices · simplification par PGCD et décomposition en facteurs premiers' },
  { id: 'problemes',label: 'Problèmes',                 icon: '📚', desc: '2 exercices · fractions et répartition en contexte' },
];

const CALCULS_SUBMODES: { id: CalcSubMode; label: string; icon: string; desc: string }[] = [
  { id: 'add', label: 'Addition',     icon: '+', desc: '3 exercices · mêmes dénominateurs, multiples, entier + fraction' },
  { id: 'sub', label: 'Soustraction', icon: '−', desc: '3 exercices · mêmes dénominateurs, multiples, entier − fraction' },
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

export function FractionsHub5eme({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode | null>(null);
  const [calcSubMode, setCalcSubMode] = useState<CalcSubMode | null>(null);
  const [exercises, setExercises] = useState<FracHubExercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);
  const [exCounts, setExCounts] = useState<(2 | 3 | 4)[]>([]);

  const loadExercises = (m: HubMode, csm: CalcSubMode | null) => {
    let exs: FracHubExercise[] = [];
    if (m === 'mdc') {
      exs = generateMDCSeries().slice(0, 2);
    } else if (m === 'comp') {
      exs = generateCompSeries().filter((_, i) => [0, 2].includes(i));
    } else if (m === 'simpl') {
      exs = generateSimplSeries();
    } else if (m === 'problemes') {
      exs = generateProblemsSeries().slice(2);
    } else if (m === 'calculs' && csm !== null) {
      if (csm === 'add') exs = generateAddSeries().filter((_, i) => [0, 1, 5].includes(i));
      else if (csm === 'sub') exs = generateSubSeries().filter((_, i) => [0, 1, 5].includes(i));
    }
    if (csm === 'add' || csm === 'sub') setExCounts(new Array(2).fill(2) as (2 | 3 | 4)[]);
    setExercises(exs);
    setAnswers(buildAnswers(exs.length));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeExCount = (i: number, count: 2 | 3 | 4) => {
    if (answers[i]?.status !== 'pending') return;
    if (i < 0 || i > 1) return;
    setExCounts((prev) => {
      const next = [...prev] as (2 | 3 | 4)[];
      next[i] = count;
      return next;
    });
    const newEx = calcSubMode === 'sub'
      ? makeSubAtPos(i as 0 | 1 | 2 | 3 | 4 | 5, count)
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
    if (m !== 'calculs') loadExercises(m, null);
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
          ? { counts: exCounts, buttons: [2, 3, 4] as const, maxIndex: 2, onChange: changeExCount }
          : undefined
      }
      onSubmit={submit}
      onResetErrors={resetErrors}
      onNewSeries={newSeries}
      onBack={goBack}
    />
  );
}
