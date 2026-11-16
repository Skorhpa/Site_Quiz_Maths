import { useEffect, useMemo, useRef, useState } from 'react';
import { ModeCard } from './FractionsHub';
import { ProportionnaliteModeContent } from './ProportionnaliteHub';
import { ProportionnaliteReconnaitreVivid } from './ProportionnaliteReconnaitreVivid';

type TopMode = 'reconnaitre' | 'utiliser' | null;
type SubMode = 'sans-tableau' | 'avec-tableau' | null;

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

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

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

const colTagStyle: React.CSSProperties = { fontSize: 11, padding: '3px 10px', borderRadius: 99, fontFamily: "'DM Mono', monospace" };
const blankInp: React.CSSProperties = {
  width: 64, fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
  padding: '5px 4px', borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--bg)', color: 'var(--text)', textAlign: 'center',
};

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

const yesNoBtnStyle = (active: boolean | null, target: boolean, disabled: boolean, accent: string, correctFlag?: boolean): React.CSSProperties => {
  const isSel = active === target;
  const correctnessColor = correctFlag !== undefined ? (target === correctFlag ? 'var(--correct)' : isSel ? 'var(--wrong)' : undefined) : undefined;
  return {
    padding: '6px 20px', fontSize: 14, borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
    border: `1px solid ${correctnessColor ?? (isSel ? accent : 'var(--border2)')}`,
    background: correctFlag !== undefined ? (target === correctFlag ? 'rgba(74,222,128,0.12)' : isSel ? 'rgba(248,113,113,0.12)' : 'var(--surface2)') : isSel ? `${accent}22` : 'var(--surface2)',
    color: correctnessColor ?? (isSel ? accent : 'var(--text)'),
    fontWeight: isSel ? 700 : 400,
  };
};

// ── Rappels ───────────────────────────────────────────────────────────────────

function RecallReconnaitreSansTableau({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)} style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}>
        <span>{open ? '▼' : '▶'}</span> Rappel — reconnaître la proportionnalité (sans tableau) + vidéo
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.9 }}>
        <p style={{ margin: '12px 0 8px' }}>
          Deux grandeurs sont <strong style={{ color: accent }}>proportionnelles</strong> si les valeurs de l'une s'obtiennent en
          multipliant les valeurs de l'autre par un même nombre.
        </p>
        <p style={{ margin: '0 0 6px' }}><strong>Exemple (situation de proportionnalité) :</strong></p>
        <p style={{ margin: '0 0 4px' }}>Des t-shirts sont vendus à l'unité. Un t-shirt coûte 11 €.</p>
        <p style={{ margin: '0 0 4px' }}>1 t-shirt → 11 € ; 2 t-shirts → 2 × 11 € = 22 € ; 3 t-shirts → 3 × 11 € = 33 €.</p>
        <p style={{ margin: '0 0 10px' }}>Le nombre de t-shirts achetés et le prix à payer sont deux grandeurs proportionnelles.</p>
        <p style={{ margin: '0 0 6px' }}><strong>Exemple (situation qui n'est pas proportionnelle) :</strong></p>
        <p style={{ margin: '0 0 4px' }}>Des stylos sont vendus 2,10 € à l'unité et 20 € le paquet de dix.</p>
        <p style={{ margin: '0 0 10px' }}>
          Si les deux grandeurs étaient proportionnelles, 10 stylos coûteraient 10 × 2,10 € = 21 €. Ce n'est pas le cas (ils coûtent
          20 €) : le prix et le nombre de stylos achetés ne sont pas proportionnels.
        </p>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/7DSHIDWM-ss" label="Reconnaître une situation de proportionnalité" />
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

function RecallUtiliserSansTableau({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" className="hint-toggle" onClick={() => setOpen((v) => !v)} style={{ color: accent, width: '100%', padding: '10px 16px', textAlign: 'left' }}>
        <span>{open ? '▼' : '▶'}</span> Rappel — utiliser la proportionnalité (sans tableau) + vidéos
      </button>
      <div className={`steps-box${open ? ' open' : ''}`} style={{ padding: '0 16px', fontSize: 13, lineHeight: 1.8 }}>
        <p style={{ margin: '12px 0 8px' }}>
          Violette achète 6 effaceurs tous identiques et au même prix. Elle a payé 9 €. Le prix est proportionnel au nombre
          d'effaceurs achetés.
        </p>
        <div style={{ margin: '12px 0' }}>
          <MethodBlock number={1} title="Multiplication ou division">
            <p style={{ margin: 0 }}>Tristan achète 3 effaceurs (moitié moins que 6). 9 ÷ 2 = 4,50 €.</p>
          </MethodBlock>
          <MethodBlock number={2} title="Linéarité (addition ou soustraction)">
            <p style={{ margin: 0 }}>Dorian achète 9 effaceurs : 6 effaceurs + 3 effaceurs = 9 + 4,50 = 13,50 €.</p>
          </MethodBlock>
          <MethodBlock number={3} title="Passage par l'unité">
            <p style={{ margin: 0 }}>Mathilde achète 5 effaceurs. 1 effaceur coûte 9 ÷ 6 = 1,50 €. Donc 5 effaceurs coûtent 1,50 × 5 = 7,50 €.</p>
          </MethodBlock>
        </div>
        <div style={{ marginBottom: 12 }}>
          <VideoLink url="https://youtu.be/gdiHWNjB7FQ" label="Utiliser la proportionnalité (1)" />
          <VideoLink url="https://youtu.be/X0knMBxYcGg" label="Utiliser la proportionnalité (2)" />
        </div>
      </div>
    </div>
  );
}

// ── Reconnaître sans tableau : situations en contexte ───────────────────────────

interface SituationResult {
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

interface SituationsExercise {
  situations: SituationResult[];
}

/** Uses every template exactly once (6 true + 6 false), so the merged list is wide-ranging with no duplicate situation. */
function generateSituationsExercise(): SituationsExercise {
  const trueOnes = TRUE_SITUATION_TEMPLATES.map((fn) => fn());
  const falseOnes = FALSE_SITUATION_TEMPLATES.map((fn) => fn());
  return { situations: shuffle([...trueOnes, ...falseOnes]) };
}

const ROW_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

function SituationsQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: SituationsExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [choices, setChoices] = useState<(boolean | null)[]>(exercise.situations.map(() => null));
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const rowOk = (i: number) => choices[i] === exercise.situations[i]!.isProportional;
  const allAnswered = choices.every((c) => c !== null);

  const submit = () => {
    if (disabled || !allAnswered) return;
    onSubmit(exercise.situations.every((_, i) => rowOk(i)));
  };

  const showFb = disabled;

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Proportionnelles ou non ?</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        Dans chaque situation, indique si les deux grandeurs sont proportionnelles ou non.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exercise.situations.map((s, i) => {
          const ok = showFb ? rowOk(i) : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
                background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)',
              }}
            >
              <span style={{ fontSize: 13, flex: '1 1 260px' }}>
                <strong style={{ color: 'var(--muted)' }}>{ROW_LETTERS[i]}.</strong> {s.text}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setChoices((prev) => prev.map((c, idx) => (idx === i ? v : c)))}
                    style={yesNoBtnStyle(choices[i], v, disabled, accent, showFb ? s.isProportional : undefined)}
                  >
                    {v ? 'Oui' : 'Non'}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} disabled={!allAnswered} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Une ou plusieurs réponses sont incorrectes.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          {exercise.situations.map((s, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{ROW_LETTERS[i]}.</strong>{' '}
              <strong style={{ color: s.isProportional ? 'var(--correct)' : 'var(--wrong)' }}>{s.isProportional ? 'Oui' : 'Non'}</strong>
              {' — '}{s.justification}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

interface SimpleRateExercise {
  text: string;
  answer: number;
  unit: string;
}

function generateSimpleRateExercise(): SimpleRateExercise {
  const tpl = pick(SIMPLE_RATE_TEMPLATES);
  const rate = pick(tpl.rateChoices);
  const n = randInt(tpl.nRange[0], tpl.nRange[1]);
  return { text: tpl.text(rate, n), answer: round2(rate * n), unit: tpl.unit };
}

function SimpleRateQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: SimpleRateExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [val, setVal] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const ok = checkQuotient(val, exercise.answer);
  const showFb = disabled;

  const submit = () => {
    if (disabled) return;
    if (val.trim() === '') return;
    onSubmit(ok);
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Problème</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 10 }}>{exercise.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: showFb ? (ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)' }}>
        <input type="text" value={val} placeholder="?" disabled={disabled} onChange={(e) => setVal(e.target.value)} style={blankInp} />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{exercise.unit}</span>
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
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          <div>Réponse : <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.answer)} {exercise.unit}</strong></div>
        </div>
      </div>
    </div>
  );
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

interface DoubleRateExercise {
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

function generateDoubleRateExercise(): DoubleRateExercise {
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

function DoubleRateQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: DoubleRateExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const okA = checkQuotient(valA, exercise.answerA);
  const okB = checkQuotient(valB, exercise.answerB);
  const showFb = disabled;

  const submit = () => {
    if (disabled) return;
    if (valA.trim() === '' || valB.trim() === '') return;
    onSubmit(okA && okB);
  };

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Problème</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 10 }}>{exercise.context}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 12px', borderRadius: 8, background: showFb ? (okA ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)' }}>
          <span style={{ fontSize: 13 }}>{exercise.qaText}</span>
          <input type="text" value={valA} placeholder="?" disabled={disabled} onChange={(e) => setValA(e.target.value)} style={blankInp} />
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{exercise.unitA}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 12px', borderRadius: 8, background: showFb ? (okB ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)' }}>
          <span style={{ fontSize: 13 }}>{exercise.qbText}</span>
          <input type="text" value={valB} placeholder="?" disabled={disabled} onChange={(e) => setValB(e.target.value)} style={blankInp} />
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{exercise.unitB}</span>
        </div>
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
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          <div>a. {exercise.qa} × {fmtNum(exercise.rate)} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.answerA)} {exercise.unitA}</strong></div>
          <div>b. {fmtNum(exercise.amount)} : {fmtNum(exercise.rate)} = <strong style={{ color: 'var(--correct)' }}>{exercise.answerB} {exercise.unitB}</strong></div>
        </div>
      </div>
    </div>
  );
}

// ── Utiliser sans tableau : linéarité (+, -, ×, unité) ──────────────────────────

const LINEARITE_CONTEXTS = [
  { plural: 'rouleaux de ruban adhésif', singular: 'rouleau de ruban adhésif' },
  { plural: 'paquets de gâteaux', singular: 'paquet de gâteaux' },
  { plural: 'tickets de bus', singular: 'ticket de bus' },
  { plural: 'sachets de graines', singular: 'sachet de graines' },
] as const;

const LINEARITE_UNIT_PRICES = [0.8, 1, 1.2, 1.5, 1.8, 2, 2.4, 2.5, 3] as const;

interface LineariteExercise {
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

function generateLineariteExercise(): LineariteExercise {
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

function LineariteQuestion({ index, exercise, answer, accent, onSubmit }: {
  index: number;
  exercise: LineariteExercise;
  answer: AnswerState;
  accent: string;
  onSubmit: (ok: boolean) => void;
}) {
  const [vals, setVals] = useState(['', '', '', '']);
  const [hintOpen, setHintOpen] = useState(false);
  const disabled = answer.status !== 'pending';

  useEffect(() => {
    if (answer.status === 'revealed') setHintOpen(true);
  }, [answer.status]);

  const setAt = (i: number, v: string) => setVals((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  const expected = [exercise.sumPrice, exercise.diffPrice, exercise.multPrice, exercise.unitPrice];
  const oks = vals.map((v, i) => checkQuotient(v, expected[i]!));
  const showFb = disabled;

  const submit = () => {
    if (disabled) return;
    if (vals.some((v) => v.trim() === '')) return;
    onSubmit(oks.every(Boolean));
  };

  const questions = [
    `Quel est le prix de ${exercise.sumQty} ${exercise.plural} ? (méthode de l'addition)`,
    `Quel est le prix de ${exercise.diffQty} ${exercise.plural} ? (méthode de la soustraction)`,
    `Quel est le prix de ${exercise.multQty} ${exercise.plural} ? (méthode de la multiplication)`,
    `Quel est le prix d'un seul ${exercise.singular} ? (passage par l'unité)`,
  ];
  const corrections = [
    <>{fmtNum(exercise.priceA)} + {fmtNum(exercise.priceB)} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.sumPrice)} €</strong></>,
    <>{fmtNum(exercise.priceB)} − {fmtNum(exercise.priceA)} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.diffPrice)} €</strong></>,
    <>{fmtNum(exercise.priceA)} × {exercise.multFactor} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.multPrice)} €</strong></>,
    <>{fmtNum(exercise.priceA)} ÷ {exercise.sizeA} = <strong style={{ color: 'var(--correct)' }}>{fmtNum(exercise.unitPrice)} €</strong></>,
  ];

  return (
    <div className={`qcard ${disabled ? (answer.status === 'correct' ? 'correct-card' : 'wrong-card') : ''}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ ...colTagStyle, background: `${accent}22`, color: accent }}>Problème</span>
        <span className="qnum">Q{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: 4 }}>{exercise.sizeA} {exercise.plural} coûtent {fmtNum(exercise.priceA)} €.</p>
      <p style={{ fontSize: 13, marginBottom: 10 }}>{exercise.sizeB} {exercise.plural} coûtent {fmtNum(exercise.priceB)} €.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {questions.map((q, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 12px', borderRadius: 8, background: showFb ? (oks[i] ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)') : 'var(--surface)' }}>
            <span style={{ fontSize: 13, flex: '1 1 220px' }}>{q}</span>
            <input type="text" value={vals[i]} placeholder="?" disabled={disabled} onChange={(e) => setAt(i, e.target.value)} style={blankInp} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>€</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {!disabled && (
          <button className="btn-secondary" onClick={submit} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8 }}>
            OK
          </button>
        )}
        {disabled && (
          <span className={answer.status === 'correct' ? 'feedback ok' : 'feedback ko'} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            {answer.status === 'correct' ? '✓ Correct !' : '✗ Une ou plusieurs réponses sont incorrectes.'}
          </span>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="hint-toggle" onClick={() => setHintOpen((v) => !v)}>
          <span>{hintOpen ? '▼' : '▶'}</span> Voir la correction
        </button>
        <div className={`steps-box${hintOpen ? ' open' : ''}`} style={{ fontSize: 13, lineHeight: 1.9 }}>
          {corrections.map((c, i) => <div key={i}>{c}</div>)}
        </div>
      </div>
    </div>
  );
}

// ── Contenu "Sans tableau" (reconnaître ou utiliser) ────────────────────────────

type SansTableauExercise =
  | { exKind: 'situations'; data: SituationsExercise }
  | { exKind: 'simple-rate'; data: SimpleRateExercise }
  | { exKind: 'double-rate'; data: DoubleRateExercise }
  | { exKind: 'linearite'; data: LineariteExercise };

function buildSansTableauExercises(mode: Exclude<TopMode, null>): SansTableauExercise[] {
  if (mode === 'reconnaitre') {
    return [{ exKind: 'situations', data: generateSituationsExercise() }];
  }
  return [
    { exKind: 'simple-rate', data: generateSimpleRateExercise() },
    { exKind: 'double-rate', data: generateDoubleRateExercise() },
    { exKind: 'double-rate', data: generateDoubleRateExercise() },
    { exKind: 'linearite', data: generateLineariteExercise() },
  ];
}

function SansTableauContent({ mode, accent, accentSecondary }: {
  mode: Exclude<TopMode, null>;
  accent: string;
  accentSecondary?: string;
}) {
  const [exercises, setExercises] = useState<SansTableauExercise[]>(() => buildSansTableauExercises(mode));
  const [answers, setAnswers] = useState<AnswerState[]>(() => exercises.map(() => emptyAnswer()));
  const [seriesKey, setSeriesKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const loadExercises = () => {
    const exs = buildSansTableauExercises(mode);
    setExercises(exs);
    setAnswers(exs.map(() => emptyAnswer()));
    setSeriesKey((k) => k + 1);
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

  const newSeries = () => loadExercises();

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

  const accentStyle = { color: accent };
  const progressStyle = {
    width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`,
    background: accentSecondary ? `linear-gradient(90deg, ${accent}, ${accentSecondary})` : accent,
  };

  return (
    <div>
      {mode === 'reconnaitre' && <RecallReconnaitreSansTableau accent={accent} />}
      {mode === 'utiliser' && <RecallUtiliserSansTableau accent={accent} />}

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
          if (ex.exKind === 'situations') return <SituationsQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'simple-rate') return <SimpleRateQuestion {...common} exercise={ex.data} />;
          if (ex.exKind === 'double-rate') return <DoubleRateQuestion {...common} exercise={ex.data} />;
          return <LineariteQuestion {...common} exercise={ex.data} />;
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

// ── ProportionnaliteHub6eme (main export) ───────────────────────────────────────

const TOP_MODES: { id: Exclude<TopMode, null>; label: string; icon: string; desc: string }[] = [
  { id: 'reconnaitre', label: 'Reconnaître une situation de proportionnalité', icon: '=', desc: "2 options : sans tableau ou avec tableau" },
  { id: 'utiliser', label: 'Utiliser une situation de proportionnalité', icon: '→', desc: "2 options : sans tableau ou avec tableau" },
];

export function ProportionnaliteHub6eme({ accent, accentSecondary }: { accent: string; accentSecondary?: string }) {
  const [topMode, setTopMode] = useState<TopMode>(null);
  const [subMode, setSubMode] = useState<SubMode>(null);

  if (topMode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {TOP_MODES.map((m) => (
          <ModeCard key={m.id} label={m.label} icon={m.icon} desc={m.desc} accent={accent} onClick={() => setTopMode(m.id)} />
        ))}
      </div>
    );
  }

  const topLabel = TOP_MODES.find((m) => m.id === topMode)?.label ?? '';

  if (subMode === null) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button type="button" className="btn-secondary" onClick={() => setTopMode(null)} style={{ fontSize: 13 }}>
            ← Retour
          </button>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>{topLabel}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}>
          <ModeCard
            label="Sans tableau"
            icon="✎"
            desc="Situations et problèmes en contexte, sans tableau de valeurs"
            accent={accent}
            onClick={() => setSubMode('sans-tableau')}
          />
          <ModeCard
            label="Avec tableau"
            icon="▦"
            desc="Les mêmes exercices que dans le quiz Proportionnalité des 5ème"
            accent={accent}
            onClick={() => setSubMode('avec-tableau')}
          />
        </div>
      </div>
    );
  }

  // Reconnaître + Avec tableau: redesigned page (same exercises as the 5ème quiz), with its own back button.
  if (topMode === 'reconnaitre' && subMode === 'avec-tableau') {
    return <ProportionnaliteReconnaitreVivid accent={accent} accentSecondary={accentSecondary} onBack={() => setSubMode(null)} />;
  }

  const subLabel = subMode === 'sans-tableau' ? 'Sans tableau' : 'Avec tableau';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={() => setSubMode(null)} style={{ fontSize: 13 }}>
          ← Retour
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{topLabel} — {subLabel}</span>
      </div>
      {subMode === 'avec-tableau' ? (
        <ProportionnaliteModeContent mode={topMode} accent={accent} accentSecondary={accentSecondary} />
      ) : (
        <SansTableauContent mode={topMode} accent={accent} accentSecondary={accentSecondary} />
      )}
    </div>
  );
}
