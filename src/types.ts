export type SchoolLevel = '6eme' | '5eme' | '4eme' | '3eme' | '2nde' | '1ere' | 'terminale';

export type ExerciseCategory = 'add' | 'sub' | 'mul' | 'div' | 'default';

export interface BaseExercise {
  type: ExerciseCategory;
  hint?: string;
}

export interface NumberExercise extends BaseExercise {
  expr: string;
  ans: number;
  steps?: string;
}

export type RoundingType = 'dix' | 'cent' | 'mill';

export interface RoundingExercise extends BaseExercise {
  num: number;
  numStr: string;
  decimals: number;
  posType: RoundingType;
  posLabel: string;
  ans: number;
  ansStr: string;
  isTrap: boolean;
  explain: string;
  color: string;
}

export type LiteralSubtype = 'reduce' | 'develop' | 'factor' | 'reduce_paren' | 'substitute' | 'complex' | 'scientific';

export interface LiteralExercise extends BaseExercise {
  subtype: LiteralSubtype;
  label: string;
  /** HTML-allowed expression to display in the question card. */
  expr: string;
  /** Expected answer string (or numeric string when `isNum` is true). */
  ans: string;
  /** HTML-allowed step-by-step explanation rendered inside the hint box. */
  steps: string;
  /** When true, compare student input as a number (with tolerance) rather than as a normalized expression. */
  isNum: boolean;
  color: string;
}

export interface ProduitExercise extends BaseExercise {
  label: string;
  /** HTML-allowed question text. */
  question: string;
  /** Inline SVG markup (raw). */
  svg: string;
  /** One-line hint shown above the input ("💡 Indice : ..."). */
  hintLine: string;
  ans: string;
  /** HTML-allowed step-by-step explanation rendered inside the hint box. */
  steps: string;
  color: string;
}

export type ArithSubtype = 'divisors' | 'criteria' | 'multiples' | 'spotnonprime' | 'decompo' | 'pgcd';

export interface ArithExercise extends BaseExercise {
  subtype: ArithSubtype;
  label: string;
  color: string;
  /** HTML-allowed step-by-step explanation. */
  steps: string;
  // Common (some subtypes don't use)
  question?: string;
  placeholder?: string;
  // divisors
  n?: number;
  divs?: number[];
  // multiples
  k?: number;
  low?: number;
  high?: number;
  mults?: number[];
  // criteria
  by2?: boolean;
  by3?: boolean;
  by5?: boolean;
  by9?: boolean;
  by10?: boolean;
  // spotnonprime
  list?: number[];
  nonPrimes?: number[];
  // decompo
  nums?: { n: number; factors: number[] }[];
  nFactors?: number;
  // pgcd
  N?: number;
  M?: number;
  g?: number;
  gDivs?: number[];
  fnN?: string;
  fnM?: string;
  ctx?: { obj1: string; obj2: string; context: string; unit: string; unitP: string };
  unitLabel?: string;
  unitLabelP?: string;
}

export interface ProgrammeExercise extends BaseExercise {
  /** Step-by-step instructions describing the program (HTML allowed). */
  instr: string[];
  val1: number;
  val2: number;
  ansA: number;
  ansB: number;
  ansC: string;
  stepsA: string;
  stepsB: string;
  stepsC: string;
  /** Extra observation banner (e.g. "le résultat est constant"). */
  obs: string;
  isConstant: boolean;
}

export interface PythagoreCompleterConfig {
  tri: string;
  rightAt: string;
  hyp: string;
  leg1: string;
  leg2: string;
  decimal: boolean;
  find: 'hyp' | 'leg';
  ans: number;
  v1?: number;
  v2?: number;
  sq1: number;
  sq2: number;
  sqSum?: number;
  givenHyp?: number;
  givenLeg?: number;
  unknownLeg?: string;
  sqDiff?: number;
}

export interface PythagoreRegularExercise extends BaseExercise {
  pythType: 'regular';
  text: string;
  figure: string | null;
  corrFig: string | null;
  given: string;
  askLabel: string;
  unit: string;
  steps: { eq: string }[];
  decimal: boolean;
  ans: number;
}

export interface PythagoreCompleterExercise extends BaseExercise {
  pythType: 'completer';
  cfg: PythagoreCompleterConfig;
  fig: string;
  variant: 0 | 1;
  ans: number;
}

export type PythagoreExercise = PythagoreRegularExercise | PythagoreCompleterExercise;

export interface ThalesCompleterConfig {
  letters: { apex: string; bl: string; br: string; ml: string; mr: string };
  ratio: number;
  known: Record<string, number>;
  find: [string, string];
  answers: Record<string, number>;
  bigTri: string;
  ptOnLeft: { pt: string; seg: string };
  ptOnRight: { pt: string; seg: string };
  parallelSeg: string;
  parallelTo: string;
  ratioExpr: string;
  numericRatio: string;
  calc1: { unknown: string; ratioUsed: string; s1: string; s2: string; s3: string; result: string };
  calc2: { unknown: string; ratioUsed: string; s1: string; s2: string; s3: string; result: string };
}

export interface ThalesCalcExercise extends BaseExercise {
  thType: 'calc';
  fig: string;
  textParts: string[];
  steps: { eq: string }[];
  ans: number;
  askLabel: string;
  unit: string;
  isDecimal: boolean;
  decHint: string;
}

export interface ThalesCompleterExercise extends BaseExercise {
  thType: 'completer';
  fig: string;
  cfg: ThalesCompleterConfig;
}

export type ThalesExercise = ThalesCalcExercise | ThalesCompleterExercise;

export type FractionOp = 'add' | 'sub' | 'mul' | 'div';

export interface FractionExercise extends BaseExercise {
  op: FractionOp;
  label: string;
  /** HTML-allowed expression (often containing `<span class="frac">…</span>`). */
  expr: string;
  /** Answer as { n, d } — may be unsimplified. */
  ans: { n: number; d: number };
  /** When true, render single integer input rather than fraction input. */
  isInteger?: boolean;
  /** HTML-allowed step-by-step. */
  steps: string;
  /** Override the per-op accent (used by fractions-complex which uses a single c6 accent for all cards). */
  accentOverride?: string;
}

export interface ReciproqueTableExercise extends BaseExercise {
  rpType: 'table';
  selected: { sides: [number, number, number]; isRect: boolean }[];
  /** HTML correction rows for the steps box. */
  steps: string;
}

export interface ReciproqueDemoExercise extends BaseExercise {
  rpType: 'redemo';
  isRect: boolean;
  letters: [string, string, string];
  P: string;
  Q: string;
  R: string;
  a: number;
  b: number;
  c: number;
  rightVertex: string | null;
  sq1: number;
  sq2a: number;
  sq2b: number;
  sum: number;
  svg: string;
  label: string;
}

export type ReciproqueExercise = ReciproqueTableExercise | ReciproqueDemoExercise;

export type EqType = 't1' | 't2' | 't3' | 't4';

export interface EquationExercise extends BaseExercise {
  eqType: EqType;
  label: string;
  expr: string;
  ans: number;
  steps: { label: string; eq: string }[];
}

export type FractionsCompSubtype = 'comp' | 'simpl' | 'prime';

export interface FractionsCompExercise extends BaseExercise {
  subtype: FractionsCompSubtype;
  label: string;
  steps: string;
  // comp
  a?: number;
  b?: number;
  c?: number;
  d?: number;
  sign?: string;
  // simpl + prime: ans = simplified target
  n?: number;
  ans?: { n: number; d: number };
  // prime: required factor strings
  fnStr?: string;
  fdStr?: string;
  ansNStr?: string;
  ansDStr?: string;
}

export type PuissancesSubtype = 'power' | 'scientific' | 'exponent';

export interface PuissancesExercise extends BaseExercise {
  subtype: PuissancesSubtype;
  /** HTML question text shown to the student. */
  question: string;
  /** HTML step-by-step correction. */
  steps: string;
  color: string;
  /**
   * For 'power': the numeric result.
   * For 'exponent': the exponent integer.
   * For 'scientific': the exponent (n in a × 10ⁿ).
   */
  ans: number;
  /** For 'scientific' only: the mantissa (a in a × 10ⁿ, 1 ≤ a < 10). */
  ansMantissa?: number;
}

export type PropSubtype = 'table4' | 'check23' | 'problem' | 'graph';

export interface PropExercise extends BaseExercise {
  subtype: PropSubtype;
  steps: string;
  color: string;
  // ── table4: tableau 2×2, trouver la valeur manquante ──────────────────
  t4Row1Label?: string;
  t4Row2Label?: string;
  t4Row1?: [number | null, number | null];
  t4Row2?: [number | null, number | null];
  t4Ans?: number;
  t4Round?: boolean;
  // ── check23: tableau 2×3, ce tableau est-il de proportionnalité ? ─────
  c23Row1Label?: string;
  c23Row2Label?: string;
  c23Row1?: [number, number, number];
  c23Row2?: [number, number, number];
  c23IsProp?: boolean;
  // ── problem: problème concret (tableau + produit en croix) ─────────────
  probStory?: string;
  probRow1Label?: string;
  probRow2Label?: string;
  probRow1?: (number | null)[];
  probRow2?: (number | null)[];
  probColLabels?: string[];
  probAns?: number;
  // ── graph: nuage de points, proportionnalité ? ─────────────────────────
  graphSvg?: string;
  graphIsProp?: boolean;
  // ── problem option: show "......" for known cells (student fills by hand) ─
  probDotted?: boolean;
}

export type Exercise =
  | NumberExercise
  | RoundingExercise
  | LiteralExercise
  | ProduitExercise
  | ArithExercise
  | ProgrammeExercise
  | PythagoreExercise
  | ThalesExercise
  | FractionExercise
  | FractionsCompExercise
  | EquationExercise
  | ReciproqueExercise
  | PuissancesExercise
  | PropExercise;

export type RendererKind = 'number' | 'rounding' | 'literal' | 'produit' | 'arith' | 'programme' | 'pythagore' | 'thales' | 'fractions' | 'fractions-comp' | 'equation' | 'reciproque' | 'puissances' | 'prop';

export type IntegerOp = 'add' | 'sub' | 'mul';

export interface IntegerSeriesSpec {
  kind: 'integer';
  op: IntegerOp;
  count: number;
  range: [number, number];
}

export interface RoundingSeriesSpec {
  kind: 'rounding';
  type: RoundingType;
  count: number;
  trapCount: number;
}

/** Single spec covering the entire literal-calculus question set (25 questions across 5 sub-types). */
export interface LiteralSeriesSpec {
  kind: 'literal';
}

/** Shuffles the litteral-complex hand-curated bank and picks 10. */
export interface LiteralComplexSeriesSpec {
  kind: 'literal-complex';
}

/** Shuffles the produit hand-curated bank and picks 10. */
export interface ProduitSeriesSpec {
  kind: 'produit';
}

/** Generates the arithmetic 11-question set (mixed sub-types). */
export interface ArithSeriesSpec {
  kind: 'arith';
}

/** Picks 2 non-constant + 1 constant program from the 6-program bank. */
export interface ProgrammeSeriesSpec {
  kind: 'programme';
}

/** Generates the Pythagore 7-question set (3 with figure + 3 calculs + 1 completer). */
export interface PythagoreSeriesSpec {
  kind: 'pythagore';
}

/** Generates the Thalès 6-question set (4 calc + 2 completer). */
export interface ThalesSeriesSpec {
  kind: 'thales';
}

/** Generates the Fractions 21-question set (4 add, 4 sub, 6 mul, 4 div + 4 negative variants). */
export interface FractionsSeriesSpec {
  kind: 'fractions';
}

/** Generates the Fractions: comparaisons & simplification 11-question set. */
export interface FractionsCompSeriesSpec {
  kind: 'fractions-comp';
}

/** Shuffles the fractions-complex hand-curated 12-question bank and picks 10. */
export interface FractionsComplexSeriesSpec {
  kind: 'fractions-complex';
}

/** Generates the Équations 20-question set (5 of each type T1..T4). */
export interface EquationsSeriesSpec {
  kind: 'equations';
}

/** Generates the Réciproque de Pythagore 3-question set (table + 2 demonstrations). */
export interface ReciproqueSeriesSpec {
  kind: 'reciproque';
}

/** Generates a Puissances et écritures scientifiques set (4 power + 4 scientific + 2 exponent). */
export interface PuissancesSeriesSpec {
  kind: 'puissances';
}

/** Generates a Proportionnalité set (4 table4 + 2 check23 + 1 problem + 3 graphs). */
export interface PropSeriesSpec {
  kind: 'prop';
}

/** Shuffles the entiers-complex bank and picks 10 complex multi-operation exercises. */
export interface EntierComplexSeriesSpec {
  kind: 'entiers-complex';
}

export type GeneratorSpec =
  | IntegerSeriesSpec
  | RoundingSeriesSpec
  | LiteralSeriesSpec
  | LiteralComplexSeriesSpec
  | ProduitSeriesSpec
  | ArithSeriesSpec
  | ProgrammeSeriesSpec
  | PythagoreSeriesSpec
  | ThalesSeriesSpec
  | FractionsSeriesSpec
  | FractionsCompSeriesSpec
  | FractionsComplexSeriesSpec
  | EquationsSeriesSpec
  | ReciproqueSeriesSpec
  | PuissancesSeriesSpec
  | PropSeriesSpec
  | EntierComplexSeriesSpec;

export interface TopicCardBase {
  id: string;
  title: string;
  /** Optional short title for the topic grid card (when the page title is longer). */
  cardTitle?: string;
  category: 'Calcul' | 'Géométrie' | 'Algèbre';
  accent: string;
  icon: string;
  description: string;
  tags: string[];
}

export interface TopicStub extends TopicCardBase {
  available: false;
}

export interface QuizDefinition<E extends Exercise = Exercise> extends TopicCardBase {
  available: true;
  /** Hidden quizzes don't appear on the topic grid but still get a route (used for sub-quizzes). */
  hidden?: boolean;
  /** Parent topic id — when set, the breadcrumb on the quiz page shows `/ Parent / Self`. */
  parent?: string;
  /** Optional suffix of `title` rendered in muted color (gradient applies to the prefix). */
  titleSub?: string;
  subtitle?: string;
  /** Secondary accent. Used as the second stop of the progress-bar gradient. */
  accentSecondary?: string;
  /** Override for `.types-row` margin-bottom (default `2.5rem`). Quizzes like Arrondis use `2rem`. */
  typePillsMarginBottom?: string;
  renderer: RendererKind;
  exercises: E[];
  generator?: GeneratorSpec[];
  /** Pill-shaped legend rendered just below the subtitle (one entry per exercise category). */
  typePills?: { label: string; color: string; type: ExerciseCategory }[];
  /** Extra accent-coloured buttons appended to the controls row (e.g. links to sub-quizzes). */
  extraControls?: { label: string; href: string; color?: string }[];
  /** Override the default `er-title` font-size clamp (used for Pythagore's slightly larger title). */
  titleFontSize?: string;
  /** Optional banner rendered between the header and the scoreboard (e.g. Pythagore's formula card). */
  formulaBanner?: { html: string; bannerStyle?: Record<string, string | number> };
}

export type Topic = TopicStub | QuizDefinition;

export interface LevelDefinition {
  id: SchoolLevel;
  label: string;
  shortLabel: string;
  description: string;
  available: boolean;
  topicsModule?: () => Promise<{ topics: Topic[] }>;
}
