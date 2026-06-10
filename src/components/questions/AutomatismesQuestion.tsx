import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { AutoQCMExercise, AutoCalcExercise, AutoPart } from '@/types';

interface AnswerState {
  value: string;
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

// ── Answer normalisation & checking ──────────────────────────────────────────

function normalizeAns(s: string): string {
  return s.trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/,(\d)/g, '.$1')   // French decimal comma only before a digit
    .replace(/[×·]/g, '*')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\bpi\b/g, 'π')
    .replace(/°/g, '');
}

function checkAutoAns(student: string, expected: string, alts?: string[]): boolean {
  if (student.trim() === '') return false;
  const n = normalizeAns(student);
  const e = normalizeAns(expected);
  if (n === e) return true;
  if (alts) {
    for (const alt of alts) {
      if (n === normalizeAns(alt)) return true;
    }
  }
  const nNum = parseFloat(n.replace(/[^0-9.\-]/g, ''));
  const eNum = parseFloat(e.replace(/[^0-9.\-]/g, ''));
  const isPureNum = (s: string) => /^-?\d+(\.\d+)?$/.test(s);
  if (isPureNum(n) && isPureNum(e) && !isNaN(nNum) && !isNaN(eNum)) {
    if (Math.abs(nNum - eNum) < 0.005) return true;
  }
  const frac = (s: string) => s.match(/^(-?\d+)\/(\d+)$/);
  const nF = frac(n), eF = frac(e);
  if (nF && eF) {
    return parseInt(nF[1]!) * parseInt(eF[2]!) === parseInt(eF[1]!) * parseInt(nF[2]!);
  }
  if (nF) {
    const v = parseInt(nF[1]!) / parseInt(nF[2]!);
    if (isPureNum(e) && !isNaN(eNum) && Math.abs(v - eNum) < 0.005) return true;
  }
  if (eF) {
    const v = parseInt(eF[1]!) / parseInt(eF[2]!);
    if (isPureNum(n) && !isNaN(nNum) && Math.abs(nNum - v) < 0.005) return true;
  }
  return false;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inpStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
  padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--bg)', color: 'var(--text)', width: 120,
};

const borderFor = (st: 'pending' | 'correct' | 'wrong') => {
  if (st === 'correct') return '1px solid var(--correct)';
  if (st === 'wrong') return '1px solid var(--wrong)';
  return '1px solid var(--border)';
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
      background: 'var(--surface2)', color: 'var(--muted)', letterSpacing: 0.3,
    }}>
      {category}
    </span>
  );
}

// ── QCM Card ──────────────────────────────────────────────────────────────────

function AutoQCMCard({ exercise, answer, accent, onSubmit }: {
  exercise: AutoQCMExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const submitted = useRef(false);
  const isDone = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const handleChoice = (i: number) => {
    if (isDone || submitted.current) return;
    submitted.current = true;
    setChosen(i);
    const ok = i === exercise.correctIndex;
    if (!ok) setHintOpen(true);
    onSubmit(ok);
  };

  return (
    <div className={`qcard${answer.status === 'correct' ? ' correct-card' : answer.status === 'wrong' || answer.status === 'revealed' ? ' wrong-card' : ''}`}
      style={{ gridColumn: '1 / -1', borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.7rem' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>Q{exercise.qnum}</span>
        <CategoryBadge category={exercise.category} />
      </div>
      <div style={{ fontSize: 14, marginBottom: '1rem', lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: exercise.questionHtml }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {exercise.choices.map((choiceHtml, i) => {
          const isChosen = chosen === i;
          const isCorrect = i === exercise.correctIndex;
          let bg = 'var(--surface2)';
          let border = '1px solid var(--border2)';
          let color = 'var(--text)';
          if (isDone) {
            if (isCorrect) { border = '2px solid var(--correct)'; bg = isChosen ? 'var(--correct)' : 'var(--surface2)'; color = isChosen ? 'white' : 'var(--text)'; }
            else if (isChosen) { border = '1px solid var(--wrong)'; bg = 'var(--wrong)'; color = 'white'; }
          }
          return (
            <button key={i} disabled={isDone}
              onClick={() => handleChoice(i)}
              style={{ textAlign: 'left', padding: '8px 14px', borderRadius: 8, border, background: bg, color, fontSize: 14, cursor: isDone ? 'default' : 'pointer' }}>
              <span dangerouslySetInnerHTML={{ __html: choiceHtml }} />
            </button>
          );
        })}
      </div>
      {isDone && (
        <div style={{ marginTop: '0.8rem', fontSize: 13, color: answer.status === 'correct' ? 'var(--correct)' : 'var(--wrong)', fontFamily: "'DM Mono', monospace" }}>
          {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect — la bonne réponse est surlignée en vert.'}
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen(o => !o)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          <div dangerouslySetInnerHTML={{ __html: exercise.stepsHtml }} />
        </div>
      </div>
    </div>
  );
}

// ── Calc Card ─────────────────────────────────────────────────────────────────

interface PartState {
  val: string;
  yesNo: boolean | null;
  status: 'pending' | 'correct' | 'wrong';
  feedback: string;
  hintOpen: boolean;
}

function AutoCalcCard({ exercise, answer, accent, onSubmit }: {
  exercise: AutoCalcExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [parts, setParts] = useState<PartState[]>(
    exercise.parts.map(() => ({ val: '', yesNo: null, status: 'pending', feedback: '', hintOpen: false }))
  );
  const submitted = useRef(false);
  const isDone = answer.status !== 'pending';

  useEffect(() => {
    if (submitted.current || answer.status !== 'pending') return;
    if (parts.every(p => p.status !== 'pending')) {
      submitted.current = true;
      onSubmit(parts.every(p => p.status === 'correct'));
    }
  }, [parts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (answer.status === 'revealed') {
      setParts(prev => prev.map(p => ({
        ...p, hintOpen: true, status: p.status === 'pending' ? 'wrong' : p.status,
        feedback: p.status === 'pending' ? '✗ Non répondu.' : p.feedback,
      })));
    }
  }, [answer.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (i: number) => {
    if (isDone || parts[i]!.status !== 'pending') return;
    const part: AutoPart = exercise.parts[i]!;
    if (part.isYesNo) return;
    const val = parts[i]!.val;
    if (val.trim() === '') return;
    const ok = checkAutoAns(val, part.answer, part.altAnswers);
    setParts(prev => prev.map((p, idx) => idx === i
      ? { ...p, status: ok ? 'correct' : 'wrong', feedback: ok ? '✓ Correct !' : '✗ Incorrect.', hintOpen: !ok }
      : p));
  };

  const validateYesNo = (i: number, choice: boolean) => {
    if (isDone || parts[i]!.status !== 'pending') return;
    const part: AutoPart = exercise.parts[i]!;
    if (!part.isYesNo || part.ansYesNo === undefined) return;
    const ok = choice === part.ansYesNo;
    setParts(prev => prev.map((p, idx) => idx === i
      ? { ...p, yesNo: choice, status: ok ? 'correct' : 'wrong', feedback: ok ? '✓ Correct !' : '✗ Incorrect.', hintOpen: !ok }
      : p));
  };

  const setVal = (i: number, val: string) =>
    setParts(prev => prev.map((p, idx) => idx === i ? { ...p, val } : p));

  const toggleHint = (i: number) =>
    setParts(prev => prev.map((p, idx) => idx === i ? { ...p, hintOpen: !p.hintOpen } : p));

  return (
    <div className={`qcard${answer.status === 'correct' ? ' correct-card' : answer.status === 'wrong' || answer.status === 'revealed' ? ' wrong-card' : ''}`}
      style={{ gridColumn: '1 / -1', borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.7rem' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>Q{exercise.qnum}</span>
        <CategoryBadge category={exercise.category} />
      </div>
      <div style={{ fontSize: 14, marginBottom: '1rem', lineHeight: 1.8, background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px' }}
        dangerouslySetInnerHTML={{ __html: exercise.questionHtml }} />
      {exercise.parts.map((part, i) => {
        const ps = parts[i]!;
        const partDone = isDone || ps.status !== 'pending';
        return (
          <div key={i} style={{ marginBottom: '0.8rem', padding: '10px 14px', borderRadius: 10, border: borderFor(ps.status), background: 'var(--surface)' }}>
            {part.isYesNo ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>{part.label}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {([true, false] as const).map(choice => {
                    const label = choice ? 'Oui' : 'Non';
                    const isSelected = ps.yesNo === choice;
                    const done = ps.status !== 'pending';
                    const btnCol = isSelected && done
                      ? (ps.status === 'correct' ? 'var(--correct)' : 'var(--wrong)') : undefined;
                    return (
                      <button key={label} disabled={partDone}
                        onClick={() => validateYesNo(i, choice)}
                        style={{
                          padding: '6px 22px', fontSize: 14, borderRadius: 8,
                          cursor: done ? 'default' : 'pointer',
                          border: `1px solid ${btnCol ?? 'var(--border2)'}`,
                          background: isSelected && done ? btnCol : 'var(--surface2)',
                          color: isSelected && done ? 'white' : 'var(--text)',
                          fontWeight: isSelected ? 700 : 400,
                        }}>{label}</button>
                    );
                  })}
                  {ps.status !== 'pending' && (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: ps.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                      {ps.feedback}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}
                  dangerouslySetInnerHTML={{ __html: part.label }} />
                <input type="text" value={ps.val} placeholder="…" disabled={partDone}
                  onChange={e => setVal(i, e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') validate(i); }}
                  style={{ ...inpStyle, border: borderFor(ps.status) }} />
                {!partDone && (
                  <button className="btn-secondary" onClick={() => validate(i)}
                    style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>OK</button>
                )}
                {ps.status !== 'pending' && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: ps.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                    {ps.feedback}
                  </span>
                )}
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              <button type="button" className="hint-toggle" onClick={() => toggleHint(i)}>
                <span>{ps.hintOpen ? '▼' : '▶'}</span> Voir la correction
              </button>
              <div className={`steps-box${ps.hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
                <div dangerouslySetInnerHTML={{ __html: part.stepsHtml }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function AutomatismesQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: AutoQCMExercise | AutoCalcExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  if (exercise.exKind === 'auto-qcm') {
    return <AutoQCMCard exercise={exercise} answer={answer} accent={accent} onSubmit={onSubmit} />;
  }
  return <AutoCalcCard exercise={exercise} answer={answer} accent={accent} onSubmit={onSubmit} />;
}
