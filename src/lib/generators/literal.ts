import type { LiteralExercise, LiteralSubtype } from '@/types';

const COLORS: Record<LiteralSubtype, string> = {
  reduce: '#e879f9',
  develop: '#a78bfa',
  factor: '#f0abfc',
  reduce_paren: '#7dd3fc',
  substitute: '#fbbf24',
  complex: '#E879F9',
};
const LABELS: Record<LiteralSubtype, string> = {
  reduce: 'Réduire',
  develop: 'Développer',
  factor: 'Factoriser',
  reduce_paren: 'Réduire (parenthèses)',
  substitute: 'Substituer',
  complex: 'Calculs complexes',
};

const randNZ = (a: number, b: number) => {
  let v = 0;
  while (v === 0) v = Math.floor(Math.random() * (b - a + 1)) + a;
  return v;
};
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

function ex(subtype: LiteralSubtype, expr: string, ans: string, steps: string, isNum = false): LiteralExercise {
  return {
    type: 'default',
    subtype,
    label: LABELS[subtype],
    color: COLORS[subtype],
    expr,
    ans,
    steps,
    isNum,
  };
}

// ── RÉDUIRE (simple) ──────────────────────────────────────
function makeReduce(): LiteralExercise {
  const v = pick(['x', 'y', 'z', 'a', 'b'] as const);
  if (Math.random() < 0.5) {
    const a = randNZ(-9, 9);
    const b = randNZ(-9, 9);
    const r = a + b;
    const ans = r === 0 ? '0' : r === 1 ? v : r === -1 ? `-${v}` : `${r}${v}`;
    const expr = `${a}${v} ${b >= 0 ? '+ ' : '− '}${Math.abs(b)}${v}`;
    const steps = `<div style="color:var(--text);">${a}${v} ${b >= 0 ? '+ ' : '− '}${Math.abs(b)}${v} = (${a} ${b >= 0 ? '+' : ''}${b}) × ${v} = <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('reduce', expr, ans, steps);
  }
  const a = randNZ(-9, 9);
  const b = randNZ(-9, 9);
  const c = randNZ(-15, 15);
  const d = randNZ(-15, 15);
  const rv = a + b;
  const rc = c + d;
  const vp = rv === 0 ? '' : rv === 1 ? v : rv === -1 ? `-${v}` : `${rv}${v}`;
  const cp = rc === 0 ? '' : rc > 0 ? `+ ${rc}` : `− ${Math.abs(rc)}`;
  const ans = rv === 0 && rc === 0 ? '0' : `${vp}${vp && cp ? ' ' : ''}${cp}`.trim();
  const expr = `${a}${v} ${c >= 0 ? '+ ' : '− '}${Math.abs(c)} ${b >= 0 ? '+ ' : '− '}${Math.abs(b)}${v} ${d >= 0 ? '+ ' : '− '}${Math.abs(d)}`;
  const steps = `<div style="color:var(--text);">Termes en ${v} : ${a}${v} ${b >= 0 ? '+ ' : '− '}${Math.abs(b)}${v} = <strong>${rv}${v}</strong> &nbsp;|&nbsp; Constantes : ${c} ${d >= 0 ? '+ ' : '− '}${Math.abs(d)} = <strong>${rc}</strong> &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
  return ex('reduce', expr, ans, steps);
}

// ── RÉDUIRE (degré 2 + degré 1 + constante) ───────────────
function makeReduceFull(): LiteralExercise {
  const v = pick(['x', 'y', 'z'] as const);
  const a = randNZ(-4, 4);
  const d = randNZ(-4, 4);
  const b = randNZ(-8, 8);
  const e = randNZ(-8, 8);
  const c = randNZ(-10, 10);
  const f = randNZ(-10, 10);
  const rv2 = a + d;
  const rv = b + e;
  const rc = c + f;

  let ans = '';
  const parts: string[] = [];
  if (rv2 !== 0) {
    const cf = Math.abs(rv2) === 1 ? '' : `${Math.abs(rv2)}`;
    parts.push(rv2 < 0 ? `−${cf}${v}²` : `${cf}${v}²`);
  }
  if (rv !== 0) {
    const cf = Math.abs(rv) === 1 ? '' : `${Math.abs(rv)}`;
    parts.push(rv < 0 ? `− ${cf}${v}` : `+ ${cf}${v}`);
  }
  if (rc !== 0) parts.push(rc < 0 ? `− ${Math.abs(rc)}` : `+ ${rc}`);
  ans = parts.join(' ').replace(/^\+ /, '').trim() || '0';

  const steps = `<div style="color:var(--text);">Termes en ${v}² : ${a}${v}² ${d >= 0 ? '+ ' : '− '}${Math.abs(d)}${v}² = <strong>${rv2}${v}²</strong> &nbsp;|&nbsp; Termes en ${v} : ${b}${v} ${e >= 0 ? '+ ' : '− '}${Math.abs(e)}${v} = <strong>${rv}${v}</strong> &nbsp;|&nbsp; Termes constants : ${c} ${f >= 0 ? '+ ' : '− '}${Math.abs(f)} = <strong>${rc}</strong> &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;

  const exprParts: string[] = [];
  const s1 = Math.abs(a) === 1 ? '' : `${Math.abs(a)}`;
  exprParts.push(a < 0 ? `−${s1}${v}²` : `${s1}${v}²`);
  const s2 = Math.abs(b) === 1 ? '' : `${Math.abs(b)}`;
  exprParts.push(b >= 0 ? `+ ${s2}${v}` : `− ${Math.abs(b) === 1 ? '' : Math.abs(b)}${v}`);
  exprParts.push(c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`);
  const s3 = Math.abs(d) === 1 ? '' : `${Math.abs(d)}`;
  exprParts.push(d >= 0 ? `+ ${s3}${v}²` : `− ${Math.abs(d) === 1 ? '' : Math.abs(d)}${v}²`);
  const s4 = Math.abs(e) === 1 ? '' : `${Math.abs(e)}`;
  exprParts.push(e >= 0 ? `+ ${s4}${v}` : `− ${Math.abs(e) === 1 ? '' : Math.abs(e)}${v}`);
  exprParts.push(f >= 0 ? `+ ${f}` : `− ${Math.abs(f)}`);
  const expr = exprParts.join(' ').replace(/^\+ /, '');

  return ex('reduce', expr, ans, steps);
}

// ── RÉDUIRE avec parenthèses ──────────────────────────────
function makeReduceParen(): LiteralExercise {
  const v = pick(['x', 'y', 'z', 'a', 'b'] as const);
  const t = pick(['plus_paren', 'minus_paren', 'two_parens', 'develop_then_reduce'] as const);

  if (t === 'plus_paren') {
    const a = randNZ(-10, 10);
    const b = randNZ(-8, 8);
    const c = randNZ(-10, 10);
    const rv = b;
    const rc = a + c;
    const vp = rv === 0 ? '' : rv === 1 ? v : rv === -1 ? `−${v}` : `${rv}${v}`;
    const cp = rc === 0 ? '' : rc > 0 ? `+ ${rc}` : `− ${Math.abs(rc)}`;
    const ans = rv === 0 && rc === 0 ? '0' : `${vp}${vp && cp ? ' ' : ''}${cp}`.trim();
    const expr = `${a} + (${b}${v} ${c >= 0 ? '+ ' : '− '}${Math.abs(c)})`;
    const steps = `<div style="color:var(--text);">On supprime les parenthèses (signe +, rien ne change) : ${a} + ${b}${v} ${c >= 0 ? '+ ' : '− '}${Math.abs(c)} &nbsp;→&nbsp; Termes en ${v} : <strong>${rv}${v}</strong> &nbsp;|&nbsp; Termes constants : ${a} ${c >= 0 ? '+ ' : '− '}${Math.abs(c)} = <strong>${rc}</strong> &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('reduce_paren', expr, ans, steps);
  }
  if (t === 'minus_paren') {
    const a = randNZ(-10, 10);
    const b = randNZ(1, 8);
    const c = randNZ(1, 10);
    const rv = -b;
    const rc = a - c;
    const vp = rv === 0 ? '' : rv === 1 ? v : rv === -1 ? `−${v}` : `${rv}${v}`;
    const cp = rc === 0 ? '' : rc > 0 ? `+ ${rc}` : `− ${Math.abs(rc)}`;
    const ans = rv === 0 && rc === 0 ? '0' : `${vp}${vp && cp ? ' ' : ''}${cp}`.trim();
    const expr = `${a} − (${b}${v} + ${c})`;
    const steps = `<div style="color:var(--text);">Signe − devant la parenthèse : on change tous les signes. ${a} − ${b}${v} − ${c} &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('reduce_paren', expr, ans, steps);
  }
  if (t === 'two_parens') {
    const a = randNZ(1, 8);
    const b = randNZ(-10, 10);
    const c = randNZ(1, 8);
    const d = randNZ(-10, 10);
    const rv = a - c;
    const rc = b - d;
    const vp = rv === 0 ? '' : rv === 1 ? v : rv === -1 ? `−${v}` : `${rv}${v}`;
    const cp = rc === 0 ? '' : rc > 0 ? `+ ${rc}` : `− ${Math.abs(rc)}`;
    const ans = rv === 0 && rc === 0 ? '0' : `${vp}${vp && cp ? ' ' : ''}${cp}`.trim();
    const bS = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const dS = d >= 0 ? `+ ${d}` : `− ${Math.abs(d)}`;
    const expr = `(${a}${v} ${bS}) − (${c}${v} ${dS})`;
    const steps = `<div style="color:var(--text);">On supprime les parenthèses : ${a}${v} ${bS} − ${c}${v} ${dS} &nbsp;→&nbsp; Termes en ${v} : <strong>${rv}${v}</strong> &nbsp;|&nbsp; Termes constants : <strong>${rc}</strong> &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('reduce_paren', expr, ans, steps);
  }
  // develop_then_reduce
  const k = randNZ(1, 6);
  const m = randNZ(2, 5);
  const a = randNZ(1, 6);
  const b = randNZ(-8, 8);
  const rv = k + m * a;
  const rc = m * b;
  const vp = rv === 0 ? '' : rv === 1 ? v : rv === -1 ? `−${v}` : `${rv}${v}`;
  const cp = rc === 0 ? '' : rc > 0 ? `+ ${rc}` : `− ${Math.abs(rc)}`;
  const ans = rv === 0 && rc === 0 ? '0' : `${vp}${vp && cp ? ' ' : ''}${cp}`.trim();
  const bS = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
  const expr = `${k}${v} + ${m}(${a}${v} ${bS})`;
  const steps = `<div style="color:var(--text);">Développer : ${m}(${a}${v} ${bS}) = ${m * a}${v} ${m * b >= 0 ? '+ ' : '− '}${Math.abs(m * b)} &nbsp;→&nbsp; ${k}${v} + ${m * a}${v} ${m * b >= 0 ? '+ ' : '− '}${Math.abs(m * b)} &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
  return ex('reduce_paren', expr, ans, steps);
}

// ── DÉVELOPPER ────────────────────────────────────────────
function makeDevelop(): LiteralExercise {
  const v = pick(['x', 'y', 'z', 'a', 'b'] as const);
  const t = pick(['pos_int', 'neg_int', 'pos_var'] as const);

  if (t === 'pos_int') {
    const k = randNZ(2, 9);
    const a = randNZ(-12, 12);
    const sign = a >= 0 ? '+' : '−';
    const rv = k;
    const rc = k * a;
    const rcStr = rc >= 0 ? `+ ${rc}` : `− ${Math.abs(rc)}`;
    const ans = `${rv}${v} ${rcStr}`;
    const steps = `<div style="color:var(--text);">${k} × ${v} = <strong>${rv}${v}</strong> &nbsp;|&nbsp; ${k} × (${a}) = <strong>${rc}</strong> &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('develop', `${k}(${v} ${sign} ${Math.abs(a)})`, ans, steps);
  }
  if (t === 'neg_int') {
    const k = randNZ(2, 9);
    const a = randNZ(-12, 12);
    const rv = -k;
    const rc = -k * a;
    const rvStr = rv === -1 ? `−${v}` : `${rv}${v}`;
    const rcStr = rc >= 0 ? `+ ${rc}` : `− ${Math.abs(rc)}`;
    const ans = `${rvStr} ${rcStr}`;
    const sign = a >= 0 ? '+' : '−';
    const steps = `<div style="color:var(--text);">(−${k}) × ${v} = <strong>${rv}${v}</strong> &nbsp;|&nbsp; (−${k}) × (${a}) = <strong>${rc}</strong> &nbsp;(rappel : (−)×(${a >= 0 ? '+' : '−'}) = ${rc >= 0 ? '(+)' : '(−)'}) &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('develop', `−${k}(${v} ${sign} ${Math.abs(a)})`, ans, steps);
  }
  const c = randNZ(-9, 9);
  const cvStr = c >= 0 ? `+ ${c}${v}` : `− ${Math.abs(c)}${v}`;
  const ans = `${v}² ${cvStr}`;
  const sign = c >= 0 ? '+' : '−';
  const steps = `<div style="color:var(--text);">${v} × ${v} = <strong>${v}²</strong> &nbsp;|&nbsp; ${v} × (${c}) = <strong>${c}${v}</strong> &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
  return ex('develop', `${v}(${v} ${sign} ${Math.abs(c)})`, ans, steps);
}

// ── FACTORISER ────────────────────────────────────────────
function makeFactor(): LiteralExercise {
  const v = pick(['x', 'y', 'z', 'a', 'b'] as const);
  const t = pick(['num', 'neg_num', 'var_factor'] as const);

  if (t === 'num') {
    const k = randNZ(2, 9);
    const a = randNZ(1, 12);
    const b = randNZ(-12, 12);
    const expr = `${k * a}${v} ${k * b >= 0 ? '+ ' : '− '}${Math.abs(k * b)}`;
    const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const ans = `${k}(${a}${v} ${bStr})`;
    const steps = `<div style="color:var(--text);">Facteur commun : <strong>${k}</strong> &nbsp;|&nbsp; ${k * a}${v} = ${k} × ${a}${v} &nbsp;|&nbsp; ${k * b} = ${k} × (${b}) &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('factor', expr, ans, steps);
  }
  if (t === 'neg_num') {
    const k = randNZ(2, 8);
    const a = randNZ(1, 10);
    const b = randNZ(1, 10);
    const expr = `−${k * a}${v} − ${k * b}`;
    const ans = `−${k}(${a}${v} + ${b})`;
    const steps = `<div style="color:var(--text);">Facteur commun : <strong>−${k}</strong> &nbsp;|&nbsp; −${k * a}${v} = (−${k}) × ${a}${v} &nbsp;|&nbsp; −${k * b} = (−${k}) × ${b} &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('factor', expr, ans, steps);
  }
  const a = randNZ(1, 8);
  const b = randNZ(-8, 8);
  const expr = `${a}${v}² ${b >= 0 ? '+ ' : '− '}${Math.abs(b)}${v}`;
  const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
  const ans = `${v}(${a}${v} ${bStr})`;
  const steps = `<div style="color:var(--text);">Facteur commun : <strong>${v}</strong> &nbsp;|&nbsp; ${a}${v}² = ${v} × ${a}${v} &nbsp;|&nbsp; ${b}${v} = ${v} × (${b}) &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
  return ex('factor', expr, ans, steps);
}

function makeFactorNumVar(): LiteralExercise {
  const v = pick(['x', 'y', 'z', 'a', 'b'] as const);
  const k = randNZ(2, 6);
  const c = randNZ(1, 5) * k * (Math.random() < 0.5 ? 1 : -1);
  const ck = c / k;
  const expr = `${k}${v}² ${c >= 0 ? '+ ' : '− '}${Math.abs(c)}${v}`;
  const ckStr = ck >= 0 ? `+ ${ck}` : `− ${Math.abs(ck)}`;
  const ans = `${k}${v}(${v} ${ckStr})`;
  const steps = `<div style="color:var(--text);">Facteur commun : <strong>${k}${v}</strong> &nbsp;|&nbsp; ${k}${v}² = ${k}${v} × ${v} &nbsp;|&nbsp; ${c}${v} = ${k}${v} × (${ck}) &nbsp;→&nbsp; <strong style="color:var(--correct);">${ans}</strong></div>`;
  return ex('factor', expr, ans, steps);
}

// ── SUBSTITUER ────────────────────────────────────────────
function mulDisp(coef: number, xval: number) {
  return xval < 0 ? `${coef} × (${xval})` : `${coef} × ${xval}`;
}

type SubSubtype = 'very_simple' | 'linear' | 'linear_factor' | 'product' | 'quadratic';

function makeSubType(subtype: SubSubtype): LiteralExercise {
  const v = pick(['x', 'y', 'z', 'a', 'b', 't'] as const);

  if (subtype === 'very_simple') {
    const c = randNZ(2, 12);
    const xval = pick([1, 2, 3, 4, 5, 6] as const);
    const ans = xval + c;
    const steps = `<div style="color:var(--text);">On remplace <strong>${v}</strong> par <strong>${xval}</strong> : ${xval} + ${c} = <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('substitute', `${v} + ${c}, pour ${v} = ${xval}`, `${ans}`, steps, true);
  }
  if (subtype === 'linear') {
    const a = randNZ(2, 7);
    const b = randNZ(-10, 10);
    const xval = pick([-3, -2, -1, 1, 2, 3] as const);
    const ans = a * xval + b;
    const bsign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const expr = `${a}${v} ${bsign}`;
    const subStep = mulDisp(a, xval);
    const mid = a * xval;
    const steps = `<div style="color:var(--text);">On remplace <strong>${v}</strong> par <strong>${xval}</strong> : ${subStep} ${bsign} = ${mid} ${bsign} = <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('substitute', `${expr}, pour ${v} = ${xval}`, `${ans}`, steps, true);
  }
  if (subtype === 'linear_factor') {
    const k = randNZ(2, 5);
    const a = randNZ(1, 4);
    const b = randNZ(-6, 6);
    const xval = pick([-2, -1, 1, 2, 3] as const);
    const inner = a * xval + b;
    const ans = k * inner;
    const bsign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const expr = `${k}(${a}${v} ${bsign})`;
    const axDisp = xval < 0 ? `${a} × (${xval})` : `${a} × ${xval}`;
    const innerPart = inner < 0 ? `(${inner})` : `${inner}`;
    const steps = `<div style="color:var(--text);">On remplace <strong>${v}</strong> par <strong>${xval}</strong> :</div>
      <div style="margin-top:6px;color:var(--text);">${k}(${axDisp} ${bsign}) = ${k}(${a * xval} ${bsign}) = ${k} × ${innerPart} = <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('substitute', `${expr}, pour ${v} = ${xval}`, `${ans}`, steps, true);
  }
  if (subtype === 'product') {
    const a = randNZ(2, 8);
    const b = randNZ(1, 4);
    const xval = pick([-3, -2, -1, 1, 2, 3] as const);
    const inner = a + b * xval;
    const ans = xval * inner;
    const bsign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const expr = `${v}(${a} ${bsign}${v})`;
    const bxDisp = xval < 0 ? `${b} × (${xval})` : `${b} × ${xval}`;
    const xDisp = xval < 0 ? `(${xval})` : `${xval}`;
    const innerDisp = inner < 0 ? `(${inner})` : `${inner}`;
    const steps = `<div style="color:var(--text);">On remplace <strong>${v}</strong> par <strong>${xval}</strong> :</div>
      <div style="margin-top:6px;color:var(--text);">${xDisp} × (${a} + ${bxDisp}) = ${xDisp} × (${a} + ${b * xval}) = ${xDisp} × ${innerDisp} = <strong style="color:var(--correct);">${ans}</strong></div>`;
    return ex('substitute', `${expr}, pour ${v} = ${xval}`, `${ans}`, steps, true);
  }
  // quadratic
  const a = randNZ(1, 3);
  const b = randNZ(-4, 4);
  const c = randNZ(-6, 6);
  const xval = pick([-2, -1, 1, 2] as const);
  const ans = a * xval * xval + b * xval + c;
  const bsign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
  const csign = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
  const expr = `${a}${v}² ${bsign}${v} ${csign}`;
  const v2Disp = xval < 0 ? `(${xval})²` : `${xval}²`;
  const steps = `<div style="color:var(--text);">On remplace <strong>${v}</strong> par <strong>${xval}</strong> :</div>
    <div style="margin-top:6px;color:var(--text);">${a} × ${v2Disp} ${bsign}${Math.abs(b) > 0 ? ` × ${xval < 0 ? `(${xval})` : `${xval}`}` : ''} ${csign}</div>
    <div style="margin-top:4px;color:var(--text);">= ${a} × ${xval * xval} ${bsign} ${Math.abs(b * xval)} ${csign}</div>
    <div style="margin-top:4px;color:var(--text);">= ${a * xval * xval} ${bsign} ${Math.abs(b * xval)} ${csign} = <strong style="color:var(--correct);">${ans}</strong></div>`;
  return ex('substitute', `${expr}, pour ${v} = ${xval}`, `${ans}`, steps, true);
}

export function generateLiteralSeries(): LiteralExercise[] {
  return [
    makeReduce(),
    makeReduce(),
    makeReduce(),
    makeReduceFull(),
    makeReduceFull(),
    makeDevelop(),
    makeDevelop(),
    makeDevelop(),
    makeDevelop(),
    makeDevelop(),
    makeFactor(),
    makeFactor(),
    makeFactor(),
    makeFactor(),
    makeFactorNumVar(),
    makeReduceParen(),
    makeReduceParen(),
    makeReduceParen(),
    makeReduceParen(),
    makeReduceParen(),
    makeSubType('very_simple'),
    makeSubType('linear'),
    makeSubType('linear_factor'),
    makeSubType('product'),
    makeSubType('quadratic'),
  ];
}

// ── LITTÉRAL COMPLEXE — hand-curated bank of 14 questions ─
// Source: Site.html LC_QUESTIONS_BANK (lines 4154–4284).
// Each session shuffles and picks 10. All accent-coloured c7.

const LITERAL_COMPLEX_BANK: { label: string; expr: string; ans: string; steps: string }[] = [
  {
    label: 'Réduire (3 types)',
    expr: '5y² + 1 + 3y + 8 + 2y² + 4',
    ans: '7y² + 3y + 13',
    steps: `<div style="color:var(--text);">Termes en y² : 5y² + 2y² = <strong>7y²</strong> &nbsp;|&nbsp; Termes en y : 3y &nbsp;|&nbsp; Termes constants : 1 + 8 + 4 = <strong>13</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 7y² + 3y + 13</div>`,
  },
  {
    label: 'Réduire (3 types)',
    expr: '6 + 4y + 9y² − 10y − y² + 7',
    ans: '8y² − 6y + 13',
    steps: `<div style="color:var(--text);">Termes en y² : 9y² − y² = <strong>8y²</strong> &nbsp;|&nbsp; Termes en y : 4y − 10y = <strong>−6y</strong> &nbsp;|&nbsp; Termes constants : 6 + 7 = <strong>13</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 8y² − 6y + 13</div>`,
  },
  {
    label: 'Réduire (3 types)',
    expr: '9 − 2y² + 3y² − 6y − 7 + 5y − 8y²',
    ans: '−7y² − y + 2',
    steps: `<div style="color:var(--text);">Termes en y² : −2y² + 3y² − 8y² = <strong>−7y²</strong> &nbsp;|&nbsp; Termes en y : −6y + 5y = <strong>−y</strong> &nbsp;|&nbsp; Termes constants : 9 − 7 = <strong>2</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= −7y² − y + 2</div>`,
  },
  {
    label: 'Réduire (3 types)',
    expr: '6x² + 9 + 2x + 5 + 4x² + 3',
    ans: '10x² + 2x + 17',
    steps: `<div style="color:var(--text);">Termes en x² : 6x² + 4x² = <strong>10x²</strong> &nbsp;|&nbsp; Termes en x : 2x &nbsp;|&nbsp; Termes constants : 9 + 5 + 3 = <strong>17</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 10x² + 2x + 17</div>`,
  },
  {
    label: 'Réduire (3 types)',
    expr: '−1 + 5x + 8x² − 10x − 3x² − 7',
    ans: '5x² − 5x − 8',
    steps: `<div style="color:var(--text);">Termes en x² : 8x² − 3x² = <strong>5x²</strong> &nbsp;|&nbsp; Termes en x : 5x − 10x = <strong>−5x</strong> &nbsp;|&nbsp; Termes constants : −1 − 7 = <strong>−8</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 5x² − 5x − 8</div>`,
  },
  {
    label: 'Réduire (3 types)',
    expr: '7 − x² − 4x² − 9x − 8 + 6x + 2x²',
    ans: '−3x² − 3x − 1',
    steps: `<div style="color:var(--text);">Termes en x² : −x² − 4x² + 2x² = <strong>−3x²</strong> &nbsp;|&nbsp; Termes en x : −9x + 6x = <strong>−3x</strong> &nbsp;|&nbsp; Termes constants : 7 − 8 = <strong>−1</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= −3x² − 3x − 1</div>`,
  },
  {
    label: 'Parenthèses et réduction',
    expr: '(6x + 9) − (−8x − 2)',
    ans: '14x + 11',
    steps: `<div style="color:var(--text);">On supprime les parenthèses : (−) × (−) = (+)</div>
    <div style="margin-top:6px;color:var(--text);">6x + 9 + 8x + 2</div>
    <div style="margin-top:6px;color:var(--text);">Termes en x : 6x + 8x = <strong>14x</strong> &nbsp;|&nbsp; Termes constants : 9 + 2 = <strong>11</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 14x + 11</div>`,
  },
  {
    label: 'Parenthèses et réduction',
    expr: '(−5x + 7) − (8 − 3x) + x',
    ans: '−x − 1',
    steps: `<div style="color:var(--text);">On supprime les parenthèses : −5x + 7 − 8 + 3x + x</div>
    <div style="margin-top:6px;color:var(--text);">Termes en x : −5x + 3x + x = <strong>−x</strong> &nbsp;|&nbsp; Termes constants : 7 − 8 = <strong>−1</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= −x − 1</div>`,
  },
  {
    label: 'Parenthèses et réduction',
    expr: '9x − (−5 + x) + (−4x + 2)',
    ans: '4x + 7',
    steps: `<div style="color:var(--text);">On supprime les parenthèses : 9x + 5 − x − 4x + 2</div>
    <div style="margin-top:6px;color:var(--text);">Termes en x : 9x − x − 4x = <strong>4x</strong> &nbsp;|&nbsp; Termes constants : 5 + 2 = <strong>7</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 4x + 7</div>`,
  },
  {
    label: 'Développer puis réduire',
    expr: '3y + 5y(y − 2)',
    ans: '5y² − 7y',
    steps: `<div style="color:var(--text);">On développe 5y(y − 2) : 5y × y = 5y² &nbsp;|&nbsp; 5y × (−2) = −10y</div>
    <div style="margin-top:6px;color:var(--text);">3y + 5y² − 10y</div>
    <div style="margin-top:6px;color:var(--text);">Termes en y² : <strong>5y²</strong> &nbsp;|&nbsp; Termes en y : 3y − 10y = <strong>−7y</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 5y² − 7y</div>`,
  },
  {
    label: 'Développer puis réduire',
    expr: '9 − 4(6 − 8y)',
    ans: '32y − 15',
    steps: `<div style="color:var(--text);">On développe −4(6 − 8y) : (−4) × 6 = −24 &nbsp;|&nbsp; (−4) × (−8y) = +32y</div>
    <div style="margin-top:6px;color:var(--text);">9 − 24 + 32y</div>
    <div style="margin-top:6px;color:var(--text);">Termes en y : <strong>32y</strong> &nbsp;|&nbsp; Termes constants : 9 − 24 = <strong>−15</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 32y − 15</div>`,
  },
  {
    label: 'Développer puis réduire',
    expr: '10y − 3(2y + 7)',
    ans: '4y − 21',
    steps: `<div style="color:var(--text);">On développe −3(2y + 7) : (−3) × 2y = −6y &nbsp;|&nbsp; (−3) × 7 = −21</div>
    <div style="margin-top:6px;color:var(--text);">10y − 6y − 21</div>
    <div style="margin-top:6px;color:var(--text);">Termes en y : 10y − 6y = <strong>4y</strong> &nbsp;|&nbsp; Termes constants : <strong>−21</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 4y − 21</div>`,
  },
  {
    label: 'Parenthèses et réduction',
    expr: '4x² − (2x² − 3x + 1) + (−6x + 7)',
    ans: '2x² − 3x + 6',
    steps: `<div style="color:var(--text);">On supprime les parenthèses : 4x² − 2x² + 3x − 1 − 6x + 7</div>
    <div style="margin-top:6px;color:var(--text);">Termes en x² : 4x² − 2x² = <strong>2x²</strong> &nbsp;|&nbsp; Termes en x : 3x − 6x = <strong>−3x</strong> &nbsp;|&nbsp; Termes constants : −1 + 7 = <strong>6</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 2x² − 3x + 6</div>`,
  },
  {
    label: 'Développer puis réduire',
    expr: '2x + 3x(x + 4) − 5',
    ans: '3x² + 14x − 5',
    steps: `<div style="color:var(--text);">On développe 3x(x + 4) : 3x × x = 3x² &nbsp;|&nbsp; 3x × 4 = 12x</div>
    <div style="margin-top:6px;color:var(--text);">2x + 3x² + 12x − 5</div>
    <div style="margin-top:6px;color:var(--text);">Termes en x² : <strong>3x²</strong> &nbsp;|&nbsp; Termes en x : 2x + 12x = <strong>14x</strong> &nbsp;|&nbsp; Termes constants : <strong>−5</strong></div>
    <div style="margin-top:6px;color:var(--correct);font-weight:700;">= 3x² + 14x − 5</div>`,
  },
];

export function generateLiteralComplexSeries(): LiteralExercise[] {
  // Shuffle the bank then take 10 (matches lcGenerate at Site.html:4286).
  const pool = [...LITERAL_COMPLEX_BANK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, 10).map((q) => ({
    type: 'default',
    subtype: 'complex',
    label: q.label,
    color: '#E879F9',
    expr: q.expr,
    ans: q.ans,
    steps: q.steps,
    isNum: false,
  }));
}

// Normalize a literal expression for comparison.
export function literalNormalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/−/g, '-')
    .replace(/\+-/g, '-');
}

// Accept the exact normalized form, plus a couple of equivalent shorthand forms.
export function literalCheckAnswer(student: string, expected: string): boolean {
  const sn = literalNormalize(student);
  const en = literalNormalize(expected);
  if (sn === en) return true;
  const alts = [
    en.replace(/-1([a-z])/g, '-$1'),
    en.replace(/(?<![0-9])1([a-z])/g, '$1'),
  ];
  return alts.some((a) => sn === a);
}
