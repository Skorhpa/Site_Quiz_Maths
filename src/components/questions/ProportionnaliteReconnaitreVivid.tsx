import { useEffect, useMemo, useRef, useState } from 'react';
import {
  checkQuotient,
  fmtNum,
  generateProblemExercise,
  generateProporTable,
  type ProporProblemExercise,
  type ProporTableExercise,
} from './ProportionnaliteHub';

/**
 * 6ème · Proportionnalité · « Reconnaître » · « Avec tableau » — visual redesign of the same exercise set
 * as the 5ème quiz (1 guided table, 2 tables to fill in, 2 context problems). Same generators and the same
 * validation rules; only the presentation differs (classes prefixed `pv-` in global.css).
 */

interface AnswerState {
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

const emptyAnswer = (): AnswerState => ({ status: 'pending', resetKey: 0 });
const isBlank = (v: string) => v.trim() === '';

function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

// Canonical palette only (CLAUDE.md).
const C = {
  mint: '#6EE7C0',
  blue: '#60A5FA',
  violet: '#A78BFA',
  orange: '#FB923C',
  pink: '#F472B6',
  green: '#34D399',
  magenta: '#E879F9',
  sky: '#38BDF8',
  rose: '#FB7185',
} as const;

const COL_COLORS = [C.green, C.blue, C.orange] as const;
const COL_LETTERS = ['A', 'B', 'C'] as const;

type VividExercise =
  | { exKind: 'table-prefilled'; data: ProporTableExercise }
  | { exKind: 'table-blank'; data: ProporTableExercise }
  | { exKind: 'problem'; data: ProporProblemExercise };

function buildExercises(): VividExercise[] {
  const tableFirstTrue = Math.random() < 0.5;
  const problemFirstTrue = Math.random() < 0.5;
  return [
    { exKind: 'table-prefilled', data: generateProporTable(Math.random() < 0.5) },
    { exKind: 'table-blank', data: generateProporTable(tableFirstTrue) },
    { exKind: 'table-blank', data: generateProporTable(!tableFirstTrue) },
    { exKind: 'problem', data: generateProblemExercise(problemFirstTrue) },
    { exKind: 'problem', data: generateProblemExercise(!problemFirstTrue) },
  ];
}

// ── Themes (colour, illustration, difficulty) ─────────────────────────────────

interface CardTheme {
  color: string;
  icon: string;
  deco: string;
  tag: string;
  title: string;
  short: string;
  stars: number;
}

const PROBLEM_ILLUSTRATIONS: [RegExp, string][] = [
  [/bouquet/i, '💐'],
  [/collège/i, '🏫'],
  [/crêpes/i, '🥞'],
  [/carburant/i, '🚗'],
  [/papier/i, '📄'],
  [/salaire/i, '💶'],
  [/pommes/i, '🍎'],
  [/piscine/i, '🏊'],
];

function problemIcon(context: string): string {
  return PROBLEM_ILLUSTRATIONS.find(([re]) => re.test(context))?.[1] ?? '🔎';
}

function buildThemes(exercises: VividExercise[]): CardTheme[] {
  let tableN = 0;
  let problemN = 0;
  return exercises.map((ex) => {
    if (ex.exKind === 'table-prefilled') {
      return { color: C.sky, icon: '🔍', deco: '÷', tag: 'Échauffement', title: 'Tableau guidé : calcule les quotients', short: 'Tableau guidé', stars: 1 };
    }
    if (ex.exKind === 'table-blank') {
      const n = tableN++;
      return {
        color: n === 0 ? C.violet : C.pink, icon: '🧮', deco: n === 0 ? '∝' : '=',
        tag: 'Entraînement', title: 'Tableau à analyser : écris toi-même les divisions', short: 'Tableau à compléter', stars: 2,
      };
    }
    const n = problemN++;
    const icon = problemIcon(ex.data.context);
    return {
      color: n === 0 ? C.orange : C.magenta, icon, deco: n === 0 ? '×' : '%',
      tag: 'Défi', title: 'Problème : est-ce une situation de proportionnalité ?', short: `Problème ${icon}`, stars: 3,
    };
  });
}

/** Which quotients "agree" — all of them when proportional, otherwise those sharing the majority value. */
function quotientFlags(values: number[], isProportional: boolean): boolean[] {
  if (isProportional) return values.map(() => true);
  const same = (a: number, b: number) => Math.abs(a - b) < 0.005;
  const majority = values.find((v) => values.filter((w) => same(v, w)).length >= 2);
  return values.map((v) => majority !== undefined && same(v, majority));
}

// ── Small building blocks ─────────────────────────────────────────────────────

function Inp({ value, onChange, disabled, color, label }: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  color: string;
  label: string;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      className="pv-inp"
      value={value}
      placeholder="…"
      aria-label={label}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{ '--pv-c': color } as React.CSSProperties}
    />
  );
}

function NumChip({ children }: { children: React.ReactNode }) {
  return <span className="pv-num">{children}</span>;
}

function Op({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className="pv-op" style={{ background: `${color}22`, color }}>{children}</span>;
}

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return <div className="pv-section-label" style={{ color }}>{children}</div>;
}

function CardShell({ index, theme, status, children }: {
  index: number;
  theme: CardTheme;
  status: AnswerState['status'];
  children: React.ReactNode;
}) {
  const done = status !== 'pending';
  const ok = status === 'correct';
  const borderColor = done ? (ok ? 'var(--correct)' : 'var(--wrong)') : `${theme.color}55`;
  return (
    <section
      id={`pv-q-${index}`}
      className="pv-card"
      style={{
        border: `1.5px solid ${borderColor}`,
        background: `linear-gradient(160deg, ${theme.color}22 0%, var(--surface) 42%)`,
        animationDelay: `${index * 70}ms`,
      }}
    >
      <span aria-hidden className="pv-card-deco" style={{ color: `${theme.color}1c` }}>{theme.deco}</span>
      <header className="pv-card-head">
        <div className="pv-icon-tile" style={{ background: `${theme.color}2b`, boxShadow: `inset 0 0 0 1.5px ${theme.color}66` }}>
          {theme.icon}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="pv-eyebrow" style={{ color: theme.color }}>Mission {index + 1} · {theme.tag}</div>
          <h3 className="pv-card-title">{theme.title}</h3>
        </div>
        <div className="pv-stars" style={{ color: theme.color }} title={`Difficulté ${theme.stars}/3`}>
          {'★'.repeat(theme.stars)}<span style={{ opacity: 0.3 }}>{'★'.repeat(3 - theme.stars)}</span>
        </div>
        {done && (
          <span
            className="pv-badge"
            style={ok
              ? { background: 'rgba(74,222,128,0.16)', color: 'var(--correct)' }
              : { background: 'rgba(248,113,113,0.16)', color: 'var(--wrong)' }}
          >
            {ok ? '✓ Réussi' : '✗ À revoir'}
          </span>
        )}
      </header>
      <div style={{ position: 'relative' }}>{children}</div>
    </section>
  );
}

function PvTable({ colHeaders, rowLabels, rows, colColors, quotients }: {
  colHeaders: string[];
  rowLabels: [string, string];
  rows: [number[], number[]];
  colColors: readonly string[];
  /** Shown as a 3rd row once the answer is submitted. */
  quotients?: { values: number[]; flags: boolean[] };
}) {
  return (
    <div className="pv-table-wrap">
      <table className="pv-table">
        <thead>
          <tr>
            <th className="pv-row-label" />
            {colHeaders.map((h, i) => (
              <th key={i} style={{ background: `${colColors[i]}26`, color: colColors[i] }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              <th className="pv-row-label">
                <span className="pv-row-dot" style={{ background: r === 0 ? C.blue : C.pink }} />
                {rowLabels[r]}
              </th>
              {row.map((v, i) => (
                <td key={i} style={{ background: `${colColors[i]}10` }}>{fmtNum(v)}</td>
              ))}
            </tr>
          ))}
          {quotients && (
            <tr>
              <th className="pv-row-label">
                <span className="pv-row-dot" style={{ background: C.violet }} />
                Quotient
              </th>
              {quotients.values.map((q, i) => {
                const agree = quotients.flags[i]!;
                return (
                  <td key={i}>
                    <span
                      className="pv-q-chip"
                      style={agree
                        ? { background: 'rgba(74,222,128,0.16)', color: 'var(--correct)' }
                        : { background: `${C.rose}26`, color: C.rose }}
                    >
                      {fmtNum(q)}
                    </span>
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CalcRow({ letter, color, label, parts, status }: {
  letter: string;
  color: string;
  label?: string;
  parts: [React.ReactNode, React.ReactNode, React.ReactNode];
  status: boolean | null;
}) {
  const border = status === null ? `${color}45` : status ? 'var(--correct)' : 'var(--wrong)';
  return (
    <div className="pv-calc" style={{ border: `1.5px solid ${border}`, background: `${color}0f` }}>
      <span className="pv-letter" style={{ background: color }}>{letter}</span>
      {label && <span className="pv-calc-label">{label}</span>}
      {parts[0]}
      <Op color={color}>:</Op>
      {parts[1]}
      <Op color={color}>=</Op>
      {parts[2]}
      {status !== null && (
        <span style={{ marginLeft: 'auto', fontSize: 18, color: status ? 'var(--correct)' : 'var(--wrong)', fontWeight: 700 }}>
          {status ? '✓' : '✗'}
        </span>
      )}
    </div>
  );
}

function VerdictPicker({ question, choice, onChoose, disabled, expected }: {
  question: string;
  choice: boolean | null;
  onChoose: (v: boolean) => void;
  disabled: boolean;
  expected: boolean;
}) {
  const options = [
    { v: true, emoji: '⚖️', label: 'Oui', sub: 'les quotients sont tous égaux', color: C.green },
    { v: false, emoji: '🚫', label: 'Non', sub: 'les quotients sont différents', color: C.rose },
  ] as const;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <SectionLabel color="var(--text)">🤔 {question}</SectionLabel>
      <div className="pv-choices">
        {options.map((o) => {
          const sel = choice === o.v;
          let style: React.CSSProperties;
          if (disabled) {
            if (o.v === expected) style = { border: '2px solid var(--correct)', background: 'rgba(74,222,128,0.14)' };
            else if (sel) style = { border: '2px solid var(--wrong)', background: 'rgba(248,113,113,0.14)' };
            else style = { border: '2px solid var(--border)', background: 'var(--surface2)', opacity: 0.5 };
          } else {
            style = sel
              ? { border: `2px solid ${o.color}`, background: `${o.color}24`, boxShadow: `0 8px 22px -12px ${o.color}` }
              : { border: '2px solid var(--border2)', background: 'var(--surface2)' };
          }
          return (
            <button key={o.label} type="button" className="pv-choice" disabled={disabled} onClick={() => onChoose(o.v)} style={style}>
              <span className="pv-choice-emoji">{o.emoji}</span>
              <span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 16, color: !disabled && sel ? o.color : 'var(--text)' }}>
                  {o.label}
                  {disabled && o.v === expected && <span style={{ color: 'var(--correct)', fontSize: 12, marginLeft: 8 }}>✓ bonne réponse</span>}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>{o.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardFooter({ disabled, status, color, onValidate, showMissing }: {
  disabled: boolean;
  status: AnswerState['status'];
  color: string;
  onValidate: () => void;
  showMissing: boolean;
}) {
  if (!disabled) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="pv-validate"
          onClick={onValidate}
          style={{ background: `linear-gradient(135deg, ${color}, ${C.violet})`, boxShadow: `0 10px 24px -14px ${color}` }}
        >
          Valider ✓
        </button>
        {showMissing && (
          <span style={{ fontSize: 13, color: C.orange }}>✋ Complète toutes les cases et réponds Oui ou Non.</span>
        )}
      </div>
    );
  }
  const ok = status === 'correct';
  return (
    <div
      className="pv-feedback"
      style={ok
        ? { background: 'rgba(74,222,128,0.12)', color: 'var(--correct)', border: '1px solid rgba(74,222,128,0.35)' }
        : { background: 'rgba(248,113,113,0.10)', color: 'var(--wrong)', border: '1px solid rgba(248,113,113,0.35)' }}
    >
      {ok ? '🎉 Bravo ! Tout est juste.' : '💡 Pas tout à fait… Ouvre la correction pour comprendre.'}
    </div>
  );
}

interface CorrectionLine {
  letter: string;
  color: string;
  label?: string;
  bottom: number;
  top: number;
  q: number;
}

function Correction({ color, intro, lines, flags, isProportional, noun }: {
  color: string;
  intro: string;
  lines: CorrectionLine[];
  flags: boolean[];
  isProportional: boolean;
  noun: 'tableau' | 'situation';
}) {
  const [open, setOpen] = useState(false);
  const what = noun === 'tableau' ? 'un tableau' : 'une situation';
  return (
    <div style={{ marginTop: 14 }}>
      <button
        type="button"
        className="pv-corr-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color, borderColor: `${color}66`, background: `${color}14` }}
      >
        💡 {open ? 'Masquer la correction' : 'Voir la correction'}
      </button>
      {open && (
        <div className="pv-corr">
          <div className="pv-corr-step">
            <span className="pv-step-dot" style={{ background: color }}>1</span>
            <div style={{ flex: 1 }}>
              {intro}
              <div className="pv-corr-chips">
                {lines.map((l, i) => (
                  <span key={i} className="pv-corr-chip" style={{ borderColor: `${l.color}66`, background: `${l.color}14` }}>
                    <span className="pv-letter pv-letter-sm" style={{ background: l.color }}>{l.letter}</span>
                    {l.label && <span style={{ color: 'var(--muted)' }}>{l.label} :</span>}
                    <span>{fmtNum(l.bottom)} : {fmtNum(l.top)} =</span>
                    <strong style={{ color: flags[i] ? 'var(--correct)' : C.rose }}>{fmtNum(l.q)}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="pv-corr-step">
            <span className="pv-step-dot" style={{ background: color }}>2</span>
            <div style={{ flex: 1 }}>
              {isProportional ? (
                <>Les quotients sont tous égaux à <strong style={{ color: 'var(--correct)' }}>{fmtNum(lines[0]!.q)}</strong> : c'est le <strong>coefficient de proportionnalité</strong>.</>
              ) : (
                <>Les quotients ne sont <strong>pas tous égaux</strong> : il n'y a pas de coefficient de proportionnalité.</>
              )}
            </div>
          </div>
          <div
            className="pv-conclusion"
            style={isProportional
              ? { background: 'rgba(74,222,128,0.14)', color: 'var(--correct)' }
              : { background: 'rgba(248,113,113,0.12)', color: 'var(--wrong)' }}
          >
            {isProportional ? `✓ C'est ${what} de proportionnalité.` : `✗ Ce n'est pas ${what} de proportionnalité.`}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Questions ─────────────────────────────────────────────────────────────────

function useStringArray(n: number) {
  const [arr, setArr] = useState<string[]>(() => Array.from({ length: n }, () => ''));
  const setAt = (i: number, v: string) => setArr((prev) => prev.map((x, j) => (j === i ? v : x)));
  return [arr, setAt] as const;
}

function TableQuestion({ index, exercise, prefilled, theme, answer, onSubmit }: {
  index: number;
  exercise: ProporTableExercise;
  prefilled: boolean;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [bottoms, setBottom] = useStringArray(3);
  const [tops, setTop] = useStringArray(3);
  const [quots, setQuot] = useStringArray(3);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const cols = exercise.cols;

  const rowOk = (i: number) => {
    const c = cols[i]!;
    const qOk = checkQuotient(quots[i]!, c.quotient);
    return prefilled ? qOk : qOk && checkQuotient(bottoms[i]!, c.bottom) && checkQuotient(tops[i]!, c.top);
  };
  const missing = quots.some(isBlank) || (!prefilled && (bottoms.some(isBlank) || tops.some(isBlank))) || choice === null;

  const submit = () => {
    if (disabled) return;
    if (missing) { setTried(true); return; }
    onSubmit(cols.every((_, i) => rowOk(i)) && choice === exercise.isProportional);
  };

  const quotients = cols.map((c) => c.quotient);
  const flags = quotientFlags(quotients, exercise.isProportional);

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <p className="pv-instr">
        {prefilled
          ? 'Les divisions sont déjà posées : calcule chaque quotient, puis décide si ce tableau est un tableau de proportionnalité.'
          : 'Écris les trois divisions (2ᵉ ligne : 1ʳᵉ ligne), calcule-les, puis décide si ce tableau est un tableau de proportionnalité.'}
      </p>
      <div className="pv-tips">
        <span className="pv-tip" style={{ background: `${C.blue}1f`, color: C.blue }}>🧮 Calculatrice autorisée</span>
        <span className="pv-tip" style={{ background: `${C.orange}1f`, color: C.orange }}>➗ 2ᵉ ligne : 1ʳᵉ ligne</span>
      </div>

      <PvTable
        colHeaders={[...COL_LETTERS]}
        rowLabels={['1ʳᵉ ligne', '2ᵉ ligne']}
        rows={[cols.map((c) => c.top), cols.map((c) => c.bottom)]}
        colColors={COL_COLORS}
        quotients={disabled ? { values: quotients, flags } : undefined}
      />

      <SectionLabel color={theme.color}>✏️ Les divisions</SectionLabel>
      <div className="pv-calcs">
        {cols.map((c, i) => {
          const color = COL_COLORS[i]!;
          const letter = COL_LETTERS[i]!;
          const q = <Inp value={quots[i]!} onChange={(v) => setQuot(i, v)} disabled={disabled} color={color} label={`Quotient colonne ${letter}`} />;
          const parts: [React.ReactNode, React.ReactNode, React.ReactNode] = prefilled
            ? [<NumChip>{fmtNum(c.bottom)}</NumChip>, <NumChip>{fmtNum(c.top)}</NumChip>, q]
            : [
                <Inp value={bottoms[i]!} onChange={(v) => setBottom(i, v)} disabled={disabled} color={color} label={`Dividende colonne ${letter}`} />,
                <Inp value={tops[i]!} onChange={(v) => setTop(i, v)} disabled={disabled} color={color} label={`Diviseur colonne ${letter}`} />,
                q,
              ];
          return <CalcRow key={i} letter={letter} color={color} parts={parts} status={disabled ? rowOk(i) : null} />;
        })}
      </div>

      <VerdictPicker
        question="Ce tableau est-il un tableau de proportionnalité ?"
        choice={choice}
        onChoose={setChoice}
        disabled={disabled}
        expected={exercise.isProportional}
      />
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && missing} />
      <Correction
        color={theme.color}
        intro="On divise chaque nombre de la 2ᵉ ligne par le nombre de la 1ʳᵉ ligne situé au-dessus :"
        lines={cols.map((c, i) => ({ letter: COL_LETTERS[i]!, color: COL_COLORS[i]!, bottom: c.bottom, top: c.top, q: c.quotient }))}
        flags={flags}
        isProportional={exercise.isProportional}
        noun="tableau"
      />
    </CardShell>
  );
}

function ProblemQuestion({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: ProporProblemExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [bottoms, setBottom] = useStringArray(2);
  const [tops, setTop] = useStringArray(2);
  const [quots, setQuot] = useStringArray(2);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';

  const names = [exercise.item1Name, exercise.item2Name];
  const qtys = [exercise.qty1, exercise.qty2];
  const values = [exercise.value1, exercise.value2];
  const quotients = [exercise.quotient1, exercise.quotient2];
  const colors = [COL_COLORS[0], COL_COLORS[1]];
  const letters = ['1', '2'];

  const rowOk = (i: number) =>
    checkQuotient(bottoms[i]!, values[i]!) && checkQuotient(tops[i]!, qtys[i]!) && checkQuotient(quots[i]!, quotients[i]!);
  const missing = bottoms.some(isBlank) || tops.some(isBlank) || quots.some(isBlank) || choice === null;

  const submit = () => {
    if (disabled) return;
    if (missing) { setTried(true); return; }
    onSubmit(rowOk(0) && rowOk(1) && choice === exercise.isProportional);
  };

  const flags = quotientFlags(quotients, exercise.isProportional);

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <div className="pv-scene" style={{ background: `${theme.color}12`, border: `1px dashed ${theme.color}66` }}>
        <div className="pv-scene-illus" style={{ background: `radial-gradient(circle at 35% 30%, ${theme.color}55, ${theme.color}18 70%)` }}>
          {theme.icon}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>{exercise.context}</p>
          <span className="pv-tip" style={{ background: `${C.blue}1f`, color: C.blue }}>🧮 Calculatrice autorisée</span>
        </div>
      </div>

      <PvTable
        colHeaders={names}
        rowLabels={[exercise.qtyLabel, exercise.valueLabel]}
        rows={[qtys, values]}
        colColors={colors}
        quotients={disabled ? { values: quotients, flags } : undefined}
      />

      <SectionLabel color={theme.color}>
        ✏️ Complète chaque division ({exercise.valueLabel.toLowerCase()} : {exercise.qtyLabel.toLowerCase()})
      </SectionLabel>
      <div className="pv-calcs">
        {names.map((name, i) => {
          const color = colors[i]!;
          return (
            <CalcRow
              key={i}
              letter={letters[i]!}
              color={color}
              label={name}
              status={disabled ? rowOk(i) : null}
              parts={[
                <Inp value={bottoms[i]!} onChange={(v) => setBottom(i, v)} disabled={disabled} color={color} label={`Dividende ${name}`} />,
                <Inp value={tops[i]!} onChange={(v) => setTop(i, v)} disabled={disabled} color={color} label={`Diviseur ${name}`} />,
                <Inp value={quots[i]!} onChange={(v) => setQuot(i, v)} disabled={disabled} color={color} label={`Quotient ${name}`} />,
              ]}
            />
          );
        })}
      </div>

      <VerdictPicker
        question="Est-ce une situation de proportionnalité ?"
        choice={choice}
        onChoose={setChoice}
        disabled={disabled}
        expected={exercise.isProportional}
      />
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && missing} />
      <Correction
        color={theme.color}
        intro={`On divise ${exercise.valueLabel.toLowerCase()} par ${exercise.qtyLabel.toLowerCase()} pour chaque colonne :`}
        lines={names.map((name, i) => ({ letter: letters[i]!, color: colors[i]!, label: name, bottom: values[i]!, top: qtys[i]!, q: quotients[i]! }))}
        flags={flags}
        isProportional={exercise.isProportional}
        noun="situation"
      />
    </CardShell>
  );
}

// ── Hero (rappel illustré) ────────────────────────────────────────────────────

const HERO_DECOS = [
  { s: '×', top: '6%', left: '44%', size: 44, color: C.orange, delay: 0 },
  { s: '÷', top: '70%', left: '3%', size: 56, color: C.blue, delay: 1.2 },
  { s: '=', top: '10%', left: '90%', size: 50, color: C.green, delay: 2.1 },
  { s: '∝', top: '78%', left: '50%', size: 62, color: C.violet, delay: 0.6 },
  { s: '%', top: '44%', left: '95%', size: 38, color: C.pink, delay: 1.8 },
  { s: '≠', top: '3%', left: '16%', size: 36, color: C.rose, delay: 2.6 },
  { s: '½', top: '86%', left: '82%', size: 40, color: C.sky, delay: 3.1 },
] as const;

function HeroExample() {
  const x0 = 20, colW = 90, rowH = 46, y0 = 16;
  const tops = [2, 5, 8];
  const bottoms = [6, 15, 24];
  return (
    <svg viewBox="0 0 420 212" width="100%" role="img" aria-label="Exemple : tableau 2, 5, 8 / 6, 15, 24 ; on multiplie par 3">
      <defs>
        <marker id="pv-arrowhead" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.orange} />
        </marker>
      </defs>
      {[tops, bottoms].map((row, r) =>
        row.map((v, i) => (
          <g key={`${r}-${i}`}>
            <rect
              x={x0 + i * colW} y={y0 + r * rowH} width={colW} height={rowH}
              fill={COL_COLORS[i]} fillOpacity={r === 0 ? 0.14 : 0.24}
              style={{ stroke: 'var(--border2)' }} strokeWidth={1.5}
            />
            <text
              x={x0 + i * colW + colW / 2} y={y0 + r * rowH + rowH / 2 + 7} textAnchor="middle"
              style={{ fill: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500 }}
            >
              {v}
            </text>
          </g>
        )),
      )}
      <path d="M 298 34 C 350 38, 350 90, 302 96" fill="none" stroke={C.orange} strokeWidth={2.5} markerEnd="url(#pv-arrowhead)" />
      <text x={356} y={72} style={{ fill: C.orange, fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700 }}>× 3</text>
      {tops.map((t, i) => (
        <text
          key={i} x={x0 + i * colW + colW / 2} y={138} textAnchor="middle"
          style={{ fill: COL_COLORS[i], fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500 }}
        >
          {bottoms[i]} : {t} = 3
        </text>
      ))}
      <rect x={30} y={160} width={250} height={32} rx={16} fill={C.green} fillOpacity={0.16} />
      <text x={155} y={181} textAnchor="middle" style={{ fill: C.green, fontSize: 13, fontWeight: 700 }}>
        ✓ Tous égaux → proportionnalité
      </text>
    </svg>
  );
}

function Hero({ onBack }: { onBack: () => void }) {
  const steps = [
    { emoji: '👀', text: <>Repère les <strong>deux lignes</strong> du tableau.</>, color: C.blue },
    { emoji: '➗', text: <>Divise chaque nombre de la <strong>2ᵉ ligne</strong> par celui de la <strong>1ʳᵉ ligne</strong>.</>, color: C.orange },
    { emoji: '⚖️', text: <>Si tous les quotients sont <strong>égaux</strong>, c'est un tableau de proportionnalité !</>, color: C.green },
  ];
  return (
    <div className="pv-hero">
      <div className="pv-deco-layer" aria-hidden>
        {HERO_DECOS.map((d, i) => (
          <span
            key={i}
            className="pv-deco pv-float"
            style={{ top: d.top, left: d.left, fontSize: d.size, color: d.color, animationDelay: `${d.delay}s` }}
          >
            {d.s}
          </span>
        ))}
      </div>
      <div className="pv-hero-content">
        <div className="pv-hero-top">
          <button type="button" className="pv-back" onClick={onBack}>← Retour</button>
          <span className="pv-crumb" style={{ background: `${C.green}22`, color: C.green }}>Reconnaître</span>
          <span className="pv-crumb" style={{ background: `${C.blue}22`, color: C.blue }}>▦ Avec tableau</span>
        </div>
        <div className="pv-hero-grid">
          <div>
            <div className="pv-eyebrow" style={{ color: C.violet }}>📖 Rappel du cours</div>
            <h2 className="pv-hero-title">Comment reconnaître un tableau de proportionnalité ?</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>
              Un tableau est un tableau de <strong>proportionnalité</strong> lorsqu'on passe de la 1ʳᵉ ligne à la 2ᵉ ligne
              en multipliant toujours par <strong>le même nombre</strong>. Ce nombre s'appelle le{' '}
              <strong style={{ color: C.orange }}>coefficient de proportionnalité</strong>.
            </p>
            <div className="pv-steps">
              {steps.map((s, i) => (
                <div key={i} className="pv-step" style={{ borderColor: `${s.color}55`, background: `${s.color}14` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="pv-step-dot" style={{ background: s.color }}>{i + 1}</span>
                    <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  </div>
                  {s.text}
                </div>
              ))}
            </div>
            <a className="pv-video" href="https://www.youtube.com/watch?v=O7oU-J1OqCw" target="_blank" rel="noopener noreferrer">
              <span className="pv-video-play">▶</span> Vidéo : reconnaître un tableau de proportionnalité
            </a>
          </div>
          <div className="pv-illus">
            <div className="pv-eyebrow" style={{ color: C.orange, marginBottom: 6 }}>✨ Exemple</div>
            <HeroExample />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function ScoreRing({ correct, wrong, total }: { correct: number; wrong: number; total: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const cLen = total > 0 ? (correct / total) * circ : 0;
  const wLen = total > 0 ? (wrong / total) * circ : 0;
  return (
    <svg viewBox="0 0 140 140" width={140} height={140} role="img" aria-label={`${correct} réussies sur ${total}`}>
      <circle cx={70} cy={70} r={r} fill="none" style={{ stroke: 'var(--surface2)' }} strokeWidth={14} />
      <g transform="rotate(-90 70 70)">
        <circle
          cx={70} cy={70} r={r} fill="none" stroke="#4ADE80" strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${cLen} ${circ}`} style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <circle
          cx={70} cy={70} r={r} fill="none" stroke="#F87171" strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${wLen} ${circ}`} strokeDashoffset={-cLen}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
        />
      </g>
      <text x={70} y={74} textAnchor="middle" style={{ fill: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 500 }}>
        {correct}/{total}
      </text>
      <text x={70} y={94} textAnchor="middle" style={{ fill: 'var(--muted)', fontSize: 11, letterSpacing: '0.08em' }}>
        RÉUSSIES
      </text>
    </svg>
  );
}

function Sidebar({ stats, themes, statuses, onReset, onNew }: {
  stats: { correct: number; wrong: number; answered: number; total: number };
  themes: CardTheme[];
  statuses: AnswerState['status'][];
  onReset: () => void;
  onNew: () => void;
}) {
  const jump = (i: number) => document.getElementById(`pv-q-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const tiles = [
    { label: 'Justes', value: stats.correct, color: '#4ADE80' },
    { label: 'Faux', value: stats.wrong, color: '#F87171' },
    { label: 'Restants', value: stats.total - stats.answered, color: C.blue },
  ];
  return (
    <>
      <div className="pv-panel" style={{ textAlign: 'center' }}>
        <div className="pv-eyebrow" style={{ color: C.violet, marginBottom: 6 }}>🏁 Ta progression</div>
        <ScoreRing correct={stats.correct} wrong={stats.wrong} total={stats.total} />
        <div className="pv-tiles">
          {tiles.map((t) => (
            <div key={t.label} className="pv-tile" style={{ background: `${t.color}1a`, borderColor: `${t.color}44` }}>
              <span className="pv-tile-num" style={{ color: t.color }}>{t.value}</span>
              <span className="pv-tile-label">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pv-panel">
        <div className="pv-eyebrow" style={{ color: C.orange, marginBottom: 10 }}>🗺️ Les missions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {themes.map((t, i) => {
            const st = statuses[i] ?? 'pending';
            const mark = st === 'correct' ? '✓' : st === 'pending' ? String(i + 1) : '✗';
            const markBg = st === 'correct' ? '#4ADE80' : st === 'pending' ? t.color : '#F87171';
            return (
              <button key={i} type="button" className="pv-map-item" onClick={() => jump(i)} style={{ borderColor: `${t.color}44` }}>
                <span className="pv-letter" style={{ background: markBg }}>{mark}</span>
                <span style={{ flex: 1 }}>{t.short}</span>
                <span style={{ color: t.color, fontSize: 11, letterSpacing: 1 }}>{'★'.repeat(t.stars)}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <button type="button" className="pv-validate" onClick={onNew} style={{ background: `linear-gradient(135deg, ${C.green}, ${C.blue})` }}>
            🎲 Nouvelle série
          </button>
          <button type="button" className="btn-secondary" onClick={onReset} disabled={stats.wrong === 0} style={{ borderRadius: 14 }}>
            ↺ Recommencer les erreurs
          </button>
        </div>
      </div>

      <div className="pv-panel pv-tipcard" style={{ background: `linear-gradient(150deg, ${C.orange}26, ${C.pink}14)`, borderColor: `${C.orange}55` }}>
        <div style={{ fontSize: 26, marginBottom: 4 }}>🧠</div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Le savais-tu ?</div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)' }}>
          Il suffit d'<strong>un seul</strong> quotient différent des autres pour que le tableau ne soit
          <strong> pas</strong> un tableau de proportionnalité.
        </div>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ProportionnaliteReconnaitreVivid({ accent, onBack }: {
  accent: string;
  accentSecondary?: string;
  onBack: () => void;
}) {
  const [exercises, setExercises] = useState<VividExercise[]>(() => buildExercises());
  const [answers, setAnswers] = useState<AnswerState[]>(() => exercises.map(() => emptyAnswer()));
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const themes = useMemo(() => buildThemes(exercises), [exercises]);

  const newSeries = () => {
    const exs = buildExercises();
    setExercises(exs);
    setAnswers(exs.map(() => emptyAnswer()));
    setSeriesKey((k) => k + 1);
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

  const stats = useMemo(() => {
    let correct = 0, wrong = 0, answered = 0;
    for (const a of answers) {
      if (a.status === 'correct') { correct++; answered++; }
      else if (a.status === 'wrong' || a.status === 'revealed') { wrong++; answered++; }
    }
    return { correct, wrong, answered, total: exercises.length };
  }, [answers, exercises.length]);

  const finished = stats.answered === stats.total && stats.total > 0;
  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const starCount = pct === 100 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  useEffect(() => {
    if (finished && endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [finished]);

  return (
    <div className="pv-shell">
      <Hero onBack={onBack} />

      <div className="pv-layout">
        <aside className="pv-sidebar">
          <Sidebar
            stats={stats}
            themes={themes}
            statuses={answers.map((a) => a.status)}
            onReset={resetErrors}
            onNew={newSeries}
          />
        </aside>

        <div className="pv-main">
          {exercises.map((ex, i) => {
            const key = `${seriesKey}-${answers[i]!.resetKey}-${i}`;
            const common = { index: i, theme: themes[i]!, answer: answers[i]!, onSubmit: (ok: boolean) => submit(i, ok) };
            if (ex.exKind === 'problem') return <ProblemQuestion key={key} {...common} exercise={ex.data} />;
            return <TableQuestion key={key} {...common} exercise={ex.data} prefilled={ex.exKind === 'table-prefilled'} />;
          })}

          {finished && (
            <div
              ref={endRef}
              className="pv-end"
              style={{
                border: `1.5px solid ${accent}`,
                background: `radial-gradient(circle at 15% 20%, ${C.blue}2e, transparent 45%), radial-gradient(circle at 85% 80%, ${C.pink}2e, transparent 45%), var(--surface)`,
              }}
            >
              <div className="pv-end-emoji">{pct === 100 ? '🏆' : pct >= 70 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
              <h2 className="pv-hero-title" style={{ color: accent, marginBottom: 4 }}>{endTitle(pct)}</h2>
              <div className="pv-end-stars">
                {[0, 1, 2].map((s) => (
                  <span key={s} style={{ color: s < starCount ? C.orange : 'var(--surface2)' }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 15, color: 'var(--muted)', margin: '6px 0 18px' }}>
                Score : {stats.correct} / {stats.total} ({pct}%)
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn-secondary" onClick={resetErrors} disabled={stats.wrong === 0} style={{ borderRadius: 14 }}>
                  ↺ Recommencer les erreurs
                </button>
                <button type="button" className="pv-validate" onClick={newSeries} style={{ background: `linear-gradient(135deg, ${C.green}, ${C.blue})` }}>
                  🎲 Nouvelle série
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
