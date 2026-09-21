import { useEffect, useMemo, useRef, useState } from 'react';
import type { AutoQCMExercise, AutoCalcExercise } from '@/types';
import { AutomatismesQuestion } from './AutomatismesQuestion';
import { ReperageHub5eme } from '../ReperageHub5eme';
import { DivEuclidienne5eme } from '../DivEuclidienne5eme';

type MainMode = 'priorites' | 'reperage' | 'division' | 'dev-fact' | null;
type SubMode = 'sans-parentheses' | 'avec-parentheses' | 'developper' | 'factoriser' | null;

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

// ── ModeCard ──────────────────────────────────────────────────────────────────

function ModeCard({
  label, icon, desc, accent, onClick, href,
}: {
  label: string; icon: string; desc: string; accent: string; onClick?: () => void; href?: string;
}) {
  const sharedStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
    textAlign: 'left', color: 'var(--text)', transition: 'border-color 0.15s', width: '100%',
    textDecoration: 'none',
  };
  const inner = (
    <>
      <span style={{ fontSize: 26, minWidth: 36, textAlign: 'center', color: accent }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        style={sharedStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={sharedStyle}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      {inner}
    </button>
  );
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

// ── Rappels ───────────────────────────────────────────────────────────────────

function RecallSansParentheses({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}>
        <span>{open ? '▼' : '▶'}</span> Rappel — priorités opératoires + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <p style={{ marginTop: 12, marginBottom: 4 }}>
          Dans une expression <strong>sans parenthèses</strong> :
        </p>
        <ol style={{ margin: '0 0 8px 18px', padding: 0 }}>
          <li>On effectue d'abord les <strong>multiplications (×)</strong> et <strong>divisions (÷)</strong>.</li>
          <li>Puis les <strong>additions (+)</strong> et <strong>soustractions (−)</strong>.</li>
          <li>À priorité égale, on calcule de <strong>gauche à droite</strong>.</li>
        </ol>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/idB0-F7b1Yk" label="Calcul sans parenthèse et sans priorité" />
          <VideoLink url="https://youtu.be/TJH-fiwAt5s" label="Calcul sans parenthèse et avec priorité" />
        </div>
      </div>
    </div>
  );
}

function RecallAvecParentheses({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}>
        <span>{open ? '▼' : '▶'}</span> Rappel — parenthèses et crochets + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <p style={{ marginTop: 12, marginBottom: 4 }}>
          Dans une expression <strong>avec parenthèses</strong> :
        </p>
        <ol style={{ margin: '0 0 8px 18px', padding: 0 }}>
          <li>On commence par calculer ce qui est entre <strong>parenthèses ( )</strong>.</li>
          <li>Si des crochets [ ] entourent des parenthèses, on calcule les parenthèses <strong>les plus intérieures en premier</strong>.</li>
          <li>Ensuite on applique les règles de priorité habituelles (× et ÷ avant + et −).</li>
        </ol>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/kNOR38ZuBRc" label="Expression avec des parenthèses" />
          <VideoLink url="https://youtu.be/fCDe27qL4Ko" label="Expression avec des parenthèses doubles (1)" />
          <VideoLink url="https://youtu.be/mLlLNM5D66M" label="Expression avec des parenthèses doubles (2)" />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ok = (s: string) => `<strong style="color:var(--correct)">${s}</strong>`;
const expr = (s: string) => `<span style="font-family:'DM Mono',monospace;background:var(--surface2);padding:2px 8px;border-radius:4px">${s}</span>`;

// ── Équation à trous — l'élève remplit chaque nombre dans sa propre case ──────
// Les symboles (×, +, −, parenthèses) restent fixes, seuls les nombres sont saisis.

type EqSlot = { kind: 'num'; value: number } | { kind: 'op'; text: string };

const N = (value: number): EqSlot => ({ kind: 'num', value });
const O = (text: string): EqSlot => ({ kind: 'op', text });

/** One line of an equation: a fixed prefix (e.g. "84 × 102 =" or just "=") followed by number/symbol slots. */
interface EqRow {
  given: string;
  slots: EqSlot[];
}

/** One equation to complete, made of one or more successive lines (intermediate steps → final answer). */
interface EqPart {
  rows: EqRow[];
  stepsHtml: string;
}

/** Shorthand for a single-line part (used by the "no calculation" fill-in-the-blanks exercises). */
const onePart = (given: string, slots: EqSlot[], stepsHtml: string): EqPart => ({
  rows: [{ given, slots }],
  stepsHtml,
});

interface EquationBlanksExercise {
  type: 'default';
  exKind: 'auto-eq';
  qnum: number;
  category: string;
  questionHtml: string;
  parts: EqPart[];
}

type Ex = AutoQCMExercise | AutoCalcExercise | EquationBlanksExercise;

interface EqPartState {
  vals: string[][];
  status: 'pending' | 'correct' | 'wrong';
  hintOpen: boolean;
}

function EquationBlanksCard({ exercise, answer, accent, onSubmit }: {
  exercise: EquationBlanksExercise;
  answer: { status: 'pending' | 'correct' | 'wrong' | 'revealed' };
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [parts, setParts] = useState<EqPartState[]>(
    exercise.parts.map((p) => ({ vals: p.rows.map((r) => r.slots.map(() => '')), status: 'pending', hintOpen: false }))
  );
  const submitted = useRef(false);
  const isDone = answer.status !== 'pending';

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

  const setVal = (pi: number, ri: number, si: number, v: string) =>
    setParts((prev) =>
      prev.map((p, idx) =>
        idx === pi
          ? { ...p, vals: p.vals.map((row, r) => (r === ri ? row.map((val, s) => (s === si ? v : val)) : row)) }
          : p
      )
    );

  const validate = (pi: number) => {
    if (isDone || parts[pi]!.status !== 'pending') return;
    const part = exercise.parts[pi]!;
    const allEmpty = part.rows.some((row, ri) =>
      row.slots.some((slot, si) => slot.kind === 'num' && parts[pi]!.vals[ri]![si]!.trim() === '')
    );
    if (allEmpty) return;
    const okAll = part.rows.every((row, ri) =>
      row.slots.every((slot, si) => {
        if (slot.kind !== 'num') return true;
        const v = parseInt(parts[pi]!.vals[ri]![si]!.trim(), 10);
        return !Number.isNaN(v) && v === slot.value;
      })
    );
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, status: okAll ? 'correct' : 'wrong', hintOpen: !okAll } : p)));
  };

  const toggleHint = (pi: number) =>
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, hintOpen: !p.hintOpen } : p)));

  return (
    <div
      className={`qcard${answer.status === 'correct' ? ' correct-card' : answer.status === 'wrong' || answer.status === 'revealed' ? ' wrong-card' : ''}`}
      style={{ gridColumn: '1 / -1', borderLeft: `3px solid ${accent}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.7rem' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>Q{exercise.qnum}</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: 'var(--surface2)', color: 'var(--muted)', letterSpacing: 0.3 }}>
          {exercise.category}
        </span>
      </div>
      <div style={{ fontSize: 14, marginBottom: '1rem', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: exercise.questionHtml }} />
      {exercise.parts.map((part, pi) => {
        const ps = parts[pi]!;
        const partDone = isDone || ps.status !== 'pending';
        const borderCol = ps.status === 'correct' ? 'var(--correct)' : ps.status === 'wrong' ? 'var(--wrong)' : 'var(--border2)';
        return (
          <div key={pi} style={{ marginBottom: '0.8rem', padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderCol}`, background: 'var(--surface)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {part.rows.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontFamily: "'DM Mono', monospace", fontSize: 15 }}>
                  <span dangerouslySetInnerHTML={{ __html: row.given }} />
                  {row.slots.map((slot, si) =>
                    slot.kind === 'op' ? (
                      <span key={si} style={{ color: 'var(--text)' }}>{slot.text}</span>
                    ) : (
                      <input
                        key={si}
                        type="text"
                        value={ps.vals[ri]![si]}
                        placeholder="…"
                        disabled={partDone}
                        onChange={(e) => setVal(pi, ri, si, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') validate(pi); }}
                        style={{
                          width: 46, fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
                          padding: '4px 2px', borderRadius: 6, border: '1px solid var(--border2)',
                          background: 'var(--bg)', color: 'var(--text)', textAlign: 'center',
                        }}
                      />
                    )
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!partDone && (
                  <button className="btn-secondary" onClick={() => validate(pi)} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 8 }}>
                    OK
                  </button>
                )}
                {ps.status !== 'pending' && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: ps.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                    {ps.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
                  </span>
                )}
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <button type="button" className="hint-toggle" onClick={() => toggleHint(pi)}>
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

// ── Sans parenthèses — 4 séries ───────────────────────────────────────────────

const SANS_PARENTHESES_BANK: Ex[][] = [
  // ── Série 0 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('3 + 5 × 2')}, quelle est l'opération prioritaire ?`,
      choices: ['× (multiplication)', '÷ (division)', '+ (addition)', '− (soustraction)'],
      correctIndex: 0,
      stepsHtml: `Les multiplications et divisions sont <strong>prioritaires</strong> sur les additions et soustractions.<br><br>On effectue d'abord <u>5 × 2</u> = 10, puis 3 + 10 = ${ok('13')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('28 − 12 ÷ 4 + 1')}, quelle est l'opération prioritaire ?`,
      choices: ['÷ (division)', '− (soustraction)', '+ (addition)', '× (multiplication)'],
      correctIndex: 0,
      stepsHtml: `La division est prioritaire.<br><br>On effectue d'abord <u>12 ÷ 4</u> = 3, puis 28 − 3 + 1 = ${ok('26')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul mental',
      questionHtml: `Calcule mentalement en respectant les priorités opératoires.`,
      parts: [
        { label: '8 × 3 − 14 =', answer: '10', stepsHtml: `Priorité à × : <u>8 × 3</u> = 24<br>24 − 14 = ${ok('10')}` },
        { label: '50 − 18 ÷ 3 =', answer: '44', stepsHtml: `Priorité à ÷ : <u>18 ÷ 3</u> = 6<br>50 − 6 = ${ok('44')}` },
        { label: '20 − 4 × 4 =', answer: '4', stepsHtml: `Priorité à × : <u>4 × 4</u> = 16<br>20 − 16 = ${ok('4')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue les calculs. Les opérations de même priorité s'effectuent de gauche à droite.`,
      parts: [
        { label: 'A = 15 − 8 + 4 =', answer: '11', stepsHtml: `A = <u>15 − 8</u> + 4 = 7 + 4 = ${ok('11')}` },
        { label: 'B = 15 + 8 − 4 =', answer: '19', stepsHtml: `B = <u>15 + 8</u> − 4 = 23 − 4 = ${ok('19')}` },
        { label: 'C = 6 × 3 × 2 =', answer: '36', stepsHtml: `C = <u>6 × 3</u> × 2 = 18 × 2 = ${ok('36')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue les calculs suivants.`,
      parts: [
        { label: 'G = 2 × 4 ÷ 4 =', answer: '2', stepsHtml: `G = <u>2 × 4</u> ÷ 4 = 8 ÷ 4 = ${ok('2')}` },
        { label: 'H = 12 × 4 ÷ 3 =', answer: '16', stepsHtml: `H = <u>12 × 4</u> ÷ 3 = 48 ÷ 3 = ${ok('16')}` },
        { label: 'I = 18 − 2 × 5 =', answer: '8', stepsHtml: `I = 18 − <u>2 × 5</u> = 18 − 10 = ${ok('8')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue les calculs en détaillant chaque étape.`,
      parts: [
        { label: 'M = 24 + 3 × 7 =', answer: '45', stepsHtml: `M = 24 + <u>3 × 7</u> = 24 + 21 = ${ok('45')}` },
        { label: 'N = 15 ÷ 5 − 2 =', answer: '1', stepsHtml: `N = <u>15 ÷ 5</u> − 2 = 3 − 2 = ${ok('1')}` },
        { label: 'P = 20 − 0,1 × 38 =', answer: '16.2', altAnswers: ['16,2'], stepsHtml: `P = 20 − <u>0,1 × 38</u> = 20 − 3,8 = ${ok('16,2')}` },
      ],
    },
  ],
  // ── Série 1 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('20 − 6 ÷ 2')}, quelle est l'opération prioritaire ?`,
      choices: ['÷ (division)', '× (multiplication)', '− (soustraction)', '+ (addition)'],
      correctIndex: 0,
      stepsHtml: `La division est <strong>prioritaire</strong> sur la soustraction.<br><br>On effectue d'abord <u>6 ÷ 2</u> = 3, puis 20 − 3 = ${ok('17')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('15 + 3 × 7 − 2')}, quelle est l'opération prioritaire ?`,
      choices: ['× (multiplication)', '÷ (division)', '+ (addition)', '− (soustraction)'],
      correctIndex: 0,
      stepsHtml: `La multiplication est prioritaire.<br><br>On effectue d'abord <u>3 × 7</u> = 21, puis 15 + 21 − 2 = ${ok('34')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul mental',
      questionHtml: `Calcule mentalement en respectant les priorités opératoires.`,
      parts: [
        { label: '7 × 4 − 10 =', answer: '18', stepsHtml: `Priorité à × : <u>7 × 4</u> = 28<br>28 − 10 = ${ok('18')}` },
        { label: '60 − 24 ÷ 4 =', answer: '54', stepsHtml: `Priorité à ÷ : <u>24 ÷ 4</u> = 6<br>60 − 6 = ${ok('54')}` },
        { label: '30 − 3 × 8 =', answer: '6', stepsHtml: `Priorité à × : <u>3 × 8</u> = 24<br>30 − 24 = ${ok('6')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue les calculs. Les opérations de même priorité s'effectuent de gauche à droite.`,
      parts: [
        { label: 'A = 20 − 12 + 5 =', answer: '13', stepsHtml: `A = <u>20 − 12</u> + 5 = 8 + 5 = ${ok('13')}` },
        { label: 'B = 10 + 9 − 4 =', answer: '15', stepsHtml: `B = <u>10 + 9</u> − 4 = 19 − 4 = ${ok('15')}` },
        { label: 'C = 4 × 5 × 2 =', answer: '40', stepsHtml: `C = <u>4 × 5</u> × 2 = 20 × 2 = ${ok('40')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue les calculs suivants.`,
      parts: [
        { label: 'G = 3 × 6 ÷ 9 =', answer: '2', stepsHtml: `G = <u>3 × 6</u> ÷ 9 = 18 ÷ 9 = ${ok('2')}` },
        { label: 'H = 20 × 3 ÷ 4 =', answer: '15', stepsHtml: `H = <u>20 × 3</u> ÷ 4 = 60 ÷ 4 = ${ok('15')}` },
        { label: 'I = 24 − 4 × 3 =', answer: '12', stepsHtml: `I = 24 − <u>4 × 3</u> = 24 − 12 = ${ok('12')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue les calculs en détaillant chaque étape.`,
      parts: [
        { label: 'M = 10 + 4 × 8 =', answer: '42', stepsHtml: `M = 10 + <u>4 × 8</u> = 10 + 32 = ${ok('42')}` },
        { label: 'N = 30 ÷ 6 − 1 =', answer: '4', stepsHtml: `N = <u>30 ÷ 6</u> − 1 = 5 − 1 = ${ok('4')}` },
        { label: 'P = 15 − 0,2 × 20 =', answer: '11', stepsHtml: `P = 15 − <u>0,2 × 20</u> = 15 − 4 = ${ok('11')}` },
      ],
    },
  ],
  // ── Série 2 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('12 ÷ 4 + 7')}, quelle est l'opération prioritaire ?`,
      choices: ['÷ (division)', '× (multiplication)', '+ (addition)', '− (soustraction)'],
      correctIndex: 0,
      stepsHtml: `La division est <strong>prioritaire</strong> sur l'addition.<br><br>On effectue d'abord <u>12 ÷ 4</u> = 3, puis 3 + 7 = ${ok('10')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('6 × 5 − 8 + 2')}, quelle est l'opération prioritaire ?`,
      choices: ['× (multiplication)', '÷ (division)', '− (soustraction)', '+ (addition)'],
      correctIndex: 0,
      stepsHtml: `La multiplication est prioritaire.<br><br>On effectue d'abord <u>6 × 5</u> = 30, puis 30 − 8 + 2 = ${ok('24')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul mental',
      questionHtml: `Calcule mentalement en respectant les priorités opératoires.`,
      parts: [
        { label: '9 × 5 − 25 =', answer: '20', stepsHtml: `Priorité à × : <u>9 × 5</u> = 45<br>45 − 25 = ${ok('20')}` },
        { label: '40 − 32 ÷ 4 =', answer: '32', stepsHtml: `Priorité à ÷ : <u>32 ÷ 4</u> = 8<br>40 − 8 = ${ok('32')}` },
        { label: '7 × 6 − 22 =', answer: '20', stepsHtml: `Priorité à × : <u>7 × 6</u> = 42<br>42 − 22 = ${ok('20')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue les calculs. Les opérations de même priorité s'effectuent de gauche à droite.`,
      parts: [
        { label: 'A = 18 − 5 + 3 =', answer: '16', stepsHtml: `A = <u>18 − 5</u> + 3 = 13 + 3 = ${ok('16')}` },
        { label: 'B = 12 + 7 − 8 =', answer: '11', stepsHtml: `B = <u>12 + 7</u> − 8 = 19 − 8 = ${ok('11')}` },
        { label: 'C = 5 × 4 × 3 =', answer: '60', stepsHtml: `C = <u>5 × 4</u> × 3 = 20 × 3 = ${ok('60')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue les calculs suivants.`,
      parts: [
        { label: 'G = 4 × 5 ÷ 10 =', answer: '2', stepsHtml: `G = <u>4 × 5</u> ÷ 10 = 20 ÷ 10 = ${ok('2')}` },
        { label: 'H = 15 × 2 ÷ 6 =', answer: '5', stepsHtml: `H = <u>15 × 2</u> ÷ 6 = 30 ÷ 6 = ${ok('5')}` },
        { label: 'I = 30 − 3 × 8 =', answer: '6', stepsHtml: `I = 30 − <u>3 × 8</u> = 30 − 24 = ${ok('6')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue les calculs en détaillant chaque étape.`,
      parts: [
        { label: 'M = 35 + 5 × 4 =', answer: '55', stepsHtml: `M = 35 + <u>5 × 4</u> = 35 + 20 = ${ok('55')}` },
        { label: 'N = 24 ÷ 8 − 2 =', answer: '1', stepsHtml: `N = <u>24 ÷ 8</u> − 2 = 3 − 2 = ${ok('1')}` },
        { label: 'P = 10 + 0,5 × 6 =', answer: '13', stepsHtml: `P = 10 + <u>0,5 × 6</u> = 10 + 3 = ${ok('13')}` },
      ],
    },
  ],
  // ── Série 3 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('5 × 3 + 14')}, quelle est l'opération prioritaire ?`,
      choices: ['× (multiplication)', '÷ (division)', '+ (addition)', '− (soustraction)'],
      correctIndex: 0,
      stepsHtml: `La multiplication est <strong>prioritaire</strong> sur l'addition.<br><br>On effectue d'abord <u>5 × 3</u> = 15, puis 15 + 14 = ${ok('29')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Opération prioritaire',
      questionHtml: `Dans l'expression ${expr('40 ÷ 8 − 1 + 6')}, quelle est l'opération prioritaire ?`,
      choices: ['÷ (division)', '× (multiplication)', '− (soustraction)', '+ (addition)'],
      correctIndex: 0,
      stepsHtml: `La division est prioritaire.<br><br>On effectue d'abord <u>40 ÷ 8</u> = 5, puis 5 − 1 + 6 = ${ok('10')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul mental',
      questionHtml: `Calcule mentalement en respectant les priorités opératoires.`,
      parts: [
        { label: '6 × 7 − 12 =', answer: '30', stepsHtml: `Priorité à × : <u>6 × 7</u> = 42<br>42 − 12 = ${ok('30')}` },
        { label: '80 − 45 ÷ 9 =', answer: '75', stepsHtml: `Priorité à ÷ : <u>45 ÷ 9</u> = 5<br>80 − 5 = ${ok('75')}` },
        { label: '50 − 6 × 7 =', answer: '8', stepsHtml: `Priorité à × : <u>6 × 7</u> = 42<br>50 − 42 = ${ok('8')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue les calculs. Les opérations de même priorité s'effectuent de gauche à droite.`,
      parts: [
        { label: 'A = 25 − 13 + 6 =', answer: '18', stepsHtml: `A = <u>25 − 13</u> + 6 = 12 + 6 = ${ok('18')}` },
        { label: 'B = 8 + 14 − 9 =', answer: '13', stepsHtml: `B = <u>8 + 14</u> − 9 = 22 − 9 = ${ok('13')}` },
        { label: 'C = 3 × 4 × 5 =', answer: '60', stepsHtml: `C = <u>3 × 4</u> × 5 = 12 × 5 = ${ok('60')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue les calculs suivants.`,
      parts: [
        { label: 'G = 5 × 6 ÷ 15 =', answer: '2', stepsHtml: `G = <u>5 × 6</u> ÷ 15 = 30 ÷ 15 = ${ok('2')}` },
        { label: 'H = 8 × 6 ÷ 4 =', answer: '12', stepsHtml: `H = <u>8 × 6</u> ÷ 4 = 48 ÷ 4 = ${ok('12')}` },
        { label: 'I = 36 − 4 × 7 =', answer: '8', stepsHtml: `I = 36 − <u>4 × 7</u> = 36 − 28 = ${ok('8')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue les calculs en détaillant chaque étape.`,
      parts: [
        { label: 'M = 16 + 2 × 9 =', answer: '34', stepsHtml: `M = 16 + <u>2 × 9</u> = 16 + 18 = ${ok('34')}` },
        { label: 'N = 42 ÷ 7 − 4 =', answer: '2', stepsHtml: `N = <u>42 ÷ 7</u> − 4 = 6 − 4 = ${ok('2')}` },
        { label: 'P = 25 − 0,5 × 10 =', answer: '20', stepsHtml: `P = 25 − <u>0,5 × 10</u> = 25 − 5 = ${ok('20')}` },
      ],
    },
  ],
];

// ── Avec parenthèses — 4 séries ───────────────────────────────────────────────

const AVEC_PARENTHESES_BANK: Ex[][] = [
  // ── Série 0 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('(6,2 − 0,1) ÷ 10')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '6,2 − 0,1 (calcul entre parenthèses)',
        'la division ÷ 10',
        '6,2 ÷ 10',
        '0,1 ÷ 10',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont <strong>prioritaires</strong>.<br><br>On effectue d'abord <u>(6,2 − 0,1)</u> = 6,1, puis 6,1 ÷ 10 = ${ok('0,61')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('238 − 4 × (13 + 27)')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '13 + 27 (calcul entre parenthèses)',
        '4 × 13 (multiplication)',
        '238 − 4 (soustraction)',
        '4 × 27 (multiplication)',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont prioritaires. On effectue d'abord <u>(13 + 27)</u> = 40.<br><br>Ensuite : 238 − 4 × 40 → <u>4 × 40</u> = 160 → 238 − 160 = ${ok('78')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>A = 24 − (8 − 3) + 1</strong>`,
      parts: [
        { label: 'A =', answer: '20', stepsHtml: `Parenthèses : <u>(8 − 3)</u> = 5<br>A = 24 − 5 + 1 = <u>24 − 5</u> + 1 = 19 + 1 = ${ok('20')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>B = 24 − 8 − (3 + 1)</strong>`,
      parts: [
        { label: 'B =', answer: '12', stepsHtml: `Parenthèses : <u>(3 + 1)</u> = 4<br>B = 24 − 8 − 4 = <u>24 − 8</u> − 4 = 16 − 4 = ${ok('12')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>C = 24 ÷ [8 − (3 + 1)]</strong>`,
      parts: [
        { label: 'C =', answer: '6', stepsHtml: `Parenthèses : <u>(3 + 1)</u> = 4<br>Crochets : <u>[8 − 4]</u> = 4<br>C = 24 ÷ 4 = ${ok('6')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>D = 18 − [4 × (5 − 3) + 2]</strong>`,
      parts: [
        { label: 'D =', answer: '8', stepsHtml: `Parenthèses : <u>(5 − 3)</u> = 2<br>Priorité à × dans les crochets : <u>4 × 2</u> = 8<br>Crochets : <u>[8 + 2]</u> = 10<br>D = 18 − 10 = ${ok('8')}` },
      ],
    },
  ],
  // ── Série 1 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('(8 + 2) × 5')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '8 + 2 (calcul entre parenthèses)',
        'la multiplication × 5',
        '8 × 5',
        '2 × 5',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont <strong>prioritaires</strong>.<br><br>On effectue d'abord <u>(8 + 2)</u> = 10, puis 10 × 5 = ${ok('50')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('50 − 2 × (8 + 3)')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '8 + 3 (calcul entre parenthèses)',
        '2 × 8 (multiplication)',
        '50 − 2 (soustraction)',
        '2 × 3 (multiplication)',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont prioritaires. On effectue d'abord <u>(8 + 3)</u> = 11.<br><br>Ensuite : 50 − 2 × 11 → <u>2 × 11</u> = 22 → 50 − 22 = ${ok('28')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>A = 30 − (10 − 5) + 2</strong>`,
      parts: [
        { label: 'A =', answer: '27', stepsHtml: `Parenthèses : <u>(10 − 5)</u> = 5<br>A = 30 − 5 + 2 = <u>30 − 5</u> + 2 = 25 + 2 = ${ok('27')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>B = 30 − 10 − (2 + 3)</strong>`,
      parts: [
        { label: 'B =', answer: '15', stepsHtml: `Parenthèses : <u>(2 + 3)</u> = 5<br>B = 30 − 10 − 5 = <u>30 − 10</u> − 5 = 20 − 5 = ${ok('15')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>C = 40 ÷ [10 − (3 + 3)]</strong>`,
      parts: [
        { label: 'C =', answer: '10', stepsHtml: `Parenthèses : <u>(3 + 3)</u> = 6<br>Crochets : <u>[10 − 6]</u> = 4<br>C = 40 ÷ 4 = ${ok('10')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>D = 25 − [3 × (6 − 2) + 1]</strong>`,
      parts: [
        { label: 'D =', answer: '12', stepsHtml: `Parenthèses : <u>(6 − 2)</u> = 4<br>Priorité à × dans les crochets : <u>3 × 4</u> = 12<br>Crochets : <u>[12 + 1]</u> = 13<br>D = 25 − 13 = ${ok('12')}` },
      ],
    },
  ],
  // ── Série 2 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('(15 − 3) ÷ 4')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '15 − 3 (calcul entre parenthèses)',
        'la division ÷ 4',
        '15 ÷ 4',
        '3 ÷ 4',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont <strong>prioritaires</strong>.<br><br>On effectue d'abord <u>(15 − 3)</u> = 12, puis 12 ÷ 4 = ${ok('3')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('80 + 3 × (10 − 4)')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '10 − 4 (calcul entre parenthèses)',
        '3 × 10 (multiplication)',
        '80 + 3 (addition)',
        '3 × 4 (multiplication)',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont prioritaires. On effectue d'abord <u>(10 − 4)</u> = 6.<br><br>Ensuite : 80 + 3 × 6 → <u>3 × 6</u> = 18 → 80 + 18 = ${ok('98')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>A = 35 − (12 − 8) + 3</strong>`,
      parts: [
        { label: 'A =', answer: '34', stepsHtml: `Parenthèses : <u>(12 − 8)</u> = 4<br>A = 35 − 4 + 3 = <u>35 − 4</u> + 3 = 31 + 3 = ${ok('34')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>B = 40 − 15 − (8 + 2)</strong>`,
      parts: [
        { label: 'B =', answer: '15', stepsHtml: `Parenthèses : <u>(8 + 2)</u> = 10<br>B = 40 − 15 − 10 = <u>40 − 15</u> − 10 = 25 − 10 = ${ok('15')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>C = 36 ÷ [10 − (4 + 3)]</strong>`,
      parts: [
        { label: 'C =', answer: '12', stepsHtml: `Parenthèses : <u>(4 + 3)</u> = 7<br>Crochets : <u>[10 − 7]</u> = 3<br>C = 36 ÷ 3 = ${ok('12')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>D = 30 − [5 × (4 − 2) + 6]</strong>`,
      parts: [
        { label: 'D =', answer: '14', stepsHtml: `Parenthèses : <u>(4 − 2)</u> = 2<br>Priorité à × dans les crochets : <u>5 × 2</u> = 10<br>Crochets : <u>[10 + 6]</u> = 16<br>D = 30 − 16 = ${ok('14')}` },
      ],
    },
  ],
  // ── Série 3 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-qcm', qnum: 1,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('(7 + 3) × 6')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '7 + 3 (calcul entre parenthèses)',
        'la multiplication × 6',
        '7 × 6',
        '3 × 6',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont <strong>prioritaires</strong>.<br><br>On effectue d'abord <u>(7 + 3)</u> = 10, puis 10 × 6 = ${ok('60')}.`,
    },
    {
      type: 'default', exKind: 'auto-qcm', qnum: 2,
      category: 'Calcul prioritaire',
      questionHtml: `Dans l'expression ${expr('60 − 5 × (9 + 1)')}, quel calcul effectue-t-on en premier ?`,
      choices: [
        '9 + 1 (calcul entre parenthèses)',
        '5 × 9 (multiplication)',
        '60 − 5 (soustraction)',
        '5 × 1 (multiplication)',
      ],
      correctIndex: 0,
      stepsHtml: `Les parenthèses sont prioritaires. On effectue d'abord <u>(9 + 1)</u> = 10.<br><br>Ensuite : 60 − 5 × 10 → <u>5 × 10</u> = 50 → 60 − 50 = ${ok('10')}.`,
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 3,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>A = 50 − (20 − 8) + 5</strong>`,
      parts: [
        { label: 'A =', answer: '43', stepsHtml: `Parenthèses : <u>(20 − 8)</u> = 12<br>A = 50 − 12 + 5 = <u>50 − 12</u> + 5 = 38 + 5 = ${ok('43')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 4,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>B = 45 − 20 − (6 + 4)</strong>`,
      parts: [
        { label: 'B =', answer: '15', stepsHtml: `Parenthèses : <u>(6 + 4)</u> = 10<br>B = 45 − 20 − 10 = <u>45 − 20</u> − 10 = 25 − 10 = ${ok('15')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 5,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>C = 48 ÷ [12 − (5 + 3)]</strong>`,
      parts: [
        { label: 'C =', answer: '12', stepsHtml: `Parenthèses : <u>(5 + 3)</u> = 8<br>Crochets : <u>[12 − 8]</u> = 4<br>C = 48 ÷ 4 = ${ok('12')}` },
      ],
    },
    {
      type: 'default', exKind: 'auto-calc', qnum: 6,
      category: 'Calcul',
      questionHtml: `Effectue le calcul suivant : <strong>D = 40 − [6 × (3 − 1) + 4]</strong>`,
      parts: [
        { label: 'D =', answer: '24', stepsHtml: `Parenthèses : <u>(3 − 1)</u> = 2<br>Priorité à × dans les crochets : <u>6 × 2</u> = 12<br>Crochets : <u>[12 + 4]</u> = 16<br>D = 40 − 16 = ${ok('24')}` },
      ],
    },
  ],
];

// ── Développer — 3 séries ─────────────────────────────────────────────────────

const DEVELOPPER_BANK: Ex[][] = [
  // ── Série 0 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-eq', qnum: 1, category: 'Distributivité',
      questionHtml: `Complète chaque case pour développer l'expression.`,
      parts: [
        onePart(
          '52 × (34 + 16) =',
          [N(52), O('×'), N(34), O('+'), N(52), O('×'), N(16)],
          `Le facteur 52 multiplie chaque terme de la somme, et les termes 34 et 16 restent inchangés : 52 × (34 + 16) = ${ok('52')} × ${ok('34')} + ${ok('52')} × ${ok('16')}`
        ),
        onePart(
          '68 × (57 − 9) =',
          [N(68), O('×'), N(57), O('−'), N(68), O('×'), N(9)],
          `Le facteur 68 multiplie chaque terme de la différence, et les termes 57 et 9 restent inchangés : 68 × (57 − 9) = ${ok('68')} × ${ok('57')} − ${ok('68')} × ${ok('9')}`
        ),
      ],
    },
    {
      type: 'default', exKind: 'auto-eq', qnum: 2, category: 'Calcul astucieux',
      questionHtml: `Développe pour calculer plus facilement. Complète chaque étape.`,
      parts: [
        {
          rows: [
            { given: '84 × 102 =', slots: [N(84), O('×'), O('('), N(100), O('+'), N(2), O(')')] },
            { given: '=', slots: [N(84), O('×'), N(100), O('+'), N(84), O('×'), N(2)] },
            { given: '=', slots: [N(8400), O('+'), N(168)] },
            { given: '=', slots: [N(8568)] },
          ],
          stepsHtml: `84 × 102 = 84 × (100 + 2) = 84 × 100 + 84 × 2 = 8 400 + 168 = ${ok('8 568')}`,
        },
        {
          rows: [
            { given: '93 × 99 =', slots: [N(93), O('×'), O('('), N(100), O('−'), N(1), O(')')] },
            { given: '=', slots: [N(93), O('×'), N(100), O('−'), N(93), O('×'), N(1)] },
            { given: '=', slots: [N(9300), O('−'), N(93)] },
            { given: '=', slots: [N(9207)] },
          ],
          stepsHtml: `93 × 99 = 93 × (100 − 1) = 93 × 100 − 93 × 1 = 9 300 − 93 = ${ok('9 207')}`,
        },
        {
          rows: [
            { given: '1 003 × 38 =', slots: [N(38), O('×'), O('('), N(1000), O('+'), N(3), O(')')] },
            { given: '=', slots: [N(38), O('×'), N(1000), O('+'), N(38), O('×'), N(3)] },
            { given: '=', slots: [N(38000), O('+'), N(114)] },
            { given: '=', slots: [N(38114)] },
          ],
          stepsHtml: `1 003 × 38 = 38 × (1 000 + 3) = 38 × 1 000 + 38 × 3 = 38 000 + 114 = ${ok('38 114')}`,
        },
      ],
    },
  ],
  // ── Série 1 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-eq', qnum: 1, category: 'Distributivité',
      questionHtml: `Complète chaque case pour développer l'expression.`,
      parts: [
        onePart(
          '45 × (30 + 18) =',
          [N(45), O('×'), N(30), O('+'), N(45), O('×'), N(18)],
          `Le facteur 45 multiplie chaque terme de la somme, et les termes 30 et 18 restent inchangés : 45 × (30 + 18) = ${ok('45')} × ${ok('30')} + ${ok('45')} × ${ok('18')}`
        ),
        onePart(
          '63 × (52 − 9) =',
          [N(63), O('×'), N(52), O('−'), N(63), O('×'), N(9)],
          `Le facteur 63 multiplie chaque terme de la différence, et les termes 52 et 9 restent inchangés : 63 × (52 − 9) = ${ok('63')} × ${ok('52')} − ${ok('63')} × ${ok('9')}`
        ),
      ],
    },
    {
      type: 'default', exKind: 'auto-eq', qnum: 2, category: 'Calcul astucieux',
      questionHtml: `Développe pour calculer plus facilement. Complète chaque étape.`,
      parts: [
        {
          rows: [
            { given: '58 × 102 =', slots: [N(58), O('×'), O('('), N(100), O('+'), N(2), O(')')] },
            { given: '=', slots: [N(58), O('×'), N(100), O('+'), N(58), O('×'), N(2)] },
            { given: '=', slots: [N(5800), O('+'), N(116)] },
            { given: '=', slots: [N(5916)] },
          ],
          stepsHtml: `58 × 102 = 58 × (100 + 2) = 58 × 100 + 58 × 2 = 5 800 + 116 = ${ok('5 916')}`,
        },
        {
          rows: [
            { given: '89 × 98 =', slots: [N(89), O('×'), O('('), N(100), O('−'), N(2), O(')')] },
            { given: '=', slots: [N(89), O('×'), N(100), O('−'), N(89), O('×'), N(2)] },
            { given: '=', slots: [N(8900), O('−'), N(178)] },
            { given: '=', slots: [N(8722)] },
          ],
          stepsHtml: `89 × 98 = 89 × (100 − 2) = 89 × 100 − 89 × 2 = 8 900 − 178 = ${ok('8 722')}`,
        },
        {
          rows: [
            { given: '1 004 × 27 =', slots: [N(27), O('×'), O('('), N(1000), O('+'), N(4), O(')')] },
            { given: '=', slots: [N(27), O('×'), N(1000), O('+'), N(27), O('×'), N(4)] },
            { given: '=', slots: [N(27000), O('+'), N(108)] },
            { given: '=', slots: [N(27108)] },
          ],
          stepsHtml: `1 004 × 27 = 27 × (1 000 + 4) = 27 × 1 000 + 27 × 4 = 27 000 + 108 = ${ok('27 108')}`,
        },
      ],
    },
  ],
  // ── Série 2 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-eq', qnum: 1, category: 'Distributivité',
      questionHtml: `Complète chaque case pour développer l'expression.`,
      parts: [
        onePart(
          '27 × (40 + 16) =',
          [N(27), O('×'), N(40), O('+'), N(27), O('×'), N(16)],
          `Le facteur 27 multiplie chaque terme de la somme, et les termes 40 et 16 restent inchangés : 27 × (40 + 16) = ${ok('27')} × ${ok('40')} + ${ok('27')} × ${ok('16')}`
        ),
        onePart(
          '84 × (60 − 11) =',
          [N(84), O('×'), N(60), O('−'), N(84), O('×'), N(11)],
          `Le facteur 84 multiplie chaque terme de la différence, et les termes 60 et 11 restent inchangés : 84 × (60 − 11) = ${ok('84')} × ${ok('60')} − ${ok('84')} × ${ok('11')}`
        ),
      ],
    },
    {
      type: 'default', exKind: 'auto-eq', qnum: 2, category: 'Calcul astucieux',
      questionHtml: `Développe pour calculer plus facilement. Complète chaque étape.`,
      parts: [
        {
          rows: [
            { given: '76 × 103 =', slots: [N(76), O('×'), O('('), N(100), O('+'), N(3), O(')')] },
            { given: '=', slots: [N(76), O('×'), N(100), O('+'), N(76), O('×'), N(3)] },
            { given: '=', slots: [N(7600), O('+'), N(228)] },
            { given: '=', slots: [N(7828)] },
          ],
          stepsHtml: `76 × 103 = 76 × (100 + 3) = 76 × 100 + 76 × 3 = 7 600 + 228 = ${ok('7 828')}`,
        },
        {
          rows: [
            { given: '41 × 97 =', slots: [N(41), O('×'), O('('), N(100), O('−'), N(3), O(')')] },
            { given: '=', slots: [N(41), O('×'), N(100), O('−'), N(41), O('×'), N(3)] },
            { given: '=', slots: [N(4100), O('−'), N(123)] },
            { given: '=', slots: [N(3977)] },
          ],
          stepsHtml: `41 × 97 = 41 × (100 − 3) = 41 × 100 − 41 × 3 = 4 100 − 123 = ${ok('3 977')}`,
        },
        {
          rows: [
            { given: '1 005 × 25 =', slots: [N(25), O('×'), O('('), N(1000), O('+'), N(5), O(')')] },
            { given: '=', slots: [N(25), O('×'), N(1000), O('+'), N(25), O('×'), N(5)] },
            { given: '=', slots: [N(25000), O('+'), N(125)] },
            { given: '=', slots: [N(25125)] },
          ],
          stepsHtml: `1 005 × 25 = 25 × (1 000 + 5) = 25 × 1 000 + 25 × 5 = 25 000 + 125 = ${ok('25 125')}`,
        },
      ],
    },
  ],
];

// ── Factoriser — 3 séries ─────────────────────────────────────────────────────

const FACTORISER_BANK: Ex[][] = [
  // ── Série 0 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-eq', qnum: 1, category: 'Distributivité',
      questionHtml: `Complète chaque case pour factoriser l'expression.`,
      parts: [
        onePart(
          '47 × 63 + 47 × 28 =',
          [N(47), O('×'), O('('), N(63), O('+'), N(28), O(')')],
          `Le facteur commun 47 sort de la somme, et les termes 63 et 28 restent inchangés : 47 × 63 + 47 × 28 = ${ok('47')} × (${ok('63')} + ${ok('28')})`
        ),
        onePart(
          '39 × 44 − 39 × 17 =',
          [N(39), O('×'), O('('), N(44), O('−'), N(17), O(')')],
          `Le facteur commun 39 sort de la différence, et les termes 44 et 17 restent inchangés : 39 × 44 − 39 × 17 = ${ok('39')} × (${ok('44')} − ${ok('17')})`
        ),
      ],
    },
    {
      type: 'default', exKind: 'auto-eq', qnum: 2, category: 'Calcul astucieux',
      questionHtml: `Factorise pour calculer plus facilement. Complète chaque étape.`,
      parts: [
        {
          rows: [
            { given: '134 × 56 − 34 × 56 =', slots: [O('('), N(134), O('−'), N(34), O(')'), O('×'), N(56)] },
            { given: '=', slots: [N(100), O('×'), N(56)] },
            { given: '=', slots: [N(5600)] },
          ],
          stepsHtml: `134 × 56 − 34 × 56 = (134 − 34) × 56 = 100 × 56 = ${ok('5 600')}`,
        },
        {
          rows: [
            { given: '820 × 15 + 15 × 180 =', slots: [N(15), O('×'), O('('), N(820), O('+'), N(180), O(')')] },
            { given: '=', slots: [N(15), O('×'), N(1000)] },
            { given: '=', slots: [N(15000)] },
          ],
          stepsHtml: `820 × 15 + 15 × 180 = 15 × (820 + 180) = 15 × 1 000 = ${ok('15 000')}`,
        },
        {
          rows: [
            { given: '76 × 88 + 4 × 88 =', slots: [N(88), O('×'), O('('), N(76), O('+'), N(4), O(')')] },
            { given: '=', slots: [N(88), O('×'), N(80)] },
            { given: '=', slots: [N(7040)] },
          ],
          stepsHtml: `76 × 88 + 4 × 88 = 88 × (76 + 4) = 88 × 80 = ${ok('7 040')}`,
        },
      ],
    },
  ],
  // ── Série 1 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-eq', qnum: 1, category: 'Distributivité',
      questionHtml: `Complète chaque case pour factoriser l'expression.`,
      parts: [
        onePart(
          '64 × 45 + 64 × 22 =',
          [N(64), O('×'), O('('), N(45), O('+'), N(22), O(')')],
          `Le facteur commun 64 sort de la somme, et les termes 45 et 22 restent inchangés : 64 × 45 + 64 × 22 = ${ok('64')} × (${ok('45')} + ${ok('22')})`
        ),
        onePart(
          '37 × 80 − 37 × 6 =',
          [N(37), O('×'), O('('), N(80), O('−'), N(6), O(')')],
          `Le facteur commun 37 sort de la différence, et les termes 80 et 6 restent inchangés : 37 × 80 − 37 × 6 = ${ok('37')} × (${ok('80')} − ${ok('6')})`
        ),
      ],
    },
    {
      type: 'default', exKind: 'auto-eq', qnum: 2, category: 'Calcul astucieux',
      questionHtml: `Factorise pour calculer plus facilement. Complète chaque étape.`,
      parts: [
        {
          rows: [
            { given: '205 × 36 − 5 × 36 =', slots: [O('('), N(205), O('−'), N(5), O(')'), O('×'), N(36)] },
            { given: '=', slots: [N(200), O('×'), N(36)] },
            { given: '=', slots: [N(7200)] },
          ],
          stepsHtml: `205 × 36 − 5 × 36 = (205 − 5) × 36 = 200 × 36 = ${ok('7 200')}`,
        },
        {
          rows: [
            { given: '430 × 18 + 18 × 570 =', slots: [N(18), O('×'), O('('), N(430), O('+'), N(570), O(')')] },
            { given: '=', slots: [N(18), O('×'), N(1000)] },
            { given: '=', slots: [N(18000)] },
          ],
          stepsHtml: `430 × 18 + 18 × 570 = 18 × (430 + 570) = 18 × 1 000 = ${ok('18 000')}`,
        },
        {
          rows: [
            { given: '88 × 46 + 12 × 46 =', slots: [N(46), O('×'), O('('), N(88), O('+'), N(12), O(')')] },
            { given: '=', slots: [N(46), O('×'), N(100)] },
            { given: '=', slots: [N(4600)] },
          ],
          stepsHtml: `88 × 46 + 12 × 46 = 46 × (88 + 12) = 46 × 100 = ${ok('4 600')}`,
        },
      ],
    },
  ],
  // ── Série 2 ──────────────────────────────────────────────────────────────
  [
    {
      type: 'default', exKind: 'auto-eq', qnum: 1, category: 'Distributivité',
      questionHtml: `Complète chaque case pour factoriser l'expression.`,
      parts: [
        onePart(
          '29 × 91 + 29 × 14 =',
          [N(29), O('×'), O('('), N(91), O('+'), N(14), O(')')],
          `Le facteur commun 29 sort de la somme, et les termes 91 et 14 restent inchangés : 29 × 91 + 29 × 14 = ${ok('29')} × (${ok('91')} + ${ok('14')})`
        ),
        onePart(
          '76 × 60 − 76 × 9 =',
          [N(76), O('×'), O('('), N(60), O('−'), N(9), O(')')],
          `Le facteur commun 76 sort de la différence, et les termes 60 et 9 restent inchangés : 76 × 60 − 76 × 9 = ${ok('76')} × (${ok('60')} − ${ok('9')})`
        ),
      ],
    },
    {
      type: 'default', exKind: 'auto-eq', qnum: 2, category: 'Calcul astucieux',
      questionHtml: `Factorise pour calculer plus facilement. Complète chaque étape.`,
      parts: [
        {
          rows: [
            { given: '260 × 47 + 47 × 740 =', slots: [N(47), O('×'), O('('), N(260), O('+'), N(740), O(')')] },
            { given: '=', slots: [N(47), O('×'), N(1000)] },
            { given: '=', slots: [N(47000)] },
          ],
          stepsHtml: `260 × 47 + 47 × 740 = 47 × (260 + 740) = 47 × 1 000 = ${ok('47 000')}`,
        },
        {
          rows: [
            { given: '96 × 53 + 4 × 53 =', slots: [N(53), O('×'), O('('), N(96), O('+'), N(4), O(')')] },
            { given: '=', slots: [N(53), O('×'), N(100)] },
            { given: '=', slots: [N(5300)] },
          ],
          stepsHtml: `96 × 53 + 4 × 53 = 53 × (96 + 4) = 53 × 100 = ${ok('5 300')}`,
        },
        {
          rows: [
            { given: '512 × 15 − 12 × 15 =', slots: [O('('), N(512), O('−'), N(12), O(')'), O('×'), N(15)] },
            { given: '=', slots: [N(500), O('×'), N(15)] },
            { given: '=', slots: [N(7500)] },
          ],
          stepsHtml: `512 × 15 − 12 × 15 = (512 − 12) × 15 = 500 × 15 = ${ok('7 500')}`,
        },
      ],
    },
  ],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getExercises(sm: SubMode, idx: number): Ex[] {
  if (sm === 'sans-parentheses') return SANS_PARENTHESES_BANK[idx] ?? SANS_PARENTHESES_BANK[0]!;
  if (sm === 'avec-parentheses') return AVEC_PARENTHESES_BANK[idx] ?? AVEC_PARENTHESES_BANK[0]!;
  if (sm === 'developper') return DEVELOPPER_BANK[idx] ?? DEVELOPPER_BANK[0]!;
  if (sm === 'factoriser') return FACTORISER_BANK[idx] ?? FACTORISER_BANK[0]!;
  return [];
}

function getSeriesCount(sm: SubMode): number {
  if (sm === 'sans-parentheses') return SANS_PARENTHESES_BANK.length;
  if (sm === 'avec-parentheses') return AVEC_PARENTHESES_BANK.length;
  if (sm === 'developper') return DEVELOPPER_BANK.length;
  if (sm === 'factoriser') return FACTORISER_BANK.length;
  return 1;
}

function getSubModeLabel(sm: SubMode): string {
  if (sm === 'sans-parentheses') return 'Sans parenthèses';
  if (sm === 'avec-parentheses') return 'Avec parenthèses';
  if (sm === 'developper') return 'Développer';
  if (sm === 'factoriser') return 'Factoriser';
  return '';
}

// ── CalculsHub5eme ─────────────────────────────────────────────────────────────

export function CalculsHub5eme({
  accent,
  accentSecondary,
}: {
  accent: string;
  accentSecondary?: string;
}) {
  const [mainMode, setMainMode] = useState<MainMode>(null);
  const [subMode, setSubMode] = useState<SubMode>(null);
  const [seriesIdx, setSeriesIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const currentExercises = getExercises(subMode, seriesIdx);

  const enterSubMode = (sm: SubMode) => {
    setSubMode(sm);
    setSeriesIdx(0);
    setAnswers(buildAnswers(getExercises(sm, 0).length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = useMemo(() => {
    let correct = 0, wrong = 0, answered = 0;
    for (const a of answers) {
      if (a.status === 'correct') { correct++; answered++; }
      else if (a.status === 'wrong' || a.status === 'revealed') { wrong++; answered++; }
    }
    return { correct, wrong, answered, total: answers.length };
  }, [answers]);

  const finished = stats.answered === stats.total && stats.total > 0;

  useEffect(() => {
    if (finished && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [finished]);

  const submit = (i: number, correct: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) => prev.map((a, idx) => idx === i ? { ...a, status: correct ? 'correct' : 'wrong' } : a));
  };

  const revealAll = () => {
    setAnswers((prev) => prev.map((a) => a.status === 'pending' ? { ...a, status: 'revealed' } : a));
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const recommencer = () => {
    setAnswers(buildAnswers(getExercises(subMode, seriesIdx).length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newSeries = () => {
    const next = (seriesIdx + 1) % getSeriesCount(subMode);
    setSeriesIdx(next);
    setAnswers(buildAnswers(getExercises(subMode, next).length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Niveau 0 — sélecteur principal
  if (!mainMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        <ModeCard
          label="Priorités opératoires : règles"
          icon="🔍"
          desc="5 expressions · clique sur l'opération à effectuer en premier"
          accent={accent}
          onClick={() => setMainMode('reperage')}
        />
        <ModeCard
          label="Priorités opératoires : calcul"
          icon="⊕"
          desc="2 sous-thèmes · ordre des opérations, sans et avec parenthèses"
          accent={accent}
          onClick={() => setMainMode('priorites')}
        />
        <ModeCard
          label="Division euclidienne"
          icon="÷"
          desc="2 exercices · division posée étape par étape, avec révélation progressive"
          accent={accent}
          onClick={() => setMainMode('division')}
        />
        <ModeCard
          label="Développer et factoriser"
          icon="⇄"
          desc="2 sous-thèmes · distributivité : développer et factoriser une expression"
          accent={accent}
          onClick={() => setMainMode('dev-fact')}
        />
        <ModeCard
          label="Top Chrono"
          icon="⏱"
          desc="Réponds le plus vite possible · expressions sans et avec parenthèses"
          accent={accentSecondary ?? accent}
          href="/5eme/calculs-chrono"
        />
      </div>
    );
  }

  // Repérage
  if (mainMode === 'reperage') {
    return <ReperageHub5eme accent={accent} onBack={() => setMainMode(null)} />;
  }

  // Division euclidienne
  if (mainMode === 'division') {
    return <DivEuclidienne5eme accent={accent} onBack={() => setMainMode(null)} />;
  }

  // Niveau 1 — sélecteur de sous-mode
  if (!subMode) {
    const isDevFact = mainMode === 'dev-fact';
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setMainMode(null)}
            style={{ fontSize: 13 }}
          >
            ← Retour
          </button>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>
            {isDevFact ? 'Développer et factoriser' : 'Priorités opératoires : calcul'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
          {isDevFact ? (
            <>
              <ModeCard
                label="Développer"
                icon="×→+"
                desc="2 exercices · compléter les pointillés puis calculer astucieusement"
                accent={accent}
                onClick={() => enterSubMode('developper')}
              />
              <ModeCard
                label="Factoriser"
                icon="+→×"
                desc="2 exercices · compléter les pointillés puis calculer astucieusement"
                accent={accent}
                onClick={() => enterSubMode('factoriser')}
              />
            </>
          ) : (
            <>
              <ModeCard
                label="Sans parenthèses"
                icon="÷"
                desc="6 questions · identifier l'opération prioritaire et effectuer des calculs"
                accent={accent}
                onClick={() => enterSubMode('sans-parentheses')}
              />
              <ModeCard
                label="Avec parenthèses"
                icon="( )"
                desc="6 questions · calculs prioritaires entre parenthèses et crochets"
                accent={accent}
                onClick={() => enterSubMode('avec-parentheses')}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // Niveau 2 — vue quiz
  const progressPct = stats.total > 0 ? (stats.answered / stats.total) * 100 : 0;
  const progressStyle = {
    width: `${progressPct}%`,
    background: accentSecondary
      ? `linear-gradient(90deg, ${accent}, ${accentSecondary})`
      : accent,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => { setSubMode(null); setSeriesIdx(0); setAnswers([]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ fontSize: 13 }}
        >
          ← Retour
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{getSubModeLabel(subMode)}</span>
      </div>

      {subMode === 'sans-parentheses' && <RecallSansParentheses accent={accent} />}
      {subMode === 'avec-parentheses' && <RecallAvecParentheses accent={accent} />}

      <div className="scoreboard">
        <div className="score-item">
          <span className="score-num" style={{ color: accent }}>{stats.correct}</span>
          <div className="score-label">Justes</div>
        </div>
        <div className="score-item">
          <span className="score-num" style={{ color: accent }}>{stats.wrong}</span>
          <div className="score-label">Faux</div>
        </div>
        <div className="score-item">
          <span className="score-num" style={{ color: accent }}>{stats.total - stats.answered}</span>
          <div className="score-label">Restants</div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={progressStyle} />
      </div>

      <div className="controls">
        <button className="btn-primary" style={{ background: accent }} onClick={revealAll}>
          Tout corriger
        </button>
        <button className="btn-secondary" onClick={recommencer}>
          Recommencer
        </button>
        <button className="btn-secondary" onClick={newSeries}>
          Nouvelle série
        </button>
      </div>

      <div className="er-grid">
        {currentExercises.map((ex, i) => (
          ex.exKind === 'auto-eq' ? (
            <EquationBlanksCard
              key={`${seriesIdx}-${answers[i]!.resetKey}-${i}`}
              exercise={ex}
              answer={answers[i]!}
              accent={accent}
              onSubmit={(correct) => submit(i, correct)}
            />
          ) : (
            <AutomatismesQuestion
              key={`${seriesIdx}-${answers[i]!.resetKey}-${i}`}
              index={i}
              exercise={ex}
              answer={answers[i]!}
              accent={accent}
              onSubmit={(correct) => submit(i, correct)}
            />
          )
        ))}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>
            {endTitle(Math.round((stats.correct / stats.total) * 100))}
          </h2>
          <p>
            Score : {stats.correct} / {stats.total} (
            {Math.round((stats.correct / stats.total) * 100)}%)
          </p>
          <div className="btn-group">
            <button className="btn-primary" style={{ background: accent }} onClick={recommencer}>
              Recommencer
            </button>
            <button className="btn-secondary" onClick={newSeries}>
              Nouvelle série
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
