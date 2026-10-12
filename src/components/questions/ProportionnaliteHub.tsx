import { useEffect, useMemo, useRef, useState } from 'react';
import { ModeCard } from './FractionsHub';

type HubMode = 'reconnaitre' | 'utiliser' | null;

interface AnswerState {
  status: 'pending' | 'correct' | 'wrong' | 'revealed';
  resetKey: number;
}

const emptyAnswer = (): AnswerState => ({ status: 'pending', resetKey: 0 });

function endTitle(pct: number): string {
  if (pct === 100) return 'Parfait ! 🎉';
  if (pct >= 70) return 'Très bien !';
  if (pct >= 50) return 'Pas mal !';
  return 'Continue !';
}

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Rounds to 2 decimals, trims trailing zeros, groups the integer part by thousands (French style) and uses a comma. */
function fmtNum(n: number): string {
  const rounded = round2(n);
  const neg = rounded < 0;
  const abs = Math.abs(rounded);
  const fixed = abs.toFixed(2);
  const dotIdx = fixed.indexOf('.');
  let intPart = fixed.slice(0, dotIdx);
  let decPart = fixed.slice(dotIdx + 1).replace(/0+$/, '');
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${neg ? '-' : ''}${intPart}${decPart ? ',' + decPart : ''}`;
}

/** Tolerates whitespace (incl. thousand-grouping spaces) and a comma decimal separator; returns null when unparsable. */
function parseNum(raw: string): number | null {
  const compact = raw.replace(/\s+/g, '');
  if (compact === '') return null;
  const v = parseFloat(compact.replace(',', '.'));
  return Number.isNaN(v) ? null : v;
}

function checkQuotient(raw: string, expected: number): boolean {
  const v = parseNum(raw);
  return v !== null && Math.abs(v - expected) < 0.01;
}

// ── VideoLink ─────────────────────────────────────────────────────────────────

function VideoLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 8,
        background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.25)',
        color: '#f87171', fontSize: 13, textDecoration: 'none',
        fontWeight: 600, marginTop: 6, marginRight: 8,
      }}
    >
      ▶ {label}
    </a>
  );
}

// ── Rappel ────────────────────────────────────────────────────────────────────

function RecallReconnaitre({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel — reconnaître la proportionnalité + vidéo
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <p style={{ margin: '12px 0 8px' }}>
          Dans un tableau, on reconnaît une situation de <strong>proportionnalité</strong> lorsque les nombres de la
          deuxième ligne s'obtiennent en multipliant ceux de la première par un même nombre.
          Ce nombre est appelé <strong style={{ color: accent }}>coefficient de proportionnalité</strong>.
        </p>
        <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>
          <strong>Remarque :</strong> dans la pratique, on divise les nombres de la deuxième ligne par ceux de la
          première. Si le nombre obtenu est toujours le même, le tableau est de proportionnalité.
        </p>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://www.youtube.com/watch?v=O7oU-J1OqCw" label="Reconnaître un tableau de proportionnalité" />
        </div>
      </div>
    </div>
  );
}

function MethodBlock({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 12, background: 'var(--surface)' }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Méthode {number} : {title}</div>
      {children}
    </div>
  );
}

function RecallUtiliser({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        className="hint-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}
      >
        <span>{open ? '▼' : '▶'}</span> Rappel — utiliser la proportionnalité + vidéo
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ margin: '12px 0' }}>
          <MethodBlock number={1} title="Avec un coefficient de proportionnalité">
            <p style={{ margin: '0 0 8px' }}>
              Pour compléter un tableau de proportionnalité, on peut utiliser un coefficient de proportionnalité pour passer d'une ligne à l'autre.
            </p>
            <p style={{ margin: '0 0 6px' }}>
              <strong>Exemple :</strong> Une station-service affiche un prix de l'essence à 1,22 € le litre. Le prix à payer est proportionnel
              à la quantité d'essence achetée avec pour coefficient de proportionnalité 1,22.
            </p>
            <div style={{ overflowX: 'auto', marginBottom: 8 }}>
              <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12 }}>Quantité achetée (en L)</td>
                    <td style={tblCellStyle}>1</td>
                    <td style={tblCellStyle}>5,5</td>
                    <td style={tblCellStyle}>?</td>
                  </tr>
                  <tr>
                    <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12 }}>Prix à payer (en €)</td>
                    <td style={tblCellStyle}>1,22</td>
                    <td style={tblCellStyle}>?</td>
                    <td style={tblCellStyle}>5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ margin: '0 0 4px', color: 'var(--muted)' }}>
              On passe de la 1ʳᵉ à la 2ᵉ ligne en multipliant par 1,22 (et en divisant par 1,22 dans l'autre sens).
            </p>
            <p style={{ margin: 0 }}>• On cherche le prix de 5,5 L d'essence. 5,5 × 1,22 = 6,71. 5,5 L d'essence coûtent 6,71 €.</p>
            <p style={{ margin: 0 }}>• On cherche la quantité d'essence qu'on peut acheter pour 5 €. 5 ÷ 1,22 ≈ 4,1. Pour 5 €, on peut acheter environ 4,1 L d'essence.</p>
          </MethodBlock>

          <MethodBlock number={2} title="Avec les liens entre les colonnes">
            <p style={{ margin: '0 0 8px' }}>
              Pour obtenir les nombres d'une colonne dans un tableau de proportionnalité, on peut :
            </p>
            <ul style={{ margin: '0 0 8px 18px', padding: 0 }}>
              <li>multiplier ou diviser les nombres d'une autre colonne par un même nombre (non nul) ;</li>
              <li>ajouter ou soustraire les nombres d'autres colonnes.</li>
            </ul>
            <p style={{ margin: '0 0 6px' }}>
              <strong>Exemple :</strong> Une recette de pâte à crêpes indique qu'il faut 300 g de farine pour faire 12 crêpes. La masse de
              farine à utiliser est proportionnelle au nombre de crêpes à réaliser, on peut donc faire un tableau de proportionnalité.
            </p>
            <div style={{ overflowX: 'auto', marginBottom: 8 }}>
              <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12 }}>Nombre de crêpes</td>
                    <td style={tblCellStyle}>12</td>
                    <td style={tblCellStyle}>4</td>
                    <td style={tblCellStyle}>16</td>
                  </tr>
                  <tr>
                    <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12 }}>Masse de farine (en g)</td>
                    <td style={tblCellStyle}>300</td>
                    <td style={tblCellStyle}>?</td>
                    <td style={tblCellStyle}>?</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ margin: 0 }}>• On cherche la masse de farine pour faire 4 crêpes. 300 ÷ 3 = 100 g. Il faut 100 g de farine pour faire 4 crêpes.</p>
            <p style={{ margin: 0 }}>• On cherche la masse de farine pour faire 16 crêpes. 300 + 100 = 400 g. Il faut 400 g de farine pour faire 16 crêpes.</p>
          </MethodBlock>

          <MethodBlock number={3} title="Avec passage par l'unité">
            <p style={{ margin: '0 0 8px' }}>
              Pour traiter une situation de proportionnalité, il est parfois plus judicieux de revenir à l'unité.
            </p>
            <p style={{ margin: '0 0 6px' }}>
              <strong>Exemple :</strong> Des cahiers sont vendus à l'unité. Lucile a acheté 3 cahiers pour 4,05 €. Emma a besoin de 7 cahiers.
              Combien devra-t-elle payer ?
            </p>
            <p style={{ margin: 0 }}>3 cahiers → 4,05 €</p>
            <p style={{ margin: 0 }}>1 cahier → 4,05 € ÷ 3 = 1,35 €</p>
            <p style={{ margin: 0 }}>7 cahiers → 7 × 1,35 € = 9,45 €</p>
            <p style={{ margin: 0 }}>Emma devra payer 9,45 €.</p>
          </MethodBlock>
        </div>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://www.youtube.com/watch?v=O91-Dq06k0U" label="Utiliser un tableau de proportionnalité" />
        </div>
      </div>
    </div>
  );
}

// ── Q1 / Q2 / Q3 : tableau de proportionnalité (3 colonnes, sans contexte) ──────

interface ProporCol {
  top: number;
  bottom: number;
  quotient: number;
}

interface ProporTableExercise {
  cols: [ProporCol, ProporCol, ProporCol];
  isProportional: boolean;
}

const NICE_K = [2, 3, 4, 5, 6, 7, 8, 9, 0.5, 1.5, 2.5, 3.5, 4.5, 0.2, 0.4, 0.6, 0.8, 1.2, 1.4, 1.6, 1.8, 2.2, 2.4, 2.6, 2.8] as const;

function makeTop(): number {
  return Math.random() < 0.5 ? randInt(1, 20) : randInt(5, 95) / 10;
}

function generateProporTable(isProportional: boolean): ProporTableExercise {
  const k = pick(NICE_K);
  const cols: ProporCol[] = [];
  for (let i = 0; i < 3; i++) {
    const top = makeTop();
    cols.push({ top, bottom: round2(top * k), quotient: k });
  }
  if (!isProportional) {
    const idx = randInt(0, 2);
    const col = cols[idx]!;
    // Offset scales with the column's own value (not a fixed amount) so the quotient shift
    // stays meaningful even for large `top` values (a flat +2 barely moves 120÷15 vs. 15).
    let newBottom = col.bottom;
    let attempts = 0;
    do {
      const offsetPct = pick([0.08, 0.1, 0.15, 0.2, -0.08, -0.1, -0.15, -0.2] as const);
      newBottom = round2(col.bottom * (1 + offsetPct));
      attempts++;
    } while (Math.abs(round2(newBottom / col.top) - k) < 0.02 && attempts < 15);
    cols[idx] = { top: col.top, bottom: newBottom, quotient: round2(newBottom / col.top) };
  }
  return { cols: cols as [ProporCol, ProporCol, ProporCol], isProportional };
}

const colTagStyle: React.CSSProperties = { fontSize: 11, padding: '3px 10px', borderRadius: 99, fontFamily: "'DM Mono', monospace" };
const tblCellStyle: React.CSSProperties = { padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14 };

const blankInp: React.CSSProperties = {
  width: 64, fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
  padding: '5px 4px', borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--bg)', color: 'var(--text)', textAlign: 'center',
};

function ProporTablePrefilledQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: ProporTableExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVals] = useState<string[]>(['', '', '']);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const setVal = (i: number, v: string) => setVals((prev) => prev.map((x, idx) => (idx === i ? v : x)));

  const quotientsOk = exercise.cols.every((c, i) => checkQuotient(vals[i]!, c.quotient));
  const choiceOk = choice === exercise.isProportional;

  const submit = () => {
    if (disabled) return;
    if (vals.some((v) => v.trim() === '') || choice === null) return;
    onSubmit(quotientsOk && choiceOk);
  };

  const showFb = disabled;

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Tableau de proportionnalité</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
        Calcule les trois quotients, puis indique si ce tableau est un tableau de proportionnalité.
      </p>
      <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 10 }}>
        🧮 Utilise ta calculatrice.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              {exercise.cols.map((c, i) => (
                <td key={i} style={tblCellStyle}>{fmtNum(c.top)}</td>
              ))}
            </tr>
            <tr>
              {exercise.cols.map((c, i) => (
                <td key={i} style={tblCellStyle}>{fmtNum(c.bottom)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {exercise.cols.map((c, i) => {
          const ok = showFb ? checkQuotient(vals[i]!, c.quotient) : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8,
                background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)',
              }}
            >
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{fmtNum(c.bottom)} :</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{fmtNum(c.top)} =</span>
              <input
                type="text"
                value={vals[i]}
                placeholder="?"
                disabled={disabled}
                onChange={(e) => setVal(i, e.target.value)}
                style={blankInp}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Tableau de proportionnalité ?</span>
        {([true, false] as const).map((v) => {
          const isSel = choice === v;
          const label = v ? 'Oui' : 'Non';
          const correctnessColor = showFb ? (v === exercise.isProportional ? 'var(--correct)' : isSel ? 'var(--wrong)' : undefined) : undefined;
          return (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => setChoice(v)}
              style={{
                padding: '6px 20px', fontSize: 14, borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
                border: `1px solid ${correctnessColor ?? (isSel ? accent : 'var(--border2)')}`,
                background: showFb ? (v === exercise.isProportional ? 'rgba(74,222,128,0.12)' : isSel ? 'rgba(248,113,113,0.12)' : 'var(--surface2)') : isSel ? `${accent}22` : 'var(--surface2)',
                color: correctnessColor ?? (isSel ? accent : 'var(--text)'),
                fontWeight: isSel ? 700 : 400,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          {exercise.cols.map((c, i) => (
            <div key={i}>
              {fmtNum(c.bottom)} : {fmtNum(c.top)} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(c.quotient)}</strong>
            </div>
          ))}
          <div style={{ marginTop: 6 }}>
            {exercise.isProportional
              ? <>Les trois quotients sont égaux → <strong style={{ color: 'var(--correct)' }}>tableau de proportionnalité</strong>.</>
              : <>Les trois quotients ne sont pas tous égaux → <strong style={{ color: 'var(--wrong)' }}>pas un tableau de proportionnalité</strong>.</>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Each row is entirely blank: the student must fill in both operands (copied from the table above, in
 * "deuxième ligne ÷ première ligne" order) and the result, not just the quotient. */
function ProporTableBlankQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: ProporTableExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [bottoms, setBottoms] = useState<string[]>(['', '', '']);
  const [tops, setTops] = useState<string[]>(['', '', '']);
  const [quots, setQuots] = useState<string[]>(['', '', '']);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const setAt = (arr: string[], setArr: (v: string[]) => void, i: number, v: string) =>
    setArr(arr.map((x, idx) => (idx === i ? v : x)));

  const rowOk = (i: number) => {
    const c = exercise.cols[i]!;
    return checkQuotient(bottoms[i]!, c.bottom) && checkQuotient(tops[i]!, c.top) && checkQuotient(quots[i]!, c.quotient);
  };
  const choiceOk = choice === exercise.isProportional;

  const submit = () => {
    if (disabled) return;
    if (bottoms.some((v) => v.trim() === '') || tops.some((v) => v.trim() === '') || quots.some((v) => v.trim() === '') || choice === null) return;
    onSubmit(exercise.cols.every((_, i) => rowOk(i)) && choiceOk);
  };

  const showFb = disabled;

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Tableau de proportionnalité</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
        Complète les trois divisions (deuxième ligne ÷ première ligne), puis indique si ce tableau est un tableau de proportionnalité.
      </p>
      <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 10 }}>
        🧮 Utilise ta calculatrice.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              {exercise.cols.map((c, i) => (
                <td key={i} style={tblCellStyle}>{fmtNum(c.top)}</td>
              ))}
            </tr>
            <tr>
              {exercise.cols.map((c, i) => (
                <td key={i} style={tblCellStyle}>{fmtNum(c.bottom)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {exercise.cols.map((_, i) => {
          const ok = showFb ? rowOk(i) : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, flexWrap: 'wrap',
                background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)',
              }}
            >
              <input type="text" value={bottoms[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(bottoms, setBottoms, i, e.target.value)} style={blankInp} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>:</span>
              <input type="text" value={tops[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(tops, setTops, i, e.target.value)} style={blankInp} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>=</span>
              <input type="text" value={quots[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(quots, setQuots, i, e.target.value)} style={blankInp} />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Tableau de proportionnalité ?</span>
        {([true, false] as const).map((v) => {
          const isSel = choice === v;
          const label = v ? 'Oui' : 'Non';
          const correctnessColor = showFb ? (v === exercise.isProportional ? 'var(--correct)' : isSel ? 'var(--wrong)' : undefined) : undefined;
          return (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => setChoice(v)}
              style={{
                padding: '6px 20px', fontSize: 14, borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
                border: `1px solid ${correctnessColor ?? (isSel ? accent : 'var(--border2)')}`,
                background: showFb ? (v === exercise.isProportional ? 'rgba(74,222,128,0.12)' : isSel ? 'rgba(248,113,113,0.12)' : 'var(--surface2)') : isSel ? `${accent}22` : 'var(--surface2)',
                color: correctnessColor ?? (isSel ? accent : 'var(--text)'),
                fontWeight: isSel ? 700 : 400,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          {exercise.cols.map((c, i) => (
            <div key={i}>
              {fmtNum(c.bottom)} : {fmtNum(c.top)} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(c.quotient)}</strong>
            </div>
          ))}
          <div style={{ marginTop: 6 }}>
            {exercise.isProportional
              ? <>Les trois quotients sont égaux → <strong style={{ color: 'var(--correct)' }}>tableau de proportionnalité</strong>.</>
              : <>Les trois quotients ne sont pas tous égaux → <strong style={{ color: 'var(--wrong)' }}>pas un tableau de proportionnalité</strong>.</>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Q4 / Q5 : problèmes en contexte (2 situations à comparer) ──────────────────

interface ProblemTemplate {
  context: string;
  item1Name: string;
  item2Name: string;
  qtyLabel: string;
  valueLabel: string;
  qtyRange: [number, number];
  kChoices: readonly number[];
}

const PROBLEM_TEMPLATES: ProblemTemplate[] = [
  {
    context: "Le prix d'un bouquet de fleurs dépend du nombre de tiges.",
    item1Name: 'Premier bouquet', item2Name: 'Second bouquet',
    qtyLabel: 'Nombre de tiges', valueLabel: 'Prix (€)',
    qtyRange: [3, 12],
    kChoices: [1.5, 2, 2.2, 2.4, 2.5, 3, 3.5],
  },
  {
    context: 'Deux collèges reçoivent une subvention du Département, calculée en fonction du nombre d\'élèves.',
    item1Name: 'Collège A', item2Name: 'Collège B',
    qtyLabel: "Nombre d'élèves", valueLabel: 'Subvention (€)',
    qtyRange: [300, 900],
    kChoices: [1800, 2000, 2200, 2400],
  },
  {
    context: 'La quantité de farine nécessaire pour une recette de crêpes dépend du nombre de personnes.',
    item1Name: 'Première recette', item2Name: 'Seconde recette',
    qtyLabel: 'Nombre de personnes', valueLabel: 'Farine (g)',
    qtyRange: [2, 10],
    kChoices: [60, 65, 70, 75, 80],
  },
  {
    context: "La quantité de carburant consommée par une voiture dépend de la distance parcourue.",
    item1Name: 'Premier trajet', item2Name: 'Second trajet',
    qtyLabel: 'Distance (km)', valueLabel: 'Carburant (L)',
    qtyRange: [100, 400],
    kChoices: [0.05, 0.06, 0.07, 0.08, 0.09],
  },
  {
    context: "Le prix du papier dépend du nombre de ramettes achetées.",
    item1Name: 'Premier achat', item2Name: 'Second achat',
    qtyLabel: 'Nombre de ramettes', valueLabel: 'Prix (€)',
    qtyRange: [2, 20],
    kChoices: [3, 3.5, 4, 4.5, 5],
  },
  {
    context: "Le salaire d'un employé dépend du nombre d'heures travaillées.",
    item1Name: 'Semaine 1', item2Name: 'Semaine 2',
    qtyLabel: "Nombre d'heures", valueLabel: 'Salaire (€)',
    qtyRange: [10, 40],
    kChoices: [9, 10, 11, 12, 12.5],
  },
  {
    context: 'Le prix des pommes dépend de la masse achetée.',
    item1Name: 'Client 1', item2Name: 'Client 2',
    qtyLabel: 'Masse (kg)', valueLabel: 'Prix (€)',
    qtyRange: [1, 10],
    kChoices: [1.8, 2, 2.2, 2.5, 2.8],
  },
  {
    context: "Le volume d'eau dans une piscine dépend de la durée de remplissage.",
    item1Name: 'Premier relevé', item2Name: 'Second relevé',
    qtyLabel: 'Durée (min)', valueLabel: "Volume d'eau (L)",
    qtyRange: [5, 60],
    kChoices: [10, 12, 15, 18, 20],
  },
];

interface ProporProblemExercise {
  context: string;
  item1Name: string;
  item2Name: string;
  qtyLabel: string;
  valueLabel: string;
  qty1: number;
  qty2: number;
  value1: number;
  value2: number;
  quotient1: number;
  quotient2: number;
  isProportional: boolean;
}

function generateProblemExercise(isProportional: boolean): ProporProblemExercise {
  const tpl = pick(PROBLEM_TEMPLATES);
  const [qMin, qMax] = tpl.qtyRange;
  const qty1 = randInt(qMin, qMax);
  let qty2 = randInt(qMin, qMax);
  while (qty2 === qty1) qty2 = randInt(qMin, qMax);
  const k = pick(tpl.kChoices);
  const value1 = round2(qty1 * k);
  let value2 = round2(qty2 * k);

  if (!isProportional) {
    let attempts = 0;
    do {
      const offsetPct = pick([0.05, 0.08, 0.1, 0.15, -0.05, -0.08, -0.1, -0.15] as const);
      value2 = round2(round2(qty2 * k) * (1 + offsetPct));
      attempts++;
    } while (Math.abs(round2(value2 / qty2) - k) < 0.02 && attempts < 15);
  }

  const quotient1 = round2(value1 / qty1);
  const quotient2 = round2(value2 / qty2);
  return {
    context: tpl.context, item1Name: tpl.item1Name, item2Name: tpl.item2Name,
    qtyLabel: tpl.qtyLabel, valueLabel: tpl.valueLabel,
    qty1, qty2, value1, value2, quotient1, quotient2,
    isProportional: Math.abs(quotient1 - quotient2) < 0.015,
  };
}

function ProporProblemQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: ProporProblemExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [bottoms, setBottoms] = useState(['', '']);
  const [tops, setTops] = useState(['', '']);
  const [quots, setQuots] = useState(['', '']);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const setAt = (arr: string[], setArr: (v: string[]) => void, i: number, v: string) =>
    setArr(arr.map((x, idx) => (idx === i ? v : x)));

  const values = [exercise.value1, exercise.value2];
  const qtys = [exercise.qty1, exercise.qty2];
  const quotients = [exercise.quotient1, exercise.quotient2];
  const rowOk = (i: number) => checkQuotient(bottoms[i]!, values[i]!) && checkQuotient(tops[i]!, qtys[i]!) && checkQuotient(quots[i]!, quotients[i]!);
  const choiceOk = choice === exercise.isProportional;

  const submit = () => {
    if (disabled) return;
    if (bottoms.some((v) => v.trim() === '') || tops.some((v) => v.trim() === '') || quots.some((v) => v.trim() === '') || choice === null) return;
    onSubmit(rowOk(0) && rowOk(1) && choiceOk);
  };

  const showFb = disabled;

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Problème</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 10 }}>{exercise.context}</p>
      <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 10 }}>
        🧮 Utilise ta calculatrice.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...tblCellStyle, fontWeight: 700, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }} />
              <th style={{ ...tblCellStyle, fontWeight: 700, fontSize: 12, color: 'var(--muted)' }}>{exercise.item1Name}</th>
              <th style={{ ...tblCellStyle, fontWeight: 700, fontSize: 12, color: 'var(--muted)' }}>{exercise.item2Name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>{exercise.qtyLabel}</td>
              <td style={tblCellStyle}>{fmtNum(exercise.qty1)}</td>
              <td style={tblCellStyle}>{fmtNum(exercise.qty2)}</td>
            </tr>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>{exercise.valueLabel}</td>
              <td style={tblCellStyle}>{fmtNum(exercise.value1)}</td>
              <td style={tblCellStyle}>{fmtNum(exercise.value2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
        Complète chaque division ({exercise.valueLabel.toLowerCase()} ÷ {exercise.qtyLabel.toLowerCase()}).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {[exercise.item1Name, exercise.item2Name].map((label, i) => {
          const ok = showFb ? rowOk(i) : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, flexWrap: 'wrap',
                background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 90 }}>{label} :</span>
              <input type="text" value={bottoms[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(bottoms, setBottoms, i, e.target.value)} style={blankInp} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>:</span>
              <input type="text" value={tops[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(tops, setTops, i, e.target.value)} style={blankInp} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>=</span>
              <input type="text" value={quots[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(quots, setQuots, i, e.target.value)} style={blankInp} />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Situation de proportionnalité ?</span>
        {([true, false] as const).map((v) => {
          const isSel = choice === v;
          const label = v ? 'Oui' : 'Non';
          const correctnessColor = showFb ? (v === exercise.isProportional ? 'var(--correct)' : isSel ? 'var(--wrong)' : undefined) : undefined;
          return (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => setChoice(v)}
              style={{
                padding: '6px 20px', fontSize: 14, borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
                border: `1px solid ${correctnessColor ?? (isSel ? accent : 'var(--border2)')}`,
                background: showFb ? (v === exercise.isProportional ? 'rgba(74,222,128,0.12)' : isSel ? 'rgba(248,113,113,0.12)' : 'var(--surface2)') : isSel ? `${accent}22` : 'var(--surface2)',
                color: correctnessColor ?? (isSel ? accent : 'var(--text)'),
                fontWeight: isSel ? 700 : 400,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 2 }}>
          <div>
            {fmtNum(exercise.value1)} : {fmtNum(exercise.qty1)} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.quotient1)}</strong>
          </div>
          <div>
            {fmtNum(exercise.value2)} : {fmtNum(exercise.qty2)} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.quotient2)}</strong>
          </div>
          <div style={{ marginTop: 6 }}>
            {exercise.isProportional
              ? <>Les deux quotients sont égaux → <strong style={{ color: 'var(--correct)' }}>situation de proportionnalité</strong>.</>
              : <>Les deux quotients sont différents → <strong style={{ color: 'var(--wrong)' }}>pas une situation de proportionnalité</strong>.</>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Q1 (Utiliser) : vente par lot — coefficient / facteur ───────────────────────

const LOT_CONTEXTS = [
  'rouleaux de papier peint',
  "packs de bouteilles d'eau",
  'sachets de bonbons',
  'paquets de cartes à collectionner',
  'boîtes de mouchoirs',
  'tablettes de chocolat',
];

interface LotExercise {
  itemPlural: string;
  lotSize: number;
  lotPrice: number;
  qtyA: number;
  priceA: number;
  moneyB: number;
  qtyB: number;
}

function generateLotExercise(): LotExercise {
  const itemPlural = pick(LOT_CONTEXTS);
  const lotSize = randInt(3, 8);
  const lotPrice = randInt(8, 30) / 2;
  let factorA = randInt(2, 6);
  let factorB = randInt(7, 15);
  while (factorB === factorA) factorB = randInt(7, 15);
  return {
    itemPlural, lotSize, lotPrice,
    qtyA: lotSize * factorA, priceA: round2(lotPrice * factorA),
    moneyB: round2(lotPrice * factorB), qtyB: lotSize * factorB,
  };
}

function LotQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: LotExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [priceA, setPriceA] = useState('');
  const [qtyB, setQtyB] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const okA = checkQuotient(priceA, exercise.priceA);
  const okB = checkQuotient(qtyB, exercise.qtyB);
  const showFb = disabled;

  const submit = () => {
    if (disabled) return;
    if (priceA.trim() === '' || qtyB.trim() === '') return;
    onSubmit(okA && okB);
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Vente par lot</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 10 }}>
        Des {exercise.itemPlural} sont vendus par lot de {exercise.lotSize}, au prix de {fmtNum(exercise.lotPrice)} € le lot.
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 2 }}>a. Quel est le prix de {exercise.qtyA} {exercise.itemPlural} ?</p>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>b. Combien de {exercise.itemPlural} aurai-je pour {fmtNum(exercise.moneyB)} € ?</p>
      <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 10 }}>
        🧮 Complète le tableau à l'aide des questions précédentes.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>Nombre de {exercise.itemPlural}</td>
              <td style={tblCellStyle}>{exercise.lotSize}</td>
              <td style={tblCellStyle}>{exercise.qtyA}</td>
              <td style={{ ...tblCellStyle, background: showFb ? (okB ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : undefined }}>
                <input type="text" value={qtyB} placeholder="?" disabled={disabled} onChange={(e) => setQtyB(e.target.value)} style={blankInp} />
              </td>
            </tr>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>Prix (en €)</td>
              <td style={tblCellStyle}>{fmtNum(exercise.lotPrice)}</td>
              <td style={{ ...tblCellStyle, background: showFb ? (okA ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : undefined }}>
                <input type="text" value={priceA} placeholder="?" disabled={disabled} onChange={(e) => setPriceA(e.target.value)} style={blankInp} />
              </td>
              <td style={tblCellStyle}>{fmtNum(exercise.moneyB)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          <div>{exercise.qtyA} = {exercise.lotSize} × {exercise.qtyA / exercise.lotSize} donc le prix est {fmtNum(exercise.lotPrice)} × {exercise.qtyA / exercise.lotSize} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.priceA)} €</strong>.</div>
          <div>Pour {fmtNum(exercise.moneyB)} €, on paye {exercise.moneyB / exercise.lotPrice} fois plus que {fmtNum(exercise.lotPrice)} €, donc on obtient {exercise.moneyB / exercise.lotPrice} fois plus de {exercise.itemPlural}, soit <strong style={{ color: 'var(--correct)' }}>{exercise.qtyB}</strong>.</div>
        </div>
      </div>
    </div>
  );
}

// ── Q2 (Utiliser) : étiquette nutritionnelle — plusieurs lignes à l'échelle ─────

interface EtiquetteContext {
  product: string;
  rows: { label: string; min: number; max: number; decimals: number }[];
}

const ETIQUETTE_CONTEXTS: EtiquetteContext[] = [
  {
    product: "jus d'orange",
    rows: [
      { label: 'Énergie (kcal)', min: 30, max: 80, decimals: 0 },
      { label: 'Protéines (g)', min: 2, max: 10, decimals: 1 },
      { label: 'Glucides (g)', min: 80, max: 150, decimals: 1 },
    ],
  },
  {
    product: 'lait demi-écrémé',
    rows: [
      { label: 'Énergie (kcal)', min: 40, max: 60, decimals: 0 },
      { label: 'Protéines (g)', min: 30, max: 35, decimals: 1 },
      { label: 'Lipides (g)', min: 15, max: 20, decimals: 1 },
    ],
  },
  {
    product: 'compote de pommes',
    rows: [
      { label: 'Énergie (kcal)', min: 50, max: 90, decimals: 0 },
      { label: 'Glucides (g)', min: 100, max: 200, decimals: 1 },
      { label: 'Fibres (g)', min: 10, max: 20, decimals: 1 },
    ],
  },
  {
    product: 'soda au citron',
    rows: [
      { label: 'Énergie (kcal)', min: 35, max: 55, decimals: 0 },
      { label: 'Sucres (g)', min: 90, max: 110, decimals: 1 },
      { label: 'Sodium (mg)', min: 5, max: 15, decimals: 0 },
    ],
  },
];

interface EtiquetteRowData {
  label: string;
  perBase: number;
  val1: number;
  val2: number;
}

interface EtiquetteExercise {
  product: string;
  baseQty: number;
  qty1: number;
  qty2: number;
  rows: EtiquetteRowData[];
}

const ETIQUETTE_TARGETS = [150, 200, 250, 300, 350, 400, 450, 500] as const;

function generateEtiquetteExercise(): EtiquetteExercise {
  const ctx = pick(ETIQUETTE_CONTEXTS);
  const baseQty = 100;
  let qty1 = pick(ETIQUETTE_TARGETS);
  let qty2 = pick(ETIQUETTE_TARGETS);
  while (qty2 === qty1) qty2 = pick(ETIQUETTE_TARGETS);
  const ratio1 = qty1 / baseQty;
  const ratio2 = qty2 / baseQty;
  const rows = ctx.rows.map((r) => {
    const scale = Math.pow(10, r.decimals);
    const perBase = Math.round(randInt(r.min * scale, r.max * scale)) / scale;
    return { label: r.label, perBase, val1: round2(perBase * ratio1), val2: round2(perBase * ratio2) };
  });
  return { product: ctx.product, baseQty, qty1, qty2, rows };
}

function EtiquetteQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: EtiquetteExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [v1, setV1] = useState<string[]>(exercise.rows.map(() => ''));
  const [v2, setV2] = useState<string[]>(exercise.rows.map(() => ''));
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const setAt = (arr: string[], setArr: (v: string[]) => void, i: number, v: string) =>
    setArr(arr.map((x, idx) => (idx === i ? v : x)));

  const ok1 = (i: number) => checkQuotient(v1[i]!, exercise.rows[i]!.val1);
  const ok2 = (i: number) => checkQuotient(v2[i]!, exercise.rows[i]!.val2);
  const showFb = disabled;

  const submit = () => {
    if (disabled) return;
    if (v1.some((v) => v.trim() === '') || v2.some((v) => v.trim() === '')) return;
    onSubmit(exercise.rows.every((_, i) => ok1(i) && ok2(i)));
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Étiquette nutritionnelle</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 4 }}>
        Voici les valeurs nutritionnelles pour {exercise.baseQty} mL de {exercise.product}. Complète le tableau pour {exercise.qty1} mL et {exercise.qty2} mL.
      </p>
      <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 10 }}>
        🧮 Utilise ta calculatrice.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...tblCellStyle, fontWeight: 700, fontSize: 12, color: 'var(--muted)' }} />
              <th style={{ ...tblCellStyle, fontWeight: 700, fontSize: 12, color: 'var(--muted)' }}>{exercise.baseQty} mL</th>
              <th style={{ ...tblCellStyle, fontWeight: 700, fontSize: 12, color: 'var(--muted)' }}>{exercise.qty1} mL</th>
              <th style={{ ...tblCellStyle, fontWeight: 700, fontSize: 12, color: 'var(--muted)' }}>{exercise.qty2} mL</th>
            </tr>
          </thead>
          <tbody>
            {exercise.rows.map((r, i) => (
              <tr key={i}>
                <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>{r.label}</td>
                <td style={tblCellStyle}>{fmtNum(r.perBase)}</td>
                <td style={{ ...tblCellStyle, background: showFb ? (ok1(i) ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : undefined }}>
                  <input type="text" value={v1[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(v1, setV1, i, e.target.value)} style={blankInp} />
                </td>
                <td style={{ ...tblCellStyle, background: showFb ? (ok2(i) ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : undefined }}>
                  <input type="text" value={v2[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(v2, setV2, i, e.target.value)} style={blankInp} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          {exercise.rows.map((r, i) => (
            <div key={i}>
              {r.label} : <strong style={{ color: 'var(--correct)' }}>{fmtNum(r.val1)}</strong> pour {exercise.qty1} mL, <strong style={{ color: 'var(--correct)' }}>{fmtNum(r.val2)}</strong> pour {exercise.qty2} mL.
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Q3 (Utiliser) : passage par l'unité (sens direct) ───────────────────────────

const UDIR_CONTEXTS = [
  { singular: 'jonquille', plural: 'jonquilles' },
  { singular: 'rose', plural: 'roses' },
  { singular: 'tulipe', plural: 'tulipes' },
  { singular: 'cahier', plural: 'cahiers' },
  { singular: 'stylo', plural: 'stylos' },
  { singular: 'carnet', plural: 'carnets' },
];

const UDIR_UNIT_PRICES = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 1, 1.1, 1.2, 1.25, 1.35, 1.5] as const;

interface UniteDirecteExercise {
  singular: string;
  plural: string;
  qty1: number;
  price1: number;
  unitPrice: number;
  qty2: number;
  price2: number;
}

function generateUniteDirecteExercise(): UniteDirecteExercise {
  const ctx = pick(UDIR_CONTEXTS);
  const qty1 = randInt(3, 8);
  const unitPrice = pick(UDIR_UNIT_PRICES);
  const price1 = round2(qty1 * unitPrice);
  let qty2 = randInt(3, 10);
  while (qty2 === qty1) qty2 = randInt(3, 10);
  return { singular: ctx.singular, plural: ctx.plural, qty1, price1, unitPrice, qty2, price2: round2(qty2 * unitPrice) };
}

function UniteDirecteQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: UniteDirecteExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [unitP, setUnitP] = useState('');
  const [price2, setPrice2] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const okUnit = checkQuotient(unitP, exercise.unitPrice);
  const okPrice2 = checkQuotient(price2, exercise.price2);
  const showFb = disabled;

  const submit = () => {
    if (disabled) return;
    if (unitP.trim() === '' || price2.trim() === '') return;
    onSubmit(okUnit && okPrice2);
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Passage par l'unité</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 10 }}>
        Un bouquet de {exercise.qty1} {exercise.plural} coûte {fmtNum(exercise.price1)} €. Calcule le prix d'un bouquet de {exercise.qty2} {exercise.plural}.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>Nombre de {exercise.plural}</td>
              <td style={tblCellStyle}>{exercise.qty1}</td>
              <td style={tblCellStyle}>{exercise.qty2}</td>
            </tr>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>Prix (€)</td>
              <td style={tblCellStyle}>{fmtNum(exercise.price1)}</td>
              <td style={{ ...tblCellStyle, background: showFb ? (okPrice2 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : undefined }}>
                <input type="text" value={price2} placeholder="?" disabled={disabled} onChange={(e) => setPrice2(e.target.value)} style={blankInp} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>1 {exercise.singular} →</span>
          <input type="text" value={unitP} placeholder="?" disabled={disabled} onChange={(e) => setUnitP(e.target.value)} style={{
            ...blankInp,
            background: showFb ? (okUnit ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : blankInp.background,
          }} />
          <span style={{ fontSize: 13 }}>€</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          <div>{exercise.qty1} {exercise.plural} → {fmtNum(exercise.price1)} €</div>
          <div>1 {exercise.singular} → {fmtNum(exercise.price1)} € ÷ {exercise.qty1} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.unitPrice)} €</strong></div>
          <div>{exercise.qty2} {exercise.plural} → {exercise.qty2} × {fmtNum(exercise.unitPrice)} € = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.price2)} €</strong></div>
        </div>
      </div>
    </div>
  );
}

// ── Q4 (Utiliser) : passage par l'unité (sens inverse) ──────────────────────────

const UINV_CONTEXTS = [
  { unitPlural: 'bouteilles en plastique', itemPlural: 'pulls en maille polaire', itemSingular: 'pull en maille polaire', verb: 'fabrique' },
  { unitPlural: 'litres de lait', itemPlural: 'fromages', itemSingular: 'fromage', verb: 'fabrique' },
  { unitPlural: 'mètres de tissu', itemPlural: 'vêtements', itemSingular: 'vêtement', verb: 'confectionne' },
  { unitPlural: 'kg de farine', itemPlural: 'pains', itemSingular: 'pain', verb: 'fabrique' },
];

interface UniteInverseExercise {
  unitPlural: string;
  itemPlural: string;
  itemSingular: string;
  verb: string;
  itemCount1: number;
  unitQty1: number;
  rate: number;
  itemCount2: number;
  unitQty2: number;
}

function generateUniteInverseExercise(): UniteInverseExercise {
  const ctx = pick(UINV_CONTEXTS);
  const itemCount1 = randInt(2, 6);
  const rate = randInt(15, 40);
  const unitQty1 = itemCount1 * rate;
  const itemCount2 = itemCount1 + randInt(5, 35);
  const unitQty2 = itemCount2 * rate;
  return { ...ctx, itemCount1, unitQty1, rate, itemCount2, unitQty2 };
}

function UniteInverseQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: UniteInverseExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [rate, setRate] = useState('');
  const [itemCount2, setItemCount2] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const okRate = checkQuotient(rate, exercise.rate);
  const okCount2 = checkQuotient(itemCount2, exercise.itemCount2);
  const showFb = disabled;

  const submit = () => {
    if (disabled) return;
    if (rate.trim() === '' || itemCount2.trim() === '') return;
    onSubmit(okRate && okCount2);
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Passage par l'unité</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 10 }}>
        Avec {exercise.unitQty1} {exercise.unitPlural}, on {exercise.verb} {exercise.itemCount1} {exercise.itemPlural}. Calcule le nombre
        de {exercise.itemPlural} obtenus avec {exercise.unitQty2} {exercise.unitPlural}.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>Nombre de {exercise.itemPlural}</td>
              <td style={tblCellStyle}>{exercise.itemCount1}</td>
              <td style={{ ...tblCellStyle, background: showFb ? (okCount2 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : undefined }}>
                <input type="text" value={itemCount2} placeholder="?" disabled={disabled} onChange={(e) => setItemCount2(e.target.value)} style={blankInp} />
              </td>
            </tr>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>Nombre de {exercise.unitPlural}</td>
              <td style={tblCellStyle}>{exercise.unitQty1}</td>
              <td style={tblCellStyle}>{exercise.unitQty2}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 13 }}>{exercise.unitQty1} : {exercise.itemCount1} =</span>
        <input type="text" value={rate} placeholder="?" disabled={disabled} onChange={(e) => setRate(e.target.value)} style={{
          ...blankInp,
          background: showFb ? (okRate ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : blankInp.background,
        }} />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>({exercise.unitPlural} par {exercise.itemSingular})</span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          <div>{exercise.unitQty1} : {exercise.itemCount1} = <strong style={{ color: 'var(--correct)' }}>{exercise.rate}</strong></div>
          <div>{exercise.unitQty2} : {exercise.rate} = <strong style={{ color: 'var(--correct)' }}>{exercise.itemCount2}</strong></div>
          <div>On peut {exercise.verb === 'confectionne' ? 'confectionner' : exercise.verb === 'fabrique' ? 'fabriquer' : exercise.verb} <strong style={{ color: 'var(--correct)' }}>{exercise.itemCount2}</strong> {exercise.itemPlural}.</div>
        </div>
      </div>
    </div>
  );
}

// ── Q5 (Utiliser) : compléter tout le tableau à partir de l'énoncé ──────────────

interface FullTableTemplate {
  text: (qty1: number, value1: number, qty2: number) => string;
  qtyLabel: string;
  valueLabel: string;
  qtyRange: [number, number];
  kChoices: readonly number[];
}

const FULLTABLE_TEMPLATES: FullTableTemplate[] = [
  {
    text: (q1, v1, q2) => `Un marchand vend des oranges. ${q1} kg d'oranges coûtent ${fmtNum(v1)} €. Combien coûteront ${q2} kg d'oranges ?`,
    qtyLabel: 'Masse (kg)', valueLabel: 'Prix (€)',
    qtyRange: [2, 15], kChoices: [1.5, 1.8, 2, 2.2, 2.5, 3],
  },
  {
    text: (q1, v1, q2) => `Une imprimante imprime ${q1} pages en ${fmtNum(v1)} secondes. Combien de temps faudra-t-il pour imprimer ${q2} pages ?`,
    qtyLabel: 'Nombre de pages', valueLabel: 'Temps (s)',
    qtyRange: [20, 200], kChoices: [0.4, 0.5, 0.6, 0.8, 1],
  },
  {
    text: (q1, v1, q2) => `Un robinet coule à débit constant. En ${q1} minutes, il verse ${fmtNum(v1)} litres d'eau dans un bassin. Combien de litres versera-t-il en ${q2} minutes ?`,
    qtyLabel: 'Durée (min)', valueLabel: "Volume d'eau (L)",
    qtyRange: [3, 30], kChoices: [8, 10, 12, 15, 18],
  },
  {
    text: (q1, v1, q2) => `Dans une usine, ${q1} ouvriers fabriquent ${fmtNum(v1)} objets par jour. À la même cadence, combien d'objets fabriqueraient ${q2} ouvriers ?`,
    qtyLabel: "Nombre d'ouvriers", valueLabel: 'Objets par jour',
    qtyRange: [2, 12], kChoices: [15, 20, 25, 30],
  },
  {
    text: (q1, v1, q2) => `Un cycliste roule à vitesse constante. En ${q1} minutes, il parcourt ${fmtNum(v1)} km. Quelle distance parcourra-t-il en ${q2} minutes ?`,
    qtyLabel: 'Durée (min)', valueLabel: 'Distance (km)',
    qtyRange: [5, 40], kChoices: [0.15, 0.18, 0.2, 0.22, 0.25],
  },
  {
    text: (q1, v1, q2) => `Une recette pour ${q1} personnes nécessite ${fmtNum(v1)} g de sucre. Quelle quantité de sucre faut-il pour ${q2} personnes ?`,
    qtyLabel: 'Nombre de personnes', valueLabel: 'Sucre (g)',
    qtyRange: [2, 12], kChoices: [20, 25, 30, 35, 40],
  },
  {
    text: (q1, v1, q2) => `Un atelier facture ${fmtNum(v1)} € pour ${q1} photocopies. Combien facturera-t-il pour ${q2} photocopies ?`,
    qtyLabel: 'Nombre de photocopies', valueLabel: 'Prix (€)',
    qtyRange: [50, 500], kChoices: [0.04, 0.05, 0.06, 0.08],
  },
  {
    text: (q1, v1, q2) => `Une voiture consomme ${fmtNum(v1)} L d'essence pour ${q1} km parcourus. Quelle quantité d'essence consommera-t-elle pour ${q2} km ?`,
    qtyLabel: 'Distance (km)', valueLabel: 'Essence (L)',
    qtyRange: [50, 400], kChoices: [0.05, 0.06, 0.07, 0.08, 0.09],
  },
];

interface FullTableExercise {
  text: string;
  qtyLabel: string;
  valueLabel: string;
  qty1: number;
  value1: number;
  qty2: number;
  value2: number;
}

function generateFullTableExercise(): FullTableExercise {
  const tpl = pick(FULLTABLE_TEMPLATES);
  const [qMin, qMax] = tpl.qtyRange;
  const qty1 = randInt(qMin, qMax);
  let qty2 = randInt(qMin, qMax);
  while (qty2 === qty1) qty2 = randInt(qMin, qMax);
  const k = pick(tpl.kChoices);
  const value1 = round2(qty1 * k);
  const value2 = round2(qty2 * k);
  return { text: tpl.text(qty1, value1, qty2), qtyLabel: tpl.qtyLabel, valueLabel: tpl.valueLabel, qty1, value1, qty2, value2 };
}

function FullTableQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: FullTableExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [q1, setQ1] = useState('');
  const [v1, setV1] = useState('');
  const [q2, setQ2] = useState('');
  const [v2, setV2] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const okQ1 = checkQuotient(q1, exercise.qty1);
  const okV1 = checkQuotient(v1, exercise.value1);
  const okQ2 = checkQuotient(q2, exercise.qty2);
  const okV2 = checkQuotient(v2, exercise.value2);
  const showFb = disabled;

  const submit = () => {
    if (disabled) return;
    if ([q1, v1, q2, v2].some((v) => v.trim() === '')) return;
    onSubmit(okQ1 && okV1 && okQ2 && okV2);
  };

  const cellStyleFor = (ok: boolean) => ({ ...tblCellStyle, background: showFb ? (ok ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : undefined });

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Tableau à compléter entièrement</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 10 }}>{exercise.text}</p>
      <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 10 }}>
        🧮 Complète tout le tableau à l'aide de l'énoncé et d'un calcul.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>{exercise.qtyLabel}</td>
              <td style={cellStyleFor(okQ1)}>
                <input type="text" value={q1} placeholder="?" disabled={disabled} onChange={(e) => setQ1(e.target.value)} style={blankInp} />
              </td>
              <td style={cellStyleFor(okQ2)}>
                <input type="text" value={q2} placeholder="?" disabled={disabled} onChange={(e) => setQ2(e.target.value)} style={blankInp} />
              </td>
            </tr>
            <tr>
              <td style={{ ...tblCellStyle, textAlign: 'left', fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>{exercise.valueLabel}</td>
              <td style={cellStyleFor(okV1)}>
                <input type="text" value={v1} placeholder="?" disabled={disabled} onChange={(e) => setV1(e.target.value)} style={blankInp} />
              </td>
              <td style={cellStyleFor(okV2)}>
                <input type="text" value={v2} placeholder="?" disabled={disabled} onChange={(e) => setV2(e.target.value)} style={blankInp} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Incorrect.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          <div>{exercise.qtyLabel} : <strong style={{ color: 'var(--correct)' }}>{exercise.qty1}</strong> et <strong style={{ color: 'var(--correct)' }}>{exercise.qty2}</strong> (données de l'énoncé)</div>
          <div>{exercise.valueLabel} : <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.value1)}</strong> (donnée de l'énoncé)</div>
          <div>Coefficient : {fmtNum(exercise.value1)} ÷ {exercise.qty1} = {fmtNum(round2(exercise.value1 / exercise.qty1))}</div>
          <div>{exercise.qty2} × {fmtNum(round2(exercise.value1 / exercise.qty1))} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.value2)}</strong></div>
        </div>
      </div>
    </div>
  );
}

// ── ProportionnaliteHub (main export) ───────────────────────────────────────────

type ProportionnaliteExercise =
  | { exKind: 'table-prefilled'; data: ProporTableExercise }
  | { exKind: 'table-blank'; data: ProporTableExercise }
  | { exKind: 'problem'; data: ProporProblemExercise }
  | { exKind: 'lot'; data: LotExercise }
  | { exKind: 'etiquette'; data: EtiquetteExercise }
  | { exKind: 'unite-directe'; data: UniteDirecteExercise }
  | { exKind: 'unite-inverse'; data: UniteInverseExercise }
  | { exKind: 'full-table'; data: FullTableExercise };

function buildExercises(mode: HubMode): ProportionnaliteExercise[] {
  if (mode === 'reconnaitre') {
    const tableFirstTrue = Math.random() < 0.5;
    const problemFirstTrue = Math.random() < 0.5;
    return [
      { exKind: 'table-prefilled', data: generateProporTable(Math.random() < 0.5) },
      { exKind: 'table-blank', data: generateProporTable(tableFirstTrue) },
      { exKind: 'table-blank', data: generateProporTable(!tableFirstTrue) },
      { exKind: 'problem', data: generateProblemExercise(problemFirstTrue) },
      { exKind: 'problem', data: generateProblemExercise(!problemFirstTrue) },
    ];
  }
  if (mode === 'utiliser') {
    return [
      { exKind: 'lot', data: generateLotExercise() },
      { exKind: 'etiquette', data: generateEtiquetteExercise() },
      { exKind: 'unite-directe', data: generateUniteDirecteExercise() },
      { exKind: 'unite-inverse', data: generateUniteInverseExercise() },
      { exKind: 'full-table', data: generateFullTableExercise() },
    ];
  }
  return [];
}

const MODES: { id: Exclude<HubMode, null>; label: string; icon: string; desc: string; disabled?: boolean }[] = [
  {
    id: 'reconnaitre',
    label: 'Reconnaître une situation de proportionnalité',
    icon: '=',
    desc: '5 exercices · tableaux sans contexte et problèmes en contexte',
  },
  {
    id: 'utiliser',
    label: 'Utiliser une situation de proportionnalité',
    icon: '→',
    desc: '5 exercices · lots, étiquette nutritionnelle, passage par l\'unité, tableau complet',
  },
];

export function ProportionnaliteHub({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [mode, setMode] = useState<HubMode>(null);
  const [exercises, setExercises] = useState<ProportionnaliteExercise[]>([]);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const loadExercises = (m: HubMode) => {
    const exs = buildExercises(m);
    setExercises(exs);
    setAnswers(exs.map(() => emptyAnswer()));
    setSeriesKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectMode = (m: HubMode) => {
    setMode(m);
    loadExercises(m);
  };

  const goBack = () => {
    setMode(null);
    setExercises([]);
    setAnswers([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (i: number, ok: boolean) => {
    if (answers[i]?.status !== 'pending') return;
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? { ...a, status: ok ? 'correct' : 'wrong' } : a)));
  };

  const resetErrors = () => {
    setAnswers((prev) => prev.map((a) => (a.status === 'correct' ? a : { status: 'pending', resetKey: a.resetKey + 1 })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newSeries = () => {
    if (mode !== null) loadExercises(mode);
  };

  const stats = useMemo(() => {
    let correct = 0, wrong = 0, answered = 0;
    for (const a of answers) {
      if (a.status === 'correct') { correct++; answered++; }
      else if (a.status === 'wrong' || a.status === 'revealed') { wrong++; answered++; }
    }
    return { correct, wrong, answered, total: exercises.length };
  }, [answers, exercises.length]);

  const finished = stats.answered === stats.total && stats.total > 0;

  useEffect(() => {
    if (finished && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [finished]);

  if (mode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {MODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => selectMode(m.id)} disabled={m.disabled} />
        ))}
      </div>
    );
  }

  const accentStyle = { color: accent };
  const progressStyle = {
    width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`,
    background: accentSecondary ? `linear-gradient(90deg, ${accent}, ${accentSecondary})` : accent,
  };
  const modeLabel = MODES.find((m) => m.id === mode)?.label ?? '';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={goBack} style={{ fontSize: 13 }}>
          ← Changer de mode
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{modeLabel}</span>
      </div>

      {mode === 'reconnaitre' && <RecallReconnaitre accent={accent} />}
      {mode === 'utiliser' && <RecallUtiliser accent={accent} />}

      <div className="scoreboard">
        <div className="score-item">
          <span className="score-num" style={accentStyle}>{stats.correct}</span>
          <div className="score-label">Justes</div>
        </div>
        <div className="score-item">
          <span className="score-num" style={accentStyle}>{stats.wrong}</span>
          <div className="score-label">Faux</div>
        </div>
        <div className="score-item">
          <span className="score-num" style={accentStyle}>{stats.total - stats.answered}</span>
          <div className="score-label">Restants</div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={progressStyle} />
      </div>

      <div className="controls">
        <button className="btn-secondary" onClick={resetErrors} disabled={stats.wrong === 0}>
          Recommencer les erreurs
        </button>
        <button className="btn-secondary" onClick={newSeries}>Nouvelle série</button>
      </div>

      <div className="questions-list">
        {exercises.map((ex, i) => {
          const key = `${seriesKey}-${answers[i]!.resetKey}-${i}`;
          const common = { key, index: i, answer: answers[i]!, accent, onSubmit: (ok: boolean) => submit(i, ok) };
          if (ex.exKind === 'table-prefilled') return <ProporTablePrefilledQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'table-blank') return <ProporTableBlankQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'problem') return <ProporProblemQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'lot') return <LotQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'etiquette') return <EtiquetteQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'unite-directe') return <UniteDirecteQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'unite-inverse') return <UniteInverseQuestion {...common} exercise={ex.data} />;
          return <FullTableQuestion {...common} exercise={ex.data} />;
        })}
      </div>

      {finished && (
        <div className="end-banner" ref={endRef} style={{ border: `1px solid ${accent}` }}>
          <h2 style={{ color: accent }}>{endTitle(Math.round((stats.correct / stats.total) * 100))}</h2>
          <p>Score : {stats.correct} / {stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)</p>
          <div className="btn-group">
            <button className="btn-secondary" onClick={resetErrors} disabled={stats.wrong === 0}>
              Recommencer les erreurs
            </button>
            <button className="btn-primary" style={{ background: accent }} onClick={newSeries}>
              Nouvelle série
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
