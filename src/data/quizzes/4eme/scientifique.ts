import type { GeneratorSpec, PuissancesExercise, QuizDefinition } from '@/types';

const C_PWR = '#FB923C'; // puissances
const C_SCI = '#60A5FA'; // écriture scientifique (2 champs)
const C_EXP = '#A78BFA'; // compléter l'exposant (1 champ)

function pwr(question: string, ans: number, steps: string): PuissancesExercise {
  return { type: 'default', subtype: 'power', question, ans, steps, color: C_PWR };
}

function sci(question: string, ansMantissa: number, ansExp: number, steps: string): PuissancesExercise {
  return { type: 'default', subtype: 'scientific', question, ans: ansExp, ansMantissa, steps, color: C_SCI };
}

function exp(question: string, ans: number, steps: string): PuissancesExercise {
  return { type: 'default', subtype: 'exponent', question, ans, steps, color: C_EXP };
}

const GENERATOR: GeneratorSpec[] = [{ kind: 'puissances' }];

export const scientifiqueQuiz: QuizDefinition<PuissancesExercise> = {
  id: 'scientifique',
  available: true,
  title: 'Puissances et écritures scientifiques',
  titleSub: 'scientifiques',
  category: 'Calcul',
  accent: '#6EE7C0',
  accentSecondary: '#38BDF8',
  icon: '10ⁿ',
  description: 'Calculer des puissances et écrire des nombres en notation scientifique.',
  tags: ['10 questions', 'Génération aléatoire'],
  renderer: 'puissances',
  subtitle: 'Puissances · Notation a × 10ⁿ avec 1 ≤ a < 10',
  typePills: [
    { label: 'Puissance', color: C_PWR, type: 'default' },
    { label: 'Écriture sci.', color: C_SCI, type: 'default' },
    { label: 'Exposant', color: C_EXP, type: 'default' },
  ],
  generator: GENERATOR,
  exercises: [
    // ── Puissances ────────────────────────────────────────────────────────
    pwr(
      'Calcule 3<sup>2</sup>',
      9,
      `3<sup>2</sup> = 3 × 3 = <strong style="color:var(--correct)">9</strong>`,
    ),
    pwr(
      'Calcule (−4)<sup>2</sup>',
      16,
      `(−4)<sup>2</sup> = (−4) × (−4) = <strong style="color:var(--correct)">16</strong>
       <br><span style="color:var(--muted);font-size:0.9em">Le carré d'un nombre négatif est toujours positif : (−a)² = a²</span>`,
    ),
    pwr(
      'Calcule −5<sup>2</sup>',
      -25,
      `−5<sup>2</sup> = −(5 × 5) = <strong style="color:var(--correct)">−25</strong>
       <br><span style="color:var(--muted);font-size:0.9em">On élève 5 au carré, <em>puis</em> on prend l'opposé.<br>À ne pas confondre avec (−5)² = 25</span>`,
    ),
    pwr(
      'Calcule 2<sup>3</sup>',
      8,
      `2<sup>3</sup> = 2 × 2 × 2 = <strong style="color:var(--correct)">8</strong>`,
    ),

    // ── Écriture scientifique — donne les deux valeurs ────────────────────
    sci(
      'Donne l\'écriture scientifique de 345 000 000',
      3.45, 8,
      `345 000 000 = 3,45 × 100 000 000 = <strong style="color:var(--correct)">3,45 × 10<sup>8</sup></strong>`,
    ),
    sci(
      'Donne l\'écriture scientifique de 0,000 62',
      6.2, -4,
      `0,000 62 = 6,2 × 0,0001 = <strong style="color:var(--correct)">6,2 × 10<sup>−4</sup></strong>`,
    ),
    sci(
      'Donne l\'écriture scientifique de 456 × 10<sup>3</sup>',
      4.56, 5,
      `456 × 10<sup>3</sup> n'est pas une écriture scientifique : <strong>456 n'est pas compris entre 1 et 10</strong>.
       <br>On écrit : 456 = 4,56 × 10<sup>2</sup>
       <br>Donc : 456 × 10<sup>3</sup> = 4,56 × 10<sup>2</sup> × 10<sup>3</sup> = <strong style="color:var(--correct)">4,56 × 10<sup>5</sup></strong>`,
    ),
    sci(
      'Donne l\'écriture scientifique de 0,072 × 10<sup>6</sup>',
      7.2, 4,
      `0,072 × 10<sup>6</sup> n'est pas une écriture scientifique : <strong>0,072 &lt; 1</strong>.
       <br>On écrit : 0,072 = 7,2 × 10<sup>−2</sup>
       <br>Donc : 0,072 × 10<sup>6</sup> = 7,2 × 10<sup>−2</sup> × 10<sup>6</sup> = <strong style="color:var(--correct)">7,2 × 10<sup>4</sup></strong>`,
    ),

    // ── Compléter l'exposant — saisir uniquement le nombre ────────────────
    exp(
      'Complète l\'exposant : 1,45 × 10<sup>☐</sup> = 14 500',
      4,
      `14 500 = 1,45 × 10 000 = 1,45 × 10<sup>4</sup>
       <br>L'exposant est <strong style="color:var(--correct)">4</strong>`,
    ),
    exp(
      'Complète l\'exposant : 8,3 × 10<sup>☐</sup> = 0,0083',
      -3,
      `0,0083 = 8,3 × 0,001 = 8,3 × 10<sup>−3</sup>
       <br>L'exposant est <strong style="color:var(--correct)">−3</strong>`,
    ),
  ],
};
