import { useEffect, useMemo, useRef, useState } from 'react';
import { ModeCard } from './FractionsHub';

type HubMode = 'definitions' | 'reperage' | null;

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
const randSignedInt = (min: number, max: number) => (Math.random() < 0.5 ? 1 : -1) * randInt(min, max);
// A last digit of 0 hides the intended decimal precision (e.g. 1,50 → "1,5") — avoid it when a specific precision is wanted.
const randNonZeroDigit = () => randInt(1, 9);

// Rounds to (at most) 2 decimals and trims trailing zeros, e.g. 0.30 → "0,3", 1 → "1".
const fmtNum = (n: number) => {
  const rounded = Math.round(n * 100) / 100;
  let s = rounded.toFixed(2);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('.', ',');
};

function checkNumericAnswer(raw: string, expected: number): boolean {
  // Tolerates a space between the minus sign and the digits (e.g. "- 6" as well as "-6").
  const compact = raw.replace(/\s+/g, '');
  if (compact === '') return false;
  const v = parseFloat(compact.replace(',', '.'));
  return !Number.isNaN(v) && Math.abs(v - expected) < 0.005;
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

// ── Axe gradué (ligne + graduations régulières) ─────────────────────────────────

function AxisLine({ ticks, renderBelow, renderAbove }: {
  ticks: number[];
  renderBelow: (i: number) => React.ReactNode;
  renderAbove?: (i: number) => React.ReactNode;
}) {
  return (
    <div style={{ margin: '18px 0 6px' }}>
      {renderAbove && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {ticks.map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: 0, minHeight: 30 }}>
              {renderAbove(i)}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', height: 2, background: 'var(--text)' }}>
        <span style={{ position: 'absolute', right: -10, top: -7, fontSize: 14, color: 'var(--text)' }}>→</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {ticks.map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: 0 }}>
            <div style={{ width: 2, height: 10, background: 'var(--text)' }} />
            <div style={{ marginTop: 4 }}>{renderBelow(i)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Génération partagée des axes ────────────────────────────────────────────────

type AxisKind = 'int' | 'dec1neg' | 'dec2';

/** 3 kinds used together by every "3 axes" question: entiers, 1 décimale (entièrement négatif), 2 décimales (traverse zéro). */
const AXIS_KINDS: readonly AxisKind[] = ['int', 'dec1neg', 'dec2'];

function buildAxisTicks(kind: AxisKind, count: number, wantPositiveTail: boolean): number[] {
  if (kind === 'int') {
    const step = pick([1, 2, 3] as const);
    const start = wantPositiveTail ? -randInt(2, 4) * step : -randInt(4, 8) * step;
    return makeTicks(start, step, count);
  }
  if (kind === 'dec1neg') {
    let start = 0;
    do {
      start = -(randInt(1, 9) + randNonZeroDigit() / 10);
    } while (start + 0.1 * (count - 1) >= 0);
    return makeTicks(start, 0.1, count);
  }
  const step = 0.05;
  const start = wantPositiveTail ? -step * randInt(3, 5) : -step * randInt(4, 7);
  return makeTicks(start, step, count);
}

/** Picks 2 reference indices: sometimes adjacent, sometimes with one graduation of gap, anywhere along the axis (not always from the left). */
function pickTwoIdx(count: number, ticks: number[], requirePositive: boolean): [number, number] {
  const gap = Math.random() < 0.5 ? 1 : 2;
  const candidates: [number, number][] = [];
  for (let start = 0; start + gap < count; start++) candidates.push([start, start + gap]);
  const valid = requirePositive ? candidates.filter(([a, b]) => ticks[a]! > 0 && ticks[b]! > 0) : candidates;
  return pick(valid.length > 0 ? valid : candidates);
}

function pickPointIdx(count: number, labeledIdx: readonly number[], n: number): number[] {
  const available = Array.from({ length: count }, (_, i) => i).filter((i) => !labeledIdx.includes(i));
  return shuffle(available).slice(0, n);
}

// ── VideoLink ─────────────────────────────────────────────────────────────────

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
        color: '#f87171', fontSize: 13, textDecoration: 'none',
        fontWeight: 600, marginTop: 6, marginRight: 8,
      }}
    >
      ▶ {label}
    </a>
  );
}

// ── Rappel ────────────────────────────────────────────────────────────────────

function RecallDefinitions({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel — définitions + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <ul style={{ margin: '12px 0 8px 18px', padding: 0 }}>
          <li>Un <strong>nombre positif</strong> est un nombre supérieur ou égal à zéro.</li>
          <li>Un <strong>nombre négatif</strong> est un nombre inférieur ou égal à zéro.</li>
          <li>Un <strong>nombre relatif</strong> est un nombre positif ou négatif.</li>
          <li>On obtient l'<strong>opposé</strong> d'un nombre en changeant son signe.</li>
        </ul>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/GAhNZgDw1XA" label="Définition" />
          <VideoLink url="https://youtu.be/a5HGl910IXE" label="Opposé d'un nombre" />
        </div>
      </div>
    </div>
  );
}

// ── Q1 : tableau des signes ─────────────────────────────────────────────────────

interface SignTableExercise {
  numbers: number[];
}

function generateSignTable(): SignTableExercise {
  const numbers: number[] = [0];
  while (numbers.length < 5) {
    let v: number;
    if (Math.random() < 0.4) {
      v = randInt(0, 12) + pick([1, 2, 3, 4, 6, 7, 8, 9] as const) / 10;
      if (Math.random() < 0.5) v = -v;
    } else {
      v = randSignedInt(1, 20);
    }
    if (v === 0) continue;
    numbers.push(v);
  }
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j]!, numbers[i]!];
  }
  return { numbers };
}

const cellStyle: React.CSSProperties = { padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' };
const headStyle: React.CSSProperties = { ...cellStyle, fontWeight: 700, color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 };

function SignTableQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: SignTableExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [checks, setChecks] = useState(exercise.numbers.map(() => ({ pos: false, neg: false })));
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const toggle = (i: number, key: 'pos' | 'neg') => {
    if (disabled) return;
    setChecks((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: !c[key] } : c)));
  };

  const rowOk = (i: number) => {
    const n = exercise.numbers[i]!;
    const expPos = n >= 0, expNeg = n <= 0;
    return checks[i]!.pos === expPos && checks[i]!.neg === expNeg;
  };

  const submit = () => {
    if (disabled) return;
    onSubmit(exercise.numbers.every((_, i) => rowOk(i)));
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          Signe d'un nombre
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Coche la ou les bonnes cases pour chaque nombre.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Mono', monospace" }}>
          <thead>
            <tr>
              <th style={headStyle}>Nombre</th>
              <th style={headStyle}>Positif</th>
              <th style={headStyle}>Négatif</th>
            </tr>
          </thead>
          <tbody>
            {exercise.numbers.map((n, i) => {
              const showFb = disabled;
              const ok = showFb ? rowOk(i) : null;
              return (
                <tr key={i} style={showFb ? { background: ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)' } : undefined}>
                  <td style={{ ...cellStyle, fontWeight: 700, fontSize: 15 }}>{fmtNum(n)}</td>
                  <td style={cellStyle}>
                    <input type="checkbox" checked={checks[i]!.pos} disabled={disabled} onChange={() => toggle(i, 'pos')} style={{ width: 18, height: 18, cursor: disabled ? 'default' : 'pointer' }} />
                  </td>
                  <td style={cellStyle}>
                    <input type="checkbox" checked={checks[i]!.neg} disabled={disabled} onChange={() => toggle(i, 'neg')} style={{ width: 18, height: 18, cursor: disabled ? 'default' : 'pointer' }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Une ou plusieurs cases sont incorrectes.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          {exercise.numbers.map((n, i) => (
            <div key={i}>
              {fmtNum(n)} → {n >= 0 && <strong style={{ color: 'var(--correct)' }}>positif</strong>}
              {n === 0 && ' et '}
              {n <= 0 && <strong style={{ color: 'var(--correct)' }}>négatif</strong>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Q2 : tableau des opposés ────────────────────────────────────────────────────

interface OppositePair {
  n: number;
  showTop: boolean;
}

interface OppositeTableExercise {
  pairs: OppositePair[];
}

function generateOppositeTable(): OppositeTableExercise {
  const used = new Set<number>();
  const pairs: OppositePair[] = [];
  while (pairs.length < 5) {
    const n = randSignedInt(1, 99);
    if (used.has(Math.abs(n))) continue;
    used.add(Math.abs(n));
    pairs.push({ n, showTop: Math.random() < 0.5 });
  }
  return { pairs };
}

function checkOppositeAnswer(raw: string, expected: number): boolean {
  const compact = raw.replace(/\s+/g, '');
  if (compact === '') return false;
  const expectedStr = expected < 0 ? `-${Math.abs(expected)}` : `${expected}`;
  return compact === expectedStr;
}

const inpStyle: React.CSSProperties = {
  width: 56, fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
  padding: '6px 4px', borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--bg)', color: 'var(--text)', textAlign: 'center',
};

function OppositeTableQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: OppositeTableExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVals] = useState<string[]>(exercise.pairs.map(() => ''));
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const expectedFor = (p: OppositePair) => (p.showTop ? -p.n : p.n);

  const colOk = (i: number) => checkOppositeAnswer(vals[i]!, expectedFor(exercise.pairs[i]!));

  const submit = () => {
    if (disabled) return;
    if (vals.some((v) => v.trim() === '')) return;
    onSubmit(exercise.pairs.every((_, i) => colOk(i)));
  };

  const setVal = (i: number, v: string) => setVals((prev) => prev.map((x, idx) => (idx === i ? v : x)));

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          Opposé d'un nombre
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Complète la case manquante. Utilise le signe <strong>−</strong> écrit avec un tiret (ex : -6).
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Mono', monospace" }}>
          <tbody>
            <tr>
              <th style={{ ...headStyle, textAlign: 'left' }}>Nombre</th>
              {exercise.pairs.map((p, i) => {
                const showFb = disabled;
                return (
                  <td key={i} style={{ ...cellStyle, background: showFb ? (colOk(i) ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : undefined }}>
                    {p.showTop ? (
                      <strong style={{ fontSize: 15 }}>{fmtNum(p.n)}</strong>
                    ) : (
                      <input type="text" value={vals[i]} placeholder="?" disabled={disabled} onChange={(e) => setVal(i, e.target.value)} style={inpStyle} />
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <th style={{ ...headStyle, textAlign: 'left' }}>Opposé de ce nombre</th>
              {exercise.pairs.map((p, i) => {
                const showFb = disabled;
                return (
                  <td key={i} style={{ ...cellStyle, background: showFb ? (colOk(i) ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : undefined }}>
                    {!p.showTop ? (
                      <strong style={{ fontSize: 15 }}>{fmtNum(-p.n)}</strong>
                    ) : (
                      <input type="text" value={vals[i]} placeholder="?" disabled={disabled} onChange={(e) => setVal(i, e.target.value)} style={inpStyle} />
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Une ou plusieurs cases sont incorrectes.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          {exercise.pairs.map((p, i) => (
            <div key={i}>
              {fmtNum(p.n)} → opposé : <strong style={{ color: 'var(--correct)' }}>{fmtNum(-p.n)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Q1 (Repérage) : compléter chaque graduation ─────────────────────────────────

interface AxisFillPart {
  ticks: number[];
  givenIdx: [number, number];
}

interface AxisFillExercise {
  parts: AxisFillPart[];
}

function generateAxisFill(): AxisFillExercise {
  // Un des deux axes qui peuvent atteindre le positif (entiers ou 2 décimales) montre
  // ses deux repères sur des graduations positives ; l'autre reste libre.
  const positiveKind: AxisKind = Math.random() < 0.5 ? 'int' : 'dec2';
  const counts: Record<AxisKind, number> = { int: 8, dec1neg: 8, dec2: 9 };

  const parts = AXIS_KINDS.map((kind) => {
    const count = counts[kind];
    const ticks = buildAxisTicks(kind, count, kind === positiveKind);
    const givenIdx = pickTwoIdx(count, ticks, kind === positiveKind);
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
        Écris, sous chaque trait de graduation, le nombre relatif qui convient.
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
                {part.ticks.map((t) => fmtNum(t)).join(' ; ')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Q2 (Repérage) : lire l'abscisse d'un point ──────────────────────────────────

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
  const positiveKind: AxisKind = Math.random() < 0.5 ? 'int' : 'dec2';
  const counts: Record<AxisKind, number> = { int: 9, dec1neg: 8, dec2: 9 };

  const parts = AXIS_KINDS.map((kind) => {
    const count = counts[kind];
    const ticks = buildAxisTicks(kind, count, kind === positiveKind);
    const labeledIdx = pickTwoIdx(count, ticks, kind === positiveKind);
    const idxs = pickPointIdx(count, labeledIdx, 3);
    const points = idxs.map((idx, k) => ({ letter: ['A', 'B', 'C'][k]!, idx }));
    return { ticks, labeledIdx, points };
  });

  return { parts };
}

/** Marker (letter + ×) shown above a graduation that carries a point. */
function PointMarker({ letter, color }: { letter: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center', color: color ?? 'var(--text)' }}>
      <div style={{ fontWeight: 700, fontSize: 12 }}>{letter}</div>
      <div style={{ fontSize: 14, lineHeight: 1 }}>×</div>
    </div>
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
                {part.points.map((p) => `${p.letter}(${fmtNum(part.ticks[p.idx]!)})`).join(' ; ')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Q3 (Repérage) : placer des points ───────────────────────────────────────────

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
}

function generateAxisPlace(): AxisPlaceExercise {
  const positiveKind: AxisKind = Math.random() < 0.5 ? 'int' : 'dec2';
  const counts: Record<AxisKind, number> = { int: 10, dec1neg: 9, dec2: 10 };

  const parts = AXIS_KINDS.map((kind) => {
    const count = counts[kind];
    const ticks = buildAxisTicks(kind, count, kind === positiveKind);
    const labeledIdx = pickTwoIdx(count, ticks, kind === positiveKind);
    const idxs = pickPointIdx(count, labeledIdx, 4);
    const letters = ['A', 'B', 'C', 'D'];
    const points = idxs.map((idx, k) => ({ letter: letters[k]!, idx }));
    return { ticks, labeledIdx, points };
  });

  return { parts };
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
          Placer un point
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Écris la lettre du point sous la bonne graduation (laisse la case vide s'il n'y a pas de point).
      </p>
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

// ── RelatifsHub (main export) ──────────────────────────────────────────────────

type RelatifsExercise =
  | { exKind: 'sign-table'; data: SignTableExercise }
  | { exKind: 'opposite-table'; data: OppositeTableExercise }
  | { exKind: 'axis-fill'; data: AxisFillExercise }
  | { exKind: 'axis-read'; data: AxisReadExercise }
  | { exKind: 'axis-place'; data: AxisPlaceExercise };

function buildExercises(mode: HubMode): RelatifsExercise[] {
  if (mode === 'reperage') {
    return [
      { exKind: 'axis-fill', data: generateAxisFill() },
      { exKind: 'axis-read', data: generateAxisRead() },
      { exKind: 'axis-place', data: generateAxisPlace() },
    ];
  }
  return [
    { exKind: 'sign-table', data: generateSignTable() },
    { exKind: 'opposite-table', data: generateOppositeTable() },
  ];
}

export function RelatifsHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode>(null);
  const [exercises, setExercises] = useState<RelatifsExercise[]>([]);
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
          label="Définitions"
          icon="±"
          desc="Nombres positifs, négatifs, relatifs, opposés"
          accent={accent}
          onClick={() => selectMode('definitions')}
        />
        <ModeCard
          label="Repérage sur une droite"
          icon="⟷"
          desc="Compléter une graduation, lire une abscisse, placer un point"
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
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>
          {mode === 'reperage' ? 'Repérage sur une droite' : 'Définitions'}
        </span>
      </div>

      {mode === 'definitions' && <RecallDefinitions accent={accent} />}

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
          if (ex.exKind === 'sign-table') return <SignTableQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'opposite-table') return <OppositeTableQuestion {...common} exercise={ex.data} />;
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
