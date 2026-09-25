import { useEffect, useMemo, useRef, useState } from 'react';
import { ModeCard } from './FractionsHub';

type HubMode = 'reperage' | null;

interface AnswerState {
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

const emptyAnswer = (): AnswerState => ({ status: 'pending', resetKey: 0 });

function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
// A last digit of 0 hides the intended decimal precision (e.g. 1,50 → "1,5") — avoid it when a specific precision is wanted.
const randNonZeroDigit = () => randInt(1, 9);

// Rounds to (at most) 3 decimals and trims trailing zeros, e.g. 0.300 → "0,3", 5.402 → "5,402".
const fmtNum = (n: number) => {
  const rounded = Math.round(n * 1000) / 1000;
  let s = rounded.toFixed(3);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('.', ',');
};

function checkNumericAnswer(raw: string, expected: number): boolean {
  const compact = raw.replace(/\s+/g, '');
  if (compact === '') return false;
  const v = parseFloat(compact.replace(',', '.'));
  // Tolérance stricte : la plus petite différence entre deux graduations voisines est 0,001 (millièmes).
  return !Number.isNaN(v) && Math.abs(v - expected) < 0.0005;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function makeTicks(start: number, step: number, count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) arr.push(Math.round((start + i * step) * 1000) / 1000);
  return arr;
}

const smallInp: React.CSSProperties = {
  width: 44, fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
  padding: '5px 3px', borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--bg)', color: 'var(--text)', textAlign: 'center',
};

// Letters used to name points — I/O/Q skipped to avoid confusion with 1/0 and each other.
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V'] as const;

// ── Axe gradué (ligne + graduations régulières) ─────────────────────────────────

function AxisLine({ ticks, renderBelow, renderAbove }: {
  ticks: number[];
  renderBelow: (i: number) => React.ReactNode;
  renderAbove?: (i: number) => React.ReactNode;
}) {
  return (
    <div style={{ margin: '18px 0 6px' }}>
      {renderAbove && (
        <div style={{ display: 'flex' }}>
          {ticks.map((_, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flex: '1 1 0', minWidth: 0, minHeight: 20 }}>
              {renderAbove(i)}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', height: 18 }}>
        <div style={{ position: 'absolute', left: 0, right: 12, top: '50%', height: 2, background: 'var(--text)', transform: 'translateY(-50%)' }} />
        <span style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', fontSize: 17, lineHeight: 1, color: 'var(--text)' }}>→</span>
        <div style={{ display: 'flex', height: '100%' }}>
          {ticks.map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1 1 0', minWidth: 0 }}>
              <div style={{ width: 2, height: 14, background: 'var(--text)' }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        {ticks.map((_, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center', flex: '1 1 0', minWidth: 0, marginTop: 4 }}>
            {renderBelow(i)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Génération partagée des axes (toujours positifs, demi-droite depuis 0) ──────

type Precision = 0 | 1 | 2 | 3;

function buildTicksForPrecision(precision: Precision, count: number): number[] {
  if (precision === 0) {
    const step = pick([1, 2] as const);
    const start = randInt(0, 4) * step;
    return makeTicks(start, step, count);
  }
  if (precision === 1) {
    const step = pick([0.1, 0.2] as const);
    const start = randInt(0, 6);
    return makeTicks(start, step, count);
  }
  if (precision === 2) {
    const intPart = randInt(0, 6);
    const d1 = randNonZeroDigit();
    const start = Math.round((intPart + d1 / 10) * 10) / 10;
    const step = pick([0.01, 0.02] as const);
    return makeTicks(start, step, count);
  }
  const intPart = randInt(0, 6);
  const d1 = randNonZeroDigit();
  const d2 = randInt(0, 9);
  const start = Math.round((intPart + d1 / 10 + d2 / 100) * 100) / 100;
  const step = pick([0.001, 0.002] as const);
  return makeTicks(start, step, count);
}

/** Une demi-droite qui balaie exactement une unité du niveau de précision au-dessus (0 à 1, ou 6,3 à 6,4…). */
function buildSweepTicks(precision: 1 | 2 | 3): number[] {
  const step = Math.pow(10, -precision);
  if (precision === 1) return makeTicks(randInt(0, 8), step, 11);
  if (precision === 2) {
    const intPart = randInt(0, 8);
    const d1 = randNonZeroDigit();
    return makeTicks(Math.round((intPart + d1 / 10) * 10) / 10, step, 11);
  }
  const intPart = randInt(0, 8);
  const d1 = randNonZeroDigit();
  const d2 = randInt(0, 9);
  return makeTicks(Math.round((intPart + d1 / 10 + d2 / 100) * 100) / 100, step, 11);
}

/** Choisit 2 repères, parfois adjacents, parfois avec une graduation d'écart, n'importe où sur l'axe. */
function pickTwoIdx(count: number): [number, number] {
  const gap = Math.random() < 0.5 ? 1 : 2;
  const candidates: [number, number][] = [];
  for (let start = 0; start + gap < count; start++) candidates.push([start, start + gap]);
  return pick(candidates);
}

function pickPointIdx(count: number, labeledIdx: readonly number[], n: number): number[] {
  const available = Array.from({ length: count }, (_, i) => i).filter((i) => !labeledIdx.includes(i));
  return shuffle(available).slice(0, n);
}

// ── Q1 : compléter chaque graduation (dixièmes / centièmes / millièmes) ─────────

interface AxisFillPart {
  ticks: number[];
  givenIdx: [number, number];
}

interface AxisFillExercise {
  parts: AxisFillPart[];
}

function generateAxisFill(): AxisFillExercise {
  const parts = ([1, 2, 3] as const).map((precision) => {
    const ticks = buildSweepTicks(precision);
    const givenIdx = pickTwoIdx(ticks.length);
    return { ticks, givenIdx };
  });
  return { parts };
}

interface AxisFillPartState {
  vals: string[];
  status: 'pending' | 'correct' | 'wrong';
  hintOpen: boolean;
}

function AxisFillQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: AxisFillExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const blanksFor = (part: AxisFillPart) => part.ticks.map((_, i) => i).filter((i) => !part.givenIdx.includes(i));

  const [parts, setParts] = useState<AxisFillPartState[]>(
    exercise.parts.map((p) => ({ vals: blanksFor(p).map(() => ''), status: 'pending', hintOpen: false }))
  );
  const submitted = useRef(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (submitted.current || answer.status !== 'pending') return;
    if (parts.every((p) => p.status !== 'pending')) {
      submitted.current = true;
      onSubmit(parts.every((p) => p.status === 'correct'));
    }
  }, [parts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (answer.status === 'revealed') {
      setParts((prev) => prev.map((p) => ({ ...p, hintOpen: true, status: p.status === 'pending' ? 'wrong' : p.status })));
    }
  }, [answer.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const setVal = (pi: number, bi: number, v: string) =>
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, vals: p.vals.map((x, j) => (j === bi ? v : x)) } : p)));

  const validate = (pi: number) => {
    if (disabled || parts[pi]!.status !== 'pending') return;
    const part = exercise.parts[pi]!;
    if (parts[pi]!.vals.some((v) => v.trim() === '')) return;
    const blanks = blanksFor(part);
    const ok = blanks.every((tickIdx, bi) => checkNumericAnswer(parts[pi]!.vals[bi]!, part.ticks[tickIdx]!));
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, status: ok ? 'correct' : 'wrong', hintOpen: !ok } : p)));
  };

  const toggleHint = (pi: number) => setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, hintOpen: !p.hintOpen } : p)));

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          Compléter une graduation
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Écris, sous chaque trait de graduation, le nombre décimal qui convient.
      </p>
      {exercise.parts.map((part, pi) => {
        const ps = parts[pi]!;
        const partDone = disabled || ps.status !== 'pending';
        const borderCol = ps.status === 'correct' ? 'var(--correct)' : ps.status === 'wrong' ? 'var(--wrong)' : 'var(--border2)';
        const blanks = blanksFor(part);
        return (
          <div key={pi} style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderCol}`, background: 'var(--surface)' }}>
            <AxisLine
              ticks={part.ticks}
              renderBelow={(i) =>
                part.givenIdx.includes(i) ? (
                  <strong style={{ fontSize: 13 }}>{fmtNum(part.ticks[i]!)}</strong>
                ) : (
                  <input
                    type="text"
                    value={ps.vals[blanks.indexOf(i)]}
                    placeholder="?"
                    disabled={partDone}
                    onChange={(e) => setVal(pi, blanks.indexOf(i), e.target.value)}
                    style={smallInp}
                  />
                )
              }
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              {!partDone && (
                <button className="btn-secondary" onClick={() => validate(pi)} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8 }}>
                  OK
                </button>
              )}
              {ps.status !== 'pending' && (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: ps.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                  {ps.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
                </span>
              )}
            </div>
            <div style={{ marginTop: 6 }}>
              <button type="button" className="hint-toggle" onClick={() => toggleHint(pi)}>
                <span>{ps.hintOpen ? '▼' : '▶'}</span> Voir la correction
              </button>
              <div className={`steps-box${ps.hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
                <AxisLine ticks={part.ticks} renderBelow={(i) => <strong style={{ fontSize: 13, color: 'var(--correct)' }}>{fmtNum(part.ticks[i]!)}</strong>} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Q : lire l'abscisse d'un point ────────────────────────────────────────────

interface AxisReadPointRef {
  letter: string;
  idx: number;
}

interface AxisReadPart {
  ticks: number[];
  labeledIdx: [number, number];
  points: AxisReadPointRef[];
}

interface AxisReadExercise {
  parts: AxisReadPart[];
}

function generateAxisRead(): AxisReadExercise {
  const parts = ([0, 1, 2] as const).map((precision) => {
    const count = 9;
    const ticks = buildTicksForPrecision(precision, count);
    const labeledIdx = pickTwoIdx(count);
    const idxs = pickPointIdx(count, labeledIdx, 3);
    const points = idxs.map((idx, k) => ({ letter: ['A', 'B', 'C'][k]!, idx }));
    return { ticks, labeledIdx, points };
  });
  return { parts };
}

/** Lettre du point, affichée juste au-dessus du trait de graduation correspondant. */
function PointMarker({ letter }: { letter: string }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{letter}</div>
  );
}

interface AxisReadPartState {
  vals: string[];
  status: 'pending' | 'correct' | 'wrong';
  hintOpen: boolean;
}

function AxisReadQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: AxisReadExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [parts, setParts] = useState<AxisReadPartState[]>(
    exercise.parts.map((p) => ({ vals: p.points.map(() => ''), status: 'pending', hintOpen: false }))
  );
  const submitted = useRef(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (submitted.current || answer.status !== 'pending') return;
    if (parts.every((p) => p.status !== 'pending')) {
      submitted.current = true;
      onSubmit(parts.every((p) => p.status === 'correct'));
    }
  }, [parts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (answer.status === 'revealed') {
      setParts((prev) => prev.map((p) => ({ ...p, hintOpen: true, status: p.status === 'pending' ? 'wrong' : p.status })));
    }
  }, [answer.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const setVal = (pi: number, j: number, v: string) =>
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, vals: p.vals.map((x, k) => (k === j ? v : x)) } : p)));

  const validate = (pi: number) => {
    if (disabled || parts[pi]!.status !== 'pending') return;
    const part = exercise.parts[pi]!;
    if (parts[pi]!.vals.some((v) => v.trim() === '')) return;
    const ok = part.points.every((pt, j) => checkNumericAnswer(parts[pi]!.vals[j]!, part.ticks[pt.idx]!));
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, status: ok ? 'correct' : 'wrong', hintOpen: !ok } : p)));
  };

  const toggleHint = (pi: number) => setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, hintOpen: !p.hintOpen } : p)));

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          Lire une abscisse
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Donne l'abscisse de chaque point, en comptant les graduations depuis les nombres donnés.
      </p>
      {exercise.parts.map((part, pi) => {
        const ps = parts[pi]!;
        const partDone = disabled || ps.status !== 'pending';
        const borderCol = ps.status === 'correct' ? 'var(--correct)' : ps.status === 'wrong' ? 'var(--wrong)' : 'var(--border2)';
        const pointAt = (i: number) => part.points.find((p) => p.idx === i);
        return (
          <div key={pi} style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderCol}`, background: 'var(--surface)' }}>
            <AxisLine
              ticks={part.ticks}
              renderAbove={(i) => {
                const pt = pointAt(i);
                return pt ? <PointMarker letter={pt.letter} /> : null;
              }}
              renderBelow={(i) => (part.labeledIdx.includes(i) ? <strong style={{ fontSize: 13 }}>{fmtNum(part.ticks[i]!)}</strong> : null)}
            />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
              {part.points.map((p, j) => (
                <span key={p.letter} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Mono', monospace", fontSize: 14 }}>
                  {p.letter}(
                  <input
                    type="text"
                    value={ps.vals[j]}
                    placeholder="?"
                    disabled={partDone}
                    onChange={(e) => setVal(pi, j, e.target.value)}
                    style={smallInp}
                  />
                  )
                </span>
              ))}
              {!partDone && (
                <button className="btn-secondary" onClick={() => validate(pi)} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8 }}>
                  OK
                </button>
              )}
              {ps.status !== 'pending' && (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: ps.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                  {ps.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
                </span>
              )}
            </div>
            <div style={{ marginTop: 6 }}>
              <button type="button" className="hint-toggle" onClick={() => toggleHint(pi)}>
                <span>{ps.hintOpen ? '▼' : '▶'}</span> Voir la correction
              </button>
              <div className={`steps-box${ps.hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
                <AxisLine
                  ticks={part.ticks}
                  renderAbove={(i) => {
                    const pt = part.points.find((p) => p.idx === i);
                    return pt ? <PointMarker letter={pt.letter} /> : null;
                  }}
                  renderBelow={(i) => {
                    if (part.labeledIdx.includes(i)) return <strong style={{ fontSize: 13 }}>{fmtNum(part.ticks[i]!)}</strong>;
                    const pt = part.points.find((p) => p.idx === i);
                    return pt ? <strong style={{ fontSize: 13, color: 'var(--correct)' }}>{fmtNum(part.ticks[i]!)}</strong> : null;
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Q : placer des points ─────────────────────────────────────────────────────

interface AxisPlacePoint {
  letter: string;
  idx: number;
}

interface AxisPlacePart {
  ticks: number[];
  labeledIdx: [number, number];
  points: AxisPlacePoint[];
}

interface AxisPlaceExercise {
  parts: AxisPlacePart[];
  label: string;
  instructions: string;
}

function makeIntroPlace(): AxisPlaceExercise {
  const N = 9;
  const ticks = makeTicks(0, 1, N + 1);
  const labeledIdx: [number, number] = [0, N];
  const idxs = pickPointIdx(N + 1, labeledIdx, 4);
  const letters = shuffle(LETTERS).slice(0, 4);
  const points = idxs.map((idx, k) => ({ letter: letters[k]!, idx }));
  return {
    parts: [{ ticks, labeledIdx, points }],
    label: 'Placer un point (entiers)',
    instructions: "Écris la lettre du point sous la bonne graduation.",
  };
}

function generateAxisPlace(): AxisPlaceExercise {
  const parts = ([1, 2, 3] as const).map((precision) => {
    const count = 10;
    const ticks = buildTicksForPrecision(precision, count);
    const labeledIdx = pickTwoIdx(count);
    const idxs = pickPointIdx(count, labeledIdx, 4);
    const letters = ['A', 'B', 'C', 'D'];
    const points = idxs.map((idx, k) => ({ letter: letters[k]!, idx }));
    return { ticks, labeledIdx, points };
  });
  return {
    parts,
    label: 'Placer un point (décimaux)',
    instructions: "Écris la lettre du point sous la bonne graduation (laisse la case vide s'il n'y a pas de point).",
  };
}

interface AxisPlacePartState {
  vals: string[];
  status: 'pending' | 'correct' | 'wrong';
  hintOpen: boolean;
}

function AxisPlaceQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: AxisPlaceExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const blanksFor = (part: AxisPlacePart) => part.ticks.map((_, i) => i).filter((i) => !part.labeledIdx.includes(i));
  const expectedLetter = (part: AxisPlacePart, tickIdx: number) => part.points.find((p) => p.idx === tickIdx)?.letter ?? '';

  const [parts, setParts] = useState<AxisPlacePartState[]>(
    exercise.parts.map((p) => ({ vals: blanksFor(p).map(() => ''), status: 'pending', hintOpen: false }))
  );
  const submitted = useRef(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (submitted.current || answer.status !== 'pending') return;
    if (parts.every((p) => p.status !== 'pending')) {
      submitted.current = true;
      onSubmit(parts.every((p) => p.status === 'correct'));
    }
  }, [parts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (answer.status === 'revealed') {
      setParts((prev) => prev.map((p) => ({ ...p, hintOpen: true, status: p.status === 'pending' ? 'wrong' : p.status })));
    }
  }, [answer.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const setVal = (pi: number, bi: number, v: string) =>
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, vals: p.vals.map((x, j) => (j === bi ? v : x)) } : p)));

  const validate = (pi: number) => {
    if (disabled || parts[pi]!.status !== 'pending') return;
    const part = exercise.parts[pi]!;
    const blanks = blanksFor(part);
    const ok = blanks.every((tickIdx, bi) => parts[pi]!.vals[bi]!.trim().toUpperCase() === expectedLetter(part, tickIdx));
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, status: ok ? 'correct' : 'wrong', hintOpen: !ok } : p)));
  };

  const toggleHint = (pi: number) => setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, hintOpen: !p.hintOpen } : p)));

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          {exercise.label}
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{exercise.instructions}</p>
      {exercise.parts.map((part, pi) => {
        const ps = parts[pi]!;
        const partDone = disabled || ps.status !== 'pending';
        const borderCol = ps.status === 'correct' ? 'var(--correct)' : ps.status === 'wrong' ? 'var(--wrong)' : 'var(--border2)';
        const blanks = blanksFor(part);
        return (
          <div key={pi} style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderCol}`, background: 'var(--surface)' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, marginBottom: 4 }}>
              {part.points.map((p) => `${p.letter}(${fmtNum(part.ticks[p.idx]!)})`).join(' ; ')}
            </div>
            <AxisLine
              ticks={part.ticks}
              renderBelow={(i) => {
                if (part.labeledIdx.includes(i)) return <strong style={{ fontSize: 13 }}>{fmtNum(part.ticks[i]!)}</strong>;
                const bi = blanks.indexOf(i);
                return (
                  <input
                    type="text"
                    value={ps.vals[bi]}
                    placeholder="…"
                    disabled={partDone}
                    onChange={(e) => setVal(pi, bi, e.target.value)}
                    style={{ ...smallInp, width: 34 }}
                  />
                );
              }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              {!partDone && (
                <button className="btn-secondary" onClick={() => validate(pi)} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8 }}>
                  OK
                </button>
              )}
              {ps.status !== 'pending' && (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: ps.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                  {ps.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
                </span>
              )}
            </div>
            <div style={{ marginTop: 6 }}>
              <button type="button" className="hint-toggle" onClick={() => toggleHint(pi)}>
                <span>{ps.hintOpen ? '▼' : '▶'}</span> Voir la correction
              </button>
              <div className={`steps-box${ps.hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
                <AxisLine
                  ticks={part.ticks}
                  renderBelow={(i) => {
                    if (part.labeledIdx.includes(i)) return <strong style={{ fontSize: 13 }}>{fmtNum(part.ticks[i]!)}</strong>;
                    const pt = part.points.find((p) => p.idx === i);
                    return pt ? <strong style={{ fontSize: 13, color: 'var(--correct)' }}>{pt.letter}</strong> : null;
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── DecimauxReperageHub (main export) ────────────────────────────────────────────

type ReperageExercise =
  | { exKind: 'axis-place'; data: AxisPlaceExercise }
  | { exKind: 'axis-fill'; data: AxisFillExercise }
  | { exKind: 'axis-read'; data: AxisReadExercise };

function buildExercises(mode: HubMode): ReperageExercise[] {
  if (mode !== 'reperage') return [];
  return [
    { exKind: 'axis-place', data: makeIntroPlace() },
    { exKind: 'axis-fill', data: generateAxisFill() },
    { exKind: 'axis-read', data: generateAxisRead() },
    { exKind: 'axis-place', data: generateAxisPlace() },
  ];
}

export function DecimauxReperageHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode>(null);
  const [exercises, setExercises] = useState<ReperageExercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const loadExercises = (m: HubMode) => {
    const exs = buildExercises(m);
    setExercises(exs);
    setAnswers(exs.map(() => emptyAnswer()));
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

  const submit = (i: number, ok: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? { ...a, status: ok ? 'correct' : 'wrong' } : a)));
  };

  const resetErrors = () => {
    setAnswers((prev) => prev.map((a) => (a.status === 'correct' ? a : { status: 'pending', resetKey: a.resetKey + 1 })));
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
        <ModeCard
          label="Repérage"
          icon="⟶"
          desc="Placer et lire des nombres décimaux sur une demi-droite graduée"
          accent={accent}
          onClick={() => selectMode('reperage')}
        />
      </div>
    );
  }

  const accentStyle = { color: accent };
  const progressStyle = {
    width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`,
    background: accentSecondary ? `linear-gradient(90deg, ${accent}, ${accentSecondary})` : accent,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={goBack} style={{ fontSize: 13 }}>
          ← Changer de mode
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>Repérage</span>
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
        {exercises.map((ex, i) => {
          const key = `${seriesKey}-${answers[i]!.resetKey}-${i}`;
          const common = { key, index: i, answer: answers[i]!, accent, onSubmit: (ok: boolean) => submit(i, ok) };
          if (ex.exKind === 'axis-fill') return <AxisFillQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'axis-read') return <AxisReadQuestion {...common} exercise={ex.data} />;
          return <AxisPlaceQuestion {...common} exercise={ex.data} />;
        })}
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
