import type { GeneratorSpec, PropExercise, QuizDefinition } from '@/types';

const C_T4  = '#34D399'; // tableau 2×2
const C_C23 = '#60A5FA'; // tableau 2×3
const C_PRB = '#FB923C'; // problème concret
const C_GRF = '#A78BFA'; // graphique

// ── helpers ───────────────────────────────────────────────────────────────────

function t4(
  r1Label: string, r2Label: string,
  r1: [number | null, number | null], r2: [number | null, number | null],
  ans: number, steps: string, round = false,
): PropExercise {
  return { type: 'default', subtype: 'table4', color: C_T4, t4Row1Label: r1Label, t4Row2Label: r2Label, t4Row1: r1, t4Row2: r2, t4Ans: ans, t4Round: round, steps };
}

function c23(
  r1Label: string, r2Label: string,
  r1: [number, number, number], r2: [number, number, number],
  isProp: boolean, steps: string,
): PropExercise {
  return { type: 'default', subtype: 'check23', color: C_C23, c23Row1Label: r1Label, c23Row2Label: r2Label, c23Row1: r1, c23Row2: r2, c23IsProp: isProp, steps };
}

// ── SVG nuages de points ───────────────────────────────────────────────────────
// viewBox 280×200, origin (40,175), axes color #7A7F94, dots color #60A5FA
// x scale 36px/u (range 0-6), y scale variable per graph

const AXIS_COMMON = `
  <line x1="40" y1="175" x2="258" y2="175" stroke="#7A7F94" stroke-width="1.5"/>
  <line x1="40" y1="175" x2="40" y2="12" stroke="#7A7F94" stroke-width="1.5"/>
  <polygon points="258,172 258,178 265,175" fill="#7A7F94"/>
  <polygon points="37,12 43,12 40,5" fill="#7A7F94"/>
  <text x="268" y="179" font-size="11" fill="#7A7F94">x</text>
  <text x="44" y="11" font-size="11" fill="#7A7F94">y</text>
  <text x="26" y="188" font-size="10" fill="#7A7F94">O</text>
  <line x1="76" y1="172" x2="76" y2="178" stroke="#7A7F94" stroke-width="1"/>
  <text x="73" y="190" font-size="10" fill="#7A7F94">1</text>
  <line x1="112" y1="172" x2="112" y2="178" stroke="#7A7F94" stroke-width="1"/>
  <text x="109" y="190" font-size="10" fill="#7A7F94">2</text>
  <line x1="148" y1="172" x2="148" y2="178" stroke="#7A7F94" stroke-width="1"/>
  <text x="145" y="190" font-size="10" fill="#7A7F94">3</text>
  <line x1="184" y1="172" x2="184" y2="178" stroke="#7A7F94" stroke-width="1"/>
  <text x="181" y="190" font-size="10" fill="#7A7F94">4</text>
  <line x1="220" y1="172" x2="220" y2="178" stroke="#7A7F94" stroke-width="1"/>
  <text x="217" y="190" font-size="10" fill="#7A7F94">5</text>`;

// Graph 1 — proportionnel y = 2x (y scale 14.5px/u, range 0-11)
// points: (1,2)→(76,146) (2,4)→(112,117) (3,6)→(148,88) (4,8)→(184,59) (5,10)→(220,30)
const G1 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="146" x2="43" y2="146" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="150" font-size="10" fill="#7A7F94">2</text>
  <line x1="37" y1="117" x2="43" y2="117" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="121" font-size="10" fill="#7A7F94">4</text>
  <line x1="37" y1="88" x2="43" y2="88" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="92" font-size="10" fill="#7A7F94">6</text>
  <line x1="37" y1="59" x2="43" y2="59" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="63" font-size="10" fill="#7A7F94">8</text>
  <line x1="37" y1="30" x2="43" y2="30" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="34" font-size="10" fill="#7A7F94">10</text>
  <circle cx="76" cy="146" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="117" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="88" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="59" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="30" r="5" fill="#60A5FA"/>
</svg>`;

// Graph 2 — non proportionnel y = x + 2 (y scale 18px/u, range 0-9)
// points: (1,3)→(76,121) (2,4)→(112,103) (3,5)→(148,85) (4,6)→(184,67) (5,7)→(220,49)
// line intersects y-axis at y=2 (not origin)
const G2 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="139" x2="43" y2="139" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="143" font-size="10" fill="#7A7F94">2</text>
  <line x1="37" y1="103" x2="43" y2="103" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="107" font-size="10" fill="#7A7F94">4</text>
  <line x1="37" y1="67" x2="43" y2="67" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="71" font-size="10" fill="#7A7F94">6</text>
  <line x1="37" y1="31" x2="43" y2="31" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="35" font-size="10" fill="#7A7F94">8</text>
  <circle cx="76" cy="121" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="103" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="85" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="67" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="49" r="5" fill="#60A5FA"/>
</svg>`;

// Graph 3 — non proportionnel, nuage dispersé (y scale 16px/u, range 0-10)
// points: (1,7)→(76,63) (2,2)→(112,143) (3,6)→(148,79)
//         (4,1)→(184,159) (5,8)→(220,47) (1,3)→(76,127) (3,9)→(148,31)
const G3 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="143" x2="43" y2="143" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="147" font-size="10" fill="#7A7F94">2</text>
  <line x1="37" y1="111" x2="43" y2="111" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="115" font-size="10" fill="#7A7F94">4</text>
  <line x1="37" y1="79" x2="43" y2="79" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="83" font-size="10" fill="#7A7F94">6</text>
  <line x1="37" y1="47" x2="43" y2="47" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="51" font-size="10" fill="#7A7F94">8</text>
  <line x1="37" y1="15" x2="43" y2="15" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="19" font-size="10" fill="#7A7F94">10</text>
  <circle cx="76" cy="63" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="143" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="79" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="159" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="47" r="5" fill="#60A5FA"/>
  <circle cx="76" cy="127" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="31" r="5" fill="#60A5FA"/>
</svg>`;

// ── quiz definition ────────────────────────────────────────────────────────────

const GENERATOR: GeneratorSpec[] = [{ kind: 'prop' }];

export const proportionnaliteQuiz: QuizDefinition<PropExercise> = {
  id: 'proportionnalite',
  available: true,
  title: 'Proportionnalité',
  category: 'Calcul',
  accent: '#34D399',
  accentSecondary: '#60A5FA',
  icon: '∝',
  description: 'Tableaux de proportionnalité, produit en croix et représentations graphiques.',
  tags: ['10 questions', 'Génération aléatoire'],
  renderer: 'prop',
  generator: GENERATOR,
  subtitle: 'Produit en croix · Tableaux · Problèmes · Graphiques',
  typePills: [
    { label: 'Tableau 2×2', color: C_T4, type: 'default' },
    { label: 'Tableau 2×3', color: C_C23, type: 'default' },
    { label: 'Problème', color: C_PRB, type: 'default' },
    { label: 'Graphique', color: C_GRF, type: 'default' },
  ],
  exercises: [

    // ── Q1 : tableau 2×2, case manquante en haut à droite ─────────────────
    t4(
      'Prix (€)', 'Masse (g)',
      [85, null], [510, 630],
      105,
      `Produit en croix : <strong>85 × 630 = ? × 510</strong>
       <br>? = 85 × 630 ÷ 510 = 53 550 ÷ 510 = <strong style="color:var(--correct)">105</strong>
       <br><span style="color:var(--muted);font-size:0.9em">Vérif. : 85 ÷ 510 = 105 ÷ 630 = 1/6 ✓</span>`,
    ),

    // ── Q2 : tableau 2×2, case manquante en bas à droite ──────────────────
    t4(
      'Carburant (L)', 'Distance (km)',
      [7, 11], [91, null],
      143,
      `Produit en croix : <strong>7 × ? = 11 × 91</strong>
       <br>? = 11 × 91 ÷ 7 = 1 001 ÷ 7 = <strong style="color:var(--correct)">143</strong>
       <br><span style="color:var(--muted);font-size:0.9em">Vérif. : 7 ÷ 91 = 11 ÷ 143 = 1/13 ✓</span>`,
    ),

    // ── Q3 : tableau 2×2, case manquante en bas à gauche (décimal) ────────
    t4(
      'Tuiles', 'Surface couverte (m²)',
      [12, 9], [null, 2.7],
      3.6,
      `Produit en croix : <strong>12 × 2,7 = 9 × ?</strong>
       <br>? = 12 × 2,7 ÷ 9 = 32,4 ÷ 9 = <strong style="color:var(--correct)">3,6</strong>
       <br><span style="color:var(--muted);font-size:0.9em">Vérif. : 12 ÷ 3,6 = 9 ÷ 2,7 = 10/3 ✓</span>`,
      true,
    ),

    // ── Q4 : tableau 2×2, case manquante en haut à gauche ─────────────────
    t4(
      'Heures travaillées', 'Pages tapées',
      [null, 8], [15, 24],
      5,
      `Produit en croix : <strong>? × 24 = 8 × 15</strong>
       <br>? = 8 × 15 ÷ 24 = 120 ÷ 24 = <strong style="color:var(--correct)">5</strong>
       <br><span style="color:var(--muted);font-size:0.9em">Vérif. : 5 ÷ 15 = 8 ÷ 24 = 1/3 ✓</span>`,
    ),

    // ── Q5 : tableau 2×3 — proportionnel ──────────────────────────────────
    c23(
      'Temps (h)', 'Distance (km)',
      [2, 5, 8], [110, 275, 440],
      true,
      `<strong>Méthode 1 — quotients (2ᵉ ligne ÷ 1ʳᵉ ligne) :</strong>
       <br>110 ÷ 2 = 55 &nbsp;|&nbsp; 275 ÷ 5 = 55 &nbsp;|&nbsp; 440 ÷ 8 = 55
       <br>Tous les quotients sont égaux → <strong style="color:var(--correct)">tableau de proportionnalité</strong> (coefficient k = 55 km/h).
       <br><br><strong>Méthode 2 — produits en croix :</strong>
       <br>2 × 275 = 550 = 5 × 110 ✓ &nbsp;&nbsp; 5 × 440 = 2 200 = 8 × 275 ✓`,
    ),

    // ── Q6 : tableau 2×3 — non proportionnel ──────────────────────────────
    c23(
      'Nombre de pièces', 'Prix (€)',
      [3, 5, 8], [9, 16, 24],
      false,
      `<strong>Méthode 1 — quotients (2ᵉ ligne ÷ 1ʳᵉ ligne) :</strong>
       <br>9 ÷ 3 = 3 &nbsp;|&nbsp; 16 ÷ 5 = 3,2 &nbsp;|&nbsp; 24 ÷ 8 = 3
       <br>Les quotients ne sont <em>pas</em> tous égaux → <strong style="color:var(--wrong)">pas un tableau de proportionnalité</strong>.
       <br><br><strong>Méthode 2 — produit en croix :</strong>
       <br>3 × 16 = 48 &nbsp;≠&nbsp; 5 × 9 = 45 → <strong style="color:var(--wrong)">non proportionnel</strong>`,
    ),

    // ── Q7 : problème concret — l'élève complète toutes les cases sauf la ? ──
    {
      type: 'default',
      subtype: 'problem',
      color: C_PRB,
      probStory: `Dans une usine, <strong>120 bouteilles</strong> en plastique permettent de fabriquer
        <strong>4 pulls</strong> en maille polaire.<br>
        Complète le tableau puis calcule le nombre de pulls fabriqués avec <strong>510 bouteilles</strong>.`,
      probRow1Label: 'Bouteilles',
      probRow2Label: 'Pulls',
      probColLabels: ['Situation 1', 'Situation 2'],
      probRow1: [120, 510],
      probRow2: [4, null],
      probAns: 17,
      probDotted: true,
      steps: `Produit en croix : <strong>120 × ? = 4 × 510</strong>
              <br>? = 4 × 510 ÷ 120 = 2 040 ÷ 120 = <strong style="color:var(--correct)">17</strong>
              <br>Avec 510 bouteilles on peut fabriquer <strong style="color:var(--correct)">17 pulls</strong>.`,
    },

    // ── Q8 : graphique proportionnel (y = 2x) ─────────────────────────────
    {
      type: 'default',
      subtype: 'graph',
      color: C_GRF,
      graphSvg: G1,
      graphIsProp: true,
      steps: `Les points <strong>(1 ; 2), (2 ; 4), (3 ; 6), (4 ; 8), (5 ; 10)</strong> sont alignés <em>et</em> passent par l'origine O.
              <br>→ <strong style="color:var(--correct)">Situation de proportionnalité</strong> (coefficient k = 2).`,
    },

    // ── Q9 : graphique non proportionnel, aligné mais pas par l'origine ────
    {
      type: 'default',
      subtype: 'graph',
      color: C_GRF,
      graphSvg: G2,
      graphIsProp: false,
      steps: `Les points semblent alignés, mais si on prolonge la droite elle <strong>ne passe pas par l'origine</strong> (elle couperait l'axe y à y = 2).
              <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.
              <br><span style="color:var(--muted);font-size:0.9em">Rappel : pour qu'il y ait proportionnalité, les points doivent être alignés <em>et</em> passer par O.</span>`,
    },

    // ── Q10 : graphique non proportionnel, nuage dispersé ─────────────────
    {
      type: 'default',
      subtype: 'graph',
      color: C_GRF,
      graphSvg: G3,
      graphIsProp: false,
      steps: `Les points sont <strong>dispersés</strong> sans alignement visible.
              <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.`,
    },

  ] as PropExercise[],
};
