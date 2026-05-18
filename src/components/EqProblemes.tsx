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

// ── Shared small components ───────────────────────────────────────────────────

interface Step { label: string; eq: string; op: boolean }

function CorrSteps({ steps }: { steps: Step[] }) {
  return (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 2.1, marginTop: 10 }}>
      {steps.map((s, i) => (
        <div key={i}>
          <span style={{ color: s.op ? RED : 'var(--muted)' }}>{s.label} : </span>
          <span style={{ color: 'var(--text)' }}>{s.eq}</span>
        </div>
      ))}
    </div>
  );
}

function QL({ text }: { text: string }) {
  return (
    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14, marginBottom: 6 }}>{text}</div>
  );
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

function TextInp({
  inputRef, value, onChange, onEnter, disabled, placeholder, wide,
}: {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  disabled: boolean;
  placeholder?: string;
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
      placeholder={placeholder}
    />
  );
}

function NumInp({
  inputRef, value, onChange, onEnter, disabled,
}: {
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

// ── Exercise 1: Autocollants ──────────────────────────────────────────────────
// x = bleus, rouges = x+24, 2x+24=180 → x=78, rouges=102

const EX1: Step[] = [
  { label: 'Équation posée', eq: '2x + 24 = 180', op: false },
  { label: 'On soustrait 24 des deux membres', eq: '2x + 24 − 24 = 180 − 24', op: true },
  { label: 'On simplifie', eq: '2x = 156', op: false },
  { label: 'On divise les deux membres par 2', eq: '2x ÷ 2 = 156 ÷ 2', op: true },
  { label: 'On simplifie', eq: 'x = 78', op: false },
];

function Ex1({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [va, setVa] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const r0 = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) r0.current?.focus();
    else if (step === 1) r1.current?.focus();
    else if (step === 2) r2.current?.focus();
    else if (step === 3) r3.current?.focus();
  }, [step]);

  const next = (n: number) => { setErr(''); setStep(n); };

  const doA = () => {
    if (checkExprMatch(va, 'x + 24')) next(1);
    else setErr("Ce n'est pas correct. Le nombre de rouges est x + 24 — l'opération inverse de − 24. Réessaie !");
  };
  const doEq = () => {
    if (checkEq(veq, 78)) next(2);
    else setErr("Cette équation n'a pas x = 78 pour solution. Vérifie que tu traduis bien la situation totale. Réessaie !");
  };
  const doX = () => {
    if (parseFloat(vx) === 78) next(3);
    else setErr("Ce n'est pas la bonne valeur de x. Réessaie !");
  };
  const doC = () => {
    if (parseFloat(vc) === 102) next(4);
    else setErr("Calcule rouges = x + 24 = 78 + 24. Réessaie !");
  };

  return (
    <div className="gd-shell">
      <div className="gd-card">
        <p className="gd-level-tag">Exercice 1 / 3</p>
        <h2 className="gd-title">Autocollants</h2>
        <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9 }}>
          Un album contient <strong>180</strong> autocollants rouges et bleus.<br />
          Il y a <strong>24</strong> autocollants rouges de plus que d'autocollants bleus.<br />
          On note <strong>x</strong> le nombre d'autocollants bleus.
        </div>
        <hr className="gd-divider" />

        <div className="gd-step">
          <QL text="a) Exprime le nombre d'autocollants rouges en fonction de x." />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>Rouges =</span>
            <TextInp inputRef={r0} value={va} onChange={setVa} onEnter={doA} disabled={step > 0} placeholder="expression en x" />
          </div>
          {step === 0 && <Vbtn onClick={doA} />}
          {step > 0 && <OkBox>✓ Rouges = <strong>x + 24</strong>.</OkBox>}
        </div>

        {step >= 1 && (
          <div className="gd-step">
            <QL text="b) Écris une équation qui traduit la situation." />
            <TextInp inputRef={r1} value={veq} onChange={setVeq} onEnter={doEq} disabled={step > 1}
              placeholder="ex : 2x + 24 = 180" wide />
            {step === 1 && <Vbtn onClick={doEq} label="Valider l'équation" />}
            {step > 1 && <OkBox>✓ Équation correcte !</OkBox>}
          </div>
        )}

        {step >= 2 && (
          <div className="gd-step">
            <QL text="Résous l'équation (donne la solution) :" />
            <div className="gd-eq-line" style={{ marginTop: 8 }}>
              <span>x =</span>
              <NumInp inputRef={r2} value={vx} onChange={setVx} onEnter={doX} disabled={step > 2} />
            </div>
            {step === 2 && <Vbtn onClick={doX} />}
            {step > 2 && (
              <OkBox>
                ✓ <strong>x = 78</strong>
                <CorrSteps steps={EX1} />
              </OkBox>
            )}
          </div>
        )}

        {step >= 3 && (
          <div className="gd-step">
            <QL text="c) Combien y a-t-il d'autocollants rouges dans l'album ?" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <NumInp inputRef={r3} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>autocollants rouges</span>
            </div>
            {step === 3 && <Vbtn onClick={doC} />}
            {step >= 4 && (
              <OkBox>
                ✓ Il y a <strong>102</strong> autocollants rouges dans l'album.
                <br /><br />
                <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG }} onClick={onDone}>
                  Exercice suivant →
                </button>
              </OkBox>
            )}
          </div>
        )}

        {err && <div className="gd-error">{err}</div>}
      </div>
    </div>
  );
}

// ── Exercise 2: Festival ──────────────────────────────────────────────────────
// x = adolescents (105), adultes = 2x (210), enfants = x+60 (165)
// total = 4x+60 = 480

const EX2: Step[] = [
  { label: 'Équation posée', eq: '4x + 60 = 480', op: false },
  { label: 'On soustrait 60 des deux membres', eq: '4x + 60 − 60 = 480 − 60', op: true },
  { label: 'On simplifie', eq: '4x = 420', op: false },
  { label: 'On divise les deux membres par 4', eq: '4x ÷ 4 = 420 ÷ 4', op: true },
  { label: 'On simplifie', eq: 'x = 105', op: false },
];

function Ex2({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [vAdultes, setVAdultes] = useState('');
  const [vEnfants, setVEnfants] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const r0a = useRef<HTMLInputElement>(null);
  const r0b = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) r0a.current?.focus();
    else if (step === 1) r1.current?.focus();
    else if (step === 2) r2.current?.focus();
    else if (step === 3) r3.current?.focus();
  }, [step]);

  const next = (n: number) => { setErr(''); setStep(n); };

  const doA = () => {
    const aOk = checkExprMatch(vAdultes, '2x');
    const eOk = checkExprMatch(vEnfants, 'x + 60');
    if (aOk && eOk) next(1);
    else {
      const msg = !aOk
        ? "Adultes : il y a deux fois plus d'adultes que d'adolescents, donc adultes = 2x. Réessaie !"
        : "Enfants : il y a 60 enfants de plus que d'adolescents, donc enfants = x + 60. Réessaie !";
      setErr(msg);
    }
  };
  const doEq = () => {
    if (checkEq(veq, 105)) next(2);
    else setErr("Cette équation n'a pas x = 105 pour solution. Pense à exprimer le total (480) en fonction de x. Réessaie !");
  };
  const doX = () => {
    if (parseFloat(vx) === 105) next(3);
    else setErr("Ce n'est pas la bonne valeur de x. Réessaie !");
  };
  const doC = () => {
    if (parseFloat(vc) === 165) next(4);
    else setErr("Enfants = x + 60 = 105 + 60. Réessaie !");
  };

  return (
    <div className="gd-shell">
      <div className="gd-card">
        <p className="gd-level-tag">Exercice 2 / 3</p>
        <h2 className="gd-title">Festival de musique</h2>
        <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9 }}>
          Lors d'un festival, <strong>480</strong> spectateurs sont présents : des adolescents, des adultes et des enfants.<br />
          Il y a <strong>deux fois plus d'adultes que d'adolescents</strong>.<br />
          Il y a <strong>60 enfants de plus</strong> que d'adolescents.<br />
          On note <strong>x</strong> le nombre d'adolescents.
        </div>
        <hr className="gd-divider" />

        <div className="gd-step">
          <QL text="a) Exprime en fonction de x le nombre d'adultes et le nombre d'enfants." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 100 }}>Adultes =</span>
              <TextInp inputRef={r0a} value={vAdultes} onChange={setVAdultes} onEnter={() => r0b.current?.focus()} disabled={step > 0} placeholder="expression en x" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 100 }}>Enfants =</span>
              <TextInp inputRef={r0b} value={vEnfants} onChange={setVEnfants} onEnter={doA} disabled={step > 0} placeholder="expression en x" />
            </div>
          </div>
          {step === 0 && <Vbtn onClick={doA} />}
          {step > 0 && (
            <OkBox>
              ✓ Adultes = <strong>2x</strong> &nbsp;·&nbsp; Enfants = <strong>x + 60</strong>.
            </OkBox>
          )}
        </div>

        {step >= 1 && (
          <div className="gd-step">
            <QL text="b) Écris une équation qui traduit la situation." />
            <TextInp inputRef={r1} value={veq} onChange={setVeq} onEnter={doEq} disabled={step > 1}
              placeholder="ex : 4x + 60 = 480" wide />
            {step === 1 && <Vbtn onClick={doEq} label="Valider l'équation" />}
            {step > 1 && <OkBox>✓ Équation correcte !</OkBox>}
          </div>
        )}

        {step >= 2 && (
          <div className="gd-step">
            <QL text="Résous l'équation (donne la solution) :" />
            <div className="gd-eq-line" style={{ marginTop: 8 }}>
              <span>x =</span>
              <NumInp inputRef={r2} value={vx} onChange={setVx} onEnter={doX} disabled={step > 2} />
            </div>
            {step === 2 && <Vbtn onClick={doX} />}
            {step > 2 && (
              <OkBox>
                ✓ <strong>x = 105</strong>
                <CorrSteps steps={EX2} />
              </OkBox>
            )}
          </div>
        )}

        {step >= 3 && (
          <div className="gd-step">
            <QL text="c) Combien y a-t-il d'enfants parmi les spectateurs ?" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <NumInp inputRef={r3} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>enfants</span>
            </div>
            {step === 3 && <Vbtn onClick={doC} />}
            {step >= 4 && (
              <OkBox>
                ✓ Il y a <strong>165</strong> enfants parmi les spectateurs.
                <br /><br />
                <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG }} onClick={onDone}>
                  Exercice suivant →
                </button>
              </OkBox>
            )}
          </div>
        )}

        {err && <div className="gd-error">{err}</div>}
      </div>
    </div>
  );
}

// ── Exercise 3: Géométrie ─────────────────────────────────────────────────────
// Triangle équilatéral (côté x) + carré (côté 21-x) côte à côte, largeur totale 21 cm
// Périmètres égaux : 3x = 4(21-x) → 7x = 84 → x = 12, périmètre = 36

const EX3: Step[] = [
  { label: 'Équation posée', eq: '3x = 4(21 − x)', op: false },
  { label: 'On développe le membre droit', eq: '3x = 84 − 4x', op: false },
  { label: 'On ajoute 4x des deux membres', eq: '3x + 4x = 84 − 4x + 4x', op: true },
  { label: 'On simplifie', eq: '7x = 84', op: false },
  { label: 'On divise les deux membres par 7', eq: '7x ÷ 7 = 84 ÷ 7', op: true },
  { label: 'On simplifie', eq: 'x = 12', op: false },
];

function Ex3({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [vCarre, setVCarre] = useState('');
  const [vPerim, setVPerim] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const r0a = useRef<HTMLInputElement>(null);
  const r0b = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) r0a.current?.focus();
    else if (step === 1) r1.current?.focus();
    else if (step === 2) r2.current?.focus();
    else if (step === 3) r3.current?.focus();
  }, [step]);

  const next = (n: number) => { setErr(''); setStep(n); };

  const doA = () => {
    const cOk = checkExprMatch(vCarre, '21 - x');
    const pOk = checkExprMatch(vPerim, '3x');
    if (cOk && pOk) next(1);
    else {
      const msg = !cOk
        ? "Côté du carré : si le triangle a un côté x et la largeur totale est 21, alors le côté du carré est 21 − x. Réessaie !"
        : "Périmètre du triangle équilatéral : trois côtés égaux à x, donc périmètre = 3x. Réessaie !";
      setErr(msg);
    }
  };
  const doEq = () => {
    if (checkEq(veq, 12)) next(2);
    else setErr("Cette équation n'a pas x = 12 pour solution. Pense à égaliser les deux périmètres. Réessaie !");
  };
  const doX = () => {
    if (parseFloat(vx) === 12) next(3);
    else setErr("Ce n'est pas la bonne valeur de x. Réessaie !");
  };
  const doC = () => {
    if (parseFloat(vc) === 36) next(4);
    else setErr("Périmètre = 3x = 3 × 12. Réessaie !");
  };

  return (
    <div className="gd-shell">
      <div className="gd-card">
        <p className="gd-level-tag">Exercice 3 / 3</p>
        <h2 className="gd-title">Géométrie — Périmètres égaux</h2>
        <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9 }}>
          Un triangle équilatéral et un carré sont placés côte à côte.<br />
          La <strong>largeur totale</strong> de la figure est <strong>21 cm</strong>.<br />
          On note <strong>x</strong> la longueur d'un côté du triangle.<br />
          Les deux figures ont le <strong>même périmètre</strong>.
        </div>
        <hr className="gd-divider" />

        <div className="gd-step">
          <QL text="a) Exprime en fonction de x le côté du carré et le périmètre du triangle." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 160 }}>Côté du carré =</span>
              <TextInp inputRef={r0a} value={vCarre} onChange={setVCarre} onEnter={() => r0b.current?.focus()} disabled={step > 0} placeholder="expression en x" />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>cm</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 160 }}>Périmètre △ =</span>
              <TextInp inputRef={r0b} value={vPerim} onChange={setVPerim} onEnter={doA} disabled={step > 0} placeholder="expression en x" />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>cm</span>
            </div>
          </div>
          {step === 0 && <Vbtn onClick={doA} />}
          {step > 0 && (
            <OkBox>
              ✓ Côté du carré = <strong>21 − x</strong> &nbsp;·&nbsp; Périmètre △ = <strong>3x</strong>.
            </OkBox>
          )}
        </div>

        {step >= 1 && (
          <div className="gd-step">
            <QL text="b) Écris une équation qui exprime que les périmètres sont égaux." />
            <TextInp inputRef={r1} value={veq} onChange={setVeq} onEnter={doEq} disabled={step > 1}
              placeholder="ex : 3x = 4(21 − x)" wide />
            {step === 1 && <Vbtn onClick={doEq} label="Valider l'équation" />}
            {step > 1 && <OkBox>✓ Équation correcte !</OkBox>}
          </div>
        )}

        {step >= 2 && (
          <div className="gd-step">
            <QL text="Résous l'équation (donne la solution) :" />
            <div className="gd-eq-line" style={{ marginTop: 8 }}>
              <span>x =</span>
              <NumInp inputRef={r2} value={vx} onChange={setVx} onEnter={doX} disabled={step > 2} />
            </div>
            {step === 2 && <Vbtn onClick={doX} />}
            {step > 2 && (
              <OkBox>
                ✓ <strong>x = 12</strong>
                <CorrSteps steps={EX3} />
              </OkBox>
            )}
          </div>
        )}

        {step >= 3 && (
          <div className="gd-step">
            <QL text="c) Quel est le périmètre commun des deux figures ?" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <NumInp inputRef={r3} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>cm</span>
            </div>
            {step === 3 && <Vbtn onClick={doC} />}
            {step >= 4 && (
              <OkBox>
                ✓ Le périmètre commun est <strong>36 cm</strong>. (3 × 12 = 36 et 4 × 9 = 36 ✓)
                <br /><br />
                <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG }} onClick={onDone}>
                  Voir le bilan →
                </button>
              </OkBox>
            )}
          </div>
        )}

        {err && <div className="gd-error">{err}</div>}
      </div>
    </div>
  );
}

// ── Done screen ───────────────────────────────────────────────────────────────

function DoneScreen() {
  return (
    <div className="gd-shell">
      <div className="gd-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: '1rem' }}>🎉</div>
        <h2 className="gd-title" style={{ color: ACCENT }}>Félicitations !</h2>
        <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          Tu as résolu les trois problèmes.<br />
          Tu sais maintenant poser et résoudre des équations du premier degré<br />
          dans des contextes variés !<br /><br />
          <strong style={{ color: 'var(--text)' }}>Va t'entraîner dans la série classique</strong> pour consolider tes acquis.
        </p>
        <a
          className="btn-primary"
          href="/4eme/eq"
          style={{ background: ACCENT, color: ACCENT_FG, textDecoration: 'none', display: 'inline-block' }}
        >
          Aller à la série classique →
        </a>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EqProblemes() {
  const [ex, setEx] = useState(0);
  if (ex === 0) return <Ex1 onDone={() => setEx(1)} />;
  if (ex === 1) return <Ex2 onDone={() => setEx(2)} />;
  if (ex === 2) return <Ex3 onDone={() => setEx(3)} />;
  return <DoneScreen />;
}
