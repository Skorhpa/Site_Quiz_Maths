import { useState, useRef, useEffect, type KeyboardEvent, type RefObject } from 'react';

type Phase = 'intro1' | 'play1' | 'intro2' | 'play2' | 'intro3' | 'play3' | 'done';

const ACCENT = '#A78BFA';
const ACCENT_FG = '#0F1117';
const VIDEO_L1 = 'https://www.youtube.com/watch?v=IznhSKDp_P4&pp=ygUPZXF1YXRpb24geCthPWIg';
const VIDEO_L2 = 'https://www.youtube.com/watch?v=5b2yQ4Q9W0g&pp=ygUQZXF1YXRpb24gYXgrYz1iIA%3D%3D';
const VIDEO_L3 = 'https://www.youtube.com/watch?v=VJ1QU4ruRE4&pp=ygUTZXF1YXRpb24gYXgrYj1jeCtkIA%3D%3D';

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const rnz = (a: number, b: number) => {
  let v = 0;
  while (v === 0) v = ri(a, b);
  return v;
};
const coefX = (n: number): string =>
  n === 1 ? 'x' : n === -1 ? '-x' : `${n}x`;

// ── Param types ───────────────────────────────────────────────────────────────

interface L1 { a: number; x: number; b: number }         // x ± |a| = b
interface L2 { a: number; b: number; x: number; c: number; rhs1: number }   // ax+b=c
interface L3 { a: number; b: number; c: number; d: number; x: number; coef: number; rhs1: number } // ax+b=cx+d

function genL1(): L1 {
  // a can be positive or negative — exercises both "subtract" and "add" cases
  const a = rnz(-12, 12);
  const x = rnz(-10, 10);
  return { a, x, b: x + a };
}

function genL2(): L2 {
  const a = ri(2, 8);
  const b = ri(1, 10);
  const x = rnz(-8, 8);
  const c = a * x + b;
  return { a, b, x, c, rhs1: c - b };
}

function genL3(): L3 {
  // c >= 2, coef = a-c >= 2 so no coefficient is ever 1
  const c = ri(2, 4);
  const a = ri(c + 2, Math.min(9, c + 5));
  const b = ri(1, 10);
  const x = rnz(-6, 6);
  const d = (a - c) * x + b;
  return { a, b, c, d, x, coef: a - c, rhs1: d - b };
}

// ── Shared small components ───────────────────────────────────────────────────

function Frac({ num, den }: { num: string; den: string }) {
  return (
    <span className="frac" style={{ fontSize: 16, margin: '0 4px' }}>
      <span className="fn">{num}</span>
      <span className="fd">{den}</span>
    </span>
  );
}

// Fraction where the numerator is fixed text and the denominator is an input
function FracDenInput({
  num,
  value,
  onChange,
  onEnter,
  inputRef,
  disabled,
}: {
  num: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  inputRef?: RefObject<HTMLInputElement>;
  disabled?: boolean;
}) {
  return (
    <span className="frac-inp">
      <span style={{ padding: '0 6px', fontSize: 14, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
        {num}
      </span>
      <span className="frac-line" />
      <input
        ref={inputRef}
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') onEnter?.();
        }}
      />
    </span>
  );
}

function GdBlank({
  value,
  onChange,
  onEnter,
  inputRef,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  inputRef?: RefObject<HTMLInputElement>;
  disabled?: boolean;
}) {
  return (
    <input
      ref={inputRef}
      type="number"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onEnter?.();
      }}
      className="gd-blank"
    />
  );
}

// ── Intro screens ─────────────────────────────────────────────────────────────

function Intro1({ onStart }: { onStart: () => void }) {
  return (
    <div className="gd-shell">
      <div className="gd-card">
        <p className="gd-level-tag">Niveau 1 / 3</p>
        <h2 className="gd-title">Équation : x + a = b</h2>
        <div className="gd-intro-body">
          <p>
            On a une équation et on cherche la valeur de l'inconnue <strong>x</strong> qui rend
            l'égalité vraie. La règle d'or :{' '}
            <em>ce qu'on fait d'un côté du signe =, on doit le faire de l'autre côté aussi.</em>
          </p>
          <p>
            Pour isoler x, on regarde le signe du nombre et on fait <strong>l'opération inverse</strong> des deux côtés.
          </p>
          <div className="gd-method-box">
            <div className="gd-method-arrow">Exemple 1 — le nombre est positif (+5) :</div>
            <div>x + 5 = 8</div>
            <div className="gd-method-arrow">→ Signe + → opération inverse : on soustrait 5</div>
            <div>x + 5 − 5 = 8 − 5</div>
            <div style={{ fontWeight: 700 }}>x = 3</div>
          </div>
          <div className="gd-method-box" style={{ marginTop: '0.8rem' }}>
            <div className="gd-method-arrow">Exemple 2 — le nombre est négatif (−8) :</div>
            <div>x − 8 = 4</div>
            <div className="gd-method-arrow">→ Signe − → opération inverse : on ajoute 8</div>
            <div>x − 8 + 8 = 4 + 8</div>
            <div style={{ fontWeight: 700 }}>x = 12</div>
          </div>
        </div>
        <a href={VIDEO_L1} target="_blank" rel="noopener noreferrer" className="gd-video-link">
          📺 Voir la vidéo explicative
        </a>
        <button
          className="btn-primary"
          style={{ background: ACCENT, color: ACCENT_FG, marginTop: '1.5rem' }}
          onClick={onStart}
        >
          Commencer →
        </button>
      </div>
    </div>
  );
}

function Intro2({ onStart }: { onStart: () => void }) {
  return (
    <div className="gd-shell">
      <div className="gd-card">
        <p className="gd-level-tag">Niveau 2 / 3</p>
        <h2 className="gd-title">Équation : ax + b = c</h2>
        <div className="gd-intro-body">
          <p>
            Bravo pour le niveau 1 ! Maintenant, <strong>x est multiplié par un coefficient a</strong>.
            On procède en deux étapes :
          </p>
          <ol style={{ paddingLeft: '1.2rem', lineHeight: 2 }}>
            <li>Isoler le terme en x en soustrayant <em>b</em> des deux membres</li>
            <li>Diviser les deux membres par <em>a</em> — représenté sous forme de fraction (tu complèteras les dénominateurs)</li>
          </ol>
          <div className="gd-method-box">
            <div>ax + b = c</div>
            <div className="gd-method-arrow">→ − b des deux membres :</div>
            <div>ax = c − b</div>
            <div className="gd-method-arrow">→ ÷ a des deux membres :</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Frac num="ax" den="a" />
              <span>=</span>
              <Frac num="c − b" den="a" />
            </div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>x = (c − b) ÷ a</div>
          </div>
        </div>
        <a href={VIDEO_L2} target="_blank" rel="noopener noreferrer" className="gd-video-link">
          📺 Voir la vidéo explicative
        </a>
        <button
          className="btn-primary"
          style={{ background: ACCENT, color: ACCENT_FG, marginTop: '1.5rem' }}
          onClick={onStart}
        >
          Commencer →
        </button>
      </div>
    </div>
  );
}

function Intro3({ onStart }: { onStart: () => void }) {
  return (
    <div className="gd-shell">
      <div className="gd-card">
        <p className="gd-level-tag">Niveau 3 / 3</p>
        <h2 className="gd-title">Équation : ax + b = cx + d</h2>
        <div className="gd-intro-body">
          <p>
            Dernière étape ! Cette fois, <strong>x apparaît des deux côtés</strong> de l'égalité.
          </p>
          <p>On procède en trois étapes :</p>
          <ol style={{ paddingLeft: '1.2rem', lineHeight: 2 }}>
            <li>Regrouper les x à gauche en soustrayant <em>cx</em> des deux membres — tu calculeras le nouveau coefficient</li>
            <li>Isoler le terme en x en soustrayant <em>b</em> des deux membres</li>
            <li>Diviser par le coefficient restant — tu complèteras les dénominateurs</li>
          </ol>
          <div className="gd-method-box">
            <div>ax + b = cx + d</div>
            <div className="gd-method-arrow">→ − cx des deux membres :</div>
            <div>ax + b − cx = cx + d − cx</div>
            <div style={{ fontWeight: 700 }}>(a−c)x + b = d</div>
            <div className="gd-method-arrow">→ − b des deux membres :</div>
            <div style={{ fontWeight: 700 }}>(a−c)x = d − b</div>
            <div className="gd-method-arrow">→ ÷ (a−c) des deux membres :</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Frac num="(a−c)x" den="a−c" />
              <span>=</span>
              <Frac num="d − b" den="a−c" />
            </div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>x = (d − b) ÷ (a−c)</div>
          </div>
        </div>
        <a href={VIDEO_L3} target="_blank" rel="noopener noreferrer" className="gd-video-link">
          📺 Voir la vidéo explicative
        </a>
        <button
          className="btn-primary"
          style={{ background: ACCENT, color: ACCENT_FG, marginTop: '1.5rem' }}
          onClick={onStart}
        >
          Commencer →
        </button>
      </div>
    </div>
  );
}

// ── PlayL1 — x + a = b (a may be negative → equation shows x − |a| = b) ─────

function PlayL1({ p, onDone }: { p: L1; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [vx, setVx] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const ref1 = useRef<HTMLInputElement>(null);
  const refX = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (step === 0 ? ref1 : refX).current?.focus();
  }, [step]);

  const absA = Math.abs(p.a);
  const isPos = p.a > 0;

  // Display strings
  const eqStr = isPos ? `x + ${p.a} = ${p.b}` : `x - ${absA} = ${p.b}`;
  const opLabel = isPos
    ? `→ On soustrait ${p.a} des deux membres :`
    : `→ On ajoute ${absA} des deux membres :`;
  const opSign = isPos ? '−' : '+';
  const lhsPart = isPos ? `x + ${p.a} ${opSign}` : `x − ${absA} ${opSign}`;
  const rhsPart = `${p.b} ${opSign}`;
  const verif = isPos
    ? `Vérification : ${p.x} + ${p.a} = ${p.b} ✓`
    : `Vérification : ${p.x} − ${absA} = ${p.b} ✓`;

  const validate0 = () => {
    if (parseFloat(v1) === absA && parseFloat(v2) === absA) {
      setError('');
      setStep(1);
    } else {
      setError(
        `Les deux valeurs doivent être ${absA} (${isPos ? 'ce qu\'on soustrait' : 'ce qu\'on ajoute'}). Réessaie !`
      );
    }
  };

  const validate1 = () => {
    if (parseFloat(vx) === p.x) {
      setError('');
      setDone(true);
    } else {
      setError("Ce n'est pas la bonne valeur pour x. Réessaie !");
    }
  };

  return (
    <div className="gd-shell">
      <div className="gd-card">
        <div className="gd-eq-header">Résous :</div>
        <div className="gd-eq-main">{eqStr}</div>
        <hr className="gd-divider" />

        <div className="gd-step">
          <div className="gd-step-label">{opLabel}</div>
          <div className="gd-eq-line">
            <span>{lhsPart}</span>
            <GdBlank value={v1} onChange={setV1} onEnter={step === 0 ? validate0 : undefined} inputRef={ref1} disabled={step > 0} />
            <span>= {rhsPart}</span>
            <GdBlank value={v2} onChange={setV2} onEnter={step === 0 ? validate0 : undefined} disabled={step > 0} />
          </div>
          {step === 0 && (
            <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate0}>
              Valider
            </button>
          )}
        </div>

        {step >= 1 && (
          <div className="gd-step">
            <div className="gd-step-label">→ On simplifie :</div>
            <div className="gd-eq-line">
              <span>x =</span>
              <GdBlank value={vx} onChange={setVx} onEnter={validate1} inputRef={refX} disabled={done} />
            </div>
            {!done && (
              <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate1}>
                Valider
              </button>
            )}
          </div>
        )}

        {error && <div className="gd-error">{error}</div>}

        {done && (
          <div className="gd-success">
            ✓ Bravo ! La solution est <strong>x = {p.x}</strong><br />
            {verif}
            <br /><br />
            <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG }} onClick={onDone}>
              Niveau suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PlayL2 — ax + b = c ───────────────────────────────────────────────────────
// Steps: 0 = subtract b | 1 = fill denominators | 2 = final x

function PlayL2({ p, onDone }: { p: L2; onDone: () => void }) {
  const [step, setStep] = useState(0);
  // step 0: subtract b
  const [s0a, setS0a] = useState('');
  const [s0b, setS0b] = useState('');
  // step 1: denominators
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  // step 2: final x
  const [vx, setVx] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const refS0 = useRef<HTMLInputElement>(null);
  const refD1 = useRef<HTMLInputElement>(null);
  const refX = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) refS0.current?.focus();
    else if (step === 1) refD1.current?.focus();
    else if (step === 2) refX.current?.focus();
  }, [step]);

  const eqStr = `${coefX(p.a)} + ${p.b} = ${p.c}`;

  const validate0 = () => {
    if (parseFloat(s0a) === p.b && parseFloat(s0b) === p.b) {
      setError(''); setStep(1);
    } else {
      setError(`Les deux valeurs doivent être ${p.b}. Réessaie !`);
    }
  };

  const validate1 = () => {
    if (parseFloat(d1) === p.a && parseFloat(d2) === p.a) {
      setError(''); setStep(2);
    } else {
      setError(`Les deux dénominateurs doivent être ${p.a}. Réessaie !`);
    }
  };

  const validate2 = () => {
    if (parseFloat(vx) === p.x) {
      setError(''); setDone(true);
    } else {
      setError("Ce n'est pas la bonne valeur pour x. Réessaie !");
    }
  };

  return (
    <div className="gd-shell">
      <div className="gd-card">
        <div className="gd-eq-header">Résous :</div>
        <div className="gd-eq-main">{eqStr}</div>
        <hr className="gd-divider" />

        {/* Step 0: subtract b */}
        <div className="gd-step">
          <div className="gd-step-label">→ On soustrait {p.b} des deux membres :</div>
          <div className="gd-eq-line">
            <span>{coefX(p.a)} + {p.b} −</span>
            <GdBlank value={s0a} onChange={setS0a} onEnter={step === 0 ? validate0 : undefined} inputRef={refS0} disabled={step > 0} />
            <span>= {p.c} −</span>
            <GdBlank value={s0b} onChange={setS0b} onEnter={step === 0 ? validate0 : undefined} disabled={step > 0} />
          </div>
          {step === 0 && (
            <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate0}>
              Valider
            </button>
          )}
        </div>

        {/* Steps 1 & 2: revealed after step 0 */}
        {step >= 1 && (
          <>
            <div className="gd-step">
              <div className="gd-step-label">→ On simplifie :</div>
              <div className="gd-eq-display">{coefX(p.a)} = {p.rhs1}</div>
            </div>

            <div className="gd-step">
              <div className="gd-step-label">→ On divise les deux membres par {p.a} — complète les dénominateurs :</div>
              <div className="gd-eq-line" style={{ gap: 10, alignItems: 'flex-end' }}>
                <FracDenInput num={coefX(p.a)} value={d1} onChange={setD1} onEnter={step === 1 ? validate1 : undefined} inputRef={refD1} disabled={step > 1} />
                <span style={{ marginBottom: 4 }}>=</span>
                <FracDenInput num={String(p.rhs1)} value={d2} onChange={setD2} onEnter={step === 1 ? validate1 : undefined} disabled={step > 1} />
              </div>
              {step === 1 && (
                <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate1}>
                  Valider
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 2: final x */}
        {step >= 2 && (
          <div className="gd-step">
            <div className="gd-step-label">→ On simplifie :</div>
            <div className="gd-eq-line">
              <span>x =</span>
              <GdBlank value={vx} onChange={setVx} onEnter={validate2} inputRef={refX} disabled={done} />
            </div>
            {!done && (
              <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate2}>
                Valider
              </button>
            )}
          </div>
        )}

        {error && <div className="gd-error">{error}</div>}

        {done && (
          <div className="gd-success">
            ✓ Excellent ! La solution est <strong>x = {p.x}</strong><br />
            Vérification : {p.a} × {p.x} + {p.b} = {p.a * p.x + p.b} = {p.c} ✓
            <br /><br />
            <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG }} onClick={onDone}>
              Niveau suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PlayL3 — ax + b = cx + d ──────────────────────────────────────────────────
// Steps: 0 = intermediate coef | 1 = subtract b | 2 = fill denominators | 3 = final x

function PlayL3({ p, onDone }: { p: L3; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [s0, setS0] = useState('');       // coef = a-c
  const [s1a, setS1a] = useState('');     // subtract b (×2)
  const [s1b, setS1b] = useState('');
  const [d1, setD1] = useState('');       // denominators (×2)
  const [d2, setD2] = useState('');
  const [vx, setVx] = useState('');       // final x
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const refS0 = useRef<HTMLInputElement>(null);
  const refS1 = useRef<HTMLInputElement>(null);
  const refD1 = useRef<HTMLInputElement>(null);
  const refX = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 0) refS0.current?.focus();
    else if (step === 1) refS1.current?.focus();
    else if (step === 2) refD1.current?.focus();
    else if (step === 3) refX.current?.focus();
  }, [step]);

  const rhsStr = p.d >= 0
    ? `${coefX(p.c)} + ${p.d}`
    : `${coefX(p.c)} − ${Math.abs(p.d)}`;
  const eqStr = `${coefX(p.a)} + ${p.b} = ${rhsStr}`;

  // Intermediate display line (after subtracting cx)
  const dStr = p.d >= 0 ? `${coefX(p.c)} + ${p.d}` : `${coefX(p.c)} − ${Math.abs(p.d)}`;
  const interLine = `${coefX(p.a)} + ${p.b} − ${coefX(p.c)} = ${dStr} − ${coefX(p.c)}`;

  const validate0 = () => {
    if (parseFloat(s0) === p.coef) {
      setError(''); setStep(1);
    } else {
      setError(`Le coefficient de x est ${p.a} − ${p.c} = ${p.coef}. Réessaie !`);
    }
  };

  const validate1 = () => {
    if (parseFloat(s1a) === p.b && parseFloat(s1b) === p.b) {
      setError(''); setStep(2);
    } else {
      setError(`Les deux valeurs doivent être ${p.b}. Réessaie !`);
    }
  };

  const validate2 = () => {
    if (parseFloat(d1) === p.coef && parseFloat(d2) === p.coef) {
      setError(''); setStep(3);
    } else {
      setError(`Les deux dénominateurs doivent être ${p.coef}. Réessaie !`);
    }
  };

  const validate3 = () => {
    if (parseFloat(vx) === p.x) {
      setError(''); setDone(true);
    } else {
      setError("Ce n'est pas la bonne valeur pour x. Réessaie !");
    }
  };

  return (
    <div className="gd-shell">
      <div className="gd-card">
        <div className="gd-eq-header">Résous :</div>
        <div className="gd-eq-main">{eqStr}</div>
        <hr className="gd-divider" />

        {/* Step 0: regroup x terms → student computes coefficient */}
        <div className="gd-step">
          <div className="gd-step-label">→ On soustrait {coefX(p.c)} des deux membres :</div>
          <div className="gd-eq-display" style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>{interLine}</div>
          <div className="gd-step-label" style={{ marginTop: 6 }}>Calcule le nouveau coefficient de x :</div>
          <div className="gd-eq-line">
            <GdBlank value={s0} onChange={setS0} onEnter={step === 0 ? validate0 : undefined} inputRef={refS0} disabled={step > 0} />
            <span>x + {p.b} = {p.d}</span>
          </div>
          {step === 0 && (
            <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate0}>
              Valider
            </button>
          )}
        </div>

        {/* Step 1: subtract b */}
        {step >= 1 && (
          <div className="gd-step">
            <div className="gd-step-label">→ On soustrait {p.b} des deux membres :</div>
            <div className="gd-eq-line">
              <span>{coefX(p.coef)} + {p.b} −</span>
              <GdBlank value={s1a} onChange={setS1a} onEnter={step === 1 ? validate1 : undefined} inputRef={refS1} disabled={step > 1} />
              <span>= {p.d} −</span>
              <GdBlank value={s1b} onChange={setS1b} onEnter={step === 1 ? validate1 : undefined} disabled={step > 1} />
            </div>
            {step === 1 && (
              <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate1}>
                Valider
              </button>
            )}
          </div>
        )}

        {/* Steps 2 & 3: after step 1 */}
        {step >= 2 && (
          <>
            <div className="gd-step">
              <div className="gd-step-label">→ On simplifie :</div>
              <div className="gd-eq-display">{coefX(p.coef)} = {p.rhs1}</div>
            </div>

            <div className="gd-step">
              <div className="gd-step-label">→ On divise les deux membres par {p.coef} — complète les dénominateurs :</div>
              <div className="gd-eq-line" style={{ gap: 10, alignItems: 'flex-end' }}>
                <FracDenInput num={coefX(p.coef)} value={d1} onChange={setD1} onEnter={step === 2 ? validate2 : undefined} inputRef={refD1} disabled={step > 2} />
                <span style={{ marginBottom: 4 }}>=</span>
                <FracDenInput num={String(p.rhs1)} value={d2} onChange={setD2} onEnter={step === 2 ? validate2 : undefined} disabled={step > 2} />
              </div>
              {step === 2 && (
                <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate2}>
                  Valider
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 3: final x */}
        {step >= 3 && (
          <div className="gd-step">
            <div className="gd-step-label">→ On simplifie :</div>
            <div className="gd-eq-line">
              <span>x =</span>
              <GdBlank value={vx} onChange={setVx} onEnter={validate3} inputRef={refX} disabled={done} />
            </div>
            {!done && (
              <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate3}>
                Valider
              </button>
            )}
          </div>
        )}

        {error && <div className="gd-error">{error}</div>}

        {done && (
          <div className="gd-success">
            ✓ Parfait ! La solution est <strong>x = {p.x}</strong><br />
            Vérification : {p.a}×{p.x} + {p.b} = {p.a * p.x + p.b} &nbsp;et&nbsp; {p.c}×{p.x} + {p.d} = {p.c * p.x + p.d} ✓
            <br /><br />
            <button className="btn-primary" style={{ background: ACCENT, color: ACCENT_FG }} onClick={onDone}>
              Voir le bilan →
            </button>
          </div>
        )}
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
          Tu as résolu les trois types d'équations du premier degré.<br />
          Tu maîtrises maintenant la méthode de résolution !<br /><br />
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

export default function EqGuidee() {
  const [phase, setPhase] = useState<Phase>('intro1');
  const [p1, setP1] = useState<L1 | null>(null);
  const [p2, setP2] = useState<L2 | null>(null);
  const [p3, setP3] = useState<L3 | null>(null);

  const startLevel = (n: 1 | 2 | 3) => {
    if (n === 1) { setP1(genL1()); setPhase('play1'); }
    if (n === 2) { setP2(genL2()); setPhase('play2'); }
    if (n === 3) { setP3(genL3()); setPhase('play3'); }
  };

  if (phase === 'intro1') return <Intro1 onStart={() => startLevel(1)} />;
  if (phase === 'play1' && p1) return <PlayL1 p={p1} onDone={() => setPhase('intro2')} />;
  if (phase === 'intro2') return <Intro2 onStart={() => startLevel(2)} />;
  if (phase === 'play2' && p2) return <PlayL2 p={p2} onDone={() => setPhase('intro3')} />;
  if (phase === 'intro3') return <Intro3 onStart={() => startLevel(3)} />;
  if (phase === 'play3' && p3) return <PlayL3 p={p3} onDone={() => setPhase('done')} />;
  return <DoneScreen />;
}
