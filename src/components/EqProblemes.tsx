import { useState, useRef, useEffect, type KeyboardEvent, type RefObject, type ReactNode } from 'react';

const ACCENT = '#A78BFA';
const ACCENT_FG = '#0F1117';
const RED = '#F87171';

// ── Expression evaluator ──────────────────────────────────────────────────────

function evalExpr(raw: string, xVal: number): number {
  let e = raw.trim().toLowerCase()
    .replace(/\s+/g, '')
    .replace(/(\d)(x)/g, `$1*${xVal}`)
    .replace(/x/g, String(xVal))
    .replace(/(\d)\(/g, '$1*(')
    .replace(/\)\(/g, ')*(');

  const tokens: (string | number)[] = [];
  let i = 0;
  while (i < e.length) {
    if ('+-*/()'.includes(e[i])) tokens.push(e[i++]);
    else if (/\d/.test(e[i])) {
      let n = '';
      while (i < e.length && /[\d.]/.test(e[i])) n += e[i++];
      tokens.push(parseFloat(n));
    } else i++;
  }

  let p = 0;
  const expr = (): number => {
    let v = term();
    while (tokens[p] === '+' || tokens[p] === '-') {
      const op = tokens[p++] as string;
      v = op === '+' ? v + term() : v - term();
    }
    return v;
  };
  const term = (): number => {
    let v = unary();
    while (tokens[p] === '*' || tokens[p] === '/') {
      const op = tokens[p++] as string;
      const r = unary();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  };
  const unary = (): number => {
    if (tokens[p] === '-') { p++; return -atom(); }
    if (tokens[p] === '+') { p++; return atom(); }
    return atom();
  };
  const atom = (): number => {
    if (tokens[p] === '(') { p++; const v = expr(); if (tokens[p] === ')') p++; return v; }
    if (typeof tokens[p] === 'number') return tokens[p++] as number;
    return NaN;
  };
  try { return expr(); } catch { return NaN; }
}

function checkEq(input: string, expectedX: number): boolean {
  const parts = input.split('=');
  if (parts.length !== 2) return false;
  const [l, r] = parts;
  const diff = (x: number) => evalExpr(l, x) - evalExpr(r, x);
  const d0 = diff(expectedX);
  const d1 = diff(expectedX + 1);
  return !isNaN(d0) && !isNaN(d1) && Math.abs(d0) < 0.001 && Math.abs(d1) > 0.001;
}

function checkExprMatch(input: string, expected: string): boolean {
  if (!input.trim()) return false;
  for (const x of [3, 7, 11]) {
    const got = evalExpr(input, x);
    const exp = evalExpr(expected, x);
    if (isNaN(got) || Math.abs(got - exp) > 0.001) return false;
  }
  return true;
}

// ── RichEq ───────────────────────────────────────────────────────────────────

function RichEq({ eq, redParts }: { eq: string; redParts?: string[] }) {
  if (!redParts?.length) return <>{eq}</>;
  type S = { text: string; red: boolean };
  let segs: S[] = [{ text: eq, red: false }];
  for (const rp of redParts) {
    const next: S[] = [];
    for (const seg of segs) {
      if (seg.red) { next.push(seg); continue; }
      const parts = seg.text.split(rp);
      parts.forEach((p, i) => {
        if (p) next.push({ text: p, red: false });
        if (i < parts.length - 1) next.push({ text: rp, red: true });
      });
    }
    segs = next;
  }
  return (
    <>
      {segs.map((s, i) =>
        s.red
          ? <span key={i} style={{ color: RED, fontWeight: 700 }}>{s.text}</span>
          : <span key={i}>{s.text}</span>
      )}
    </>
  );
}

// ── CorrSteps ─────────────────────────────────────────────────────────────────

interface CorrStep { label: string; eq: string; redParts?: string[] }

function CorrSteps({ steps, conclusion }: { steps: CorrStep[]; conclusion?: string }) {
  return (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 2.1 }}>
      {steps.map((s, i) => (
        <div key={i}>
          <span style={{ color: 'var(--muted)' }}>{s.label} : </span>
          <span style={{ color: 'var(--text)' }}><RichEq eq={s.eq} redParts={s.redParts} /></span>
        </div>
      ))}
      {conclusion && (
        <div style={{ marginTop: 6, color: 'var(--text)', fontWeight: 600 }}>{conclusion}</div>
      )}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function QL({ text }: { text: string }) {
  return <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14, marginBottom: 6 }}>{text}</div>;
}

function Vbtn({ onClick, label = 'Valider' }: { onClick: () => void; label?: string }) {
  return (
    <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={onClick}>
      {label}
    </button>
  );
}

function OkBox({ children }: { children: ReactNode }) {
  return <div className="gd-success" style={{ marginTop: 10 }}>{children}</div>;
}

function TextInp({ inputRef, value, onChange, onEnter, disabled, wide }: {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  disabled: boolean;
  wide?: boolean;
}) {
  return (
    <input
      ref={inputRef}
      type="text"
      className="prob-inp"
      style={wide ? { width: 280 } : undefined}
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') onEnter(); }}
    />
  );
}

function NumInp({ inputRef, value, onChange, onEnter, disabled }: {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  disabled: boolean;
}) {
  return (
    <input
      ref={inputRef}
      type="number"
      className="gd-blank"
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') onEnter(); }}
    />
  );
}

// ── SVG tick marks ────────────────────────────────────────────────────────────

function Ticks({ x1, y1, x2, y2, n = 1 }: { x1: number; y1: number; x2: number; y2: number; n?: number }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const off = (i - (n - 1) / 2) * 5;
        const cx = mx + ux * off, cy = my + uy * off;
        return (
          <line key={i}
            x1={cx - px * 6} y1={cy - py * 6}
            x2={cx + px * 6} y2={cy + py * 6}
            stroke="var(--text)" strokeWidth={1.5} />
        );
      })}
    </>
  );
}

// ── Param types & generators ──────────────────────────────────────────────────

interface Ex1Params { diff: number; x: number; rouges: number; total: number }
interface Ex2Params { extra: number; x: number; adultes: number; enfants: number; total: number }
interface Ex3Params { W: number; x: number; sqSide: number; perim: number }
interface Ex4Params { pxCro: number; diff: number; nCro: number; nEcl: number; total: number; pxEcl: number }
interface Ex5Params { larg: number; L: number; lon: number; perim: number }

function genEx1(): Ex1Params {
  const diff = (Math.floor(Math.random() * 5) + 1) * 5;
  const x = (Math.floor(Math.random() * 10) + 3) * 5;
  return { diff, x, rouges: x + diff, total: 2 * x + diff };
}
function genEx2(): Ex2Params {
  const extra = (Math.floor(Math.random() * 5) + 2) * 10;
  const x = (Math.floor(Math.random() * 8) + 5) * 10;
  return { extra, x, adultes: 2 * x, enfants: x + extra, total: 4 * x + extra };
}
function genEx3(): Ex3Params {
  const k = Math.floor(Math.random() * 5) + 2;
  const W = 7 * k, x = 4 * k, sqSide = 3 * k;
  return { W, x, sqSide, perim: 3 * x };
}
function genEx4(): Ex4Params {
  const pxCro = Math.floor(Math.random() * 3) + 1;
  const diff = Math.floor(Math.random() * 2) + 1;
  const nCro = Math.floor(Math.random() * 3) + 2;
  const nEcl = Math.floor(Math.random() * 3) + 2;
  const total = nCro * pxCro + nEcl * (pxCro + diff);
  return { pxCro, diff, nCro, nEcl, total, pxEcl: pxCro + diff };
}
function genEx5(): Ex5Params {
  const larg = Math.floor(Math.random() * 8) + 4;
  const L = Math.floor(Math.random() * 6) + 2;
  const lon = larg + L;
  return { larg, L, lon, perim: 4 * larg + 2 * L };
}
function genAll() {
  return { ex1: genEx1(), ex2: genEx2(), ex3: genEx3(), ex4: genEx4(), ex5: genEx5() };
}

// ── Correction steps ──────────────────────────────────────────────────────────

function ex1Steps(p: Ex1Params): CorrStep[] {
  const rhs1 = p.total - p.diff;
  return [
    { label: 'Équation posée', eq: `2x + ${p.diff} = ${p.total}` },
    { label: `On soustrait ${p.diff} des deux membres`, eq: `2x + ${p.diff} − ${p.diff} = ${p.total} − ${p.diff}`, redParts: [`− ${p.diff}`] },
    { label: 'On simplifie', eq: `2x = ${rhs1}` },
    { label: 'On divise les deux membres par 2', eq: `2x ÷ 2 = ${rhs1} ÷ 2`, redParts: ['÷ 2'] },
    { label: 'On simplifie', eq: `x = ${p.x}` },
  ];
}
function ex2Steps(p: Ex2Params): CorrStep[] {
  const rhs1 = p.total - p.extra;
  return [
    { label: 'Équation posée', eq: `4x + ${p.extra} = ${p.total}` },
    { label: `On soustrait ${p.extra} des deux membres`, eq: `4x + ${p.extra} − ${p.extra} = ${p.total} − ${p.extra}`, redParts: [`− ${p.extra}`] },
    { label: 'On simplifie', eq: `4x = ${rhs1}` },
    { label: 'On divise les deux membres par 4', eq: `4x ÷ 4 = ${rhs1} ÷ 4`, redParts: ['÷ 4'] },
    { label: 'On simplifie', eq: `x = ${p.x}` },
  ];
}
function ex3Steps(p: Ex3Params): CorrStep[] {
  const rhs1 = 4 * p.W;
  return [
    { label: 'Équation posée', eq: `3x = 4(${p.W} − x)` },
    { label: 'On développe le membre droit', eq: `3x = ${rhs1} − 4x` },
    { label: 'On ajoute 4x des deux membres', eq: `3x + 4x = ${rhs1} − 4x + 4x`, redParts: ['+ 4x'] },
    { label: 'On simplifie', eq: `7x = ${rhs1}` },
    { label: 'On divise les deux membres par 7', eq: `7x ÷ 7 = ${rhs1} ÷ 7`, redParts: ['÷ 7'] },
    { label: 'On simplifie', eq: `x = ${p.x}` },
  ];
}
function ex4Steps(p: Ex4Params): CorrStep[] {
  const coef = p.nCro + p.nEcl;
  const cst = p.nEcl * p.diff;
  const rhs1 = p.total - cst;
  return [
    { label: 'Équation posée', eq: `${coef}x + ${cst} = ${p.total}` },
    { label: `On soustrait ${cst} des deux membres`, eq: `${coef}x + ${cst} − ${cst} = ${p.total} − ${cst}`, redParts: [`− ${cst}`] },
    { label: 'On simplifie', eq: `${coef}x = ${rhs1}` },
    { label: `On divise les deux membres par ${coef}`, eq: `${coef}x ÷ ${coef} = ${rhs1} ÷ ${coef}`, redParts: [`÷ ${coef}`] },
    { label: 'On simplifie', eq: `x = ${p.pxCro}` },
  ];
}
function ex5Steps(p: Ex5Params): CorrStep[] {
  const cst = 2 * p.L;
  const rhs1 = p.perim - cst;
  return [
    { label: 'Équation posée', eq: `4x + ${cst} = ${p.perim}` },
    { label: `On soustrait ${cst} des deux membres`, eq: `4x + ${cst} − ${cst} = ${p.perim} − ${cst}`, redParts: [`− ${cst}`] },
    { label: 'On simplifie', eq: `4x = ${rhs1}` },
    { label: 'On divise les deux membres par 4', eq: `4x ÷ 4 = ${rhs1} ÷ 4`, redParts: ['÷ 4'] },
    { label: 'On simplifie', eq: `x = ${p.larg}` },
  ];
}

// ── SVG figures ───────────────────────────────────────────────────────────────

function Ex3Fig({ p }: { p: Ex3Params }) {
  const ts = 80, ss = 60;
  const h = ts * Math.sin(Math.PI / 3);
  const ax = 15, ay = 92;
  const bx = ax + ts, by = ay;
  const cx_ = ax + ts / 2, cy_ = Math.round(ay - h);
  const gy = ay - ss;

  return (
    <svg viewBox="0 0 175 110" style={{ width: '100%', maxWidth: 280, display: 'block', margin: '0.8rem auto' }}>
      <polygon points={`${ax},${ay} ${bx},${by} ${cx_},${cy_}`} stroke="var(--text)" strokeWidth={1.5} fill="none" />
      <rect x={bx} y={gy} width={ss} height={ss} stroke="var(--text)" strokeWidth={1.5} fill="none" />
      <Ticks x1={ax} y1={ay} x2={bx} y2={by} n={1} />
      <Ticks x1={bx} y1={by} x2={cx_} y2={cy_} n={1} />
      <Ticks x1={cx_} y1={cy_} x2={ax} y2={ay} n={1} />
      <Ticks x1={bx} y1={ay} x2={bx + ss} y2={ay} n={2} />
      <Ticks x1={bx + ss} y1={ay} x2={bx + ss} y2={gy} n={2} />
      <Ticks x1={bx + ss} y1={gy} x2={bx} y2={gy} n={2} />
      <Ticks x1={bx} y1={gy} x2={bx} y2={ay} n={2} />
      <text x={ax + ts / 2} y={107} textAnchor="middle" fontSize={10} fill="var(--muted)" fontFamily="DM Mono, monospace">x cm</text>
      <text x={bx + ss / 2} y={107} textAnchor="middle" fontSize={10} fill="var(--muted)" fontFamily="DM Mono, monospace">({p.W}−x) cm</text>
    </svg>
  );
}

function Ex5Fig({ p }: { p: Ex5Params }) {
  const rw = 110, rh = 60;
  const rx = 32, ry = 18;
  return (
    <svg viewBox="0 0 165 100" style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0.8rem auto' }}>
      <rect x={rx} y={ry} width={rw} height={rh} stroke="var(--text)" strokeWidth={1.5} fill="none" />
      <Ticks x1={rx} y1={ry} x2={rx + rw} y2={ry} n={2} />
      <Ticks x1={rx} y1={ry + rh} x2={rx + rw} y2={ry + rh} n={2} />
      <Ticks x1={rx} y1={ry} x2={rx} y2={ry + rh} n={1} />
      <Ticks x1={rx + rw} y1={ry} x2={rx + rw} y2={ry + rh} n={1} />
      <text x={rx + rw / 2} y={93} textAnchor="middle" fontSize={10} fill="var(--muted)" fontFamily="DM Mono, monospace">(x + {p.L}) cm</text>
      <text x={16} y={ry + rh / 2 + 4} textAnchor="middle" fontSize={10} fill="var(--muted)" fontFamily="DM Mono, monospace">x cm</text>
    </svg>
  );
}

// ── SolutionBox ───────────────────────────────────────────────────────────────

function SolutionBox({ steps, conclusion, open, onToggle }: {
  steps: CorrStep[];
  conclusion: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <button type="button" className="hint-toggle" style={{ marginTop: 14 }} onClick={onToggle}>
        <span>{open ? '▼' : '▶'}</span> Voir la solution
      </button>
      <div className={`steps-box${open ? ' open' : ''}`}>
        <CorrSteps steps={steps} conclusion={conclusion} />
      </div>
    </>
  );
}

// ── Exercise 1: Autocollants ──────────────────────────────────────────────────

function Ex1Card({ p }: { p: Ex1Params }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [va, setVa] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const rA = useRef<HTMLInputElement>(null);
  const rEq = useRef<HTMLInputElement>(null);
  const rX = useRef<HTMLInputElement>(null);
  const rC = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) rA.current?.focus();
    else if (step === 1) rEq.current?.focus();
    else if (step === 2) rX.current?.focus();
    else if (step === 3) rC.current?.focus();
  }, [step]);

  const next = (n: number) => { setErr(''); setStep(n); };
  const doA = () => {
    if (checkExprMatch(va, `x + ${p.diff}`)) next(1);
    else setErr(`Pas tout à fait. Si x = bleus et il y a ${p.diff} rouges de plus, alors rouges = x + ${p.diff}. Réessaie !`);
  };
  const doEq = () => {
    if (checkEq(veq, p.x)) next(2);
    else setErr(`Cette équation n'est pas correcte. Pense à exprimer la totalité des ${p.total} autocollants en fonction de x. Réessaie !`);
  };
  const doX = () => {
    if (parseFloat(vx) === p.x) next(3);
    else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`);
  };
  const doC = () => {
    if (parseFloat(vc) === p.rouges) next(4);
    else setErr(`Rappelle-toi : rouges = x + ${p.diff} = ${p.x} + ${p.diff}. Réessaie !`);
  };

  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 1</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Autocollants</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>
        Un album contient <strong>{p.total}</strong> autocollants rouges et bleus.<br />
        Il y a <strong>{p.diff}</strong> autocollants rouges de plus que d'autocollants bleus.<br />
        On note <strong>x</strong> le nombre d'autocollants bleus.
      </div>

      <div className="gd-step">
        <QL text="a) Exprime le nombre d'autocollants rouges en fonction de x." />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>Rouges =</span>
          <TextInp inputRef={rA} value={va} onChange={setVa} onEnter={doA} disabled={step > 0} />
        </div>
        {step === 0 && <Vbtn onClick={doA} />}
        {step > 0 && <OkBox>✓ Rouges = <strong>x + {p.diff}</strong></OkBox>}
      </div>

      {step >= 1 && (
        <div className="gd-step">
          <QL text="b) Écris une équation qui traduit la situation." />
          <TextInp inputRef={rEq} value={veq} onChange={setVeq} onEnter={doEq} disabled={step > 1} wide />
          {step === 1 && <Vbtn onClick={doEq} label="Valider l'équation" />}
          {step > 1 && <OkBox>✓ Équation correcte !</OkBox>}
        </div>
      )}

      {step >= 2 && (
        <div className="gd-step">
          <QL text="Résous l'équation :" />
          <div className="gd-eq-line" style={{ marginTop: 8 }}>
            <span>x =</span>
            <NumInp inputRef={rX} value={vx} onChange={setVx} onEnter={doX} disabled={step > 2} />
          </div>
          {step === 2 && <Vbtn onClick={doX} />}
          {step > 2 && <OkBox>✓ <strong>x = {p.x}</strong></OkBox>}
        </div>
      )}

      {step >= 3 && (
        <div className="gd-step">
          <QL text="c) Combien y a-t-il d'autocollants rouges dans l'album ?" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>autocollants rouges</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ Il y a <strong>{p.rouges}</strong> autocollants rouges dans l'album.</OkBox>}
        </div>
      )}

      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex1Steps(p)} conclusion={`→ Il y a ${p.rouges} autocollants rouges.`} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

// ── Exercise 2: Festival ──────────────────────────────────────────────────────

function Ex2Card({ p }: { p: Ex2Params }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [vAd, setVAd] = useState('');
  const [vEn, setVEn] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const rAd = useRef<HTMLInputElement>(null);
  const rEn = useRef<HTMLInputElement>(null);
  const rEq = useRef<HTMLInputElement>(null);
  const rX = useRef<HTMLInputElement>(null);
  const rC = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) rAd.current?.focus();
    else if (step === 1) rEq.current?.focus();
    else if (step === 2) rX.current?.focus();
    else if (step === 3) rC.current?.focus();
  }, [step]);

  const next = (n: number) => { setErr(''); setStep(n); };
  const doA = () => {
    const aOk = checkExprMatch(vAd, '2x');
    const eOk = checkExprMatch(vEn, `x + ${p.extra}`);
    if (aOk && eOk) next(1);
    else if (!aOk) setErr("Adultes : il y a deux fois plus d'adultes que d'adolescents → adultes = 2x. Réessaie !");
    else setErr(`Enfants : il y a ${p.extra} enfants de plus que d'adolescents → enfants = x + ${p.extra}. Réessaie !`);
  };
  const doEq = () => {
    if (checkEq(veq, p.x)) next(2);
    else setErr(`Cette équation n'est pas correcte. Exprime le total (${p.total}) en fonction de x. Réessaie !`);
  };
  const doX = () => {
    if (parseFloat(vx) === p.x) next(3);
    else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`);
  };
  const doC = () => {
    if (parseFloat(vc) === p.enfants) next(4);
    else setErr(`Rappelle-toi : enfants = x + ${p.extra} = ${p.x} + ${p.extra}. Réessaie !`);
  };

  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 2</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Festival de musique</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>
        Lors d'un festival, <strong>{p.total}</strong> spectateurs sont présents : des adolescents, des adultes et des enfants.<br />
        Il y a <strong>deux fois plus d'adultes</strong> que d'adolescents.<br />
        Il y a <strong>{p.extra} enfants de plus</strong> que d'adolescents.<br />
        On note <strong>x</strong> le nombre d'adolescents.
      </div>

      <div className="gd-step">
        <QL text="a) Exprime en fonction de x le nombre d'adultes et le nombre d'enfants." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 100 }}>Adultes =</span>
            <TextInp inputRef={rAd} value={vAd} onChange={setVAd} onEnter={() => rEn.current?.focus()} disabled={step > 0} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 100 }}>Enfants =</span>
            <TextInp inputRef={rEn} value={vEn} onChange={setVEn} onEnter={doA} disabled={step > 0} />
          </div>
        </div>
        {step === 0 && <Vbtn onClick={doA} />}
        {step > 0 && <OkBox>✓ Adultes = <strong>2x</strong> · Enfants = <strong>x + {p.extra}</strong></OkBox>}
      </div>

      {step >= 1 && (
        <div className="gd-step">
          <QL text="b) Écris une équation qui traduit la situation." />
          <TextInp inputRef={rEq} value={veq} onChange={setVeq} onEnter={doEq} disabled={step > 1} wide />
          {step === 1 && <Vbtn onClick={doEq} label="Valider l'équation" />}
          {step > 1 && <OkBox>✓ Équation correcte !</OkBox>}
        </div>
      )}

      {step >= 2 && (
        <div className="gd-step">
          <QL text="Résous l'équation :" />
          <div className="gd-eq-line" style={{ marginTop: 8 }}>
            <span>x =</span>
            <NumInp inputRef={rX} value={vx} onChange={setVx} onEnter={doX} disabled={step > 2} />
          </div>
          {step === 2 && <Vbtn onClick={doX} />}
          {step > 2 && <OkBox>✓ <strong>x = {p.x}</strong></OkBox>}
        </div>
      )}

      {step >= 3 && (
        <div className="gd-step">
          <QL text="c) Combien y a-t-il d'enfants parmi les spectateurs ?" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>enfants</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ Il y a <strong>{p.enfants}</strong> enfants parmi les spectateurs.</OkBox>}
        </div>
      )}

      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex2Steps(p)} conclusion={`→ Il y a ${p.enfants} enfants parmi les spectateurs.`} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

// ── Exercise 3: Géométrie — Triangle + Carré ──────────────────────────────────

function Ex3Card({ p }: { p: Ex3Params }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [vSq, setVSq] = useState('');
  const [vPer, setVPer] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const rSq = useRef<HTMLInputElement>(null);
  const rPer = useRef<HTMLInputElement>(null);
  const rEq = useRef<HTMLInputElement>(null);
  const rX = useRef<HTMLInputElement>(null);
  const rC = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) rSq.current?.focus();
    else if (step === 1) rEq.current?.focus();
    else if (step === 2) rX.current?.focus();
    else if (step === 3) rC.current?.focus();
  }, [step]);

  const next = (n: number) => { setErr(''); setStep(n); };
  const doA = () => {
    const sOk = checkExprMatch(vSq, `${p.W} - x`);
    const pOk = checkExprMatch(vPer, '3x');
    if (sOk && pOk) next(1);
    else if (!sOk) setErr(`Côté du carré : la largeur totale est ${p.W} cm, le triangle prend x cm → carré = ${p.W} − x. Réessaie !`);
    else setErr('Périmètre du triangle équilatéral : trois côtés égaux à x → périmètre = 3x. Réessaie !');
  };
  const doEq = () => {
    if (checkEq(veq, p.x)) next(2);
    else setErr(`Cette équation n'est pas correcte. Égalise les deux périmètres. Réessaie !`);
  };
  const doX = () => {
    if (parseFloat(vx) === p.x) next(3);
    else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`);
  };
  const doC = () => {
    if (parseFloat(vc) === p.perim) next(4);
    else setErr(`Périmètre = 3x = 3 × ${p.x}. Réessaie !`);
  };

  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 3</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Géométrie — Périmètres égaux</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>
        Un triangle équilatéral et un carré sont placés côte à côte.<br />
        La <strong>largeur totale</strong> est <strong>{p.W} cm</strong>.<br />
        On note <strong>x</strong> le côté du triangle.<br />
        Les deux figures ont le <strong>même périmètre</strong>.
      </div>
      <Ex3Fig p={p} />

      <div className="gd-step">
        <QL text="a) Exprime en fonction de x le côté du carré et le périmètre du triangle." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 162 }}>Côté du carré =</span>
            <TextInp inputRef={rSq} value={vSq} onChange={setVSq} onEnter={() => rPer.current?.focus()} disabled={step > 0} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>cm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 162 }}>Périmètre △ =</span>
            <TextInp inputRef={rPer} value={vPer} onChange={setVPer} onEnter={doA} disabled={step > 0} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>cm</span>
          </div>
        </div>
        {step === 0 && <Vbtn onClick={doA} />}
        {step > 0 && <OkBox>✓ Côté carré = <strong>{p.W} − x</strong> · Périmètre △ = <strong>3x</strong></OkBox>}
      </div>

      {step >= 1 && (
        <div className="gd-step">
          <QL text="b) Écris une équation qui exprime que les périmètres sont égaux." />
          <TextInp inputRef={rEq} value={veq} onChange={setVeq} onEnter={doEq} disabled={step > 1} wide />
          {step === 1 && <Vbtn onClick={doEq} label="Valider l'équation" />}
          {step > 1 && <OkBox>✓ Équation correcte !</OkBox>}
        </div>
      )}

      {step >= 2 && (
        <div className="gd-step">
          <QL text="Résous l'équation :" />
          <div className="gd-eq-line" style={{ marginTop: 8 }}>
            <span>x =</span>
            <NumInp inputRef={rX} value={vx} onChange={setVx} onEnter={doX} disabled={step > 2} />
          </div>
          {step === 2 && <Vbtn onClick={doX} />}
          {step > 2 && <OkBox>✓ <strong>x = {p.x}</strong> cm</OkBox>}
        </div>
      )}

      {step >= 3 && (
        <div className="gd-step">
          <QL text="c) Quel est le périmètre commun des deux figures ?" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>cm</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ Le périmètre commun est <strong>{p.perim} cm</strong>. (3 × {p.x} = {p.perim} et 4 × {p.sqSide} = {p.perim} ✓)</OkBox>}
        </div>
      )}

      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex3Steps(p)} conclusion={`→ Le périmètre commun est ${p.perim} cm.`} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

// ── Exercise 4: Pâtisserie ────────────────────────────────────────────────────

function Ex4Card({ p }: { p: Ex4Params }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [vEcl, setVEcl] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const rEcl = useRef<HTMLInputElement>(null);
  const rEq = useRef<HTMLInputElement>(null);
  const rX = useRef<HTMLInputElement>(null);
  const rC = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) rEcl.current?.focus();
    else if (step === 1) rEq.current?.focus();
    else if (step === 2) rX.current?.focus();
    else if (step === 3) rC.current?.focus();
  }, [step]);

  const next = (n: number) => { setErr(''); setStep(n); };
  const doA = () => {
    if (checkExprMatch(vEcl, `x + ${p.diff}`)) next(1);
    else setErr(`Un éclair coûte ${p.diff} € de plus qu'un croissant → prix éclair = x + ${p.diff}. Réessaie !`);
  };
  const doEq = () => {
    if (checkEq(veq, p.pxCro)) next(2);
    else setErr(`Cette équation n'est pas correcte. Exprime le coût total (${p.total} €) en fonction de x. Réessaie !`);
  };
  const doX = () => {
    if (parseFloat(vx) === p.pxCro) next(3);
    else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`);
  };
  const doC = () => {
    if (parseFloat(vc) === p.pxEcl) next(4);
    else setErr(`Prix éclair = x + ${p.diff} = ${p.pxCro} + ${p.diff}. Réessaie !`);
  };

  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 4</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pâtisserie</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>
        Dans une pâtisserie, un éclair coûte <strong>{p.diff} € de plus</strong> qu'un croissant.<br />
        Léa achète <strong>{p.nCro} croissant{p.nCro > 1 ? 's' : ''}</strong> et <strong>{p.nEcl} éclair{p.nEcl > 1 ? 's' : ''}</strong> pour <strong>{p.total} €</strong>.<br />
        On note <strong>x</strong> le prix (en €) d'un croissant.
      </div>

      <div className="gd-step">
        <QL text="a) Exprime le prix d'un éclair en fonction de x." />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>Prix éclair =</span>
          <TextInp inputRef={rEcl} value={vEcl} onChange={setVEcl} onEnter={doA} disabled={step > 0} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>€</span>
        </div>
        {step === 0 && <Vbtn onClick={doA} />}
        {step > 0 && <OkBox>✓ Prix éclair = <strong>x + {p.diff}</strong> €</OkBox>}
      </div>

      {step >= 1 && (
        <div className="gd-step">
          <QL text="b) Écris une équation qui traduit le coût total de l'achat." />
          <TextInp inputRef={rEq} value={veq} onChange={setVeq} onEnter={doEq} disabled={step > 1} wide />
          {step === 1 && <Vbtn onClick={doEq} label="Valider l'équation" />}
          {step > 1 && <OkBox>✓ Équation correcte !</OkBox>}
        </div>
      )}

      {step >= 2 && (
        <div className="gd-step">
          <QL text="Résous l'équation :" />
          <div className="gd-eq-line" style={{ marginTop: 8 }}>
            <span>x =</span>
            <NumInp inputRef={rX} value={vx} onChange={setVx} onEnter={doX} disabled={step > 2} />
          </div>
          {step === 2 && <Vbtn onClick={doX} />}
          {step > 2 && <OkBox>✓ <strong>x = {p.pxCro}</strong> €</OkBox>}
        </div>
      )}

      {step >= 3 && (
        <div className="gd-step">
          <QL text="c) Quel est le prix d'un éclair ?" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>€</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ Un éclair coûte <strong>{p.pxEcl} €</strong>.</OkBox>}
        </div>
      )}

      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex4Steps(p)} conclusion={`→ Croissant : ${p.pxCro} €  ·  Éclair : ${p.pxEcl} €`} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

// ── Exercise 5: Géométrie — Rectangle ────────────────────────────────────────

function Ex5Card({ p }: { p: Ex5Params }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [vLon, setVLon] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const rLon = useRef<HTMLInputElement>(null);
  const rEq = useRef<HTMLInputElement>(null);
  const rX = useRef<HTMLInputElement>(null);
  const rC = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) rLon.current?.focus();
    else if (step === 1) rEq.current?.focus();
    else if (step === 2) rX.current?.focus();
    else if (step === 3) rC.current?.focus();
  }, [step]);

  const next = (n: number) => { setErr(''); setStep(n); };
  const doA = () => {
    if (checkExprMatch(vLon, `x + ${p.L}`)) next(1);
    else setErr(`La longueur est ${p.L} cm de plus que la largeur → longueur = x + ${p.L}. Réessaie !`);
  };
  const doEq = () => {
    if (checkEq(veq, p.larg)) next(2);
    else setErr(`Cette équation n'est pas correcte. Exprime le périmètre (${p.perim} cm) en fonction de x. Réessaie !`);
  };
  const doX = () => {
    if (parseFloat(vx) === p.larg) next(3);
    else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`);
  };
  const doC = () => {
    if (parseFloat(vc) === p.lon) next(4);
    else setErr(`Longueur = x + ${p.L} = ${p.larg} + ${p.L}. Réessaie !`);
  };

  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 5</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Géométrie — Rectangle</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>
        Un rectangle a une <strong>longueur de {p.L} cm de plus</strong> que sa largeur.<br />
        Son <strong>périmètre est {p.perim} cm</strong>.<br />
        On note <strong>x</strong> la largeur (en cm) du rectangle.
      </div>
      <Ex5Fig p={p} />

      <div className="gd-step">
        <QL text="a) Exprime la longueur du rectangle en fonction de x." />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 105 }}>Longueur =</span>
          <TextInp inputRef={rLon} value={vLon} onChange={setVLon} onEnter={doA} disabled={step > 0} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>cm</span>
        </div>
        {step === 0 && <Vbtn onClick={doA} />}
        {step > 0 && <OkBox>✓ Longueur = <strong>x + {p.L}</strong> cm</OkBox>}
      </div>

      {step >= 1 && (
        <div className="gd-step">
          <QL text="b) Écris une équation à partir du périmètre." />
          <TextInp inputRef={rEq} value={veq} onChange={setVeq} onEnter={doEq} disabled={step > 1} wide />
          {step === 1 && <Vbtn onClick={doEq} label="Valider l'équation" />}
          {step > 1 && <OkBox>✓ Équation correcte !</OkBox>}
        </div>
      )}

      {step >= 2 && (
        <div className="gd-step">
          <QL text="Résous l'équation :" />
          <div className="gd-eq-line" style={{ marginTop: 8 }}>
            <span>x =</span>
            <NumInp inputRef={rX} value={vx} onChange={setVx} onEnter={doX} disabled={step > 2} />
          </div>
          {step === 2 && <Vbtn onClick={doX} />}
          {step > 2 && <OkBox>✓ <strong>x = {p.larg}</strong> cm</OkBox>}
        </div>
      )}

      {step >= 3 && (
        <div className="gd-step">
          <QL text="c) Quelle est la longueur du rectangle ?" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>cm</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ La longueur du rectangle est <strong>{p.lon} cm</strong>.</OkBox>}
        </div>
      )}

      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex5Steps(p)} conclusion={`→ Largeur : ${p.larg} cm  ·  Longueur : ${p.lon} cm`} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EqProblemes() {
  const [params, setParams] = useState(genAll);
  const [seriesKey, setSeriesKey] = useState(0);
  function newSeries() { setParams(genAll()); setSeriesKey(k => k + 1); }
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', fontWeight: 400, color: 'var(--text)', margin: 0 }}>
          Résolution de <span style={{ color: ACCENT }}>problèmes</span>
        </h1>
        <button className="btn-secondary" onClick={newSeries}>↺ Nouvelle série</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Ex1Card key={`1-${seriesKey}`} p={params.ex1} />
        <Ex2Card key={`2-${seriesKey}`} p={params.ex2} />
        <Ex3Card key={`3-${seriesKey}`} p={params.ex3} />
        <Ex4Card key={`4-${seriesKey}`} p={params.ex4} />
        <Ex5Card key={`5-${seriesKey}`} p={params.ex5} />
      </div>
    </div>
  );
}
