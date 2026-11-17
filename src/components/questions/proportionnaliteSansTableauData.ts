import { fmtNum } from './ProportionnaliteHub';

/** Generators for the 6ème « sans tableau » exercises (pure data, no React). */

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const round2 = (n: number) => Math.round(n * 100) / 100;

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ── Reconnaître sans tableau : situations en contexte ───────────────────────────

export interface SituationResult {
  text: string;
  isProportional: boolean;
  justification: string;
}

const VEHICULES = [
  { name: 'une voiture', pronoun: 'elle' },
  { name: 'une moto', pronoun: 'elle' },
  { name: 'un camion', pronoun: 'il' },
  { name: 'un bus', pronoun: 'il' },
] as const;

const PRODUITS_MASSE = ['pommes', 'bananes', 'tomates', 'clous', 'bonbons', 'noisettes'] as const;

const OBJETS_IDENTIQUES = [
  { plural: 'pommes', singular: "d'une pomme" },
  { plural: 'œufs', singular: "d'un œuf" },
  { plural: 'briques', singular: "d'une brique" },
  { plural: 'livres', singular: "d'un livre" },
] as const;

const PRENOMS = ['Théo', 'Léa', 'Sacha', 'Nina', 'Milo', 'Sarah', 'Tom', 'Inès', 'Lucas'] as const;

const TRUE_SITUATION_TEMPLATES: (() => SituationResult)[] = [
  () => {
    const v = pick(VEHICULES);
    return {
      text: `La consommation de carburant de ${v.name} en fonction du nombre de kilomètres parcourus, sachant qu'${v.pronoun} roule à vitesse constante.`,
      isProportional: true,
      justification: "À vitesse constante, la quantité de carburant consommée par kilomètre est toujours la même : la consommation est proportionnelle à la distance parcourue.",
    };
  },
  () => {
    const produit = pick(PRODUITS_MASSE);
    const prixKg = pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
    return {
      text: `Le prix de ${produit} en fonction de leur masse, sachant que le kilogramme coûte ${fmtNum(prixKg)} €.`,
      isProportional: true,
      justification: `Le prix s'obtient en multipliant la masse par le prix au kilogramme (${fmtNum(prixKg)} €) : ces deux grandeurs sont proportionnelles.`,
    };
  },
  () => ({
    text: "La quantité d'eau qui coule d'un robinet ouvert à débit constant, en fonction du temps écoulé.",
    isProportional: true,
    justification: "À débit constant, la quantité d'eau qui s'écoule chaque minute est toujours la même : la quantité d'eau est proportionnelle au temps écoulé.",
  }),
  () => {
    const prixBillet = pick([8, 9, 10, 12, 15, 18, 20]);
    return {
      text: `Le prix payé pour des billets de train achetés à l'unité, en fonction du nombre de billets, sachant qu'un billet coûte ${fmtNum(prixBillet)} €.`,
      isProportional: true,
      justification: `Le prix s'obtient en multipliant le nombre de billets par le prix d'un billet (${fmtNum(prixBillet)} €) : ces deux grandeurs sont proportionnelles.`,
    };
  },
  () => {
    const o = pick(OBJETS_IDENTIQUES);
    const masse = pick([50, 60, 80, 100, 120, 150, 200, 250]);
    return {
      text: `La masse totale de ${o.plural} en fonction du nombre de ${o.plural}, sachant que chacun pèse ${masse} g.`,
      isProportional: true,
      justification: `La masse totale s'obtient en multipliant le nombre de ${o.plural} par ${masse} g (la masse ${o.singular}) : ces deux grandeurs sont proportionnelles.`,
    };
  },
  () => ({
    text: "Le périmètre d'un carré en fonction de la longueur de son côté.",
    isProportional: true,
    justification: "Le périmètre s'obtient en multipliant la longueur du côté par 4 (nombre fixe) : ces deux grandeurs sont proportionnelles.",
  }),
];

const FALSE_SITUATION_TEMPLATES: (() => SituationResult)[] = [
  () => ({
    text: "L'âge du père en fonction de l'âge du fils.",
    isProportional: false,
    justification: "C'est l'écart d'âge entre le père et le fils qui reste constant (pas leur rapport) : ces deux grandeurs ne sont pas proportionnelles.",
  }),
  () => {
    const grandeur = pick(['poids', 'taille'] as const);
    const prenom = pick(PRENOMS);
    return {
      text: `Le ${grandeur} de ${prenom} en fonction de son âge.`,
      isProportional: false,
      justification: `La croissance n'est pas régulière : on n'obtient pas le ${grandeur} en multipliant l'âge par un nombre fixe. Ces deux grandeurs ne sont pas proportionnelles.`,
    };
  },
  () => {
    const priseEnCharge = pick([2, 3, 4, 5]);
    const tarifKm = pick([1, 1.2, 1.5]);
    return {
      text: `Le prix à payer pour un trajet de taxi en fonction de la distance parcourue, sachant qu'il y a une prise en charge fixe de ${fmtNum(priseEnCharge)} € en plus de ${fmtNum(tarifKm)} € par kilomètre.`,
      isProportional: false,
      justification: `À cause de la prise en charge fixe de ${fmtNum(priseEnCharge)} €, le prix n'est pas obtenu en multipliant la distance par un nombre fixe (une distance nulle coûterait quand même ${fmtNum(priseEnCharge)} €). Ces deux grandeurs ne sont pas proportionnelles.`,
    };
  },
  () => ({
    text: "L'aire d'un carré en fonction de la longueur de son côté.",
    isProportional: false,
    justification: "L'aire s'obtient en multipliant la longueur du côté par elle-même, et non par un nombre fixe : ces deux grandeurs ne sont pas proportionnelles.",
  }),
  () => {
    const frais = pick([10, 15, 20, 25, 30]);
    const tarifMensuel = pick([15, 20, 25, 30]);
    return {
      text: `Le prix total d'un abonnement à une salle de sport en fonction du nombre de mois, sachant qu'il y a des frais d'inscription fixes de ${fmtNum(frais)} € en plus du tarif mensuel de ${fmtNum(tarifMensuel)} €.`,
      isProportional: false,
      justification: `À cause des frais d'inscription fixes de ${fmtNum(frais)} €, le prix total n'est pas obtenu en multipliant le nombre de mois par un nombre fixe. Ces deux grandeurs ne sont pas proportionnelles.`,
    };
  },
  () => {
    const prenom = pick(PRENOMS);
    return {
      text: `Le temps mis par ${prenom} pour lire un livre en fonction du nombre de pages, sachant que sa vitesse de lecture ralentit au fil des pages.`,
      isProportional: false,
      justification: "Comme la vitesse de lecture n'est pas constante, le temps de lecture n'augmente pas toujours du même facteur que le nombre de pages. Ces deux grandeurs ne sont pas proportionnelles.",
    };
  },
];

export interface SituationsExercise {
  situations: SituationResult[];
}

/** Uses every template exactly once (6 true + 6 false), so the merged list is wide-ranging with no duplicate situation. */
export function generateSituationsExercise(): SituationsExercise {
  const trueOnes = TRUE_SITUATION_TEMPLATES.map((fn) => fn());
  const falseOnes = FALSE_SITUATION_TEMPLATES.map((fn) => fn());
  return { situations: shuffle([...trueOnes, ...falseOnes]) };
}

// ── Utiliser sans tableau : rythme/débit simple (1 blanc) ───────────────────────

interface SimpleRateTemplate {
  text: (rate: number, n: number) => string;
  rateChoices: readonly number[];
  nRange: [number, number];
  unit: string;
}

const SIMPLE_RATE_TEMPLATES: SimpleRateTemplate[] = [
  { text: (r, n) => `Sarah boit ${fmtNum(r)} L d'eau par jour. Combien d'eau boit-elle en ${n} jours ?`, rateChoices: [1.5, 2, 2.5], nRange: [3, 10], unit: 'L' },
  { text: (r, n) => `Un robinet verse ${fmtNum(r)} L d'eau par minute. Quelle quantité d'eau coule-t-il en ${n} minutes ?`, rateChoices: [3, 4, 5, 6], nRange: [4, 15], unit: 'L' },
  { text: (r, n) => `Un cycliste roule à ${fmtNum(r)} km/h. Quelle distance parcourt-il en ${n} heures ?`, rateChoices: [15, 18, 20, 22, 25], nRange: [2, 6], unit: 'km' },
  { text: (r, n) => `Une machine produit ${fmtNum(r)} pièces par minute. Combien de pièces produit-elle en ${n} minutes ?`, rateChoices: [8, 10, 12, 15], nRange: [5, 20], unit: 'pièces' },
  { text: (r, n) => `Un arbuste grandit de ${fmtNum(r)} cm par mois. De combien grandit-il en ${n} mois ?`, rateChoices: [2, 3, 4, 5], nRange: [4, 12], unit: 'cm' },
];

export interface SimpleRateExercise {
  text: string;
  answer: number;
  unit: string;
}

export function generateSimpleRateExercise(): SimpleRateExercise {
  const tpl = pick(SIMPLE_RATE_TEMPLATES);
  const rate = pick(tpl.rateChoices);
  const n = randInt(tpl.nRange[0], tpl.nRange[1]);
  return { text: tpl.text(rate, n), answer: round2(rate * n), unit: tpl.unit };
}

// ── Utiliser sans tableau : rythme double (achat/vente, 2 blancs) ───────────────

interface DoubleRateTemplate {
  context: (rate: number) => string;
  questionA: (qa: number) => string;
  questionB: (amount: number) => string;
  rateChoices: readonly number[];
  qaRange: [number, number];
  qbRange: [number, number];
  unitA: string;
  unitB: string;
}

const DOUBLE_RATE_TEMPLATES: DoubleRateTemplate[] = [
  {
    context: (r) => `Le prix du kilogramme de girolles est de ${fmtNum(r)} €.`,
    questionA: (qa) => `a. Combien coûtent ${qa} kg de girolles ?`,
    questionB: (amount) => `b. Quelle quantité de girolles peut-on acheter avec ${fmtNum(amount)} € ?`,
    rateChoices: [12, 15, 18, 20, 22, 25], qaRange: [2, 6], qbRange: [3, 9], unitA: '€', unitB: 'kg',
  },
  {
    context: (r) => `Le prix du kilogramme de cerises est de ${fmtNum(r)} €.`,
    questionA: (qa) => `a. Combien coûtent ${qa} kg de cerises ?`,
    questionB: (amount) => `b. Quelle quantité de cerises peut-on acheter avec ${fmtNum(amount)} € ?`,
    rateChoices: [6, 7, 8, 9, 10], qaRange: [2, 6], qbRange: [3, 9], unitA: '€', unitB: 'kg',
  },
  {
    context: (r) => `Avec 2 L de peinture, on peint ${fmtNum(r)} m².`,
    questionA: (qa) => `a. Quelle surface peint-on avec ${qa} L de peinture ?`,
    questionB: (amount) => `b. Quelle quantité de peinture faut-il pour peindre ${fmtNum(amount)} m² ?`,
    rateChoices: [10, 12.5, 15, 20], qaRange: [3, 10], qbRange: [3, 9], unitA: 'm²', unitB: 'L',
  },
  {
    context: (r) => `Un photocopieur facture ${fmtNum(r)} € pour 100 photocopies.`,
    questionA: (qa) => `a. Combien facture-t-il pour ${qa * 100} photocopies ?`,
    questionB: (amount) => `b. Combien de photocopies peut-on obtenir pour ${fmtNum(amount)} € ?`,
    rateChoices: [4, 5, 6, 8], qaRange: [2, 6], qbRange: [3, 9], unitA: '€', unitB: 'photocopies',
  },
];

export interface DoubleRateExercise {
  context: string;
  qaText: string;
  qbText: string;
  answerA: number;
  answerB: number;
  unitA: string;
  unitB: string;
  rate: number;
  qa: number;
  qb: number;
  amount: number;
}

export function generateDoubleRateExercise(): DoubleRateExercise {
  const tpl = pick(DOUBLE_RATE_TEMPLATES);
  const rate = pick(tpl.rateChoices);
  const qa = randInt(tpl.qaRange[0], tpl.qaRange[1]);
  let qb = randInt(tpl.qbRange[0], tpl.qbRange[1]);
  while (qb === qa) qb = randInt(tpl.qbRange[0], tpl.qbRange[1]);
  const amount = round2(rate * qb);
  return {
    context: tpl.context(rate),
    qaText: tpl.questionA(qa),
    qbText: tpl.questionB(amount),
    answerA: round2(rate * qa),
    answerB: qb,
    unitA: tpl.unitA, unitB: tpl.unitB,
    rate, qa, qb, amount,
  };
}

// ── Utiliser sans tableau : linéarité (+, -, ×, unité) ──────────────────────────

const LINEARITE_CONTEXTS = [
  { plural: 'rouleaux de ruban adhésif', singular: 'rouleau de ruban adhésif' },
  { plural: 'paquets de gâteaux', singular: 'paquet de gâteaux' },
  { plural: 'tickets de bus', singular: 'ticket de bus' },
  { plural: 'sachets de graines', singular: 'sachet de graines' },
] as const;

const LINEARITE_UNIT_PRICES = [0.8, 1, 1.2, 1.5, 1.8, 2, 2.4, 2.5, 3] as const;

export interface LineariteExercise {
  plural: string;
  singular: string;
  sizeA: number;
  priceA: number;
  sizeB: number;
  priceB: number;
  unitPrice: number;
  sumQty: number;
  sumPrice: number;
  diffQty: number;
  diffPrice: number;
  multFactor: number;
  multQty: number;
  multPrice: number;
}

export function generateLineariteExercise(): LineariteExercise {
  const ctx = pick(LINEARITE_CONTEXTS);
  const unitPrice = pick(LINEARITE_UNIT_PRICES);
  const sizeA = randInt(3, 8);
  const sizeB = randInt(sizeA + 2, sizeA + 10);
  const priceA = round2(sizeA * unitPrice);
  const priceB = round2(sizeB * unitPrice);
  const multFactor = randInt(6, 15);
  return {
    plural: ctx.plural, singular: ctx.singular,
    sizeA, priceA, sizeB, priceB, unitPrice,
    sumQty: sizeA + sizeB, sumPrice: round2(priceA + priceB),
    diffQty: sizeB - sizeA, diffPrice: round2(priceB - priceA),
    multFactor, multQty: sizeA * multFactor, multPrice: round2(priceA * multFactor),
  };
}
