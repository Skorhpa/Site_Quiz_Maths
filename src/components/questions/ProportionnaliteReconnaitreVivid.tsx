import { useState } from 'react';
import {
  checkQuotient,
  fmtNum,
  generateProblemExercise,
  generateProporTable,
  type ProporProblemExercise,
  type ProporTableExercise,
} from './ProportionnaliteHub';
import {
  C, COL_COLORS, CalcRow, CardFooter, CardShell, Inp, NumChip, PvTable, QuotientCorrection, Scene, SectionLabel, Tip,
  VerdictPicker, VividHero, VividPage, iconFor, isBlank, useStringArray,
  type AnswerState, type CardTheme,
} from './ProportionnaliteVividKit';

/**
 * 6ème · Proportionnalité · « Reconnaître » · « Avec tableau » — redesigned page, same exercise set and
 * validation rules as the 5ème quiz (1 guided table, 2 tables to fill in, 2 context problems).
 */

const COL_LETTERS = ['A', 'B', 'C'] as const;

type VividExercise =
  | { exKind: 'table-prefilled'; data: ProporTableExercise }
  | { exKind: 'table-blank'; data: ProporTableExercise }
  | { exKind: 'problem'; data: ProporProblemExercise };

function buildExercises(): VividExercise[] {
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

const PROBLEM_ILLUSTRATIONS: [RegExp, string][] = [
  [/bouquet/i, '💐'],
  [/collège/i, '🏫'],
  [/crêpes/i, '🥞'],
  [/carburant/i, '🚗'],
  [/papier/i, '📄'],
  [/salaire/i, '💶'],
  [/pommes/i, '🍎'],
  [/piscine/i, '🏊'],
];

function themeFor(ex: VividExercise, i: number, all: VividExercise[]): CardTheme {
  if (ex.exKind === 'table-prefilled') {
    return { color: C.sky, icon: '🔍', deco: '÷', tag: 'Échauffement', title: 'Tableau guidé : calcule les quotients', short: 'Tableau guidé', stars: 1 };
  }
  if (ex.exKind === 'table-blank') {
    const n = all.slice(0, i).filter((e) => e.exKind === 'table-blank').length;
    return {
      color: n === 0 ? C.violet : C.pink, icon: '🧮', deco: n === 0 ? '∝' : '=',
      tag: 'Entraînement', title: 'Tableau à analyser : écris toi-même les divisions', short: 'Tableau à compléter', stars: 2,
    };
  }
  const n = all.slice(0, i).filter((e) => e.exKind === 'problem').length;
  const icon = iconFor(ex.data.context, PROBLEM_ILLUSTRATIONS, '🔎');
  return {
    color: n === 0 ? C.orange : C.magenta, icon, deco: n === 0 ? '×' : '%',
    tag: 'Défi', title: 'Problème : est-ce une situation de proportionnalité ?', short: `Problème ${icon}`, stars: 3,
  };
}

/** Which quotients "agree" — all of them when proportional, otherwise those sharing the majority value. */
function quotientFlags(values: number[], isProportional: boolean): boolean[] {
  if (isProportional) return values.map(() => true);
  const same = (a: number, b: number) => Math.abs(a - b) < 0.005;
  const majority = values.find((v) => values.filter((w) => same(v, w)).length >= 2);
  return values.map((v) => majority !== undefined && same(v, majority));
}

// ── Questions ─────────────────────────────────────────────────────────────────

function TableQuestion({ index, exercise, prefilled, theme, answer, onSubmit }: {
  index: number;
  exercise: ProporTableExercise;
  prefilled: boolean;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [bottoms, setBottom] = useStringArray(3);
  const [tops, setTop] = useStringArray(3);
  const [quots, setQuot] = useStringArray(3);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';
  const cols = exercise.cols;

  const rowOk = (i: number) => {
    const c = cols[i]!;
    const qOk = checkQuotient(quots[i]!, c.quotient);
    return prefilled ? qOk : qOk && checkQuotient(bottoms[i]!, c.bottom) && checkQuotient(tops[i]!, c.top);
  };
  const missing = quots.some(isBlank) || (!prefilled && (bottoms.some(isBlank) || tops.some(isBlank))) || choice === null;

  const submit = () => {
    if (disabled) return;
    if (missing) { setTried(true); return; }
    onSubmit(cols.every((_, i) => rowOk(i)) && choice === exercise.isProportional);
  };

  const quotients = cols.map((c) => c.quotient);
  const flags = quotientFlags(quotients, exercise.isProportional);

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <p className="pv-instr">
        {prefilled
          ? 'Les divisions sont déjà posées : calcule chaque quotient, puis décide si ce tableau est un tableau de proportionnalité.'
          : 'Écris les trois divisions (2ᵉ ligne : 1ʳᵉ ligne), calcule-les, puis décide si ce tableau est un tableau de proportionnalité.'}
      </p>
      <div className="pv-tips">
        <Tip color={C.blue}>🧮 Calculatrice autorisée</Tip>
        <Tip color={C.orange}>➗ 2ᵉ ligne : 1ʳᵉ ligne</Tip>
      </div>

      <PvTable
        colHeaders={[...COL_LETTERS]}
        rowLabels={['1ʳᵉ ligne', '2ᵉ ligne']}
        rows={[cols.map((c) => c.top), cols.map((c) => c.bottom)]}
        colColors={COL_COLORS}
        quotients={disabled ? { values: quotients, flags } : undefined}
      />

      <SectionLabel color={theme.color}>✏️ Les divisions</SectionLabel>
      <div className="pv-calcs">
        {cols.map((c, i) => {
          const color = COL_COLORS[i]!;
          const letter = COL_LETTERS[i]!;
          const q = <Inp value={quots[i]!} onChange={(v) => setQuot(i, v)} disabled={disabled} color={color} label={`Quotient colonne ${letter}`} />;
          const parts: [React.ReactNode, React.ReactNode, React.ReactNode] = prefilled
            ? [<NumChip>{fmtNum(c.bottom)}</NumChip>, <NumChip>{fmtNum(c.top)}</NumChip>, q]
            : [
                <Inp value={bottoms[i]!} onChange={(v) => setBottom(i, v)} disabled={disabled} color={color} label={`Dividende colonne ${letter}`} />,
                <Inp value={tops[i]!} onChange={(v) => setTop(i, v)} disabled={disabled} color={color} label={`Diviseur colonne ${letter}`} />,
                q,
              ];
          return <CalcRow key={i} letter={letter} color={color} parts={parts} status={disabled ? rowOk(i) : null} />;
        })}
      </div>

      <VerdictPicker
        question="Ce tableau est-il un tableau de proportionnalité ?"
        choice={choice}
        onChoose={setChoice}
        disabled={disabled}
        expected={exercise.isProportional}
      />
      <CardFooter
        disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && missing}
        missingText="Complète toutes les cases et réponds Oui ou Non."
      />
      <QuotientCorrection
        color={theme.color}
        intro="On divise chaque nombre de la 2ᵉ ligne par le nombre de la 1ʳᵉ ligne situé au-dessus :"
        lines={cols.map((c, i) => ({ letter: COL_LETTERS[i]!, color: COL_COLORS[i]!, bottom: c.bottom, top: c.top, q: c.quotient }))}
        flags={flags}
        isProportional={exercise.isProportional}
        noun="tableau"
      />
    </CardShell>
  );
}

function ProblemQuestion({ index, exercise, theme, answer, onSubmit }: {
  index: number;
  exercise: ProporProblemExercise;
  theme: CardTheme;
  answer: AnswerState;
  onSubmit: (ok: boolean) => void;
}) {
  const [bottoms, setBottom] = useStringArray(2);
  const [tops, setTop] = useStringArray(2);
  const [quots, setQuot] = useStringArray(2);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [tried, setTried] = useState(false);
  const disabled = answer.status !== 'pending';

  const names = [exercise.item1Name, exercise.item2Name];
  const qtys = [exercise.qty1, exercise.qty2];
  const values = [exercise.value1, exercise.value2];
  const quotients = [exercise.quotient1, exercise.quotient2];
  const colors = [COL_COLORS[0], COL_COLORS[1]];
  const letters = ['1', '2'];

  const rowOk = (i: number) =>
    checkQuotient(bottoms[i]!, values[i]!) && checkQuotient(tops[i]!, qtys[i]!) && checkQuotient(quots[i]!, quotients[i]!);
  const missing = bottoms.some(isBlank) || tops.some(isBlank) || quots.some(isBlank) || choice === null;

  const submit = () => {
    if (disabled) return;
    if (missing) { setTried(true); return; }
    onSubmit(rowOk(0) && rowOk(1) && choice === exercise.isProportional);
  };

  const flags = quotientFlags(quotients, exercise.isProportional);

  return (
    <CardShell index={index} theme={theme} status={answer.status}>
      <Scene theme={theme} tip={<Tip color={C.blue}>🧮 Calculatrice autorisée</Tip>}>{exercise.context}</Scene>

      <PvTable
        colHeaders={names}
        rowLabels={[exercise.qtyLabel, exercise.valueLabel]}
        rows={[qtys, values]}
        colColors={colors}
        quotients={disabled ? { values: quotients, flags } : undefined}
      />

      <SectionLabel color={theme.color}>
        ✏️ Complète chaque division ({exercise.valueLabel.toLowerCase()} : {exercise.qtyLabel.toLowerCase()})
      </SectionLabel>
      <div className="pv-calcs">
        {names.map((name, i) => {
          const color = colors[i]!;
          return (
            <CalcRow
              key={i}
              letter={letters[i]!}
              color={color}
              label={name}
              status={disabled ? rowOk(i) : null}
              parts={[
                <Inp value={bottoms[i]!} onChange={(v) => setBottom(i, v)} disabled={disabled} color={color} label={`Dividende ${name}`} />,
                <Inp value={tops[i]!} onChange={(v) => setTop(i, v)} disabled={disabled} color={color} label={`Diviseur ${name}`} />,
                <Inp value={quots[i]!} onChange={(v) => setQuot(i, v)} disabled={disabled} color={color} label={`Quotient ${name}`} />,
              ]}
            />
          );
        })}
      </div>

      <VerdictPicker
        question="Est-ce une situation de proportionnalité ?"
        choice={choice}
        onChoose={setChoice}
        disabled={disabled}
        expected={exercise.isProportional}
      />
      <CardFooter
        disabled={disabled} status={answer.status} color={theme.color} onValidate={submit} showMissing={tried && missing}
        missingText="Complète toutes les cases et réponds Oui ou Non."
      />
      <QuotientCorrection
        color={theme.color}
        intro={`On divise ${exercise.valueLabel.toLowerCase()} par ${exercise.qtyLabel.toLowerCase()} pour chaque colonne :`}
        lines={names.map((name, i) => ({ letter: letters[i]!, color: colors[i]!, label: name, bottom: values[i]!, top: qtys[i]!, q: quotients[i]! }))}
        flags={flags}
        isProportional={exercise.isProportional}
        noun="situation"
      />
    </CardShell>
  );
}

// ── Hero illustration ─────────────────────────────────────────────────────────

function HeroExample() {
  const x0 = 20, colW = 90, rowH = 46, y0 = 16;
  const tops = [2, 5, 8];
  const bottoms = [6, 15, 24];
  return (
    <svg viewBox="0 0 420 212" width="100%" role="img" aria-label="Exemple : tableau 2, 5, 8 / 6, 15, 24 ; on multiplie par 3">
      <defs>
        <marker id="pv-arrowhead" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.orange} />
        </marker>
      </defs>
      {[tops, bottoms].map((row, r) =>
        row.map((v, i) => (
          <g key={`${r}-${i}`}>
            <rect
              x={x0 + i * colW} y={y0 + r * rowH} width={colW} height={rowH}
              fill={COL_COLORS[i]} fillOpacity={r === 0 ? 0.14 : 0.24}
              style={{ stroke: 'var(--border2)' }} strokeWidth={1.5}
            />
            <text
              x={x0 + i * colW + colW / 2} y={y0 + r * rowH + rowH / 2 + 7} textAnchor="middle"
              style={{ fill: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500 }}
            >
              {v}
            </text>
          </g>
        )),
      )}
      <path d="M 298 34 C 350 38, 350 90, 302 96" fill="none" stroke={C.orange} strokeWidth={2.5} markerEnd="url(#pv-arrowhead)" />
      <text x={356} y={72} style={{ fill: C.orange, fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700 }}>× 3</text>
      {tops.map((t, i) => (
        <text
          key={i} x={x0 + i * colW + colW / 2} y={138} textAnchor="middle"
          style={{ fill: COL_COLORS[i], fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500 }}
        >
          {bottoms[i]} : {t} = 3
        </text>
      ))}
      <rect x={30} y={160} width={250} height={32} rx={16} fill={C.green} fillOpacity={0.16} />
      <text x={155} y={181} textAnchor="middle" style={{ fill: C.green, fontSize: 13, fontWeight: 700 }}>
        ✓ Tous égaux → proportionnalité
      </text>
    </svg>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ProportionnaliteReconnaitreVivid({ accent, onBack }: {
  accent: string;
  accentSecondary?: string;
  onBack: () => void;
}) {
  return (
    <VividPage<VividExercise>
      accent={accent}
      hero={
        <VividHero
          onBack={onBack}
          crumbs={[{ label: 'Reconnaître', color: C.green }, { label: '▦ Avec tableau', color: C.blue }]}
          title="Comment reconnaître un tableau de proportionnalité ?"
          intro={
            <>
              Un tableau est un tableau de <strong>proportionnalité</strong> lorsqu'on passe de la 1ʳᵉ ligne à la 2ᵉ ligne
              en multipliant toujours par <strong>le même nombre</strong>. Ce nombre s'appelle le{' '}
              <strong style={{ color: C.orange }}>coefficient de proportionnalité</strong>.
            </>
          }
          steps={[
            { emoji: '👀', color: C.blue, text: <>Repère les <strong>deux lignes</strong> du tableau.</> },
            { emoji: '➗', color: C.orange, text: <>Divise chaque nombre de la <strong>2ᵉ ligne</strong> par celui de la <strong>1ʳᵉ ligne</strong>.</> },
            { emoji: '⚖️', color: C.green, text: <>Si tous les quotients sont <strong>égaux</strong>, c'est un tableau de proportionnalité !</> },
          ]}
          videos={[{ url: 'https://www.youtube.com/watch?v=O7oU-J1OqCw', label: 'Vidéo : reconnaître un tableau de proportionnalité' }]}
          illusTitle="✨ Exemple"
          illus={<HeroExample />}
        />
      }
      tip={{
        emoji: '🧠', title: 'Le savais-tu ?',
        text: <>Il suffit d'<strong>un seul</strong> quotient différent des autres pour que le tableau ne soit <strong>pas</strong> un tableau de proportionnalité.</>,
      }}
      build={buildExercises}
      themeFor={themeFor}
      renderCard={(ex, i, p) =>
        ex.exKind === 'problem'
          ? <ProblemQuestion index={i} exercise={ex.data} {...p} />
          : <TableQuestion index={i} exercise={ex.data} prefilled={ex.exKind === 'table-prefilled'} {...p} />
      }
    />
  );
}
