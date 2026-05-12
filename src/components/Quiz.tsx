import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ArithExercise,
  PropExercise,
  EquationExercise,
  Exercise,
  FractionExercise,
  FractionsCompExercise,
  LiteralExercise,
  NumberExercise,
  ProduitExercise,
  ProgrammeExercise,
  PuissancesExercise,
  PythagoreExercise,
  QuizDefinition,
  ReciproqueExercise,
  RoundingExercise,
  ThalesExercise,
} from '@/types';
import { runGenerator } from '@/lib/runGenerator';
import { literalCheckAnswer } from '@/lib/generators/literal';
import { NumberQuestion } from './questions/NumberQuestion';
import { RoundingQuestion } from './questions/RoundingQuestion';
import { TextQuestion } from './questions/TextQuestion';
import { FigureTextQuestion } from './questions/FigureTextQuestion';
import { ArithQuestion } from './questions/ArithQuestion';
import { ProgrammeQuestion } from './questions/ProgrammeQuestion';
import { PythagoreQuestion } from './questions/PythagoreQuestion';
import { ThalesQuestion } from './questions/ThalesQuestion';
import { FractionQuestion } from './questions/FractionQuestion';
import { FractionsCompQuestion } from './questions/FractionsCompQuestion';
import { EquationQuestion } from './questions/EquationQuestion';
import { ReciproqueQuestion } from './questions/ReciproqueQuestion';
import { PuissancesQuestion } from './questions/PuissancesQuestion';
import { PropQuestion } from './questions/PropQuestion';

interface QuizProps {
  quiz: QuizDefinition;
}

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

const emptyAnswer = (): AnswerState => ({ value: '', status: 'pending', resetKey: 0 });

function buildAnswers(n: number): AnswerState[] {
  return Array.from({ length: n }, emptyAnswer);
}

function checkAnswer(quiz: QuizDefinition, ex: Exercise, value: string): boolean {
  if (value.trim() === '') return false;
  if (quiz.renderer === 'number') {
    const num = Number(value.replace(',', '.'));
    if (Number.isNaN(num)) return false;
    return num === (ex as NumberExercise).ans;
  }
  if (quiz.renderer === 'rounding') {
    const v = parseFloat(value.trim().replace(',', '.'));
    if (Number.isNaN(v)) return false;
    const rex = ex as RoundingExercise;
    return Math.abs(v - rex.ans) < 0.5 * Math.pow(10, -rex.decimals);
  }
  if (quiz.renderer === 'literal') {
    const lex = ex as LiteralExercise;
    if (lex.isNum) {
      const studentNum = parseFloat(value.trim().replace(',', '.'));
      const expectedNum = parseFloat(lex.ans);
      return !Number.isNaN(studentNum) && Math.abs(studentNum - expectedNum) < 0.001;
    }
    if (lex.subtype === 'scientific') {
      // Accepts comma or period as decimal separator, × / * / x as multiply sign.
      const normSci = (s: string) =>
        s.toLowerCase()
          .replace(/\s+/g, '')
          .replace(/,/g, '.')
          .replace(/×/g, '*')
          .replace(/−/g, '-')
          .replace(/(\d)x(\d)/g, '$1*$2');
      return normSci(value) === normSci(lex.ans);
    }
    return literalCheckAnswer(value, lex.ans);
  }
  if (quiz.renderer === 'produit') {
    return literalCheckAnswer(value, (ex as ProduitExercise).ans);
  }
  return false;
}

function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

function splitTitle(title: string, sub?: string): { main: string; tail: string | null } {
  if (!sub) return { main: title, tail: null };
  const idx = title.lastIndexOf(sub);
  if (idx < 0) return { main: title, tail: null };
  // Keep whatever character (or none) sat between main and sub in the source title —
  // "Entiers relatifs" → "Entiers " + "relatifs"; "Arithmétique" → "Arith" + "métique".
  return { main: title.slice(0, idx), tail: sub };
}

export default function Quiz({ quiz }: QuizProps) {
  const [exercises, setExercises] = useState<Exercise[]>(() => quiz.exercises);
  const [answers, setAnswers] = useState<AnswerState[]>(() => buildAnswers(quiz.exercises.length));
  // Bumped on Recommencer / Nouvelle série so renderer instances remount and clear
  // any internal state (text inputs, radio picks, hint-open, feedback messages).
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let answered = 0;
    for (const a of answers) {
      if (a.status === 'correct') {
        correct += 1;
        answered += 1;
      } else if (a.status === 'wrong' || a.status === 'revealed') {
        wrong += 1;
        answered += 1;
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

  const updateAnswer = (i: number, patch: Partial<AnswerState>) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };

  const submit = (i: number, correctOverride?: boolean) => {
    const ans = answers[i];
    if (!ans || ans.status !== 'pending') return;
    // Default-check renderers (single-input): treat empty as "do nothing", matching
    // the original Site.html behaviour (refocus-only, no scoring on empty submit).
    if (correctOverride === undefined && ans.value.trim() === '') return;
    const ok = correctOverride !== undefined
      ? correctOverride
      : checkAnswer(quiz, exercises[i]!, ans.value);
    updateAnswer(i, { status: ok ? 'correct' : 'wrong' });
  };

  const revealAll = () => {
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (a.status !== 'pending') return a;
        const ok = checkAnswer(quiz, exercises[i]!, a.value);
        return { ...a, status: ok ? 'correct' : 'revealed' };
      }),
    );
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const reset = () => {
    setAnswers(buildAnswers(exercises.length));
    setSeriesKey((k) => k + 1);
    scrollToTop();
  };

  const resetErrors = () => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.status === 'correct' ? a : { value: '', status: 'pending', resetKey: a.resetKey + 1 }
      )
    );
    scrollToTop();
  };

  const hasGenerator = !!quiz.generator && quiz.generator.length > 0;

  const newSeries = () => {
    if (!hasGenerator) return;
    const next = runGenerator(quiz.generator!);
    setExercises(next);
    setAnswers(buildAnswers(next.length));
    setSeriesKey((k) => k + 1);
    scrollToTop();
  };

  const titleStyle = {
    background: `linear-gradient(135deg, #F0EDE8 40%, ${quiz.accent})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    ...(quiz.titleFontSize ? { fontSize: quiz.titleFontSize } : {}),
  } as React.CSSProperties;

  const tailStyle = {
    WebkitTextFillColor: 'var(--muted)',
    background: 'none',
  } as React.CSSProperties;

  const accentStyle = { color: quiz.accent };
  const progressStyle = {
    width: `${(stats.answered / stats.total) * 100}%`,
    background: quiz.accentSecondary
      ? `linear-gradient(90deg, ${quiz.accent}, ${quiz.accentSecondary})`
      : quiz.accent,
  };

  const { main: titleMain, tail: titleTail } = splitTitle(quiz.title, quiz.titleSub);

  return (
    <div className="quiz-page">
      <div className="er-header">
        <h1 className="er-title" style={titleStyle}>
          {titleMain}
          {titleTail && <span style={tailStyle}>{titleTail}</span>}
        </h1>
        {quiz.subtitle && <p className="er-sub">{quiz.subtitle}</p>}
        {quiz.notice && <p className="er-sub" dangerouslySetInnerHTML={{ __html: quiz.notice }} />}
      </div>

      {quiz.formulaBanner && (
        <div
          className="formula-banner"
          style={quiz.formulaBanner.bannerStyle as React.CSSProperties | undefined}
          dangerouslySetInnerHTML={{ __html: quiz.formulaBanner.html }}
        />
      )}

      {quiz.typePills && quiz.typePills.length > 0 && (
        <div
          className="types-row"
          style={quiz.typePillsMarginBottom ? { marginBottom: quiz.typePillsMarginBottom } : undefined}
        >
          {quiz.typePills.map((p) => (
            <div key={p.label} className="type-pill" style={{ borderColor: p.color, color: p.color }}>
              <span className="dot" style={{ background: p.color }} />
              {p.label}
            </div>
          ))}
        </div>
      )}

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
        <button className="btn-primary" style={{ background: quiz.accent }} onClick={revealAll} disabled={stats.answered < stats.total}>
          Tout corriger
        </button>
        <button className="btn-secondary" onClick={resetErrors}>Recommencer les erreurs</button>
        {hasGenerator && (
          <button className="btn-secondary" onClick={newSeries}>Nouvelle série</button>
        )}
        {quiz.extraControls?.map((c) => {
          const color = c.color ?? quiz.accent;
          return (
            <a
              key={c.label}
              className="btn-secondary"
              href={c.href}
              style={{ borderColor: color, color }}
            >
              {c.label}
            </a>
          );
        })}
      </div>

      {quiz.renderer === 'number' && (
        <div className="er-grid">
          {exercises.map((ex, i) => (
            <NumberQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as NumberExercise}
              answer={answers[i]!}
              accent={quiz.accent}
              onChange={(value) => updateAnswer(i, { value })}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'rounding' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <RoundingQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as RoundingExercise}
              answer={answers[i]!}
              onChange={(value) => updateAnswer(i, { value })}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'literal' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <TextQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as LiteralExercise}
              answer={answers[i]!}
              onChange={(value) => updateAnswer(i, { value })}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'produit' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <FigureTextQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as ProduitExercise}
              answer={answers[i]!}
              onChange={(value) => updateAnswer(i, { value })}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'arith' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <ArithQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as ArithExercise}
              answer={answers[i]!}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'programme' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <ProgrammeQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as ProgrammeExercise}
              answer={answers[i]!}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'pythagore' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <PythagoreQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as PythagoreExercise}
              answer={answers[i]!}
              onChange={(value) => updateAnswer(i, { value })}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'thales' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <ThalesQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as ThalesExercise}
              answer={answers[i]!}
              onChange={(value) => updateAnswer(i, { value })}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'fractions' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <FractionQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as FractionExercise}
              answer={answers[i]!}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'fractions-comp' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <FractionsCompQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as FractionsCompExercise}
              answer={answers[i]!}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'equation' && (
        <div className="eq-list">
          {exercises.map((ex, i) => (
            <EquationQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as EquationExercise}
              answer={answers[i]!}
              onChange={(value) => updateAnswer(i, { value })}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'reciproque' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <ReciproqueQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as ReciproqueExercise}
              answer={answers[i]!}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'prop' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <PropQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as PropExercise}
              answer={answers[i]!}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {quiz.renderer === 'puissances' && (
        <div className="questions-list">
          {exercises.map((ex, i) => (
            <PuissancesQuestion
              key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex as PuissancesExercise}
              answer={answers[i]!}
              onSubmit={(correct) => submit(i, correct)}
            />
          ))}
        </div>
      )}

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${quiz.accent}` }}>
          <h2 style={{ color: quiz.accent }}>
            {endTitle(Math.round((stats.correct / stats.total) * 100))}
          </h2>
          <p>
            Score : {stats.correct} / {stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)
          </p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={reset}>Recommencer</button>
            {hasGenerator && (
              <button className="btn-primary" style={{ background: quiz.accent }} onClick={newSeries}>
                Nouvelle série
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
