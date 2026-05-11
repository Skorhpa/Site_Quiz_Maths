import type { PropExercise } from '@/types';

const C_T4  = '#34D399';
const C_C23 = '#60A5FA';
const C_PRB = '#FB923C';
const C_GRF = '#A78BFA';

// ── table4 bank ───────────────────────────────────────────────────────────────

const TABLE4_BANK: PropExercise[] = [
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Prix (€)', t4Row2Label: 'Masse (kg)',
    t4Row1: [20, null], t4Row2: [4, 10],
    t4Ans: 50,
    steps: `Produit en croix : <strong>20 × 10 = ? × 4</strong>
            <br>? = 20 × 10 ÷ 4 = 200 ÷ 4 = <strong style="color:var(--correct)">50</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Carreaux', t4Row2Label: 'Surface (m²)',
    t4Row1: [null, 75], t4Row2: [1, 3],
    t4Ans: 25,
    steps: `Produit en croix : <strong>? × 3 = 75 × 1</strong>
            <br>? = 75 ÷ 3 = <strong style="color:var(--correct)">25</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Distance (km)', t4Row2Label: 'Temps (h)',
    t4Row1: [120, null], t4Row2: [2, 5],
    t4Ans: 300,
    steps: `Produit en croix : <strong>120 × 5 = ? × 2</strong>
            <br>? = 120 × 5 ÷ 2 = 600 ÷ 2 = <strong style="color:var(--correct)">300</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Farine (g)', t4Row2Label: 'Portions',
    t4Row1: [300, 450], t4Row2: [null, 3],
    t4Ans: 2,
    steps: `Produit en croix : <strong>300 × 3 = 450 × ?</strong>
            <br>? = 300 × 3 ÷ 450 = 900 ÷ 450 = <strong style="color:var(--correct)">2</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Livres', t4Row2Label: 'Prix (€)',
    t4Row1: [3, 5], t4Row2: [12, null],
    t4Ans: 20,
    steps: `Produit en croix : <strong>3 × ? = 5 × 12</strong>
            <br>? = 5 × 12 ÷ 3 = 60 ÷ 3 = <strong style="color:var(--correct)">20</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Jours', t4Row2Label: 'Économies (€)',
    t4Row1: [null, 10], t4Row2: [12, 60],
    t4Ans: 2,
    steps: `Produit en croix : <strong>? × 60 = 10 × 12</strong>
            <br>? = 10 × 12 ÷ 60 = 120 ÷ 60 = <strong style="color:var(--correct)">2</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Beurre (g)', t4Row2Label: 'Portions',
    t4Row1: [250, 375], t4Row2: [4, null],
    t4Ans: 6,
    steps: `Produit en croix : <strong>250 × ? = 375 × 4</strong>
            <br>? = 375 × 4 ÷ 250 = 1 500 ÷ 250 = <strong style="color:var(--correct)">6</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Pièces fabriquées', t4Row2Label: 'Heures',
    t4Row1: [30, null], t4Row2: [2, 7],
    t4Ans: 105,
    steps: `Produit en croix : <strong>30 × 7 = ? × 2</strong>
            <br>? = 30 × 7 ÷ 2 = 210 ÷ 2 = <strong style="color:var(--correct)">105</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Essence (L)', t4Row2Label: 'Distance (km)',
    t4Row1: [3, null], t4Row2: [45, 105],
    t4Ans: 7,
    steps: `Produit en croix : <strong>3 × 105 = ? × 45</strong>
            <br>? = 3 × 105 ÷ 45 = 315 ÷ 45 = <strong style="color:var(--correct)">7</strong>`,
  },
  {
    type: 'default', subtype: 'table4', color: C_T4,
    t4Row1Label: 'Élèves', t4Row2Label: 'Tables',
    t4Row1: [null, 28], t4Row2: [2, 7],
    t4Ans: 8,
    steps: `Produit en croix : <strong>? × 7 = 28 × 2</strong>
            <br>? = 28 × 2 ÷ 7 = 56 ÷ 7 = <strong style="color:var(--correct)">8</strong>`,
  },
];

// ── check23 bank ──────────────────────────────────────────────────────────────

const CHECK23_PROP: PropExercise[] = [
  {
    type: 'default', subtype: 'check23', color: C_C23,
    c23Row1Label: 'Temps (h)', c23Row2Label: 'Distance (km)',
    c23Row1: [2, 5, 8], c23Row2: [110, 275, 440],
    c23IsProp: true,
    steps: `Quotients : 110 ÷ 2 = <strong>55</strong> &nbsp;|&nbsp; 275 ÷ 5 = <strong>55</strong> &nbsp;|&nbsp; 440 ÷ 8 = <strong>55</strong>
            <br>Tous égaux → <strong style="color:var(--correct)">tableau de proportionnalité</strong> (k = 55 km/h)`,
  },
  {
    type: 'default', subtype: 'check23', color: C_C23,
    c23Row1Label: 'Farine (g)', c23Row2Label: 'Portions',
    c23Row1: [100, 250, 400], c23Row2: [2, 5, 8],
    c23IsProp: true,
    steps: `Quotients : 2 ÷ 100 = <strong>0,02</strong> &nbsp;|&nbsp; 5 ÷ 250 = <strong>0,02</strong> &nbsp;|&nbsp; 8 ÷ 400 = <strong>0,02</strong>
            <br>Tous égaux → <strong style="color:var(--correct)">tableau de proportionnalité</strong> (k = 0,02 portion/g)`,
  },
  {
    type: 'default', subtype: 'check23', color: C_C23,
    c23Row1Label: 'Objets', c23Row2Label: 'Prix (€)',
    c23Row1: [3, 9, 15], c23Row2: [15, 45, 75],
    c23IsProp: true,
    steps: `Quotients : 15 ÷ 3 = <strong>5</strong> &nbsp;|&nbsp; 45 ÷ 9 = <strong>5</strong> &nbsp;|&nbsp; 75 ÷ 15 = <strong>5</strong>
            <br>Tous égaux → <strong style="color:var(--correct)">tableau de proportionnalité</strong> (k = 5 €/objet)`,
  },
  {
    type: 'default', subtype: 'check23', color: C_C23,
    c23Row1Label: 'Litres', c23Row2Label: 'Distance (km)',
    c23Row1: [8, 20, 32], c23Row2: [80, 200, 320],
    c23IsProp: true,
    steps: `Quotients : 80 ÷ 8 = <strong>10</strong> &nbsp;|&nbsp; 200 ÷ 20 = <strong>10</strong> &nbsp;|&nbsp; 320 ÷ 32 = <strong>10</strong>
            <br>Tous égaux → <strong style="color:var(--correct)">tableau de proportionnalité</strong> (k = 10 km/L)`,
  },
];

const CHECK23_NONPROP: PropExercise[] = [
  {
    type: 'default', subtype: 'check23', color: C_C23,
    c23Row1Label: 'Nombre de pièces', c23Row2Label: 'Prix (€)',
    c23Row1: [3, 5, 8], c23Row2: [9, 16, 24],
    c23IsProp: false,
    steps: `Quotients : 9 ÷ 3 = <strong>3</strong> &nbsp;|&nbsp; 16 ÷ 5 = <strong>3,2</strong> &nbsp;|&nbsp; 24 ÷ 8 = <strong>3</strong>
            <br>Pas tous égaux → <strong style="color:var(--wrong)">pas un tableau de proportionnalité</strong>`,
  },
  {
    type: 'default', subtype: 'check23', color: C_C23,
    c23Row1Label: 'Âge (ans)', c23Row2Label: 'Taille (cm)',
    c23Row1: [5, 10, 15], c23Row2: [110, 150, 175],
    c23IsProp: false,
    steps: `Quotients : 110 ÷ 5 = <strong>22</strong> &nbsp;|&nbsp; 150 ÷ 10 = <strong>15</strong> &nbsp;|&nbsp; 175 ÷ 15 ≈ <strong>11,7</strong>
            <br>Pas tous égaux → <strong style="color:var(--wrong)">pas un tableau de proportionnalité</strong>
            <br><span style="color:var(--muted);font-size:0.9em">La taille ne grandit pas proportionnellement à l'âge.</span>`,
  },
  {
    type: 'default', subtype: 'check23', color: C_C23,
    c23Row1Label: 'Cartes', c23Row2Label: 'Points',
    c23Row1: [2, 4, 6], c23Row2: [10, 25, 40],
    c23IsProp: false,
    steps: `Quotients : 10 ÷ 2 = <strong>5</strong> &nbsp;|&nbsp; 25 ÷ 4 = <strong>6,25</strong> &nbsp;|&nbsp; 40 ÷ 6 ≈ <strong>6,67</strong>
            <br>Pas tous égaux → <strong style="color:var(--wrong)">pas un tableau de proportionnalité</strong>`,
  },
  {
    type: 'default', subtype: 'check23', color: C_C23,
    c23Row1Label: 'Élèves', c23Row2Label: 'Points bonus',
    c23Row1: [4, 8, 12], c23Row2: [10, 18, 26],
    c23IsProp: false,
    steps: `Quotients : 10 ÷ 4 = <strong>2,5</strong> &nbsp;|&nbsp; 18 ÷ 8 = <strong>2,25</strong> &nbsp;|&nbsp; 26 ÷ 12 ≈ <strong>2,17</strong>
            <br>Pas tous égaux → <strong style="color:var(--wrong)">pas un tableau de proportionnalité</strong>`,
  },
];

// ── problem bank ──────────────────────────────────────────────────────────────

const PROBLEM_BANK: PropExercise[] = [
  {
    type: 'default', subtype: 'problem', color: C_PRB,
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
            <br>? = 4 × 510 ÷ 120 = 2 040 ÷ 120 = <strong style="color:var(--correct)">17 pulls</strong>`,
  },
  {
    type: 'default', subtype: 'problem', color: C_PRB,
    probStory: `Un cycliste roule à vitesse constante. Il parcourt <strong>45 km</strong> en <strong>3 h</strong>.<br>
      Complète le tableau puis calcule le temps nécessaire pour parcourir <strong>105 km</strong>.`,
    probRow1Label: 'Distance (km)',
    probRow2Label: 'Temps (h)',
    probColLabels: ['Situation 1', 'Situation 2'],
    probRow1: [45, 105],
    probRow2: [3, null],
    probAns: 7,
    probDotted: true,
    steps: `Produit en croix : <strong>45 × ? = 105 × 3</strong>
            <br>? = 105 × 3 ÷ 45 = 315 ÷ 45 = <strong style="color:var(--correct)">7 h</strong>`,
  },
  {
    type: 'default', subtype: 'problem', color: C_PRB,
    probStory: `Une recette demande <strong>200 g de farine</strong> pour faire <strong>8 biscuits</strong>.<br>
      Complète le tableau puis calcule le nombre de biscuits obtenus avec <strong>500 g de farine</strong>.`,
    probRow1Label: 'Farine (g)',
    probRow2Label: 'Biscuits',
    probColLabels: ['Recette', 'Nouvelle quantité'],
    probRow1: [200, 500],
    probRow2: [8, null],
    probAns: 20,
    probDotted: true,
    steps: `Produit en croix : <strong>200 × ? = 8 × 500</strong>
            <br>? = 8 × 500 ÷ 200 = 4 000 ÷ 200 = <strong style="color:var(--correct)">20 biscuits</strong>`,
  },
  {
    type: 'default', subtype: 'problem', color: C_PRB,
    probStory: `En <strong>5 jours</strong>, Léa économise <strong>35 €</strong>.<br>
      Complète le tableau puis calcule combien elle économie en <strong>12 jours</strong>.`,
    probRow1Label: 'Jours',
    probRow2Label: 'Économies (€)',
    probColLabels: ['Situation 1', 'Situation 2'],
    probRow1: [5, 12],
    probRow2: [35, null],
    probAns: 84,
    probDotted: true,
    steps: `Produit en croix : <strong>5 × ? = 35 × 12</strong>
            <br>? = 35 × 12 ÷ 5 = 420 ÷ 5 = <strong style="color:var(--correct)">84 €</strong>`,
  },
];

// ── SVG graphs ────────────────────────────────────────────────────────────────
// viewBox 280×200, origin (40,175), x scale 36px/u (x=1→76 … x=5→220)

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

// Graph P2 — proportionnel y = 3x (scale 10.33px/u, range 0-15)
// points: (1,3)→(76,144) (2,6)→(112,113) (3,9)→(148,82) (4,12)→(184,51) (5,15)→(220,20)
const G_P2 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="144" x2="43" y2="144" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="148" font-size="10" fill="#7A7F94">3</text>
  <line x1="37" y1="113" x2="43" y2="113" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="117" font-size="10" fill="#7A7F94">6</text>
  <line x1="37" y1="82" x2="43" y2="82" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="86" font-size="10" fill="#7A7F94">9</text>
  <line x1="37" y1="51" x2="43" y2="51" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="55" font-size="10" fill="#7A7F94">12</text>
  <line x1="37" y1="20" x2="43" y2="20" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="24" font-size="10" fill="#7A7F94">15</text>
  <circle cx="76" cy="144" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="113" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="82" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="51" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="20" r="5" fill="#60A5FA"/>
</svg>`;

// Graph P3 — proportionnel y = 4x (scale 8px/u, range 0-20)
// points: (1,4)→(76,143) (2,8)→(112,111) (3,12)→(148,79) (4,16)→(184,47) (5,20)→(220,15)
const G_P3 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="143" x2="43" y2="143" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="147" font-size="10" fill="#7A7F94">4</text>
  <line x1="37" y1="111" x2="43" y2="111" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="115" font-size="10" fill="#7A7F94">8</text>
  <line x1="37" y1="79" x2="43" y2="79" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="83" font-size="10" fill="#7A7F94">12</text>
  <line x1="37" y1="47" x2="43" y2="47" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="51" font-size="10" fill="#7A7F94">16</text>
  <line x1="37" y1="15" x2="43" y2="15" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="19" font-size="10" fill="#7A7F94">20</text>
  <circle cx="76" cy="143" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="111" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="79" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="47" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="15" r="5" fill="#60A5FA"/>
</svg>`;

// Graph N2 — non proportionnel y = 2x + 1 (scale 14.09px/u, range 0-12)
// points: (1,3)→(76,133) (2,5)→(112,104) (3,7)→(148,76) (4,9)→(184,48) (5,11)→(220,20)
// y-axis marks at 2(147) 4(119) 6(90) 8(62) 10(34)
const G_N2 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="147" x2="43" y2="147" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="151" font-size="10" fill="#7A7F94">2</text>
  <line x1="37" y1="119" x2="43" y2="119" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="123" font-size="10" fill="#7A7F94">4</text>
  <line x1="37" y1="90" x2="43" y2="90" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="94" font-size="10" fill="#7A7F94">6</text>
  <line x1="37" y1="62" x2="43" y2="62" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="66" font-size="10" fill="#7A7F94">8</text>
  <line x1="37" y1="34" x2="43" y2="34" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="38" font-size="10" fill="#7A7F94">10</text>
  <circle cx="76" cy="133" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="104" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="76" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="48" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="20" r="5" fill="#60A5FA"/>
</svg>`;

// Graph N3 — non proportionnel, nuage dispersé (scale 17.78px/u, range 0-9)
// points dispersés : (1,1)(2,6)(3,3)(4,8)(5,2)(2,9)(4,4)
const G_N3 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="139" x2="43" y2="139" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="143" font-size="10" fill="#7A7F94">2</text>
  <line x1="37" y1="104" x2="43" y2="104" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="108" font-size="10" fill="#7A7F94">4</text>
  <line x1="37" y1="68" x2="43" y2="68" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="72" font-size="10" fill="#7A7F94">6</text>
  <line x1="37" y1="33" x2="43" y2="33" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="37" font-size="10" fill="#7A7F94">8</text>
  <circle cx="76" cy="157" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="68" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="122" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="33" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="139" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="15" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="104" r="5" fill="#60A5FA"/>
</svg>`;

// Graph P4 — proportionnel y = 1,5x (scale 20px/u)
// points: (1,1.5)→(76,145) (2,3)→(112,115) (3,4.5)→(148,85) (4,6)→(184,55) (5,7.5)→(220,25)
const G_P4 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="135" x2="43" y2="135" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="139" font-size="10" fill="#7A7F94">2</text>
  <line x1="37" y1="95" x2="43" y2="95" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="99" font-size="10" fill="#7A7F94">4</text>
  <line x1="37" y1="55" x2="43" y2="55" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="59" font-size="10" fill="#7A7F94">6</text>
  <circle cx="76" cy="145" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="115" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="85" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="55" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="25" r="5" fill="#60A5FA"/>
</svg>`;

// Graph N4 — non proportionnel y = 2x + 3 (scale 12px/u)
// points: (1,5)→(76,115) (2,7)→(112,91) (3,9)→(148,67) (4,11)→(184,43) (5,13)→(220,19)
const G_N4 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="139" x2="43" y2="139" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="143" font-size="10" fill="#7A7F94">3</text>
  <line x1="37" y1="103" x2="43" y2="103" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="107" font-size="10" fill="#7A7F94">6</text>
  <line x1="37" y1="67" x2="43" y2="67" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="71" font-size="10" fill="#7A7F94">9</text>
  <line x1="37" y1="31" x2="43" y2="31" stroke="#7A7F94" stroke-width="1"/>
  <text x="18" y="35" font-size="10" fill="#7A7F94">12</text>
  <circle cx="76" cy="115" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="91" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="67" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="43" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="19" r="5" fill="#60A5FA"/>
</svg>`;

// Graph N5 — non proportionnel, nuage dispersé (scale 16px/u)
// points: (1,5)(2,9)(3,1)(4,6)(5,3)(2,4)(4,8)
const G_N5 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  ${AXIS_COMMON}
  <line x1="37" y1="143" x2="43" y2="143" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="147" font-size="10" fill="#7A7F94">2</text>
  <line x1="37" y1="111" x2="43" y2="111" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="115" font-size="10" fill="#7A7F94">4</text>
  <line x1="37" y1="79" x2="43" y2="79" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="83" font-size="10" fill="#7A7F94">6</text>
  <line x1="37" y1="47" x2="43" y2="47" stroke="#7A7F94" stroke-width="1"/>
  <text x="22" y="51" font-size="10" fill="#7A7F94">8</text>
  <circle cx="76" cy="95" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="31" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="159" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="79" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="127" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="111" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="47" r="5" fill="#60A5FA"/>
</svg>`;

// Graph N6 — non proportionnel, nuage dispersé (scale 16px/u)
// points: (1,8)(2,3)(3,10)(4,2)(5,6)(1,4)(3,7)
const G_N6 = `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
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
  <circle cx="76" cy="47" r="5" fill="#60A5FA"/>
  <circle cx="112" cy="127" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="15" r="5" fill="#60A5FA"/>
  <circle cx="184" cy="143" r="5" fill="#60A5FA"/>
  <circle cx="220" cy="79" r="5" fill="#60A5FA"/>
  <circle cx="76" cy="111" r="5" fill="#60A5FA"/>
  <circle cx="148" cy="63" r="5" fill="#60A5FA"/>
</svg>`;

// ── graph exercise pools ───────────────────────────────────────────────────────

const GRAPH_PROP_POOL: PropExercise[] = [
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G1, graphIsProp: true,
    steps: `Les points <strong>(1 ; 2), (2 ; 4), (3 ; 6), (4 ; 8), (5 ; 10)</strong> sont alignés <em>et</em> passent par l'origine O.
            <br>→ <strong style="color:var(--correct)">Situation de proportionnalité</strong> (coefficient k = 2).`,
  },
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G_P2, graphIsProp: true,
    steps: `Les points <strong>(1 ; 3), (2 ; 6), (3 ; 9), (4 ; 12), (5 ; 15)</strong> sont alignés <em>et</em> passent par l'origine O.
            <br>→ <strong style="color:var(--correct)">Situation de proportionnalité</strong> (coefficient k = 3).`,
  },
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G_P3, graphIsProp: true,
    steps: `Les points <strong>(1 ; 4), (2 ; 8), (3 ; 12), (4 ; 16), (5 ; 20)</strong> sont alignés <em>et</em> passent par l'origine O.
            <br>→ <strong style="color:var(--correct)">Situation de proportionnalité</strong> (coefficient k = 4).`,
  },
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G_P4, graphIsProp: true,
    steps: `Les points <strong>(1 ; 1,5), (2 ; 3), (3 ; 4,5), (4 ; 6), (5 ; 7,5)</strong> sont alignés <em>et</em> passent par l'origine O.
            <br>→ <strong style="color:var(--correct)">Situation de proportionnalité</strong> (coefficient k = 1,5).`,
  },
];

const GRAPH_NONPROP_ALIGNED_POOL: PropExercise[] = [
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G2, graphIsProp: false,
    steps: `Les points semblent alignés, mais si on prolonge la droite elle <strong>ne passe pas par l'origine</strong> (elle couperait l'axe y à y = 2).
            <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.
            <br><span style="color:var(--muted);font-size:0.9em">Rappel : pour qu'il y ait proportionnalité, les points doivent être alignés <em>et</em> passer par O.</span>`,
  },
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G_N2, graphIsProp: false,
    steps: `Les points semblent alignés, mais si on prolonge la droite elle <strong>ne passe pas par l'origine</strong> (elle couperait l'axe y à y = 1).
            <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.
            <br><span style="color:var(--muted);font-size:0.9em">Pour avoir proportionnalité, les points doivent passer <em>exactement</em> par O.</span>`,
  },
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G_N4, graphIsProp: false,
    steps: `Les points semblent alignés, mais si on prolonge la droite elle <strong>ne passe pas par l'origine</strong> (elle couperait l'axe y à y = 3).
            <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.
            <br><span style="color:var(--muted);font-size:0.9em">Pour avoir proportionnalité, les points doivent passer <em>exactement</em> par O.</span>`,
  },
];

const GRAPH_NONPROP_SCATTERED_POOL: PropExercise[] = [
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G3, graphIsProp: false,
    steps: `Les points sont <strong>dispersés</strong> sans alignement visible.
            <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.`,
  },
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G_N3, graphIsProp: false,
    steps: `Les points sont <strong>dispersés</strong> sans alignement visible.
            <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.`,
  },
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G_N5, graphIsProp: false,
    steps: `Les points sont <strong>dispersés</strong> sans alignement visible.
            <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.`,
  },
  {
    type: 'default', subtype: 'graph', color: C_GRF,
    graphSvg: G_N6, graphIsProp: false,
    steps: `Les points sont <strong>dispersés</strong> sans alignement visible.
            <br>→ <strong style="color:var(--wrong)">Pas une situation de proportionnalité</strong>.`,
  },
];

// ── generator ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function generatePropSeries(): PropExercise[] {
  const table4 = shuffle(TABLE4_BANK).slice(0, 4);
  const propCheck = shuffle(CHECK23_PROP)[0]!;
  const nonpropCheck = shuffle(CHECK23_NONPROP)[0]!;
  const problem = shuffle(PROBLEM_BANK)[0]!;
  const graphProp = shuffle(GRAPH_PROP_POOL)[0]!;
  const graphAligned = shuffle(GRAPH_NONPROP_ALIGNED_POOL)[0]!;
  const graphScattered = shuffle(GRAPH_NONPROP_SCATTERED_POOL)[0]!;
  return [...table4, propCheck, nonpropCheck, problem, graphProp, graphAligned, graphScattered];
}
