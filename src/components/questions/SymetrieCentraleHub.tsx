import { useRef, useState } from 'react';
import { ModeCard } from './FractionsHub';
import {
  C, CardFooter, CardShell, CorrectionFrame, Scene, SectionLabel, Tip, VividHero, VividPage,
  type AnswerState, type CardTheme,
} from './ProportionnaliteVividKit';

type HubMode = 'quadrillage' | 'papier' | null;

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const randFloat = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** Points placed around a centroid, in angular order (12-point ring), so n≤5 of them always form a simple (non self-intersecting) shape. */
const RING: readonly [number, number][] = [
  [1, 0], [1, 0.58], [0.5, 1], [0, 1], [-0.5, 1], [-1, 0.58],
  [-1, 0], [-1, -0.58], [-0.5, -1], [0, -1], [0.5, -1], [1, -0.58],
];

function pickRingOffsets(n: number): [number, number][] {
  if (n === 1) return [[0, 0]];
  const step = Math.floor(RING.length / n);
  const start = randInt(0, RING.length - 1);
  return Array.from({ length: n }, (_, i) => RING[(start + i * step) % RING.length]!);
}

function FigureOutline({ pts, color }: { pts: { cx: number; cy: number }[]; color: string }) {
  if (pts.length < 2) return null;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx},${p.cy}`).join(' ') + (pts.length >= 3 ? ' Z' : '');
  return <path d={d} stroke={color} strokeWidth={1.5} fill="none" />;
}

function SymCross({ cx, cy, letter, color }: { cx: number; cy: number; letter: string; color: string }) {
  const s = 5;
  return (
    <g>
      <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} stroke={color} strokeWidth={2} />
      <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} stroke={color} strokeWidth={2} />
      <text x={cx} y={cy - 9} textAnchor="middle" fontSize={13} fontWeight={700} fill={color} fontFamily="'DM Mono', monospace">
        {letter}
      </text>
    </g>
  );
}

// ── Rappels ───────────────────────────────────────────────────────────────────

/** Manual step navigation only — advances solely via next()/prev(), never on a timer. */
function useStepPlayer(numSteps: number) {
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(numSteps - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));
  const replay = () => setStep(0);
  return { step, next, prev, replay };
}

function PlayerControls({ step, numSteps, onPrev, onNext, onReplay }: {
  step: number; numSteps: number; onPrev: () => void; onNext: () => void; onReplay: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 }}>
      <button type="button" className="btn-secondary" onClick={onPrev} disabled={step === 0} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 8 }}>
        ◀ Précédent
      </button>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: numSteps }, (_, i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === step ? 'var(--text)' : 'var(--border2)' }} />
        ))}
      </div>
      {step >= numSteps - 1 ? (
        <button type="button" className="btn-secondary" onClick={onReplay} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 8 }}>
          🔁 Rejouer
        </button>
      ) : (
        <button type="button" className="btn-secondary" onClick={onNext} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 8 }}>
          Suivant ▶
        </button>
      )}
    </div>
  );
}

// Zoomed-in grid used only by the quadrillage demo, so the small example fills the canvas instead of
// sitting lost in the full-size (-8..8) exercise grid.
const DEMO_GRID_MIN = -4;
const DEMO_GRID_MAX = 4;
const DEMO_GRID_SIZE = 260;
const DEMO_GRID_MARGIN = 18;
const DEMO_GRID_STEP = (DEMO_GRID_SIZE - 2 * DEMO_GRID_MARGIN) / (DEMO_GRID_MAX - DEMO_GRID_MIN);
const DEMO_GRID_INTS = Array.from({ length: DEMO_GRID_MAX - DEMO_GRID_MIN + 1 }, (_, i) => DEMO_GRID_MIN + i);
const dgx = (x: number) => DEMO_GRID_MARGIN + (x - DEMO_GRID_MIN) * DEMO_GRID_STEP;
const dgy = (y: number) => DEMO_GRID_SIZE - DEMO_GRID_MARGIN - (y - DEMO_GRID_MIN) * DEMO_GRID_STEP;

function DemoGrid({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${DEMO_GRID_SIZE} ${DEMO_GRID_SIZE}`} style={{ width: '100%', maxWidth: 260, height: 'auto', display: 'block', margin: '0 auto' }}>
      {DEMO_GRID_INTS.map((i) => (
        <line key={`v${i}`} x1={dgx(i)} y1={dgy(DEMO_GRID_MIN)} x2={dgx(i)} y2={dgy(DEMO_GRID_MAX)} stroke="var(--border)" strokeWidth={1} />
      ))}
      {DEMO_GRID_INTS.map((i) => (
        <line key={`h${i}`} x1={dgx(DEMO_GRID_MIN)} y1={dgy(i)} x2={dgx(DEMO_GRID_MAX)} y2={dgy(i)} stroke="var(--border)" strokeWidth={1} />
      ))}
      {children}
    </svg>
  );
}

const QUAD_DEMO_A = { x: -2, y: 1 };
const QUAD_DEMO_O = { x: 0, y: 0 };
const QUAD_DEMO_APRIME = { x: 2, y: -1 };

const QUAD_DEMO_STEPS = [
  "Voici le point A et le centre O.",
  "Pour aller de A à O, on compte d'abord les carreaux horizontalement : 2 vers la droite.",
  "Puis verticalement : 1 carreau vers le bas.",
  "On refait ce déplacement en partant de O : 2 carreaux vers la droite…",
  "…puis 1 carreau vers le bas. On arrive au point A' !",
  "A' est le symétrique de A par rapport à O : O est bien le milieu de [AA'].",
];

function QuadAnimationDemo({ accent }: { accent: string }) {
  const { step, next, prev, replay } = useStepPlayer(QUAD_DEMO_STEPS.length);
  const A = QUAD_DEMO_A, O = QUAD_DEMO_O, Ap = QUAD_DEMO_APRIME;
  const redMidX = (dgx(A.x) + dgx(O.x)) / 2;
  const redMidY = (dgy(A.y) + dgy(O.y)) / 2;

  return (
    <div style={{ padding: 4 }}>
      <div style={{ maxWidth: 260, margin: '0 auto' }}>
        <DemoGrid>
          {step >= 1 && (
            <line x1={dgx(A.x)} y1={dgy(A.y)} x2={dgx(O.x)} y2={dgy(A.y)} stroke="#f87171" strokeWidth={2.5} />
          )}
          {step >= 1 && <text x={redMidX} y={dgy(A.y) - 8} textAnchor="middle" fontSize={14} fill="#f87171" fontWeight={700}>2</text>}
          {step >= 2 && (
            <line x1={dgx(O.x)} y1={dgy(A.y)} x2={dgx(O.x)} y2={dgy(O.y)} stroke="#f87171" strokeWidth={2.5} />
          )}
          {step >= 2 && <text x={dgx(O.x) + 12} y={redMidY} fontSize={14} fill="#f87171" fontWeight={700}>1</text>}
          {step >= 3 && (
            <line x1={dgx(O.x)} y1={dgy(O.y)} x2={dgx(Ap.x)} y2={dgy(O.y)} stroke={accent} strokeWidth={2.5} />
          )}
          {step >= 4 && (
            <line x1={dgx(Ap.x)} y1={dgy(O.y)} x2={dgx(Ap.x)} y2={dgy(Ap.y)} stroke={accent} strokeWidth={2.5} />
          )}
          {step >= 5 && (
            <line x1={dgx(A.x)} y1={dgy(A.y)} x2={dgx(Ap.x)} y2={dgy(Ap.y)} stroke="var(--correct)" strokeWidth={1.3} strokeDasharray="4 3" />
          )}
          <SymCross cx={dgx(A.x)} cy={dgy(A.y)} letter="A" color="var(--text)" />
          <SymCross cx={dgx(O.x)} cy={dgy(O.y)} letter="O" color="var(--text)" />
          {step >= 4 && <SymCross cx={dgx(Ap.x)} cy={dgy(Ap.y)} letter="A'" color={step >= 5 ? 'var(--correct)' : accent} />}
        </DemoGrid>
      </div>
      <p style={{ textAlign: 'center', fontSize: 13, margin: '10px 0 0', minHeight: 36 }}>{QUAD_DEMO_STEPS[step]}</p>
      <PlayerControls step={step} numSteps={QUAD_DEMO_STEPS.length} onPrev={prev} onNext={next} onReplay={replay} />
    </div>
  );
}

// Zoomed-in blank canvas used only by the papier demo (the real exercise canvas is 420×420 — far too
// zoomed out for a 3-point teaching example).
const DEMO_PAPER_SIZE = 260;

function DemoPaperCanvas({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${DEMO_PAPER_SIZE} ${DEMO_PAPER_SIZE}`} style={{ width: '100%', maxWidth: 260, height: 'auto', display: 'block', margin: '0 auto', background: 'var(--surface)', borderRadius: 8, overflow: 'hidden' }}>
      {children}
    </svg>
  );
}

/** A ray from `from` through `through` and beyond — NOT extended backward past `from` (a true demi-droite, unlike the full two-way RulerLine used by the interactive tool). */
function DemoRay({ from, through, color }: { from: { x: number; y: number }; through: { x: number; y: number }; color: string }) {
  const dx = through.x - from.x, dy = through.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const end = { x: from.x + ux * (len + 400), y: from.y + uy * (len + 400) };
  return <line x1={from.x} y1={from.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={1.6} />;
}

const PAPER_DEMO_O = { x: 130, y: 130 };
const PAPER_DEMO_A = { x: 75, y: 90 };
const PAPER_DEMO_APRIME = { x: 2 * 130 - 75, y: 2 * 130 - 90 };

const PAPER_DEMO_STEPS = [
  "Voici le point A et le centre O.",
  "On pose la règle le long de A et de O, et on trace la demi-droite [AO).",
  "On ouvre le compas pour mesurer la longueur AO : pointe en A, mine en O.",
  "On reporte cet écartement : pointe en O, on trace l'arc de l'autre côté.",
  "Le point A' apparaît à l'intersection de la demi-droite et de l'arc.",
  "O est bien le milieu de [AA'].",
];

function PaperAnimationDemo({ accent }: { accent: string }) {
  const { step, next, prev, replay } = useStepPlayer(PAPER_DEMO_STEPS.length);
  const A = PAPER_DEMO_A, O = PAPER_DEMO_O, Ap = PAPER_DEMO_APRIME;

  return (
    <div style={{ padding: 4 }}>
      <div style={{ maxWidth: 260, margin: '0 auto' }}>
        <DemoPaperCanvas>
          {step >= 1 && <DemoRay from={A} through={O} color="#f87171" />}
          {step >= 2 && step < 3 && (
            <circle cx={A.x} cy={A.y} r={distance(A, O)} stroke="#60A5FA" strokeWidth={1.6} strokeDasharray="4 3" fill="none" />
          )}
          {step >= 3 && <CompassCircle p1={O} p2={A} color="#60A5FA" />}
          {step >= 5 && <ConstructionLine p={A} o={O} color="var(--correct)" />}
          <SymCross cx={A.x} cy={A.y} letter="A" color="var(--text)" />
          <SymCross cx={O.x} cy={O.y} letter="O" color="var(--text)" />
          {step >= 4 && <SymCross cx={Ap.x} cy={Ap.y} letter="A'" color={step >= 5 ? 'var(--correct)' : accent} />}
        </DemoPaperCanvas>
      </div>
      <p style={{ textAlign: 'center', fontSize: 13, margin: '10px 0 0', minHeight: 36 }}>{PAPER_DEMO_STEPS[step]}</p>
      <PlayerControls step={step} numSteps={PAPER_DEMO_STEPS.length} onPrev={prev} onNext={next} onReplay={replay} />
    </div>
  );
}

// ── Hero (rappel illustré + animation) ──────────────────────────────────────────

function AnimPanel({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  if (show) return <>{children}</>;
  return (
    <div className="pv-anim-cta">
      <div style={{ fontSize: 46 }}>🎬</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
        Regarde la construction du symétrique d'un point, étape par étape.
      </div>
      <button
        type="button"
        className="pv-validate"
        onClick={() => setShow(true)}
        style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.pink})` }}
      >
        🎬 Voir l'animation
      </button>
    </div>
  );
}

const MILIEU_INTRO = (
  <>
    Une <strong>symétrie centrale</strong> fait tourner une figure autour d'un point en effectuant un <strong>demi-tour</strong>.
    Dire que M' est le symétrique de M par rapport à O signifie que O est le{' '}
    <strong style={{ color: C.orange }}>milieu du segment [MM']</strong>.
  </>
);

function QuadHero({ onBack }: { onBack: () => void }) {
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Symétrie centrale', color: C.sky }, { label: '⊞ Sur quadrillage', color: C.violet }]}
      title="Comment construire un symétrique sur quadrillage ?"
      intro={MILIEU_INTRO}
      steps={[
        { emoji: '👀', color: C.blue, text: <>Compte les carreaux pour aller du point jusqu'à <strong>O</strong> : à droite ou à gauche, puis en haut ou en bas.</> },
        { emoji: '🔁', color: C.orange, text: <>Refais <strong>exactement le même déplacement</strong> en partant de O, dans la même direction.</> },
        { emoji: '✅', color: C.green, text: <>Tu arrives sur le symétrique <strong>A'</strong> : O est bien le milieu de [AA'].</> },
      ]}
      videos={[{ url: 'https://www.youtube.com/watch?v=7Fsr3R6pLv8', label: 'Vidéo : construire un symétrique sur quadrillage' }]}
      illusTitle="🎬 Animation"
      illus={<AnimPanel><QuadAnimationDemo accent={C.sky} /></AnimPanel>}
    />
  );
}

function PaperHero({ onBack }: { onBack: () => void }) {
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Symétrie centrale', color: C.sky }, { label: '✎ Sans quadrillage', color: C.pink }]}
      title="Comment construire un symétrique sans quadrillage ?"
      intro={<>{MILIEU_INTRO} <span style={{ color: 'var(--muted)' }}>📐 Tu disposes d'une règle et d'un compas.</span></>}
      steps={[
        { emoji: '📏', color: C.rose, text: <>À la règle, trace la demi-droite <strong>[AO)</strong>.</> },
        { emoji: '🧭', color: C.blue, text: <>Au compas, mesure la longueur <strong>AO</strong> : pointe en A, mine en O.</> },
        { emoji: '✂️', color: C.green, text: <>Reporte cet écartement <strong>de l'autre côté de O</strong> : tu obtiens A', et O est le milieu de [AA'].</> },
      ]}
      videos={[{ url: 'https://www.youtube.com/playlist?list=PLVUDmbpupCaq2_WKgsP0xJM0gOI1ZY6xK', label: 'Vidéo : construire un symétrique sans quadrillage' }]}
      illusTitle="🎬 Animation"
      illus={<AnimPanel><PaperAnimationDemo accent={C.sky} /></AnimPanel>}
    />
  );
}

// ── Cartes d'exercice (communes aux deux sous-quiz) ─────────────────────────────

const LETTER_COLORS = [C.blue, C.orange, C.green, C.pink, C.violet] as const;

function themeFor(points: SymPoint[]): CardTheme {
  const n = points.length;
  if (n === 1) return { color: C.sky, icon: '📍', deco: '↻', tag: 'Échauffement', stars: 1, title: "Symétrique d'un point", short: 'Un point' };
  if (n === 2) return { color: C.orange, icon: '📏', deco: '↻', tag: 'Entraînement', stars: 2, title: "Symétrique d'un segment", short: 'Un segment' };
  return { color: C.violet, icon: '🔷', deco: '↻', tag: 'Défi', stars: 3, title: `Symétrique d'un polygone (${n} côtés)`, short: `Un polygone (${n} côtés)` };
}

function LetterPicker({ points, placements, selected, disabled, rowOk, onSelect }: {
  points: SymPoint[];
  placements: Record<string, { x: number; y: number } | null>;
  selected: string | null;
  disabled: boolean;
  rowOk: (p: SymPoint) => boolean;
  onSelect: (letter: string) => void;
}) {
  return (
    <div className="pv-letters">
      {points.map((p, i) => {
        const color = LETTER_COLORS[i % LETTER_COLORS.length]!;
        const placed = placements[p.letter] !== null;
        const isSel = selected === p.letter;
        let style: React.CSSProperties;
        if (disabled) {
          const ok = rowOk(p);
          style = ok
            ? { borderColor: 'var(--correct)', background: 'rgba(74,222,128,0.16)', color: 'var(--correct)' }
            : { borderColor: 'var(--wrong)', background: 'rgba(248,113,113,0.16)', color: 'var(--wrong)' };
        } else if (isSel) {
          style = { borderColor: color, background: `${color}33`, color, boxShadow: `0 8px 20px -12px ${color}` };
        } else {
          style = { borderColor: placed ? `${color}99` : 'var(--border2)', background: placed ? `${color}14` : 'var(--surface2)', color: 'var(--text)' };
        }
        return (
          <button key={p.letter} type="button" className="pv-letterbtn" disabled={disabled} onClick={() => onSelect(p.letter)} style={style}>
            {p.letter}'{placed && !disabled ? ' ✓' : ''}
          </button>
        );
      })}
    </div>
  );
}

function figureArticle(n: number): string {
  return n === 1 ? 'du point' : n === 2 ? 'du segment' : 'du polygone';
}

// ── Sous-quiz 1 : construction sur quadrillage ──────────────────────────────────

const GRID_MIN = -8;
const GRID_MAX = 8;
const GRID_SVG_SIZE = 340;
const GRID_MARGIN = 20;
const GRID_STEP = (GRID_SVG_SIZE - 2 * GRID_MARGIN) / (GRID_MAX - GRID_MIN);
const GRID_INTS = Array.from({ length: GRID_MAX - GRID_MIN + 1 }, (_, i) => GRID_MIN + i);

const gx = (x: number) => GRID_MARGIN + (x - GRID_MIN) * GRID_STEP;
const gy = (y: number) => GRID_SVG_SIZE - GRID_MARGIN - (y - GRID_MIN) * GRID_STEP;

function GridCanvas({ children, onGridClick }: { children?: React.ReactNode; onGridClick?: (x: number, y: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onGridClick || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * GRID_SVG_SIZE;
    const py = ((e.clientY - rect.top) / rect.height) * GRID_SVG_SIZE;
    const rawX = GRID_MIN + (px - GRID_MARGIN) / GRID_STEP;
    const rawY = GRID_MIN + (GRID_SVG_SIZE - GRID_MARGIN - py) / GRID_STEP;
    const x = clamp(Math.round(rawX), GRID_MIN, GRID_MAX);
    const y = clamp(Math.round(rawY), GRID_MIN, GRID_MAX);
    onGridClick(x, y);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${GRID_SVG_SIZE} ${GRID_SVG_SIZE}`}
      style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block', margin: '0 auto', cursor: onGridClick ? 'crosshair' : 'default' }}
      onClick={handleClick}
    >
      {GRID_INTS.map((i) => (
        <line key={`v${i}`} x1={gx(i)} y1={gy(GRID_MIN)} x2={gx(i)} y2={gy(GRID_MAX)} stroke="var(--border)" strokeWidth={1} />
      ))}
      {GRID_INTS.map((i) => (
        <line key={`h${i}`} x1={gx(GRID_MIN)} y1={gy(i)} x2={gx(GRID_MAX)} y2={gy(i)} stroke="var(--border)" strokeWidth={1} />
      ))}
      {children}
    </svg>
  );
}

interface SymPoint {
  letter: string;
  x: number;
  y: number;
}

interface SymQuadExercise {
  points: SymPoint[];
}

function generateQuadExercise(n: number): SymQuadExercise {
  const maxCoord = 7;
  if (n === 1) {
    let x = 0, y = 0;
    do { x = randInt(-maxCoord, maxCoord); y = randInt(-maxCoord, maxCoord); } while (x === 0 && y === 0);
    return { points: [{ letter: 'A', x, y }] };
  }
  let attempt = 0;
  while (true) {
    attempt++;
    let cx = 0, cy = 0;
    do { cx = randInt(-4, 4); cy = randInt(-4, 4); } while (Math.abs(cx) + Math.abs(cy) < 4);
    const offsets = pickRingOffsets(n);
    const pts = offsets.map(([ox, oy], i) => ({
      letter: LETTERS[i]!,
      x: clamp(cx + Math.round(ox * 3.2), -maxCoord, maxCoord),
      y: clamp(cy + Math.round(oy * 3.2), -maxCoord, maxCoord),
    }));
    const keys = new Set(pts.map((p) => `${p.x},${p.y}`));
    const noneAtOrigin = pts.every((p) => !(p.x === 0 && p.y === 0));
    if ((keys.size === n && noneAtOrigin) || attempt > 20) return { points: pts };
  }
}


function SymQuadQuestion({ index, exercise, answer, onSubmit }: {
  index: number;
  exercise: SymQuadExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const theme = themeFor(exercise.points);
  const color = theme.color;
  const [placements, setPlacements] = useState<Record<string, { x: number; y: number } | null>>(() =>
    Object.fromEntries(exercise.points.map((p) => [p.letter, null]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';

  const imageOf = (p: SymPoint) => ({ x: -p.x, y: -p.y });
  const rowOk = (p: SymPoint) => {
    const pl = placements[p.letter];
    if (!pl) return false;
    const img = imageOf(p);
    return pl.x === img.x && pl.y === img.y;
  };
  const allPlaced = exercise.points.every((p) => placements[p.letter] !== null);

  const selectLetter = (letter: string) => {
    if (disabled) return;
    setSelected((prev) => (prev === letter ? null : letter));
  };
  const placeAt = (x: number, y: number) => {
    if (disabled || !selected) return;
    setPlacements((prev) => ({ ...prev, [selected]: { x, y } }));
    setSelected(null);
  };
  const submit = () => {
    if (disabled) return;
    if (!allPlaced) { setTried(true); return; }
    onSubmit(exercise.points.every(rowOk));
  };

  const names = exercise.points.map((p) => p.letter).join('');

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={<Tip color={C.orange}>✋ Pas d'outils : compte les carreaux</Tip>}>
        Place le symétrique {figureArticle(exercise.points.length)} <strong>{names}</strong> par rapport au centre <strong>O</strong>.
      </Scene>
      <SectionLabel color={color}>1️⃣ Choisis une lettre, puis 2️⃣ clique sur le quadrillage</SectionLabel>
      <LetterPicker points={exercise.points} placements={placements} selected={selected} disabled={disabled} rowOk={rowOk} onSelect={selectLetter} />

      <div className="pv-canvas" style={{ borderColor: `${color}55` }}>
        <GridCanvas onGridClick={disabled ? undefined : placeAt}>
          <FigureOutline pts={exercise.points.map((p) => ({ cx: gx(p.x), cy: gy(p.y) }))} color="var(--text)" />
          {exercise.points.map((p) => (
            <SymCross key={p.letter} cx={gx(p.x)} cy={gy(p.y)} letter={p.letter} color="var(--text)" />
          ))}
          <SymCross cx={gx(0)} cy={gy(0)} letter="O" color={C.orange} />
          <FigureOutline
            pts={exercise.points.filter((p) => placements[p.letter] !== null).map((p) => {
              const pl = placements[p.letter]!;
              return { cx: gx(pl.x), cy: gy(pl.y) };
            })}
            color={disabled ? 'var(--muted)' : color}
          />
          {exercise.points.map((p) => {
            const pl = placements[p.letter];
            if (!pl) return null;
            const c = disabled ? (rowOk(p) ? 'var(--correct)' : 'var(--wrong)') : selected === p.letter ? color : 'var(--text)';
            return <SymCross key={`img-${p.letter}`} cx={gx(pl.x)} cy={gy(pl.y)} letter={`${p.letter}'`} color={c} />;
          })}
        </GridCanvas>
      </div>

      <div style={{ height: 14 }} />
      <CardFooter
        disabled={disabled} status={answer.status} color={color} onValidate={submit} showMissing={tried && !allPlaced}
        missingText="Place d'abord tous les points."
        failText="Un ou plusieurs points sont mal placés. Ouvre la correction."
      />
      <CorrectionFrame color={color}>
        <div>Pour chaque point, on compte les carreaux jusqu'à O puis on refait le même déplacement : O est le milieu de chaque segment [MM'].</div>
        <div style={{ maxWidth: 300, width: '100%', margin: '0 auto' }}>
          <GridCanvas>
            <FigureOutline pts={exercise.points.map((p) => ({ cx: gx(p.x), cy: gy(p.y) }))} color="var(--text)" />
            {exercise.points.map((p) => (
              <SymCross key={p.letter} cx={gx(p.x)} cy={gy(p.y)} letter={p.letter} color="var(--text)" />
            ))}
            <SymCross cx={gx(0)} cy={gy(0)} letter="O" color={C.orange} />
            <FigureOutline pts={exercise.points.map((p) => ({ cx: gx(-p.x), cy: gy(-p.y) }))} color="var(--correct)" />
            {exercise.points.map((p) => (
              <SymCross key={`c-${p.letter}`} cx={gx(-p.x)} cy={gy(-p.y)} letter={`${p.letter}'`} color="var(--correct)" />
            ))}
          </GridCanvas>
        </div>
      </CorrectionFrame>
    </CardShell>
  );
}

// ── Sous-quiz 2 : construction sans quadrillage ─────────────────────────────────

const PAPER_SIZE = 420;
const PAPER_MARGIN = 45;
const PAPER_TOLERANCE = 20;

interface SymPaperExercise {
  centerO: { x: number; y: number };
  points: SymPoint[];
}

function generatePaperExercise(n: number): SymPaperExercise {
  const dirAngle = randFloat(0, 2 * Math.PI);
  const centroidDist = randFloat(70, 90);
  const radius = n === 1 ? 0 : randFloat(32, 42);
  const maxExtent = centroidDist + radius;
  const lo = PAPER_MARGIN + maxExtent + 5;
  const hi = PAPER_SIZE - PAPER_MARGIN - maxExtent - 5;
  const O = { x: randFloat(lo, hi), y: randFloat(lo, hi) };
  const centroid = { x: O.x + centroidDist * Math.cos(dirAngle), y: O.y + centroidDist * Math.sin(dirAngle) };

  const offsets = pickRingOffsets(n);
  const points = offsets.map(([ox, oy], i) => ({
    letter: LETTERS[i]!,
    x: centroid.x + ox * radius,
    y: centroid.y + oy * radius,
  }));
  return { centerO: O, points };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function PaperCanvas({ children, onCanvasClick }: { children?: React.ReactNode; onCanvasClick?: (x: number, y: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onCanvasClick || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * PAPER_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * PAPER_SIZE;
    onCanvasClick(x, y);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${PAPER_SIZE} ${PAPER_SIZE}`}
      style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block', margin: '0 auto', cursor: onCanvasClick ? 'crosshair' : 'default', background: 'var(--surface)', borderRadius: 8, overflow: 'hidden' }}
      onClick={handleClick}
    >
      {children}
    </svg>
  );
}

type ToolType = 'ruler' | 'compass';

interface ToolMark {
  type: ToolType;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
}

/** A straight line through p1 and p2, extended across the whole canvas (simulating a ruler laid through two points). */
function RulerLine({ p1, p2, color }: { p1: { x: number; y: number }; p2: { x: number; y: number }; color: string }) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const t = PAPER_SIZE * 2;
  return <line x1={p1.x - ux * t} y1={p1.y - uy * t} x2={p1.x + ux * t} y2={p1.y + uy * t} stroke={color} strokeWidth={1.3} />;
}

/** A circle centered at p1 with radius = distance(p1, p2) (simulating a compass set to the length p1–p2). */
function CompassCircle({ p1, p2, color }: { p1: { x: number; y: number }; p2: { x: number; y: number }; color: string }) {
  const r = distance(p1, p2);
  return <circle cx={p1.x} cy={p1.y} r={r} stroke={color} strokeWidth={1.3} fill="none" />;
}

function ConstructionLine({ p, o, color }: { p: { x: number; y: number }; o: { x: number; y: number }; color: string }) {
  const img = { x: 2 * o.x - p.x, y: 2 * o.y - p.y };
  const angle = Math.atan2(o.y - p.y, o.x - p.x);
  const perp = angle + Math.PI / 2;
  const tl = 5;
  const dx = Math.cos(perp) * tl, dy = Math.sin(perp) * tl;
  const mid1 = { x: (p.x + o.x) / 2, y: (p.y + o.y) / 2 };
  const mid2 = { x: (o.x + img.x) / 2, y: (o.y + img.y) / 2 };
  return (
    <g>
      <line x1={p.x} y1={p.y} x2={img.x} y2={img.y} stroke={color} strokeWidth={1} strokeDasharray="4 3" />
      <line x1={mid1.x - dx} y1={mid1.y - dy} x2={mid1.x + dx} y2={mid1.y + dy} stroke={color} strokeWidth={1.5} />
      <line x1={mid2.x - dx} y1={mid2.y - dy} x2={mid2.x + dx} y2={mid2.y + dy} stroke={color} strokeWidth={1.5} />
    </g>
  );
}

function SymPaperQuestion({ index, exercise, answer, onSubmit }: {
  index: number;
  exercise: SymPaperExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const theme = themeFor(exercise.points);
  const color = theme.color;
  const [placements, setPlacements] = useState<Record<string, { x: number; y: number } | null>>(() =>
    Object.fromEntries(exercise.points.map((p) => [p.letter, null]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [pendingAnchor, setPendingAnchor] = useState<{ x: number; y: number } | null>(null);
  const [toolMarks, setToolMarks] = useState<ToolMark[]>([]);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';

  const imageOf = (p: SymPoint) => ({ x: 2 * exercise.centerO.x - p.x, y: 2 * exercise.centerO.y - p.y });
  const rowOk = (p: SymPoint) => {
    const pl = placements[p.letter];
    if (!pl) return false;
    return distance(pl, imageOf(p)) < PAPER_TOLERANCE;
  };
  const allPlaced = exercise.points.every((p) => placements[p.letter] !== null);

  const SNAP_RADIUS = 20;
  const snapTargets = (): { x: number; y: number }[] => {
    const pts = [...exercise.points.map((p) => ({ x: p.x, y: p.y })), exercise.centerO];
    for (const p of exercise.points) {
      const pl = placements[p.letter];
      if (pl) pts.push(pl);
    }
    return pts;
  };
  const nearestSnap = (x: number, y: number): { x: number; y: number } | null => {
    let best: { x: number; y: number } | null = null;
    let bestD = SNAP_RADIUS;
    for (const t of snapTargets()) {
      const d = distance(t, { x, y });
      if (d < bestD) { bestD = d; best = t; }
    }
    return best;
  };

  const selectLetter = (letter: string) => {
    if (disabled) return;
    setActiveTool(null);
    setPendingAnchor(null);
    setSelected((prev) => (prev === letter ? null : letter));
  };
  const selectTool = (tool: ToolType) => {
    if (disabled) return;
    setSelected(null);
    setPendingAnchor(null);
    setActiveTool((prev) => (prev === tool ? null : tool));
  };
  const clearToolMarks = () => {
    setToolMarks([]);
    setPendingAnchor(null);
  };
  const placeAt = (x: number, y: number) => {
    if (disabled || !selected) return;
    setPlacements((prev) => ({ ...prev, [selected]: { x, y } }));
    setSelected(null);
  };
  const handleCanvasClick = (x: number, y: number) => {
    if (disabled) return;
    if (activeTool) {
      const snapped = nearestSnap(x, y);
      if (!snapped) return;
      if (!pendingAnchor) {
        setPendingAnchor(snapped);
      } else {
        setToolMarks((prev) => [...prev, { type: activeTool, p1: pendingAnchor, p2: snapped }]);
        setPendingAnchor(null);
      }
      return;
    }
    placeAt(x, y);
  };
  const submit = () => {
    if (disabled) return;
    if (!allPlaced) { setTried(true); return; }
    onSubmit(exercise.points.every(rowOk));
  };

  const names = exercise.points.map((p) => p.letter).join('');

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={<Tip color={C.orange}>📐 Règle et compas à disposition</Tip>}>
        Place le symétrique {figureArticle(exercise.points.length)} <strong>{names}</strong> par rapport au centre <strong>O</strong>.
        Construis d'abord avec les outils, puis place chaque point.
      </Scene>

      {!disabled && (
        <>
          <SectionLabel color={color}>🧰 Tes outils</SectionLabel>
          <div className="pv-toolbar">
            {([
              { tool: 'ruler' as const, label: '📏 Règle', c: C.rose },
              { tool: 'compass' as const, label: '🧭 Compas', c: C.blue },
            ]).map(({ tool, label, c }) => {
              const isSel = activeTool === tool;
              return (
                <button
                  key={tool}
                  type="button"
                  className="pv-letterbtn"
                  onClick={() => selectTool(tool)}
                  style={isSel
                    ? { borderColor: c, background: `${c}33`, color: c, boxShadow: `0 8px 20px -12px ${c}` }
                    : { borderColor: 'var(--border2)', background: 'var(--surface2)', color: 'var(--text)' }}
                >
                  {label}
                </button>
              );
            })}
            <button type="button" onClick={clearToolMarks} className="btn-secondary" style={{ padding: '8px 14px', fontSize: 12, borderRadius: 14 }}>
              🧹 Effacer les tracés
            </button>
          </div>
          {activeTool && (
            <p className="pv-hint">
              {activeTool === 'ruler'
                ? (pendingAnchor ? 'Clique un second point déjà tracé pour tirer la droite.' : 'Clique un premier point déjà tracé (ex. A ou O).')
                : (pendingAnchor ? "Clique le point qui donne le rayon (ex. A), puis l'arc se trace." : 'Clique le centre du compas (ex. O).')}
            </p>
          )}
        </>
      )}

      <SectionLabel color={color}>1️⃣ Choisis une lettre, puis 2️⃣ clique sur la feuille</SectionLabel>
      <LetterPicker points={exercise.points} placements={placements} selected={selected} disabled={disabled} rowOk={rowOk} onSelect={selectLetter} />

      <div className="pv-canvas" style={{ borderColor: `${color}55` }}>
        <PaperCanvas onCanvasClick={disabled ? undefined : handleCanvasClick}>
          {toolMarks.map((m, i) =>
            m.type === 'ruler'
              ? <RulerLine key={i} p1={m.p1} p2={m.p2} color="#f87171" />
              : <CompassCircle key={i} p1={m.p1} p2={m.p2} color="#60A5FA" />
          )}
          {pendingAnchor && <circle cx={pendingAnchor.x} cy={pendingAnchor.y} r={4} fill="none" stroke={color} strokeWidth={1.5} />}
          <FigureOutline pts={exercise.points.map((p) => ({ cx: p.x, cy: p.y }))} color="var(--text)" />
          {exercise.points.map((p) => (
            <SymCross key={p.letter} cx={p.x} cy={p.y} letter={p.letter} color="var(--text)" />
          ))}
          <SymCross cx={exercise.centerO.x} cy={exercise.centerO.y} letter="O" color={C.orange} />
          <FigureOutline
            pts={exercise.points.filter((p) => placements[p.letter] !== null).map((p) => { const pl = placements[p.letter]!; return { cx: pl.x, cy: pl.y }; })}
            color={disabled ? 'var(--muted)' : color}
          />
          {exercise.points.map((p) => {
            const pl = placements[p.letter];
            if (!pl) return null;
            const c = disabled ? (rowOk(p) ? 'var(--correct)' : 'var(--wrong)') : selected === p.letter ? color : 'var(--text)';
            return <SymCross key={`img-${p.letter}`} cx={pl.x} cy={pl.y} letter={`${p.letter}'`} color={c} />;
          })}
        </PaperCanvas>
      </div>

      <div style={{ height: 14 }} />
      <CardFooter
        disabled={disabled} status={answer.status} color={color} onValidate={submit} showMissing={tried && !allPlaced}
        missingText="Place d'abord tous les points."
        failText="Un ou plusieurs points sont mal placés. Ouvre la correction."
      />
      <CorrectionFrame color={color}>
        <div>Pour chaque point P : demi-droite [PO), puis on reporte la longueur PO de l'autre côté de O. O est le milieu de chaque segment [PP'].</div>
        <div style={{ maxWidth: 300, width: '100%', margin: '0 auto' }}>
          <PaperCanvas>
            {exercise.points.map((p) => (
              <ConstructionLine key={`cl-${p.letter}`} p={p} o={exercise.centerO} color="#f87171" />
            ))}
            <FigureOutline pts={exercise.points.map((p) => ({ cx: p.x, cy: p.y }))} color="var(--text)" />
            {exercise.points.map((p) => (
              <SymCross key={p.letter} cx={p.x} cy={p.y} letter={p.letter} color="var(--text)" />
            ))}
            <SymCross cx={exercise.centerO.x} cy={exercise.centerO.y} letter="O" color={C.orange} />
            <FigureOutline pts={exercise.points.map((p) => { const img = imageOf(p); return { cx: img.x, cy: img.y }; })} color="var(--correct)" />
            {exercise.points.map((p) => {
              const img = imageOf(p);
              return <SymCross key={`c-${p.letter}`} cx={img.x} cy={img.y} letter={`${p.letter}'`} color="var(--correct)" />;
            })}
          </PaperCanvas>
        </div>
      </CorrectionFrame>
    </CardShell>
  );
}

// ── SymetrieCentraleHub (main export) ───────────────────────────────────────────

type SymExercise =
  | { exKind: 'quad'; data: SymQuadExercise }
  | { exKind: 'paper'; data: SymPaperExercise };

function buildExercises(mode: Exclude<HubMode, null>): SymExercise[] {
  const polySides = randInt(3, 5);
  if (mode === 'quadrillage') {
    return [
      { exKind: 'quad', data: generateQuadExercise(1) },
      { exKind: 'quad', data: generateQuadExercise(2) },
      { exKind: 'quad', data: generateQuadExercise(polySides) },
    ];
  }
  return [
    { exKind: 'paper', data: generatePaperExercise(1) },
    { exKind: 'paper', data: generatePaperExercise(2) },
    { exKind: 'paper', data: generatePaperExercise(polySides) },
  ];
}

const MODES: { id: Exclude<HubMode, null>; label: string; icon: string; desc: string }[] = [
  {
    id: 'quadrillage',
    label: 'Construction sur quadrillage',
    icon: '⊞',
    desc: '3 exercices · point, segment, polygone — sans outils, en comptant les carreaux',
  },
  {
    id: 'papier',
    label: 'Construction sans quadrillage',
    icon: '✎',
    desc: '3 exercices · point, segment, polygone — avec règle et compas',
  },
];

export function SymetrieCentraleHub({ accent }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode>(null);

  if (mode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {MODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => setMode(m.id)} />
        ))}
      </div>
    );
  }

  const back = () => {
    setMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <VividPage<SymExercise>
      key={mode}
      accent={accent}
      hero={mode === 'quadrillage' ? <QuadHero onBack={back} /> : <PaperHero onBack={back} />}
      tip={{
        emoji: '🧠', title: 'Le savais-tu ?',
        text: <>Un point, son symétrique et le centre sont toujours <strong>alignés</strong>, et O est au <strong>milieu</strong>. Tu peux vérifier ta réponse avec ça !</>,
      }}
      build={() => buildExercises(mode)}
      themeFor={(ex) => themeFor(ex.data.points)}
      renderCard={(ex, i, p) =>
        ex.exKind === 'quad'
          ? <SymQuadQuestion index={i} exercise={ex.data} {...p} />
          : <SymPaperQuestion index={i} exercise={ex.data} {...p} />}
    />
  );
}
