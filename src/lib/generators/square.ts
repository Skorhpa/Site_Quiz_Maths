import type { SquareExercise } from '@/types';

const COLOR = '#60A5FA';

function randFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ── Carré ──────────────────────────────────────────────────────────────────

export function generateSquareSeries(): SquareExercise[] {
  const singles = shuffled([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
  const twoDigit = shuffled([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25]).slice(0, 2);
  const all = [...singles, ...twoDigit];
  return [
    makeSquare(all[0]!),
    makeSquare(all[1]!),
    makeSquareNegOuter(all[2]!),
    makeSquare(all[3]!),
    makeSquareNegParen(all[4]!),
  ];
}

function makeSquareNegOuter(n: number): SquareExercise {
  const ans = -(n * n);
  const steps = `<div style="margin-bottom:6px;color:var(--muted);">Le signe − est <strong>en dehors</strong> des parenthèses : on calcule d&apos;abord le carré, puis on applique le signe −.</div>
<div style="font-family:'DM Mono',monospace;">-${n}² = -(${n}²) = -(${n} × ${n}) = <strong style="color:var(--correct);">${ans}</strong></div>`;
  return { type: 'default', sqType: 'square_neg_outer', n, ans, label: 'Carré', color: COLOR, steps };
}

function makeSquareNegParen(n: number): SquareExercise {
  const ans = n * n;
  const steps = `<div style="margin-bottom:6px;color:var(--muted);">Le signe − est <strong>entre parenthèses</strong> : on multiplie (−${n}) × (−${n}). Deux facteurs négatifs donnent un résultat positif.</div>
<div style="font-family:'DM Mono',monospace;">(-${n})² = (-${n}) × (-${n}) = <strong style="color:var(--correct);">${ans}</strong></div>`;
  return { type: 'default', sqType: 'square_neg_paren', n, ans, label: 'Carré', color: COLOR, steps };
}

function makeSquare(n: number): SquareExercise {
  const ans = n * n;
  const steps = `<div style="margin-bottom:6px;"><strong>Définition :</strong> le carré de n est n × n, noté n².</div>
<div style="font-family:'DM Mono',monospace;">${n}² = ${n} × ${n} = <strong style="color:var(--correct);">${ans}</strong></div>`;
  return { type: 'default', sqType: 'square', n, ans, label: 'Carré', color: COLOR, steps };
}

// ── Racine carrée ──────────────────────────────────────────────────────────

const PERFECT_SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
const APPROX_POOL = [2, 3, 5, 6, 7, 8, 10, 12, 15, 18, 20, 24, 27, 30, 45, 50, 60, 72, 80];

export function generateSqrtSeries(): SquareExercise[] {
  const chosen = shuffled(PERFECT_SQUARES).slice(0, 4).map(makeSqrtExact);
  chosen.push(makeSqrtApprox(randFrom(APPROX_POOL)));
  return chosen;
}

function makeSqrtExact(sq: number): SquareExercise {
  const ans = Math.round(Math.sqrt(sq));
  const steps = `<div style="color:var(--muted);margin-bottom:6px;">On cherche n tel que n² = ${sq}.</div>
<div style="font-family:'DM Mono',monospace;">${ans}² = ${ans} × ${ans} = ${sq} ✓</div>
<div style="font-family:'DM Mono',monospace;margin-top:6px;"><strong style="color:var(--correct);">√${sq} = ${ans}</strong></div>`;
  return { type: 'default', sqType: 'sqrt', n: sq, ans, label: 'Racine carrée', color: COLOR, steps };
}

function makeSqrtApprox(n: number): SquareExercise {
  const exact = Math.sqrt(n);
  const ans = Math.round(exact * 10) / 10;
  const exactStr = exact.toFixed(4);
  const hundredths = parseInt(exactStr.split('.')[1]![1]!, 10);
  const roundDir = hundredths >= 5 ? 'arrondit à la valeur supérieure' : 'garde le chiffre des dixièmes';
  const steps = `<div style="color:var(--muted);margin-bottom:6px;">On tape √${n} à la calculatrice :</div>
<div style="font-family:'DM Mono',monospace;">√${n} ≈ ${exactStr}…</div>
<div style="color:var(--muted);margin-top:6px;">Le chiffre des <strong>centièmes</strong> est <strong>${hundredths}</strong>${hundredths >= 5 ? ' ≥ 5' : ' < 5'}, donc on ${roundDir}.</div>
<div style="font-family:'DM Mono',monospace;margin-top:4px;"><strong style="color:var(--correct);">√${n} ≈ ${ans.toFixed(1)}</strong> (au dixième)</div>
<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:8px;font-size:12px;">
  <a href="/4eme/arrondis" style="color:#F472B6;font-weight:600;text-decoration:none;">→ Revoir la série Arrondis d&apos;un nombre</a>
</div>`;
  return { type: 'default', sqType: 'sqrt_approx', n, ans, label: 'Racine carrée ≈', color: COLOR, steps };
}
