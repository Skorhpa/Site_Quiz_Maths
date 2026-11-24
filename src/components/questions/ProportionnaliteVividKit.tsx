import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { fmtNum } from './ProportionnaliteHub';

/**
 * Shared building blocks for the redesigned 6ème « Proportionnalité » pages (classes prefixed `pv-` in global.css):
 * page shell (hero + sticky progress sidebar + mission cards + end banner), cards, tables, inputs, corrections.
 */

export interface AnswerState {
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

export const emptyAnswer = (): AnswerState => ({ status: 'pending', resetKey: 0 });
export const isBlank = (v: string) => v.trim() === '';

export function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

// Canonical palette only (CLAUDE.md).
export const C = {
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

export const COL_COLORS = [C.green, C.blue, C.orange] as const;

export interface CardTheme {
  color: string;
  icon: string;
  deco: string;
  tag: string;
  title: string;
  short: string;
  stars: number;
}

/** First regex that matches `text` wins; otherwise `fallback`. */
export function iconFor(text: string, table: [RegExp, string][], fallback: string): string {
  return table.find(([re]) => re.test(text))?.[1] ?? fallback;
}

export function useStringArray(n: number) {
  const [arr, setArr] = useState<string[]>(() => Array.from({ length: n }, () => ''));
  const setAt = (i: number, v: string) => setArr((prev) => prev.map((x, j) => (j === i ? v : x)));
  return [arr, setAt] as const;
}

// ── Small building blocks ─────────────────────────────────────────────────────

export function Inp({ value, onChange, disabled, color, label }: {
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

export function NumChip({ children }: { children: React.ReactNode }) {
  return <span className="pv-num">{children}</span>;
}

export function Op({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className="pv-op" style={{ background: `${color}22`, color }}>{children}</span>;
}

export function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return <div className="pv-section-label" style={{ color }}>{children}</div>;
}

export function Tip({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className="pv-tip" style={{ background: `${color}1f`, color }}>{children}</span>;
}

export function CardShell({ index, theme, status, children }: {
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

/** Illustrated statement box: big round emoji + the problem text. */
export function Scene({ theme, children, tip }: { theme: CardTheme; children: React.ReactNode; tip?: React.ReactNode }) {
  return (
    <div className="pv-scene" style={{ background: `${theme.color}12`, border: `1px dashed ${theme.color}66` }}>
      <div className="pv-scene-illus" style={{ background: `radial-gradient(circle at 35% 30%, ${theme.color}55, ${theme.color}18 70%)` }}>
        {theme.icon}
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: tip ? 8 : 0 }}>{children}</div>
        {tip}
      </div>
    </div>
  );
}

/** Quotient table (numbers only) with an optional 3rd "Quotient" row shown after correction. */
export function PvTable({ colHeaders, rowLabels, rows, colColors, quotients }: {
  colHeaders: string[];
  rowLabels: [string, string];
  rows: [number[], number[]];
  colColors: readonly string[];
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

/** General table whose cells are arbitrary nodes (typically numbers and inputs). `status[r][c]` tints a cell green/red. */
export function GridTable({ colHeaders, rowLabels, rows, colColors, status }: {
  colHeaders?: string[];
  rowLabels: string[];
  rows: React.ReactNode[][];
  colColors: readonly string[];
  status?: (boolean | null | undefined)[][];
}) {
  return (
    <div className="pv-table-wrap">
      <table className="pv-table">
        {colHeaders && (
          <thead>
            <tr>
              <th className="pv-row-label" />
              {colHeaders.map((h, i) => (
                <th key={i} style={{ background: `${colColors[i % colColors.length]}26`, color: colColors[i % colColors.length] }}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              <th className="pv-row-label">
                <span className="pv-row-dot" style={{ background: r === 0 ? C.blue : C.pink }} />
                {rowLabels[r]}
              </th>
              {row.map((cell, i) => {
                const st = status?.[r]?.[i];
                const bg = st === true ? 'rgba(74,222,128,0.16)' : st === false ? 'rgba(248,113,113,0.16)' : `${colColors[i % colColors.length]}10`;
                return <td key={i} style={{ background: bg }}>{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** One result line: optional letter bubble, a label/prefix, the inputs, a trailing ✓/✗ once corrected. */
export function AnswerRow({ color, letter, status, children }: {
  color: string;
  letter?: string;
  status: boolean | null;
  children: React.ReactNode;
}) {
  const border = status === null ? `${color}45` : status ? 'var(--correct)' : 'var(--wrong)';
  return (
    <div className="pv-calc" style={{ border: `1.5px solid ${border}`, background: `${color}0f` }}>
      {letter && <span className="pv-letter" style={{ background: color }}>{letter}</span>}
      {children}
      {status !== null && (
        <span style={{ marginLeft: 'auto', fontSize: 18, color: status ? 'var(--correct)' : 'var(--wrong)', fontWeight: 700 }}>
          {status ? '✓' : '✗'}
        </span>
      )}
    </div>
  );
}

export function CalcRow({ letter, color, label, parts, status }: {
  letter: string;
  color: string;
  label?: string;
  parts: [React.ReactNode, React.ReactNode, React.ReactNode];
  status: boolean | null;
}) {
  return (
    <AnswerRow color={color} letter={letter} status={status}>
      {label && <span className="pv-calc-label">{label}</span>}
      {parts[0]}
      <Op color={color}>:</Op>
      {parts[1]}
      <Op color={color}>=</Op>
      {parts[2]}
    </AnswerRow>
  );
}

export function VerdictPicker({ question, choice, onChoose, disabled, expected }: {
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

/** Compact Oui / Non pair (used when several statements are judged in one card). */
export function YesNo({ choice, onChoose, disabled, expected }: {
  choice: boolean | null;
  onChoose: (v: boolean) => void;
  disabled: boolean;
  expected: boolean;
}) {
  return (
    <div className="pv-yn">
      {([true, false] as const).map((v) => {
        const sel = choice === v;
        const color = v ? C.green : C.rose;
        let style: React.CSSProperties;
        if (disabled) {
          if (v === expected) style = { border: '2px solid var(--correct)', background: 'rgba(74,222,128,0.16)', color: 'var(--correct)' };
          else if (sel) style = { border: '2px solid var(--wrong)', background: 'rgba(248,113,113,0.16)', color: 'var(--wrong)' };
          else style = { border: '2px solid var(--border)', background: 'var(--surface2)', opacity: 0.45 };
        } else {
          style = sel
            ? { border: `2px solid ${color}`, background: `${color}26`, color }
            : { border: '2px solid var(--border2)', background: 'var(--surface2)' };
        }
        return (
          <button key={String(v)} type="button" disabled={disabled} onClick={() => onChoose(v)} style={style}>
            {v ? 'Oui' : 'Non'}
          </button>
        );
      })}
    </div>
  );
}

export function CardFooter({ disabled, status, color, onValidate, showMissing, missingText, failText }: {
  disabled: boolean;
  status: AnswerState['status'];
  color: string;
  onValidate: () => void;
  showMissing: boolean;
  missingText?: string;
  failText?: string;
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
          <span style={{ fontSize: 13, color: C.orange }}>✋ {missingText ?? 'Complète toutes les cases.'}</span>
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
      {ok ? '🎉 Bravo ! Tout est juste.' : `💡 ${failText ?? 'Pas tout à fait… Ouvre la correction pour comprendre.'}`}
    </div>
  );
}

// ── Corrections ───────────────────────────────────────────────────────────────

export function CorrectionFrame({ color, children }: { color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
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
      {open && <div className="pv-corr">{children}</div>}
    </div>
  );
}

function StepDot({ color, n }: { color: string; n: number | string }) {
  return <span className="pv-step-dot" style={{ background: color }}>{n}</span>;
}

/** Numbered (or custom-labelled) steps, then an optional highlighted conclusion. */
export function StepsCorrection({ color, steps, labels, conclusion }: {
  color: string;
  steps: React.ReactNode[];
  labels?: string[];
  conclusion?: React.ReactNode;
}) {
  return (
    <CorrectionFrame color={color}>
      {steps.map((s, i) => (
        <div key={i} className="pv-corr-step">
          <StepDot color={color} n={labels?.[i] ?? i + 1} />
          <div style={{ flex: 1 }}>{s}</div>
        </div>
      ))}
      {conclusion && <div className="pv-conclusion" style={{ background: `${color}22`, color }}>{conclusion}</div>}
    </CorrectionFrame>
  );
}

export interface CorrectionLine {
  letter: string;
  color: string;
  label?: string;
  bottom: number;
  top: number;
  q: number;
}

/** Correction for "is it proportional?" cards: the quotients as chips, then the verdict. */
export function QuotientCorrection({ color, intro, lines, flags, isProportional, noun }: {
  color: string;
  intro: string;
  lines: CorrectionLine[];
  flags: boolean[];
  isProportional: boolean;
  noun: 'tableau' | 'situation';
}) {
  const what = noun === 'tableau' ? 'un tableau' : 'une situation';
  return (
    <CorrectionFrame color={color}>
      <div className="pv-corr-step">
        <StepDot color={color} n={1} />
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
        <StepDot color={color} n={2} />
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
    </CorrectionFrame>
  );
}

/** Highlights a correct value inside a correction. */
export function Good({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: 'var(--correct)' }}>{children}</strong>;
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

export interface HeroStep {
  emoji: string;
  color: string;
  title?: string;
  text: React.ReactNode;
}

export function VividHero({ onBack, crumbs, title, intro, steps, videos, localVideo, illusTitle, illus }: {
  onBack: () => void;
  crumbs: { label: string; color: string }[];
  title: string;
  intro: React.ReactNode;
  steps: HeroStep[];
  videos: { url: string; label: string }[];
  /** A video file served from /public (e.g. an animation with burned-in subtitles). */
  localVideo?: { src: string; poster?: string; title: string };
  illusTitle: string;
  illus: React.ReactNode;
}) {
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
          {crumbs.map((c) => (
            <span key={c.label} className="pv-crumb" style={{ background: `${c.color}22`, color: c.color }}>{c.label}</span>
          ))}
        </div>
        <div className="pv-hero-grid">
          <div>
            <div className="pv-eyebrow" style={{ color: C.violet }}>📖 Rappel du cours</div>
            <h2 className="pv-hero-title">{title}</h2>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>{intro}</div>
            <div className="pv-steps">
              {steps.map((s, i) => (
                <div key={i} className="pv-step" style={{ borderColor: `${s.color}55`, background: `${s.color}14` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="pv-step-dot" style={{ background: s.color }}>{i + 1}</span>
                    <span style={{ fontSize: 20 }}>{s.emoji}</span>
                    {s.title && <strong style={{ fontSize: 13, color: s.color }}>{s.title}</strong>}
                  </div>
                  {s.text}
                </div>
              ))}
            </div>
            {localVideo && (
              <figure className="pv-player">
                <video controls preload="metadata" playsInline poster={localVideo.poster} src={localVideo.src} aria-label={localVideo.title} />
                <figcaption>🎬 {localVideo.title}</figcaption>
              </figure>
            )}
            <div className="pv-videos">
              {videos.map((v) => (
                <a key={v.url} className="pv-video" href={v.url} target="_blank" rel="noopener noreferrer">
                  <span className="pv-video-play">▶</span> {v.label}
                </a>
              ))}
            </div>
          </div>
          <div className="pv-illus">
            <div className="pv-eyebrow" style={{ color: C.orange, marginBottom: 8 }}>{illusTitle}</div>
            {illus}
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

function Sidebar({ stats, themes, statuses, onReset, onNew, tip }: {
  stats: { correct: number; wrong: number; answered: number; total: number };
  themes: CardTheme[];
  statuses: AnswerState['status'][];
  onReset: () => void;
  onNew: () => void;
  tip: { emoji: string; title: string; text: React.ReactNode };
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
        <div style={{ fontSize: 26, marginBottom: 4 }}>{tip.emoji}</div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{tip.title}</div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)' }}>{tip.text}</div>
      </div>
    </>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────

export function VividPage<T>({ accent, hero, tip, build, themeFor, renderCard }: {
  accent: string;
  hero: React.ReactNode;
  tip: { emoji: string; title: string; text: React.ReactNode };
  build: () => T[];
  themeFor: (ex: T, i: number, all: T[]) => CardTheme;
  renderCard: (ex: T, i: number, p: { theme: CardTheme; answer: AnswerState; onSubmit: (ok: boolean) => void }) => React.ReactNode;
}) {
  const [exercises, setExercises] = useState<T[]>(() => build());
  const [answers, setAnswers] = useState<AnswerState[]>(() => exercises.map(() => emptyAnswer()));
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const themes = useMemo(() => exercises.map((ex, i) => themeFor(ex, i, exercises)), [exercises]); // eslint-disable-line react-hooks/exhaustive-deps

  const newSeries = () => {
    const exs = build();
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
      {hero}

      <div className="pv-layout">
        <aside className="pv-sidebar">
          <Sidebar
            stats={stats}
            themes={themes}
            statuses={answers.map((a) => a.status)}
            onReset={resetErrors}
            onNew={newSeries}
            tip={tip}
          />
        </aside>

        <div className="pv-main">
          {exercises.map((ex, i) => (
            <Fragment key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}>
              {renderCard(ex, i, { theme: themes[i]!, answer: answers[i]!, onSubmit: (ok) => submit(i, ok) })}
            </Fragment>
          ))}

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
