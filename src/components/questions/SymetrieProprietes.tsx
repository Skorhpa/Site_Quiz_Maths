import { useState } from 'react';
import { checkQuotient, fmtNum } from './ProportionnaliteHub';
import {
  AnswerRow, C, CardFooter, CardShell, CorrectionFrame, Inp, Scene, SectionLabel, Tip, VividHero,
  isBlank, useStringArray,
  type AnswerState, type CardTheme,
} from './ProportionnaliteVividKit';
import {
  FIG_H, FIG_W, fmtCm, fmtDeg,
  type AskedSet, type DndExercise, type FillExercise, type Pt, type PropFigure,
} from './symetrieProprietesData';

/**
 * 5ème · Symétrie centrale · « Propriétés » — recall, figure, "put the proof in order" exercise (drag and drop)
 * and fill-in-the-blanks exercise.
 */

// ── Angle notation: a hat above the three letters ─────────────────────────────

/** Renders `∠ABC` / `∠A'B'C'` found in `text` with a hat above the three letters. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(∠(?:[A-E]'?){3})/g);
  return (
    <>
      {parts.map((p, i) => (p.startsWith('∠')
        ? <span key={i} className="pv-hat">{p.slice(1)}</span>
        : <span key={i}>{p}</span>))}
    </>
  );
}

// ── Figure (original + image) ─────────────────────────────────────────────────

const mean = (pts: Pt[]): Pt => ({ x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length });

function toward(p: Pt, target: Pt, d: number): Pt {
  const dx = target.x - p.x, dy = target.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / len) * d, y: p.y + (dy / len) * d };
}

type LabelMode = 'ask' | 'full';

const SIDE_COLOR = C.green;
const ANGLE_COLOR = C.orange;
const AREA_COLOR = C.violet;

/** Text with a background-coloured halo so it stays readable over lines and fills. */
function HaloText({ x, y, children, color, size = 15, anchor = 'middle' }: {
  x: number; y: number; children: React.ReactNode; color: string; size?: number; anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={700} fill={color} fontFamily="'DM Mono', monospace"
      stroke="var(--bg)" strokeWidth={5} strokeLinejoin="round" paintOrder="stroke"
    >
      {children}
    </text>
  );
}

function PolyGroup({ fig, poly, image, asked, mode, color, tint }: {
  fig: PropFigure;
  poly: Pt[];
  image: boolean;
  asked: AskedSet;
  mode: LabelMode;
  color: string;
  tint: string;
}) {
  const n = poly.length;
  const center = mean(poly);
  const d = poly.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
  // The original always shows its values; the image shows "?" in the exercise and the answers in the correction.
  const showValue = !image || mode === 'full';

  return (
    <g>
      <path d={d} fill={tint} stroke={color} strokeWidth={2.4} strokeLinejoin="round" />

      {asked.sides.map((i) => {
        const a = poly[i]!, b = poly[(i + 1) % n]!;
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const lp = toward(mid, center, -20);
        return (
          <g key={`s${i}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={SIDE_COLOR} strokeWidth={5} strokeLinecap="round" />
            <HaloText x={lp.x} y={lp.y + (showValue ? 5 : 7)} color={SIDE_COLOR} size={showValue ? 15 : 22}>{showValue ? fmtCm(fig.sides[i]!) : '?'}</HaloText>
          </g>
        );
      })}

      {asked.angles.map((i) => {
        const p = poly[i]!, prev = poly[(i + n - 1) % n]!, next = poly[(i + 1) % n]!;
        const u1 = toward(p, prev, 1), u2 = toward(p, next, 1);
        const v1 = { x: u1.x - p.x, y: u1.y - p.y }, v2 = { x: u2.x - p.x, y: u2.y - p.y };
        const r = 26;
        const s = v1.x * v2.y - v1.y * v2.x > 0 ? 1 : 0;
        const a1 = { x: p.x + v1.x * r, y: p.y + v1.y * r }, a2 = { x: p.x + v2.x * r, y: p.y + v2.y * r };
        const bis = { x: v1.x + v2.x, y: v1.y + v2.y };
        const bl = Math.hypot(bis.x, bis.y) || 1;
        const lp = { x: p.x + (bis.x / bl) * 50, y: p.y + (bis.y / bl) * 50 };
        return (
          <g key={`a${i}`}>
            <path d={`M${p.x},${p.y} L${a1.x},${a1.y} A${r},${r} 0 0 ${s} ${a2.x},${a2.y} Z`} fill={`${ANGLE_COLOR}44`} stroke={ANGLE_COLOR} strokeWidth={2.2} />
            <circle cx={p.x} cy={p.y} r={3.2} fill={ANGLE_COLOR} />
            <HaloText x={lp.x} y={lp.y + (showValue ? 5 : 7)} color={ANGLE_COLOR} size={showValue ? 15 : 22}>{showValue ? fmtDeg(fig.angles[i]!) : '?'}</HaloText>
          </g>
        );
      })}

      {poly.map((p, i) => {
        const lp = toward(p, center, -17);
        return (
          <HaloText key={`v${i}`} x={lp.x} y={lp.y + 6} color={color} size={18}>
            {fig.names[i]}{image ? "'" : ''}
          </HaloText>
        );
      })}
    </g>
  );
}

export function PropFigureSvg({ fig, asked, mode }: { fig: PropFigure; asked: AskedSet; mode: LabelMode }) {
  const { O } = fig;
  return (
    <svg viewBox={`0 0 ${FIG_W} ${FIG_H}`} style={{ width: '100%', maxWidth: FIG_W, height: 'auto', display: 'block', margin: '0 auto' }} role="img"
      aria-label="Une figure et son symétrique par rapport au point O">
      {fig.orig.map((p, i) => (
        <line key={`g${i}`} x1={p.x} y1={p.y} x2={fig.img[i]!.x} y2={fig.img[i]!.y} stroke="var(--border2)" strokeWidth={1} strokeDasharray="4 4" />
      ))}
      <PolyGroup fig={fig} poly={fig.orig} image={false} asked={asked} mode={mode} color={C.sky} tint={`${C.sky}22`} />
      <PolyGroup fig={fig} poly={fig.img} image asked={asked} mode={mode} color={C.pink} tint={`${C.pink}22`} />
      <g>
        <line x1={O.x - 7} y1={O.y - 7} x2={O.x + 7} y2={O.y + 7} stroke={C.orange} strokeWidth={2.8} />
        <line x1={O.x - 7} y1={O.y + 7} x2={O.x + 7} y2={O.y - 7} stroke={C.orange} strokeWidth={2.8} />
        <HaloText x={O.x + 14} y={O.y - 9} color={C.orange} size={17} anchor="start">O</HaloText>
      </g>
      {asked.area && (
        <>
          <HaloText x={14} y={FIG_H - 12} color={AREA_COLOR} anchor="start">{`Aire = ${fmtNum(fig.areaCm)} cm²`}</HaloText>
          <HaloText x={FIG_W - 14} y={FIG_H - 12} color={AREA_COLOR} anchor="end">{mode === 'full' ? `Aire = ${fmtNum(fig.areaCm)} cm²` : 'Aire = ?'}</HaloText>
        </>
      )}
    </svg>
  );
}

// ── Hero (rappel) ─────────────────────────────────────────────────────────────

function HeroIllus() {
  // A triangle ABC and its image through O, plus the equalities that hold.
  const O = { x: 150, y: 86 };
  const tri = [{ x: 42, y: 30 }, { x: 108, y: 62 }, { x: 56, y: 124 }];
  const img = tri.map((p) => ({ x: 2 * O.x - p.x, y: 2 * O.y - p.y }));
  const poly = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
  const names = ['A', 'B', 'C'];
  return (
    <div>
      <svg viewBox="0 0 300 172" width="100%" role="img" aria-label="Un triangle et son symétrique par rapport à O">
        {tri.map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={img[i]!.x} y2={img[i]!.y} stroke="var(--border2)" strokeWidth={1} strokeDasharray="4 4" />
        ))}
        <path d={poly(tri)} fill={`${C.sky}22`} stroke={C.sky} strokeWidth={2} strokeLinejoin="round" />
        <path d={poly(img)} fill={`${C.pink}22`} stroke={C.pink} strokeWidth={2} strokeLinejoin="round" />
        {tri.map((p, i) => (
          <text key={`l${i}`} x={p.x + (i === 0 ? -10 : i === 1 ? 12 : -12)} y={p.y + (i === 2 ? 14 : 2)} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.sky} fontFamily="'DM Mono', monospace">{names[i]}</text>
        ))}
        {img.map((p, i) => (
          <text key={`i${i}`} x={p.x + (i === 0 ? 12 : i === 1 ? -14 : 14)} y={p.y + (i === 0 ? 2 : i === 1 ? 2 : -4)} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.pink} fontFamily="'DM Mono', monospace">{names[i]}'</text>
        ))}
        <line x1={O.x - 5} y1={O.y - 5} x2={O.x + 5} y2={O.y + 5} stroke={C.orange} strokeWidth={2.2} />
        <line x1={O.x - 5} y1={O.y + 5} x2={O.x + 5} y2={O.y - 5} stroke={C.orange} strokeWidth={2.2} />
        <text x={O.x + 8} y={O.y - 7} fontSize={13} fontWeight={700} fill={C.orange} fontFamily="'DM Mono', monospace">O</text>
      </svg>
      <div className="pv-ex-list" style={{ gap: 6 }}>
        {[
          { t: "AB = A'B'", n: 'longueurs', c: C.green },
          { t: "∠ABC = ∠A'B'C'", n: 'angles', c: C.orange },
          { t: "Aire(ABC) = Aire(A'B'C')", n: 'aires', c: C.violet },
        ].map((r) => (
          <div key={r.t} className="pv-flow-row" style={{ borderColor: `${r.c}55`, background: `${r.c}14` }}>
            <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}><Rich text={r.t} /></strong>
            <span className="pv-flow-note" style={{ color: r.c }}>{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProprietesHero({ onBack }: { onBack: () => void }) {
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Symétrie centrale', color: C.sky }, { label: '⚖️ Propriétés', color: C.orange }]}
      title="Qu'est-ce que la symétrie centrale conserve ?"
      intro={
        <>
          La symétrie centrale <strong style={{ color: C.orange }}>conserve</strong> les longueurs, les angles, les aires… Regarde une
          figure et son symétrique : ce qui ne change pas, c'est ce qui est <strong>conservé</strong>.
        </>
      }
      steps={[
        { emoji: '📐', color: C.rose, title: 'Droites', text: <>Deux droites symétriques sont <strong>parallèles</strong>.</> },
        { emoji: '➖', color: C.pink, title: 'Alignement', text: <>Les symétriques de points <strong>alignés</strong> sont des points alignés.</> },
        { emoji: '📏', color: C.green, title: 'Segments', text: <>Deux segments symétriques sont <strong>parallèles</strong> et de <strong>même longueur</strong>.</> },
        { emoji: '⭕', color: C.blue, title: 'Cercles', text: <>Deux cercles symétriques ont le <strong>même rayon</strong>, et leurs centres sont symétriques.</> },
        { emoji: '∠', color: C.orange, title: 'Angles', text: <>Deux angles symétriques ont la <strong>même mesure</strong>.</> },
        { emoji: '⬛', color: C.violet, title: 'Aires', text: <>Deux figures symétriques ont la <strong>même aire</strong>.</> },
      ]}
      videos={[
        { url: 'https://youtu.be/B3xlAAp10ww', label: 'Vidéo : propriétés de la symétrie centrale (1)' },
        { url: 'https://youtu.be/zEWQwYUMXZc', label: 'Vidéo : propriétés de la symétrie centrale (2)' },
      ]}
      localVideo={{
        src: "/videos/proprietes-symetrie-centrale.mp4",
        poster: "/videos/proprietes-symetrie-centrale.jpg",
        title: "Vidéo : les propriétés de la symétrie centrale — longueurs, parallélisme, alignement, angles, aires, cercles (sous-titrée)",
      }}
      illusTitle="✨ Ce qui est conservé"
      illus={<HeroIllus />}
    />
  );
}

// ── Exercise 1 : remettre le raisonnement dans l'ordre (glisser-déposer) ──────

export function DndCard({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: DndExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const allSlots = exercise.blocks.flatMap((b) => b.slots);
  const [placed, setPlaced] = useState<Record<string, string | null>>(() => Object.fromEntries(allSlots.map((s) => [s.id, null])));
  const [selected, setSelected] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const chipById = (id: string) => exercise.chips.find((c) => c.id === id)!;
  const used = new Set(Object.values(placed).filter((v): v is string => v !== null));
  const allFilled = allSlots.every((s) => placed[s.id] !== null);
  const slotOk = (slotId: string) => {
    const slot = allSlots.find((s) => s.id === slotId)!;
    const chipId = placed[slotId];
    return chipId !== null && chipById(chipId!).label === slot.expected;
  };

  const place = (chipId: string, slotId: string) => {
    if (disabled) return;
    setPlaced((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) if (next[k] === chipId) next[k] = null;
      next[slotId] = chipId;
      return next;
    });
    setSelected(null);
  };
  const unplace = (chipId: string) => {
    if (disabled) return;
    setPlaced((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v === chipId ? null : v])));
    setSelected(null);
  };
  const onSlotClick = (slotId: string) => {
    if (disabled) return;
    if (selected) place(selected, slotId);
    else if (placed[slotId]) unplace(placed[slotId]!);
  };

  const submit = () => {
    if (disabled) return;
    if (!allFilled) { setTried(true); return; }
    onSubmit(allSlots.every((s) => slotOk(s.id)));
  };

  const bank = exercise.chips.filter((c) => !used.has(c.id));
  const blockColors = [SIDE_COLOR, ANGLE_COLOR];

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={<Tip color={C.blue}>🖱️ Glisse une phrase dans une case (ou touche la phrase, puis la case)</Tip>}>
        La figure rose est la <strong>symétrique</strong> de la figure bleue par rapport au point <strong>O</strong>. Pour chaque
        question, remets les phrases du raisonnement <strong>dans l'ordre</strong> : « Je sais que… », « Or… », « Donc… ».
      </Scene>

      <div className="pv-canvas" style={{ borderColor: `${theme.color}55`, marginBottom: 14 }}>
        <PropFigureSvg fig={exercise.fig} asked={exercise.asked} mode="ask" />
      </div>

      {exercise.blocks.map((b, bi) => {
        const color = blockColors[bi % blockColors.length]!;
        return (
          <div key={b.id} style={{ marginBottom: 14 }}>
            <SectionLabel color={color}>{bi === 0 ? '📏' : '∠'} <Rich text={b.title} /></SectionLabel>
            <div className="pv-calcs" style={{ marginBottom: 0 }}>
              {b.slots.map((s, si) => {
                const chipId = placed[s.id];
                const st = disabled ? slotOk(s.id) : null;
                return (
                  <AnswerRow key={s.id} color={color} letter={String(si + 1)} status={st}>
                    <span
                      className={`pv-slot wide${chipId ? ' filled' : ''}${selected && !disabled ? ' ready' : ''}`}
                      onClick={() => onSlotClick(s.id)}
                      onDragOver={(e) => { if (!disabled) e.preventDefault(); }}
                      onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) place(id, s.id); }}
                      role="button"
                      aria-label={`Étape ${si + 1} : ${b.title}`}
                      style={st === null ? undefined : { borderColor: st ? 'var(--correct)' : 'var(--wrong)' }}
                    >
                      {chipId
                        ? <span className="pv-chip wide placed"><Rich text={chipById(chipId).label} /></span>
                        : <span className="pv-slot-hint">{['Je sais que…', 'Or…', 'Donc…'][si]}</span>}
                    </span>
                  </AnswerRow>
                );
              })}
            </div>
          </div>
        );
      })}

      {!disabled && (
        <>
          <SectionLabel color={theme.color}>🧲 Les phrases à placer</SectionLabel>
          <div
            className="pv-bank"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) unplace(id); }}
          >
            {bank.length === 0 && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Toutes les phrases sont placées.</span>}
            {bank.map((c) => (
              <span
                key={c.id}
                className={`pv-chip wide${selected === c.id ? ' selected' : ''}`}
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('text/plain', c.id); e.dataTransfer.effectAllowed = 'move'; }}
                onClick={() => setSelected((prev) => (prev === c.id ? null : c.id))}
                role="button"
              >
                <Rich text={c.label} />
              </span>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 14 }} />
      <CardFooter
        disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && !allFilled}
        missingText="Remplis toutes les cases."
        failText="Certaines phrases ne sont pas à la bonne place. Ouvre la correction."
      />
      <CorrectionFrame color={theme.color}>
        <div style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
          <PropFigureSvg fig={exercise.fig} asked={exercise.asked} mode="full" />
        </div>
        {exercise.blocks.map((b, bi) => (
          <div key={b.id}>
            <div style={{ fontWeight: 700, color: blockColors[bi % blockColors.length], marginBottom: 6 }}><Rich text={b.title} /></div>
            {b.slots.map((s, si) => (
              <div key={s.id} className="pv-corr-step" style={{ marginBottom: 4 }}>
                <span className="pv-step-dot" style={{ background: blockColors[bi % blockColors.length] }}>{si + 1}</span>
                <div style={{ flex: 1 }}><Rich text={s.expected} /></div>
              </div>
            ))}
          </div>
        ))}
      </CorrectionFrame>
    </CardShell>
  );
}

// ── Exercise 2 : texte à trous ────────────────────────────────────────────────

const NO_CHOICE = '';

export function FillCard({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: FillExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVal] = useStringArray(exercise.lines.length);
  const [opts, setOpts] = useState<string[]>(() => exercise.lines.map(() => NO_CHOICE));
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const lineOk = (i: number) => checkQuotient(vals[i]!, exercise.lines[i]!.expected) && opts[i] === exercise.lines[i]!.expectedOption;
  const missing = vals.some(isBlank) || opts.some((o) => o === NO_CHOICE);
  const colors = [SIDE_COLOR, ANGLE_COLOR, AREA_COLOR];

  const submit = () => {
    if (disabled) return;
    if (missing) { setTried(true); return; }
    onSubmit(exercise.lines.every((_, i) => lineOk(i)));
  };

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={<Tip color={C.blue}>✍️ Écris la mesure, puis choisis la bonne propriété</Tip>}>
        La figure rose est la <strong>symétrique</strong> de la figure bleue par rapport au point <strong>O</strong>. Complète les phrases.
      </Scene>

      <div className="pv-canvas" style={{ borderColor: `${theme.color}55`, marginBottom: 14 }}>
        <PropFigureSvg fig={exercise.fig} asked={exercise.asked} mode="ask" />
      </div>

      <SectionLabel color={theme.color}>✏️ Complète le texte</SectionLabel>
      <div className="pv-calcs">
        {exercise.lines.map((l, i) => {
          const color = colors[i % colors.length]!;
          return (
            <AnswerRow key={i} color={color} letter={String.fromCharCode(97 + i)} status={disabled ? lineOk(i) : null}>
              <span className="pv-sentence">
                <Rich text={l.premise} />{' '}
                <Inp value={vals[i]!} onChange={(v) => setVal(i, v)} disabled={disabled} color={color} label={`Valeur ${i + 1}`} />{' '}
                <span className="pv-unit">{l.unit}</span>{' '}
                {l.because}{' '}
                <select
                  className="pv-select"
                  value={opts[i]}
                  disabled={disabled}
                  aria-label={`Propriété ${i + 1}`}
                  onChange={(e) => setOpts((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
                  style={{ '--pv-c': color } as React.CSSProperties}
                >
                  <option value={NO_CHOICE}>— choisis —</option>
                  {l.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                .
              </span>
            </AnswerRow>
          );
        })}
      </div>

      <CardFooter
        disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && missing}
        missingText="Complète toutes les mesures et choisis chaque propriété."
        failText="Une ou plusieurs réponses sont incorrectes. Ouvre la correction."
      />
      <CorrectionFrame color={theme.color}>
        <div style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
          <PropFigureSvg fig={exercise.fig} asked={exercise.asked} mode="full" />
        </div>
        {exercise.lines.map((l, i) => (
          <div key={i} className="pv-corr-step">
            <span className="pv-step-dot" style={{ background: colors[i % colors.length] }}>{String.fromCharCode(97 + i)}</span>
            <div style={{ flex: 1 }}><Rich text={l.justification} /></div>
          </div>
        ))}
      </CorrectionFrame>
    </CardShell>
  );
}
