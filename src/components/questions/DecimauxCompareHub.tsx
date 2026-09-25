import { useEffect, useMemo, useRef, useState } from 'react';
import { ModeCard } from './FractionsHub';

type HubMode = 'comparer' | 'intercaler' | null;

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

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Shuffles a list of (already-ordered) strings, guaranteeing the result differs from the input order. */
function shuffleOrder(items: readonly string[]): string[] {
  const s = shuffle(items);
  if (s.every((v, i) => v === items[i])) {
    [s[0], s[1]] = [s[1]!, s[0]!];
  }
  return s;
}

function fmtDecStr(intPart: number, fracDigits: readonly number[]): string {
  return fracDigits.length > 0 ? `${intPart},${fracDigits.join('')}` : `${intPart}`;
}

/** Tolerates whitespace (incl. between a sign and digits) and a comma decimal separator; returns null when unparsable. */
function parseNum(raw: string): number | null {
  const compact = raw.replace(/\s+/g, '');
  if (compact === '') return null;
  const v = parseFloat(compact.replace(',', '.'));
  return Number.isNaN(v) ? null : v;
}

const blankInp: React.CSSProperties = {
  width: 56, fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
  padding: '6px 4px', borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--bg)', color: 'var(--text)', textAlign: 'center',
};

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

const compCellStyle: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' };
const compHeadStyle: React.CSSProperties = { ...compCellStyle, fontWeight: 700, color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 };

function RecallCompare({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel — comparer et ranger + vidéo
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <ul style={{ margin: '12px 0 8px 18px', padding: 0 }}>
          <li>
            <strong>&lt;</strong> se lit « … est <strong>inférieur</strong> à … »
          </li>
          <li>
            <strong>&gt;</strong> se lit « … est <strong>supérieur</strong> à … »
          </li>
          <li>
            Ranger des nombres dans l'ordre <strong>croissant</strong>, c'est les ranger du plus petit au plus grand.
          </li>
          <li>
            Ranger des nombres dans l'ordre <strong>décroissant</strong>, c'est les ranger du plus grand au plus petit.
          </li>
        </ul>
        <div style={{ overflowX: 'auto', margin: '4px 0 12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Mono', monospace", fontSize: 12.5 }}>
            <thead>
              <tr>
                <th style={compHeadStyle}>Les deux nombres décimaux ont :</th>
                <th style={compHeadStyle}>Comparaison</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={compCellStyle}>leurs parties entières différentes.</td>
                <td style={compCellStyle}>Le plus petit est celui qui a la plus petite partie entière.</td>
              </tr>
              <tr>
                <td style={compCellStyle}>leurs parties entières égales et leurs <strong style={{ color: '#f87171' }}>chiffres des dixièmes</strong> différents.</td>
                <td style={compCellStyle}>Le plus petit est celui qui a le plus petit chiffre des dixièmes.</td>
              </tr>
              <tr>
                <td style={compCellStyle}>leurs parties entières égales, leurs chiffres des dixièmes égaux et leurs <strong style={{ color: 'var(--correct)' }}>chiffres des centièmes</strong> différents.</td>
                <td style={compCellStyle}>Le plus petit est celui qui a le plus petit chiffre des centièmes.</td>
              </tr>
              <tr>
                <td style={{ ...compCellStyle, borderBottom: 'none' }}>et ainsi de suite…</td>
                <td style={{ ...compCellStyle, borderBottom: 'none' }} />
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/fr5GemewG4Q" label="Comparer et ranger des nombres décimaux" />
        </div>
      </div>
    </div>
  );
}

function RecallIntercaler({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel — encadrer et intercaler + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <ul style={{ margin: '12px 0 8px 18px', padding: 0 }}>
          <li>
            <strong>Encadrer</strong> un nombre, c'est trouver un nombre plus petit et un nombre plus grand.
          </li>
          <li>
            <strong>Intercaler</strong> un nombre entre deux autres, c'est trouver un nombre qui soit compris entre ces deux nombres.
          </li>
        </ul>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/s26CK2wO9x8" label="Encadrer un nombre" />
          <VideoLink url="https://youtu.be/sXSS3Gmq3q4" label="Intercaler un nombre" />
        </div>
      </div>
    </div>
  );
}

// ── Q1 : compléter avec <, > ou = ────────────────────────────────────────────────

interface ComparePair {
  aStr: string;
  bStr: string;
  aDec: number;
  bDec: number;
  sign: '<' | '>' | '=';
}

interface CompareExercise {
  pairs: ComparePair[];
}

function makeComparePair(forceEqual: boolean): ComparePair {
  const decChoices = [1, 2, 3] as const;
  const dA = pick(decChoices);
  let dB = pick(decChoices);
  if (dA === dB && Math.random() < 0.6) dB = pick(decChoices.filter((d) => d !== dA));

  const intA = randInt(0, 20);
  const sameInt = forceEqual || Math.random() < 0.5;
  let intB = intA;
  if (!sameInt) {
    do { intB = randInt(0, 20); } while (intB === intA);
  }

  let fracA: number[];
  let fracB: number[];
  if (forceEqual) {
    const minDec = Math.min(dA, dB);
    const maxDec = Math.max(dA, dB);
    const base = Array.from({ length: minDec }, () => randInt(0, 9));
    const longFrac = [...base, ...Array.from({ length: maxDec - minDec }, () => 0)];
    fracA = dA === minDec ? base : longFrac;
    fracB = dB === minDec ? base : longFrac;
  } else {
    fracA = Array.from({ length: dA }, () => randInt(0, 9));
    fracB = Array.from({ length: dB }, () => randInt(0, 9));
  }

  const aStr = fmtDecStr(intA, fracA);
  const bStr = fmtDecStr(intB, fracB);
  const aVal = parseFloat(`${intA}.${fracA.join('') || '0'}`);
  const bVal = parseFloat(`${intB}.${fracB.join('') || '0'}`);
  const sign: '<' | '>' | '=' = aVal < bVal ? '<' : aVal > bVal ? '>' : '=';
  return { aStr, bStr, aDec: dA, bDec: dB, sign };
}

function generateCompareExercise(): CompareExercise {
  const forceEqualIdx = randInt(0, 5);
  const pairs: ComparePair[] = [];
  for (let i = 0; i < 6; i++) {
    let pair = makeComparePair(i === forceEqualIdx);
    let attempts = 0;
    while (i !== forceEqualIdx && pair.sign === '=' && attempts < 5) {
      pair = makeComparePair(false);
      attempts++;
    }
    pairs.push(pair);
  }
  return { pairs };
}

function padDecimalStr(str: string, targetDec: number): string {
  if (targetDec === 0) return str;
  const parts = str.split(',');
  const intPart = parts[0]!;
  const frac = parts[1] ?? '';
  return `${intPart},${frac.padEnd(targetDec, '0')}`;
}

const symBtnStyle = (active: boolean, disabled: boolean, accent: string): React.CSSProperties => ({
  width: 34, height: 34, borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700,
  border: `1px solid ${active ? accent : 'var(--border2)'}`,
  background: active ? `${accent}22` : 'var(--bg)',
  color: active ? accent : 'var(--text)',
  cursor: disabled ? 'default' : 'pointer',
});

const ROW_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

function ComparisonSymbolsQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: CompareExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [rows, setRows] = useState<('<' | '>' | '=' | null)[]>(exercise.pairs.map(() => null));
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const select = (i: number, sym: '<' | '>' | '=') => {
    if (disabled) return;
    setRows((prev) => prev.map((r, idx) => (idx === i ? sym : r)));
  };

  const rowOk = (i: number) => rows[i] === exercise.pairs[i]!.sign;

  const submit = () => {
    if (disabled) return;
    if (rows.some((r) => r === null)) return;
    onSubmit(exercise.pairs.every((_, i) => rowOk(i)));
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          Comparer deux nombres
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Complète avec &lt;, &gt; ou =.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {exercise.pairs.map((p, i) => {
          const showFb = disabled;
          const ok = showFb ? rowOk(i) : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8,
                background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)',
              }}
            >
              <span style={{ width: 16, color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>{ROW_LETTERS[i]}.</span>
              <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, minWidth: 60 }}>{p.aStr}</strong>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['<', '>', '='] as const).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    disabled={disabled}
                    onClick={() => select(i, sym)}
                    style={symBtnStyle(rows[i] === sym, disabled, accent)}
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, minWidth: 60 }}>{p.bStr}</strong>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Une ou plusieurs réponses sont incorrectes.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          {exercise.pairs.map((p, i) => {
            const maxDec = Math.max(p.aDec, p.bDec);
            const aPad = padDecimalStr(p.aStr, maxDec);
            const bPad = padDecimalStr(p.bStr, maxDec);
            return (
              <div key={i} style={{ marginBottom: 4 }}>
                <strong>{ROW_LETTERS[i]}.</strong>{' '}
                {p.aDec !== p.bDec && (
                  <>
                    on rajoute les zéros inutiles : {p.aStr} = {aPad} et {p.bStr} = {bPad} →{' '}
                  </>
                )}
                {p.aStr} <strong style={{ color: 'var(--correct)' }}>{p.sign}</strong> {p.bStr}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Q2 / Q3 : ranger dans l'ordre croissant / décroissant (glisser-déposer) ─────

interface OrderExercise {
  numbers: string[];
  shuffled: string[];
  direction: 'croissant' | 'décroissant';
}

function makeOrderSet(count: number): string[] {
  const intPart = randInt(1, 20);
  const used = new Set<number>();
  const items: { str: string; val: number }[] = [];
  while (items.length < count) {
    const d = pick([1, 2, 3] as const);
    const ip = Math.random() < 0.65 ? intPart : Math.max(0, intPart + pick([-1, 1] as const));
    const frac = Array.from({ length: d }, () => randInt(0, 9));
    const val = parseFloat(`${ip}.${frac.join('')}`);
    const key = Math.round(val * 1000);
    if (used.has(key)) continue;
    used.add(key);
    items.push({ str: fmtDecStr(ip, frac), val });
  }
  return items.sort((a, b) => a.val - b.val).map((x) => x.str);
}

function generateOrderExercise(direction: 'croissant' | 'décroissant'): OrderExercise {
  const ascending = makeOrderSet(8);
  const numbers = direction === 'croissant' ? ascending : [...ascending].reverse();
  return { numbers, shuffled: shuffleOrder(numbers), direction };
}

type DragSrc = { from: 'pool'; text: string } | { from: 'slot'; idx: number; text: string };

function OrderDragDrop({ index, exercise, answer, onSubmit }: {
  index: number;
  exercise: OrderExercise;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [placed, setPlaced] = useState<(string | null)[]>(() => Array(exercise.numbers.length).fill(null));
  const [pool, setPool] = useState<string[]>(() => [...exercise.shuffled]);
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; cls: string }>({ text: '', cls: 'feedback' });
  const dragSrc = useRef<DragSrc | null>(null);
  const disabled = answer.status !== 'pending';

  const dropToSlot = (toIdx: number) => {
    if (!dragSrc.current || disabled) return;
    const src = dragSrc.current;
    dragSrc.current = null;
    if (src.from === 'pool') {
      const existing = placed[toIdx];
      setPool((p) => {
        const filtered = p.filter((s) => s !== src.text);
        return existing !== null ? [...filtered, existing] : filtered;
      });
      setPlaced((prev) => {
        const next = [...prev];
        next[toIdx] = src.text;
        return next;
      });
    } else {
      setPlaced((prev) => {
        const next = [...prev];
        const existing = next[toIdx];
        next[src.idx] = existing ?? null;
        next[toIdx] = src.text;
        return next;
      });
    }
  };

  const dropToPool = () => {
    if (!dragSrc.current || disabled) return;
    const src = dragSrc.current;
    dragSrc.current = null;
    if (src.from === 'slot') {
      setPool((p) => [...p, src.text]);
      setPlaced((prev) => {
        const next = [...prev];
        next[src.idx] = null;
        return next;
      });
    }
  };

  const handleVerify = () => {
    if (disabled) return;
    if (placed.some((p) => p === null)) {
      setFeedback({ text: '✗ Place tous les nombres avant de vérifier.', cls: 'feedback ko' });
      return;
    }
    const ok = placed.every((p, i) => p === exercise.numbers[i]);
    setFeedback({
      text: ok ? '✓ Parfait ! Le rangement est correct.' : "✗ L'ordre n'est pas correct.",
      cls: ok ? 'feedback ok' : 'feedback ko',
    });
    onSubmit(ok);
  };

  const finalFb = answer.status === 'revealed'
    ? { text: 'Voici le rangement correct ci-dessous.', cls: 'feedback ko' }
    : feedback;

  return (
    <div className={`qcard ${answer.status === 'correct' ? 'correct-card' : answer.status === 'wrong' || answer.status === 'revealed' ? 'wrong-card' : ''}`}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext">
          Range ces 8 nombres décimaux dans l'ordre <strong>{exercise.direction}</strong>.
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        {!disabled && (
          <>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Nombres à ranger :</p>
            <div className="drag-pool" onDragOver={(e) => e.preventDefault()} onDrop={dropToPool}>
              {pool.length === 0 ? (
                <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                  Glisse un nombre ici pour le retirer.
                </span>
              ) : (
                pool.map((n) => (
                  <div
                    key={n}
                    className="drag-item"
                    draggable
                    onDragStart={() => { dragSrc.current = { from: 'pool', text: n }; }}
                  >
                    {n}
                  </div>
                ))
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 0 8px' }}>
              Remets-les dans l'ordre {exercise.direction} :
            </p>
          </>
        )}
        {disabled && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Ordre correct :</p>}
        <div className="drag-slots">
          {exercise.numbers.map((correctNum, i) => {
            const content = disabled ? correctNum : placed[i];
            return (
              <div
                key={i}
                className="drag-slot"
                onDragOver={(e) => { if (!disabled) e.preventDefault(); }}
                onDrop={() => { if (!disabled) dropToSlot(i); }}
              >
                <span className="drag-slot-num">{i + 1}.</span>
                {content != null ? (
                  <div
                    className="drag-item drag-slot-item"
                    draggable={!disabled}
                    onDragStart={!disabled ? () => { dragSrc.current = { from: 'slot', idx: i, text: content }; } : undefined}
                  >
                    {content}
                  </div>
                ) : (
                  <span className="drag-slot-empty">Glisse un nombre ici…</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {!disabled && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
          <button className="btn-secondary" onClick={handleVerify} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            Vérifier
          </button>
          {feedback.text && <span className={feedback.cls} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{feedback.text}</span>}
        </div>
      )}
      {disabled && finalFb.text && (
        <div style={{ marginTop: 12 }}>
          <span className={finalFb.cls} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{finalFb.text}</span>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`}>
          {exercise.numbers.map((n, i) => (
            <div key={i}>
              <span className="step-eq">{i + 1}. {n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Q1 (Intercaler) : entier qui suit ou qui précède ────────────────────────────

interface EncadrerRow {
  decStr: string;
  blankSide: 'before' | 'after';
  ans: number;
}

interface EncadrerExercise {
  rows: EncadrerRow[];
}

function makeEncadrerRow(): EncadrerRow {
  const d = pick([1, 2, 3] as const);
  const intPart = randInt(0, 900);
  let fracDigits: number[];
  do {
    fracDigits = Array.from({ length: d }, () => randInt(0, 9));
  } while (fracDigits.every((x) => x === 0));
  const decStr = fmtDecStr(intPart, fracDigits);
  const blankSide: 'before' | 'after' = Math.random() < 0.5 ? 'after' : 'before';
  const ans = blankSide === 'after' ? intPart + 1 : intPart;
  return { decStr, blankSide, ans };
}

function generateEncadrerExercise(): EncadrerExercise {
  return { rows: Array.from({ length: 8 }, makeEncadrerRow) };
}

const ROW_LETTERS8 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function EncadrerConsecutifQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: EncadrerExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVals] = useState<string[]>(exercise.rows.map(() => ''));
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const setVal = (i: number, v: string) => setVals((prev) => prev.map((x, idx) => (idx === i ? v : x)));

  const rowOk = (i: number) => {
    const v = parseNum(vals[i]!);
    return v !== null && v === exercise.rows[i]!.ans;
  };

  const submit = () => {
    if (disabled) return;
    if (vals.some((v) => v.trim() === '')) return;
    onSubmit(exercise.rows.every((_, i) => rowOk(i)));
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          Entier qui suit ou qui précède
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Complète avec l'entier qui suit ou qui précède.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {exercise.rows.map((r, i) => {
          const showFb = disabled;
          const ok = showFb ? rowOk(i) : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 8,
                background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)',
              }}
            >
              <span style={{ width: 14, color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>{ROW_LETTERS8[i]}.</span>
              {r.blankSide === 'before' ? (
                <>
                  <input type="text" value={vals[i]} placeholder="?" disabled={disabled} onChange={(e) => setVal(i, e.target.value)} style={blankInp} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>&lt;</span>
                  <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{r.decStr}</strong>
                </>
              ) : (
                <>
                  <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{r.decStr}</strong>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>&lt;</span>
                  <input type="text" value={vals[i]} placeholder="?" disabled={disabled} onChange={(e) => setVal(i, e.target.value)} style={blankInp} />
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Une ou plusieurs réponses sont incorrectes.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          {exercise.rows.map((r, i) => (
            <div key={i}>
              <strong>{ROW_LETTERS8[i]}.</strong>{' '}
              {r.blankSide === 'before'
                ? (<>{r.ans} <strong style={{ color: 'var(--correct)' }}>&lt;</strong> {r.decStr}</>)
                : (<>{r.decStr} <strong style={{ color: 'var(--correct)' }}>&lt;</strong> {r.ans}</>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Q2 (Intercaler) : encadrer par deux entiers consécutifs ────────────────────

interface PairRow {
  decStr: string;
  intPart: number;
}

interface PairExercise {
  rows: PairRow[];
}

function makePairRow(): PairRow {
  const d = pick([1, 2, 3] as const);
  const intPart = randInt(0, 900);
  let fracDigits: number[];
  do {
    fracDigits = Array.from({ length: d }, () => randInt(0, 9));
  } while (fracDigits.every((x) => x === 0));
  return { decStr: fmtDecStr(intPart, fracDigits), intPart };
}

function generatePairExercise(): PairExercise {
  return { rows: Array.from({ length: 4 }, makePairRow) };
}

const ROW_LETTERS4 = ['a', 'b', 'c', 'd'];

function DeuxEntiersConsecutifsQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: PairExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [lows, setLows] = useState<string[]>(exercise.rows.map(() => ''));
  const [highs, setHighs] = useState<string[]>(exercise.rows.map(() => ''));
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const rowOk = (i: number) => {
    const lo = parseNum(lows[i]!);
    const hi = parseNum(highs[i]!);
    return lo !== null && hi !== null && lo === exercise.rows[i]!.intPart && hi === exercise.rows[i]!.intPart + 1;
  };

  const submit = () => {
    if (disabled) return;
    if (lows.some((v) => v.trim() === '') || highs.some((v) => v.trim() === '')) return;
    onSubmit(exercise.rows.every((_, i) => rowOk(i)));
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          Deux entiers consécutifs
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Complète avec deux entiers consécutifs.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {exercise.rows.map((r, i) => {
          const showFb = disabled;
          const ok = showFb ? rowOk(i) : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8,
                background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)',
              }}
            >
              <span style={{ width: 14, color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>{ROW_LETTERS4[i]}.</span>
              <input type="text" value={lows[i]} placeholder="?" disabled={disabled} onChange={(e) => setLows((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))} style={blankInp} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>&lt;</span>
              <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{r.decStr}</strong>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>&lt;</span>
              <input type="text" value={highs[i]} placeholder="?" disabled={disabled} onChange={(e) => setHighs((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))} style={blankInp} />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Une ou plusieurs réponses sont incorrectes.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          {exercise.rows.map((r, i) => (
            <div key={i}>
              <strong>{ROW_LETTERS4[i]}.</strong>{' '}
              <strong style={{ color: 'var(--correct)' }}>{r.intPart}</strong> &lt; {r.decStr} &lt; <strong style={{ color: 'var(--correct)' }}>{r.intPart + 1}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Q3 (Intercaler) : intercaler un nombre décimal ──────────────────────────────

interface IntercalerRow {
  lowerStr: string;
  upperStr: string;
  lowerVal: number;
  upperVal: number;
  exampleStr: string;
}

interface IntercalerExercise {
  rows: IntercalerRow[];
}

function makeIntercalerRow(): IntercalerRow {
  const p = pick([1, 2] as const);
  const intPart = randInt(0, 90);
  let fracDigits: number[];
  let fracVal: number;
  do {
    fracDigits = Array.from({ length: p }, () => randInt(0, 9));
    fracVal = parseInt(fracDigits.join(''), 10);
  } while (fracVal === Math.pow(10, p) - 1);
  const lowerStr = fmtDecStr(intPart, fracDigits);
  const nextDigits = String(fracVal + 1).padStart(p, '0').split('').map(Number);
  const upperStr = fmtDecStr(intPart, nextDigits);
  const lowerVal = parseFloat(`${intPart}.${fracDigits.join('')}`);
  const upperVal = parseFloat(`${intPart}.${nextDigits.join('')}`);
  const exampleStr = fmtDecStr(intPart, [...fracDigits, 5]);
  return { lowerStr, upperStr, lowerVal, upperVal, exampleStr };
}

function generateIntercalerExercise(): IntercalerExercise {
  return { rows: Array.from({ length: 4 }, makeIntercalerRow) };
}

function IntercalerDecimalQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: IntercalerExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVals] = useState<string[]>(exercise.rows.map(() => ''));
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const setVal = (i: number, v: string) => setVals((prev) => prev.map((x, idx) => (idx === i ? v : x)));

  const rowOk = (i: number) => {
    const v = parseNum(vals[i]!);
    const r = exercise.rows[i]!;
    return v !== null && v > r.lowerVal && v < r.upperVal;
  };

  const submit = () => {
    if (disabled) return;
    if (vals.some((v) => v.trim() === '')) return;
    onSubmit(exercise.rows.every((_, i) => rowOk(i)));
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${accent}22`, color: accent }}>
          Intercaler un nombre décimal
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Complète avec un nombre décimal compris strictement entre les deux nombres donnés.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {exercise.rows.map((r, i) => {
          const showFb = disabled;
          const ok = showFb ? rowOk(i) : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8,
                background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)',
              }}
            >
              <span style={{ width: 14, color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>{ROW_LETTERS4[i]}.</span>
              <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{r.lowerStr}</strong>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>&lt;</span>
              <input type="text" value={vals[i]} placeholder="?" disabled={disabled} onChange={(e) => setVal(i, e.target.value)} style={blankInp} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>&lt;</span>
              <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{r.upperStr}</strong>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Une ou plusieurs réponses sont incorrectes.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          {exercise.rows.map((r, i) => (
            <div key={i}>
              <strong>{ROW_LETTERS4[i]}.</strong> {r.lowerStr} &lt; <strong style={{ color: 'var(--correct)' }}>{r.exampleStr}</strong> &lt; {r.upperStr}
              <span style={{ color: 'var(--muted)', fontSize: 12 }}> (d'autres réponses sont possibles)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DecimauxCompareHub (main export) ────────────────────────────────────────────

type CompareHubExercise =
  | { exKind: 'compare'; data: CompareExercise }
  | { exKind: 'order'; data: OrderExercise }
  | { exKind: 'encadrer'; data: EncadrerExercise }
  | { exKind: 'pair'; data: PairExercise }
  | { exKind: 'intercaler'; data: IntercalerExercise };

function buildExercises(mode: HubMode): CompareHubExercise[] {
  if (mode === 'intercaler') {
    return [
      { exKind: 'encadrer', data: generateEncadrerExercise() },
      { exKind: 'pair', data: generatePairExercise() },
      { exKind: 'intercaler', data: generateIntercalerExercise() },
    ];
  }
  return [
    { exKind: 'compare', data: generateCompareExercise() },
    { exKind: 'order', data: generateOrderExercise('croissant') },
    { exKind: 'order', data: generateOrderExercise('décroissant') },
  ];
}

const MODES: { id: Exclude<HubMode, null>; label: string; icon: string; desc: string }[] = [
  {
    id: 'comparer',
    label: 'Comparer',
    icon: '<>',
    desc: '3 exercices · Comparer avec <, > ou =, ranger dans l\'ordre croissant et décroissant',
  },
  {
    id: 'intercaler',
    label: 'Intercaler',
    icon: '…',
    desc: '3 exercices · Encadrer par deux entiers consécutifs, intercaler un nombre décimal',
  },
];

export function DecimauxCompareHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode>(null);
  const [exercises, setExercises] = useState<CompareHubExercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const loadExercises = (m: HubMode) => {
    if (m === null) return;
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

      {mode === 'comparer' && <RecallCompare accent={accent} />}
      {mode === 'intercaler' && <RecallIntercaler accent={accent} />}

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
          if (ex.exKind === 'compare') return <ComparisonSymbolsQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'order') return <OrderDragDrop {...common} exercise={ex.data} />;
          if (ex.exKind === 'encadrer') return <EncadrerConsecutifQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'pair') return <DeuxEntiersConsecutifsQuestion {...common} exercise={ex.data} />;
          return <IntercalerDecimalQuestion {...common} exercise={ex.data} />;
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
