import { useState } from 'react';
import {
  AnswerRow, C, CardFooter, CardShell, CorrectionFrame, Inp, Scene, StepsCorrection, Tip,
  VividHero, VividPage, isBlank,
  type AnswerState, type CardTheme, type HeroStep,
} from './ProportionnaliteVividKit';
import {
  buildQuiz, evalCheck, generateCountRows, par,
  type Check, type CountExercise, type Field, type PyramidExercise, type RelExercise, type RowsExercise, type QuizId,
} from './relatifsOperationsData';

/**
 * 5ème · Opérations sur les nombres relatifs — three sub-quizzes (addition, soustraction, simplification d'écriture),
 * all computations (no word problems). Same redesigned look as the other quizzes (ProportionnaliteVividKit).
 */

const PALETTE = [C.sky, C.orange, C.green, C.violet, C.pink, C.blue, C.magenta] as const;
const DECOS: Record<QuizId, string> = { addition: '+', soustraction: '−', ecriture: '±' };

// ── Small pieces ──────────────────────────────────────────────────────────────

function PickGroup({ options, value, onChange, disabled, expected }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  expected: string;
}) {
  return (
    <span className="pv-yn">
      {options.map((o) => {
        const sel = value === o;
        let style: React.CSSProperties;
        if (disabled) {
          if (o === expected) style = { border: '2px solid var(--correct)', background: 'rgba(74,222,128,0.16)', color: 'var(--correct)' };
          else if (sel) style = { border: '2px solid var(--wrong)', background: 'rgba(248,113,113,0.16)', color: 'var(--wrong)' };
          else style = { border: '2px solid var(--border)', background: 'var(--surface2)', opacity: 0.45 };
        } else {
          style = sel
            ? { border: `2px solid ${C.orange}`, background: `${C.orange}26`, color: C.orange }
            : { border: '2px solid var(--border2)', background: 'var(--surface2)' };
        }
        return (
          <button key={o} type="button" disabled={disabled} onClick={() => onChange(o)} style={{ ...style, padding: '6px 14px' }}>
            {o}
          </button>
        );
      })}
    </span>
  );
}

function FieldInput({ field, value, onChange, disabled, color, label }: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  color: string;
  label: string;
}) {
  const check: Check = field.check;
  if (check.kind === 'pick') {
    return <PickGroup options={check.options} value={value} onChange={onChange} disabled={disabled} expected={check.value} />;
  }
  return <Inp value={value} onChange={onChange} disabled={disabled} color={color} label={label} signed wide={check.kind !== 'num'} />;
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function RowsCard({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: RowsExercise | CountExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  // "Choose how many numbers" exercise: picking 2–5 regenerates the expressions (locked once answered).
  const isCount = exercise.kind === 'count';
  const [count, setCount] = useState(2);
  const [countRows, setCountRows] = useState(isCount ? exercise.rows : []);
  const rows = isCount ? countRows : exercise.rows;
  const chooseCount = (n: number) => {
    if (disabled || exercise.kind !== 'count' || n === count) return;
    setCount(n);
    setCountRows(generateCountRows(exercise.mode, n));
    setVals({});
    setTried(false);
  };
  const key = (ri: number, si: number) => `${ri}.${si}`;
  const get = (ri: number, si: number) => vals[key(ri, si)] ?? '';

  const fieldSlots = rows.flatMap((r, ri) => r.segments.flatMap((s, si) => (typeof s === 'string' ? [] : [[ri, si] as const])));
  const missing = fieldSlots.some(([ri, si]) => isBlank(get(ri, si)));
  const rowOk = (ri: number) =>
    rows[ri]!.segments.every((s, si) => typeof s === 'string' || evalCheck(s.check, get(ri, si)));

  const submit = () => {
    if (disabled) return;
    if (missing) { setTried(true); return; }
    onSubmit(rows.every((_, ri) => rowOk(ri)));
  };

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={exercise.tip ? <Tip color={C.blue}>💡 {exercise.tip}</Tip> : undefined}>{exercise.instruction}</Scene>

      {isCount && (
        <div className="pv-count">
          <span className="pv-count-label">Nombre de nombres relatifs :</span>
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => chooseCount(n)}
              className={`pv-count-btn${count === n ? ' on' : ''}`}
              style={count === n ? { borderColor: theme.color, background: `${theme.color}26`, color: theme.color } : undefined}
            >
              {n}
            </button>
          ))}
        </div>
      )}
      <div className="pv-calcs">
        {rows.map((row, ri) => {
          const color = PALETTE[(index + ri) % PALETTE.length]!;
          return (
            <AnswerRow key={ri} color={color} letter={row.label} status={disabled ? rowOk(ri) : null}>
              <span className="pv-eq">
                {row.segments.map((s, si) =>
                  typeof s === 'string' ? (
                    <span key={si} className="pv-eqtext">{s}</span>
                  ) : (
                    <FieldInput
                      key={si}
                      field={s}
                      value={get(ri, si)}
                      onChange={(v) => setVals((prev) => ({ ...prev, [key(ri, si)]: v }))}
                      disabled={disabled}
                      color={color}
                      label={`Réponse ${row.label}, case ${si + 1}`}
                    />
                  ))}
              </span>
            </AnswerRow>
          );
        })}
      </div>

      <CardFooter
        disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && missing}
        missingText="Complète toutes les cases." failText="Une ou plusieurs réponses sont incorrectes. Ouvre la correction."
      />
      <StepsCorrection color={theme.color} labels={rows.map((r) => r.label)} steps={rows.map((r) => r.explain)} />
    </CardShell>
  );
}

function Pyramid({ ex, vals, setVal, disabled, color, status, reveal }: {
  ex: PyramidExercise;
  vals: Record<string, string>;
  setVal: (k: string, v: string) => void;
  disabled: boolean;
  color: string;
  status: (r: number, i: number) => boolean | null;
  reveal: boolean;
}) {
  return (
    <div className="pv-pyr">
      {ex.cells.map((row, r) => (
        <div key={r} className="pv-pyr-row">
          {row.map((v, i) => {
            const hidden = ex.hidden[r]![i]!;
            const st = hidden && disabled ? status(r, i) : null;
            const border = st === null ? `${color}66` : st ? 'var(--correct)' : 'var(--wrong)';
            return (
              <div key={i} className="pv-pyr-cell" style={{ borderColor: border, background: hidden ? `${color}10` : 'var(--surface2)' }}>
                {!hidden || reveal ? (
                  <span className="pv-pyr-num" style={reveal && hidden ? { color: 'var(--correct)' } : undefined}>{par(v)}</span>
                ) : (
                  <Inp value={vals[`${r}.${i}`] ?? ''} onChange={(x) => setVal(`${r}.${i}`, x)} disabled={disabled} color={color} label={`Case ${r + 1}-${i + 1}`} signed />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function PyramidCard({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: PyramidExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const hiddenKeys: [number, number][] = [];
  exercise.cells.forEach((row, r) => row.forEach((_, i) => { if (exercise.hidden[r]![i]) hiddenKeys.push([r, i]); }));
  const missing = hiddenKeys.some(([r, i]) => isBlank(vals[`${r}.${i}`] ?? ''));
  const cellOk = (r: number, i: number) => evalCheck({ kind: 'num', value: exercise.cells[r]![i]! }, vals[`${r}.${i}`] ?? '');

  const submit = () => {
    if (disabled) return;
    if (missing) { setTried(true); return; }
    onSubmit(hiddenKeys.every(([r, i]) => cellOk(r, i)));
  };

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={exercise.tip ? <Tip color={C.blue}>💡 {exercise.tip}</Tip> : undefined}>{exercise.instruction}</Scene>
      <Pyramid ex={exercise} vals={vals} setVal={(k, v) => setVals((p) => ({ ...p, [k]: v }))} disabled={disabled} color={theme.color} status={cellOk} reveal={false} />
      <div style={{ height: 14 }} />
      <CardFooter
        disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && missing}
        missingText="Complète toutes les cases." failText="Une ou plusieurs cases sont incorrectes. Ouvre la correction."
      />
      <CorrectionFrame color={theme.color}>
        <div>{exercise.explain}</div>
        <Pyramid ex={exercise} vals={vals} setVal={() => undefined} disabled color={theme.color} status={() => null} reveal />
      </CorrectionFrame>
    </CardShell>
  );
}

// ── Heroes (rappels + vidéos) ─────────────────────────────────────────────────

export function Examples({ rows }: { rows: { text: string; note: string; color: string }[] }) {
  return (
    <div className="pv-flow">
      {rows.map((r) => (
        <div key={r.text} className="pv-flow-row" style={{ borderColor: `${r.color}55`, background: `${r.color}14` }}>
          <strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>{r.text}</strong>
          <span className="pv-flow-note" style={{ color: r.color }}>{r.note}</span>
        </div>
      ))}
    </div>
  );
}

const M = '−';

const VIDEO_ADDITION = {
  src: '/videos/relatifs-addition.mp4',
  poster: '/videos/relatifs-addition.jpg',
  title: 'Vidéo : additionner des nombres relatifs — notation, même signe, signes contraires, opposés (sous-titrée)',
};
const VIDEO_SOUSTRACTION = {
  src: '/videos/relatifs-soustraction.mp4',
  poster: '/videos/relatifs-soustraction.jpg',
  title: "Vidéo : soustraire des nombres relatifs — soustraire, c'est ajouter l'opposé (sous-titrée)",
};
const VIDEO_ECRITURE = {
  src: '/videos/relatifs-ecriture.mp4',
  poster: '/videos/relatifs-ecriture.jpg',
  title: "Vidéo : simplifier l'écriture — les règles de signes et le regroupement (sous-titrée)",
};

function AdditionHero({ onBack }: { onBack: () => void }) {
  const steps: HeroStep[] = [
    { emoji: '🟰', color: C.green, title: 'Même signe', text: <>On garde <strong>le même signe</strong> et on <strong>ajoute</strong> les distances à zéro.</> },
    { emoji: '↔️', color: C.orange, title: 'Signes contraires', text: <>On prend le signe de <strong>la plus grande distance</strong> à zéro et on <strong>soustrait</strong> les distances.</> },
    { emoji: '0️⃣', color: C.violet, title: 'Opposés', text: <>La somme de deux nombres <strong>opposés</strong> est toujours égale à <strong>0</strong>.</> },
  ];
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Opérations sur les relatifs', color: C.magenta }, { label: '➕ Addition', color: C.green }]}
      title="Comment additionner des nombres relatifs ?"
      intro={
        <>
          On ne peut pas écrire <strong>+3 + −1</strong> : on sépare les signes avec des <strong>parenthèses</strong>, par exemple{' '}
          <strong style={{ color: C.orange }}>(+3) + ({M}1)</strong>. Le signe « + » sert ici à deux choses : donner le signe de 3 et additionner.
        </>
      }
      steps={steps}
      videos={[
        { url: 'https://www.youtube.com/shorts/RtBxAKm9Tkg', label: 'Vidéo : additionner des nombres relatifs (court)' },
        { url: 'https://www.youtube.com/watch?v=zzhfzRic7xg', label: 'Vidéo : somme de nombres relatifs' },
      ]}
      localVideo={VIDEO_ADDITION}
      illusTitle="✨ Des exemples"
      illus={
        <Examples rows={[
          { text: '(+2) + (+4) = +6', note: '2 + 4', color: C.green },
          { text: `(${M}3) + (${M}1) = ${M}4`, note: '3 + 1', color: C.green },
          { text: `(${M}5) + (+3) = ${M}2`, note: 'car 5 > 3', color: C.orange },
          { text: `(${M}2) + (+7) = +5`, note: 'car 7 > 2', color: C.orange },
          { text: `(+4) + (${M}4) = 0`, note: 'opposés', color: C.violet },
        ]} />
      }
    />
  );
}

function SoustractionHero({ onBack }: { onBack: () => void }) {
  const steps: HeroStep[] = [
    { emoji: '👀', color: C.blue, title: 'Repère', text: <>Repère le nombre qui est <strong>soustrait</strong> (celui qui est après le « − »).</> },
    { emoji: '🔄', color: C.orange, title: 'Remplace', text: <>Remplace-le par <strong>son opposé</strong> et change le « − » en <strong>« + »</strong>.</> },
    { emoji: '➕', color: C.green, title: 'Additionne', text: <>Tu as une <strong>addition</strong> : calcule-la avec les règles d'addition.</> },
  ];
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Opérations sur les relatifs', color: C.magenta }, { label: '➖ Soustraction', color: C.orange }]}
      title="Comment soustraire des nombres relatifs ?"
      intro={<>Soustraire un nombre relatif, c'est <strong style={{ color: C.orange }}>additionner son opposé</strong>.</>}
      steps={steps}
      videos={[{ url: 'https://www.youtube.com/shorts/HVl1vLXJIeE', label: 'Vidéo : soustraire des nombres relatifs' }]}
      localVideo={VIDEO_SOUSTRACTION}
      illusTitle="✨ Des exemples"
      illus={
        <Examples rows={[
          { text: `A = (+7) ${M} (+3)`, note: '', color: C.sky },
          { text: `A = (+7) + (${M}3) = +4`, note: 'opposé de +3', color: C.green },
          { text: `B = (${M}8) ${M} (${M}6)`, note: '', color: C.sky },
          { text: `B = (${M}8) + (+6) = ${M}2`, note: 'opposé de −6', color: C.green },
          { text: `C = (${M}5) ${M} (+3) = (${M}5) + (${M}3) = ${M}8`, note: '', color: C.green },
        ]} />
      }
    />
  );
}

function EcritureHero({ onBack }: { onBack: () => void }) {
  const steps: HeroStep[] = [
    { emoji: '➕➕', color: C.green, title: '+ puis +', text: <>Un « + » suivi d'un « + » donne un <strong>« + »</strong>.</> },
    { emoji: '➕➖', color: C.rose, title: '+ puis −', text: <>Un « + » suivi d'un « − » donne un <strong>« − »</strong>.</> },
    { emoji: '➖➕', color: C.orange, title: '− puis +', text: <>Un « − » suivi d'un « + » donne un <strong>« − »</strong>.</> },
    { emoji: '➖➖', color: C.violet, title: '− puis −', text: <>Un « − » suivi d'un « − » donne un <strong>« + »</strong>.</> },
  ];
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Opérations sur les relatifs', color: C.magenta }, { label: '✂️ Simplifier l\'écriture', color: C.violet }]}
      title="Comment simplifier l'écriture d'une somme ?"
      intro={<>On transforme les soustractions en additions, puis on <strong style={{ color: C.orange }}>supprime les parenthèses</strong> et les signes inutiles.</>}
      steps={steps}
      videos={[{ url: 'https://youtu.be/ZjrmsHRKajg', label: 'Vidéo : simplifier l\'écriture' }]}
      localVideo={VIDEO_ECRITURE}
      illusTitle="✨ Des exemples"
      illus={
        <Examples rows={[
          { text: `(+3) ${M} (+5) = 3 + (${M}5) = 3 ${M} 5`, note: '', color: C.green },
          { text: `(+12) ${M} (${M}8) = 12 + (+8) = 12 + 8`, note: '', color: C.orange },
          { text: `(${M}9) ${M} (+7) ${M} (${M}3) + (${M}7)`, note: 'à simplifier', color: C.sky },
          { text: `= ${M}9 ${M} 7 + 3 ${M} 7 = ${M}20`, note: 'résultat', color: C.violet },
        ]} />
      }
    />
  );
}

// ── Exports (used by the « Nombres relatifs » hub, which lists these three as extra modes) ──────────────

export type RelatifsOperationMode = QuizId;

export const RELATIFS_OPERATION_MODES: { id: RelatifsOperationMode; label: string; icon: string; desc: string }[] = [
  { id: 'addition', label: 'Addition de nombres relatifs', icon: '+', desc: '5 exercices · entiers, nombre de termes au choix, x + y + z, pyramide, calcul astucieux' },
  { id: 'soustraction', label: 'Soustraction de nombres relatifs', icon: '−', desc: "8 exercices · additionner l'opposé, nombre de termes au choix, calcul mental, programme de calcul" },
  { id: 'ecriture', label: "Simplification d'écriture", icon: '±', desc: '5 exercices · supprimer les parenthèses, calcul mental, calcul de gauche à droite' },
];

const TIPS: Record<QuizId, { emoji: string; title: string; text: React.ReactNode }> = {
  addition: { emoji: '🧠', title: 'Le savais-tu ?', text: <>Ajouter deux nombres de <strong>même signe</strong>, c'est <strong>ajouter</strong> leurs distances à zéro ; sinon, on les <strong>soustrait</strong>.</> },
  soustraction: { emoji: '🧠', title: 'Astuce', text: <>Pour soustraire, pense toujours : <strong>« j'ajoute l'opposé »</strong>. Tu n'as plus qu'une addition à faire.</> },
  ecriture: { emoji: '🧠', title: 'Astuce', text: <>Quand deux signes se suivent : <strong>mêmes signes → « + »</strong>, <strong>signes différents → « − »</strong>.</> },
};

/** One operations sub-quiz (rappel + vidéo + exercices). `onBack` returns to the hub's mode list. */
export function RelatifsOperationsPage({ mode, accent, onBack }: { mode: RelatifsOperationMode; accent: string; onBack: () => void }) {
  const hero = mode === 'addition' ? <AdditionHero onBack={onBack} /> : mode === 'soustraction' ? <SoustractionHero onBack={onBack} /> : <EcritureHero onBack={onBack} />;
  return (
    <VividPage<RelExercise>
      key={mode}
      accent={accent}
      hero={hero}
      tip={TIPS[mode]}
      build={() => buildQuiz(mode)}
      themeFor={(ex, i) => ({
        color: PALETTE[i % PALETTE.length]!, icon: ex.icon, deco: DECOS[mode], tag: ex.tag, title: ex.title, short: ex.short, stars: ex.stars,
      })}
      renderCard={(ex, i, p) => (ex.kind === 'pyramid'
        ? <PyramidCard index={i} exercise={ex} {...p} />
        : <RowsCard index={i} exercise={ex} {...p} />)}
    />
  );
}
