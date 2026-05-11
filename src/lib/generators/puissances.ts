import type { PuissancesExercise } from '@/types';

const C_PWR = '#FB923C';
const C_SCI = '#60A5FA';
const C_EXP = '#A78BFA';

function pwr(question: string, ans: number, steps: string): PuissancesExercise {
  return { type: 'default', subtype: 'power', question, ans, steps, color: C_PWR };
}

function sci(question: string, ansMantissa: number, ansExp: number, steps: string): PuissancesExercise {
  return { type: 'default', subtype: 'scientific', question, ans: ansExp, ansMantissa, steps, color: C_SCI };
}

function exp(question: string, ans: number, steps: string): PuissancesExercise {
  return { type: 'default', subtype: 'exponent', question, ans, steps, color: C_EXP };
}

const POWER_BANK: PuissancesExercise[] = [
  pwr(
    'Calcule 5<sup>2</sup>',
    25,
    `5<sup>2</sup> = 5 × 5 = <strong style="color:var(--correct)">25</strong>`,
  ),
  pwr(
    'Calcule 4<sup>2</sup>',
    16,
    `4<sup>2</sup> = 4 × 4 = <strong style="color:var(--correct)">16</strong>`,
  ),
  pwr(
    'Calcule 7<sup>2</sup>',
    49,
    `7<sup>2</sup> = 7 × 7 = <strong style="color:var(--correct)">49</strong>`,
  ),
  pwr(
    'Calcule 6<sup>2</sup>',
    36,
    `6<sup>2</sup> = 6 × 6 = <strong style="color:var(--correct)">36</strong>`,
  ),
  pwr(
    'Calcule 10<sup>3</sup>',
    1000,
    `10<sup>3</sup> = 10 × 10 × 10 = <strong style="color:var(--correct)">1 000</strong>`,
  ),
  pwr(
    'Calcule 3<sup>3</sup>',
    27,
    `3<sup>3</sup> = 3 × 3 × 3 = <strong style="color:var(--correct)">27</strong>`,
  ),
  pwr(
    'Calcule 2<sup>4</sup>',
    16,
    `2<sup>4</sup> = 2 × 2 × 2 × 2 = <strong style="color:var(--correct)">16</strong>`,
  ),
  pwr(
    'Calcule (−2)<sup>4</sup>',
    16,
    `(−2)<sup>4</sup> = (−2) × (−2) × (−2) × (−2) = <strong style="color:var(--correct)">16</strong>
     <br><span style="color:var(--muted);font-size:0.9em">Exposant pair → résultat positif.</span>`,
  ),
  pwr(
    'Calcule (−3)<sup>3</sup>',
    -27,
    `(−3)<sup>3</sup> = (−3) × (−3) × (−3) = <strong style="color:var(--correct)">−27</strong>
     <br><span style="color:var(--muted);font-size:0.9em">Exposant impair → résultat négatif.</span>`,
  ),
  pwr(
    'Calcule −6<sup>2</sup>',
    -36,
    `−6<sup>2</sup> = −(6 × 6) = <strong style="color:var(--correct)">−36</strong>
     <br><span style="color:var(--muted);font-size:0.9em">On élève 6 au carré, puis on prend l'opposé. À ne pas confondre avec (−6)² = 36.</span>`,
  ),
  pwr(
    'Calcule −3<sup>2</sup>',
    -9,
    `−3<sup>2</sup> = −(3 × 3) = <strong style="color:var(--correct)">−9</strong>
     <br><span style="color:var(--muted);font-size:0.9em">On élève 3 au carré, puis on prend l'opposé. À ne pas confondre avec (−3)² = 9.</span>`,
  ),
  pwr(
    'Calcule (−5)<sup>2</sup>',
    25,
    `(−5)<sup>2</sup> = (−5) × (−5) = <strong style="color:var(--correct)">25</strong>
     <br><span style="color:var(--muted);font-size:0.9em">Le carré d'un nombre négatif est toujours positif : (−a)² = a²</span>`,
  ),
];

const SCI_BANK: PuissancesExercise[] = [
  sci(
    'Donne l\'écriture scientifique de 25 000 000',
    2.5, 7,
    `25 000 000 = 2,5 × 10 000 000 = <strong style="color:var(--correct)">2,5 × 10<sup>7</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 8 700 000',
    8.7, 6,
    `8 700 000 = 8,7 × 1 000 000 = <strong style="color:var(--correct)">8,7 × 10<sup>6</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 0,004 5',
    4.5, -3,
    `0,004 5 = 4,5 × 0,001 = <strong style="color:var(--correct)">4,5 × 10<sup>−3</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 0,000 071',
    7.1, -5,
    `0,000 071 = 7,1 × 0,000 01 = <strong style="color:var(--correct)">7,1 × 10<sup>−5</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 320 × 10<sup>4</sup>',
    3.2, 6,
    `320 × 10<sup>4</sup> : 320 n'est pas compris entre 1 et 10.
     <br>320 = 3,2 × 10<sup>2</sup>
     <br>Donc : 320 × 10<sup>4</sup> = 3,2 × 10<sup>2</sup> × 10<sup>4</sup> = <strong style="color:var(--correct)">3,2 × 10<sup>6</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 0,056 × 10<sup>5</sup>',
    5.6, 3,
    `0,056 × 10<sup>5</sup> : 0,056 &lt; 1, donc pas une écriture scientifique.
     <br>0,056 = 5,6 × 10<sup>−2</sup>
     <br>Donc : 0,056 × 10<sup>5</sup> = 5,6 × 10<sup>−2</sup> × 10<sup>5</sup> = <strong style="color:var(--correct)">5,6 × 10<sup>3</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 560 000',
    5.6, 5,
    `560 000 = 5,6 × 100 000 = <strong style="color:var(--correct)">5,6 × 10<sup>5</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 0,000 93',
    9.3, -4,
    `0,000 93 = 9,3 × 0,000 1 = <strong style="color:var(--correct)">9,3 × 10<sup>−4</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 4 800',
    4.8, 3,
    `4 800 = 4,8 × 1 000 = <strong style="color:var(--correct)">4,8 × 10<sup>3</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 0,000 000 62',
    6.2, -7,
    `0,000 000 62 = 6,2 × 0,000 000 1 = <strong style="color:var(--correct)">6,2 × 10<sup>−7</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 127 × 10<sup>3</sup>',
    1.27, 5,
    `127 × 10<sup>3</sup> : 127 n'est pas compris entre 1 et 10.
     <br>127 = 1,27 × 10<sup>2</sup>
     <br>Donc : 127 × 10<sup>3</sup> = 1,27 × 10<sup>2</sup> × 10<sup>3</sup> = <strong style="color:var(--correct)">1,27 × 10<sup>5</sup></strong>`,
  ),
  sci(
    'Donne l\'écriture scientifique de 0,083 × 10<sup>−2</sup>',
    8.3, -4,
    `0,083 × 10<sup>−2</sup> : 0,083 &lt; 1, donc pas une écriture scientifique.
     <br>0,083 = 8,3 × 10<sup>−2</sup>
     <br>Donc : 0,083 × 10<sup>−2</sup> = 8,3 × 10<sup>−2</sup> × 10<sup>−2</sup> = <strong style="color:var(--correct)">8,3 × 10<sup>−4</sup></strong>`,
  ),
];

const EXP_BANK: PuissancesExercise[] = [
  exp(
    'Complète l\'exposant : 6,3 × 10<sup>☐</sup> = 630',
    2,
    `630 = 6,3 × 100 = 6,3 × 10<sup>2</sup>
     <br>L'exposant est <strong style="color:var(--correct)">2</strong>`,
  ),
  exp(
    'Complète l\'exposant : 1,9 × 10<sup>☐</sup> = 0,019',
    -2,
    `0,019 = 1,9 × 0,01 = 1,9 × 10<sup>−2</sup>
     <br>L'exposant est <strong style="color:var(--correct)">−2</strong>`,
  ),
  exp(
    'Complète l\'exposant : 5,5 × 10<sup>☐</sup> = 55 000',
    4,
    `55 000 = 5,5 × 10 000 = 5,5 × 10<sup>4</sup>
     <br>L'exposant est <strong style="color:var(--correct)">4</strong>`,
  ),
  exp(
    'Complète l\'exposant : 3,2 × 10<sup>☐</sup> = 0,003 2',
    -3,
    `0,003 2 = 3,2 × 0,001 = 3,2 × 10<sup>−3</sup>
     <br>L'exposant est <strong style="color:var(--correct)">−3</strong>`,
  ),
  exp(
    'Complète l\'exposant : 7,4 × 10<sup>☐</sup> = 740 000',
    5,
    `740 000 = 7,4 × 100 000 = 7,4 × 10<sup>5</sup>
     <br>L'exposant est <strong style="color:var(--correct)">5</strong>`,
  ),
  exp(
    'Complète l\'exposant : 2,1 × 10<sup>☐</sup> = 0,021',
    -2,
    `0,021 = 2,1 × 0,01 = 2,1 × 10<sup>−2</sup>
     <br>L'exposant est <strong style="color:var(--correct)">−2</strong>`,
  ),
  exp(
    'Complète l\'exposant : 9,6 × 10<sup>☐</sup> = 9 600 000',
    6,
    `9 600 000 = 9,6 × 1 000 000 = 9,6 × 10<sup>6</sup>
     <br>L'exposant est <strong style="color:var(--correct)">6</strong>`,
  ),
  exp(
    'Complète l\'exposant : 4,7 × 10<sup>☐</sup> = 0,000 047',
    -5,
    `0,000 047 = 4,7 × 0,000 01 = 4,7 × 10<sup>−5</sup>
     <br>L'exposant est <strong style="color:var(--correct)">−5</strong>`,
  ),
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function generatePuissancesSeries(): PuissancesExercise[] {
  const powers = shuffle(POWER_BANK).slice(0, 4);
  const scis = shuffle(SCI_BANK).slice(0, 4);
  const exps = shuffle(EXP_BANK).slice(0, 2);
  return [...powers, ...scis, ...exps];
}
