import { useState } from 'react';
import { ModeCard } from './ModeCard';
import {
  C, CardFooter, CardShell, CorrectionFrame, Good, Inp, Scene, StepsCorrection, VividHero, VividPage,
  type AnswerState, type CardTheme,
} from './ProportionnaliteVividKit';
import {
  ARC_COLORS, NATURES, angleBetween, buildAngles, dirOf, dirPt, dist, natureOf, parseDeg, sidesOf,
  type AllNamesEx, type AngleEx, type AnglesMode, type CoarseBuildEx, type CoarseReadEx, type ColorEx, type DoubleReadEx,
  type EstimateEx, type FineBuildEx, type FineReadEx, type FreeBuildEx, type LabeledPt, type NameEx, type Nature,
  type NatureFigureEx, type NatureMeasureEx, type P, type ProtReading, type ToolMeasureEx, type TriangleBuildEx,
} from './anglesData';
import { AngleCanvas, AngleMark, Cross, Hat, INK, Label, ProtNudge, Protractor, Ray, fitProtractor, type ProtState } from './AnglesFigures';

interface CardProps<E> {
  index: number;
  exercise: E;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}

const NATURE_COLOR: Record<Nature, string> = { aigu: C.green, droit: C.blue, obtus: C.orange, plat: C.pink };
const NATURE_RULE: Record<Nature, string> = {
  aigu: 'moins de 90°',
  droit: 'exactement 90°',
  obtus: 'entre 90° et 180°',
  plat: 'exactement 180°',
};

// ── Small widgets ────────────────────────────────────────────────────────────

function NaturePicker({ value, onChange, disabled, expected }: {
  value: Nature | null; onChange: (n: Nature) => void; disabled: boolean; expected: Nature;
}) {
  return (
    <div className="ag-nat">
      {NATURES.map((n) => {
        const sel = value === n;
        const col = NATURE_COLOR[n];
        let style: React.CSSProperties;
        if (disabled) {
          if (n === expected) style = { borderColor: 'var(--correct)', background: 'rgba(74,222,128,0.16)', color: 'var(--correct)' };
          else if (sel) style = { borderColor: 'var(--wrong)', background: 'rgba(248,113,113,0.14)', color: 'var(--wrong)' };
          else style = { opacity: 0.4 };
        } else {
          style = sel ? { borderColor: col, background: `${col}26`, color: col } : {};
        }
        return (
          <button key={n} type="button" disabled={disabled} onClick={() => onChange(n)} style={style}>{n}</button>
        );
      })}
    </div>
  );
}

/** Slots filled by clicking letters (click a filled slot to empty it). */
function LetterSlots({ letters, value, onChange, disabled, color, hat = false, render }: {
  letters: string[]; value: (string | null)[]; onChange: (v: (string | null)[]) => void; disabled: boolean; color: string;
  hat?: boolean; render?: (slots: React.ReactNode[]) => React.ReactNode;
}) {
  const slots = value.map((l, i) => (
    <button
      key={i} type="button" className="ag-slot" disabled={disabled}
      onClick={() => onChange(value.map((x, j) => (j === i ? null : x)))}
      style={{ borderColor: l ? color : 'var(--border2)', color: l ? color : 'var(--muted)', background: l ? `${color}1c` : 'var(--surface2)' }}
    >
      {l ?? '?'}
    </button>
  ));
  return (
    <div className="ag-letterpick">
      <div className={hat ? 'ag-slots ag-slots-hat' : 'ag-slots'} style={hat ? { color } : undefined}>{render ? render(slots) : slots}</div>
      {!disabled && (
        <div className="ag-letterbank">
          {letters.map((l) => (
            <button
              key={l} type="button" className="pv-letterbtn"
              style={{ borderColor: `${color}66`, background: `${color}14`, color: 'var(--text)' }}
              onClick={() => {
                const i = value.findIndex((x) => x === null);
                if (i >= 0) onChange(value.map((x, j) => (j === i ? l : x)));
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DegInput({ value, onChange, disabled, color, label, ok }: {
  value: string; onChange: (v: string) => void; disabled: boolean; color: string; label: string; ok: boolean | null;
}) {
  return (
    <span className="ag-deg" style={ok === null ? undefined : { color: ok ? 'var(--correct)' : 'var(--wrong)' }}>
      <Inp value={value} onChange={onChange} disabled={disabled} color={color} label={label} />
      <span>°</span>
      {ok !== null && <strong style={{ marginLeft: 4 }}>{ok ? '✓' : '✗'}</strong>}
    </span>
  );
}

const fmt = (x: number) => x.toFixed(1).replace('.', ',').replace(',0', '');

// ── Figures ──────────────────────────────────────────────────────────────────

const centroid = (pts: P[]): P => ({ x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length });

function PolygonFigure({ pts, arcs, w = 380, h = 250 }: {
  pts: LabeledPt[]; arcs: { vertex: number; color: string }[]; w?: number; h?: number;
}) {
  const g = centroid(pts.map((q) => q.p));
  const n = pts.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ag-fig-svg" style={{ maxWidth: 440 }}>
      {arcs.map(({ vertex, color }) => {
        const v = pts[vertex]!.p;
        return (
          <AngleMark
            key={vertex} c={v} color={color} r={30}
            d1={dirOf(v, pts[(vertex + n - 1) % n]!.p)} d2={dirOf(v, pts[(vertex + 1) % n]!.p)}
          />
        );
      })}
      <polygon points={pts.map((q) => `${q.p.x},${q.p.y}`).join(' ')} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      {pts.map((q) => <Label key={q.label} p={q.p} from={g} text={q.label} />)}
    </svg>
  );
}

/** One angle drawn alone (vertex in the middle of a small box). */
function LoneAngle({ dir, m, color, vertexLabel, size = 170, showMark = true }: {
  dir: number; m: number; color: string; vertexLabel?: string; size?: number; showMark?: boolean;
}) {
  const len = size * 0.4;
  // centre the figure: the vertex is moved opposite the bisector
  const bis = m === 180 ? dir + 90 : dir + m / 2;
  const v = dirPt({ x: size / 2, y: size / 2 }, bis + 180, m === 180 ? size * 0.12 : size * 0.18);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="ag-fig-svg" style={{ maxWidth: size + 30 }}>
      {showMark && <AngleMark c={v} d1={dir} d2={dir + m} color={color} r={size * 0.13} flat={m === 180} />}
      <Ray c={v} d={dir} len={len} />
      <Ray c={v} d={dir + m} len={len} />
      {vertexLabel && <Label p={v} from={dirPt(v, bis, 10)} text={vertexLabel} size={14} gap={13} />}
    </svg>
  );
}

/** Protractor laid on an angle (fixed). */
function ReadingFigure({ reading, coarse, r, color, names, second = true, extra }: {
  reading: ProtReading; coarse: boolean; r: number; color: string;
  names?: [string, string, string]; second?: boolean; extra?: React.ReactNode;
}) {
  const [s1, s2] = sidesOf(reading);
  const len = r + 30;
  const O: P = { x: 0, y: 0 };
  const { c, w, h } = fitProtractor(r, reading.rot, [dirPt(O, s1, len + 14), dirPt(O, s2, len + 14)]);
  return (
    <div className="ag-zoom">
    <svg viewBox={`0 0 ${w} ${h}`} className="ag-fig-svg" style={{ maxWidth: w + 40, minWidth: coarse ? undefined : 440 }}>
      {second && <AngleMark c={c} d1={s1} d2={s2} color={color} r={r * 0.22} />}
      <Protractor c={c} r={r} rot={reading.rot} coarse={coarse} />
      <Ray c={c} d={s1} len={len} />
      {second && <Ray c={c} d={s2} len={len} />}
      {names && (
        <>
          <Cross p={dirPt(c, s1, len - 8)} />
          <Label p={dirPt(c, s1, len - 8)} from={c} text={names[0]} gap={13} />
          <Label p={c} from={dirPt(c, s1 + 90 + (reading.right ? 0 : 180), 5)} text={names[1]} gap={14} />
          {second && <><Cross p={dirPt(c, s2, len - 8)} /><Label p={dirPt(c, s2, len - 8)} from={c} text={names[2]} gap={13} /></>}
        </>
      )}
      {extra}
    </svg>
    </div>
  );
}

// ── Themes ───────────────────────────────────────────────────────────────────

const THEMES: Record<AngleEx['kind'], Omit<CardTheme, 'title'> & { title: string }> = {
  name: { color: C.blue, icon: '📐', deco: '∠', tag: 'Nommer', title: 'Nommer un angle', short: 'Nom, sommet, côtés', stars: 1 },
  allnames: { color: C.violet, icon: '🏷️', deco: '∠', tag: 'Nommer', title: 'Tous les noms d’un même angle', short: 'Tous les noms', stars: 2 },
  color: { color: C.pink, icon: '🎨', deco: '∠', tag: 'Repérer', title: 'Quel angle est de quelle couleur ?', short: 'Repérer un angle', stars: 1 },
  natureMeasure: { color: C.orange, icon: '🔢', deco: '°', tag: 'Nature', title: 'La nature d’un angle selon sa mesure', short: 'Nature et mesure', stars: 1 },
  natureFigure: { color: C.green, icon: '👀', deco: '⦣', tag: 'Nature', title: 'La nature d’un angle à vue d’œil', short: 'Nature à vue d’œil', stars: 1 },
  estimate: { color: C.sky, icon: '🧐', deco: '°', tag: 'Estimer', title: 'Estimer sans instrument', short: 'Estimer une mesure', stars: 1 },
  coarseRead: { color: C.blue, icon: '🔟', deco: '◠', tag: 'Rapporteur', title: 'Lire sur un rapporteur gradué tous les 10°', short: 'Lire (graduations de 10°)', stars: 1 },
  fineRead: { color: C.violet, icon: '🔍', deco: '◠', tag: 'Rapporteur', title: 'Lire sur la bonne graduation', short: 'Intérieure ou extérieure ?', stars: 2 },
  doubleRead: { color: C.pink, icon: '🧩', deco: '◠', tag: 'Rapporteur', title: 'Nature puis mesure', short: 'Nature puis mesure', stars: 3 },
  toolMeasure: { color: C.orange, icon: '🛠️', deco: '◠', tag: 'Rapporteur', title: 'Mesure avec ton rapporteur', short: 'Mesurer (rapporteur mobile)', stars: 3 },
  coarseBuild: { color: C.green, icon: '✏️', deco: '◠', tag: 'Construire', title: 'Trace le deuxième côté', short: 'Tracer (graduations de 10°)', stars: 1 },
  fineBuild: { color: C.blue, icon: '📏', deco: '◠', tag: 'Construire', title: 'Trace le deuxième côté, au degré près', short: 'Tracer au degré près', stars: 2 },
  freeBuild: { color: C.violet, icon: '🛠️', deco: '◠', tag: 'Construire', title: 'Construis l’angle avec ton rapporteur', short: 'Construire (rapporteur mobile)', stars: 3 },
  triangleBuild: { color: C.orange, icon: '🔺', deco: '△', tag: 'Construire', title: 'Place le troisième sommet', short: 'Angle et longueur', stars: 3 },
};
const themeForEx = (ex: AngleEx): CardTheme => THEMES[ex.kind];

// ── Reconnaître ──────────────────────────────────────────────────────────────

function NameCard({ index, exercise, theme, answer, onSubmit }: CardProps<NameEx>) {
  const { pts, vertex } = exercise;
  const n = pts.length;
  const V = pts[vertex]!.label, Pv = pts[(vertex + n - 1) % n]!.label, Nx = pts[(vertex + 1) % n]!.label;
  const [name, setName] = useState<(string | null)[]>([null, null, null]);
  const [top, setTop] = useState<(string | null)[]>([null]);
  const [sides, setSides] = useState<(string | null)[]>([null, null]);
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const all = pts.map((q) => q.label);
  const okName = (name.join('') === `${Pv}${V}${Nx}` || name.join('') === `${Nx}${V}${Pv}`);
  const okTop = top[0] === V;
  const okSides = new Set(sides).size === 2 && sides.includes(Pv) && sides.includes(Nx);
  const validate = () => {
    if ([...name, ...top, ...sides].some((x) => x === null)) { setMissing(true); return; }
    onSubmit(okName && okTop && okSides);
  };
  const mark = (ok: boolean) => (disabled ? <strong style={{ color: ok ? 'var(--correct)' : 'var(--wrong)' }}>{ok ? '✓' : '✗'}</strong> : null);
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Complète la carte d'identité de l'angle marqué en couleur : son <strong>nom</strong>, son <strong>sommet</strong> et ses <strong>côtés</strong>.</Scene>
      <PolygonFigure pts={pts} arcs={[{ vertex, color: theme.color }]} />
      <div className="ag-id">
        <div className="ag-id-row">
          <span className="ag-id-label">Sommet {mark(okTop)}</span>
          <LetterSlots letters={all} value={top} onChange={setTop} disabled={disabled} color={C.orange} />
        </div>
        <div className="ag-id-row">
          <span className="ag-id-label">Côtés {mark(okSides)}</span>
          <LetterSlots
            letters={all} value={sides} onChange={setSides} disabled={disabled} color={C.green}
            render={(s) => <>[{top[0] ?? '…'}{s[0]}) et [{top[0] ?? '…'}{s[1]})</>}
          />
        </div>
        <div className="ag-id-row">
          <span className="ag-id-label">Nom {mark(okName)}</span>
          <LetterSlots letters={all} value={name} onChange={setName} disabled={disabled} color={theme.color} hat />
        </div>
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Complète les trois lignes (clique sur les lettres)." />
      {disabled && (
        <StepsCorrection
          color={theme.color}
          steps={[
            <>Le <strong>sommet</strong> est le point où se trouve l'arc : <Good>{V}</Good>.</>,
            <>Les <strong>côtés</strong> sont les deux demi-droites qui partent du sommet : <Good>[{V}{Pv})</Good> et <Good>[{V}{Nx})</Good>.</>,
            <>Pour le <strong>nom</strong>, le sommet s'écrit <strong>au milieu</strong> : <Good><Hat>{`${Pv}${V}${Nx}`}</Hat></Good> ou <Good><Hat>{`${Nx}${V}${Pv}`}</Hat></Good>.</>,
          ]}
        />
      )}
    </CardShell>
  );
}

function AllNamesCard({ index, exercise, theme, answer, onSubmit }: CardProps<AllNamesEx>) {
  const { V, X1, X2, Y, options } = exercise;
  const [sel, setSel] = useState<boolean[]>(() => options.map(() => false));
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const validate = () => {
    if (!sel.some(Boolean)) { setMissing(true); return; }
    onSubmit(options.every((o, i) => o.ok === sel[i]));
  };
  const g = centroid([V.p, X2.p, Y.p]);
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Sélectionne <strong>tous</strong> les noms possibles de l'angle marqué en couleur (et seulement eux).</Scene>
      <svg viewBox="0 0 380 250" className="ag-fig-svg" style={{ maxWidth: 440 }}>
        <AngleMark c={V.p} d1={dirOf(V.p, X2.p)} d2={dirOf(V.p, Y.p)} color={theme.color} r={34} />
        <polygon points={[V.p, X2.p, Y.p].map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <Cross p={X1.p} />
        {[V, X2, Y].map((q) => <Label key={q.label} p={q.p} from={g} text={q.label} />)}
        <Label p={X1.p} from={dirPt(X1.p, dirOf(V.p, X2.p) + 90, -5)} text={X1.label} gap={14} />
      </svg>
      <div className="ag-chips">
        {options.map((o, i) => {
          let style: React.CSSProperties = sel[i] ? { borderColor: theme.color, background: `${theme.color}26`, color: theme.color } : {};
          if (disabled) {
            if (o.ok) style = { borderColor: 'var(--correct)', background: 'rgba(74,222,128,0.14)', color: 'var(--correct)' };
            else if (sel[i]) style = { borderColor: 'var(--wrong)', background: 'rgba(248,113,113,0.14)', color: 'var(--wrong)' };
            else style = { opacity: 0.4 };
          }
          return (
            <button key={o.name} type="button" className="ag-chip" disabled={disabled} style={style}
              onClick={() => setSel((s) => s.map((x, j) => (j === i ? !x : x)))}>
              <Hat>{o.name}</Hat>{disabled && sel[i] && <span style={{ marginLeft: 6 }}>{o.ok ? '✓' : '✗'}</span>}
            </button>
          );
        })}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Sélectionne au moins un nom." />
      {disabled && (
        <StepsCorrection
          color={theme.color}
          steps={[
            <>Le sommet est <Good>{V.label}</Good> : il doit être <strong>au milieu</strong> du nom.</>,
            <>Un côté passe par <strong>{X1.label}</strong> et par <strong>{X2.label}</strong> : on peut utiliser l'un ou l'autre. L'autre côté passe par <strong>{Y.label}</strong>.</>,
            <>On peut aussi lire le nom dans les deux sens.</>,
          ]}
          conclusion={<>Les 4 noms : {[`${X1.label}${V.label}${Y.label}`, `${Y.label}${V.label}${X1.label}`, `${X2.label}${V.label}${Y.label}`, `${Y.label}${V.label}${X2.label}`].map((s, i) => <span key={s}>{i > 0 && ', '}<Hat>{s}</Hat></span>)}.</>}
        />
      )}
    </CardShell>
  );
}

function ColorCard({ index, exercise, theme, answer, onSubmit }: CardProps<ColorEx>) {
  const { pts, colorOf, asked } = exercise;
  const n = pts.length;
  const [choice, setChoice] = useState<(number | null)[]>(() => asked.map(() => null));
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const nameOf = (vertex: number, reversed: boolean) => {
    const a = pts[(vertex + n - 1) % n]!.label, v = pts[vertex]!.label, b = pts[(vertex + 1) % n]!.label;
    return reversed ? `${b}${v}${a}` : `${a}${v}${b}`;
  };
  const validate = () => {
    if (choice.some((c) => c === null)) { setMissing(true); return; }
    onSubmit(asked.every((q, i) => choice[i] === colorOf[q.vertex]));
  };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Les quatre angles du quadrilatère sont coloriés. Indique la <strong>couleur</strong> de chaque angle demandé.</Scene>
      <PolygonFigure pts={pts} arcs={pts.map((_, i) => ({ vertex: i, color: ARC_COLORS[colorOf[i]!]!.hex }))} />
      <div className="ag-rows">
        {asked.map((q, i) => (
          <div key={i} className="ag-row">
            <span className="ag-row-name">L'angle <Hat>{nameOf(q.vertex, q.reversed)}</Hat> est</span>
            <div className="ag-colors">
              {ARC_COLORS.map((col, k) => {
                const sel = choice[i] === k;
                const right = colorOf[q.vertex] === k;
                let style: React.CSSProperties = { borderColor: sel ? col.hex : 'var(--border2)', background: sel ? `${col.hex}2e` : 'var(--surface2)' };
                if (disabled) style = right ? { borderColor: 'var(--correct)', background: 'rgba(74,222,128,0.14)' } : sel ? { borderColor: 'var(--wrong)', background: 'rgba(248,113,113,0.14)' } : { opacity: 0.35 };
                return (
                  <button key={k} type="button" disabled={disabled} style={style} onClick={() => setChoice((c) => c.map((x, j) => (j === i ? k : x)))}>
                    <span className="ag-dot" style={{ background: col.hex }} />{col.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Choisis une couleur pour chaque angle." />
      {disabled && (
        <StepsCorrection
          color={theme.color}
          steps={asked.map((q) => (
            <>Dans <Hat>{nameOf(q.vertex, q.reversed)}</Hat>, la lettre du milieu est <strong>{pts[q.vertex]!.label}</strong> : c'est l'angle de sommet {pts[q.vertex]!.label}, en <Good>{ARC_COLORS[colorOf[q.vertex]!]!.name}</Good>.</>
          ))}
        />
      )}
    </CardShell>
  );
}

function NatureMeasureCard({ index, exercise, theme, answer, onSubmit }: CardProps<NatureMeasureEx>) {
  const { measures } = exercise;
  const [vals, setVals] = useState<(Nature | null)[]>(() => measures.map(() => null));
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const validate = () => {
    if (vals.some((v) => v === null)) { setMissing(true); return; }
    onSubmit(measures.every((m, i) => vals[i] === natureOf(m)));
  };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Donne la <strong>nature</strong> d'un angle qui a cette mesure : aigu, droit, obtus ou plat ?</Scene>
      <div className="ag-rows">
        {measures.map((m, i) => (
          <div key={i} className="ag-row">
            <span className="ag-row-name ag-mono">{m}°</span>
            <NaturePicker value={vals[i]!} onChange={(v) => setVals((s) => s.map((x, j) => (j === i ? v : x)))} disabled={disabled} expected={natureOf(m)} />
          </div>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Choisis une nature pour chaque mesure." />
      {disabled && (
        <CorrectionFrame color={theme.color}>
          <div className="ag-rule">
            {NATURES.map((n) => <span key={n} style={{ borderColor: `${NATURE_COLOR[n]}66`, color: NATURE_COLOR[n] }}><strong>{n}</strong> : {NATURE_RULE[n]}</span>)}
          </div>
          <p style={{ marginTop: 10 }}>{measures.map((m, i) => <span key={i}>{i > 0 && ' · '}{m}° → <Good>{natureOf(m)}</Good></span>)}</p>
        </CorrectionFrame>
      )}
    </CardShell>
  );
}

const SUB = ['a', 'b', 'c', 'd', 'e', 'f'];

function NatureFigureCard({ index, exercise, theme, answer, onSubmit }: CardProps<NatureFigureEx>) {
  const { angles } = exercise;
  const [vals, setVals] = useState<(Nature | null)[]>(() => angles.map(() => null));
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const validate = () => {
    if (vals.some((v) => v === null)) { setMissing(true); return; }
    onSubmit(angles.every((a, i) => vals[i] === natureOf(a.m)));
  };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Sans mesurer, donne la <strong>nature</strong> de chaque angle.</Scene>
      <div className="ag-grid">
        {angles.map((a, i) => (
          <div key={i} className="ag-cell">
            <div className="ag-cell-tag">{SUB[i]}.</div>
            <LoneAngle dir={a.dir} m={a.m} color={theme.color} />
            <NaturePicker value={vals[i]!} onChange={(v) => setVals((s) => s.map((x, j) => (j === i ? v : x)))} disabled={disabled} expected={natureOf(a.m)} />
          </div>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Choisis une nature pour chaque angle." />
      {disabled && (
        <StepsCorrection
          color={theme.color}
          steps={[
            <>Le petit <strong>carré</strong> signale un angle <Good>droit</Good> : ses côtés sont perpendiculaires.</>,
            <>Moins ouvert que l'angle droit : angle <Good>aigu</Good>. Plus ouvert : angle <Good>obtus</Good>.</>,
            <>Quand les deux côtés forment une droite, l'angle est <Good>plat</Good>.</>,
          ]}
          conclusion={<>{angles.map((a, i) => <span key={i}>{i > 0 && ' · '}{SUB[i]}. {natureOf(a.m)}</span>)}</>}
        />
      )}
    </CardShell>
  );
}

// ── Mesurer ──────────────────────────────────────────────────────────────────

function EstimateCard({ index, exercise, theme, answer, onSubmit }: CardProps<EstimateEx>) {
  const { angles, choices } = exercise;
  const [vals, setVals] = useState<(number | null)[]>(() => angles.map(() => null));
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const validate = () => {
    if (vals.some((v) => v === null)) { setMissing(true); return; }
    onSubmit(angles.every((a, i) => vals[i] === a.m));
  };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Sans instrument, associe chaque angle à sa mesure. Commence par repérer s'il est <strong>aigu</strong> ou <strong>obtus</strong> !</Scene>
      <div className="ag-grid">
        {angles.map((a, i) => (
          <div key={i} className="ag-cell">
            <div className="ag-cell-tag">Angle de sommet {a.label}</div>
            <LoneAngle dir={a.dir} m={a.m} color={theme.color} vertexLabel={a.label} />
            <div className="ag-nat">
              {choices.map((m) => {
                const sel = vals[i] === m;
                let style: React.CSSProperties = sel ? { borderColor: theme.color, background: `${theme.color}26`, color: theme.color } : {};
                if (disabled) style = m === a.m ? { borderColor: 'var(--correct)', background: 'rgba(74,222,128,0.16)', color: 'var(--correct)' } : sel ? { borderColor: 'var(--wrong)', color: 'var(--wrong)' } : { opacity: 0.4 };
                return <button key={m} type="button" disabled={disabled} style={style} onClick={() => setVals((s) => s.map((x, j) => (j === i ? m : x)))}>{m}°</button>;
              })}
            </div>
          </div>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Choisis une mesure pour chaque angle." />
      {disabled && (
        <StepsCorrection
          color={theme.color}
          steps={[
            <>Un angle aigu mesure moins de 90°, un angle obtus plus de 90° : cela élimine déjà beaucoup de mesures.</>,
            <>Ensuite on compare : plus l'angle est ouvert, plus sa mesure est grande.</>,
          ]}
          conclusion={<>{angles.map((a, i) => <span key={i}>{i > 0 && ' · '}sommet {a.label} : {a.m}°</span>)}</>}
        />
      )}
    </CardShell>
  );
}

function readingExplain(r: ProtReading, coarse: boolean): React.ReactNode {
  const side = r.right ? 'droite' : 'gauche';
  return coarse
    ? <>Le premier côté passe par le « 0 » de <strong>{side}</strong>. On compte les graduations de 10 en 10 à partir de ce 0 jusqu'au deuxième côté : <Good>{r.m}°</Good>.</>
    : <>Le premier côté passe par le « 0 » de <strong>{side}</strong> : on lit la graduation <strong>{r.right ? 'intérieure' : 'extérieure'}</strong>, celle qui part de ce 0. Le deuxième côté passe devant <Good>{r.m}</Good> (et non devant {180 - r.m}). L'angle est {natureOf(r.m)} : c'est cohérent.</>;
}

function CoarseReadCard({ index, exercise, theme, answer, onSubmit }: CardProps<CoarseReadEx>) {
  const { items } = exercise;
  const [vals, setVals] = useState<string[]>(() => items.map(() => ''));
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const oks = items.map((it, i) => parseDeg(vals[i]!) === it.m);
  const validate = () => {
    if (vals.some((v) => v.trim() === '')) { setMissing(true); return; }
    onSubmit(oks.every(Boolean));
  };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Ce rapporteur est gradué <strong>tous les 10°</strong>. Lis la mesure de chaque angle coloré.</Scene>
      <div className="ag-grid">
        {items.map((it, i) => (
          <div key={i} className="ag-cell">
            <div className="ag-cell-tag">{SUB[i]}.</div>
            <ReadingFigure reading={it} coarse r={88} color={theme.color} />
            <DegInput value={vals[i]!} onChange={(v) => setVals((s) => s.map((x, j) => (j === i ? v : x)))} disabled={disabled} color={theme.color} label={`Mesure ${SUB[i]}`} ok={disabled ? oks[i]! : null} />
          </div>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Écris les trois mesures." />
      {disabled && <StepsCorrection color={theme.color} labels={items.map((_, i) => SUB[i]!)} steps={items.map((it) => readingExplain(it, true))} />}
    </CardShell>
  );
}

function FineReadCard({ index, exercise, theme, answer, onSubmit }: CardProps<FineReadEx>) {
  const { items } = exercise;
  const [vals, setVals] = useState<string[]>(() => items.map(() => ''));
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const oks = items.map((it, i) => parseDeg(vals[i]!) === it.m);
  const validate = () => {
    if (vals.some((v) => v.trim() === '')) { setMissing(true); return; }
    onSubmit(oks.every(Boolean));
  };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Lis la mesure de chaque angle. Attention : il y a <strong>deux graduations</strong> ; choisis celle qui part de <strong>0</strong> sur le premier côté.</Scene>
      <div className="ag-grid ag-grid-2">
        {items.map((it, i) => (
          <div key={i} className="ag-cell">
            <ReadingFigure reading={it} coarse={false} r={150} color={theme.color} names={it.names} />
            <div className="ag-row-name"><Hat>{it.names.join('')}</Hat> = <DegInput value={vals[i]!} onChange={(v) => setVals((s) => s.map((x, j) => (j === i ? v : x)))} disabled={disabled} color={theme.color} label={`Mesure de l'angle ${it.names.join('')}`} ok={disabled ? oks[i]! : null} /></div>
          </div>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Écris les deux mesures." />
      {disabled && <StepsCorrection color={theme.color} labels={items.map((_, i) => SUB[i]!)} steps={items.map((it) => readingExplain(it, false))} />}
    </CardShell>
  );
}

function DoubleReadCard({ index, exercise, theme, answer, onSubmit }: CardProps<DoubleReadEx>) {
  const { l, j, names, asked } = exercise;
  const [nat, setNat] = useState<(Nature | null)[]>(() => asked.map(() => null));
  const [vals, setVals] = useState<string[]>(() => asked.map(() => ''));
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const nameOf = (q: DoubleReadEx['asked'][number]) => `${q.a === 'L' ? names.L : q.a}${names.K}${q.b === 'J' ? names.J : names.L}`;
  const okN = asked.map((q, i) => nat[i] === natureOf(q.m));
  const okM = asked.map((q, i) => parseDeg(vals[i]!) === q.m);
  const validate = () => {
    if (nat.some((x) => x === null) || vals.some((v) => v.trim() === '')) { setMissing(true); return; }
    onSubmit(okN.every(Boolean) && okM.every(Boolean));
  };
  const w = 460, h = 250, r = 165;
  const c: P = { x: w / 2, y: h - 30 };
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>Le rapporteur est posé sur la droite (<em>xy</em>), centre en {names.K}. Pour chaque angle, donne sa <strong>nature</strong>, puis sa <strong>mesure</strong>.</Scene>
      <div className="ag-zoom">
      <svg viewBox={`0 0 ${w} ${h}`} className="ag-fig-svg" style={{ maxWidth: 520, minWidth: 460 }}>
        <Protractor c={c} r={r} />
        <line x1={8} y1={c.y} x2={w - 8} y2={c.y} stroke={INK} strokeWidth={2} />
        <Ray c={c} d={l} len={r + 34} />
        <Ray c={c} d={j} len={r + 34} />
        <Label p={{ x: 14, y: c.y }} from={{ x: 14, y: c.y + 10 }} text="x" italic gap={12} />
        <Label p={{ x: w - 14, y: c.y }} from={{ x: w - 14, y: c.y + 10 }} text="y" italic gap={12} />
        <Label p={c} from={{ x: c.x, y: c.y - 10 }} text={names.K} gap={14} />
        <Cross p={dirPt(c, l, r + 26)} /><Label p={dirPt(c, l, r + 26)} from={c} text={names.L} gap={13} />
        <Cross p={dirPt(c, j, r + 26)} /><Label p={dirPt(c, j, r + 26)} from={c} text={names.J} gap={13} />
      </svg>
      </div>
      <div className="ag-rows">
        {asked.map((q, i) => (
          <div key={i} className="ag-row">
            <span className="ag-row-name"><Hat>{nameOf(q)}</Hat> est</span>
            <NaturePicker value={nat[i]!} onChange={(v) => setNat((s) => s.map((x, k) => (k === i ? v : x)))} disabled={disabled} expected={natureOf(q.m)} />
            <span className="ag-row-name">et mesure</span>
            <DegInput value={vals[i]!} onChange={(v) => setVals((s) => s.map((x, k) => (k === i ? v : x)))} disabled={disabled} color={theme.color} label={`Mesure de ${nameOf(q)}`} ok={disabled ? okM[i]! : null} />
          </div>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Choisis chaque nature et écris chaque mesure." />
      {disabled && (
        <StepsCorrection
          color={theme.color}
          steps={asked.map((q) => (q.a === 'L'
            ? <>Pour <Hat>{nameOf(q)}</Hat>, aucun côté n'est sur un 0 : on lit les deux côtés sur la <strong>même</strong> graduation ({j} et {l}) et on soustrait : {j} − {l} = <Good>{q.m}°</Good> ({natureOf(q.m)}).</>
            : <>Pour <Hat>{nameOf(q)}</Hat>, le côté [{names.K}{q.a}) est sur le 0 de {q.a === 'x' ? 'gauche' : 'droite'} : graduation <strong>{q.a === 'x' ? 'extérieure' : 'intérieure'}</strong> → <Good>{q.m}°</Good>, angle {natureOf(q.m)}.</>))}
        />
      )}
    </CardShell>
  );
}

const startProt = (w: number, h: number, r: number): ProtState => ({ c: { x: w - r - 40, y: h - 18 }, rot: 0 });

function ToolMeasureCard({ index, exercise, theme, answer, onSubmit }: CardProps<ToolMeasureEx>) {
  const { dir, m, name } = exercise;
  const w = 480, h = 340, R = 105, ARM = 130;
  const bis = dir + m / 2;
  const O = dirPt({ x: w / 2, y: h / 2 }, bis + 180, 30);
  const [prot, setProt] = useState<ProtState>(() => startProt(w, h, R));
  const [val, setVal] = useState('');
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const got = parseDeg(val);
  const ok = got !== null && Math.abs(got - m) <= 1;
  const validate = () => {
    if (val.trim() === '') { setMissing(true); return; }
    onSubmit(ok);
  };
  const ex = dirPt(O, dir, ARM), ey = dirPt(O, dir + m, ARM);
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>
        Mesure l'angle <Hat>{name}</Hat> avec le rapporteur : fais-le <strong>glisser</strong> pour poser son centre (le point rouge) sur le sommet O,
        puis fais-le <strong>tourner</strong> avec la poignée ↻ pour qu'un « 0 » soit sur un côté.
      </Scene>
      <AngleCanvas w={w} h={h} minWidth={460} prot={prot} setProt={setProt} protR={R} snapPoints={[O]} snapDirs={[dir, dir + m]}>
        <Ray c={O} d={dir} len={ARM} />
        <Ray c={O} d={dir + m} len={ARM} />
        <AngleMark c={O} d1={dir} d2={dir + m} color={theme.color} r={24} />
        <Label p={ex} from={O} text="x" italic gap={12} />
        <Label p={ey} from={O} text="y" italic gap={12} />
        <Label p={O} from={dirPt(O, bis, 10)} text="O" gap={15} />
      </AngleCanvas>
      <ProtNudge prot={prot} setProt={setProt} disabled={disabled} />
      <div className="ag-row" style={{ justifyContent: 'center' }}>
        <span className="ag-row-name"><Hat>{name}</Hat> =</span>
        <DegInput value={val} onChange={setVal} disabled={disabled} color={theme.color} label={`Mesure de ${name}`} ok={disabled ? ok : null} />
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Écris la mesure que tu lis." />
      {disabled && (
        <StepsCorrection
          color={theme.color}
          steps={[
            <>On pose le centre du rapporteur sur le sommet <strong>O</strong>.</>,
            <>On fait passer un « 0 » par un côté, puis on lit sur la graduation qui part de ce 0.</>,
            <>L'angle est {natureOf(m)} : vérifie que ta mesure est cohérente.</>,
          ]}
          conclusion={<><Hat>{name}</Hat> = {m}° (on accepte à 1° près).</>}
        />
      )}
    </CardShell>
  );
}

// ── Construire ───────────────────────────────────────────────────────────────

function BuildFeedback({ got, target, tol }: { got: number | null; target: number; tol: number }) {
  if (got === null) return null;
  const ok = Math.abs(got - target) <= tol;
  return <p style={{ fontSize: 13.5, margin: '6px 0 0' }}>Ton angle mesure <strong style={{ color: ok ? 'var(--correct)' : 'var(--wrong)' }}>{got}°</strong> ; il fallait <Good>{target}°</Good>.</p>;
}

function ProtBuildCard({ index, theme, answer, onSubmit, reading, coarse, names }: Omit<CardProps<unknown>, 'exercise'> & {
  reading: ProtReading; coarse: boolean; names?: [string, string, string];
}) {
  const r = coarse ? 125 : 158;
  const [s1, s2] = sidesOf(reading);
  const O: P = { x: 0, y: 0 };
  const { c, w, h } = fitProtractor(r, reading.rot, [dirPt(O, s1, r + 48), dirPt(O, s2, r + 48)]);
  const [dir, setDir] = useState<number | null>(null);
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const got = dir === null ? null : Math.round(angleBetween(s1, dir));
  const validate = () => {
    if (dir === null) { setMissing(true); return; }
    onSubmit(Math.abs(got! - reading.m) <= 1);
  };
  const len = r + 34;
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>
        {names
          ? <>Trace la demi-droite [{names[1]}{names[2]}) pour que <Hat>{names.join('')}</Hat> = <strong>{reading.m}°</strong>. </>
          : <>Trace le deuxième côté pour que l'angle mesure <strong>{reading.m}°</strong>. </>}
        Clique (ou touche) dans la figure, puis fais glisser l'extrémité du côté.
      </Scene>
      <AngleCanvas
        w={w} h={h} maxWidth={coarse ? 460 : 520} minWidth={coarse ? undefined : 440}
        ray={{ from: c, dir, len, refDir: s1, set: setDir, disabled, color: theme.color, label: names?.[2] }}
        overlay={disabled ? <Ray c={c} d={s2} len={len} color="#4ADE80" width={1.6} /> : undefined}
      >
        <Protractor c={c} r={r} rot={reading.rot} coarse={coarse} />
        <Ray c={c} d={s1} len={len} />
        {names && (
          <>
            <Cross p={dirPt(c, s1, len - 8)} />
            <Label p={dirPt(c, s1, len - 8)} from={c} text={names[0]} gap={13} />
            <Label p={c} from={dirPt(c, s1 + 90 + (reading.right ? 0 : 180), 5)} text={names[1]} gap={14} />
          </>
        )}
      </AngleCanvas>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Trace d'abord le deuxième côté." />
      {disabled && (
        <CorrectionFrame color={theme.color}>
          {readingExplain(reading, coarse)}
          <BuildFeedback got={got} target={reading.m} tol={1} />
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Le bon côté est tracé en vert sur la figure.</p>
        </CorrectionFrame>
      )}
    </CardShell>
  );
}

function CoarseBuildCard(p: CardProps<CoarseBuildEx>) {
  return <ProtBuildCard {...p} reading={p.exercise.reading} coarse />;
}
function FineBuildCard(p: CardProps<FineBuildEx>) {
  return <ProtBuildCard {...p} reading={p.exercise.reading} coarse={false} names={p.exercise.names} />;
}

function FreeBuildCard({ index, exercise, theme, answer, onSubmit }: CardProps<FreeBuildEx>) {
  const { dir: dx, m } = exercise;
  const w = 480, h = 340, R = 112;
  const toLeft = Math.cos((dx * Math.PI) / 180) < 0;
  const O: P = { x: toLeft ? 330 : 150, y: 205 };
  const [prot, setProt] = useState<ProtState>(() => ({ c: { x: toLeft ? R + 14 : w - R - 40, y: h - 18 }, rot: 0 }));
  const [dir, setDir] = useState<number | null>(null);
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const got = dir === null ? null : Math.round(angleBetween(dx, dir));
  const validate = () => {
    if (dir === null) { setMissing(true); return; }
    onSubmit(Math.abs(got! - m) <= 2);
  };
  const ex = dirPt(O, dx, 150);
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>
        Construis la demi-droite [O<em>y</em>) pour que <Hat>xOy</Hat> = <strong>{m}°</strong>.
        Place d'abord le rapporteur (centre sur O, un « 0 » sur [O<em>x</em>)), puis clique dans la figure et fais glisser l'extrémité de [O<em>y</em>).
      </Scene>
      <AngleCanvas
        w={w} h={h} minWidth={460} prot={prot} setProt={setProt} protR={R} snapPoints={[O]} snapDirs={[dx]}
        ray={{ from: O, dir, len: 160, refDir: dx, set: setDir, disabled, color: theme.color, label: 'y' }}
        overlay={disabled ? <><Ray c={O} d={dx + m} len={160} color="#4ADE80" width={1.6} /><Ray c={O} d={dx - m} len={160} color="#4ADE80" width={1.2} /></> : undefined}
      >
        <Ray c={O} d={dx} len={150} />
        <Label p={ex} from={O} text="x" italic gap={12} />
        <Label p={O} from={{ x: O.x, y: O.y - 10 }} text="O" gap={15} />
      </AngleCanvas>
      <ProtNudge prot={prot} setProt={setProt} disabled={disabled} />
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText="Trace d'abord la demi-droite [Oy)." />
      {disabled && (
        <CorrectionFrame color={theme.color}>
          <p>Centre du rapporteur sur <strong>O</strong>, un « 0 » sur [O<em>x</em>), puis on place <em>y</em> en face de {m} sur la graduation qui part de ce 0. L'angle doit être {natureOf(m)}.</p>
          <BuildFeedback got={got} target={m} tol={2} />
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Les deux solutions possibles sont tracées en vert (de part et d'autre de [O<em>x</em>)). On accepte à 2° près.</p>
        </CorrectionFrame>
      )}
    </CardShell>
  );
}

const PX_PER_CM = 30;

function TriangleBuildCard({ index, exercise, theme, answer, onSubmit }: CardProps<TriangleBuildEx>) {
  const { names, ab, m, bc } = exercise;
  const w = 480, h = 340, R = 100;
  const B: P = { x: 150, y: 300 };
  const A: P = { x: B.x + ab * PX_PER_CM, y: B.y };
  const [prot, setProt] = useState<ProtState>(() => ({ c: { x: w - R - 40, y: R + 26 }, rot: 0 }));
  const [Cp, setCp] = useState<P | null>(null);
  const [missing, setMissing] = useState(false);
  const disabled = answer.status !== 'pending';
  const gotAngle = Cp ? Math.round(angleBetween(0, dirOf(B, Cp))) : null;
  const gotLen = Cp ? dist(B, Cp) / PX_PER_CM : null;
  const ok = gotAngle !== null && gotLen !== null && Math.abs(gotAngle - m) <= 2 && Math.abs(gotLen - bc) <= 0.2;
  const validate = () => {
    if (!Cp) { setMissing(true); return; }
    onSubmit(ok);
  };
  const target = dirPt(B, m, bc * PX_PER_CM);
  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>
        Place le point {names.C} pour que <Hat>{`${names.A}${names.B}${names.C}`}</Hat> = <strong>{m}°</strong> et {names.B}{names.C} = <strong>{fmt(bc)} cm</strong> (au-dessus de [{names.B}{names.A}]).
        Utilise le rapporteur pour l'angle ; la règle affiche la longueur {names.B}{names.C}.
      </Scene>
      <AngleCanvas
        w={w} h={h} minWidth={460} prot={prot} setProt={setProt} protR={R} snapPoints={[B]} snapDirs={[0]}
        point={{ p: Cp, set: setCp, disabled, color: theme.color, label: names.C }}
        overlay={disabled ? <><line x1={B.x} y1={B.y} x2={target.x} y2={target.y} stroke="#4ADE80" strokeWidth={1.6} strokeDasharray="5 4" /><Cross p={target} color="#4ADE80" /></> : undefined}
      >
        <line x1={B.x} y1={B.y} x2={A.x} y2={A.y} stroke={INK} strokeWidth={2} />
        <Cross p={B} /><Cross p={A} />
        <Label p={B} from={{ x: B.x + 5, y: B.y - 5 }} text={names.B} gap={14} />
        <Label p={A} from={{ x: A.x - 5, y: A.y - 5 }} text={names.A} gap={14} />
        <text x={(B.x + A.x) / 2} y={B.y + 20} textAnchor="middle" style={{ fill: 'var(--muted)', fontSize: 13 }}>{ab} cm</text>
        {Cp && (
          <>
            <line x1={B.x} y1={B.y} x2={Cp.x} y2={Cp.y} stroke={theme.color} strokeWidth={2} />
            <line x1={A.x} y1={A.y} x2={Cp.x} y2={Cp.y} stroke={theme.color} strokeWidth={1.2} strokeDasharray="4 4" />
            <text
              x={(B.x + Cp.x) / 2 - 10} y={(B.y + Cp.y) / 2 - 8} textAnchor="end"
              style={{ fill: theme.color, fontSize: 13, fontWeight: 700, paintOrder: 'stroke', stroke: 'var(--bg)', strokeWidth: 4 }}
            >
              📏 {fmt(gotLen!)} cm
            </text>
          </>
        )}
      </AngleCanvas>
      <ProtNudge prot={prot} setProt={setProt} disabled={disabled} />
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={validate} showMissing={missing} missingText={`Place d'abord le point ${names.C}.`} />
      {disabled && (
        <CorrectionFrame color={theme.color}>
          <p>1. Rapporteur centré sur {names.B}, « 0 » sur [{names.B}{names.A}) : on marque {m}° et on trace la demi-droite.<br />2. Avec la règle, on place {names.C} sur cette demi-droite à {fmt(bc)} cm de {names.B}.</p>
          {gotAngle !== null && gotLen !== null && (
            <p style={{ fontSize: 13.5, marginTop: 6 }}>
              Ton point : angle <strong style={{ color: Math.abs(gotAngle - m) <= 2 ? 'var(--correct)' : 'var(--wrong)' }}>{gotAngle}°</strong>,
              longueur <strong style={{ color: Math.abs(gotLen - bc) <= 0.2 ? 'var(--correct)' : 'var(--wrong)' }}>{fmt(gotLen)} cm</strong>
              {' '}(on accepte 2° et 0,2 cm d'écart). La bonne position est en vert.
            </p>
          )}
        </CorrectionFrame>
      )}
    </CardShell>
  );
}

// ── Heroes ───────────────────────────────────────────────────────────────────

const VIDEO = (base: string, title: string) => ({ src: `/videos/${base}_web.mp4`, poster: `/videos/${base}_apercu.jpg`, title });
const VIDEO_RECONNAITRE = VIDEO('Angles_1_definition_vocabulaire_6e', 'Vidéo du cours : définition et vocabulaire');
const VIDEO_MESURER = VIDEO('Angles_2_mesurer_un_angle_6e', 'Vidéo du cours : mesurer un angle');
const VIDEO_CONSTRUIRE = VIDEO('Angles_3_construire_un_angle_6e', 'Vidéo du cours : construire un angle');

function NatureTiles() {
  return (
    <div className="ag-nat-tiles">
      {([['droit', 90, 'côtés perpendiculaires'], ['aigu', 45, 'moins ouvert que l’angle droit'], ['obtus', 130, 'plus ouvert que l’angle droit'], ['plat', 180, 'ses côtés forment une droite']] as const).map(([n, m, t]) => (
        <div key={n} className="ag-nat-tile" style={{ borderColor: `${NATURE_COLOR[n]}55`, background: `${NATURE_COLOR[n]}12` }}>
          <LoneAngle dir={0} m={m} color={NATURE_COLOR[n]} size={90} />
          <div><strong style={{ color: NATURE_COLOR[n] }}>Angle {n}</strong><div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t}</div></div>
        </div>
      ))}
    </div>
  );
}

function ReconnaitreHero({ onBack }: { onBack: () => void }) {
  const B: P = { x: 40, y: 110 };
  const A = dirPt(B, 30, 190), Cc = dirPt(B, -20, 190);
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Angles', color: C.blue }, { label: '🔎 Reconnaître', color: C.violet }]}
      title="Comment reconnaître et nommer un angle ?"
      intro={<>Un <strong style={{ color: C.blue }}>angle</strong> est une ouverture délimitée par <strong>deux demi-droites de même origine</strong>.</>}
      steps={[
        { emoji: '📍', color: C.orange, title: 'Le sommet', text: <>L'origine commune des deux demi-droites est le <strong>sommet</strong> de l'angle.</> },
        { emoji: '↗️', color: C.green, title: 'Les côtés', text: <>Les deux demi-droites sont les <strong>côtés</strong> de l'angle : ici [BA) et [BC).</> },
        { emoji: '✍️', color: C.blue, title: 'Le nom', text: <>On note <Hat>ABC</Hat> ou <Hat>CBA</Hat> : le sommet s'écrit toujours <strong>au milieu</strong>.</> },
      ]}
      videos={[]}
      extraVideo={VIDEO_RECONNAITRE}
      illusTitle="✨ Un angle et ses quatre natures"
      illus={
        <>
          <svg viewBox="0 0 250 200" className="ag-fig-svg" style={{ maxWidth: 260 }}>
            <AngleMark c={B} d1={-20} d2={30} color={C.blue} r={42} />
            <Ray c={B} d={30} len={190} />
            <Ray c={B} d={-20} len={190} />
            <Cross p={dirPt(B, 30, 170)} /><Cross p={dirPt(B, -20, 170)} />
            <Label p={dirPt(B, 30, 170)} from={B} text="A" gap={14} />
            <Label p={dirPt(B, -20, 170)} from={B} text="C" gap={14} />
            <Label p={B} from={{ x: B.x + 10, y: B.y }} text="B" gap={14} color={C.orange} />
            <text x={(B.x + A.x) / 2 - 34} y={(B.y + A.y) / 2 - 14} style={{ fill: C.green, fontSize: 12, fontWeight: 600 }}>côté [BA)</text>
            <text x={(B.x + Cc.x) / 2 - 10} y={(B.y + Cc.y) / 2 + 26} style={{ fill: C.green, fontSize: 12, fontWeight: 600 }}>côté [BC)</text>
            <text x={B.x - 18} y={B.y + 30} style={{ fill: C.orange, fontSize: 12, fontWeight: 600 }}>sommet</text>
          </svg>
          <NatureTiles />
        </>
      }
    />
  );
}

function MesurerHero({ onBack }: { onBack: () => void }) {
  const c: P = { x: 160, y: 175 };
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Angles', color: C.blue }, { label: '📏 Mesurer', color: C.orange }]}
      title="Comment mesurer un angle avec un rapporteur ?"
      intro={<>L'unité de mesure d'un angle est le <strong style={{ color: C.orange }}>degré</strong> : on note 49 degrés ou <strong>49°</strong>.</>}
      steps={[
        { emoji: '🎯', color: C.pink, title: 'Le centre', text: <>On place le <strong>centre</strong> du rapporteur sur le <strong>sommet</strong> de l'angle.</> },
        { emoji: '0️⃣', color: C.blue, title: 'Le zéro', text: <>On place une des deux graduations <strong>« 0 »</strong> sur un côté de l'angle.</> },
        { emoji: '👀', color: C.green, title: 'La lecture', text: <>On lit la mesure sur la graduation <strong>qui part de ce 0</strong>, là où passe l'autre côté.</> },
      ]}
      videos={[]}
      extraVideo={VIDEO_MESURER}
      illusTitle="✨ Ici, on lit la graduation intérieure : 49°"
      illus={
        <>
          <svg viewBox="0 0 320 210" className="ag-fig-svg" style={{ maxWidth: 340 }}>
            <AngleMark c={c} d1={0} d2={49} color={C.orange} r={30} />
            <Protractor c={c} r={125} />
            <Ray c={c} d={0} len={155} />
            <Ray c={c} d={49} len={155} />
            <Label p={dirPt(c, 0, 155)} from={c} text="y" italic gap={10} />
            <Label p={dirPt(c, 49, 155)} from={c} text="x" italic gap={10} />
            <Label p={c} from={{ x: c.x + 5, y: c.y - 5 }} text="O" gap={14} />
          </svg>
          <div className="ag-rule" style={{ marginTop: 8 }}>
            {NATURES.map((n) => <span key={n} style={{ borderColor: `${NATURE_COLOR[n]}66`, color: NATURE_COLOR[n] }}><strong>{n}</strong> : {NATURE_RULE[n]}</span>)}
          </div>
        </>
      }
    />
  );
}

function ConstruireHero({ onBack }: { onBack: () => void }) {
  const c: P = { x: 175, y: 175 };
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Angles', color: C.blue }, { label: '✏️ Construire', color: C.green }]}
      title="Comment construire un angle de mesure donnée ?"
      intro={<>On utilise une <strong>règle</strong> et un <strong>rapporteur</strong>. Exemple : construire l'angle <Hat>BAC</Hat> de <strong>40°</strong>.</>}
      steps={[
        { emoji: '📏', color: C.blue, title: 'Le premier côté', text: <>On trace une demi-droite <strong>[AB)</strong>.</> },
        { emoji: '🎯', color: C.pink, title: 'Le rapporteur', text: <>On place son centre sur <strong>A</strong> et une graduation <strong>« 0 »</strong> sur [AB).</> },
        { emoji: '📍', color: C.green, title: 'Le deuxième côté', text: <>On marque <strong>C</strong> en face de 40° sur la graduation qui part de ce 0, puis on trace <strong>[AC)</strong>.</> },
      ]}
      videos={[]}
      extraVideo={VIDEO_CONSTRUIRE}
      illusTitle="✨ Ici, on utilise la graduation extérieure"
      illus={
        <>
          <svg viewBox="0 0 340 210" className="ag-fig-svg" style={{ maxWidth: 360 }}>
            <AngleMark c={c} d1={180} d2={140} color={C.green} r={32} />
            <Protractor c={c} r={125} />
            <Ray c={c} d={180} len={160} />
            <Ray c={c} d={140} len={160} color={C.green} width={2.4} />
            <Cross p={dirPt(c, 180, 150)} /><Label p={dirPt(c, 180, 150)} from={{ x: c.x, y: c.y - 30 }} text="B" gap={12} />
            <Cross p={dirPt(c, 140, 150)} /><Label p={dirPt(c, 140, 150)} from={c} text="C" gap={12} color={C.green} />
            <Label p={c} from={{ x: c.x - 5, y: c.y - 5 }} text="A" gap={14} />
          </svg>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center' }}>Après la construction, on vérifie à vue d'œil que l'angle est bien <strong>aigu</strong>.</p>
        </>
      }
    />
  );
}

// ── Hub ──────────────────────────────────────────────────────────────────────

const MODES: { id: AnglesMode; label: string; icon: string; desc: string }[] = [
  { id: 'reconnaitre', label: 'Reconnaître un angle', icon: '∠', desc: '5 exercices · nom, sommet, côtés, nature (aigu, droit, obtus, plat)' },
  { id: 'mesurer', label: 'Mesurer un angle', icon: '◠', desc: '5 exercices · estimer, lire un rapporteur, mesurer avec un rapporteur mobile' },
  { id: 'construire', label: 'Construire un angle', icon: '✏', desc: '4 exercices · tracer un angle de mesure donnée avec le rapporteur' },
];

const TIPS: Record<AnglesMode, { emoji: string; title: string; text: React.ReactNode }> = {
  reconnaitre: { emoji: '🧠', title: 'Astuce', text: <>Dans le nom d'un angle, la lettre <strong>du milieu</strong> est toujours le sommet : dans <Hat>ABC</Hat>, c'est B.</> },
  mesurer: { emoji: '🧠', title: 'Le piège du rapporteur', text: <>Il y a deux graduations. Avant de lire, regarde si l'angle est <strong>aigu</strong> ou <strong>obtus</strong> : ta mesure doit être cohérente !</> },
  construire: { emoji: '🧠', title: 'Vérifie toujours', text: <>Une fois l'angle tracé, regarde-le : un angle de 40° doit être aigu, un angle de 130° doit être obtus.</> },
};

export function AnglesHub({ accent }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<AnglesMode | null>(null);
  if (mode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {MODES.map((m) => <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => setMode(m.id)} />)}
      </div>
    );
  }
  const back = () => {
    setMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const hero = mode === 'reconnaitre' ? <ReconnaitreHero onBack={back} /> : mode === 'mesurer' ? <MesurerHero onBack={back} /> : <ConstruireHero onBack={back} />;
  return (
    <VividPage<AngleEx>
      key={mode}
      accent={accent}
      hero={hero}
      tip={TIPS[mode]}
      build={() => buildAngles(mode)}
      themeFor={themeForEx}
      renderCard={(ex, i, p) => {
        switch (ex.kind) {
          case 'name': return <NameCard index={i} exercise={ex} {...p} />;
          case 'allnames': return <AllNamesCard index={i} exercise={ex} {...p} />;
          case 'color': return <ColorCard index={i} exercise={ex} {...p} />;
          case 'natureMeasure': return <NatureMeasureCard index={i} exercise={ex} {...p} />;
          case 'natureFigure': return <NatureFigureCard index={i} exercise={ex} {...p} />;
          case 'estimate': return <EstimateCard index={i} exercise={ex} {...p} />;
          case 'coarseRead': return <CoarseReadCard index={i} exercise={ex} {...p} />;
          case 'fineRead': return <FineReadCard index={i} exercise={ex} {...p} />;
          case 'doubleRead': return <DoubleReadCard index={i} exercise={ex} {...p} />;
          case 'toolMeasure': return <ToolMeasureCard index={i} exercise={ex} {...p} />;
          case 'coarseBuild': return <CoarseBuildCard index={i} exercise={ex} {...p} />;
          case 'fineBuild': return <FineBuildCard index={i} exercise={ex} {...p} />;
          case 'freeBuild': return <FreeBuildCard index={i} exercise={ex} {...p} />;
          case 'triangleBuild': return <TriangleBuildCard index={i} exercise={ex} {...p} />;
        }
      }}
    />
  );
}
