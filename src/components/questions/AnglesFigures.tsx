import { useRef, useState } from 'react';
import { angleBetween, dirOf, dirPt, dist, norm360, type P } from './anglesData';

/**
 * SVG building blocks of the « Angles » quiz: protractor (fine double scale or coarse 10° scale),
 * angle arcs, half-lines, point labels, and the interactive canvas (movable protractor, draggable half-line / point).
 */

export const PROT_COLOR = '#60A5FA';
export const INK = 'var(--text)';

/** Angle name with a hat over the letters: ∠ABC. */
export function Hat({ children }: { children: string }) {
  return <span className="pv-hat">{children}</span>;
}

// ── Arcs, sectors, marks ─────────────────────────────────────────────────────

/** [start, sweep] of the smaller angle between two directions (sweep counter-clockwise, 0–180). */
function smallArc(d1: number, d2: number): [number, number] {
  const d = norm360(d2 - d1);
  return d <= 180 ? [d1, d] : [d2, 360 - d];
}

export function arcPath(c: P, r: number, d1: number, d2: number, sector = false): string {
  const [start, sweep] = smallArc(d1, d2);
  const p1 = dirPt(c, start, r), p2 = dirPt(c, start + sweep, r);
  const arc = `A ${r} ${r} 0 0 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  return sector
    ? `M ${c.x} ${c.y} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} ${arc} Z`
    : `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} ${arc}`;
}

/** Arc (or right-angle square) marking the angle between two directions at c. */
export function AngleMark({ c, d1, d2, color, r = 26, fill = true, flat = false }: {
  c: P; d1: number; d2: number; color: string; r?: number; fill?: boolean; flat?: boolean;
}) {
  if (!flat && Math.abs(angleBetween(d1, d2) - 90) < 0.5) {
    const [start] = smallArc(d1, d2);
    const s = r * 0.55;
    const a = dirPt(c, start, s), b = dirPt(a, start + 90, s), e = dirPt(c, start + 90, s);
    return <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${e.x} ${e.y}`} fill={fill ? `${color}33` : 'none'} stroke={color} strokeWidth={2} />;
  }
  if (flat) {
    // half disc above the direction d1 → d1 + 180
    const p1 = dirPt(c, d1, r), p2 = dirPt(c, d1 + 180, r);
    return <path d={`M ${c.x} ${c.y} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 0 ${p2.x} ${p2.y} Z`} fill={fill ? `${color}33` : 'none'} stroke={color} strokeWidth={2} />;
  }
  return (
    <>
      {fill && <path d={arcPath(c, r, d1, d2, true)} fill={`${color}33`} stroke="none" />}
      <path d={arcPath(c, r, d1, d2)} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </>
  );
}

/** A small cross marking a point. */
export function Cross({ p, color = INK, size = 5 }: { p: P; color?: string; size?: number }) {
  return (
    <g stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <line x1={p.x - size} y1={p.y - size} x2={p.x + size} y2={p.y + size} />
      <line x1={p.x - size} y1={p.y + size} x2={p.x + size} y2={p.y - size} />
    </g>
  );
}

/** Label placed at `p`, pushed away from `from` by `gap`. */
export function Label({ p, from, text, color = INK, gap = 15, size = 16, italic = false }: {
  p: P; from: P; text: string; color?: string; gap?: number; size?: number; italic?: boolean;
}) {
  const d = dist(p, from) < 0.01 ? 90 : dirOf(from, p);
  const q = dirPt(p, d, gap);
  return (
    <text
      x={q.x} y={q.y + size * 0.35} textAnchor="middle"
      style={{ fill: color, fontSize: size, fontWeight: 600, fontStyle: italic ? 'italic' : 'normal', fontFamily: italic ? "'DM Serif Display', serif" : "'DM Sans', sans-serif", paintOrder: 'stroke', stroke: 'var(--bg)', strokeWidth: 4 }}
    >
      {text}
    </text>
  );
}

/** Half-line from c in direction d (drawn as a segment of length len). */
export function Ray({ c, d, len, color = INK, width = 2 }: { c: P; d: number; len: number; color?: string; width?: number }) {
  const e = dirPt(c, d, len);
  return <line x1={c.x} y1={c.y} x2={e.x} y2={e.y} stroke={color} strokeWidth={width} strokeLinecap="round" />;
}

// ── Protractor ───────────────────────────────────────────────────────────────

/**
 * Protractor centred at (cx, cy), rotated by `rot` degrees.
 * Inner scale: 0 on the right, increasing counter-clockwise. Outer scale: 0 on the left.
 * `coarse`: graduated every 10° with only « 90° » written (as on the worksheets).
 */
export function Protractor({ c, r, rot = 0, coarse = false, opacity = 1, interactive }: {
  c: P; r: number; rot?: number; coarse?: boolean; opacity?: number;
  interactive?: { onBodyDown: (e: React.PointerEvent) => void; onRotateDown: (e: React.PointerEvent) => void };
}) {
  const ticks: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  const at = (deg: number, rr: number): P => ({ x: rr * Math.cos((deg * Math.PI) / 180), y: -rr * Math.sin((deg * Math.PI) / 180) });
  const fs = Math.max(7, r * 0.06);

  if (coarse) {
    const inner = r * 0.62;
    for (let d = 0; d <= 180; d += 10) {
      const a1 = at(d, r), a2 = at(d, r - r * 0.09), b1 = at(d, inner), b2 = at(d, inner - r * 0.07);
      ticks.push(<line key={`o${d}`} x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} />);
      ticks.push(<line key={`i${d}`} x1={b1.x} y1={b1.y} x2={b2.x} y2={b2.y} />);
    }
    const t = at(90, r - r * 0.17);
    labels.push(<text key="90" x={t.x} y={t.y + fs * 0.35} textAnchor="middle" style={{ fontSize: fs * 1.15 }}>90°</text>);
  } else {
    // outer scale (0 on the left) near the rim, inner scale (0 on the right) inside, as on a real protractor
    for (let d = 0; d <= 180; d++) {
      const len = d % 10 === 0 ? r * 0.1 : d % 5 === 0 ? r * 0.065 : r * 0.04;
      const a1 = at(d, r), a2 = at(d, r - len);
      ticks.push(<line key={`t${d}`} x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} strokeWidth={d % 10 === 0 ? 1.1 : 0.6} />);
      if (d % 10 === 0) {
        const b1 = at(d, r * 0.76), b2 = at(d, r * 0.72);
        ticks.push(<line key={`u${d}`} x1={b1.x} y1={b1.y} x2={b2.x} y2={b2.y} strokeWidth={1} />);
        for (const [val, rr, key] of [[180 - d, r * 0.835, 'o'], [d, r * 0.64, 'i']] as const) {
          const p = at(d, rr);
          labels.push(
            <text key={`${key}${d}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
              transform={`rotate(${90 - d} ${p.x} ${p.y})`} style={{ fontSize: key === 'o' ? fs : fs * 0.78, fontWeight: key === 'o' ? 600 : 500 }}>
              {val}
            </text>,
          );
        }
      }
    }
  }

  const body = `M ${-r - 6} 0 A ${r + 6} ${r + 6} 0 0 1 ${r + 6} 0 L ${r + 6} ${r * 0.12} L ${-r - 6} ${r * 0.12} Z`;
  const handle = at(0, r + 22);
  return (
    <g transform={`translate(${c.x} ${c.y}) rotate(${-rot})`} opacity={opacity}>
      <path
        d={body}
        fill="rgba(96,165,250,0.13)"
        stroke={PROT_COLOR}
        strokeWidth={1.2}
        style={interactive ? { cursor: 'grab', touchAction: 'none' } : undefined}
        onPointerDown={interactive?.onBodyDown}
      />
      <path d={`M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke={PROT_COLOR} strokeWidth={1} pointerEvents="none" />
      {!coarse && <path d={`M ${-r * 0.76} 0 A ${r * 0.76} ${r * 0.76} 0 0 1 ${r * 0.76} 0`} fill="none" stroke={PROT_COLOR} strokeWidth={0.8} opacity={0.7} pointerEvents="none" />}
      {coarse && <path d={`M ${-r * 0.62} 0 A ${r * 0.62} ${r * 0.62} 0 0 1 ${r * 0.62} 0`} fill="none" stroke={PROT_COLOR} strokeWidth={0.8} pointerEvents="none" />}
      <line x1={-r - 6} y1={0} x2={r + 6} y2={0} stroke={PROT_COLOR} strokeWidth={1.2} pointerEvents="none" />
      <g stroke={PROT_COLOR} pointerEvents="none">{ticks}</g>
      <g style={{ fill: PROT_COLOR, fontFamily: "'DM Sans', sans-serif" }} pointerEvents="none">{labels}</g>
      {/* centre mark */}
      <g stroke="#F87171" strokeWidth={1.4} pointerEvents="none">
        <line x1={0} y1={-7} x2={0} y2={3} />
        <circle cx={0} cy={0} r={2.2} fill="#F87171" />
      </g>
      {interactive && (
        <g style={{ cursor: 'grab', touchAction: 'none' }} onPointerDown={interactive.onRotateDown}>
          <line x1={r + 6} y1={0} x2={handle.x} y2={handle.y} stroke={PROT_COLOR} strokeWidth={2} />
          <circle cx={handle.x} cy={handle.y} r={11} fill={PROT_COLOR} />
          <text x={handle.x} y={handle.y + 4.5} textAnchor="middle" style={{ fill: '#0F1117', fontSize: 13, fontWeight: 700 }} pointerEvents="none">↻</text>
        </g>
      )}
    </g>
  );
}

/**
 * Frame fitting a protractor of radius r rotated by rot (centred at the origin) and some extra points:
 * returns the centre to use and the size of a viewBox starting at (0, 0).
 */
export function fitProtractor(r: number, rot: number, extra: P[] = [], pad = 26): { c: P; w: number; h: number } {
  const local: P[] = [{ x: -r - 6, y: 0 }, { x: r + 6, y: 0 }, { x: -r - 6, y: r * 0.12 }, { x: r + 6, y: r * 0.12 }];
  for (let t = 0; t <= 180; t += 10) local.push({ x: (r + 6) * Math.cos((t * Math.PI) / 180), y: -(r + 6) * Math.sin((t * Math.PI) / 180) });
  const a = (-rot * Math.PI) / 180;
  const pts = [...local.map((q) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) })), ...extra];
  const minX = Math.min(...pts.map((q) => q.x)), maxX = Math.max(...pts.map((q) => q.x));
  const minY = Math.min(...pts.map((q) => q.y)), maxY = Math.max(...pts.map((q) => q.y));
  return { c: { x: pad - minX, y: pad - minY }, w: Math.ceil(maxX - minX + 2 * pad), h: Math.ceil(maxY - minY + 2 * pad) };
}

// ── Interactive canvas ───────────────────────────────────────────────────────

export interface ProtState { c: P; rot: number }

type Drag = { kind: 'move'; dx: number; dy: number } | { kind: 'rotate' } | { kind: 'ray' } | { kind: 'point' } | null;

/**
 * SVG canvas with an optional movable protractor and an optional draggable half-line (around `rayFrom`)
 * or draggable point. The protractor snaps its centre on `snapPoints` and its baseline on `snapDirs`.
 */
export function AngleCanvas({ w, h, maxWidth = 560, minWidth, children, prot, setProt, protR = 110, snapPoints = [], snapDirs = [], ray, point, overlay }: {
  w: number; h: number; maxWidth?: number;
  /** below this width the figure scrolls inside its frame instead of shrinking (fine graduations stay readable). */
  minWidth?: number;
  children?: React.ReactNode;
  prot?: ProtState; setProt?: (p: ProtState) => void; protR?: number;
  snapPoints?: P[]; snapDirs?: number[];
  /** draggable half-line: origin, current direction, setter (null = not yet drawn), integer snapping relative to `ref`. */
  ray?: { from: P; dir: number | null; len: number; refDir: number; set: (d: number) => void; disabled: boolean; color: string; label?: string };
  /** draggable point. */
  point?: { p: P | null; set: (p: P) => void; disabled: boolean; color: string; label: string };
  overlay?: React.ReactNode;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag>(null);

  const toSvg = (e: React.PointerEvent): P | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(m.inverse());
    return { x: Math.max(0, Math.min(w, q.x)), y: Math.max(0, Math.min(h, q.y)) };
  };
  const capture = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // pointer already released: dragging still works while the pointer stays over the canvas
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const q = toSvg(e);
    if (!q) return;
    if (drag.kind === 'move' && prot && setProt) {
      let c = { x: Math.max(0, Math.min(w, q.x - drag.dx)), y: Math.max(0, Math.min(h, q.y - drag.dy)) };
      const near = snapPoints.find((s) => dist(s, c) < 10);
      if (near) c = { ...near };
      setProt({ c, rot: prot.rot });
    } else if (drag.kind === 'rotate' && prot && setProt) {
      let rot = Math.round(dirOf(prot.c, q));
      for (const d of snapDirs) {
        for (const cand of [d, d + 180]) {
          if (angleBetween(rot, cand) < 3) rot = Math.round(norm360(cand));
        }
      }
      setProt({ c: prot.c, rot });
    } else if (drag.kind === 'ray' && ray) {
      const raw = dirOf(ray.from, q);
      const rel = Math.round(norm360(raw - ray.refDir));
      ray.set(norm360(ray.refDir + rel));
    } else if (drag.kind === 'point' && point) {
      point.set(q);
    }
  };

  const rayEnd = ray && ray.dir !== null ? dirPt(ray.from, ray.dir, ray.len) : null;

  return (
    <div className="ag-zoom">
    <svg
      ref={svgRef}
      viewBox={`0 0 ${w} ${h}`}
      className="ag-canvas"
      style={{ maxWidth, minWidth, touchAction: drag ? 'none' : 'manipulation' }}
      onPointerMove={onMove}
      onPointerUp={() => setDrag(null)}
      onPointerCancel={() => setDrag(null)}
      onPointerDown={(e) => {
        // a tap on the empty canvas places the half-line / the point there
        const q = toSvg(e);
        if (!q) return;
        if (ray && !ray.disabled && dist(q, ray.from) > 12) {
          const rel = Math.round(norm360(dirOf(ray.from, q) - ray.refDir));
          ray.set(norm360(ray.refDir + rel));
          capture(e);
          setDrag({ kind: 'ray' });
        } else if (point && !point.disabled) {
          point.set(q);
          capture(e);
          setDrag({ kind: 'point' });
        }
      }}
    >
      {children}
      {ray && rayEnd && (
        <g>
          <Ray c={ray.from} d={ray.dir!} len={ray.len} color={ray.color} width={2.4} />
          {ray.label && <Label p={rayEnd} from={ray.from} text={ray.label} color={ray.color} gap={14} italic={ray.label === ray.label.toLowerCase()} />}
        </g>
      )}
      {point?.p && (
        <g>
          <Cross p={point.p} color={point.color} size={6} />
          <Label p={point.p} from={{ x: point.p.x - 1, y: point.p.y + 1 }} text={point.label} color={point.color} gap={14} />
        </g>
      )}
      {prot && setProt && (
        <Protractor
          c={prot.c} r={protR} rot={prot.rot}
          interactive={{
            onBodyDown: (e) => {
              const q = toSvg(e);
              if (!q) return;
              capture(e);
              setDrag({ kind: 'move', dx: q.x - prot.c.x, dy: q.y - prot.c.y });
            },
            onRotateDown: (e) => {
              capture(e);
              setDrag({ kind: 'rotate' });
            },
          }}
        />
      )}
      {ray && rayEnd && !ray.disabled && (
        <circle
          cx={rayEnd.x} cy={rayEnd.y} r={12} fill={`${ray.color}55`} stroke={ray.color} strokeWidth={2}
          style={{ cursor: 'grab', touchAction: 'none' }}
          onPointerDown={(e) => { capture(e); setDrag({ kind: 'ray' }); }}
        />
      )}
      {point?.p && !point.disabled && (
        <circle
          cx={point.p.x} cy={point.p.y} r={13} fill={`${point.color}33`} stroke={point.color} strokeWidth={1.5}
          style={{ cursor: 'grab', touchAction: 'none' }}
          onPointerDown={(e) => { capture(e); setDrag({ kind: 'point' }); }}
        />
      )}
      {overlay}
    </svg>
    </div>
  );
}

/** Buttons that nudge the movable protractor (useful on touch screens). */
export function ProtNudge({ prot, setProt, disabled }: { prot: ProtState; setProt: (p: ProtState) => void; disabled: boolean }) {
  const btn = (label: string, f: () => void, title: string) => (
    <button type="button" className="ag-nudge" onClick={f} disabled={disabled} title={title}>{label}</button>
  );
  const move = (dx: number, dy: number) => setProt({ c: { x: prot.c.x + dx, y: prot.c.y + dy }, rot: prot.rot });
  const turn = (d: number) => setProt({ c: prot.c, rot: Math.round(norm360(prot.rot + d)) });
  return (
    <div className="ag-nudges">
      <span className="ag-nudge-label">Rapporteur :</span>
      {btn('←', () => move(-2, 0), 'Déplacer à gauche')}
      {btn('→', () => move(2, 0), 'Déplacer à droite')}
      {btn('↑', () => move(0, -2), 'Déplacer vers le haut')}
      {btn('↓', () => move(0, 2), 'Déplacer vers le bas')}
      {btn('↺ 1°', () => turn(1), 'Tourner de 1°')}
      {btn('↻ 1°', () => turn(-1), 'Tourner de 1° dans l’autre sens')}
    </div>
  );
}
