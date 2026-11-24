import { useState } from 'react';
import { checkQuotient, fmtNum } from './ProportionnaliteHub';
import {
  generateDoubleRateExercise,
  generateLineariteExercise,
  generateSimpleRateExercise,
  generateSituationsExercise,
  type DoubleRateExercise,
  type LineariteExercise,
  type SimpleRateExercise,
  type SituationsExercise,
} from './proportionnaliteSansTableauData';
import {
  AnswerRow, C, CardFooter, CardShell, GridTable, Good, Inp, Scene, SectionLabel, StepsCorrection, YesNo,
  VividHero, VividPage, iconFor, isBlank, useStringArray,
  type AnswerState, type CardTheme,
} from './ProportionnaliteVividKit';

/**
 * 6ème · Proportionnalité · « Sans tableau » (Reconnaître / Utiliser) — redesigned pages.
 * Same generators and validation rules as before (see proportionnaliteSansTableauData.ts).
 */

type Mode = 'reconnaitre' | 'utiliser';

type SansTableauExercise =
  | { exKind: 'situations'; data: SituationsExercise }
  | { exKind: 'simple-rate'; data: SimpleRateExercise }
  | { exKind: 'double-rate'; data: DoubleRateExercise }
  | { exKind: 'linearite'; data: LineariteExercise };

function buildExercises(mode: Mode): SansTableauExercise[] {
  if (mode === 'reconnaitre') return [{ exKind: 'situations', data: generateSituationsExercise() }];
  return [
    { exKind: 'simple-rate', data: generateSimpleRateExercise() },
    { exKind: 'double-rate', data: generateDoubleRateExercise() },
    { exKind: 'double-rate', data: generateDoubleRateExercise() },
    { exKind: 'linearite', data: generateLineariteExercise() },
  ];
}

const ROW_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

const SITUATION_ICONS: [RegExp, string][] = [
  [/père/, '👨‍👦'], [/carburant/, '⛽'], [/robinet/, '🚰'], [/billets/, '🚆'], [/masse totale/, '⚖️'],
  [/kilogramme|masse/, '🛒'], [/périmètre/, '🟦'], [/poids|taille/, '📏'], [/taxi/, '🚕'], [/aire/, '📐'],
  [/abonnement/, '🏋️'], [/lire/, '📖'],
];

const RATE_ICONS: [RegExp, string][] = [
  [/robinet/, '🚰'], [/boit/, '🥤'], [/cycliste/, '🚴'], [/machine/, '🏭'], [/arbuste/, '🌱'],
  [/girolles/, '🍄'], [/cerises/, '🍒'], [/peinture/, '🎨'], [/photocopi/, '📠'],
  [/ruban/, '📼'], [/gâteaux/, '🍪'], [/bus/, '🚌'], [/graines/, '🌱'],
];

function themeFor(ex: SansTableauExercise, i: number, all: SansTableauExercise[]): CardTheme {
  if (ex.exKind === 'situations') {
    return {
      color: C.green, icon: '⚖️', deco: '∝', tag: 'Défi', stars: 2,
      title: 'Proportionnelles ou non ? Juge les 12 situations', short: 'Les 12 situations',
    };
  }
  if (ex.exKind === 'simple-rate') {
    return {
      color: C.sky, icon: iconFor(ex.data.text, RATE_ICONS, '🔢'), deco: '×', tag: 'Échauffement', stars: 1,
      title: 'Un seul calcul : multiplie par la valeur pour 1', short: 'Un seul calcul',
    };
  }
  if (ex.exKind === 'double-rate') {
    const n = all.slice(0, i).filter((e) => e.exKind === 'double-rate').length;
    return {
      color: n === 0 ? C.orange : C.pink, icon: iconFor(ex.data.context, RATE_ICONS, '🛒'), deco: n === 0 ? '÷' : '=', tag: 'Entraînement', stars: 2,
      title: 'Deux questions : multiplier, puis diviser', short: `Deux questions ${iconFor(ex.data.context, RATE_ICONS, '🛒')}`,
    };
  }
  return {
    color: C.violet, icon: iconFor(ex.data.plural, RATE_ICONS, '🧾'), deco: '+', tag: 'Défi', stars: 3,
    title: 'Les 4 méthodes : additionner, soustraire, multiplier, passer à l\'unité', short: 'Les 4 méthodes',
  };
}

// ── Questions ─────────────────────────────────────────────────────────────────

function SituationsCard({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: SituationsExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [choices, setChoices] = useState<(boolean | null)[]>(() => exercise.situations.map(() => null));
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const allAnswered = choices.every((c) => c !== null);
  const rowOk = (i: number) => choices[i] === exercise.situations[i]!.isProportional;

  const submit = () => {
    if (disabled) return;
    if (!allAnswered) { setTried(true); return; }
    onSubmit(exercise.situations.every((_, i) => rowOk(i)));
  };

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <p className="pv-instr">
        Dans chaque situation, indique si les deux grandeurs sont <strong>proportionnelles</strong> ou non.
        Pense à la question : « peut-on passer de l'une à l'autre en multipliant toujours par le même nombre ? »
      </p>

      <div className="pv-situations">
        {exercise.situations.map((s, i) => {
          const st = disabled ? rowOk(i) : null;
          const color = i % 2 === 0 ? C.blue : C.orange;
          const border = st === null ? `${color}40` : st ? 'var(--correct)' : 'var(--wrong)';
          return (
            <div key={i} className="pv-situation" style={{ border: `1.5px solid ${border}`, background: `${color}0d` }}>
              <span className="pv-situation-icon" style={{ background: `${color}26` }}>{iconFor(s.text, SITUATION_ICONS, '❓')}</span>
              <span className="pv-situation-text">
                <strong style={{ color }}>{ROW_LETTERS[i]}.</strong> {s.text}
              </span>
              <YesNo
                choice={choices[i]!}
                disabled={disabled}
                expected={s.isProportional}
                onChoose={(v) => setChoices((prev) => prev.map((c, idx) => (idx === i ? v : c)))}
              />
            </div>
          );
        })}
      </div>

      <div style={{ height: 16 }} />
      <CardFooter
        disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && !allAnswered}
        missingText="Réponds Oui ou Non à chaque situation."
        failText="Une ou plusieurs réponses sont incorrectes. Ouvre la correction."
      />
      <StepsCorrection
        color={theme.color}
        labels={exercise.situations.map((_, i) => ROW_LETTERS[i]!)}
        steps={exercise.situations.map((s) => (
          <>
            <strong style={{ color: s.isProportional ? 'var(--correct)' : 'var(--wrong)' }}>{s.isProportional ? 'Oui' : 'Non'}</strong>
            {' — '}{s.justification}
          </>
        ))}
      />
    </CardShell>
  );
}

function SimpleRateCard({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: SimpleRateExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [val, setVal] = useState('');
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const ok = checkQuotient(val, exercise.answer);

  const submit = () => {
    if (disabled) return;
    if (isBlank(val)) { setTried(true); return; }
    onSubmit(ok);
  };

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>{exercise.text}</Scene>
      <SectionLabel color={theme.color}>✏️ Ta réponse</SectionLabel>
      <div className="pv-calcs">
        <AnswerRow color={theme.color} status={disabled ? ok : null}>
          <Inp value={val} onChange={setVal} disabled={disabled} color={theme.color} label="Réponse" />
          <span className="pv-unit">{exercise.unit}</span>
        </AnswerRow>
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && isBlank(val)} />
      <StepsCorrection
        color={theme.color}
        steps={[<>Réponse : <Good>{fmtNum(exercise.answer)} {exercise.unit}</Good></>]}
      />
    </CardShell>
  );
}

function DoubleRateCard({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: DoubleRateExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVal] = useStringArray(2);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const oks = [checkQuotient(vals[0]!, exercise.answerA), checkQuotient(vals[1]!, exercise.answerB)];
  const strip = (s: string) => s.replace(/^[a-z]\.\s*/, '');
  const questions = [strip(exercise.qaText), strip(exercise.qbText)];
  const units = [exercise.unitA, exercise.unitB];
  const colors = [C.blue, C.orange];

  const submit = () => {
    if (disabled) return;
    if (vals.some(isBlank)) { setTried(true); return; }
    onSubmit(oks[0]! && oks[1]!);
  };

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>{exercise.context}</Scene>
      <SectionLabel color={theme.color}>✏️ Réponds aux deux questions</SectionLabel>
      <div className="pv-calcs">
        {questions.map((q, i) => (
          <AnswerRow key={i} color={colors[i]!} letter={i === 0 ? 'a' : 'b'} status={disabled ? oks[i]! : null}>
            <span className="pv-calc-label" style={{ flex: '1 1 240px' }}>{q}</span>
            <Inp value={vals[i]!} onChange={(v) => setVal(i, v)} disabled={disabled} color={colors[i]!} label={`Réponse ${i === 0 ? 'a' : 'b'}`} />
            <span className="pv-unit">{units[i]}</span>
          </AnswerRow>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && vals.some(isBlank)} />
      <StepsCorrection
        color={theme.color}
        labels={['a', 'b']}
        steps={exercise.scale > 1 ? [
          <>{exercise.qa * exercise.scale} {exercise.unitB} = {exercise.qa} × {exercise.scale} {exercise.unitB}, donc le prix est {exercise.qa} × {fmtNum(exercise.rate)} = <Good>{fmtNum(exercise.answerA)} {exercise.unitA}</Good></>,
          <>{fmtNum(exercise.amount)} : {fmtNum(exercise.rate)} = {exercise.qb}, donc {exercise.qb} × {exercise.scale} = <Good>{exercise.answerB} {exercise.unitB}</Good></>,
        ] : [
          <>{exercise.qa} × {fmtNum(exercise.rate)} = <Good>{fmtNum(exercise.answerA)} {exercise.unitA}</Good></>,
          <>{fmtNum(exercise.amount)} : {fmtNum(exercise.rate)} = <Good>{exercise.answerB} {exercise.unitB}</Good></>,
        ]}
      />
    </CardShell>
  );
}

function LineariteCard({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: LineariteExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVal] = useStringArray(4);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const expected = [exercise.sumPrice, exercise.diffPrice, exercise.multPrice, exercise.unitPrice];
  const oks = vals.map((v, i) => checkQuotient(v, expected[i]!));
  const colors = [C.green, C.rose, C.orange, C.violet];
  const badges = ['➕', '➖', '✖️', '1️⃣'];

  const questions = [
    `Quel est le prix de ${exercise.sumQty} ${exercise.plural} ? (méthode de l'addition)`,
    `Quel est le prix de ${exercise.diffQty} ${exercise.plural} ? (méthode de la soustraction)`,
    `Quel est le prix de ${exercise.multQty} ${exercise.plural} ? (méthode de la multiplication)`,
    `Quel est le prix d'un seul ${exercise.singular} ? (passage par l'unité)`,
  ];

  const submit = () => {
    if (disabled) return;
    if (vals.some(isBlank)) { setTried(true); return; }
    onSubmit(oks.every(Boolean));
  };

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme}>
        {exercise.sizeA} {exercise.plural} coûtent <strong>{fmtNum(exercise.priceA)} €</strong>.<br />
        {exercise.sizeB} {exercise.plural} coûtent <strong>{fmtNum(exercise.priceB)} €</strong>.
      </Scene>
      <GridTable
        rowLabels={['Nombre', 'Prix (€)']}
        colColors={[C.blue, C.orange]}
        rows={[[exercise.sizeA, exercise.sizeB], [fmtNum(exercise.priceA), fmtNum(exercise.priceB)]]}
        colHeaders={['Lot 1', 'Lot 2']}
      />
      <SectionLabel color={theme.color}>✏️ Quatre méthodes, quatre prix</SectionLabel>
      <div className="pv-calcs">
        {questions.map((q, i) => (
          <AnswerRow key={i} color={colors[i]!} status={disabled ? oks[i]! : null}>
            <span className="pv-method-badge" style={{ background: `${colors[i]}26` }}>{badges[i]}</span>
            <span className="pv-calc-label" style={{ flex: '1 1 220px' }}>{q}</span>
            <Inp value={vals[i]!} onChange={(v) => setVal(i, v)} disabled={disabled} color={colors[i]!} label={`Réponse ${i + 1}`} />
            <span className="pv-unit">€</span>
          </AnswerRow>
        ))}
      </div>
      <CardFooter disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && vals.some(isBlank)} />
      <StepsCorrection
        color={theme.color}
        labels={['+', '−', '×', '÷']}
        steps={[
          <>{fmtNum(exercise.priceA)} + {fmtNum(exercise.priceB)} = <Good>{fmtNum(exercise.sumPrice)} €</Good></>,
          <>{fmtNum(exercise.priceB)} − {fmtNum(exercise.priceA)} = <Good>{fmtNum(exercise.diffPrice)} €</Good></>,
          <>{fmtNum(exercise.priceA)} × {exercise.multFactor} = <Good>{fmtNum(exercise.multPrice)} €</Good></>,
          <>{fmtNum(exercise.priceA)} ÷ {exercise.sizeA} = <Good>{fmtNum(exercise.unitPrice)} €</Good></>,
        ]}
      />
    </CardShell>
  );
}

// ── Hero content ──────────────────────────────────────────────────────────────

function ExCard({ color, emoji, title, lines, verdict }: {
  color: string;
  emoji: string;
  title: string;
  lines: React.ReactNode[];
  verdict: string;
}) {
  return (
    <div className="pv-ex" style={{ borderColor: `${color}66`, background: `${color}12` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 24 }}>{emoji}</span>
        <strong style={{ fontSize: 13 }}>{title}</strong>
      </div>
      {lines.map((l, i) => <div key={i} className="pv-ex-line">{l}</div>)}
      <div className="pv-ex-verdict" style={{ background: `${color}26`, color }}>{verdict}</div>
    </div>
  );
}

function ReconnaitreHero({ onBack }: { onBack: () => void }) {
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Reconnaître', color: C.green }, { label: '✎ Sans tableau', color: C.pink }]}
      title="Comment reconnaître une situation de proportionnalité ?"
      intro={
        <>
          Deux grandeurs sont <strong style={{ color: C.orange }}>proportionnelles</strong> si les valeurs de l'une s'obtiennent en
          multipliant les valeurs de l'autre par <strong>un même nombre</strong>.
        </>
      }
      steps={[
        { emoji: '🔎', color: C.blue, text: <>Repère les <strong>deux grandeurs</strong> de la situation.</> },
        { emoji: '🧪', color: C.orange, text: <>Teste : passe-t-on de l'une à l'autre en multipliant toujours par <strong>le même nombre</strong> ?</> },
        { emoji: '⚖️', color: C.green, text: <>Oui → <strong>proportionnelles</strong>. Un écart fixe ou des frais fixes → <strong>non</strong>.</> },
      ]}
      videos={[{ url: 'https://youtu.be/7DSHIDWM-ss', label: 'Vidéo : reconnaître une situation de proportionnalité' }]}
      illusTitle="✨ Deux exemples"
      illus={
        <div className="pv-ex-list">
          <ExCard
            color={C.green} emoji="👕" title="T-shirts à 11 € l'unité"
            lines={['1 t-shirt → 11 €', '2 t-shirts → 2 × 11 = 22 €', '3 t-shirts → 3 × 11 = 33 €']}
            verdict="✓ Proportionnel"
          />
          <ExCard
            color={C.rose} emoji="🖊️" title="Stylos : 2,10 € l'unité, 20 € les dix"
            lines={['10 × 2,10 € = 21 €', 'mais le paquet de 10 coûte 20 €']}
            verdict="✗ Pas proportionnel"
          />
        </div>
      }
    />
  );
}

function UtiliserHero({ onBack }: { onBack: () => void }) {
  return (
    <VividHero
      onBack={onBack}
      crumbs={[{ label: 'Utiliser', color: C.blue }, { label: '✎ Sans tableau', color: C.pink }]}
      title="Comment utiliser la proportionnalité sans tableau ?"
      intro={
        <>
          Violette achète <strong>6 effaceurs</strong> tous identiques et paie <strong>9 €</strong>. Le prix est proportionnel au
          nombre d'effaceurs : on peut calculer d'autres prix de trois façons.
        </>
      }
      steps={[
        { emoji: '✖️', color: C.orange, title: 'Multiplier / diviser', text: <>Tristan achète 3 effaceurs (moitié moins) : 9 ÷ 2 = <strong>4,50 €</strong>.</> },
        { emoji: '➕', color: C.green, title: 'Linéarité', text: <>Dorian achète 9 effaceurs = 6 + 3 : 9 + 4,50 = <strong>13,50 €</strong>.</> },
        { emoji: '1️⃣', color: C.violet, title: 'Passage par l\'unité', text: <>1 effaceur : 9 ÷ 6 = 1,50 €. Mathilde en achète 5 : 1,50 × 5 = <strong>7,50 €</strong>.</> },
      ]}
      videos={[
        { url: 'https://youtu.be/gdiHWNjB7FQ', label: 'Vidéo : utiliser la proportionnalité (1)' },
        { url: 'https://youtu.be/X0knMBxYcGg', label: 'Vidéo : utiliser la proportionnalité (2)' },
      ]}
      illusTitle="🛒 6 effaceurs = 9 €"
      illus={
        <div className="pv-flow">
          {[
            { n: '6', p: '9 €', note: 'départ', c: C.blue },
            { n: '3', p: '4,50 €', note: '÷ 2', c: C.orange },
            { n: '9', p: '13,50 €', note: '6 + 3', c: C.green },
            { n: '1', p: '1,50 €', note: '÷ 6', c: C.violet },
            { n: '5', p: '7,50 €', note: '× 5', c: C.pink },
          ].map((r, i) => (
            <div key={i} className="pv-flow-row" style={{ borderColor: `${r.c}55`, background: `${r.c}14` }}>
              <span className="pv-flow-n" style={{ background: r.c }}>{r.n}</span>
              <span>effaceur{r.n === '1' ? '' : 's'} →</span>
              <strong>{r.p}</strong>
              <span className="pv-flow-note" style={{ color: r.c }}>{r.note}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ProportionnaliteSansTableauVivid({ mode, accent, onBack }: {
  mode: Mode;
  accent: string;
  onBack: () => void;
}) {
  return (
    <VividPage<SansTableauExercise>
      key={mode}
      accent={accent}
      hero={mode === 'reconnaitre' ? <ReconnaitreHero onBack={onBack} /> : <UtiliserHero onBack={onBack} />}
      tip={mode === 'reconnaitre'
        ? { emoji: '🧠', title: 'Le savais-tu ?', text: <>Dès qu'il y a un <strong>montant fixe</strong> (prise en charge, frais d'inscription…), la situation n'est <strong>pas</strong> proportionnelle.</> }
        : { emoji: '🧠', title: 'Astuce', text: <>Le <strong>passage par l'unité</strong> marche toujours : calcule d'abord la valeur pour <strong>1</strong>, puis multiplie.</> }}
      build={() => buildExercises(mode)}
      themeFor={themeFor}
      renderCard={(ex, i, p) => {
        if (ex.exKind === 'situations') return <SituationsCard index={i} exercise={ex.data} {...p} />;
        if (ex.exKind === 'simple-rate') return <SimpleRateCard index={i} exercise={ex.data} {...p} />;
        if (ex.exKind === 'double-rate') return <DoubleRateCard index={i} exercise={ex.data} {...p} />;
        return <LineariteCard index={i} exercise={ex.data} {...p} />;
      }}
    />
  );
}
