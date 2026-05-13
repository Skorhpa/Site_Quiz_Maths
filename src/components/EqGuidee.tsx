import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

type Phase = 'intro1' | 'play1' | 'intro2' | 'play2' | 'intro3' | 'play3' | 'done';

const ACCENT = '#A78BFA';
const ACCENT_FG = '#0F1117';
const VIDEO_URL =
  'https://www.youtube.com/watch?v=uV_EmbYu9_E&t=425s&pp=ygUacsOpc29sdXRpb24gZXF1YXRpb24gNGVtZSA%3D';

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const rnz = (a: number, b: number) => {
  let v = 0;
  while (v === 0) v = ri(a, b);
  return v;
};
const coefX = (n: number): string =>
  n === 1 ? 'x' : n === -1 ? '-x' : `${n}x`;

// ── Param types ───────────────────────────────────────────────────────────────

interface L1 { a: number; x: number; b: number }        // x + a = b
interface L2 { a: number; b: number; x: number; c: number; rhs1: number }  // ax+b=c
interface L3 { a: number; b: number; c: number; d: number; x: number; coef: number; rhs1: number } // ax+b=cx+d

function genL1(): L1 {
  const a = ri(2, 12);
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
  const a = ri(3, 7);
  const c = ri(1, Math.max(1, a - 2)); // ensures coef = a-c >= 2
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
  inputRef?: React.RefObject<HTMLInputElement>;
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

function VideoLink() {
  return (
    <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer" className="gd-video-link">
      📺 Voir la vidéo explicative
    </a>
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
          <p>Ici, x est seul accompagné d'un nombre qu'on lui ajoute. On va l'isoler en <strong>soustrayant ce nombre des deux membres</strong>.</p>
          <div className="gd-method-box">
            <div>x + a = b</div>
            <div className="gd-method-arrow">→ On soustrait <em>a</em> des deux membres :</div>
            <div>x + a − a = b − a</div>
            <div className="gd-method-arrow">→ On simplifie :</div>
            <div style={{ fontWeight: 700 }}>x = b − a</div>
          </div>
        </div>
        <VideoLink />
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
            <li>Diviser les deux membres par <em>a</em> — représenté sous forme de fraction</li>
          </ol>
          <div className="gd-method-box">
            <div>ax + b = c</div>
            <div className="gd-method-arrow">→ − b des deux membres :</div>
            <div>ax = c − b</div>
            <div className="gd-method-arrow">→ ÷ a des deux membres (fraction) :</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Frac num="ax" den="a" />
              <span>=</span>
              <Frac num="c − b" den="a" />
            </div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>x = (c − b) / a</div>
          </div>
        </div>
        <VideoLink />
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
            <li>Regrouper tous les <em>x</em> à gauche (soustraire <em>cx</em> des deux membres)</li>
            <li>Isoler le terme en x (soustraire <em>b</em> des deux membres)</li>
            <li>Diviser par le coefficient restant</li>
          </ol>
          <div className="gd-method-box">
            <div>ax + b = cx + d</div>
            <div className="gd-method-arrow">→ − cx des deux membres :</div>
            <div>(a−c)x + b = d</div>
            <div className="gd-method-arrow">→ − b des deux membres :</div>
            <div>(a−c)x = d − b</div>
            <div className="gd-method-arrow">→ ÷ (a−c) des deux membres :</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Frac num="(a−c)x" den="a−c" />
              <span>=</span>
              <Frac num="d − b" den="a−c" />
            </div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>x = (d − b) / (a−c)</div>
          </div>
        </div>
        <VideoLink />
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

// ── PlayL1 ────────────────────────────────────────────────────────────────────

function PlayL1({ p, onDone }: { p: L1; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [ax, setAx] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const ref1 = useRef<HTMLInputElement>(null);
  const refX = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (step === 0 ? ref1 : refX).current?.focus();
  }, [step]);

  const eqStr = `x + ${p.a} = ${p.b}`;

  const validate0 = () => {
    if (parseFloat(a1) === p.a && parseFloat(a2) === p.a) {
      setError('');
      setStep(1);
    } else {
      setError('Les deux nombres soustraits doivent être identiques et égaux à ' + p.a + '. Réessaie !');
    }
  };

  const validate1 = () => {
    if (parseFloat(ax) === p.x) {
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
          <div className="gd-step-label">→ On soustrait {p.a} des deux membres :</div>
          <div className="gd-eq-line">
            <span>x + {p.a} −</span>
            <GdBlank value={a1} onChange={setA1} onEnter={step === 0 ? validate0 : undefined} inputRef={ref1} disabled={step > 0} />
            <span>= {p.b} −</span>
            <GdBlank value={a2} onChange={setA2} onEnter={step === 0 ? validate0 : undefined} disabled={step > 0} />
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
              <GdBlank value={ax} onChange={setAx} onEnter={validate1} inputRef={refX} disabled={done} />
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
            Vérification : {p.x} + {p.a} = {p.b} ✓
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

// ── PlayL2 ────────────────────────────────────────────────────────────────────

function PlayL2({ p, onDone }: { p: L2; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [ax, setAx] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const ref1 = useRef<HTMLInputElement>(null);
  const refX = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (step === 0 ? ref1 : refX).current?.focus();
  }, [step]);

  const lhsStr = `${coefX(p.a)} + ${p.b}`;
  const eqStr = `${lhsStr} = ${p.c}`;

  const validate0 = () => {
    if (parseFloat(a1) === p.b && parseFloat(a2) === p.b) {
      setError('');
      setStep(1);
    } else {
      setError('Les deux nombres soustraits doivent valoir ' + p.b + '. Réessaie !');
    }
  };

  const validate1 = () => {
    if (parseFloat(ax) === p.x) {
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
          <div className="gd-step-label">→ On soustrait {p.b} des deux membres :</div>
          <div className="gd-eq-line">
            <span>{coefX(p.a)} + {p.b} −</span>
            <GdBlank value={a1} onChange={setA1} onEnter={step === 0 ? validate0 : undefined} inputRef={ref1} disabled={step > 0} />
            <span>= {p.c} −</span>
            <GdBlank value={a2} onChange={setA2} onEnter={step === 0 ? validate0 : undefined} disabled={step > 0} />
          </div>
          {step === 0 && (
            <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate0}>
              Valider
            </button>
          )}
        </div>

        {step >= 1 && (
          <>
            <div className="gd-step">
              <div className="gd-step-label">→ On simplifie :</div>
              <div className="gd-eq-display">{coefX(p.a)} = {p.rhs1}</div>
            </div>

            <div className="gd-step">
              <div className="gd-step-label">→ On divise les deux membres par {p.a} :</div>
              <div className="gd-eq-line" style={{ gap: 8 }}>
                <Frac num={coefX(p.a)} den={String(p.a)} />
                <span>=</span>
                <Frac num={String(p.rhs1)} den={String(p.a)} />
              </div>
            </div>

            <div className="gd-step">
              <div className="gd-step-label">→ On simplifie :</div>
              <div className="gd-eq-line">
                <span>x =</span>
                <GdBlank value={ax} onChange={setAx} onEnter={validate1} inputRef={refX} disabled={done} />
              </div>
              {!done && (
                <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate1}>
                  Valider
                </button>
              )}
            </div>
          </>
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

// ── PlayL3 ────────────────────────────────────────────────────────────────────

function PlayL3({ p, onDone }: { p: L3; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [ax, setAx] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const ref1 = useRef<HTMLInputElement>(null);
  const refX = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (step === 0 ? ref1 : refX).current?.focus();
  }, [step]);

  const rhsStr = p.d >= 0 ? `${coefX(p.c)} + ${p.d}` : `${coefX(p.c)} - ${Math.abs(p.d)}`;
  const eqStr = `${coefX(p.a)} + ${p.b} = ${rhsStr}`;
  const regrouped = `${coefX(p.coef)} + ${p.b} = ${p.d}`;

  const validate0 = () => {
    if (parseFloat(a1) === p.b && parseFloat(a2) === p.b) {
      setError('');
      setStep(1);
    } else {
      setError('Les deux nombres soustraits doivent valoir ' + p.b + '. Réessaie !');
    }
  };

  const validate1 = () => {
    if (parseFloat(ax) === p.x) {
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
          <div className="gd-step-label">→ On regroupe les termes en x à gauche. On soustrait {coefX(p.c)} des deux membres :</div>
          <div className="gd-eq-display">{regrouped}</div>
        </div>

        <div className="gd-step">
          <div className="gd-step-label">→ On soustrait {p.b} des deux membres :</div>
          <div className="gd-eq-line">
            <span>{coefX(p.coef)} + {p.b} −</span>
            <GdBlank value={a1} onChange={setA1} onEnter={step === 0 ? validate0 : undefined} inputRef={ref1} disabled={step > 0} />
            <span>= {p.d} −</span>
            <GdBlank value={a2} onChange={setA2} onEnter={step === 0 ? validate0 : undefined} disabled={step > 0} />
          </div>
          {step === 0 && (
            <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate0}>
              Valider
            </button>
          )}
        </div>

        {step >= 1 && (
          <>
            <div className="gd-step">
              <div className="gd-step-label">→ On simplifie :</div>
              <div className="gd-eq-display">{coefX(p.coef)} = {p.rhs1}</div>
            </div>

            <div className="gd-step">
              <div className="gd-step-label">→ On divise les deux membres par {p.coef} :</div>
              <div className="gd-eq-line" style={{ gap: 8 }}>
                <Frac num={coefX(p.coef)} den={String(p.coef)} />
                <span>=</span>
                <Frac num={String(p.rhs1)} den={String(p.coef)} />
              </div>
            </div>

            <div className="gd-step">
              <div className="gd-step-label">→ On simplifie :</div>
              <div className="gd-eq-line">
                <span>x =</span>
                <GdBlank value={ax} onChange={setAx} onEnter={validate1} inputRef={refX} disabled={done} />
              </div>
              {!done && (
                <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={validate1}>
                  Valider
                </button>
              )}
            </div>
          </>
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
