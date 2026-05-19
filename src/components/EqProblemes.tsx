import { useState, useRef, useEffect, type KeyboardEvent, type RefObject, type ReactNode } from 'react';

const ACCENT = '#A78BFA';
const ACCENT_FG = '#0F1117';
const RED = '#F87171';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
    while (tokens[p] === '+' || tokens[p] === '-') { const op = tokens[p++] as string; v = op === '+' ? v + term() : v - term(); }
    return v;
  };
  const term = (): number => {
    let v = unary();
    while (tokens[p] === '*' || tokens[p] === '/') { const op = tokens[p++] as string; const r = unary(); v = op === '*' ? v * r : v / r; }
    return v;
  };
  const unary = (): number => { if (tokens[p] === '-') { p++; return -atom(); } if (tokens[p] === '+') { p++; return atom(); } return atom(); };
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
  const d0 = diff(expectedX), d1 = diff(expectedX + 1);
  return !isNaN(d0) && !isNaN(d1) && Math.abs(d0) < 0.001 && Math.abs(d1) > 0.001;
}

function checkExprMatch(input: string, expected: string): boolean {
  if (!input.trim()) return false;
  for (const x of [3, 7, 11]) {
    const got = evalExpr(input, x), exp = evalExpr(expected, x);
    if (isNaN(got) || Math.abs(got - exp) > 0.001) return false;
  }
  return true;
}

// ── RichEq ────────────────────────────────────────────────────────────────────

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
  return <>{segs.map((s, i) => s.red ? <span key={i} style={{ color: RED, fontWeight: 700 }}>{s.text}</span> : <span key={i}>{s.text}</span>)}</>;
}

// ── CorrSteps ─────────────────────────────────────────────────────────────────

interface CorrStep { label?: string; eq?: string; redParts?: string[]; isSection?: boolean }

function CorrSteps({ steps }: { steps: CorrStep[] }) {
  return (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 2.05 }}>
      {steps.map((s, i) => {
        if (s.isSection) return (
          <div key={i} style={{ fontWeight: 700, color: ACCENT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: i > 0 ? 10 : 4, marginBottom: 1 }}>{s.label}</div>
        );
        if (s.label && s.eq) return (
          <div key={i}>
            <span style={{ color: 'var(--muted)' }}>{s.label} : </span>
            <span style={{ color: 'var(--text)' }}><RichEq eq={s.eq} redParts={s.redParts} /></span>
          </div>
        );
        if (s.eq) return (
          <div key={i} style={{ paddingLeft: 12, color: 'var(--text)' }}><RichEq eq={s.eq} redParts={s.redParts} /></div>
        );
        return <div key={i} style={{ paddingLeft: 4, fontWeight: 600, color: 'var(--text)' }}>{s.label}</div>;
      })}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function QL({ text }: { text: string }) {
  return <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14, marginBottom: 6 }}>{text}</div>;
}
function Vbtn({ onClick, label = 'Valider' }: { onClick: () => void; label?: string }) {
  return <button className="btn-primary gd-validate-btn" style={{ background: ACCENT, color: ACCENT_FG }} onClick={onClick}>{label}</button>;
}
function OkBox({ children }: { children: ReactNode }) {
  return <div className="gd-success" style={{ marginTop: 10 }}>{children}</div>;
}
function TextInp({ inputRef, value, onChange, onEnter, disabled, wide }: {
  inputRef: RefObject<HTMLInputElement>; value: string; onChange: (v: string) => void;
  onEnter: () => void; disabled: boolean; wide?: boolean;
}) {
  return (
    <input ref={inputRef} type="text" className="prob-inp" style={wide ? { width: 280 } : undefined}
      value={value} disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') onEnter(); }} />
  );
}
function NumInp({ inputRef, value, onChange, onEnter, disabled }: {
  inputRef: RefObject<HTMLInputElement>; value: string; onChange: (v: string) => void;
  onEnter: () => void; disabled: boolean;
}) {
  return (
    <input ref={inputRef} type="number" className="gd-blank" value={value} disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') onEnter(); }} />
  );
}
function SolutionBox({ steps, open, onToggle }: { steps: CorrStep[]; open: boolean; onToggle: () => void }) {
  return (
    <>
      <button type="button" className="hint-toggle" style={{ marginTop: 14 }} onClick={onToggle}>
        <span>{open ? '▼' : '▶'}</span> Voir la solution
      </button>
      <div className={`steps-box${open ? ' open' : ''}`}><CorrSteps steps={steps} /></div>
    </>
  );
}

// ── SVG Ticks & figure ────────────────────────────────────────────────────────

function Ticks({ x1, y1, x2, y2, n = 1 }: { x1: number; y1: number; x2: number; y2: number; n?: number }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const ux = dx / len, uy = dy / len, px = -uy, py = ux;
  return (
    <>{Array.from({ length: n }, (_, i) => {
      const off = (i - (n - 1) / 2) * 5;
      const cx = mx + ux * off, cy = my + uy * off;
      return <line key={i} x1={cx - px * 6} y1={cy - py * 6} x2={cx + px * 6} y2={cy + py * 6} stroke="var(--text)" strokeWidth={1.5} />;
    })}</>
  );
}

function RectFig({ L }: { L: number }) {
  const rw = 110, rh = 60, rx = 32, ry = 18;
  return (
    <svg viewBox="0 0 165 100" style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0.8rem auto' }}>
      <rect x={rx} y={ry} width={rw} height={rh} stroke="var(--text)" strokeWidth={1.5} fill="none" />
      <Ticks x1={rx} y1={ry} x2={rx + rw} y2={ry} n={2} />
      <Ticks x1={rx} y1={ry + rh} x2={rx + rw} y2={ry + rh} n={2} />
      <Ticks x1={rx} y1={ry} x2={rx} y2={ry + rh} n={1} />
      <Ticks x1={rx + rw} y1={ry} x2={rx + rw} y2={ry + rh} n={1} />
      <text x={rx + rw / 2} y={93} textAnchor="middle" fontSize={10} fill="var(--muted)" fontFamily="DM Mono, monospace">(x + {L}) m</text>
      <text x={16} y={ry + rh / 2 + 4} textAnchor="middle" fontSize={10} fill="var(--muted)" fontFamily="DM Mono, monospace">x m</text>
    </svg>
  );
}

// ── Templates ─────────────────────────────────────────────────────────────────

interface Ex1Tpl {
  title: string;
  renderDesc: (diff: number, total: number) => ReactNode;
  shortA: string; shortB: string; itemA: string; itemB: string; itemPlural: string;
  labelB: string;
  question_a: string; question_c: string;
}
const EX1_TPLS: Ex1Tpl[] = [
  {
    title: 'Autocollants',
    renderDesc: (diff, total) => <>Un album contient <strong>{total}</strong> autocollants rouges et bleus.<br />Il y a <strong>{diff}</strong> autocollants rouges de plus que d'autocollants bleus.<br />On note <strong>x</strong> le nombre d'autocollants bleus.</>,
    shortA: 'bleus', shortB: 'rouges', itemA: 'autocollants bleus', itemB: 'autocollants rouges', itemPlural: 'autocollants',
    labelB: 'Rouges =', question_a: "a) Exprime le nombre d'autocollants rouges en fonction de x.", question_c: "c) Combien y a-t-il d'autocollants rouges dans l'album ?",
  },
  {
    title: 'Billes',
    renderDesc: (diff, total) => <>Un sac contient <strong>{total}</strong> billes blanches et noires.<br />Il y a <strong>{diff}</strong> billes blanches de plus que de billes noires.<br />On note <strong>x</strong> le nombre de billes noires.</>,
    shortA: 'noires', shortB: 'blanches', itemA: 'billes noires', itemB: 'billes blanches', itemPlural: 'billes',
    labelB: 'Blanches =', question_a: "a) Exprime le nombre de billes blanches en fonction de x.", question_c: "c) Combien y a-t-il de billes blanches dans le sac ?",
  },
  {
    title: 'Romans et BD',
    renderDesc: (diff, total) => <>Une bibliothèque contient <strong>{total}</strong> romans et bandes dessinées.<br />Il y a <strong>{diff}</strong> BD de plus que de romans.<br />On note <strong>x</strong> le nombre de romans.</>,
    shortA: 'romans', shortB: 'BD', itemA: 'romans', itemB: 'bandes dessinées', itemPlural: 'livres',
    labelB: 'BD =', question_a: "a) Exprime le nombre de bandes dessinées en fonction de x.", question_c: "c) Combien y a-t-il de bandes dessinées ?",
  },
  {
    title: 'Roses et tulipes',
    renderDesc: (diff, total) => <>Un bouquet contient <strong>{total}</strong> roses et tulipes.<br />Il y a <strong>{diff}</strong> roses de plus que de tulipes.<br />On note <strong>x</strong> le nombre de tulipes.</>,
    shortA: 'tulipes', shortB: 'roses', itemA: 'tulipes', itemB: 'roses', itemPlural: 'fleurs',
    labelB: 'Roses =', question_a: "a) Exprime le nombre de roses en fonction de x.", question_c: "c) Combien y a-t-il de roses dans le bouquet ?",
  },
  {
    title: 'Garçons et filles',
    renderDesc: (diff, total) => <>Une classe compte <strong>{total}</strong> élèves, filles et garçons.<br />Il y a <strong>{diff}</strong> filles de plus que de garçons.<br />On note <strong>x</strong> le nombre de garçons.</>,
    shortA: 'garçons', shortB: 'filles', itemA: 'garçons', itemB: 'filles', itemPlural: 'élèves',
    labelB: 'Filles =', question_a: "a) Exprime le nombre de filles en fonction de x.", question_c: "c) Combien y a-t-il de filles dans la classe ?",
  },
];

interface Ex2Tpl {
  title: string;
  renderDesc: (extra: number, total: number) => ReactNode;
  itemX: string; itemAd: string; itemEn: string; itemPlural: string;
  corrX: string; corrAd: string; corrEn: string;
  labelAd: string; labelEn: string;
  question_a: string; question_c: string;
}
const EX2_TPLS: Ex2Tpl[] = [
  {
    title: 'Festival de musique',
    renderDesc: (extra, total) => <>Lors d'un festival, <strong>{total}</strong> spectateurs sont présents : des adolescents, des adultes et des enfants.<br />Il y a <strong>deux fois plus d'adultes</strong> que d'adolescents.<br />Il y a <strong>{extra} enfants de plus</strong> que d'adolescents.<br />On note <strong>x</strong> le nombre d'adolescents.</>,
    itemX: 'adolescents', itemAd: 'adultes', itemEn: 'enfants', itemPlural: 'spectateurs',
    corrX: 'Adolescents', corrAd: 'Adultes', corrEn: 'Enfants',
    labelAd: 'Adultes =', labelEn: 'Enfants =',
    question_a: "a) Exprime en fonction de x le nombre d'adultes et le nombre d'enfants.",
    question_c: "c) Combien y a-t-il d'enfants parmi les spectateurs ?",
  },
  {
    title: 'Animaux de la ferme',
    renderDesc: (extra, total) => <>Dans une ferme, il y a <strong>{total}</strong> animaux : des moutons, des poules et des lapins.<br />Il y a <strong>deux fois plus de poules</strong> que de moutons.<br />Il y a <strong>{extra} lapins de plus</strong> que de moutons.<br />On note <strong>x</strong> le nombre de moutons.</>,
    itemX: 'moutons', itemAd: 'poules', itemEn: 'lapins', itemPlural: 'animaux',
    corrX: 'Moutons', corrAd: 'Poules', corrEn: 'Lapins',
    labelAd: 'Poules =', labelEn: 'Lapins =',
    question_a: "a) Exprime en fonction de x le nombre de poules et le nombre de lapins.",
    question_c: "c) Combien y a-t-il de lapins dans la ferme ?",
  },
  {
    title: 'Bibliothèque',
    renderDesc: (extra, total) => <>Une bibliothèque possède <strong>{total}</strong> ouvrages : des romans, des bandes dessinées et des magazines.<br />Il y a <strong>deux fois plus de BD</strong> que de romans.<br />Il y a <strong>{extra} magazines de plus</strong> que de romans.<br />On note <strong>x</strong> le nombre de romans.</>,
    itemX: 'romans', itemAd: 'bandes dessinées', itemEn: 'magazines', itemPlural: 'ouvrages',
    corrX: 'Romans', corrAd: 'BD', corrEn: 'Magazines',
    labelAd: 'BD =', labelEn: 'Magazines =',
    question_a: "a) Exprime en fonction de x le nombre de BD et le nombre de magazines.",
    question_c: "c) Combien y a-t-il de magazines dans cette bibliothèque ?",
  },
  {
    title: 'Visite au zoo',
    renderDesc: (extra, total) => <>Un zoo a accueilli <strong>{total}</strong> visiteurs : des enfants, des adultes et des seniors.<br />Il y a <strong>deux fois plus d'adultes</strong> que d'enfants.<br />Il y a <strong>{extra} seniors de plus</strong> que d'enfants.<br />On note <strong>x</strong> le nombre d'enfants.</>,
    itemX: 'enfants', itemAd: 'adultes', itemEn: 'seniors', itemPlural: 'visiteurs',
    corrX: 'Enfants', corrAd: 'Adultes', corrEn: 'Seniors',
    labelAd: 'Adultes =', labelEn: 'Seniors =',
    question_a: "a) Exprime en fonction de x le nombre d'adultes et le nombre de seniors.",
    question_c: "c) Combien y a-t-il de seniors parmi les visiteurs ?",
  },
];

interface Ex3Tpl {
  title: string;
  renderDesc: (diff: number, nA: number, nB: number, total: number) => ReactNode;
  itemA: string; itemB: string; corrA: string; corrB: string; labelB: string;
  question_a: string; question_c: string;
}
const EX3_TPLS: Ex3Tpl[] = [
  {
    title: 'Pâtisserie',
    renderDesc: (diff, nA, nB, total) => <>Dans une pâtisserie, un éclair coûte <strong>{diff} € de plus</strong> qu'un croissant.<br />Léa achète <strong>{nA} croissant{nA > 1 ? 's' : ''}</strong> et <strong>{nB} éclair{nB > 1 ? 's' : ''}</strong> pour <strong>{total} €</strong>.<br />On note <strong>x</strong> le prix d'un croissant (en €).</>,
    itemA: 'croissant', itemB: 'éclair', corrA: 'Croissant', corrB: 'Éclair', labelB: 'Prix éclair =',
    question_a: "a) Exprime le prix d'un éclair en fonction de x.", question_c: "c) Quel est le prix d'un éclair ?",
  },
  {
    title: 'Marché',
    renderDesc: (diff, nA, nB, total) => <>Au marché, une poire coûte <strong>{diff} € de plus</strong> qu'une pomme.<br />Marie achète <strong>{nA} pomme{nA > 1 ? 's' : ''}</strong> et <strong>{nB} poire{nB > 1 ? 's' : ''}</strong> pour <strong>{total} €</strong>.<br />On note <strong>x</strong> le prix d'une pomme (en €).</>,
    itemA: 'pomme', itemB: 'poire', corrA: 'Pomme', corrB: 'Poire', labelB: 'Prix poire =',
    question_a: "a) Exprime le prix d'une poire en fonction de x.", question_c: "c) Quel est le prix d'une poire ?",
  },
  {
    title: 'Librairie',
    renderDesc: (diff, nA, nB, total) => <>Dans une librairie, un cahier coûte <strong>{diff} € de plus</strong> qu'un stylo.<br />Tom achète <strong>{nA} stylo{nA > 1 ? 's' : ''}</strong> et <strong>{nB} cahier{nB > 1 ? 's' : ''}</strong> pour <strong>{total} €</strong>.<br />On note <strong>x</strong> le prix d'un stylo (en €).</>,
    itemA: 'stylo', itemB: 'cahier', corrA: 'Stylo', corrB: 'Cahier', labelB: 'Prix cahier =',
    question_a: "a) Exprime le prix d'un cahier en fonction de x.", question_c: "c) Quel est le prix d'un cahier ?",
  },
  {
    title: 'Boulangerie',
    renderDesc: (diff, nA, nB, total) => <>À la boulangerie, un pain spécial coûte <strong>{diff} € de plus</strong> qu'une baguette.<br />Paul achète <strong>{nA} baguette{nA > 1 ? 's' : ''}</strong> et <strong>{nB} pain{nB > 1 ? 's' : ''} spécial{nB > 1 ? 's' : ''}</strong> pour <strong>{total} €</strong>.<br />On note <strong>x</strong> le prix d'une baguette (en €).</>,
    itemA: 'baguette', itemB: 'pain spécial', corrA: 'Baguette', corrB: 'Pain spécial', labelB: 'Prix pain spécial =',
    question_a: "a) Exprime le prix d'un pain spécial en fonction de x.", question_c: "c) Quel est le prix d'un pain spécial ?",
  },
  {
    title: 'Cantine',
    renderDesc: (diff, nA, nB, total) => <>À la cantine, un plat principal coûte <strong>{diff} € de plus</strong> qu'un dessert.<br />Alice prend <strong>{nA} dessert{nA > 1 ? 's' : ''}</strong> et <strong>{nB} plat{nB > 1 ? 's' : ''} principal{nB > 1 ? 'aux' : ''}</strong> pour <strong>{total} €</strong>.<br />On note <strong>x</strong> le prix d'un dessert (en €).</>,
    itemA: 'dessert', itemB: 'plat principal', corrA: 'Dessert', corrB: 'Plat principal', labelB: 'Prix plat principal =',
    question_a: "a) Exprime le prix d'un plat principal en fonction de x.", question_c: "c) Quel est le prix d'un plat principal ?",
  },
];

interface Ex4Tpl {
  title: string; noun: string;
  renderDesc: (L: number, perim: number) => ReactNode;
  question_a: string; question_b: string; question_c: string;
  answerC: (lon: number) => string;
}
const EX4_TPLS: Ex4Tpl[] = [
  {
    title: 'Rectangle — Jardin', noun: 'jardin',
    renderDesc: (L, perim) => <>Un jardin rectangulaire a une <strong>longueur de {L} m de plus</strong> que sa largeur.<br />Son <strong>périmètre est {perim} m</strong>.<br />On note <strong>x</strong> la largeur (en m) du jardin.</>,
    question_a: "a) Exprime la longueur du jardin en fonction de x.",
    question_b: "b) Écris une équation à partir du périmètre du jardin.",
    question_c: "c) Quelle est la longueur du jardin ?",
    answerC: (lon) => `La longueur du jardin est ${lon} m.`,
  },
  {
    title: 'Rectangle — Salon', noun: 'salon',
    renderDesc: (L, perim) => <>Un salon rectangulaire a une <strong>longueur de {L} m de plus</strong> que sa largeur.<br />Son <strong>périmètre est {perim} m</strong>.<br />On note <strong>x</strong> la largeur (en m) du salon.</>,
    question_a: "a) Exprime la longueur du salon en fonction de x.",
    question_b: "b) Écris une équation à partir du périmètre du salon.",
    question_c: "c) Quelle est la longueur du salon ?",
    answerC: (lon) => `La longueur du salon est ${lon} m.`,
  },
  {
    title: 'Rectangle — Terrain', noun: 'terrain',
    renderDesc: (L, perim) => <>Un terrain de sport rectangulaire a une <strong>longueur de {L} m de plus</strong> que sa largeur.<br />Son <strong>périmètre est {perim} m</strong>.<br />On note <strong>x</strong> la largeur (en m) du terrain.</>,
    question_a: "a) Exprime la longueur du terrain en fonction de x.",
    question_b: "b) Écris une équation à partir du périmètre du terrain.",
    question_c: "c) Quelle est la longueur du terrain ?",
    answerC: (lon) => `La longueur du terrain est ${lon} m.`,
  },
  {
    title: 'Rectangle — Piscine', noun: 'piscine',
    renderDesc: (L, perim) => <>Une piscine rectangulaire a une <strong>longueur de {L} m de plus</strong> que sa largeur.<br />Son <strong>périmètre est {perim} m</strong>.<br />On note <strong>x</strong> la largeur (en m) de la piscine.</>,
    question_a: "a) Exprime la longueur de la piscine en fonction de x.",
    question_b: "b) Écris une équation à partir du périmètre de la piscine.",
    question_c: "c) Quelle est la longueur de la piscine ?",
    answerC: (lon) => `La longueur de la piscine est ${lon} m.`,
  },
];

// ── Param interfaces ──────────────────────────────────────────────────────────

interface Ex1Params {
  tpl: number; diff: number; x: number; rouges: number; total: number;
  shortA: string; shortB: string; itemA: string; itemB: string; itemPlural: string; labelB: string;
}
interface Ex2Params {
  tpl: number; extra: number; x: number; adultes: number; enfants: number; total: number;
  itemX: string; itemAd: string; itemEn: string; itemPlural: string;
  corrX: string; corrAd: string; corrEn: string; labelAd: string; labelEn: string;
}
interface Ex3Params {
  tpl: number; pxA: number; diff: number; nA: number; nB: number; total: number; pxB: number;
  itemA: string; itemB: string; corrA: string; corrB: string; labelB: string;
}
interface Ex4Params {
  tpl: number; larg: number; L: number; lon: number; perim: number;
}

// ── Generators ────────────────────────────────────────────────────────────────

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

function genEx1(): Ex1Params {
  const tpl = ri(0, EX1_TPLS.length - 1);
  const t = EX1_TPLS[tpl];
  const diff = ri(1, 5) * 5;
  const x = ri(3, 12) * 5;
  return { tpl, diff, x, rouges: x + diff, total: 2 * x + diff, shortA: t.shortA, shortB: t.shortB, itemA: t.itemA, itemB: t.itemB, itemPlural: t.itemPlural, labelB: t.labelB };
}
function genEx2(): Ex2Params {
  const tpl = ri(0, EX2_TPLS.length - 1);
  const t = EX2_TPLS[tpl];
  const extra = ri(2, 6) * 10;
  const x = ri(5, 12) * 10;
  return { tpl, extra, x, adultes: 2 * x, enfants: x + extra, total: 4 * x + extra, itemX: t.itemX, itemAd: t.itemAd, itemEn: t.itemEn, itemPlural: t.itemPlural, corrX: t.corrX, corrAd: t.corrAd, corrEn: t.corrEn, labelAd: t.labelAd, labelEn: t.labelEn };
}
function genEx3(): Ex3Params {
  const tpl = ri(0, EX3_TPLS.length - 1);
  const t = EX3_TPLS[tpl];
  const pxA = ri(1, 3);
  const diff = ri(1, 2);
  const nA = ri(2, 4);
  const nB = ri(2, 4);
  const total = nA * pxA + nB * (pxA + diff);
  return { tpl, pxA, diff, nA, nB, total, pxB: pxA + diff, itemA: t.itemA, itemB: t.itemB, corrA: t.corrA, corrB: t.corrB, labelB: t.labelB };
}
function genEx4(): Ex4Params {
  const tpl = ri(0, EX4_TPLS.length - 1);
  const larg = ri(4, 11);
  const L = ri(2, 7);
  return { tpl, larg, L, lon: larg + L, perim: 4 * larg + 2 * L };
}
function genAll() { return { ex1: genEx1(), ex2: genEx2(), ex3: genEx3(), ex4: genEx4() }; }

// ── Correction steps ──────────────────────────────────────────────────────────

function ex1Steps(p: Ex1Params): CorrStep[] {
  const B = cap(p.shortB);
  const rhs1 = p.total - p.diff;
  return [
    { label: 'a) Expression', isSection: true },
    { label: `Les ${p.itemB} ont ${p.diff} de plus que les ${p.itemA}` },
    { eq: `${B} = x + ${p.diff}` },

    { label: 'b) Mise en équation', isSection: true },
    { label: `Total des ${p.itemPlural}` },
    { eq: `${p.itemA} + ${p.itemB} = ${p.total}` },
    { label: 'On substitue' },
    { eq: `x + (x + ${p.diff}) = ${p.total}` },
    { label: 'On simplifie' },
    { eq: `2x + ${p.diff} = ${p.total}` },

    { label: 'Résolution', isSection: true },
    { label: `On soustrait ${p.diff} des deux membres`, eq: `2x + ${p.diff} − ${p.diff} = ${p.total} − ${p.diff}`, redParts: [`− ${p.diff}`] },
    { eq: `2x = ${rhs1}` },
    { label: 'On divise les deux membres par 2', eq: `2x ÷ 2 = ${rhs1} ÷ 2`, redParts: ['÷ 2'] },
    { eq: `x = ${p.x}` },

    { label: 'c) Réponse', isSection: true },
    { eq: `${B} = x + ${p.diff} = ${p.x} + ${p.diff} = ${p.rouges}` },
    { label: `→ Il y a ${p.rouges} ${p.itemB}.` },
  ];
}

function ex2Steps(p: Ex2Params): CorrStep[] {
  const rhs1 = p.total - p.extra;
  return [
    { label: 'a) Expression', isSection: true },
    { label: `Deux fois plus de ${p.itemAd} que de ${p.itemX}` },
    { eq: `${p.corrAd} = 2x` },
    { label: `${p.extra} ${p.itemEn} de plus que de ${p.itemX}` },
    { eq: `${p.corrEn} = x + ${p.extra}` },

    { label: 'b) Mise en équation', isSection: true },
    { label: `Total des ${p.itemPlural}` },
    { eq: `${p.itemX} + ${p.itemAd} + ${p.itemEn} = ${p.total}` },
    { label: 'On substitue' },
    { eq: `x + 2x + (x + ${p.extra}) = ${p.total}` },
    { label: 'On regroupe les termes en x' },
    { eq: `4x + ${p.extra} = ${p.total}` },

    { label: 'Résolution', isSection: true },
    { label: `On soustrait ${p.extra} des deux membres`, eq: `4x + ${p.extra} − ${p.extra} = ${p.total} − ${p.extra}`, redParts: [`− ${p.extra}`] },
    { eq: `4x = ${rhs1}` },
    { label: 'On divise les deux membres par 4', eq: `4x ÷ 4 = ${rhs1} ÷ 4`, redParts: ['÷ 4'] },
    { eq: `x = ${p.x}` },

    { label: 'c) Réponse', isSection: true },
    { eq: `${p.corrEn} = x + ${p.extra} = ${p.x} + ${p.extra} = ${p.enfants}` },
    { label: `→ Il y a ${p.enfants} ${p.itemEn}.` },
  ];
}

function ex3Steps(p: Ex3Params): CorrStep[] {
  const coef = p.nA + p.nB;
  const cst = p.nB * p.diff;
  const rhs1 = p.total - cst;
  return [
    { label: 'a) Expression', isSection: true },
    { label: `Un ${p.itemB} coûte ${p.diff} € de plus qu'un ${p.itemA}` },
    { eq: `${p.corrB} = x + ${p.diff}` },

    { label: 'b) Mise en équation', isSection: true },
    { label: `Coût des ${p.nA} ${p.itemA}${p.nA > 1 ? 's' : ''}` },
    { eq: `${p.nA} × x = ${p.nA}x €` },
    { label: `Coût des ${p.nB} ${p.itemB}${p.nB > 1 ? 's' : ''}` },
    { eq: `${p.nB} × (x + ${p.diff}) = ${p.nB}x + ${cst} €` },
    { label: 'Total des achats' },
    { eq: `${p.nA}x + ${p.nB}x + ${cst} = ${p.total}` },
    { label: 'On regroupe les termes en x' },
    { eq: `${coef}x + ${cst} = ${p.total}` },

    { label: 'Résolution', isSection: true },
    { label: `On soustrait ${cst} des deux membres`, eq: `${coef}x + ${cst} − ${cst} = ${p.total} − ${cst}`, redParts: [`− ${cst}`] },
    { eq: `${coef}x = ${rhs1}` },
    { label: `On divise les deux membres par ${coef}`, eq: `${coef}x ÷ ${coef} = ${rhs1} ÷ ${coef}`, redParts: [`÷ ${coef}`] },
    { eq: `x = ${p.pxA}` },

    { label: 'c) Réponse', isSection: true },
    { eq: `${p.corrB} = x + ${p.diff} = ${p.pxA} + ${p.diff} = ${p.pxB} €` },
    { label: `→ Un ${p.itemB} coûte ${p.pxB} €.` },
  ];
}

function ex4Steps(p: Ex4Params): CorrStep[] {
  const t = EX4_TPLS[p.tpl];
  const cst = 2 * p.L;
  const rhs1 = p.perim - cst;
  return [
    { label: 'a) Expression', isSection: true },
    { label: `La longueur est ${p.L} m de plus que la largeur x` },
    { eq: `Longueur = x + ${p.L}` },

    { label: 'b) Mise en équation', isSection: true },
    { label: 'Formule du périmètre' },
    { eq: 'Périmètre = 2 × (largeur + longueur)' },
    { label: 'On substitue' },
    { eq: `= 2 × (x + x + ${p.L})` },
    { eq: `= 2 × (2x + ${p.L})` },
    { eq: `= 4x + ${cst}` },
    { label: `Équation : périmètre = ${p.perim}` },
    { eq: `4x + ${cst} = ${p.perim}` },

    { label: 'Résolution', isSection: true },
    { label: `On soustrait ${cst} des deux membres`, eq: `4x + ${cst} − ${cst} = ${p.perim} − ${cst}`, redParts: [`− ${cst}`] },
    { eq: `4x = ${rhs1}` },
    { label: 'On divise les deux membres par 4', eq: `4x ÷ 4 = ${rhs1} ÷ 4`, redParts: ['÷ 4'] },
    { eq: `x = ${p.larg}` },

    { label: 'c) Réponse', isSection: true },
    { eq: `Longueur = x + ${p.L} = ${p.larg} + ${p.L} = ${p.lon} m` },
    { label: `→ ${t.answerC(p.lon)}` },
  ];
}

// ── Exercise cards ────────────────────────────────────────────────────────────

function Ex1Card({ p }: { p: Ex1Params }) {
  const t = EX1_TPLS[p.tpl];
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [vB, setVB] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const rB = useRef<HTMLInputElement>(null);
  const rEq = useRef<HTMLInputElement>(null);
  const rX = useRef<HTMLInputElement>(null);
  const rC = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (step === 0) rB.current?.focus();
    else if (step === 1) rEq.current?.focus();
    else if (step === 2) rX.current?.focus();
    else if (step === 3) rC.current?.focus();
  }, [step]);
  const next = (n: number) => { setErr(''); setStep(n); };
  const doB = () => {
    if (checkExprMatch(vB, `x + ${p.diff}`)) next(1);
    else setErr(`Les ${p.itemB} ont ${p.diff} de plus que les ${p.itemA}, donc ${p.shortB} = x + ${p.diff}. Réessaie !`);
  };
  const doEq = () => {
    if (checkEq(veq, p.x)) next(2);
    else setErr(`Cette équation n'est pas correcte. Exprime le total des ${p.total} ${p.itemPlural} en fonction de x. Réessaie !`);
  };
  const doX = () => { if (parseFloat(vx) === p.x) next(3); else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`); };
  const doC = () => {
    if (parseFloat(vc) === p.rouges) next(4);
    else setErr(`${cap(p.shortB)} = x + ${p.diff} = ${p.x} + ${p.diff}. Réessaie !`);
  };
  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 1</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.title}</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>{t.renderDesc(p.diff, p.total)}</div>
      <div className="gd-step">
        <QL text={t.question_a} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>{p.labelB}</span>
          <TextInp inputRef={rB} value={vB} onChange={setVB} onEnter={doB} disabled={step > 0} />
        </div>
        {step === 0 && <Vbtn onClick={doB} />}
        {step > 0 && <OkBox>✓ {p.labelB} <strong>x + {p.diff}</strong></OkBox>}
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
          <QL text={t.question_c} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>{p.itemB}</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ Il y a <strong>{p.rouges}</strong> {p.itemB}.</OkBox>}
        </div>
      )}
      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex1Steps(p)} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

function Ex2Card({ p }: { p: Ex2Params }) {
  const t = EX2_TPLS[p.tpl];
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
    const adOk = checkExprMatch(vAd, '2x');
    const enOk = checkExprMatch(vEn, `x + ${p.extra}`);
    if (adOk && enOk) next(1);
    else if (!adOk) setErr(`Il y a deux fois plus de ${p.itemAd} que de ${p.itemX} → ${p.itemAd} = 2x. Réessaie !`);
    else setErr(`Il y a ${p.extra} ${p.itemEn} de plus que de ${p.itemX} → ${p.itemEn} = x + ${p.extra}. Réessaie !`);
  };
  const doEq = () => {
    if (checkEq(veq, p.x)) next(2);
    else setErr(`Cette équation n'est pas correcte. Exprime le total (${p.total}) en fonction de x. Réessaie !`);
  };
  const doX = () => { if (parseFloat(vx) === p.x) next(3); else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`); };
  const doC = () => {
    if (parseFloat(vc) === p.enfants) next(4);
    else setErr(`${p.corrEn} = x + ${p.extra} = ${p.x} + ${p.extra}. Réessaie !`);
  };
  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 2</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.title}</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>{t.renderDesc(p.extra, p.total)}</div>
      <div className="gd-step">
        <QL text={t.question_a} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 115 }}>{p.labelAd}</span>
            <TextInp inputRef={rAd} value={vAd} onChange={setVAd} onEnter={() => rEn.current?.focus()} disabled={step > 0} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 115 }}>{p.labelEn}</span>
            <TextInp inputRef={rEn} value={vEn} onChange={setVEn} onEnter={doA} disabled={step > 0} />
          </div>
        </div>
        {step === 0 && <Vbtn onClick={doA} />}
        {step > 0 && <OkBox>✓ {p.corrAd} = <strong>2x</strong> · {p.corrEn} = <strong>x + {p.extra}</strong></OkBox>}
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
          <QL text={t.question_c} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>{p.itemEn}</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ Il y a <strong>{p.enfants}</strong> {p.itemEn}.</OkBox>}
        </div>
      )}
      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex2Steps(p)} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

function Ex3Card({ p }: { p: Ex3Params }) {
  const t = EX3_TPLS[p.tpl];
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [vB, setVB] = useState('');
  const [veq, setVeq] = useState('');
  const [vx, setVx] = useState('');
  const [vc, setVc] = useState('');
  const [err, setErr] = useState('');
  const rB = useRef<HTMLInputElement>(null);
  const rEq = useRef<HTMLInputElement>(null);
  const rX = useRef<HTMLInputElement>(null);
  const rC = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (step === 0) rB.current?.focus();
    else if (step === 1) rEq.current?.focus();
    else if (step === 2) rX.current?.focus();
    else if (step === 3) rC.current?.focus();
  }, [step]);
  const next = (n: number) => { setErr(''); setStep(n); };
  const doB = () => {
    if (checkExprMatch(vB, `x + ${p.diff}`)) next(1);
    else setErr(`Un ${p.itemB} coûte ${p.diff} € de plus qu'un ${p.itemA} → prix ${p.itemB} = x + ${p.diff}. Réessaie !`);
  };
  const doEq = () => {
    if (checkEq(veq, p.pxA)) next(2);
    else setErr(`Cette équation n'est pas correcte. Exprime le coût total (${p.total} €) en fonction de x. Réessaie !`);
  };
  const doX = () => { if (parseFloat(vx) === p.pxA) next(3); else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`); };
  const doC = () => {
    if (parseFloat(vc) === p.pxB) next(4);
    else setErr(`Prix ${p.itemB} = x + ${p.diff} = ${p.pxA} + ${p.diff}. Réessaie !`);
  };
  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 3</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.title}</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>{t.renderDesc(p.diff, p.nA, p.nB, p.total)}</div>
      <div className="gd-step">
        <QL text={t.question_a} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>{p.labelB}</span>
          <TextInp inputRef={rB} value={vB} onChange={setVB} onEnter={doB} disabled={step > 0} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>€</span>
        </div>
        {step === 0 && <Vbtn onClick={doB} />}
        {step > 0 && <OkBox>✓ {p.labelB} <strong>x + {p.diff}</strong> €</OkBox>}
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
          {step > 2 && <OkBox>✓ <strong>x = {p.pxA}</strong> €</OkBox>}
        </div>
      )}
      {step >= 3 && (
        <div className="gd-step">
          <QL text={t.question_c} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>€</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ Un {p.itemB} coûte <strong>{p.pxB} €</strong>.</OkBox>}
        </div>
      )}
      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex3Steps(p)} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

function Ex4Card({ p }: { p: Ex4Params }) {
  const t = EX4_TPLS[p.tpl];
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
  const doLon = () => {
    if (checkExprMatch(vLon, `x + ${p.L}`)) next(1);
    else setErr(`La longueur est ${p.L} m de plus que la largeur → longueur = x + ${p.L}. Réessaie !`);
  };
  const doEq = () => {
    if (checkEq(veq, p.larg)) next(2);
    else setErr(`Cette équation n'est pas correcte. Exprime le périmètre (${p.perim} m) en fonction de x. Réessaie !`);
  };
  const doX = () => { if (parseFloat(vx) === p.larg) next(3); else setErr(`Ce n'est pas la bonne valeur de x. Réessaie !`); };
  const doC = () => {
    if (parseFloat(vc) === p.lon) next(4);
    else setErr(`Longueur = x + ${p.L} = ${p.larg} + ${p.L}. Réessaie !`);
  };
  return (
    <div className="eqcard" style={{ borderLeftColor: ACCENT }}>
      <div className="eqcard-top">
        <span className="qnum">Ex 4</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.title}</span>
      </div>
      <div className="gd-method-box" style={{ fontSize: 14, lineHeight: 1.9, marginBottom: '1rem' }}>{t.renderDesc(p.L, p.perim)}</div>
      <RectFig L={p.L} />
      <div className="gd-step">
        <QL text={t.question_a} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)', minWidth: 105 }}>Longueur =</span>
          <TextInp inputRef={rLon} value={vLon} onChange={setVLon} onEnter={doLon} disabled={step > 0} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>m</span>
        </div>
        {step === 0 && <Vbtn onClick={doLon} />}
        {step > 0 && <OkBox>✓ Longueur = <strong>x + {p.L}</strong> m</OkBox>}
      </div>
      {step >= 1 && (
        <div className="gd-step">
          <QL text={t.question_b} />
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
          {step > 2 && <OkBox>✓ <strong>x = {p.larg}</strong> m</OkBox>}
        </div>
      )}
      {step >= 3 && (
        <div className="gd-step">
          <QL text={t.question_c} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <NumInp inputRef={rC} value={vc} onChange={setVc} onEnter={doC} disabled={step > 3} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: 'var(--muted)' }}>m</span>
          </div>
          {step === 3 && <Vbtn onClick={doC} />}
          {step > 3 && <OkBox>✓ {t.answerC(p.lon)}</OkBox>}
        </div>
      )}
      {err && <div className="gd-error">{err}</div>}
      <SolutionBox steps={ex4Steps(p)} open={open} onToggle={() => setOpen(v => !v)} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
      </div>
    </div>
  );
}
