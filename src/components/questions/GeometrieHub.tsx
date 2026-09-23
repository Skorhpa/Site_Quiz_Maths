import { useEffect, useMemo, useRef, useState } from 'react';
import { ModeCard } from './FractionsHub';

type HubMode = 'vocabulaire' | 'programme' | null;

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

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function shuffleSteps(steps: readonly string[]): string[] {
  const s = shuffle(steps);
  if (s.every((v, i) => v === steps[i])) {
    [s[0], s[1]] = [s[1]!, s[0]!];
  }
  return s;
}

// Letters used to name points — I/O/Q skipped to avoid confusion with 1/0 and each other.
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V'] as const;

// ── SVG : droites, segments, demi-droites ───────────────────────────────────────

function svgPoint(x: number, y: number, label: string, color = 'var(--text)'): string {
  const s = 4;
  return `<line x1="${x - s}" y1="${y - s}" x2="${x + s}" y2="${y + s}" stroke="${color}" stroke-width="1.6" />` +
    `<line x1="${x - s}" y1="${y + s}" x2="${x + s}" y2="${y - s}" stroke="${color}" stroke-width="1.6" />` +
    `<text x="${x}" y="${y - 10}" text-anchor="middle" font-size="15" font-weight="700" fill="${color}">${label}</text>`;
}

type FigureKind = 'droite' | 'segment' | 'demi-droite';

function buildBasicFigureSvg(kind: FigureKind, p: string, q: string): string {
  const W = 260, y = 42;
  const left = 26, right = W - 26;
  let body = '';
  let px: number, qx: number;

  if (kind === 'droite') {
    body += `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="var(--text)" stroke-width="2" />`;
    px = 100; qx = 180;
  } else if (kind === 'segment') {
    px = left; qx = right;
    body += `<line x1="${px}" y1="${y}" x2="${qx}" y2="${y}" stroke="var(--text)" stroke-width="2" />`;
  } else {
    // Demi-droite : le trait s'arrête pile à l'origine (comme un segment) mais dépasse le second point (comme une droite).
    const flip = Math.random() < 0.5;
    body += `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="var(--text)" stroke-width="2" />`;
    if (!flip) { px = left; qx = 165; } else { px = right; qx = 95; }
  }

  body += svgPoint(px, y, p);
  body += svgPoint(qx, y, q);
  return `<svg viewBox="0 0 ${W} 68" style="width:100%;max-width:280px;height:auto;">${body}</svg>`;
}

type PointMode = 'off' | 'inside' | 'beyond-p' | 'beyond-q';

function buildPointLineSvg(p: string, q: string, c: string, mode: PointMode): string {
  const W = 300, y = 48;
  const left = 24, right = W - 24;
  const pLeft = Math.random() < 0.5;
  const xInner1 = 112, xInner2 = 188;
  const xP = pLeft ? xInner1 : xInner2;
  const xQ = pLeft ? xInner2 : xInner1;

  let body = `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="var(--text)" stroke-width="2" />`;
  body += svgPoint(xP, y, p);
  body += svgPoint(xQ, y, q);

  let xC = (xP + xQ) / 2;
  let yC = y;
  if (mode === 'off') {
    yC = y + (Math.random() < 0.5 ? -30 : 30);
  } else if (mode === 'inside') {
    xC = Math.min(xP, xQ) + Math.abs(xQ - xP) * (0.3 + Math.random() * 0.4);
  } else if (mode === 'beyond-p') {
    xC = pLeft ? left + 12 : right - 12;
  } else {
    xC = pLeft ? right - 12 : left + 12;
  }
  body += svgPoint(xC, yC, c, '#F472B6');

  return `<svg viewBox="0 0 ${W} 90" style="width:100%;max-width:320px;height:auto;">${body}</svg>`;
}

/** Deux droites sécantes (E)(F) et (G)(H), avec leur point d'intersection nommé. */
function buildIntersectionSvg(a: string, b: string, c: string, d: string, i: string): string {
  const W = 260, H = 140;
  const cx = W / 2, cy = H / 2;
  const swap = Math.random() < 0.5;
  // Diagonale 1 : haut-gauche → bas-droite ; diagonale 2 : haut-droite → bas-gauche.
  const l1: [number, number, number, number] = [30, 20, W - 30, H - 20];
  const l2: [number, number, number, number] = [W - 30, 20, 30, H - 20];
  const along = (line: [number, number, number, number], t: number): [number, number] => {
    const [x1, y1, x2, y2] = line;
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
  };

  let body = `<line x1="${l1[0]}" y1="${l1[1]}" x2="${l1[2]}" y2="${l1[3]}" stroke="var(--text)" stroke-width="2" />`;
  body += `<line x1="${l2[0]}" y1="${l2[1]}" x2="${l2[2]}" y2="${l2[3]}" stroke="var(--text)" stroke-width="2" />`;

  const [ax, ay] = along(l1, 0.18);
  const [bx, by] = along(l1, 0.82);
  const [cx1, cy1] = along(l2, 0.18);
  const [dx, dy] = along(l2, 0.82);
  body += svgPoint(ax, ay, swap ? b : a);
  body += svgPoint(bx, by, swap ? a : b);
  body += svgPoint(cx1, cy1, swap ? d : c);
  body += svgPoint(dx, dy, swap ? c : d);
  body += svgPoint(cx, cy, i);

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:260px;height:auto;">${body}</svg>`;
}

// ── QCM : options à choix unique ou multiple ────────────────────────────────────

interface QcmOption {
  label: string;
  correct: boolean;
}

interface QcmPart {
  prompt: string;
  multi: boolean;
  options: QcmOption[];
}

interface VocabExercise {
  label: string;
  color: string;
  svg: string;
  parts: QcmPart[];
}

// ── Q1-4 : nature et notation ────────────────────────────────────────────────────

const NATURE_LABELS: Record<FigureKind, string> = {
  droite: 'une droite',
  segment: 'un segment',
  'demi-droite': 'une demi-droite',
};

function buildNotationOptions(kind: FigureKind, p: string, q: string): QcmOption[] {
  if (kind === 'segment') {
    return shuffle([
      { label: `[${p}${q}]`, correct: true },
      { label: `[${q}${p}]`, correct: true },
      { label: `(${p}${q})`, correct: false },
      { label: `[${p}${q})`, correct: false },
    ]);
  }
  if (kind === 'droite') {
    return shuffle([
      { label: `(${p}${q})`, correct: true },
      { label: `(${q}${p})`, correct: true },
      { label: `[${p}${q}]`, correct: false },
      { label: `[${p}${q})`, correct: false },
    ]);
  }
  return shuffle([
    { label: `[${p}${q})`, correct: true },
    { label: `[${q}${p})`, correct: false },
    { label: `[${p}${q}]`, correct: false },
    { label: `(${p}${q})`, correct: false },
  ]);
}

const COLOR_NATURE = '#60A5FA';
const COLOR_POINT = '#34D399';
const COLOR_EXTENDED = '#F472B6';
const COLOR_INTERSECT = '#FCD34D';

function pickFourKinds(): FigureKind[] {
  const base = shuffle(['droite', 'segment', 'demi-droite'] as FigureKind[]);
  const extra = pick(['droite', 'segment', 'demi-droite'] as FigureKind[]);
  return shuffle([...base, extra]);
}

function makeVocabFigureExercise(kind: FigureKind): VocabExercise {
  const [p, q] = shuffle(LETTERS).slice(0, 2);
  const natureOptions = shuffle(
    (['droite', 'segment', 'demi-droite'] as FigureKind[]).map((k) => ({ label: NATURE_LABELS[k], correct: k === kind }))
  );
  const pronoun = kind === 'segment' ? 'Il' : 'Elle';
  return {
    label: 'Nature et notation',
    color: COLOR_NATURE,
    svg: buildBasicFigureSvg(kind, p!, q!),
    parts: [
      { prompt: 'Ceci est…', multi: false, options: natureOptions },
      { prompt: `${pronoun} se note…`, multi: true, options: buildNotationOptions(kind, p!, q!) },
    ],
  };
}

// ── Q5 / Q6 : un point et une droite ─────────────────────────────────────────────

function makePointBasicExercise(onLine: boolean): VocabExercise {
  const [p, q, c] = shuffle(LETTERS).slice(0, 3);
  return {
    label: onLine ? 'Point sur une droite' : "Point hors d'une droite",
    color: COLOR_POINT,
    svg: buildPointLineSvg(p!, q!, c!, onLine ? 'inside' : 'off'),
    parts: [
      {
        prompt: `Le point ${c} appartient-il à la droite (${p}${q}) ?`,
        multi: false,
        options: shuffle([{ label: 'Oui', correct: onLine }, { label: 'Non', correct: !onLine }]),
      },
      {
        prompt: `On note : ${c} … (${p}${q})`,
        multi: false,
        options: shuffle([{ label: '∈', correct: onLine }, { label: '∉', correct: !onLine }]),
      },
      {
        prompt: `Les points ${p}, ${q}, ${c} sont-ils alignés ?`,
        multi: false,
        options: shuffle([{ label: 'Oui', correct: onLine }, { label: 'Non', correct: !onLine }]),
      },
    ],
  };
}

// ── Q7 : point sur la droite mais hors du segment ────────────────────────────────

function makePointExtendedExercise(): VocabExercise {
  const [p, q, c] = shuffle(LETTERS).slice(0, 3);
  const beyondP = Math.random() < 0.5;
  const askFirstRay = Math.random() < 0.5;
  const rayLabel = askFirstRay ? `[${p}${q})` : `[${q}${p})`;
  // [p q) contient les points au-delà de q (pas au-delà de p) ; [q p) l'inverse.
  const onRay = askFirstRay ? !beyondP : beyondP;

  const items: { atPhrase: string; short: string; truth: boolean }[] = [
    { atPhrase: `à la droite (${p}${q})`, short: `(${p}${q})`, truth: true },
    { atPhrase: `au segment [${p}${q}]`, short: `[${p}${q}]`, truth: false },
    { atPhrase: `à la demi-droite ${rayLabel}`, short: rayLabel, truth: onRay },
  ];

  const parts: QcmPart[] = [
    ...items.map((it) => ({
      prompt: `Le point ${c} appartient-il ${it.atPhrase} ?`,
      multi: false,
      options: shuffle([{ label: 'Oui', correct: it.truth }, { label: 'Non', correct: !it.truth }]),
    })),
    ...items.map((it) => ({
      prompt: `On note : ${c} … ${it.short}`,
      multi: false,
      options: shuffle([{ label: '∈', correct: it.truth }, { label: '∉', correct: !it.truth }]),
    })),
  ];

  return {
    label: 'Point sur la droite, hors du segment',
    color: COLOR_EXTENDED,
    svg: buildPointLineSvg(p!, q!, c!, beyondP ? 'beyond-p' : 'beyond-q'),
    parts,
  };
}

// ── Q8 : point d'intersection de deux droites ────────────────────────────────────

function makeIntersectionExercise(): VocabExercise {
  const [a, b, c, d, i] = shuffle(LETTERS).slice(0, 5);
  const options = shuffle([a, b, c, d, i].map((label) => ({ label: label!, correct: label === i })));
  return {
    label: 'Point d’intersection',
    color: COLOR_INTERSECT,
    svg: buildIntersectionSvg(a!, b!, c!, d!, i!),
    parts: [
      {
        prompt: `Quel est le point d'intersection des droites (${a}${b}) et (${c}${d}) ?`,
        multi: false,
        options,
      },
    ],
  };
}

function buildVocabExercises(): VocabExercise[] {
  const kinds = pickFourKinds();
  return [
    ...kinds.map(makeVocabFigureExercise),
    makePointBasicExercise(false),
    makePointBasicExercise(true),
    makePointExtendedExercise(),
    makeIntersectionExercise(),
  ];
}

// ── Carte QCM à plusieurs sous-questions ─────────────────────────────────────────

interface QcmPartState {
  selected: boolean[];
  status: 'pending' | 'correct' | 'wrong';
}

function QcmCard({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: VocabExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [parts, setParts] = useState<QcmPartState[]>(
    exercise.parts.map((p) => ({ selected: p.options.map(() => false), status: 'pending' }))
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
      setParts((prev) => prev.map((p) => (p.status === 'pending' ? { ...p, status: 'wrong' } : p)));
    }
  }, [answer.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (pi: number, oi: number) => {
    if (disabled || parts[pi]!.status !== 'pending') return;
    const part = exercise.parts[pi]!;
    setParts((prev) =>
      prev.map((p, idx) => {
        if (idx !== pi) return p;
        if (part.multi) return { ...p, selected: p.selected.map((s, j) => (j === oi ? !s : s)) };
        return { ...p, selected: p.selected.map((_, j) => j === oi) };
      })
    );
  };

  const validate = (pi: number) => {
    if (disabled || parts[pi]!.status !== 'pending') return;
    const part = exercise.parts[pi]!;
    if (!parts[pi]!.selected.some(Boolean)) return;
    const ok = part.options.every((o, oi) => parts[pi]!.selected[oi] === o.correct);
    setParts((prev) => prev.map((p, idx) => (idx === pi ? { ...p, status: ok ? 'correct' : 'wrong' } : p)));
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.8rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${exercise.color}22`, color: exercise.color }}>
          {exercise.label}
        </span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: exercise.svg }} />

      {exercise.parts.map((part, pi) => {
        const ps = parts[pi]!;
        const partDone = disabled || ps.status !== 'pending';
        return (
          <div key={pi} style={{ marginTop: 10, paddingTop: 10, borderTop: pi > 0 ? '1px dashed var(--border)' : undefined }}>
            <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 600 }}>{part.prompt}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {part.options.map((opt, oi) => {
                const isSel = ps.selected[oi];
                let border = 'var(--border2)';
                let bg = 'var(--surface)';
                let color = 'var(--text)';
                if (partDone) {
                  if (opt.correct) { border = 'var(--correct)'; bg = isSel ? 'rgba(74,222,128,0.15)' : 'transparent'; color = 'var(--correct)'; }
                  else if (isSel) { border = 'var(--wrong)'; bg = 'rgba(248,113,113,0.15)'; color = 'var(--wrong)'; }
                } else if (isSel) {
                  border = exercise.color;
                  bg = `${exercise.color}18`;
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={partDone}
                    onClick={() => toggle(pi, oi)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 14, fontFamily: "'DM Mono', monospace",
                      border: `1.5px solid ${border}`, background: bg, color,
                      cursor: partDone ? 'default' : 'pointer', fontWeight: isSel ? 700 : 400,
                    }}
                  >
                    {part.multi && <span style={{ marginRight: 6 }}>{isSel ? '☑' : '☐'}</span>}
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              {!partDone && (
                <button className="btn-secondary" onClick={() => validate(pi)} style={{ padding: '5px 14px', fontSize: 12, borderRadius: 8 }}>
                  Valider
                </button>
              )}
              {ps.status !== 'pending' && (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: ps.status === 'correct' ? 'var(--correct)' : 'var(--wrong)' }}>
                  {ps.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Programme de construction : géométrie fixe et vérifiée, lettres tirées au sort ──

function svgLine(x1: number, y1: number, x2: number, y2: number): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--text)" stroke-width="1.5" />`;
}

/** Petit trait perpendiculaire au milieu d'un segment (codage "longueurs égales"). */
function tickMark(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len, py = dx / len;
  const s = 6;
  return `<line x1="${mx - px * s}" y1="${my - py * s}" x2="${mx + px * s}" y2="${my + py * s}" stroke="var(--text)" stroke-width="1.4" />`;
}

/** Petit carré de codage d'angle droit au sommet v, entre les directions vers a et vers b. */
function rightAngleMark(vx: number, vy: number, ax: number, ay: number, bx: number, by: number): string {
  const norm = (x: number, y: number): [number, number] => {
    const l = Math.hypot(x, y) || 1;
    return [x / l, y / l];
  };
  const [n1x, n1y] = norm(ax - vx, ay - vy);
  const [n2x, n2y] = norm(bx - vx, by - vy);
  const s = 9;
  const p1x = vx + n1x * s, p1y = vy + n1y * s;
  const p2x = p1x + n2x * s, p2y = p1y + n2y * s;
  const p3x = vx + n2x * s, p3y = vy + n2y * s;
  return `<polyline points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}" fill="none" stroke="var(--text)" stroke-width="1.2" />`;
}

interface ConstructionExercise {
  text: string;
  figure: string;
  steps: string[];
  shuffled: string[];
}

// Figure A : coordonnées fixes et vérifiées. P(40,130) Q(220,130) I=milieu(P,Q) R(160,30).
// K = milieu(P,R) = intersection avec la parallèle à (QR) passant par I (droite des milieux).
// J = intersection de la perpendiculaire à (QR) passant par I, avec (QR).
function buildFigureA(p: string, q: string, i: string, r: string, j: string, k: string): string {
  const P = [40, 130], Q = [220, 130], I = [130, 130], R = [160, 30], K = [100, 80], J = [196.18, 90.29];
  let body = '';
  body += svgLine(P[0]!, P[1]!, Q[0]!, Q[1]!);
  body += svgLine(P[0]!, P[1]!, R[0]!, R[1]!);
  body += svgLine(Q[0]!, Q[1]!, R[0]!, R[1]!);
  body += svgLine(I[0]!, I[1]!, J[0]!, J[1]!);
  body += svgLine(I[0]!, I[1]!, K[0]!, K[1]!);
  body += tickMark(P[0]!, P[1]!, I[0]!, I[1]!);
  body += tickMark(I[0]!, I[1]!, Q[0]!, Q[1]!);
  body += rightAngleMark(J[0]!, J[1]!, I[0]!, I[1]!, Q[0]!, Q[1]!);
  body += svgPoint(P[0]!, P[1]! + 4, p);
  body += svgPoint(Q[0]!, Q[1]! + 4, q);
  body += svgPoint(I[0]!, I[1]! + 12, i);
  body += svgPoint(R[0]!, R[1]!, r);
  body += svgPoint(J[0]!, J[1]!, j);
  body += svgPoint(K[0]!, K[1]!, k);
  return `<svg viewBox="0 0 260 150" style="width:100%;max-width:260px;height:auto;">${body}</svg>`;
}

function makeConstructionA(): ConstructionExercise {
  const [p, q, i, r, j, k] = shuffle(LETTERS).slice(0, 6);
  const steps = [
    `Trace un segment [${p}${q}] de longueur 6 cm, puis place son milieu ${i}.`,
    `Place un point ${r} n'appartenant pas à la droite (${p}${q}), puis trace [${p}${r}] et [${q}${r}].`,
    `Trace la droite perpendiculaire à (${q}${r}) passant par ${i}. Elle coupe (${q}${r}) en ${j}.`,
    `Trace la droite parallèle à (${q}${r}) passant par ${i}. Elle coupe [${p}${r}] en ${k}.`,
  ];
  return {
    text: "Voici la figure obtenue à la fin d'un programme de construction. Remets les étapes dans le bon ordre.",
    figure: buildFigureA(p!, q!, i!, r!, j!, k!),
    steps,
    shuffled: shuffleSteps(steps),
  };
}

// Figure B : coordonnées fixes et vérifiées. E(40,110) F(200,110) G(140,30) H=milieu(E,F).
function buildFigureB(e: string, f: string, g: string, h: string): string {
  const E = [40, 110], F = [200, 110], G = [140, 30], H = [120, 110];
  let body = '';
  body += svgLine(E[0]!, E[1]!, F[0]!, F[1]!);
  // droite (EG), légèrement prolongée des deux côtés (pas de flèche).
  body += svgLine(20, 126, 165, 10);
  // demi-droite [GF), part pile de G et dépasse F.
  body += svgLine(G[0]!, G[1]!, 221, 138);
  body += svgLine(H[0]!, H[1]!, G[0]!, G[1]!);
  body += tickMark(E[0]!, E[1]!, H[0]!, H[1]!);
  body += tickMark(H[0]!, H[1]!, F[0]!, F[1]!);
  body += svgPoint(E[0]!, E[1]! + 4, e);
  body += svgPoint(F[0]!, F[1]! + 4, f);
  body += svgPoint(G[0]!, G[1]!, g);
  body += svgPoint(H[0]!, H[1]! + 12, h);
  return `<svg viewBox="0 0 240 150" style="width:100%;max-width:260px;height:auto;">${body}</svg>`;
}

function makeConstructionB(): ConstructionExercise {
  const [e, f, g, h] = shuffle(LETTERS).slice(0, 4);
  const steps = [
    `Place un point ${e}, puis un point ${f} distinct de ${e}.`,
    `Trace le segment [${e}${f}].`,
    `Place un point ${g} non aligné avec ${e} et ${f}.`,
    `Trace la droite (${e}${g}) et la demi-droite [${g}${f}).`,
    `Place ${h}, le milieu de [${e}${f}].`,
    `Trace le segment [${h}${g}].`,
  ];
  return {
    text: "Voici la figure obtenue à la fin d'un programme de construction. Remets les étapes dans le bon ordre.",
    figure: buildFigureB(e!, f!, g!, h!),
    steps,
    shuffled: shuffleSteps(steps),
  };
}

// Figure C : un cercle (figure très différente des deux précédentes, toutes droites/segments).
// Coordonnées fixes et vérifiées. O(130,90) rayon 60. A à 200°, B à 20° (diamétralement opposé à A,
// donc O est bien le milieu de [AB]), C à 95° (distinct de A et B).
function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function buildFigureC(o: string, a: string, b: string, c: string): string {
  const ox = 130, oy = 90, r = 60;
  const [ax, ay] = polar(ox, oy, r, 200);
  const [bx, by] = polar(ox, oy, r, 20);
  const [cx, cy] = polar(ox, oy, r, 95);
  let body = `<circle cx="${ox}" cy="${oy}" r="${r}" fill="none" stroke="var(--text)" stroke-width="2" />`;
  body += svgLine(ox, oy, ax, ay);
  body += svgLine(ox, oy, bx, by);
  body += svgLine(ax, ay, cx, cy);
  body += svgLine(bx, by, cx, cy);
  body += tickMark(ox, oy, ax, ay);
  body += tickMark(ox, oy, bx, by);
  body += svgPoint(ox, oy, o);
  body += svgPoint(ax, ay, a);
  body += svgPoint(bx, by, b);
  body += svgPoint(cx, cy, c);
  return `<svg viewBox="0 0 260 180" style="width:100%;max-width:260px;height:auto;">${body}</svg>`;
}

function makeConstructionC(): ConstructionExercise {
  const [o, a, b, c] = shuffle(LETTERS).slice(0, 4);
  const steps = [
    `Place un point ${o}, puis trace le cercle de centre ${o} et de rayon 4 cm.`,
    `Place un point ${a} sur ce cercle.`,
    `Place un point ${b} sur le cercle tel que ${o} soit le milieu de [${a}${b}].`,
    `Place un point ${c} sur le cercle, distinct de ${a} et de ${b}, puis trace [${a}${c}] et [${b}${c}].`,
  ];
  return {
    text: "Voici la figure obtenue à la fin d'un programme de construction. Remets les étapes dans le bon ordre.",
    figure: buildFigureC(o!, a!, b!, c!),
    steps,
    shuffled: shuffleSteps(steps),
  };
}

function buildConstructionExercises(): ConstructionExercise[] {
  return [makeConstructionA(), makeConstructionB(), makeConstructionC()];
}

type DragSrc = { from: 'pool'; text: string } | { from: 'slot'; idx: number; text: string };

function ConstructionDragDrop({ index, exercise, answer, onSubmit }: {
  index: number;
  exercise: ConstructionExercise;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [placed, setPlaced] = useState<(string | null)[]>(() => Array(exercise.steps.length).fill(null));
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
      setFeedback({ text: '✗ Place toutes les étapes avant de vérifier.', cls: 'feedback ko' });
      return;
    }
    const ok = placed.every((p, i) => p === exercise.steps[i]);
    setFeedback({
      text: ok ? '✓ Parfait ! Les étapes sont dans le bon ordre.' : "✗ L'ordre n'est pas correct.",
      cls: ok ? 'feedback ok' : 'feedback ko',
    });
    onSubmit(ok);
  };

  const finalFb = answer.status === 'revealed'
    ? { text: "Voici l'ordre correct ci-dessous.", cls: 'feedback ko' }
    : feedback;

  return (
    <div className={`qcard ${answer.status === 'correct' ? 'correct-card' : answer.status === 'wrong' || answer.status === 'revealed' ? 'wrong-card' : ''}`}>
      <div className="qcard-header">
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
        <div className="qtext" dangerouslySetInnerHTML={{ __html: exercise.text }} />
      </div>
      <div className="qbody" style={{ alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="figure-wrap" dangerouslySetInnerHTML={{ __html: exercise.figure }} />
        <div style={{ flex: 1, minWidth: 260 }}>
          {!disabled && (
            <>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Étapes à placer :</p>
              <div className="drag-pool" onDragOver={(e) => e.preventDefault()} onDrop={dropToPool}>
                {pool.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                    Glisse une étape ici pour la retirer.
                  </span>
                ) : (
                  pool.map((step) => (
                    <div
                      key={step}
                      className="drag-item"
                      draggable
                      onDragStart={() => { dragSrc.current = { from: 'pool', text: step }; }}
                    >
                      {step}
                    </div>
                  ))
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 0 8px' }}>
                Remets les étapes dans l'ordre :
              </p>
            </>
          )}
          {disabled && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Ordre correct :</p>}
          <div className="drag-slots">
            {exercise.steps.map((correctStep, i) => {
              const content = disabled ? correctStep : placed[i];
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
                    <span className="drag-slot-empty">Glisse une étape ici…</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`}>
          {exercise.steps.map((step, i) => (
            <div key={i}>
              <span className="step-eq">{i + 1}. {step}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <button type="button" className="btn-primary" disabled={disabled} onClick={handleVerify}>
          Vérifier
        </button>
        <div className={finalFb.cls}>{finalFb.text}</div>
      </div>
    </div>
  );
}

// ── GeometrieHub (main export) ──────────────────────────────────────────────────

function buildExercises(mode: HubMode): (VocabExercise | ConstructionExercise)[] {
  if (mode === 'vocabulaire') return buildVocabExercises();
  if (mode === 'programme') return buildConstructionExercises();
  return [];
}

export function GeometrieHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode>(null);
  const [exercises, setExercises] = useState<(VocabExercise | ConstructionExercise)[]>([]);
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
          label="Vocabulaire"
          icon="⟷"
          desc="Droites, segments, demi-droites — nature, notation et appartenance"
          accent={accent}
          onClick={() => selectMode('vocabulaire')}
        />
        <ModeCard
          label="Programme de construction"
          icon="⇅"
          desc="Remets les étapes d'un programme de construction dans le bon ordre"
          accent={accent}
          onClick={() => selectMode('programme')}
        />
      </div>
    );
  }

  const accentStyle = { color: accent };
  const progressStyle = {
    width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`,
    background: accentSecondary ? `linear-gradient(90deg, ${accent}, ${accentSecondary})` : accent,
  };
  const modeLabel = mode === 'programme' ? 'Programme de construction' : 'Vocabulaire';

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
        {mode === 'programme'
          ? (exercises as ConstructionExercise[]).map((ex, i) => (
              <ConstructionDragDrop
                key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
                index={i}
                exercise={ex}
                answer={answers[i]!}
                onSubmit={(ok) => submit(i, ok)}
              />
            ))
          : (exercises as VocabExercise[]).map((ex, i) => (
              <QcmCard
                key={`${seriesKey}-${answers[i]!.resetKey}-${i}`}
                index={i}
                exercise={ex}
                answer={answers[i]!}
                accent={accent}
                onSubmit={(ok) => submit(i, ok)}
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
